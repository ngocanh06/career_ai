import pymysql
conn = pymysql.connect(host='localhost', user='root', password='123123', database='career_ai')
with conn.cursor() as cursor:
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS otp_verification (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(150) NOT NULL,
            otp_code VARCHAR(6) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL,
            is_used BOOLEAN NOT NULL DEFAULT 0,
            type ENUM('register', 'forgot_password') NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ''')
    conn.commit()
    print('otp_verification table created successfully.')
conn.close()
