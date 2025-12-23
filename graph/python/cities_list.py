from database_service import get_db_connection, _read_sql_file

def fetch_cities():
    """Fetches the list of all available cities for the dropdown by reading the query from 'cities_list.sql'."""
    sql_query = _read_sql_file('cities_list.sql')

    conn = get_db_connection()
    try:
        data = conn.execute(sql_query).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()