from database_service import get_db_connection, _read_sql_file

def fetch_city_details(city_code):
    """Fetches the detail of all available cities for the dropdown by reading the query from 'city_details.sql'."""
    sql_query = _read_sql_file('city_details.sql')

    conn = get_db_connection()
    try:
        data = conn.execute(sql_query, {"city_code": city_code}).fetchone()
        return dict(data) if data else None
    finally:
        conn.close()