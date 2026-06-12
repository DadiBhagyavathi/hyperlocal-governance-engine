"""
CivicMind AI — Synthetic Project Delay Dataset Generator
Produces: datasets/projects_10k.csv  (10,000 rows)

Fields: budget, timeline, progress, region, complaint_count, delay_status
"""

import numpy as np
import pandas as pd
import os
import random

random.seed(42)
np.random.seed(42)

REGIONS     = ["North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi",
               "Mumbai Suburban", "Mumbai City", "Pune", "Nagpur", "Nashik",
               "Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubballi",
               "Chennai North", "Chennai South", "Coimbatore", "Madurai", "Tiruchirappalli",
               "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
               "Kolkata North", "Kolkata South", "Howrah", "Durgapur", "Siliguri",
               "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
               "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
               "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj",
               "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain",
               "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"]

DEPARTMENTS = ["Roads & Highways", "Water Supply", "Sanitation & Drainage",
               "Healthcare", "Education", "Parks & Recreation",
               "Electricity", "Public Safety", "Housing", "Transport"]

CONTRACTORS = ["ABC Infra Pvt Ltd", "National Build Corp", "GovTech Solutions",
               "Bharat Construction", "Prime Infra Group", "Urban Dev Ltd",
               "SmartCity Builders", "Rajdhani Works", "Horizon Projects", "FastBuild Co"]

SEASONS     = ["Summer", "Monsoon", "Winter", "Spring"]

rows = []

for i in range(10000):
    dept        = random.choice(DEPARTMENTS)
    region      = random.choice(REGIONS)
    contractor  = random.choice(CONTRACTORS)
    season      = random.choice(SEASONS)

    budget          = round(random.uniform(0.5, 500.0), 2)   # lakhs INR
    planned_days    = random.randint(30, 730)
    progress        = random.randint(0, 100)
    complaint_count = random.randint(0, 200)
    team_size       = random.randint(5, 150)
    prev_delays     = random.randint(0, 5)
    material_issues = random.randint(0, 1)
    land_disputes   = random.randint(0, 1)

    # Realistic delay scoring
    score = 0.0
    if progress < 25 and planned_days > 300:    score += 0.30
    if progress < 50 and planned_days > 500:    score += 0.20
    if complaint_count > 80:                    score += 0.25
    if complaint_count > 40:                    score += 0.10
    if budget < 5 and planned_days > 180:       score += 0.15
    if dept in ["Roads & Highways", "Sanitation & Drainage"]:  score += 0.10
    if season == "Monsoon":                     score += 0.12
    if prev_delays > 2:                         score += 0.20
    if material_issues == 1:                    score += 0.18
    if land_disputes == 1:                      score += 0.22
    if team_size < 15:                          score += 0.10
    score += float(np.random.normal(0, 0.07))
    score  = float(np.clip(score, 0.0, 1.0))

    if score >= 0.70:   delay_status = "SEVERELY_DELAYED"
    elif score >= 0.45: delay_status = "DELAYED"
    elif score >= 0.20: delay_status = "AT_RISK"
    else:               delay_status = "ON_TRACK"

    actual_days = planned_days + int(score * 180) if delay_status != "ON_TRACK" else planned_days

    rows.append({
        "project_id":           f"PRJ{str(i+1).zfill(5)}",
        "department":           dept,
        "region":               region,
        "contractor":           contractor,
        "budget_lakhs":         budget,
        "planned_duration_days": planned_days,
        "actual_duration_days": actual_days,
        "progress_pct":         progress,
        "complaint_count":      complaint_count,
        "team_size":            team_size,
        "previous_delays":      prev_delays,
        "material_issues":      material_issues,
        "land_disputes":        land_disputes,
        "season_started":       season,
        "delay_score":          round(score, 4),
        "delay_status":         delay_status,
        "is_delayed":           1 if delay_status in ["DELAYED", "SEVERELY_DELAYED"] else 0
    })

df = pd.DataFrame(rows)

out = os.path.join(os.path.dirname(__file__), "..", "datasets", "projects_10k.csv")
df.to_csv(out, index=False)

print(f"Generated {len(df):,} rows -> {out}")
print(f"\nDelay Status Distribution:")
print(df["delay_status"].value_counts().to_string())
print(f"\nDepartment Distribution:")
print(df["department"].value_counts().to_string())
print(f"\nSample rows:")
print(df.head(3).to_string())
