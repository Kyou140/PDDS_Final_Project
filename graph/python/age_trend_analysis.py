from database_service import get_db_connection, _read_sql_file

def fetch_age_trend():
    sql_query = _read_sql_file('age_trend_analysis.sql')

    conn = get_db_connection()
    try:
        rows = conn.execute(sql_query).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()