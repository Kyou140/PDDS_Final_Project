from database_service import get_db_connection, _read_sql_file

def fetch_resource_priority_data():
    """Fetches data for the Resource Priority Map by reading the query from 'resource_priority_map.sql'."""
    sql_query = _read_sql_file('resource_priority_map.sql')

    conn = get_db_connection()
    try:
        data = conn.execute(sql_query).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()