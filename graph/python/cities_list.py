from database_service import get_db_connection, _read_sql_file

# --- Configuration ---
# Assumes the database file is in the 'database' directory relative to where app.py runs
DATABASE_PATH = 'database/database.db' 
SQL_DIR = './graph/sql'

def fetch_cities():
    """
    Fetches the list of all available cities for the dropdown.
    This query is embedded because it is a simple, universal list query.
    """
    sql_query = _read_sql_file('cities_list.sql')

    conn = get_db_connection()
    try:
        data = conn.execute(sql_query).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()