from database_service import get_db_connection, _read_sql_file

def fetch_welfare_data(city_code):
    """Fetches Welfare Spending data for a specific city by reading the query from 'welfare_spending.sql'."""
    sql_query = _read_sql_file('welfare_spending.sql')
    conn = get_db_connection()
    try:
        data = conn.execute(sql_query, (city_code,)).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()