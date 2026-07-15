from flask import Blueprint, jsonify, request
from utils.db import get_db

admin_bp = Blueprint('admin', __name__)


def check_admin(req):
    """Verify the requesting user is an admin via X-Admin-User-Id header."""
    user_id = req.headers.get('X-Admin-User-Id')
    if not user_id:
        data = req.get_json(silent=True)
        if isinstance(data, dict):
            user_id = data.get('admin_user_id')
    if not user_id:
        return False
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT role FROM user WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            return bool(user and user['role'] == 'admin')
    finally:
        conn.close()


# ─── Stats ────────────────────────────────────────────────────────────────────
@admin_bp.route('/admin/stats', methods=['GET'])
def get_stats():
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) as v FROM user")
            total_users = cursor.fetchone()['v']
            cursor.execute("SELECT COUNT(*) as v FROM user WHERE status = 'active'")
            active_users = cursor.fetchone()['v']
            cursor.execute("SELECT COUNT(*) as v FROM roadmap")
            total_roadmaps = cursor.fetchone()['v']
            cursor.execute("SELECT COUNT(*) as v FROM cv")
            total_cvs = cursor.fetchone()['v']
            cursor.execute("SELECT COUNT(*) as v FROM portfolio WHERE is_published = 1")
            published_portfolios = cursor.fetchone()['v']
        conn.close()
        return jsonify({'success': True, 'data': {
            'total_users': total_users,
            'active_users': active_users,
            'total_roadmaps': total_roadmaps,
            'total_cvs': total_cvs,
            'published_portfolios': published_portfolios,
        }})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─── Users list ───────────────────────────────────────────────────────────────
@admin_bp.route('/admin/users', methods=['GET'])
def get_users():
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT u.user_id, u.email, u.role, u.status, u.password_hash,
                       DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                       DATE_FORMAT(u.last_login, '%Y-%m-%d %H:%i:%s') as last_login,
                       p.full_name,
                       DATE_FORMAT(p.dob, '%Y-%m-%d') as dob,
                       p.phone, p.bio,
                       EXISTS(SELECT 1 FROM roadmap r WHERE r.user_id = u.user_id) AS has_roadmap,
                       EXISTS(SELECT 1 FROM cv c WHERE c.user_id = u.user_id) AS has_cv,
                       EXISTS(SELECT 1 FROM portfolio po WHERE po.user_id = u.user_id AND po.is_published = 1) AS has_published_portfolio
                FROM user u
                LEFT JOIN profile p ON u.user_id = p.user_id
                ORDER BY u.created_at DESC
            ''')
            users = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': users})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─── Update user ──────────────────────────────────────────────────────────────
@admin_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403

    data = request.get_json(silent=True) or {}
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # --- Update user table ---
            user_fields = {}
            if 'role' in data and data['role']:
                user_fields['role'] = data['role']
            if 'status' in data and data['status']:
                user_fields['status'] = data['status']
            if 'password' in data and data['password'] and data['password'].strip():
                user_fields['password_hash'] = data['password'].strip()

            if user_fields:
                set_clause = ', '.join(f"{k} = %s" for k in user_fields)
                params = list(user_fields.values()) + [user_id]
                cursor.execute(f"UPDATE user SET {set_clause} WHERE user_id = %s", params)

            # --- Update profile table ---
            profile_fields = {}
            if 'full_name' in data:
                profile_fields['full_name'] = data['full_name'] or None
            if 'phone' in data:
                profile_fields['phone'] = data['phone'] or None
            if 'bio' in data:
                profile_fields['bio'] = data['bio'] or None
            if 'dob' in data:
                dob_val = (data['dob'] or '').strip()
                profile_fields['dob'] = dob_val if dob_val else None

            if profile_fields:
                cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
                existing = cursor.fetchone()
                if existing:
                    set_clause = ', '.join(f"{k} = %s" for k in profile_fields)
                    params = list(profile_fields.values()) + [user_id]
                    cursor.execute(f"UPDATE profile SET {set_clause} WHERE user_id = %s", params)
                else:
                    profile_fields['user_id'] = user_id
                    cols = ', '.join(profile_fields.keys())
                    placeholders = ', '.join(['%s'] * len(profile_fields))
                    cursor.execute(
                        f"INSERT INTO profile ({cols}) VALUES ({placeholders})",
                        list(profile_fields.values())
                    )

            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cap nhat thanh cong'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─── User full details (profile + CV + portfolio + roadmap + activity) ────────
@admin_bp.route('/admin/users/<int:user_id>/details', methods=['GET'])
def get_user_details(user_id):
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # 1. Profile
            cursor.execute('''
                SELECT u.user_id, u.email, u.role, u.status, u.password_hash,
                       DATE_FORMAT(u.created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at,
                       DATE_FORMAT(u.last_login, '%%Y-%%m-%%d %%H:%%i:%%s') as last_login,
                       p.full_name, DATE_FORMAT(p.dob, '%%Y-%%m-%%d') as dob,
                       p.phone, p.bio, p.avatar_url
                FROM user u
                LEFT JOIN profile p ON u.user_id = p.user_id
                WHERE u.user_id = %s
            ''', (user_id,))
            user_info = cursor.fetchone()
            if not user_info:
                conn.close()
                return jsonify({'success': False, 'message': 'User not found'}), 404

            # 2. CVs
            cursor.execute('''
                SELECT cv_id, file_path, file_type, ats_score, status,
                       DATE_FORMAT(upload_date, '%%Y-%%m-%%d %%H:%%i') as upload_date
                FROM cv WHERE user_id = %s ORDER BY upload_date DESC
            ''', (user_id,))
            user_info['cvs'] = cursor.fetchall()

            # 3. Portfolios
            cursor.execute('''
                SELECT portfolio_id, title, slug, is_published, view_count,
                       DATE_FORMAT(created_at, '%%Y-%%m-%%d') as created_at
                FROM portfolio WHERE user_id = %s ORDER BY created_at DESC
            ''', (user_id,))
            user_info['portfolios'] = cursor.fetchall()

            # 4. Roadmaps
            cursor.execute('''
                SELECT roadmap_id, title, total_months, completion_rate, status,
                       DATE_FORMAT(created_at, '%%Y-%%m-%%d') as created_at
                FROM roadmap WHERE user_id = %s ORDER BY created_at DESC
            ''', (user_id,))
            user_info['roadmaps'] = cursor.fetchall()

            # 5. Skills
            cursor.execute('''
                SELECT s.skill_name, us.proficiency_level
                FROM userskill us
                JOIN skill s ON us.skill_id = s.skill_id
                WHERE us.user_id = %s
            ''', (user_id,))
            user_info['skills'] = cursor.fetchall()

            # 6. Activity log (sessions)
            cursor.execute('''
                SELECT device_info, location, ip_address, is_current,
                       DATE_FORMAT(last_active, '%%Y-%%m-%%d %%H:%%i:%%s') as last_active
                FROM user_session
                WHERE user_id = %s ORDER BY last_active DESC LIMIT 20
            ''', (user_id,))
            user_info['sessions'] = cursor.fetchall()

        conn.close()
        return jsonify({'success': True, 'data': user_info})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ─── Delete user ──────────────────────────────────────────────────────────────
@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM user_session WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM resource_bookmark WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM userskill WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM experience WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM certificate WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM cv WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM portfolio WHERE user_id = %s", (user_id,))
            cursor.execute("SELECT roadmap_id FROM roadmap WHERE user_id = %s", (user_id,))
            for r in cursor.fetchall():
                cursor.execute("DELETE FROM goal WHERE roadmap_id = %s", (r['roadmap_id'],))
            cursor.execute("DELETE FROM roadmap WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM profile WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM user WHERE user_id = %s", (user_id,))
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Xoa nguoi dung thanh cong'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
