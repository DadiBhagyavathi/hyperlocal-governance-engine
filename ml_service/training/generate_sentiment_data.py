"""
CivicMind AI — Synthetic Citizen Sentiment Dataset Generator
Produces: datasets/sentiment_feedback.csv  (3,000 rows)
Labels: POSITIVE, NEGATIVE, NEUTRAL
"""

import pandas as pd
import random
import os

random.seed(42)

POSITIVE = [
    "The road repair was completed on time, very happy with the work",
    "Water supply has improved a lot in our area, thank you",
    "Street lights are working perfectly now, feel safe at night",
    "The government responded quickly to our complaint, well done",
    "Park renovation looks beautiful, children love it",
    "Drainage work done excellently, no more waterlogging",
    "New hospital wing is a great addition to our area",
    "Public toilets are now clean and well maintained",
    "Bus frequency has increased, commuting is easier",
    "Quick action taken on our pothole complaint, impressed",
    "Electricity outages have reduced significantly, great work",
    "The sanitation team is doing a commendable job",
    "Road widening project completed ahead of schedule",
    "New traffic signals have reduced accidents in our area",
    "Water quality has improved, no more complaints from residents",
    "The construction work was neat and professional",
    "Happy with the prompt response from civic authorities",
    "Great improvement in garbage collection frequency",
    "The bridge repair was done with high quality materials",
    "New school building construction is progressing well",
    "Solar street lights are a wonderful initiative",
    "Footpath construction completed, senior citizens are happy",
    "The contractor did excellent work on the drainage project",
    "Water tank cleaning done thoroughly, water quality improved",
    "Road marking done properly, reduces accidents at night",
]

NEGATIVE = [
    "Pothole on main road not fixed even after 3 complaints",
    "No water supply for the past 5 days, very frustrated",
    "Street lights broken since 2 months, no action taken",
    "Garbage not collected for a week, health hazard",
    "Road dug up for pipeline but not restored for months",
    "Drainage overflowing, sewage on streets, disgusting",
    "Government hospital has no medicines, pathetic service",
    "Bus route cancelled without notice, people suffering",
    "Construction work stopped midway, area looks terrible",
    "Electricity cut for 3 days without any information",
    "Complained 10 times about potholes, zero response",
    "Water pipe burst causing damage, no immediate action",
    "Park facilities broken, children getting hurt",
    "Traffic signals not working, accidents happening daily",
    "Public toilet in horrible condition, very unhygienic",
    "Road repair done poorly, breaking again within weeks",
    "Contractor used substandard materials, work failing",
    "No street lights on dark lane, women feel unsafe",
    "Sewage line blocked for months, unbearable smell",
    "Project started but no updates for 6 months",
    "Authorities not responding to any complaints",
    "Water supply erratic, pressure very low",
    "Construction noise at midnight, residents suffering",
    "Footpath occupied by vendors, pedestrians on road",
    "Bridge cracks visible, no action from authorities",
]

NEUTRAL = [
    "Road repair work is ongoing in our sector",
    "Water supply will be interrupted tomorrow for maintenance",
    "New project for park development announced for our ward",
    "Electricity department working on transformer upgrade",
    "Garbage collection timings have been changed to morning",
    "Bridge inspection scheduled for next week",
    "Road widening project expected to complete next month",
    "Water pipeline replacement work in progress",
    "New bus route announcement expected soon",
    "Street light maintenance scheduled for this weekend",
    "Drainage cleaning drive happening next week",
    "Hospital renovation work started last month",
    "Construction of new school building underway",
    "Traffic signal upgrade project is under review",
    "Public toilet construction tender has been floated",
    "Road marking work will start after monsoon",
    "Water tanker supply continues until pipeline fixed",
    "Power outage scheduled for maintenance work",
    "Complaint registered, under review by department",
    "Project completion date extended by two months",
    "New contractor assigned for road repair work",
    "Environmental clearance received for park project",
    "Work order issued for pothole repair",
    "Survey completed for new drainage line",
    "Committee formed to review delayed projects",
]

CATEGORIES = ["Roads", "Water", "Electricity", "Sanitation", "Healthcare",
               "Education", "Parks", "Transport", "Public Safety", "Construction"]

WARDS = [f"Ward {i}" for i in range(1, 51)]

rows = []
all_templates = [
    (POSITIVE, "POSITIVE", [4, 5]),
    (NEGATIVE, "NEGATIVE", [1, 2]),
    (NEUTRAL,  "NEUTRAL",  [3]),
]

for sentiment_templates, label, rating_range in all_templates:
    for _ in range(1000):
        base = random.choice(sentiment_templates)
        rows.append({
            "feedback_text": base,
            "sentiment":     label,
            "rating":        random.choice(rating_range),
            "category":      random.choice(CATEGORIES),
            "ward":          random.choice(WARDS),
        })

random.shuffle(rows)
df = pd.DataFrame(rows)

out = os.path.join(os.path.dirname(__file__), "..", "datasets", "sentiment_feedback.csv")
df.to_csv(out, index=False)
print(f"Generated {len(df):,} rows -> {out}")
print(df["sentiment"].value_counts().to_string())
