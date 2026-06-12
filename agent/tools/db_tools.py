"""
db_tools.py — PostgreSQL-backed LangChain tools
Tables (from Prisma schema): projects, feedbacks, users
Uses psycopg2 direct queries so no ORM overhead.
"""

import os, json
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "")

# ── DB helper ────────────────────────────────────────────────────────────────
def _query(sql: str, params: tuple = ()) -> list[dict]:
    """Run a SELECT and return list of row dicts."""
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


# ── Tool 1 — Search Complaints DB ────────────────────────────────────────────
@tool
def search_complaints_db(query: str) -> str:
    """
    Search citizen complaints (feedbacks table) in PostgreSQL by keyword, rating, or project.
    Input: natural language query like 'low rated feedback' or 'complaints about water project'
           or JSON: '{"project_id": "abc123"}' or '{"min_rating": 1, "max_rating": 2}'
    Returns: matching complaints with message, rating, project, date
    """
    # Try JSON input
    filters = {}
    try:
        filters = json.loads(query)
    except Exception:
        pass

    q = query.lower()

    if filters.get("project_id"):
        sql  = """
            SELECT f.id, f.message, f.rating, f."createdAt",
                   p.title as project_title, u.name as citizen_name
            FROM feedbacks f
            JOIN projects p ON f."projectId" = p.id
            JOIN users    u ON f."userId"    = u.id
            WHERE f."projectId" = %s
            ORDER BY f."createdAt" DESC LIMIT 20
        """
        rows = _query(sql, (filters["project_id"],))

    elif filters.get("min_rating") is not None:
        sql  = """
            SELECT f.id, f.message, f.rating, f."createdAt",
                   p.title as project_title, u.name as citizen_name
            FROM feedbacks f
            JOIN projects p ON f."projectId" = p.id
            JOIN users    u ON f."userId"    = u.id
            WHERE f.rating BETWEEN %s AND %s
            ORDER BY f.rating ASC LIMIT 20
        """
        rows = _query(sql, (filters["min_rating"], filters.get("max_rating", 5)))

    else:
        # Keyword search in message
        sql  = """
            SELECT f.id, f.message, f.rating, f."createdAt",
                   p.title as project_title, u.name as citizen_name
            FROM feedbacks f
            JOIN projects p ON f."projectId" = p.id
            JOIN users    u ON f."userId"    = u.id
            WHERE LOWER(f.message) LIKE %s
               OR LOWER(p.title)   LIKE %s
            ORDER BY f."createdAt" DESC LIMIT 15
        """
        like = f"%{q}%"
        rows = _query(sql, (like, like))

    if not rows:
        return "No complaints found matching your query."
    if rows and "error" in rows[0]:
        return f"Database error: {rows[0]['error']}"

    lines = [f"Found {len(rows)} complaint(s):\n"]
    for r in rows:
        stars = "⭐" * r.get("rating", 0)
        lines.append(
            f"• [{stars}] {r.get('message','')[:100]}...\n"
            f"  Project: {r.get('project_title','?')} | "
            f"By: {r.get('citizen_name','?')} | "
            f"Date: {str(r.get('createdAt',''))[:10]}"
        )
    return "\n".join(lines)


# ── Tool 2 — Search Projects DB ──────────────────────────────────────────────
@tool
def search_projects_db(query: str) -> str:
    """
    Search government projects in PostgreSQL by status, title, budget, or location.
    Input: natural language like 'all in-progress projects' or 'completed road projects'
           or JSON: '{"status": "IN_PROGRESS"}' or '{"status": "PLANNING", "min_budget": 100000}'
    Valid statuses: PLANNING, IN_PROGRESS, COMPLETED, ON_HOLD
    Returns: matching projects with title, status, budget, progress, dates
    """
    filters = {}
    try:
        filters = json.loads(query)
    except Exception:
        pass

    q = query.lower()

    # Build dynamic SQL
    conditions = []
    params     = []

    if filters.get("status"):
        conditions.append('p.status = %s')
        params.append(filters["status"].upper())
    elif "in_progress" in q or "in progress" in q:
        conditions.append("p.status = 'IN_PROGRESS'")
    elif "completed" in q:
        conditions.append("p.status = 'COMPLETED'")
    elif "planning" in q:
        conditions.append("p.status = 'PLANNING'")
    elif "hold" in q:
        conditions.append("p.status = 'ON_HOLD'")

    if filters.get("min_budget"):
        conditions.append("p.budget >= %s")
        params.append(filters["min_budget"])

    # Title/description keyword search
    keyword_match = ""
    if not filters and any(
        kw not in ["in_progress","completed","planning","hold"]
        for kw in [q]
    ):
        keyword_match = "AND (LOWER(p.title) LIKE %s OR LOWER(p.description) LIKE %s)"
        params += [f"%{q}%", f"%{q}%"]

    where = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    sql   = f"""
        SELECT p.id, p.title, p.description, p.budget, p.status,
               p.progress, p."startDate", p."endDate", p."createdAt",
               COUNT(f.id) as feedback_count,
               ROUND(AVG(f.rating)::numeric, 1) as avg_rating
        FROM projects p
        LEFT JOIN feedbacks f ON f."projectId" = p.id
        {where}
        {keyword_match}
        GROUP BY p.id
        ORDER BY p."createdAt" DESC
        LIMIT 15
    """
    rows = _query(sql, tuple(params))

    if not rows:
        return "No projects found matching your query."
    if rows and "error" in rows[0]:
        return f"Database error: {rows[0]['error']}"

    status_emoji = {
        "PLANNING": "📋", "IN_PROGRESS": "🔄",
        "COMPLETED": "✅", "ON_HOLD": "⏸️"
    }
    lines = [f"Found {len(rows)} project(s):\n"]
    for p in rows:
        emoji = status_emoji.get(p.get("status",""), "📌")
        budget_cr = round(p.get("budget", 0) / 100000, 2)
        lines.append(
            f"{emoji} {p.get('title','N/A')}\n"
            f"   Status: {p.get('status')} | Progress: {p.get('progress',0)}%\n"
            f"   Budget: ₹{budget_cr}L | Feedbacks: {p.get('feedback_count',0)} "
            f"(avg rating: {p.get('avg_rating','N/A')})\n"
            f"   Start: {str(p.get('startDate',''))[:10]} | "
            f"End: {str(p.get('endDate',''))[:10] or 'Ongoing'}"
        )
    return "\n".join(lines)


# ── Tool 3 — Budget Analytics ─────────────────────────────────────────────────
@tool
def get_budget_analytics(scope: str = "all") -> str:
    """
    Retrieve budget analytics from PostgreSQL — total spend, department breakdown, over-budget projects.
    Input: scope like 'all', 'in_progress', 'completed', or 'department'
    Returns: budget totals, averages, and financial health metrics
    """
    # Total budget by status
    sql_status = """
        SELECT status,
               COUNT(*)                           as project_count,
               ROUND(SUM(budget)::numeric, 2)     as total_budget,
               ROUND(AVG(budget)::numeric, 2)     as avg_budget,
               ROUND(MIN(budget)::numeric, 2)     as min_budget,
               ROUND(MAX(budget)::numeric, 2)     as max_budget
        FROM projects
        GROUP BY status
        ORDER BY total_budget DESC
    """
    rows_status = _query(sql_status)

    # Top 5 highest budget projects
    sql_top = """
        SELECT title, budget, status, progress
        FROM projects
        ORDER BY budget DESC
        LIMIT 5
    """
    rows_top = _query(sql_top)

    # Low progress high budget (risk)
    sql_risk = """
        SELECT title, budget, progress, status
        FROM projects
        WHERE progress < 30 AND status = 'IN_PROGRESS'
        ORDER BY budget DESC
        LIMIT 5
    """
    rows_risk = _query(sql_risk)

    if rows_status and "error" in rows_status[0]:
        return f"Database error: {rows_status[0]['error']}"

    lines = ["💰 Budget Analytics Report\n" + "=" * 40]

    lines.append("\n📊 Budget by Project Status:")
    total_all = 0
    for r in rows_status:
        b = r.get("total_budget", 0) or 0
        total_all += float(b)
        lines.append(
            f"  {r.get('status','?'):12} | {r.get('project_count',0):3} projects | "
            f"₹{round(float(b)/100000,2)}L total | ₹{round(float(r.get('avg_budget',0) or 0)/100000,2)}L avg"
        )

    lines.append(f"\n  GRAND TOTAL: ₹{round(total_all/100000,2)} Lakhs")

    if rows_top and "error" not in rows_top[0]:
        lines.append("\n🏆 Top 5 Highest Budget Projects:")
        for r in rows_top:
            lines.append(
                f"  • {r.get('title','?')[:45]} — "
                f"₹{round(float(r.get('budget',0))/100000,2)}L | "
                f"{r.get('status')} | {r.get('progress',0)}% done"
            )

    if rows_risk and "error" not in rows_risk[0]:
        lines.append("\n⚠️  High Budget + Low Progress (Risk Flags):")
        for r in rows_risk:
            lines.append(
                f"  🔴 {r.get('title','?')[:45]} — "
                f"₹{round(float(r.get('budget',0))/100000,2)}L | Only {r.get('progress',0)}% done"
            )

    return "\n".join(lines)
