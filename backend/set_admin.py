import sys
sys.path.append('.')
from utils.db import get_db

target_email = 'baotoan03092005@gmail.com'

try:
    conn = get_db()
    c = conn.cursor()
    
    # Reset all users to 'user' role
    c.execute("UPDATE user SET role='user'")
    
    # Check if target email exists
    c.execute("SELECT user_id FROM user WHERE email = %s", (target_email,))
    user = c.fetchone()
    
    if user:
        # Set target email to 'admin'
        c.execute("UPDATE user SET role='admin' WHERE email = %s", (target_email,))
        print(f"Success: Set admin role for {target_email}")
    else:
        # Create a new user with this email as admin if it doesn't exist
        print(f"Not found {target_email}. Creating new account...")
        c.execute(
            "INSERT INTO user (email, password_hash, role, status) VALUES (%s, %s, %s, 'active')",
            (target_email, 'google_sso', 'admin')
        )
        user_id = c.lastrowid
        c.execute(
            "INSERT INTO profile (user_id, full_name) VALUES (%s, %s)",
            (user_id, "Admin Bao Toan")
        )
        print(f"Success: Created account and set admin role for {target_email}")
        
    conn.commit()
    conn.close()
except Exception as e:
    print("Error:", e)
