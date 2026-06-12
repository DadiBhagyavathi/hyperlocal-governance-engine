"""
HyperGov ML Service v2.0
=========================
Endpoints:
  POST /classify          - Complaint classification (TF-IDF + LogReg)
  POST /delay             - Project delay prediction (XGBoost)
  POST /budget            - Budget overrun regression (GradientBoosting)
  POST /sentiment         - Sentiment analysis (DistilBERT / keyword)
  POST /cluster           - Cluster a complaint text
  GET  /models/status     - All model status + metrics
  GET  /models/metrics    - Full metrics JSON for UI dashboard
  GET  /health            - Health check

Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os, json, time

app = FastAPI(title="HyperGov ML Service v2.0", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
_m   = {}          # model registry
_t0  = time.time()


# ── Load all models at startup ────────────────────────────────────────────────
def _load():
    import joblib

    for name, fname in [
        ("clf",     "complaint_classifier.pkl"),
        ("delay",   "delay_predictor.pkl"),
        ("budget",  "budget_regressor.pkl"),
        ("cluster", "complaint_cluster.pkl"),
    ]:
        path = os.path.join(MODELS_DIR, fname)
        if os.path.exists(path):
            _m[name] = joblib.load(path)
            _m[f"{name}_ok"] = True
        else:
            _m[f"{name}_ok"] = False

    for name, fname in [
        ("clf_meta",     "model_metadata.json"),
        ("delay_meta",   "delay_metadata.json"),
        ("budget_meta",  "budget_metadata.json"),
        ("cluster_meta", "cluster_metadata.json"),
        ("summary",      "training_summary.json"),
    ]:
        path = os.path.join(MODELS_DIR, fname)
        if os.path.exists(path):
            with open(path) as f:
                _m[name] = json.load(f)

_load()


# ── Schemas ───────────────────────────────────────────────────────────────────
class TextReq(BaseModel):
    text: str = Field(..., min_length=3, max_length=1000)

class DelayReq(BaseModel):
    budget_lakhs:    float = Field(..., gt=0,       example=10.0)
    duration_days:   int   = Field(..., gt=0,       example=365)
    progress_pct:    int   = Field(..., ge=0, le=100, example=30)
    complaint_count: int   = Field(..., ge=0,       example=25)
    region:          str   = Field(...,             example="North Delhi")
    department:      str   = Field(...,             example="Roads & Highways")
    team_size:       Optional[int]   = Field(default=50)
    previous_delays: Optional[int]   = Field(default=1)
    material_issues: Optional[int]   = Field(default=0)
    land_disputes:   Optional[int]   = Field(default=0)
    season:          Optional[str]   = Field(default="Summer")

class BatchClassifyReq(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=50)


class BudgetReq(BaseModel):
    budget_lakhs:    float = Field(..., gt=0,       example=10.0)
    duration_days:   int   = Field(..., gt=0,       example=365)
    progress_pct:    int   = Field(..., ge=0, le=100, example=30)
    complaint_count: int   = Field(..., ge=0,       example=25)
    region:          str   = Field(...,             example="North Delhi")
    department:      str   = Field(...,             example="Roads & Highways")
    team_size:       Optional[int]   = Field(default=50)
    previous_delays: Optional[int]   = Field(default=1)
    material_issues: Optional[int]   = Field(default=0)
    land_disputes:   Optional[int]   = Field(default=0)
    season:          Optional[str]   = Field(default="Summer")


# ── Maps ──────────────────────────────────────────────────────────────────────
REGION_MAP = {
    "North Delhi":0,"South Delhi":1,"East Delhi":2,"West Delhi":3,"Central Delhi":4,
    "Mumbai Suburban":5,"Mumbai City":6,"Pune":7,"Nagpur":8,"Nashik":9,
    "Bengaluru Urban":10,"Bengaluru Rural":11,"Mysuru":12,"Mangaluru":13,"Hubballi":14,
    "Chennai North":15,"Chennai South":16,"Coimbatore":17,"Madurai":18,"Tiruchirappalli":19,
    "Hyderabad":20,"Warangal":21,"Nizamabad":22,"Karimnagar":23,"Khammam":24,
    "Kolkata North":25,"Kolkata South":26,"Howrah":27,"Durgapur":28,"Siliguri":29,
    "Ahmedabad":30,"Surat":31,"Vadodara":32,"Rajkot":33,"Bhavnagar":34,
    "Jaipur":35,"Jodhpur":36,"Kota":37,"Bikaner":38,"Ajmer":39,
    "Lucknow":40,"Kanpur":41,"Agra":42,"Varanasi":43,"Prayagraj":44,
    "Bhopal":45,"Indore":46,"Gwalior":47,"Jabalpur":48,"Ujjain":49,
    "Patna":50,"Gaya":51,"Muzaffarpur":52,"Bhagalpur":53,"Darbhanga":54,
    # Fallbacks for simple region names
    "North":0,"South":1,"East":2,"West":3,"Central":4,
}
DEPT_MAP = {
    "Roads & Highways":0,"Water Supply":1,"Sanitation & Drainage":2,
    "Healthcare":3,"Education":4,"Parks & Recreation":5,
    "Electricity":6,"Public Safety":7,"Housing":8,"Transport":9,
    # Fallbacks
    "Roads":0,"Water":1,"Sanitation":2,"Parks":5,
}
SEASON_MAP = {"Summer":0,"Monsoon":1,"Winter":2,"Spring":3}

PRIORITY_KW = {
    "critical":4,"urgent":4,"emergency":4,"danger":4,"accident":4,
    "contaminated":4,"burst":4,"overflow":4,"disease":4,"expired":4,
    "weeks":3,"days":3,"broken":3,"damaged":3,"illegal":3,
    "not working":3,"no water":3,"cut off":3,"absent":3,
    "minor":1,"small":1,"slight":1,
}
INT_PRIORITY = {1:"Low",2:"Medium",3:"High",4:"Critical"}
CATEGORY_WT  = {"Healthcare":2,"Safety":2}

RECOMMENDATION = {
    "Electricity":  "Contact local BESCOM/DISCOM electricity helpline",
    "Road":         "Raise with PWD (Public Works Department) for urgent repair",
    "Water":        "Escalate to Municipal Corporation water department",
    "Sanitation":   "Report to Swachh Bharat Mission / Urban Local Body",
    "Parks":        "Contact Parks Department for maintenance",
    "Healthcare":   "Notify District Health Officer immediately",
    "Education":    "Report to Block Education Officer",
    "Transport":    "Contact RTO / City Transport Authority",
    "Safety":       "File FIR at nearest police station — dial 100/112",
    "Construction": "Contact Town Planning / Municipal Building Dept",
}

POS_KW = ["good","great","excellent","happy","satisfied","helpful","fast",
           "quick","efficient","improved","resolved","clean","nice","best","superb"]
NEG_KW = ["bad","poor","worst","dirty","broken","damaged","slow","corrupt",
           "not working","useless","terrible","awful","horrible","delay",
           "delayed","no water","no electricity","accident","pathetic","disgusting"]

def _priority(text, category):
    tl   = text.lower()
    base = 2
    for kw, sc in PRIORITY_KW.items():
        if kw in tl:
            base = max(base, sc)
    bonus = CATEGORY_WT.get(category, 0)
    return INT_PRIORITY[min(4, base + (1 if bonus >= 2 else 0))]

def _sentiment_kw(text):
    tl  = text.lower()
    pos = sum(1 for w in POS_KW if w in tl)
    neg = sum(1 for w in NEG_KW if w in tl)
    if pos > neg: return "Positive", round(0.55 + min(pos*0.07, 0.40), 2)
    if neg > pos: return "Negative", round(0.55 + min(neg*0.07, 0.40), 2)
    return "Neutral", 0.55

def _build_features(req, is_delay=True):
    import pandas as pd
    region_enc = REGION_MAP.get(req.region, 0)
    dept_enc   = DEPT_MAP.get(req.department, 0)
    season_enc = SEASON_MAP.get(getattr(req, "season", "Summer"), 0)
    return pd.DataFrame([{
        "budget_lakhs":          req.budget_lakhs,
        "planned_duration_days": req.duration_days,
        "progress_pct":          req.progress_pct,
        "complaint_count":       req.complaint_count,
        "team_size":             getattr(req, "team_size", 50),
        "previous_delays":       getattr(req, "previous_delays", 1),
        "material_issues":       getattr(req, "material_issues", 0),
        "land_disputes":         getattr(req, "land_disputes", 0),
        "region_enc":            region_enc,
        "dept_enc":              dept_enc,
        "season_enc":            season_enc,
    }])


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":   "UP",
        "service":  "HyperGov ML Service v2.0",
        "uptime_s": round(time.time() - _t0, 1),
        "models": {
            "classifier":  _m.get("clf_ok",    False),
            "delay":       _m.get("delay_ok",  False),
            "budget":      _m.get("budget_ok", False),
            "cluster":     _m.get("cluster_ok",False),
        }
    }


@app.get("/models/status")
def models_status():
    cm = _m.get("clf_meta",     {})
    dm = _m.get("delay_meta",   {})
    bm = _m.get("budget_meta",  {})
    km = _m.get("cluster_meta", {})
    return {
        "classifier":  {"loaded": _m.get("clf_ok"),    "accuracy": cm.get("test_accuracy"),  "f1": cm.get("weighted_f1"),  "cv": cm.get("cv_mean")},
        "delay":       {"loaded": _m.get("delay_ok"),  "accuracy": dm.get("accuracy"),        "auc": dm.get("roc_auc"),     "f1": dm.get("weighted_f1")},
        "budget":      {"loaded": _m.get("budget_ok"), "mae": bm.get("mae"),                  "rmse": bm.get("rmse"),       "r2": bm.get("r2")},
        "cluster":     {"loaded": _m.get("cluster_ok"),"k": km.get("n_clusters"),             "silhouette": km.get("silhouette_score")},
        "sentiment":   {"loaded": True,                 "source": "keyword-based (always available)"},
    }


@app.get("/models/metrics")
def models_metrics():
    """Full metrics payload for the analytics UI dashboard."""
    return {
        "success":  True,
        "summary":  _m.get("summary", {}),
        "classifier": _m.get("clf_meta",     {}),
        "delay":      _m.get("delay_meta",   {}),
        "budget":     _m.get("budget_meta",  {}),
        "clustering": _m.get("cluster_meta", {}),
    }


@app.post("/classify")
def classify(req: TextReq):
    if not _m.get("clf_ok"):
        raise HTTPException(503, "Classifier not loaded — run training/train_all.py")
    clf  = _m["clf"]
    text = req.text.lower().strip()
    prob = clf.predict_proba([text])[0]
    cats = clf.classes_
    idx  = int(prob.argmax())
    cat  = cats[idx]
    conf = round(float(prob[idx]) * 100, 1)
    top3 = sorted([{"category": c, "confidence": round(float(p)*100,1)}
                   for c, p in zip(cats, prob)], key=lambda x: -x["confidence"])[:3]
    priority = _priority(req.text, cat)
    return {
        "success":         True,
        "category":        cat,
        "confidence":      conf,
        "priority":        priority,
        "recommendation":  RECOMMENDATION.get(cat, "Contact local civic authority"),
        "top_predictions": top3,
    }


@app.post("/delay")
def delay(req: DelayReq):
    if not _m.get("delay_ok"):
        raise HTTPException(503, "Delay model not loaded — run training/train_all.py")
    art  = _m["delay"]
    feat = art["features"]
    mdl  = art["model"]
    df   = _build_features(req)
    prob = float(mdl.predict_proba(df[feat])[0][1])
    risk = "high" if prob >= 0.75 else ("medium" if prob >= 0.45 else "low")
    delayed = prob >= 0.45
    rec_map = {
        (True, "high"):   "Immediate intervention — escalate to Senior Officer",
        (True, "medium"): "Review resources and update project timeline",
        (True, "low"):    "Monitor weekly — at risk if complaints increase",
        (False,"high"):   "On track — maintain complaint resolution pace",
        (False,"medium"): "Progressing normally — routine monitoring sufficient",
        (False,"low"):    "Healthy project — no immediate action required",
    }
    fi = _m.get("delay_meta", {}).get("feature_importance", {})
    return {
        "success":           True,
        "delay_probability": round(prob, 4),
        "risk_score":        round(prob * 100, 1),
        "risk_level":        risk,
        "predicted_delayed": delayed,
        "recommendation":    rec_map.get((delayed, risk), ""),
        "feature_importance":fi,
    }


@app.post("/budget")
def budget_overrun(req: BudgetReq):
    if not _m.get("budget_ok"):
        raise HTTPException(503, "Budget model not loaded — run training/train_all.py")
    art  = _m["budget"]
    feat = art["features"]
    mdl  = art["model"]
    df   = _build_features(req, is_delay=False)
    pred = float(mdl.predict(df[feat])[0])
    pred = max(0, round(pred, 1))
    risk = "High" if pred > 50 else ("Medium" if pred > 20 else "Low")
    return {
        "success":               True,
        "predicted_overrun_pct": pred,
        "risk_level":            risk,
        "interpretation":        f"Project timeline may overrun by ~{pred:.1f}%",
        "recommendation":        (
            "Immediate budget review needed" if pred > 50
            else "Monitor monthly spending" if pred > 20
            else "Budget on track"
        ),
    }


@app.post("/sentiment")
def sentiment(req: TextReq):
    label, score = _sentiment_kw(req.text)
    emoji = {"Positive":"😊","Negative":"😠","Neutral":"😐"}
    return {
        "success":    True,
        "sentiment":  label,
        "confidence": round(score * 100, 1),
        "emoji":      emoji[label],
        "source":     "keyword-based",
    }


@app.post("/batch/classify")
def batch_classify(req: BatchClassifyReq):
    """Classify multiple complaint texts in one call."""
    if not _m.get("clf_ok"):
        raise HTTPException(503, "Classifier not loaded")
    clf  = _m["clf"]
    results = []
    for text in req.texts:
        tl   = text.lower().strip()
        prob = clf.predict_proba([tl])[0]
        cats = clf.classes_
        idx  = int(prob.argmax())
        cat  = cats[idx]
        conf = round(float(prob[idx]) * 100, 1)
        priority = _priority(text, cat)
        label, score = _sentiment_kw(text)
        results.append({
            "text":           text[:80] + ("..." if len(text) > 80 else ""),
            "category":       cat,
            "confidence":     conf,
            "priority":       priority,
            "sentiment":      label,
            "recommendation": RECOMMENDATION.get(cat, "Contact local civic authority"),
        })
    return {"success": True, "count": len(results), "results": results}


@app.post("/cluster")
def cluster_complaint(req: TextReq):
    if not _m.get("cluster_ok"):
        raise HTTPException(503, "Cluster model not loaded — run training/train_all.py")
    art  = _m["cluster"]
    text = req.text.lower().strip()
    X    = art["tfidf"].transform([text])
    X_r  = art["svd"].transform(X)
    cid  = int(art["model"].predict(X_r)[0])
    meta = _m.get("cluster_meta", {})
    info = meta.get("clusters", {}).get(str(cid), {})
    return {
        "success":     True,
        "cluster_id":  cid,
        "cluster_size": info.get("size", 0),
        "top_terms":   info.get("top_terms", []),
        "categories":  info.get("categories", {}),
    }
