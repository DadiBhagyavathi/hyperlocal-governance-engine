"""
HyperGov — Complaint Classification Training Script
Model: TF-IDF + Logistic Regression (category) + Rule-based priority
Saves: models/complaint_classifier.pkl, models/tfidf_vectorizer.pkl
"""

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.pipeline import Pipeline
import joblib
import os
import json

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATASET    = os.path.join(BASE_DIR, "..", "datasets", "complaints.csv")
MODELS_DIR = os.path.join(BASE_DIR, "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def load_data():
    df = pd.read_csv(DATASET)
    df.columns = df.columns.str.strip()
    df["text"]     = df["text"].str.strip().str.lower()
    df["category"] = df["category"].str.strip()
    df["priority"] = df["priority"].str.strip()
    print(f"✅ Loaded {len(df)} samples")
    print(f"   Categories : {df['category'].nunique()} → {sorted(df['category'].unique())}")
    return df

def train_category_model(df):
    """TF-IDF + Logistic Regression pipeline for category classification."""
    X = df["text"]
    y = df["category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            min_df=1,
            sublinear_tf=True,
            strip_accents="unicode",
            analyzer="word",
            token_pattern=r"\w{2,}",
            stop_words=None
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            multi_class="multinomial",
            random_state=42
        ))
    ])

    pipeline.fit(X_train, y_train)

    # ── Evaluation ────────────────────────────────────────────────────────────
    y_pred = pipeline.predict(X_test)
    acc    = accuracy_score(y_test, y_pred)

    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="accuracy")

    print(f"\n── Category Model Evaluation ──────────────────────────────")
    print(f"   Test  Accuracy  : {acc:.4f} ({acc*100:.1f}%)")
    print(f"   CV    Mean±Std  : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    print(f"\n{classification_report(y_test, y_pred)}")

    return pipeline, {
        "test_accuracy": round(acc, 4),
        "cv_mean":       round(float(cv_scores.mean()), 4),
        "cv_std":        round(float(cv_scores.std()),  4),
        "classes":       sorted(df["category"].unique().tolist())
    }

def build_priority_rules():
    """
    Rule-based priority scorer.
    Keywords map to numeric priority 1=Low 2=Medium 3=High 4=Critical
    """
    return {
        "critical": 4,
        "urgent":   4,
        "emergency": 4,
        "danger":   4,
        "accident": 4,
        "contaminated": 4,
        "burst":    4,
        "sewage":   4,
        "overflow": 4,
        "disease":  4,
        "expired":  4,
        "weeks":    3,
        "days":     3,
        "broken":   3,
        "damaged":  3,
        "illegal":  3,
        "not working": 3,
        "missing":  3,
        "absent":   3,
        "no water": 3,
        "cut off":  3,
        "minor":    1,
        "small":    1,
        "slight":   1,
    }

INT_TO_PRIORITY = {1: "Low", 2: "Medium", 3: "High", 4: "Critical"}
PRIORITY_WEIGHTS = {
    "Electricity": 1,
    "Road":        1,
    "Water":       1,
    "Sanitation":  1,
    "Parks":       0,
    "Healthcare":  2,
    "Education":   1,
    "Transport":   0,
    "Safety":      2,
    "Construction":0
}

def save_artifacts(pipeline, metrics):
    model_path = os.path.join(MODELS_DIR, "complaint_classifier.pkl")
    meta_path  = os.path.join(MODELS_DIR, "model_metadata.json")

    joblib.dump(pipeline, model_path)

    metadata = {
        "model_type":     "TF-IDF + LogisticRegression",
        "categories":     metrics["classes"],
        "test_accuracy":  metrics["test_accuracy"],
        "cv_mean":        metrics["cv_mean"],
        "cv_std":         metrics["cv_std"],
        "features":       "ngram(1,2), max_features=5000, sublinear_tf",
        "priority_rules": build_priority_rules()
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n✅ Model saved   → {model_path}")
    print(f"✅ Metadata saved → {meta_path}")
    return model_path

def main():
    print("=" * 60)
    print("  HyperGov — Complaint Classifier Training")
    print("=" * 60)

    df = load_data()
    pipeline, metrics = train_category_model(df)
    save_artifacts(pipeline, metrics)

    # ── Quick smoke test ──────────────────────────────────────────────────────
    test_cases = [
        "Street lights are not working on main road",
        "Pothole causing accident near school",
        "Water supply cut off for 3 days",
        "Garbage not collected for a week",
        "Hospital has no medicines available",
    ]
    print("\n── Smoke Test ─────────────────────────────────────────────")
    for text in test_cases:
        probs  = pipeline.predict_proba([text.lower()])[0]
        pred   = pipeline.predict([text.lower()])[0]
        conf   = round(float(max(probs)) * 100, 1)
        print(f"   '{text[:45]}...' → {pred} ({conf}%)")

    print("\n✅ Training complete!\n")

if __name__ == "__main__":
    main()
