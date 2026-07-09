import sys
sys.path.append('.')
from dotenv import load_dotenv
load_dotenv()
from utils.db import get_db
import json

conn = get_db()
c = conn.cursor()

# Check user table columns
c.execute('DESCRIBE user')
cols = c.fetchall()
print("USER COLUMNS:", json.dumps(cols, default=str))

# Check current users
c.execute('SELECT * FROM user LIMIT 5')
users = c.fetchall()
print("USERS:", json.dumps(users, default=str))

# Check roadmap table
c.execute('SELECT * FROM roadmap LIMIT 5')
rm = c.fetchall()
print("ROADMAPS:", json.dumps(rm, default=str))

conn.close()
