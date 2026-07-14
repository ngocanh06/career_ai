import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    'host':     os.getenv('DB_HOST', 'localhost'),
    'port':     int(os.getenv('DB_PORT', 3306)),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '123123'),
    'database': os.getenv('DB_NAME', 'career_ai'),
    'charset':  'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def check_db():
    conn = pymysql.connect(**DB_CONFIG)
    with conn.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("TABLES:")
        for t in tables:
            table_name = list(t.values())[0]
            print(f"- {table_name}")
            cursor.execute(f"DESCRIBE `{table_name}`")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  * {col['Field']}: {col['Type']} (Null: {col['Null']}, Key: {col['Key']})")
    conn.close()

if __name__ == '__main__':
    check_db()
