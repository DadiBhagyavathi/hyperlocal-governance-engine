"""
report_tools.py — Governance report generator and project risk explainer
Pulls live data from PostgreSQL + ML signals to produce structured reports.
"""

import os
from langchain.tools import tool
from dotenv import load_dotenv
from datetime import datetime

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "")


def _query(sql: str, params: tuple = ()) -> list[dict]:
    try:
        import psycopg2
        import psycopg2.extras
        conn   = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cursor.execute(sql, params)
        rows   = cursor.fetchall()
        cursor.close()
        conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        return [{"error": str(e)}]


# ── Tool 7 — Generate Governance Report ──────────────────────────────────────
@tool
def generate_governance_report(report_type: str) -> str:
    """
    Generate a comprehensive governance intelligence report from live PostgreSQL data.
    Input: report type — one of:
      - 'summary'      → Overall platform health dashboard
      - 'projects'     → Project completion and status breakdown
      - 'feedback'     → Citizen feedback and satisfaction analysis
      - 'performance'  → Project performance and delay risk overview
      - 'full'         → Complete report (all of the above)
    Returns: formatted multi-section report with metrics and insights
    """
    now = datetime.now().strftime("%Y-%m-%d %H:%M")
    rtype = report_type.lower().strip()
    sections = []

    # ── Projects stats ──
    if rtype in ("summary", "projects", "performance", "full"):
        rows = _query("""
            SELECT status, COUNT(*) as cnt,
                   ROUND(AVG(progress)::numeric,1) as avg_progress,
                   ROUND(SUM(budget)::numeric,2)   as total_budget
            FROM projects GROUP BY status ORDER BY cnt DESC
        """)
        if rows and "error" not in rows[0]:
            total_p = sum(r.get("cnt", 0) for r in rows)
            done    = next((r["cnt"] for r in rows if r["status"] == "COMPLETED"), 0)
            active  = next((r["cnt"] for r in rows if r["status"] == "IN_PROGRESS"), 0)
            plan    = next((r["cnt"] for r in rows if r["status"] == "PLANNING"), 0)
            hold    = next((r["cnt"] for r in rows if r["status"] == "ON_HOLD"), 0)
            rate    = round(done / total_p * 100, 1) if total_p else 0
            total_b = sum(float(r.get("total_budget") or 0) for r in rows)

            sections.append(
                f"📊 PROJECT OVERVIEW\n"
                f"  Total Projects   : {total_p}\n"
                f"  ✅ Completed     : {done}  ({rate}% completion rate)\n"
                f"  🔄 In Progress   : {active}\n"
                f"  📋 Planning      : {plan}\n"
                f"  ⏸️  On Hold       : {hold}\n"
                f"  💰 Total Budget  : ₹{round(total_b/100000,2)} Lakhs\n"
            )

    # ── Feedback / complaints stats ──
    if rtype in ("summary", "feedback", "full"):
        rows_f = _query("""
            SELECT COUNT(*)                          as total,
                   ROUND(AVG(rating)::numeric,2)     as avg_rating,
                   SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative,
                   SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive,
                   SUM(CASE WHEN rating = 3  THEN 1 ELSE 0 END) as neutral
            FROM feedbacks
        """)
        rows_recent = _query("""
            SELECT f.message, f.rating, p.title as project_title
            FROM feedbacks f
            JOIN projects p ON f."projectId" = p.id
            ORDER BY f."createdAt" DESC LIMIT 5
        """)
        if rows_f and "error" not in rows_f[0]:
            rf = rows_f[0]
            total_f  = rf.get("total", 0) or 0
            avg_r    = rf.get("avg_rating") or 0
            neg_pct  = round((rf.get("negative") or 0) / max(total_f,1) * 100, 1)
            pos_pct  = round((rf.get("positive") or 0) / max(total_f,1) * 100, 1)

            sections.append(
                f"💬 CITIZEN FEEDBACK ANALYSIS\n"
                f"  Total Feedback   : {total_f}\n"
                f"  Avg Rating       : {'⭐' * round(float(avg_r))} ({avg_r}/5)\n"
                f"  😊 Positive (4-5): {rf.get('positive',0)} ({pos_pct}%)\n"
                f"  😐 Neutral (3)   : {rf.get('neutral',0)}\n"
                f"  😠 Negative (1-2): {rf.get('negative',0)} ({neg_pct}%)\n"
            )

        if rows_recent and "error" not in rows_recent[0]:
            recent_lines = ["  Recent Feedback:"]
            for r in rows_recent:
                stars = "⭐" * r.get("rating", 0)
                recent_lines.append(
                    f"    {stars} {r.get('message','')[:70]}... [{r.get('project_title','?')}]"
                )
            sections.append("\n".join(recent_lines) + "\n")

    # ── Performance flags ──
    if rtype in ("performance", "full"):
        stalled = _query("""
            SELECT title, progress, budget
            FROM projects
            WHERE status = 'IN_PROGRESS' AND progress < 20
            ORDER BY budget DESC LIMIT 5
        """)
        if stalled and "error" not in stalled[0]:
            lines = ["⚠️  STALLED PROJECTS (In-Progress < 20% done):"]
            for r in stalled:
                lines.append(
                    f"    🔴 {r.get('title','?')[:50]} — "
                    f"{r.get('progress',0)}% | ₹{round(float(r.get('budget',0))/100000,2)}L"
                )
            sections.append("\n".join(lines) + "\n")

    # ── Users ──
    if rtype in ("summary", "full"):
        rows_u = _query("""
            SELECT role, COUNT(*) as cnt FROM users GROUP BY role
        """)
        if rows_u and "error" not in rows_u[0]:
            u_lines = ["👥 USER BASE:"]
            for r in rows_u:
                u_lines.append(f"    {r.get('role','?'):12}: {r.get('cnt',0)}")
            sections.append("\n".join(u_lines) + "\n")

    if not sections:
        return (
            f"Unknown report type '{report_type}'. "
            "Valid types: summary, projects, feedback, performance, full"
        )

    header = (
        f"{'='*55}\n"
        f"  🏛️  HyperGov Governance Intelligence Report\n"
        f"  Generated : {now}\n"
        f"  Report    : {report_type.upper()}\n"
        f"{'='*55}\n"
    )
    return header + "\n".join(sections) + f"\n{'='*55}"


# ── Tool 8 — Explain Project Risks ───────────────────────────────────────────
@tool
def explain_project_risks(project_title_or_id: str) -> str:
    """
    Explain the risk factors for a specific government project using live DB data.
    Input: project title (partial match) or project ID
    Example: 'road widening' or 'clx8abc123'
    Returns: risk assessment with budget health, progress flags, feedback score, and recommendations
    """
    # Search by ID first, then title
    rows = _query("""
        SELECT p.id, p.title, p.description, p.budget, p.status,
               p.progress, p."startDate", p."endDate",
               COUNT(f.id)                          as feedback_count,
               ROUND(AVG(f.rating)::numeric, 2)     as avg_rating,
               SUM(CASE WHEN f.rating <= 2 THEN 1 ELSE 0 END) as neg_feedback
        FROM projects p
        LEFT JOIN feedbacks f ON f."projectId" = p.id
        WHERE p.id = %s OR LOWER(p.title) LIKE %s
        GROUP BY p.id
        LIMIT 3
    """, (project_title_or_id, f"%{project_title_or_id.lower()}%"))

    if not rows:
        return f"No project found matching '{project_title_or_id}'."
    if "error" in rows[0]:
        return f"Database error: {rows[0]['error']}"

    p = rows[0]
    risks  = []
    score  = 0  # risk score 0-100

    # ── Risk Factor Analysis ──
    progress = p.get("progress", 0) or 0
    budget   = float(p.get("budget", 0) or 0)
    status   = p.get("status", "")
    avg_r    = float(p.get("avg_rating") or 3.0)
    neg_fb   = int(p.get("neg_feedback") or 0)
    fb_count = int(p.get("feedback_count") or 0)

    # Factor 1 — Progress
    if status == "IN_PROGRESS" and progress < 20:
        risks.append("🔴 CRITICAL: Very low progress (<20%) for an active project")
        score += 35
    elif status == "IN_PROGRESS" and progress < 50:
        risks.append("🟠 WARNING: Below 50% progress — timeline at risk")
        score += 20
    elif status == "ON_HOLD":
        risks.append("⏸️  CONCERN: Project is on hold — needs reactivation review")
        score += 25

    # Factor 2 — Budget vs progress mismatch
    budget_l = round(budget / 100000, 2)
    if budget_l > 50 and progress < 30 and status == "IN_PROGRESS":
        risks.append(f"🔴 HIGH BUDGET RISK: ₹{budget_l}L allocated but only {progress}% done")
        score += 30

    # Factor 3 — Citizen feedback
    if avg_r < 2.5 and fb_count > 0:
        risks.append(f"🔴 POOR CITIZEN SATISFACTION: Avg rating {avg_r}/5 across {fb_count} reviews")
        score += 25
    elif avg_r < 3.5 and fb_count > 0:
        risks.append(f"🟡 MODERATE SATISFACTION: Avg rating {avg_r}/5 — improvement needed")
        score += 10

    if neg_fb > 3:
        risks.append(f"🟠 {neg_fb} negative reviews (1-2 star) require urgent resolution")
        score += 15

    # Factor 4 — No end date
    if not p.get("endDate") and status == "IN_PROGRESS":
        risks.append("🟡 NO DEADLINE: Project has no defined end date — accountability gap")
        score += 10

    score = min(score, 100)

    # Overall risk label
    if score >= 70:
        overall = "🔴 HIGH RISK — Immediate intervention required"
    elif score >= 40:
        overall = "🟠 MEDIUM RISK — Close monitoring needed"
    elif score >= 15:
        overall = "🟡 LOW RISK — Routine oversight sufficient"
    else:
        overall = "🟢 HEALTHY — Project on track"

    # Recommendations
    recs = []
    if score >= 70:
        recs.append("→ Escalate to Senior District Officer immediately")
        recs.append("→ Conduct on-site inspection within 48 hours")
        recs.append("→ Review contractor performance and consider reassignment")
    elif score >= 40:
        recs.append("→ Schedule weekly progress review meetings")
        recs.append("→ Respond to all negative citizen feedback within 3 days")
        recs.append("→ Update project timeline and notify stakeholders")
    else:
        recs.append("→ Continue routine monitoring")
        recs.append("→ Collect more citizen feedback proactively")

    risk_section = "\n".join(f"  {r}" for r in risks) if risks else "  ✅ No significant risk factors identified"
    rec_section  = "\n".join(f"  {r}" for r in recs)

    return (
        f"🔍 Project Risk Assessment\n"
        f"{'='*50}\n"
        f"  Project  : {p.get('title','N/A')}\n"
        f"  Status   : {status} | Progress: {progress}%\n"
        f"  Budget   : ₹{budget_l}L\n"
        f"  Feedback : {fb_count} reviews | Avg: {avg_r}/5\n"
        f"{'─'*50}\n"
        f"  Risk Score   : {score}/100\n"
        f"  Assessment   : {overall}\n"
        f"{'─'*50}\n"
        f"  Risk Factors Identified:\n"
        f"{risk_section}\n"
        f"{'─'*50}\n"
        f"  Recommendations:\n"
        f"{rec_section}\n"
        f"{'='*50}"
    )
