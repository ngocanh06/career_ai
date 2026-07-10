from flask import Blueprint, jsonify
from utils.db import get_db

db_bp = Blueprint('db', __name__)

# -------------------------------------------------------
# Test kết nối database
# -------------------------------------------------------
@db_bp.route('/test-db')
def test_db():
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT user_id, email, role, status FROM user LIMIT 5")
            rows = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'message': 'Kết nối database thành công!', 'data': rows})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Tạo bảng OTP (Chạy 1 lần)
# -------------------------------------------------------
@db_bp.route('/create-otp-table')
def create_otp_table():
    try:
        conn = get_db()
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
        conn.close()
        return jsonify({'success': True, 'message': 'Tạo bảng otp_verification thành công!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
