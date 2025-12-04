from flask import Flask, render_template, jsonify
# Import the functions from your new database service file
from graph.python.cities_list import fetch_cities
from graph.python.gender_SMR_trend import fetch_gender_smr_data
from graph.python.welfare_spending import fetch_welfare_data
from graph.python.service_accessibility import fetch_service_accessibility_data

# --- Configuration ---
app = Flask(__name__)
# Removed all SQLite imports and connection functions

# --- Routes ---

@app.route("/")
def index():
    """Renders the main HTML page."""
    return render_template("index.html")

# 1. Route for City Dropdown (/cities)
@app.route("/cities")
def get_cities():
    """Fetches the list of cities by calling the db_service function."""
    try:
        # Calls the function in db_service.py
        cities_list = fetch_cities() 
        return jsonify(cities_list)
        
    except Exception as e:
        # Handles errors from the database layer
        print(f"Error fetching cities from DB service: {e}")
        return jsonify({"error": "Failed to fetch city list."}), 500

# 2. Route for Gender SMR Chart Data
@app.route("/city/<city_code>/gender")
def get_gender_data(city_code):
    """Fetches the Gender SMR Trend data by calling the db_service function."""
    try:
        # Calls the function in db_service.py
        data_list = fetch_gender_smr_data(city_code)
        
        return jsonify({
            "city": city_code,
            "data": data_list
        })

    except Exception as e:
        # Handles errors from the database layer
        print(f"Error fetching gender data from DB service for {city_code}: {e}")
        return jsonify({"error": "Failed to fetch gender chart data."}), 500

# 3. Route for Welfare Spending Chart Data
@app.route("/city/<city_code>/welfare")
def get_welfare_data(city_code):
    """Fetches the Welfare Spending data by calling the db_service function."""
    try:
        # Calls the function in db_service.py
        data_list = fetch_welfare_data(city_code)

        return jsonify({
            "city": city_code,
            "data": data_list
        })

    except Exception as e:
        # Handles errors from the database layer
        print(f"Error fetching welfare data from DB service for {city_code}: {e}")
        return jsonify({"error": "Failed to fetch welfare chart data."}), 500

# 4. NEW Route for Service Accessibility Map Data
@app.route("/map/accessibility")
def get_service_accessibility_data():
    """
    Fetches data for the Service Accessibility Map (Bubble Chart).
    """
    try:
        data_list = fetch_service_accessibility_data()
        
        return jsonify({
            "data": data_list
        })

    except Exception as e:
        print(f"Error fetching service accessibility data: {e}")
        return jsonify({"error": "Failed to fetch map data."}), 500

if __name__ == "__main__":
    app.run(debug=True)