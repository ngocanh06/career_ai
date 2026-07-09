import random
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request
from utils.db import get_db
from utils.email import send_otp_email

auth_bp = Blueprint('auth', __name__)

# -------------------------------------------------------
# API: Đăng nhập bằng email + password
# -------------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
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

            ip_addr = request.remote_addr or 'Unknown'
            user_agent = request.headers.get('User-Agent') or 'Unknown Device'

            if not user:
                conn.close()
                return jsonify({'success': False, 'message': 'Email không tồn tại'}), 401

            if user['password_hash'] != password:
                conn.close()
                return jsonify({'success': False, 'message': 'Mật khẩu không đúng'}), 401

            if user['status'] != 'active':
                conn.close()
                return jsonify({'success': False, 'message': 'Tài khoản đã bị khóa'}), 403

            # Cập nhật hoặc thêm user_session
            cursor.execute("SELECT id FROM user_session WHERE user_id=%s AND device_info=%s LIMIT 1", (user['user_id'], user_agent))
            session_row = cursor.fetchone()
            if session_row:
                cursor.execute("UPDATE user_session SET last_active=NOW(), ip_address=%s, location='Hà Nội, VN' WHERE id=%s", (ip_addr, session_row['id']))
            else:
                cursor.execute("INSERT INTO user_session (user_id, device_info, location, ip_address, is_current) VALUES (%s, %s, 'Hà Nội, VN', %s, 1)", (user['user_id'], user_agent, ip_addr))

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
# API: Register Request OTP
# -------------------------------------------------------
@auth_bp.route('/register/request-otp', methods=['POST'])
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
@auth_bp.route('/register/verify-otp', methods=['POST'])
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
@auth_bp.route('/forgot-password/request-otp', methods=['POST'])
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
@auth_bp.route('/forgot-password/verify-otp', methods=['POST'])
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
@auth_bp.route('/forgot-password/reset', methods=['POST'])
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
