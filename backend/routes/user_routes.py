import os
import time
from flask import Blueprint, request, jsonify, current_app
from utils.db import get_db

user_bp = Blueprint('user', __name__)

# -------------------------------------------------------
# API: Lấy thông tin người dùng theo user_id
# -------------------------------------------------------
@user_bp.route('/user/<int:user_id>', methods=['GET'])
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
# API: Cập nhật thông tin profile người dùng
# -------------------------------------------------------
@user_bp.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        body = request.get_json()

        conn = get_db()
        with conn.cursor() as cursor:
            # Lấy profile hiện tại
            cursor.execute(
                "SELECT p.full_name, p.phone, p.bio FROM profile p WHERE p.user_id = %s",
                (user_id,)
            )
            current = cursor.fetchone() or {}

            # Chỉ cập nhật field nào được gửi lên
            full_name = body.get('full_name', current.get('full_name', '')).strip() if 'full_name' in body else current.get('full_name', '')
            phone = body.get('phone', current.get('phone', '')).strip() if 'phone' in body else current.get('phone', '')
            bio = body.get('bio', current.get('bio', '')).strip() if 'bio' in body else current.get('bio', '')

            if not full_name:
                return jsonify({'success': False, 'message': 'Tên hiển thị không được để trống'}), 400

            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if prof:
                cursor.execute(
                    "UPDATE profile SET full_name = %s, phone = %s, bio = %s WHERE user_id = %s",
                    (full_name, phone or None, bio or None, user_id)
                )
            else:
                cursor.execute(
                    "INSERT INTO profile (user_id, full_name, phone, bio) VALUES (%s, %s, %s, %s)",
                    (user_id, full_name, phone or None, bio or None)
                )
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cập nhật thông tin thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Đổi mật khẩu người dùng
# -------------------------------------------------------
@user_bp.route('/user/<int:user_id>/password', methods=['PUT'])
def change_password(user_id):
    try:
        body = request.get_json()
        current_pw = (body.get('current_password') or '').strip()
        new_pw     = (body.get('new_password') or '').strip()

        if not current_pw or not new_pw:
            return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ thông tin'}), 400
        if len(new_pw) < 6:
            return jsonify({'success': False, 'message': 'Mật khẩu mới phải có ít nhất 6 ký tự'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT password_hash FROM user WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                return jsonify({'success': False, 'message': 'Người dùng không tồn tại'}), 404
            if user['password_hash'] != current_pw:
                return jsonify({'success': False, 'message': 'Mật khẩu hiện tại không đúng'}), 400
            cursor.execute("UPDATE user SET password_hash = %s WHERE user_id = %s", (new_pw, user_id))
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đổi mật khẩu thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Tải lên ảnh đại diện
# -------------------------------------------------------
@user_bp.route('/user/<int:user_id>/avatar', methods=['POST'])
def upload_avatar(user_id):
    try:
        if 'avatar' not in request.files:
            return jsonify({'success': False, 'message': 'Không tìm thấy file ảnh'}), 400
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Chưa chọn file'}), 400
        
        # Save file
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'png'
        filename = f"avatar_{user_id}_{int(time.time())}.{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        avatar_url = f"http://localhost:5000/static/uploads/{filename}"
        
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if prof:
                cursor.execute("UPDATE profile SET avatar_url = %s WHERE user_id = %s", (avatar_url, user_id))
            else:
                cursor.execute("INSERT INTO profile (user_id, avatar_url) VALUES (%s, %s)", (user_id, avatar_url))
            conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Tải ảnh lên thành công', 'avatar_url': avatar_url})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy các phiên đăng nhập
# -------------------------------------------------------
@user_bp.route('/user/<int:user_id>/sessions', methods=['GET'])
def get_sessions(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, device_info, location, ip_address, is_current, "
                "DATE_FORMAT(last_active, '%%d/%%m/%%Y %%H:%%i') as last_active "
                "FROM user_session WHERE user_id = %s ORDER BY last_active DESC",
                (user_id,)
            )
            sessions = cursor.fetchall()
            
            # Simple heuristic to mark the current session
            user_agent = request.headers.get('User-Agent') or ''
            for s in sessions:
                s['is_current'] = (s['device_info'] == user_agent)
                
        conn.close()
        return jsonify({'success': True, 'data': sessions})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Thu hồi (đăng xuất) các phiên đăng nhập khác
# -------------------------------------------------------
@user_bp.route('/user/<int:user_id>/sessions', methods=['DELETE'])
def clear_other_sessions(user_id):
    try:
        user_agent = request.headers.get('User-Agent') or ''
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "DELETE FROM user_session WHERE user_id = %s AND device_info != %s",
                (user_id, user_agent)
            )
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã đăng xuất các thiết bị khác'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
