"""
Generate 5000-row realistic complaints dataset for HyperGov.
Saves to: datasets/complaints_5k.csv
"""
import pandas as pd
import random
import os

random.seed(42)

TEMPLATES = {
    "Road": [
        "Large pothole on {road} causing accidents near {place}",
        "Road is completely broken near {place} since {days} days",
        "Speed breaker damaged on {road} highway",
        "Footpath broken and dangerous for walkers near {place}",
        "Road waterlogged after rain near {place}",
        "Divider damaged on {road} main street",
        "No road markings visible at night on {road}",
        "Bridge has cracks need urgent repair on {road}",
        "Potholes causing vehicle damage on {road}",
        "Road construction debris not cleared near {place}",
        "Street flooding on {road} during monsoon",
        "Road cave-in near {place} drainage line",
        "Unmarked speed breaker causing accidents on {road}",
        "Road encroachment by shops on {road}",
        "Broken road divider on {road} is dangerous",
    ],
    "Water": [
        "Water supply cut off for {days} days in {place}",
        "Dirty brown water coming from tap in {place}",
        "Water pipe burst on {road} flooding the street",
        "No water pressure in building in {place}",
        "Sewage mixing with drinking water in {place}",
        "Water tanker not arriving on schedule in {place}",
        "Leaking water pipe wasting water on {road}",
        "Water meter showing wrong reading in {place}",
        "Contaminated water supply causing illness in {place}",
        "No water supply for past {days} days in {place}",
        "Water pipeline broken near {place} school",
        "Underground water leakage on {road}",
        "Water supply disrupted since {days} days",
        "Illegal water connection in {place}",
        "Water tank overflow flooding {road}",
    ],
    "Electricity": [
        "Street lights not working on {road} since {days} days",
        "No electricity for {days} days in {place}",
        "Power outage in {place} colony since morning",
        "Electric poles damaged after storm near {place}",
        "Street lamp broken near bus stop on {road}",
        "Transformer blew up near {place} market",
        "Lights flickering in {place} residential area",
        "No power supply during festival in {place}",
        "Illegal electrical connections spotted in {place}",
        "Electric meter not working properly in {place}",
        "High voltage wire hanging low on {road}",
        "Electricity bill error for {place} residents",
        "Power cut every day in {place} for {days} hours",
        "Electric box sparking near {place} school",
        "No street lights on dark {road} lane",
    ],
    "Sanitation": [
        "Garbage not collected for {days} days in {place}",
        "Open drain overflowing near {place} homes",
        "Public toilet not maintained in {place}",
        "Garbage dump near {place} residential area",
        "Sewage overflow on {road} street near {place}",
        "Bins not emptied since last week in {place}",
        "Stray dogs near garbage dump in {place}",
        "Dead animals not removed from {road}",
        "Open defecation area near {place} school",
        "Dirty drain causing disease spread in {place}",
        "Drain blocked for {days} days in {place}",
        "Sewage smell unbearable near {place}",
        "Garbage burning near {place} school",
        "No dustbin provided in {place} market",
        "Waste collection vehicle not coming to {place}",
    ],
    "Safety": [
        "Police not patrolling {place} area since {days} days",
        "Theft incidents increasing in {place} locality",
        "Street harassment near {place} school daily",
        "Illegal liquor shop operating openly in {place}",
        "Drug dealing happening in {place} park",
        "No lighting in dark lanes near {place}",
        "CCTV cameras vandalized near {place}",
        "Suspicious activity near ATM in {place}",
        "Women safety issues at {place} bus stop",
        "Night watchman absent from {place}",
        "Chain snatching incidents in {place} area",
        "Rowdy elements troubling residents of {place}",
        "Gambling den operating in {place}",
        "Illegal weapons spotted near {place}",
        "Security cameras not working in {place} market",
    ],
    "Healthcare": [
        "Government hospital lacks medicines in {place}",
        "No doctors available at PHC in {place} for {days} days",
        "Ambulance service not responding in {place}",
        "Dirty conditions in {place} government hospital",
        "Medical equipment not working in {place} hospital",
        "Long queues at {place} government dispensary",
        "Vaccination camp not organized in {place}",
        "No ASHA worker in {place} area since {days} days",
        "Hospital ward overcrowded in {place}",
        "Expired medicines given at {place} clinic",
        "No specialist doctor in {place} PHC",
        "Hospital building in bad condition in {place}",
        "No ambulance available in {place}",
        "Blood bank not available in {place} hospital",
        "Health worker absent from {place} since {days} days",
    ],
    "Education": [
        "School building in bad condition in {place}",
        "Teachers absent regularly from {place} school",
        "No toilets in {place} government school",
        "Mid-day meal not provided in {place} school",
        "School has no blackboards in {place}",
        "Library books damaged in {place} school",
        "No drinking water in {place} school",
        "School roof leaking during rain in {place}",
        "No sports facilities in {place} school",
        "Untrained teachers in {place} primary school",
        "School missing benches for students in {place}",
        "Computer lab non-functional in {place} school",
        "No boundary wall in {place} school",
        "Scholarship money not distributed in {place}",
        "Anganwadi center closed for {days} days in {place}",
    ],
    "Transport": [
        "Bus service not available to {place} village",
        "Auto drivers overcharging passengers in {place}",
        "No bus shelter at {place} bus stop",
        "Traffic signals not working on {road}",
        "No footpath for pedestrians on {road}",
        "Illegal parking blocking {road} in {place}",
        "Bus routes reduced suddenly in {place}",
        "No last mile connectivity in {place}",
        "Road dividers removed illegally on {road}",
        "CCTV cameras not working on {road}",
        "Bus not stopping at {place} stop",
        "Overloaded vehicles causing accidents on {road}",
        "No parking facility near {place} market",
        "E-rickshaw causing traffic jam in {place}",
        "Footover bridge broken near {place} station",
    ],
    "Parks": [
        "Park benches broken and unusable in {place}",
        "Garden lights not working in {place} park",
        "Playground equipment damaged in {place} park",
        "Park gate broken in {place}",
        "Trees fallen in {place} park after storm",
        "No drinking water in {place} park",
        "Park walls have graffiti in {place}",
        "Grass not trimmed in {place} public garden",
        "Park pathway broken and dangerous in {place}",
        "Encroachment in {place} public park area",
        "Park occupied by illegal vendors in {place}",
        "No maintenance of {place} garden since {days} days",
        "Children playground dirty and unsafe in {place}",
        "Park fountains not working in {place}",
        "No security guard in {place} park",
    ],
    "Construction": [
        "Building under construction without permit in {place}",
        "Illegal construction blocking {road} in {place}",
        "Construction noise during night hours in {place}",
        "Construction debris on footpath on {road}",
        "Building violating height norms in {place}",
        "Unauthorized commercial construction in {place}",
        "Construction affecting water supply in {place}",
        "Unsafe scaffolding near {road}",
        "Demolition without safety measures in {place}",
        "Construction dust affecting {place} residents",
        "No safety net during construction in {place}",
        "Unauthorized extension built in {place}",
        "Construction blocking entrance to {place} school",
        "Rubble dumped on {road} by contractor",
        "Construction work damaging water pipeline in {place}",
    ],
}

PRIORITY_MAP = {
    "Road":         ["Critical","High","High","Medium","Medium","Low"],
    "Water":        ["Critical","Critical","High","High","Medium","Low"],
    "Electricity":  ["High","High","Medium","Medium","Low","Low"],
    "Sanitation":   ["Critical","High","High","Medium","Medium","Low"],
    "Safety":       ["Critical","Critical","High","High","Medium","Medium"],
    "Healthcare":   ["Critical","Critical","Critical","High","High","Medium"],
    "Education":    ["High","High","Medium","Medium","Low","Low"],
    "Transport":    ["High","Medium","Medium","Low","Low","Low"],
    "Parks":        ["Medium","Medium","Low","Low","Low","Low"],
    "Construction": ["High","High","Medium","Medium","Low","Low"],
}

ROADS  = ["MG Road","NH-8","Ring Road","Old Delhi Road","Market Street",
          "Station Road","Temple Road","Hospital Road","School Lane","Main Bazaar"]
PLACES = ["Sector 5","Ward 12","Colony B","Nagar Panchayat","Block 3",
          "Mohalla 7","Village Kalan","Town Area","Zone 4","Puram Extension"]
DAYS   = [2,3,5,7,10,14,21,30]

rows = []
per_cat = 500  # 10 categories × 500 = 5000

for category, templates in TEMPLATES.items():
    priorities = PRIORITY_MAP[category]
    for _ in range(per_cat):
        tmpl = random.choice(templates)
        text = tmpl.format(
            road=random.choice(ROADS),
            place=random.choice(PLACES),
            days=random.choice(DAYS)
        )
        priority = random.choice(priorities)
        rows.append({"text": text, "category": category, "priority": priority})

random.shuffle(rows)
df = pd.DataFrame(rows)

out = os.path.join(os.path.dirname(__file__), "..", "datasets", "complaints_5k.csv")
df.to_csv(out, index=False)
print(f"Generated {len(df)} rows -> {out}")
print(df["category"].value_counts().to_string())
print(df["priority"].value_counts().to_string())
