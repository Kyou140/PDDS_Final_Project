from database_service import get_db_connection, _read_sql_file

# --- Configuration ---
# Assumes the database file is in the 'database' directory relative to where app.py runs
DATABASE_PATH = 'database/database.db' 
SQL_DIR = './graph/sql'

def fetch_welfare_data(city_code):
    """
    Fetches Welfare Spending data for a specific city by reading 
    the query from 'welfare_spending.sql'.
    """
    # Read the query string from the dedicated SQL file
    sql_query = _read_sql_file('welfare_spending.sql')
    
    conn = get_db_connection()
    try:
        data = conn.execute(sql_query, (city_code,)).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()