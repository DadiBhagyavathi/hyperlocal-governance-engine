"""
ml_tools.py — ML microservice LangChain tools
Calls FastAPI ML service running on port 8000.
"""

import os, json, requests
from langchain.tools import tool
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

ML_BASE = os.getenv("ML_SERVICE_URL", "http://localhost:8000")


def _post(endpoint: str, data: dict) -> dict:
    try:
        r = requests.post(f"{ML_BASE}{endpoint}", json=data, timeout=10)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


def _get(endpoint: str) -> dict:
    try:
        r = requests.get(f"{ML_BASE}{endpoint}", timeout=8)
        return r.json()
    except Exception as e:
        return {"error": str(e)}


# ── Tool 4 — Predict Project Delay ───────────────────────────────────────────
@tool
def predict_delay_risk(project_params: str) -> str:
    """
    Predict the delay risk for a government project using the trained ML model.
    Input: JSON string with keys:
      - budget_lakhs   (float, e.g. 50.0)
      - duration_days  (int,   e.g. 365)
      - progress_pct   (int,   0-100)
      - complaint_count(int,   e.g. 45)
      - region         (str,   one of: North, South, East, West, Central)
      - department     (str,   one of: Roads, Water, Sanitation, Healthcare, Education, Parks)
    Example: '{"budget_lakhs": 8, "duration_days": 400, "progress_pct": 20, "complaint_count": 50, "region": "North", "department": "Roads"}'
    Returns: delay probability, risk level, risk score, and action recommendation
    """
    try:
        params = json.loads(project_params)
    except json.JSONDecodeError:
        # Try to extract numbers from natural language
        return (
            "Please provide a valid JSON string. Example:\n"
            '{"budget_lakhs": 10, "duration_days": 365, "progress_pct": 25, '
            '"complaint_count": 40, "region": "North", "department": "Roads"}'
        )

    resp = _post("/delay", params)
    if "error" in resp:
        return f"ML service unavailable ({resp['error']}). Ensure ml_service is running on port 8000."

    prob      = resp.get("delay_probability", 0)
    risk      = resp.get("risk_level", "unknown").upper()
    score     = resp.get("risk_score", 0)
    rec       = resp.get("recommendation", "")
    predicted = resp.get("predicted_delayed", False)

    risk_bar = "🟢" if score < 45 else ("🟠" if score < 75 else "🔴")

    return (
        f"🎯 Delay Prediction Results\n"
        f"{'─'*35}\n"
        f"  Delay Probability : {prob:.1%}\n"
        f"  Risk Score        : {risk_bar} {score}/100\n"
        f"  Risk Level        : {risk}\n"
        f"  Predicted Delayed : {'YES ⚠️' if predicted else 'NO ✅'}\n"
        f"  Action Required   : {rec}\n"
        f"{'─'*35}\n"
        f"  Budget: ₹{params.get('budget_lakhs')}L | "
        f"Duration: {params.get('duration_days')} days | "
        f"Progress: {params.get('progress_pct')}%"
    )


# ── Tool 5 — Summarize Citizen Feedback ──────────────────────────────────────
@tool
def summarize_citizen_feedback(feedback_text: str) -> str:
    """
    Analyze and summarize the sentiment of citizen feedback using DistilBERT/keyword ML model.
    Input: feedback text (1 to 5 sentences) from a citizen about a project or service
    Example: "The road repair took too long and quality is very poor, we are disappointed"
    Returns: sentiment label, confidence score, actionable insight, and follow-up recommendation
    """
    if len(feedback_text.strip()) < 5:
        return "Feedback text too short. Please provide at least one meaningful sentence."

    resp = _post("/sentiment", {"text": feedback_text})
    if "error" in resp:
        return f"ML service error: {resp['error']}"

    sentiment  = resp.get("sentiment", "Unknown")
    confidence = resp.get("confidence", 0)
    emoji      = resp.get("emoji", "")
    source     = resp.get("source", "unknown")

    insights = {
        "Positive": (
            "✅ Citizen is satisfied with the service.\n"
            "   → Document as success case. Share with department head.\n"
            "   → Consider publishing as testimonial on platform."
        ),
        "Negative": (
            "🔴 Citizen is dissatisfied — urgent follow-up required.\n"
            "   → Assign this complaint to responsible engineer.\n"
            "   → Set 48-hour resolution SLA and notify citizen."
        ),
        "Neutral": (
            "🟡 Citizen has mixed or neutral feelings.\n"
            "   → Schedule proactive engagement call.\n"
            "   → Provide project timeline update to citizen."
        ),
    }

    insight = insights.get(sentiment, "Sentiment unclear — manual review recommended.")

    return (
        f"{emoji} Sentiment Analysis\n"
        f"{'─'*35}\n"
        f"  Sentiment   : {sentiment}\n"
        f"  Confidence  : {confidence}%\n"
        f"  ML Source   : {source}\n"
        f"{'─'*35}\n"
        f"  Insight & Action:\n"
        f"  {insight}\n"
        f"{'─'*35}\n"
        f"  Input: \"{feedback_text[:120]}{'...' if len(feedback_text)>120 else ''}\""
    )


# ── Tool 6 — Classify Complaint Text ─────────────────────────────────────────
@tool
def classify_complaint_text(complaint: str) -> str:
    """
    Classify a citizen complaint into a civic category using the trained TF-IDF ML classifier.
    Input: raw complaint text from a citizen
    Example: "There is no water supply in our area for 3 days"
    Returns: category, confidence, priority level, and recommended department to route to
    """
    if len(complaint.strip()) < 8:
        return "Complaint text too short. Please provide a meaningful complaint description."

    resp = _post("/classify", {"text": complaint})
    if "error" in resp:
        return f"ML Classifier unavailable: {resp['error']}. Ensure ml_service is running."

    category    = resp.get("category", "Unknown")
    confidence  = resp.get("confidence", 0)
    priority    = resp.get("priority", "Medium")
    rec         = resp.get("recommendation", "")
    top3        = resp.get("top_predictions", [])

    priority_emoji = {"Low": "🟢", "Medium": "🟡", "High": "🟠", "Critical": "🔴"}
    p_emoji = priority_emoji.get(priority, "⚪")

    top3_str = " | ".join(
        f"{t['category']}({t['confidence']}%)" for t in top3
    )

    return (
        f"🏷️  Complaint Classification\n"
        f"{'─'*35}\n"
        f"  Category    : {category}\n"
        f"  Confidence  : {confidence}%\n"
        f"  Priority    : {p_emoji} {priority}\n"
        f"  Route To    : {rec}\n"
        f"{'─'*35}\n"
        f"  Top 3       : {top3_str}\n"
        f"  Input       : \"{complaint[:100]}{'...' if len(complaint)>100 else ''}\""
    )
