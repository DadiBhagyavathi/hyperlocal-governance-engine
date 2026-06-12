"""
HyperGov — Agent REST API  v2.0
================================
Wraps the Governance Intelligence Agent as FastAPI endpoints.

Run:
  cd agent/
  uvicorn agent_api:app --host 0.0.0.0 --port 8001 --reload

Endpoints:
  POST /agent/chat          — Main ReAct agent (any question)
  POST /agent/report        — Direct governance report generation
  POST /agent/classify      — Direct complaint classification
  POST /agent/sentiment     — Direct sentiment analysis
  POST /agent/delay         — Direct delay prediction
  GET  /agent/tools         — List all available tools
  GET  /health              — Service health check
"""

import time, os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

app = FastAPI(
    title="HyperGov Governance Intelligence Agent API",
    description="LangChain ReAct Agent with PostgreSQL + ML tools for civic governance",
    version="2.0.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_start = time.time()


# ── Schemas ──────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=5, max_length=1000,
                          example="Show me all delayed projects with budget over 50 lakhs")
    session_id: str = Field(default="default", example="user-123")

class ReportRequest(BaseModel):
    report_type: str = Field(..., example="summary",
                             description="One of: summary, projects, feedback, performance, full")

class ClassifyRequest(BaseModel):
    complaint: str = Field(..., min_length=8, max_length=500,
                           example="Garbage not collected for 5 days in our area")

class SentimentRequest(BaseModel):
    feedback: str = Field(..., min_length=5, max_length=1000,
                          example="The road repair was done quickly, very happy with the result")

class DelayRequest(BaseModel):
    budget_lakhs:    float = Field(..., gt=0,       example=10.0)
    duration_days:   int   = Field(..., gt=0,       example=365)
    progress_pct:    int   = Field(..., ge=0, le=100, example=25)
    complaint_count: int   = Field(..., ge=0,       example=45)
    region:          str   = Field(...,             example="North")
    department:      str   = Field(...,             example="Roads")

class RiskRequest(BaseModel):
    project_title: str = Field(..., min_length=2,
                               example="road widening")


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":    "UP",
        "service":   "HyperGov Agent API v2.0",
        "uptime_s":  round(time.time() - _start, 1),
        "tools":     8,
        "llm":       "Groq llama3-8b-8192",
        "database":  "PostgreSQL",
    }


@app.get("/agent/tools")
def list_tools():
    from tools import ALL_TOOLS
    return {
        "count": len(ALL_TOOLS),
        "tools": [
            {"name": t.name, "description": t.description[:120] + "..."}
            for t in ALL_TOOLS
        ]
    }


@app.post("/agent/chat")
def chat(req: ChatRequest):
    """Main ReAct agent endpoint — handles any governance question."""
    try:
        from agent import run
        t0     = time.time()
        answer = run(req.question)
        return {
            "success":    True,
            "session_id": req.session_id,
            "question":   req.question,
            "answer":     answer,
            "latency_ms": round((time.time() - t0) * 1000),
        }
    except Exception as e:
        raise HTTPException(500, f"Agent error: {str(e)}")


@app.post("/agent/report")
def report(req: ReportRequest):
    """Generate governance report directly without full agent reasoning."""
    try:
        from tools.report_tools import generate_governance_report
        t0     = time.time()
        result = generate_governance_report.invoke(req.report_type)
        return {
            "success":    True,
            "report_type": req.report_type,
            "report":     result,
            "latency_ms": round((time.time() - t0) * 1000),
        }
    except Exception as e:
        raise HTTPException(500, f"Report error: {str(e)}")


@app.post("/agent/classify")
def classify(req: ClassifyRequest):
    """Classify a citizen complaint directly."""
    try:
        from tools.ml_tools import classify_complaint_text
        result = classify_complaint_text.invoke(req.complaint)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(500, f"Classification error: {str(e)}")


@app.post("/agent/sentiment")
def sentiment(req: SentimentRequest):
    """Analyze citizen feedback sentiment directly."""
    try:
        from tools.ml_tools import summarize_citizen_feedback
        result = summarize_citizen_feedback.invoke(req.feedback)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(500, f"Sentiment error: {str(e)}")


@app.post("/agent/delay")
def delay(req: DelayRequest):
    """Predict project delay risk directly."""
    try:
        import json
        from tools.ml_tools import predict_delay_risk
        params = req.model_dump()
        result = predict_delay_risk.invoke(json.dumps(params))
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(500, f"Delay prediction error: {str(e)}")


@app.post("/agent/risk")
def risk(req: RiskRequest):
    """Explain risks for a specific project."""
    try:
        from tools.report_tools import explain_project_risks
        result = explain_project_risks.invoke(req.project_title)
        return {"success": True, "result": result}
    except Exception as e:
        raise HTTPException(500, f"Risk analysis error: {str(e)}")
