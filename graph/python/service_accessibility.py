from database_service import get_db_connection, _read_sql_file

def fetch_service_accessibility_data():
    """Fetches data for the Service Accessibility Map (Total Facilities and Density) by reading the query from 'service_accessibility.sql'."""
    # Read the query string from the dedicated SQL file
    sql_query = _read_sql_file('service_accessibility.sql') 
    conn = get_db_connection()
    try:
        data = conn.execute(sql_query).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()