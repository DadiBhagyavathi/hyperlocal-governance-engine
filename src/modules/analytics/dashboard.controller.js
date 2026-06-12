/**
 * dashboard.controller.js
 * Live analytics from PostgreSQL (Prisma) + ML metrics from FastAPI
 */

const { PrismaClient } = require("@prisma/client");
const http             = require("http");

const prisma   = new PrismaClient();
const ML_BASE  = process.env.ML_SERVICE_URL || "http://localhost:8000";

function fetchJson(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve(JSON.parse(d)); } catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

/**
 * GET /api/v1/analytics/dashboard
 * Returns live project + feedback stats from PostgreSQL
 */
exports.getDashboard = async (req, res) => {
  try {
    // Run all queries in parallel
    const [
      totalProjects,
      statusGroups,
      totalFeedbacks,
      feedbackStats,
      topProjects,
      recentFeedbacks,
      userCount,
    ] = await Promise.all([
      prisma.project.count(),

      prisma.project.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum:   { budget: true },
        _avg:   { progress: true },
      }),

      prisma.feedback.count(),

      prisma.feedback.aggregate({
        _avg: { rating: true },
        _min: { rating: true },
        _max: { rating: true },
      }),

      prisma.project.findMany({
        orderBy: { budget: "desc" },
        take:    5,
        select:  { id:true, title:true, budget:true, status:true, progress:true },
      }),

      prisma.feedback.findMany({
        orderBy: { createdAt: "desc" },
        take:    6,
        select:  {
          message: true, rating: true, createdAt: true,
          project: { select: { title: true } },
        },
      }),

      prisma.user.groupBy({
        by:   ["role"],
        _count:{ role: true },
      }),
    ]);

    // Build status map
    const byStatus = {};
    let totalBudget = 0;
    statusGroups.forEach(g => {
      byStatus[g.status] = {
        count:      g._count.status,
        totalBudget:g._sum.budget  || 0,
        avgProgress:Math.round(g._avg.progress || 0),
      };
      totalBudget += g._sum.budget || 0;
    });

    const completed   = byStatus.COMPLETED?.count   || 0;
    const inProgress  = byStatus.IN_PROGRESS?.count  || 0;
    const planning    = byStatus.PLANNING?.count     || 0;
    const onHold      = byStatus.ON_HOLD?.count      || 0;
    const complRate   = totalProjects > 0
      ? Math.round((completed / totalProjects) * 100) : 0;

    const avgRating   = feedbackStats._avg.rating
      ? Math.round(feedbackStats._avg.rating * 10) / 10 : 0;
    const negFeedbacks = await prisma.feedback.count({ where: { rating: { lte: 2 } } });
    const posFeedbacks = await prisma.feedback.count({ where: { rating: { gte: 4 } } });

    const userMap = {};
    userCount.forEach(u => { userMap[u.role] = u._count.role; });

    res.json({
      success:   true,
      timestamp: new Date().toISOString(),
      projects: {
        total:          totalProjects,
        completed,
        inProgress,
        planning,
        onHold,
        completionRate: complRate,
        totalBudgetINR: Math.round(totalBudget),
        byStatus,
        topByBudget:    topProjects,
      },
      feedback: {
        total:      totalFeedbacks,
        avgRating,
        positive:   posFeedbacks,
        negative:   negFeedbacks,
        neutral:    totalFeedbacks - posFeedbacks - negFeedbacks,
        recent:     recentFeedbacks.map(f => ({
          message:      f.message.substring(0, 100),
          rating:       f.rating,
          projectTitle: f.project?.title || "N/A",
          date:         f.createdAt,
        })),
      },
      users: {
        citizens:   userMap.CITIZEN    || 0,
        government: userMap.GOVERNMENT || 0,
        admins:     userMap.ADMIN      || 0,
        total:      Object.values(userMap).reduce((a,b)=>a+b, 0),
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ success:false, error: err.message });
  }
};

/**
 * GET /api/v1/analytics/ml-metrics
 * Proxies ML model metrics from FastAPI for the UI metrics panel
 */
exports.getMlMetrics = async (req, res) => {
  const data = await fetchJson(`${ML_BASE}/models/metrics`);
  if (!data) {
    return res.status(503).json({
      success: false,
      message: "ML service offline — start with: uvicorn main:app --port 8000"
    });
  }
  res.json(data);
};
