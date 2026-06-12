"""
HyperGov — Complete ML Training Pipeline
==========================================
Trains ALL models in one run:
  1. Complaint Classifier    (TF-IDF + LogReg  — 5000 rows)
  2. Delay Predictor         (XGBoost          — 10000 rows)
  3. SHAP Explainability     (on delay model)
  4. Budget Overrun Regressor(GradientBoosting — 10000 rows)
  5. Complaint Clustering    (KMeans           — 5000 rows)

Run:  python training/train_all.py
Output: models/ folder with all .pkl and .json files
"""

import os, json, warnings
import pandas as pd
import numpy as np
import joblib

warnings.filterwarnings("ignore")

BASE   = os.path.dirname(os.path.abspath(__file__))
DATA   = os.path.join(BASE, "..", "datasets")
MODELS = os.path.join(BASE, "..", "models")
os.makedirs(MODELS, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# STEP 0 — Generate datasets if missing
# ─────────────────────────────────────────────────────────────────────────────
def ensure_datasets():
    complaints_path = os.path.join(DATA, "complaints_5k.csv")
    projects_path   = os.path.join(DATA, "projects_10k.csv")

    if not os.path.exists(complaints_path):
        print("⚙️  Generating complaints_5k.csv ...")
        import subprocess, sys
        subprocess.run([sys.executable,
                        os.path.join(BASE, "generate_complaints_5k.py")], check=True)

    if not os.path.exists(projects_path):
        print("⚙️  Generating projects_10k.csv ...")
        import subprocess, sys
        subprocess.run([sys.executable,
                        os.path.join(BASE, "generate_project_data.py")], check=True)

    return complaints_path, projects_path


# ─────────────────────────────────────────────────────────────────────────────
# MODEL 1 — Complaint Classifier (TF-IDF + Logistic Regression)
# ─────────────────────────────────────────────────────────────────────────────
def train_classifier(complaints_path):
    print("\n" + "="*60)
    print("  MODEL 1 — Complaint Classifier")
    print("="*60)

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.pipeline import Pipeline
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.metrics import (classification_report, accuracy_score,
                                  confusion_matrix, f1_score)

    df = pd.read_csv(complaints_path)
    df.columns = df.columns.str.strip()
    df["text"]     = df["text"].str.lower().str.strip()
    df["category"] = df["category"].str.strip()
    print(f"✅ Loaded {len(df)} complaints | {df['category'].nunique()} categories")

    X, y = df["text"], df["category"]
    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42)

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2), max_features=8000,
            sublinear_tf=True, min_df=1,
            strip_accents="unicode", token_pattern=r"\w{2,}"
        )),
        ("clf", LogisticRegression(
            max_iter=1000, C=2.0, solver="lbfgs",
            multi_class="multinomial", random_state=42
        ))
    ])
    pipe.fit(X_tr, y_tr)

    y_pred = pipe.predict(X_te)
    acc    = accuracy_score(y_te, y_pred)
    f1     = f1_score(y_te, y_pred, average="weighted")
    cv     = cross_val_score(pipe, X, y, cv=5, scoring="accuracy")
    cm     = confusion_matrix(y_te, y_pred, labels=sorted(y.unique())).tolist()

    print(f"\n  Test Accuracy  : {acc:.4f} ({acc*100:.1f}%)")
    print(f"  Weighted F1    : {f1:.4f}")
    print(f"  CV Mean±Std    : {cv.mean():.4f} ± {cv.std():.4f}")
    print(f"\n{classification_report(y_te, y_pred)}")

    joblib.dump(pipe, os.path.join(MODELS, "complaint_classifier.pkl"))

    meta = {
        "model_type":    "TF-IDF + LogisticRegression",
        "train_rows":    int(len(X_tr)),
        "test_rows":     int(len(X_te)),
        "categories":    sorted(y.unique().tolist()),
        "test_accuracy": round(float(acc), 4),
        "weighted_f1":   round(float(f1), 4),
        "cv_mean":       round(float(cv.mean()), 4),
        "cv_std":        round(float(cv.std()), 4),
        "confusion_matrix": cm,
        "confusion_labels": sorted(y.unique().tolist()),
    }
    with open(os.path.join(MODELS, "model_metadata.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print("✅ complaint_classifier.pkl  saved")
    print("✅ model_metadata.json       saved")
    return meta


# ─────────────────────────────────────────────────────────────────────────────
# MODEL 2 — Delay Predictor (XGBoost) + SHAP
# ─────────────────────────────────────────────────────────────────────────────
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
}
DEPT_MAP = {
    "Roads & Highways":0,"Water Supply":1,"Sanitation & Drainage":2,
    "Healthcare":3,"Education":4,"Parks & Recreation":5,
    "Electricity":6,"Public Safety":7,"Housing":8,"Transport":9,
}
SEASON_MAP = {"Summer":0,"Monsoon":1,"Winter":2,"Spring":3}

FEATURES = [
    "budget_lakhs","planned_duration_days","progress_pct",
    "complaint_count","team_size","previous_delays",
    "material_issues","land_disputes","region_enc","dept_enc","season_enc"
]

def train_delay(projects_path):
    print("\n" + "="*60)
    print("  MODEL 2 — Delay Predictor (XGBoost) + SHAP")
    print("="*60)

    from sklearn.model_selection import train_test_split
    from sklearn.metrics import (accuracy_score, roc_auc_score,
                                  classification_report, confusion_matrix, f1_score)
    try:
        from xgboost import XGBClassifier
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier as XGBClassifier
        print("⚠️  xgboost not found — using GradientBoosting")

    df = pd.read_csv(projects_path)
    df["region_enc"] = df["region"].map(REGION_MAP).fillna(0).astype(int)
    df["dept_enc"]   = df["department"].map(DEPT_MAP).fillna(0).astype(int)
    df["season_enc"] = df["season_started"].map(SEASON_MAP).fillna(0).astype(int)

    X = df[FEATURES]
    y = df["is_delayed"]

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42)

    print(f"✅ Loaded {len(df)} projects | Train: {len(X_tr)} | Test: {len(X_te)}")

    model = XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.08,
        subsample=0.85, colsample_bytree=0.85,
        use_label_encoder=False, eval_metric="logloss",
        random_state=42, verbosity=0
    )
    model.fit(X_tr, y_tr,
              eval_set=[(X_te, y_te)],
              verbose=False)

    y_pred  = model.predict(X_te)
    y_proba = model.predict_proba(X_te)[:,1]
    acc = accuracy_score(y_te, y_pred)
    auc = roc_auc_score(y_te, y_proba)
    f1  = f1_score(y_te, y_pred, average="weighted")
    cm  = confusion_matrix(y_te, y_pred).tolist()

    print(f"\n  Accuracy   : {acc:.4f} ({acc*100:.1f}%)")
    print(f"  ROC-AUC    : {auc:.4f}")
    print(f"  Weighted F1: {f1:.4f}")
    print(f"\n{classification_report(y_te, y_pred, target_names=['On-Time','Delayed'])}")

    # Feature importances
    fi = dict(sorted(
        zip(FEATURES, model.feature_importances_.tolist()),
        key=lambda x: -x[1]
    ))
    print("\n  Feature Importances:")
    for feat, imp in fi.items():
        bar = "█" * int(imp * 50)
        print(f"    {feat:<25} {bar} {imp:.4f}")

    # SHAP values
    shap_values_json = {}
    try:
        import shap
        explainer   = shap.TreeExplainer(model)
        shap_vals   = explainer.shap_values(X_te.iloc[:200])
        mean_shap   = np.abs(shap_vals).mean(axis=0)
        shap_values_json = {
            feat: round(float(v), 4)
            for feat, v in sorted(zip(FEATURES, mean_shap), key=lambda x: -x[1])
        }
        print("\n  SHAP Mean |values| (top features):")
        for f, v in list(shap_values_json.items())[:5]:
            print(f"    {f:<25} {v:.4f}")
    except Exception as e:
        print(f"  ⚠️  SHAP skipped: {e}")

    joblib.dump({
        "model":      model,
        "features":   FEATURES,
        "region_map": REGION_MAP,
        "dept_map":   DEPT_MAP,
        "season_map": SEASON_MAP,
    }, os.path.join(MODELS, "delay_predictor.pkl"))

    delay_meta = {
        "model_type":         "XGBoost Classifier",
        "train_rows":         int(len(X_tr)),
        "test_rows":          int(len(X_te)),
        "features":           FEATURES,
        "accuracy":           round(float(acc), 4),
        "roc_auc":            round(float(auc), 4),
        "weighted_f1":        round(float(f1), 4),
        "confusion_matrix":   cm,
        "feature_importance": {k: round(float(v), 4) for k, v in fi.items()},
        "shap_importance":    shap_values_json,
        "region_map":         REGION_MAP,
        "dept_map":           DEPT_MAP,
    }
    with open(os.path.join(MODELS, "delay_metadata.json"), "w") as f:
        json.dump(delay_meta, f, indent=2)

    print("✅ delay_predictor.pkl  saved")
    print("✅ delay_metadata.json  saved")
    return delay_meta


# ─────────────────────────────────────────────────────────────────────────────
# MODEL 3 — Budget Overrun Regressor (GradientBoosting)
# ─────────────────────────────────────────────────────────────────────────────
BUDGET_FEATURES = [
    "budget_lakhs","planned_duration_days","progress_pct",
    "complaint_count","team_size","previous_delays",
    "material_issues","land_disputes","region_enc","dept_enc","season_enc"
]

def train_budget_regressor(projects_path):
    print("\n" + "="*60)
    print("  MODEL 3 — Budget Overrun Regressor (GradientBoosting)")
    print("="*60)

    from sklearn.ensemble import GradientBoostingRegressor
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

    df = pd.read_csv(projects_path)
    df["region_enc"] = df["region"].map(REGION_MAP).fillna(0).astype(int)
    df["dept_enc"]   = df["department"].map(DEPT_MAP).fillna(0).astype(int)
    df["season_enc"] = df["season_started"].map(SEASON_MAP).fillna(0).astype(int)

    # Derive budget overrun percentage
    df["overrun_pct"] = np.clip(
        (df["actual_duration_days"] - df["planned_duration_days"])
        / df["planned_duration_days"] * 100,
        0, 200
    )

    X = df[BUDGET_FEATURES]
    y = df["overrun_pct"]

    X_tr, X_te, y_tr, y_te = train_test_split(
        X, y, test_size=0.2, random_state=42)

    print(f"✅ Loaded {len(df)} projects | Target: budget overrun %")

    model = GradientBoostingRegressor(
        n_estimators=200, max_depth=5, learning_rate=0.1,
        subsample=0.8, random_state=42
    )
    model.fit(X_tr, y_tr)

    y_pred = model.predict(X_te)
    mae  = mean_absolute_error(y_te, y_pred)
    rmse = np.sqrt(mean_squared_error(y_te, y_pred))
    r2   = r2_score(y_te, y_pred)

    print(f"\n  MAE  : {mae:.2f}%")
    print(f"  RMSE : {rmse:.2f}%")
    print(f"  R²   : {r2:.4f}")

    fi = dict(sorted(
        zip(BUDGET_FEATURES, model.feature_importances_.tolist()),
        key=lambda x: -x[1]
    ))
    print("\n  Feature Importances:")
    for feat, imp in list(fi.items())[:5]:
        print(f"    {feat:<25} {imp:.4f}")

    joblib.dump({
        "model":    model,
        "features": BUDGET_FEATURES,
    }, os.path.join(MODELS, "budget_regressor.pkl"))

    budget_meta = {
        "model_type":         "GradientBoosting Regressor",
        "target":             "budget_overrun_pct",
        "train_rows":         int(len(X_tr)),
        "test_rows":          int(len(X_te)),
        "mae":                round(float(mae), 2),
        "rmse":               round(float(rmse), 2),
        "r2":                 round(float(r2), 4),
        "feature_importance": {k: round(float(v), 4) for k, v in fi.items()},
    }
    with open(os.path.join(MODELS, "budget_metadata.json"), "w") as f:
        json.dump(budget_meta, f, indent=2)

    print("✅ budget_regressor.pkl  saved")
    print("✅ budget_metadata.json  saved")
    return budget_meta


# ─────────────────────────────────────────────────────────────────────────────
# MODEL 4 — Complaint Clustering (KMeans on TF-IDF)
# ─────────────────────────────────────────────────────────────────────────────
def train_clustering(complaints_path):
    print("\n" + "="*60)
    print("  MODEL 4 — Complaint Clustering (KMeans)")
    print("="*60)

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans
    from sklearn.metrics import silhouette_score
    from sklearn.decomposition import TruncatedSVD

    df = pd.read_csv(complaints_path)
    df["text"] = df["text"].str.lower().str.strip()

    tfidf = TfidfVectorizer(ngram_range=(1,2), max_features=3000,
                            sublinear_tf=True, min_df=2)
    X = tfidf.fit_transform(df["text"])

    # SVD for dimensionality reduction (for silhouette score)
    svd   = TruncatedSVD(n_components=50, random_state=42)
    X_red = svd.fit_transform(X)

    # Find best K (try 5-12)
    best_k, best_score, best_model = 8, -1, None
    print("  Finding best K ...")
    for k in range(5, 13):
        km    = KMeans(n_clusters=k, random_state=42, n_init=10, max_iter=300)
        labels= km.fit_predict(X_red)
        score = silhouette_score(X_red, labels, sample_size=1000, random_state=42)
        print(f"    K={k}  silhouette={score:.4f}")
        if score > best_score:
            best_k, best_score, best_model = k, score, km

    print(f"\n  Best K={best_k}  silhouette={best_score:.4f}")
    labels = best_model.labels_

    # Top terms per cluster
    order_centroids = best_model.cluster_centers_.argsort()[:, ::-1]
    terms = tfidf.get_feature_names_out()
    clusters_info = {}
    for i in range(best_k):
        top_terms = [terms[idx] for idx in order_centroids[i, :8]]
        mask      = labels == i
        cat_dist  = df["category"][mask].value_counts().to_dict()
        clusters_info[str(i)] = {
            "size":       int(mask.sum()),
            "top_terms":  top_terms,
            "categories": {k: int(v) for k, v in list(cat_dist.items())[:3]},
        }
        print(f"  Cluster {i} ({mask.sum()} complaints): {', '.join(top_terms[:5])}")

    joblib.dump({
        "model":     best_model,
        "tfidf":     tfidf,
        "svd":       svd,
        "n_clusters":best_k,
    }, os.path.join(MODELS, "complaint_cluster.pkl"))

    cluster_meta = {
        "model_type":      "KMeans Clustering",
        "n_clusters":      best_k,
        "silhouette_score":round(float(best_score), 4),
        "total_complaints":int(len(df)),
        "clusters":        clusters_info,
    }
    with open(os.path.join(MODELS, "cluster_metadata.json"), "w") as f:
        json.dump(cluster_meta, f, indent=2)

    print("✅ complaint_cluster.pkl  saved")
    print("✅ cluster_metadata.json  saved")
    return cluster_meta


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
def main():
    print("\n" + "="*60)
    print("  HyperGov -- Full ML Training Pipeline")
    print("="*60)

    complaints_path, projects_path = ensure_datasets()

    m1 = train_classifier(complaints_path)
    m2 = train_delay(projects_path)
    m3 = train_budget_regressor(projects_path)
    m4 = train_clustering(complaints_path)

    # Master summary
    summary = {
        "classifier":       {"accuracy": m1["test_accuracy"], "f1": m1["weighted_f1"], "cv": m1["cv_mean"]},
        "delay_predictor":  {"accuracy": m2["accuracy"], "auc": m2["roc_auc"], "f1": m2["weighted_f1"]},
        "budget_regressor": {"mae": m3["mae"], "rmse": m3["rmse"], "r2": m3["r2"]},
        "clustering":       {"k": m4["n_clusters"], "silhouette": m4["silhouette_score"]},
    }
    with open(os.path.join(MODELS, "training_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\n" + "="*60)
    print("  ALL MODELS TRAINED SUCCESSFULLY")
    print("="*60)
    print(f"\n  Classifier  accuracy : {m1['test_accuracy']*100:.1f}%")
    print(f"  Delay pred  ROC-AUC  : {m2['roc_auc']:.4f}")
    print(f"  Budget reg  R²       : {m3['r2']:.4f}")
    print(f"  Clustering  K        : {m4['n_clusters']}  sil={m4['silhouette_score']:.4f}")
    print(f"\n  Models saved to: {MODELS}\n")

if __name__ == "__main__":
    main()
