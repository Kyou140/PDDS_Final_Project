from database_service import get_db_connection, _read_sql_file

def fetch_gender_smr_data(city_code):
    """Fetches Gender SMR Trend data for a specific city by reading the query from 'gender_SMR_trend.sql'."""
    sql_query = _read_sql_file('gender_SMR_trend.sql') 
    conn = get_db_connection()
    try:
        data = conn.execute(sql_query, (city_code,)).fetchall()
        return [dict(d) for d in data]
    finally:
        conn.close()