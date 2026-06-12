"""
HyperGov — Project Delay Prediction Training Script
Models : RandomForest + XGBoost (best one saved)
Output : models/delay_predictor.pkl, models/delay_metadata.json
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    classification_report, roc_auc_score,
    accuracy_score, confusion_matrix
)
from sklearn.preprocessing import LabelEncoder
import joblib
import json
import os

try:
    from xgboost import XGBClassifier
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False
    print("⚠️  xgboost not installed — using RandomForest only")

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATASET    = os.path.join(BASE_DIR, "..", "datasets", "projects.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

REGION_MAP = {"North": 0, "South": 1, "East": 2, "West": 3, "Central": 4}
DEPT_MAP   = {"Roads": 0, "Water": 1, "Sanitation": 2,
              "Healthcare": 3, "Education": 4, "Parks": 5}

RECS = {
    (True,  "high"):   "🔴 Immediate intervention needed — escalate to senior officer",
    (True,  "medium"): "🟠 Review resource allocation and update timeline",
    (True,  "low"):    "🟡 Monitor weekly — risk of delay if complaints rise",
    (False, "high"):   "🟢 On track but keep complaint volume below 40",
    (False, "medium"): "🟢 Project progressing normally — routine monitoring",
    (False, "low"):    "✅ Healthy project — no action needed",
}

def load_and_encode(path):
    df = pd.read_csv(path)
    df["region_enc"] = df["region"].map(REGION_MAP)
    df["dept_enc"]   = df["department"].map(DEPT_MAP)
    features = ["budget_lakhs", "duration_days", "progress_pct",
                "complaint_count", "region_enc", "dept_enc"]
    X = df[features]
    y = df["is_delayed"]
    return X, y, features

def train(X_tr, y_tr, X_te, y_te, features):
    results = {}

    # ── Random Forest ─────────────────────────────────────────────────────────
    rf = RandomForestClassifier(
        n_estimators=200, max_depth=8, min_samples_split=5,
        random_state=42, n_jobs=-1
    )
    rf.fit(X_tr, y_tr)
    rf_pred  = rf.predict(X_te)
    rf_proba = rf.predict_proba(X_te)[:, 1]
    rf_auc   = roc_auc_score(y_te, rf_proba)
    rf_acc   = accuracy_score(y_te, rf_pred)

    print(f"\n── RandomForest ───────────────────────────────────────────")
    print(f"   Accuracy: {rf_acc:.4f}  |  ROC-AUC: {rf_auc:.4f}")
    print(f"\n{classification_report(y_te, rf_pred, target_names=['On-Time','Delayed'])}")

    results["random_forest"] = {
        "model": rf, "accuracy": rf_acc, "auc": rf_auc
    }

    # ── XGBoost ───────────────────────────────────────────────────────────────
    if XGB_AVAILABLE:
        xgb = XGBClassifier(
            n_estimators=200, max_depth=5, learning_rate=0.1,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric="logloss",
            random_state=42, verbosity=0
        )
        xgb.fit(X_tr, y_tr)
        xgb_pred  = xgb.predict(X_te)
        xgb_proba = xgb.predict_proba(X_te)[:, 1]
        xgb_auc   = roc_auc_score(y_te, xgb_proba)
        xgb_acc   = accuracy_score(y_te, xgb_pred)

        print(f"\n── XGBoost ────────────────────────────────────────────────")
        print(f"   Accuracy: {xgb_acc:.4f}  |  ROC-AUC: {xgb_auc:.4f}")
        print(f"\n{classification_report(y_te, xgb_pred, target_names=['On-Time','Delayed'])}")

        results["xgboost"] = {
            "model": xgb, "accuracy": xgb_acc, "auc": xgb_auc
        }

    # ── Pick best by AUC ──────────────────────────────────────────────────────
    best_name  = max(results, key=lambda k: results[k]["auc"])
    best       = results[best_name]
    print(f"\n🏆 Best model: {best_name.upper()} (AUC={best['auc']:.4f})")

    # ── Feature importances ───────────────────────────────────────────────────
    importances = best["model"].feature_importances_
    feat_imp = sorted(zip(features, importances), key=lambda x: -x[1])
    print("\n── Feature Importances ────────────────────────────────────")
    for f, imp in feat_imp:
        bar = "█" * int(imp * 40)
        print(f"   {f:<20} {bar} {imp:.4f}")

    return best["model"], best_name, best["accuracy"], best["auc"], feat_imp

def save(model, name, acc, auc, feat_imp, features):
    path = os.path.join(MODELS_DIR, "delay_predictor.pkl")
    meta = os.path.join(MODELS_DIR, "delay_metadata.json")

    joblib.dump({
        "model":      model,
        "features":   features,
        "region_map": REGION_MAP,
        "dept_map":   DEPT_MAP
    }, path)

    with open(meta, "w") as f:
        json.dump({
            "model_type":    name,
            "accuracy":      round(acc, 4),
            "roc_auc":       round(auc, 4),
            "features":      features,
            "feature_importance": {k: round(v, 4) for k, v in feat_imp},
            "region_map":    REGION_MAP,
            "dept_map":      DEPT_MAP,
            "recommendation_logic": {
                "delayed+high":    RECS[(True,"high")],
                "delayed+medium":  RECS[(True,"medium")],
                "not_delayed+low": RECS[(False,"low")]
            }
        }, f, indent=2)

    print(f"\n✅ Model  → {path}")
    print(f"✅ Meta   → {meta}")

def main():
    print("=" * 60)
    print("  HyperGov — Delay Prediction Training")
    print("=" * 60)

    X, y, features = load_and_encode(DATASET)
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    print(f"✅ Dataset: {len(X)} rows | Train: {len(X_tr)} | Test: {len(X_te)}")

    model, name, acc, auc, feat_imp = train(X_tr, y_tr, X_te, y_te, features)
    save(model, name, acc, auc, feat_imp, features)

    # ── Smoke test ────────────────────────────────────────────────────────────
    sample = pd.DataFrame([{
        "budget_lakhs": 5.0, "duration_days": 400,
        "progress_pct": 20,  "complaint_count": 55,
        "region_enc": REGION_MAP["East"], "dept_enc": DEPT_MAP["Roads"]
    }])
    prob = model.predict_proba(sample[features])[0][1]
    print(f"\n── Smoke Test ─────────────────────────────────────────────")
    print(f"   Budget=5L, Days=400, Progress=20%, Complaints=55")
    print(f"   → Delay Probability: {prob:.2%}")
    print("\n✅ Done!\n")

if __name__ == "__main__":
    main()
