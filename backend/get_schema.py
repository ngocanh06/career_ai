import pymysql
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

DB_CONFIG = {
    'host':     os.getenv('DB_HOST', 'localhost'),
    'port':     int(os.getenv('DB_PORT', 3306)),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '123123'),
    'database': os.getenv('DB_NAME', 'career_ai'),
    'charset':  'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

conn = pymysql.connect(**DB_CONFIG)
try:
    with conn.cursor() as cursor:
        for table in ['profile', 'education', 'experience', 'certificate', 'portfolio']:
            cursor.execute(f"DESCRIBE `{table}`")
            columns = cursor.fetchall()
            print(f"\nStructure of {table}:")
            for col in columns:
                print(f"  {col['Field']}: {col['Type']}")
                
            cursor.execute(f"SELECT * FROM `{table}` LIMIT 3")
            rows = cursor.fetchall()
            print(f"Sample data for {table}:", rows)
finally:
    conn.close()
