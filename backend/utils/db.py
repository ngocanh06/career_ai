import os
import pymysql
import pymysql.cursors
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

def get_db():
    """Tạo kết nối MySQL mới cho mỗi request."""
    return pymysql.connect(**DB_CONFIG)
