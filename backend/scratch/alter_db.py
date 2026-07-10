import sys
import os
sys.path.append(os.path.abspath('d:/career_ai/backend'))
from utils.db import get_db

conn = get_db()
cursor = conn.cursor()
try:
    cursor.execute("ALTER TABLE career ADD COLUMN salary VARCHAR(100);")
    cursor.execute("ALTER TABLE career ADD COLUMN skills TEXT;")
    cursor.execute("ALTER TABLE career ADD COLUMN potential FLOAT;")
    cursor.execute("ALTER TABLE career ADD COLUMN trend_analysis TEXT;")
    conn.commit()
    print("Columns added")
except Exception as e:
    print("Error:", e)
finally:
    conn.close()
