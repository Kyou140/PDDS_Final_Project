import sqlite3
import os

# Configuration
DATABASE_PATH = 'database/database.db' 
SQL_DIR = './graph/sql'

# Helper Functions
def get_db_connection():
    """Returns a new SQLite database connection configured for row access by name."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row 
    return conn

def _read_sql_file(filename):
    """Internal utility to read the content of a SQL file."""
    sql_path = os.path.join(SQL_DIR, filename)
    try:
        with open(sql_path, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        # Raise an informative error if a SQL file is missing
        raise FileNotFoundError(f"SQL definition file not found: {sql_path}. Please create this file.")