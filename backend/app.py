import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import pymysql.cursors
import os
import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
# (password hashing disabled for testing)
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------
# Cấu hình kết nối MySQL
# -------------------------------------------------------
DB_CONFIG = {
    'host':     os.getenv('DB_HOST', 'localhost'),
    'port':     int(os.getenv('DB_PORT', 3306)),
    'user':     os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', '123123'),
    'database': os.getenv('DB_NAME', 'carrer_ai'),
    'charset':  'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

def get_db():
    """Tạo kết nối MySQL mới cho mỗi request."""
    return pymysql.connect(**DB_CONFIG)

# -------------------------------------------------------
# Utility: Gửi Email OTP
# -------------------------------------------------------
def send_otp_email(to_email, otp_code, action_type):
    try:
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', 465))
        smtp_user = os.getenv('SMTP_USER', '')
        smtp_pass = os.getenv('SMTP_PASS', '')

        if not smtp_user or not smtp_pass:
            print("CẢNH BÁO: Chưa cấu hình SMTP_USER và SMTP_PASS, bỏ qua gửi mail thực tế.")
            print(f"[{action_type}] OTP cho {to_email} là: {otp_code}")
            return True

        if action_type == 'register':
            subject = "Mã xác nhận đăng ký tài khoản CareerAI"
            body = f"Chào bạn,\n\nMã xác nhận (OTP) của bạn là: {otp_code}\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nCareerAI Team"
        else:
            subject = "Mã xác nhận khôi phục mật khẩu CareerAI"
            body = f"Chào bạn,\n\nMã xác nhận khôi phục mật khẩu (OTP) của bạn là: {otp_code}\nMã này sẽ hết hạn sau 5 phút.\n\nTrân trọng,\nCareerAI Team"

        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = subject
        msg['From'] = f"CareerAI <{smtp_user}>"
        msg['To'] = to_email

        # Dùng SSL
        server = smtplib.SMTP_SSL(smtp_server, smtp_port)
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Lỗi gửi email: {e}")
        return False



# -------------------------------------------------------
# Kiểm tra server
# -------------------------------------------------------
@app.route('/')
def index():
    return jsonify({'message': 'CareerAI Backend API (Python/Flask) đang chạy!'})


# -------------------------------------------------------
# Test kết nối database
# -------------------------------------------------------
@app.route('/api/test-db')
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
@app.route('/api/create-otp-table')
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


# -------------------------------------------------------
# API: Lấy thông tin người dùng theo user_id
# -------------------------------------------------------
@app.route('/api/user/<int:user_id>')
def get_user(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT u.user_id, u.email, u.role, u.status, p.full_name, p.phone, p.bio, p.avatar_url "
                "FROM user u LEFT JOIN profile p ON u.user_id = p.user_id "
                "WHERE u.user_id = %s", (user_id,)
            )
            user = cursor.fetchone()
        conn.close()
        if not user:
            return jsonify({'success': False, 'message': 'Không tìm thấy người dùng'}), 404
        return jsonify({'success': True, 'data': user})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Đăng nhập bằng email + password
# -------------------------------------------------------
@app.route('/api/login', methods=['POST'])
def login():
    try:
        body = request.get_json()
        email    = (body.get('email') or '').strip()
        password = (body.get('password') or '').strip()

        if not email or not password:
            return jsonify({'success': False, 'message': 'Vui lòng nhập email và mật khẩu'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT u.user_id, u.email, u.role, u.status, u.password_hash, p.full_name "
                "FROM user u LEFT JOIN profile p ON u.user_id = p.user_id "
                "WHERE u.email = %s LIMIT 1",
                (email,)
            )
            user = cursor.fetchone()

            if not user:
                conn.close()
                return jsonify({'success': False, 'message': 'Email không tồn tại'}), 401

            if user['password_hash'] != password:
                conn.close()
                return jsonify({'success': False, 'message': 'Mật khẩu không đúng'}), 401

            if user['status'] != 'active':
                conn.close()
                return jsonify({'success': False, 'message': 'Tài khoản đã bị khóa'}), 403

            # Cập nhật last_login
            cursor.execute(
                "UPDATE user SET last_login = NOW() WHERE user_id = %s",
                (user['user_id'],)
            )
            conn.commit()

        conn.close()
        return jsonify({
            'success': True,
            'data': {
                'user_id':   user['user_id'],
                'email':     user['email'],
                'role':      user['role'],
                'full_name': user['full_name'] or email.split('@')[0],
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500



# -------------------------------------------------------
# API: Lấy danh sách nghề nghiệp đề xuất theo user_id
# -------------------------------------------------------
@app.route('/api/career/<int:user_id>')
def get_careers(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT career_id, job_title, match_percentage, job_description, source, "
                "DATE_FORMAT(generated_at, '%%Y-%%m-%%d %%H:%%i:%%s') as generated_at "
                "FROM career WHERE user_id = %s ORDER BY match_percentage DESC",
                (user_id,)
            )
            careers = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': careers})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy lộ trình học tập theo user_id
# -------------------------------------------------------
@app.route('/api/roadmap/<int:user_id>')
def get_roadmap(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Lấy roadmap mới nhất
            cursor.execute(
                "SELECT r.roadmap_id, r.title, r.total_months, r.completion_rate, r.status, "
                "DATE_FORMAT(r.created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at "
                "FROM roadmap r WHERE r.user_id = %s ORDER BY r.created_at DESC LIMIT 1",
                (user_id,)
            )
            roadmap = cursor.fetchone()

            if roadmap:
                # Lấy danh sách goal thuộc roadmap đó
                cursor.execute(
                    "SELECT g.goal_id, g.target_month, g.suggested_courses, g.status, "
                    "g.progress_percentage, "
                    "DATE_FORMAT(g.started_at, '%%Y-%%m-%%d %%H:%%i:%%s') as started_at, "
                    "DATE_FORMAT(g.completed_at, '%%Y-%%m-%%d %%H:%%i:%%s') as completed_at, s.skill_name "
                    "FROM goal g LEFT JOIN skill s ON g.skill_id = s.skill_id "
                    "WHERE g.roadmap_id = %s ORDER BY g.target_month ASC",
                    (roadmap['roadmap_id'],)
                )
                roadmap['goals'] = cursor.fetchall()

        conn.close()
        if not roadmap:
            return jsonify({'success': False, 'message': 'Chưa có lộ trình học tập'}), 404
        return jsonify({'success': True, 'data': roadmap})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy thông tin phân tích CV theo user_id
# -------------------------------------------------------
@app.route('/api/cv/<int:user_id>')
def get_cv(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT cv_id, file_path, file_type, "
                "DATE_FORMAT(upload_date, '%%Y-%%m-%%d %%H:%%i:%%s') as upload_date, ats_score, "
                "analysis_result, improvement_suggestions, status "
                "FROM cv WHERE user_id = %s ORDER BY upload_date DESC LIMIT 1",
                (user_id,)
            )
            cv = cursor.fetchone()
        conn.close()
        if not cv:
            return jsonify({'success': False, 'message': 'Chưa có dữ liệu CV'}), 404
        return jsonify({'success': True, 'data': cv})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy kỹ năng hiện tại của người dùng
# -------------------------------------------------------
@app.route('/api/skills/<int:user_id>')
def get_skills(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT s.skill_id, s.skill_name, s.category, us.proficiency_level "
                "FROM userskill us JOIN skill s ON us.skill_id = s.skill_id "
                "WHERE us.user_id = %s",
                (user_id,)
            )
            skills = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': skills})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy thông tin Portfolio theo user_id
# -------------------------------------------------------
@app.route('/api/portfolio/<int:user_id>')
def get_portfolio(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT portfolio_id, slug, title, is_published, view_count, "
                "DATE_FORMAT(created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at, "
                "DATE_FORMAT(updated_at, '%%Y-%%m-%%d %%H:%%i:%%s') as updated_at "
                "FROM portfolio WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            portfolio = cursor.fetchone()
        conn.close()
        if not portfolio:
            return jsonify({'success': False, 'message': 'Chưa có Portfolio'}), 404
        return jsonify({'success': True, 'data': portfolio})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy kinh nghiệm làm việc (Dự án tiêu biểu) theo user_id
# -------------------------------------------------------
@app.route('/api/experience/<int:user_id>')
def get_experience(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if not prof:
                return jsonify({'success': True, 'data': []})
            profile_id = prof['profile_id']
            cursor.execute(
                "SELECT experience_id, company, position, description, "
                "DATE_FORMAT(start_date, '%%Y-%%m-%%d') as start_date, "
                "DATE_FORMAT(end_date, '%%Y-%%m-%%d') as end_date "
                "FROM experience WHERE profile_id = %s ORDER BY start_date DESC",
                (profile_id,)
            )
            exp = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': exp})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy thành tựu giải thưởng (Chứng chỉ) theo user_id
# -------------------------------------------------------
@app.route('/api/certificate/<int:user_id>')
def get_certificates(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if not prof:
                return jsonify({'success': True, 'data': []})
            profile_id = prof['profile_id']
            cursor.execute(
                "SELECT certificate_id, name, organization, "
                "DATE_FORMAT(issue_date, '%%Y-%%m-%%d') as issue_date "
                "FROM certificate WHERE profile_id = %s ORDER BY issue_date DESC",
                (profile_id,)
            )
            certs = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': certs})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy quá trình học tập (Học vấn) theo user_id
# -------------------------------------------------------
@app.route('/api/education/<int:user_id>')
def get_education(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if not prof:
                return jsonify({'success': True, 'data': []})
            profile_id = prof['profile_id']
            cursor.execute(
                "SELECT education_id, school_name, degree, major, "
                "DATE_FORMAT(start_date, '%%Y-%%m-%%d') as start_date, "
                "DATE_FORMAT(end_date, '%%Y-%%m-%%d') as end_date "
                "FROM education WHERE profile_id = %s ORDER BY start_date DESC",
                (profile_id,)
            )
            edu = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': edu})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500



# -------------------------------------------------------
# -------------------------------------------------------
# API: Register Request OTP
# -------------------------------------------------------
@app.route('/api/register/request-otp', methods=['POST'])
def register_request_otp():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email là bắt buộc.'}), 400

    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Kiểm tra email tồn tại chưa
            cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'success': False, 'message': 'Email đã được đăng ký.'}), 400

            # Sinh OTP
            otp_code = str(random.randint(100000, 999999))
            expires_at = datetime.now() + timedelta(minutes=5)

            # Lưu DB
            cursor.execute('''
                INSERT INTO otp_verification (email, otp_code, expires_at, type)
                VALUES (%s, %s, %s, 'register')
            ''', (email, otp_code, expires_at))
            conn.commit()

        conn.close()

        # Gửi mail
        send_otp_email(email, otp_code, 'register')

        return jsonify({'success': True, 'message': 'Mã OTP đã được gửi đến email.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# -------------------------------------------------------
# API: Register Verify OTP
# -------------------------------------------------------
@app.route('/api/register/verify-otp', methods=['POST'])
def register_verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    password = data.get('password')
    full_name = data.get('full_name')
    role = data.get('role', 'user')

    if not all([email, otp, password, full_name]):
        return jsonify({'success': False, 'message': 'Thiếu thông tin bắt buộc.'}), 400

    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Kiểm tra OTP
            cursor.execute('''
                SELECT id, expires_at, is_used FROM otp_verification 
                WHERE email = %s AND otp_code = %s AND type = 'register'
                ORDER BY created_at DESC LIMIT 1
            ''', (email, otp))
            otp_record = cursor.fetchone()

            if not otp_record:
                return jsonify({'success': False, 'message': 'Mã OTP không đúng.'}), 400
            if otp_record['is_used']:
                return jsonify({'success': False, 'message': 'Mã OTP đã được sử dụng.'}), 400
            if otp_record['expires_at'] < datetime.now():
                return jsonify({'success': False, 'message': 'Mã OTP đã hết hạn.'}), 400

            # Đánh dấu OTP đã dùng
            cursor.execute("UPDATE otp_verification SET is_used = 1 WHERE id = %s", (otp_record['id'],))

            # Map role: 'student' -> 'user' để khớp với ENUM trong DB
            db_role = 'admin' if role == 'admin' else 'user'

            # Tạo user (lưu plain text password cho môi trường test)
            cursor.execute('''
                INSERT INTO user (email, password_hash, role, status)
                VALUES (%s, %s, %s, 'active')
            ''', (email, password, db_role))
            user_id = cursor.lastrowid

            # Tạo profile
            cursor.execute('''
                INSERT INTO profile (user_id, full_name)
                VALUES (%s, %s)
            ''', (user_id, full_name))

            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Tạo tài khoản thành công!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# -------------------------------------------------------
# API: Forgot Password Request OTP
# -------------------------------------------------------
@app.route('/api/forgot-password/request-otp', methods=['POST'])
def forgot_password_request_otp():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email là bắt buộc.'}), 400

    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Kiểm tra email tồn tại chưa
            cursor.execute("SELECT user_id FROM user WHERE email = %s", (email,))
            if not cursor.fetchone():
                return jsonify({'success': False, 'message': 'Email không tồn tại trong hệ thống.'}), 400

            # Sinh OTP
            otp_code = str(random.randint(100000, 999999))
            expires_at = datetime.now() + timedelta(minutes=5)

            # Lưu DB
            cursor.execute('''
                INSERT INTO otp_verification (email, otp_code, expires_at, type)
                VALUES (%s, %s, %s, 'forgot_password')
            ''', (email, otp_code, expires_at))
            conn.commit()
        conn.close()

        # Gửi mail
        send_otp_email(email, otp_code, 'forgot_password')

        return jsonify({'success': True, 'message': 'Mã OTP đã được gửi đến email.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# -------------------------------------------------------
# API: Forgot Password Verify OTP
# -------------------------------------------------------
@app.route('/api/forgot-password/verify-otp', methods=['POST'])
def forgot_password_verify_otp():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')

    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT id, expires_at, is_used FROM otp_verification 
                WHERE email = %s AND otp_code = %s AND type = 'forgot_password'
                ORDER BY created_at DESC LIMIT 1
            ''', (email, otp))
            otp_record = cursor.fetchone()

            if not otp_record:
                return jsonify({'success': False, 'message': 'Mã OTP không đúng.'}), 400
            if otp_record['is_used']:
                return jsonify({'success': False, 'message': 'Mã OTP đã được sử dụng.'}), 400
            if otp_record['expires_at'] < datetime.now():
                return jsonify({'success': False, 'message': 'Mã OTP đã hết hạn.'}), 400

        conn.close()
        return jsonify({'success': True, 'message': 'Mã OTP hợp lệ.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# -------------------------------------------------------
# API: Forgot Password Reset
# -------------------------------------------------------
@app.route('/api/forgot-password/reset', methods=['POST'])
def forgot_password_reset():
    data = request.json
    email = data.get('email')
    otp = data.get('otp')
    new_password = data.get('new_password')

    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Kiểm tra lại OTP 1 lần nữa cho an toàn
            cursor.execute('''
                SELECT id, expires_at, is_used FROM otp_verification 
                WHERE email = %s AND otp_code = %s AND type = 'forgot_password'
                ORDER BY created_at DESC LIMIT 1
            ''', (email, otp))
            otp_record = cursor.fetchone()

            if not otp_record or otp_record['is_used'] or otp_record['expires_at'] < datetime.now():
                return jsonify({'success': False, 'message': 'Yêu cầu không hợp lệ hoặc OTP đã hết hạn.'}), 400

            # Cập nhật mật khẩu (plain text cho môi trường test)
            cursor.execute("UPDATE user SET password_hash = %s WHERE email = %s", (new_password, email))

            # Đánh dấu OTP đã dùng
            cursor.execute("UPDATE otp_verification SET is_used = 1 WHERE id = %s", (otp_record['id'],))
            
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đổi mật khẩu thành công.'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"CareerAI Flask Backend running at http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)
