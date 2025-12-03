import sqlite3
import os

# --- Configuration ---
# Assumes the database file is in the 'database' directory relative to where app.py runs
DATABASE_PATH = 'database/database.db' 
SQL_DIR = './graph/sql'

# ----------------------------------------------------
# Helper Functions
# ----------------------------------------------------

def get_db_connection():
    """Returns a new SQLite database connection configured for row access by name."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row 
    return conn

def _read_sql_file(filename):
    """Internal utility to read the content of a SQL file."""
    sql_path = os.path.join(SQL_DIR, filename)
    try:
        with open(sql_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        # Raise an informative error if a SQL file is missing
        raise FileNotFoundError(f"SQL definition file not found: {sql_path}. Please create this file.")

# ----------------------------------------------------
# Public Data Fetching Functions
# ----------------------------------------------------

def fetch_cities():
    """
    Fetches the list of all available cities for the dropdown.
    This query is embedded because it is a simple, universal list query.
    """
    conn = get_db_connection()
    try:
        cities = conn.execute(
            """
            SELECT DISTINCT city_code AS code, city_name AS name
            FROM CityInfo
            ORDER BY city_name
            """
        ).fetchall()
        return [dict(city) for city in cities]
    finally:
        conn.close()

def fetch_gender_smr_data(city_code):
    """
    Fetches Gender SMR Trend data for a specific city by reading 
    the query from 'gender_SMR_trend.sql'.
    """
    # Read the query string from the dedicated SQL file
    sql_query = _read_sql_file('gender_SMR_trend.sql') 
    
    conn = get_db_connection()
    try:
        data = conn.execute(
            sql_query,
            (city_code,)
        ).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()

def fetch_welfare_data(city_code):
    """
    Fetches Welfare Spending data for a specific city by reading 
    the query from 'welfare_spending.sql'.
    """
    # Read the query string from the dedicated SQL file
    sql_query = _read_sql_file('welfare_spending.sql') 
    
    conn = get_db_connection()
    try:
        data = conn.execute(
            sql_query,
            (city_code,)
        ).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()