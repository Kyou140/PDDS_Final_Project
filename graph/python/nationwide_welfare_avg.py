from database_service import get_db_connection, _read_sql_file

def fetch_nationwide_welfare_avg():
    """Fetches data for the Resource Priority Map by reading the query from 'nationwide_welfare_avg.sql'."""
    # Read the query string from the dedicated SQL file
    sql_query = _read_sql_file('nationwide_welfare_avg.sql')

    conn = get_db_connection()
    try:
        data = conn.execute(sql_query).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()