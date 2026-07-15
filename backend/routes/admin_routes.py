from flask import Blueprint, jsonify, request
from utils.db import get_db
import json

admin_bp = Blueprint('admin', __name__)

# Middleware check is not built-in, so we'll check role from request body for simplicity
# In a real app with JWT, we'd extract the role from the token.
def check_admin(request):
    data = request.get_json(silent=True) or request.args
    # Just for simulation, we'll check 'request_user_id' and query its role
    # Wait, the simplest way is just assume the frontend will send user_id, 
    # but let's query the DB to be sure they are admin.
    user_id = data.get('admin_user_id') if isinstance(data, dict) else None
    if not user_id:
        user_id = request.headers.get('X-Admin-User-Id')
    
    if not user_id:
        return False
    
    conn = get_db()
    with conn.cursor() as cursor:
        cursor.execute("SELECT role FROM user WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        if user and user['role'] == 'admin':
            conn.close()
            return True
    conn.close()
    return False

@admin_bp.route('/admin/stats', methods=['GET'])
def get_stats():
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Count users
            cursor.execute("SELECT COUNT(*) as total_users FROM user")
            total_users = cursor.fetchone()['total_users']
            
            cursor.execute("SELECT COUNT(*) as active_users FROM user WHERE status = 'active'")
            active_users = cursor.fetchone()['active_users']
            
            cursor.execute("SELECT COUNT(*) as total_roadmaps FROM roadmap")
            total_roadmaps = cursor.fetchone()['total_roadmaps']
            
            # Count generated portfolios
            # We don't have a portfolio table, but we can count users with experience/skills
            cursor.execute("SELECT COUNT(DISTINCT user_id) as portfolio_count FROM userskill")
            portfolio_count = cursor.fetchone()['portfolio_count']
            
        conn.close()
        return jsonify({
            'success': True,
            'data': {
                'total_users': total_users,
                'active_users': active_users,
                'total_roadmaps': total_roadmaps,
                'portfolio_count': portfolio_count
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/admin/users', methods=['GET'])
def get_users():
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute('''
                SELECT u.user_id, u.email, u.role, u.status, 
                       DATE_FORMAT(u.created_at, '%Y-%m-%d %H:%i:%s') as created_at,
                       DATE_FORMAT(u.last_login, '%Y-%m-%d %H:%i:%s') as last_login,
                       p.full_name
                FROM user u
                LEFT JOIN profile p ON u.user_id = p.user_id
                ORDER BY u.created_at DESC
            ''')
            users = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': users})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
    data = request.json
    role = data.get('role')
    status = data.get('status')
    full_name = data.get('full_name')
    
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            if role or status:
                query_parts = []
                params = []
                if role:
                    query_parts.append("role = %s")
                    params.append(role)
                if status:
                    query_parts.append("status = %s")
                    params.append(status)
                
                params.append(user_id)
                query = f"UPDATE user SET {', '.join(query_parts)} WHERE user_id = %s"
                cursor.execute(query, params)
                
            if full_name:
                cursor.execute("UPDATE profile SET full_name = %s WHERE user_id = %s", (full_name, user_id))
                
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Cập nhật thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@admin_bp.route('/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    if not check_admin(request):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            # Delete related data first (roadmap, goals, user_session, etc)
            cursor.execute("DELETE FROM user_session WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM resource_bookmark WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM userskill WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM experience WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM certificate WHERE user_id = %s", (user_id,))
            
            # Delete roadmaps (this cascade needs manual deletion if FK doesn't have CASCADE)
            cursor.execute("SELECT roadmap_id FROM roadmap WHERE user_id = %s", (user_id,))
            roadmaps = cursor.fetchall()
            for r in roadmaps:
                cursor.execute("DELETE FROM goal WHERE roadmap_id = %s", (r['roadmap_id'],))
            cursor.execute("DELETE FROM roadmap WHERE user_id = %s", (user_id,))
            
            cursor.execute("DELETE FROM profile WHERE user_id = %s", (user_id,))
            cursor.execute("DELETE FROM user WHERE user_id = %s", (user_id,))
            
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Xóa người dùng thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
