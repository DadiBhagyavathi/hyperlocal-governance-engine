"""
HyperGov — Governance Intelligence Agent  v2.0
================================================
Pattern  : LangChain ReAct Agent
LLM      : Groq  (llama3-8b-8192 — free tier)
Database : PostgreSQL via psycopg2
ML API   : FastAPI ML service (port 8000)

Tools (8):
  1. search_complaints_db      — Live PostgreSQL complaint/feedback search
  2. search_projects_db        — Live PostgreSQL project search & filter
  3. get_budget_analytics      — Financial health dashboard from DB
  4. predict_delay_risk        — ML-powered delay probability (XGBoost)
  5. summarize_citizen_feedback— DistilBERT / keyword sentiment analysis
  6. classify_complaint_text   — TF-IDF complaint category classification
  7. generate_governance_report— Multi-section governance report
  8. explain_project_risks     — Per-project risk factor breakdown

Run:
  python agent.py                        # CLI demo
  uvicorn agent_api:app --port 8001      # REST API
"""

import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from langchain.agents import AgentExecutor, create_react_agent
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate

from tools import ALL_TOOLS
from prompts.governance_prompt import GOVERNANCE_REACT_PROMPT

# ── Config ───────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
if not GROQ_API_KEY:
    raise EnvironmentError(
        "GROQ_API_KEY not set in .env\n"
        "Get a free key at: https://console.groq.com"
    )

# ── LLM — Groq (free tier, fast) ────────────────────────────────────────────
llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model_name="llama3-8b-8192",
    temperature=0.1,
    max_tokens=1500,
)

# ── Prompt ───────────────────────────────────────────────────────────────────
prompt = PromptTemplate.from_template(GOVERNANCE_REACT_PROMPT)

# ── Agent ────────────────────────────────────────────────────────────────────
_agent = create_react_agent(llm=llm, tools=ALL_TOOLS, prompt=prompt)

agent_executor = AgentExecutor(
    agent=_agent,
    tools=ALL_TOOLS,
    verbose=True,
    max_iterations=6,
    handle_parsing_errors=True,
    return_intermediate_steps=False,
    early_stopping_method="generate",
)


def run(question: str) -> str:
    """
    Public interface.
    Called by agent_api.py REST endpoint and CLI demo.
    """
    try:
        result = agent_executor.invoke({"input": question})
        return result.get("output", "Agent produced no output.")
    except Exception as e:
        return f"Agent error: {str(e)}"


# ── CLI demo ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    demo_questions = [
        "Generate a full governance summary report",
        "Show me all in-progress projects from the database",
        "What is the budget analytics breakdown for all projects?",
        "Search for complaints or feedback about road projects",
        "Predict delay risk: budget 8 lakhs, 400 days duration, 20% progress, 50 complaints, North region, Roads department",
        "Analyze this citizen feedback: The road was repaired but quality is very poor and breaking again",
        "Classify this complaint: No water supply for the past 5 days in our colony",
        "Explain risks for project titled 'road'",
    ]

    print("=" * 65)
    print("  HyperGov Governance Intelligence Agent v2.0 (ReAct)")
    print("  Tools: 8 | LLM: Groq llama3 | DB: PostgreSQL")
    print("=" * 65)

    # Run first 2 demos by default — change slice to run more
    for q in demo_questions[:2]:
        print(f"\n🧑 Question: {q}")
        print("─" * 60)
        answer = run(q)
        print(f"🤖 Agent:\n{answer}")
        print()
