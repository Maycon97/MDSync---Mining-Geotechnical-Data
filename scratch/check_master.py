import json

with open("public/data/geotech_master.json", "r", encoding="utf-8") as f:
    d = json.load(f)

for k, v in d.items():
    if isinstance(v, list):
        print(f"{k}: list of {len(v)} items")
    elif isinstance(v, dict):
        print(f"{k}: dict with keys {list(v.keys())[:10]}")
    else:
        print(f"{k}: {type(v)}")
