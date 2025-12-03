import sqlite3
import pandas as pd
import json
import os

# -----------------------------
# Paths aligned to your project
# -----------------------------
DB_PATH = "./database/database.db"
SQL_PATH = "./graph_sql/gender_SMR_trend.sql"
OUTPUT_DIR = "./static/js/data/"

# Create output directory if missing
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load SQL query
with open(SQL_PATH, "r", encoding="utf-8") as f:
    query = f.read()

# Connect DB
conn = sqlite3.connect(DB_PATH)

# Get all cities
city_df = pd.read_sql_query("SELECT city_code, city_name FROM CityInfo", conn)

# Save city list for HTML dropdown
city_df.to_json("./static/js/city_list.json", orient="records", force_ascii=False)

# Generate per-city JSON
for _, row in city_df.iterrows():
    city_code = row["city_code"]
    city_name = row["city_name"]

    df = pd.read_sql_query(query, conn, params=(city_code,))

    data = {
        "city_code": city_code,
        "city_name": city_name,
        "data": df.to_dict(orient="records")
    }

    output_path = f"{OUTPUT_DIR}{city_code}.json"
    with open(output_path, "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False, indent=4)

conn.close()
print("JSON files generated → static/js/data/")