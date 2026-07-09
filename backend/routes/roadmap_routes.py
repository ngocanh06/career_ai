from flask import Blueprint, jsonify, request
from utils.db import get_db
from utils.ai import call_openai_json
import json

roadmap_bp = Blueprint('roadmap', __name__)

# -------------------------------------------------------
# API: Lấy lộ trình học tập theo user_id
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/<int:user_id>')
def get_roadmap(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT r.roadmap_id, r.title, r.total_months, r.completion_rate, r.status, "
                "DATE_FORMAT(r.created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at "
                "FROM roadmap r WHERE r.user_id = %s ORDER BY r.created_at DESC LIMIT 1",
                (user_id,)
            )
            roadmap = cursor.fetchone()

            if roadmap:
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
            return jsonify({'success': False, 'message': 'Chua co lo trinh hoc tap'}), 404
        return jsonify({'success': True, 'data': roadmap})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Tạo lộ trình bằng AI
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/generate', methods=['POST'])
def generate_roadmap():
    try:
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'message': 'Thieu user_id'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT bio FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            bio = prof['bio'] if prof else ''

            cursor.execute(
                "SELECT s.skill_name FROM userskill us JOIN skill s ON us.skill_id = s.skill_id WHERE us.user_id = %s",
                (user_id,)
            )
            skills = [row['skill_name'] for row in cursor.fetchall()]
        conn.close()

        target_career = data.get('target_career', '')

        prompt = f"""
Ban la AI co van nghe nghiep. Dua vao thong tin sau cua nguoi dung:
- Gioi thieu (Bio): {bio}
- Ky nang hien tai: {', '.join(skills)}
- Muc tieu nghe nghiep muon huong toi: {target_career if target_career else 'Tu xac dinh dua tren profile'}

Hay tao ra mot lo trinh hoc tap 3 thang de giup ho dat duoc muc tieu tren.
Tra ve JSON theo format:
{{
  "title": "<Muc tieu nghe nghiep. Vi du: Chuyen gia Phan tich Du lieu>",
  "total_months": 3,
  "goals": [
    {{
      "target_month": 1,
      "skill_name": "<Ten ky nang can hoc>",
      "courses": [
        {{"name": "<Ten khoa hoc 1>", "platform": "<Nen tang>"}},
        {{"name": "<Ten khoa hoc 2>", "platform": "<Nen tang>"}}
      ]
    }},
    {{
      "target_month": 2,
      "skill_name": "<Ten ky nang can hoc>",
      "courses": [
        {{"name": "<Ten khoa hoc 1>", "platform": "<Nen tang>"}}
      ]
    }},
    {{
      "target_month": 3,
      "skill_name": "<Ten ky nang can hoc>",
      "courses": [
        {{"name": "<Ten khoa hoc 1>", "platform": "<Nen tang>"}}
      ]
    }}
  ]
}}
"""
        result = call_openai_json(prompt)
        if not result or 'goals' not in result:
            return jsonify({'success': False, 'message': 'Loi tao lo trinh tu AI'}), 500

        # Lưu DB - roadmap.status enum: 'not_started','in_progress','completed'
        # goal.status enum: 'pending','in_progress','completed'
        # gap_id NOT NULL => dùng 0 tạm
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO roadmap (user_id, gap_id, title, total_months, completion_rate, status) "
                "VALUES (%s, %s, %s, %s, 0, 'in_progress')",
                (user_id, None, result.get('title', 'Lo trinh phat trien'), result.get('total_months', 3))
            )
            roadmap_id = cursor.lastrowid

            for idx, g in enumerate(result['goals']):
                skill_name = g.get('skill_name', 'Ky nang moi')
                cursor.execute("SELECT skill_id FROM skill WHERE skill_name = %s", (skill_name,))
                s = cursor.fetchone()
                if s:
                    skill_id = s['skill_id']
                else:
                    cursor.execute("INSERT INTO skill (skill_name, category) VALUES (%s, 'Other')", (skill_name,))
                    skill_id = cursor.lastrowid

                courses_json = json.dumps(g.get('courses', []), ensure_ascii=False)
                goal_status = 'in_progress' if idx == 0 else 'pending'

                cursor.execute(
                    "INSERT INTO goal (roadmap_id, skill_id, target_month, suggested_courses, status, progress_percentage) "
                    "VALUES (%s, %s, %s, %s, %s, 0)",
                    (roadmap_id, skill_id, g.get('target_month', idx + 1), courses_json, goal_status)
                )
            conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'Da tao lo trinh AI'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: AI Insight cho lộ trình
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/insight', methods=['POST'])
def generate_roadmap_insight():
    try:
        data = request.json
        roadmap = data.get('roadmap', {})
        skills = data.get('skills', [])

        skill_names = []
        for s in skills:
            if isinstance(s, dict):
                skill_names.append(s.get('skill_name') or s.get('name', ''))
            else:
                skill_names.append(str(s))

        prompt = f"""
Ban la AI co van nghe nghiep. Dua vao:
- Muc tieu: {roadmap.get('title')}
- Tien do: {roadmap.get('completion_rate')}%
- Ky nang dang co: {', '.join(skill_names)}

Hay dua ra mot phan tich/loi khuyen ngan (duoi 35 tu) ve buoc di tiep theo.
Tra ve JSON format: {{"insight": "<noi dung>"}}
"""
        result = call_openai_json(prompt)
        if result and 'insight' in result:
            return jsonify({'success': True, 'data': result['insight']})
        return jsonify({'success': False, 'message': 'AI error'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# -------------------------------------------------------
# API: Xóa lộ trình
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/<int:roadmap_id>', methods=['DELETE'])
def delete_roadmap(roadmap_id):
    try:
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'message': 'Thieu user_id'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            # Xóa các goals liên quan
            cursor.execute("DELETE FROM goal WHERE roadmap_id = %s", (roadmap_id,))
            # Xóa roadmap
            cursor.execute("DELETE FROM roadmap WHERE roadmap_id = %s AND user_id = %s", (roadmap_id, user_id))
            conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'Da xoa lo trinh'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
