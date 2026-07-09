from flask import Blueprint, jsonify
from utils.db import get_db

roadmap_bp = Blueprint('roadmap', __name__)

# -------------------------------------------------------
# API: Lấy lộ trình học tập theo user_id
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/<int:user_id>')
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
