from flask import Blueprint, jsonify, request  # pyrefly: ignore [missing-import]
from utils.db import get_db  # pyrefly: ignore [missing-import]
from utils.ai import call_openai_json  # pyrefly: ignore [missing-import]
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
Bạn là AI cố vấn nghề nghiệp. Dựa vào thông tin sau của người dùng:
- Giới thiệu (Bio): {bio}
- Kỹ năng hiện tại: {', '.join(skills)}
- Mục tiêu nghề nghiệp muốn hướng tới: {target_career if target_career else 'Tự xác định dựa trên profile'}

Hãy tạo ra một lộ trình học tập 3 tháng để giúp họ đạt được mục tiêu trên. YÊU CẦU: Phản hồi hoàn toàn bằng TIẾNG VIỆT CÓ DẤU, riêng TÊN NGHỀ NGHIỆP (title) bắt buộc sử dụng TIẾNG ANH.
Trả về JSON theo format:
{{
  "title": "<Tên nghề nghiệp bằng tiếng Anh. Ví dụ: Data Analyst, Backend Developer>",
  "total_months": 3,
  "goals": [
    {{
      "target_month": 1,
      "skill_name": "<Tên kỹ năng cần học>",
      "courses": [
        {{"name": "<Tên khóa học 1>", "platform": "<Nền tảng>"}},
        {{"name": "<Tên khóa học 2>", "platform": "<Nền tảng>"}}
      ]
    }},
    {{
      "target_month": 2,
      "skill_name": "<Tên kỹ năng cần học>",
      "courses": [
        {{"name": "<Tên khóa học 1>", "platform": "<Nền tảng>"}}
      ]
    }},
    {{
      "target_month": 3,
      "skill_name": "<Tên kỹ năng cần học>",
      "courses": [
        {{"name": "<Tên khóa học 1>", "platform": "<Nền tảng>"}}
      ]
    }}
  ]
}}
"""
        result = call_openai_json(prompt)
        if not result or 'goals' not in result:
            return jsonify({'success': False, 'message': 'Lỗi tạo lộ trình từ AI'}), 500

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
Bạn là AI cố vấn nghề nghiệp. Dựa vào:
- Mục tiêu: {roadmap.get('title')}
- Tiến độ: {roadmap.get('completion_rate')}%
- Kỹ năng đang có: {', '.join(skill_names)}

Hãy đưa ra một phân tích/lời khuyên ngắn (dưới 35 từ) về bước đi tiếp theo. YÊU CẦU: Phản hồi hoàn toàn bằng TIẾNG VIỆT CÓ DẤU.
Trả về JSON format: {{"insight": "<nội dung>"}}
"""
        result = call_openai_json(prompt)
        if result and 'insight' in result:
            return jsonify({'success': True, 'data': result['insight']})
        return jsonify({'success': False, 'message': 'Lỗi gọi AI'}), 500
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


# -------------------------------------------------------
# API: Cập nhật tiến độ của mục tiêu tháng (goal)
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/goal/<int:goal_id>', methods=['PUT'])
def update_goal_progress(goal_id):
    try:
        data = request.json or {}
        
        conn = get_db()
        with conn.cursor() as cursor:
            # Check if we are updating suggested_courses
            if 'suggested_courses' in data:
                courses = data['suggested_courses']
                # Calculate progress based on completed courses
                total = len(courses)
                completed = sum(1 for c in courses if c.get('completed') is True)
                progress_percentage = int((completed / total) * 100) if total > 0 else 0
                
                # Determine goal status
                if progress_percentage >= 100:
                    status = 'completed'
                elif progress_percentage > 0:
                    status = 'in_progress'
                else:
                    status = 'pending'
                    
                cursor.execute(
                    "UPDATE goal SET suggested_courses = %s, progress_percentage = %s, status = %s WHERE goal_id = %s",
                    (json.dumps(courses, ensure_ascii=False), progress_percentage, status, goal_id)
                )
            else:
                progress_percentage = data.get('progress_percentage', 0)
                if progress_percentage >= 100:
                    status = 'completed'
                    progress_percentage = 100
                elif progress_percentage > 0:
                    status = 'in_progress'
                else:
                    status = 'pending'
                    
                cursor.execute(
                    "UPDATE goal SET progress_percentage = %s, status = %s WHERE goal_id = %s",
                    (progress_percentage, status, goal_id)
                )
            
            # 2. Get the roadmap_id for this goal
            cursor.execute("SELECT roadmap_id FROM goal WHERE goal_id = %s", (goal_id,))
            row = cursor.fetchone()
            if not row:
                conn.close()
                return jsonify({'success': False, 'message': 'Không tìm thấy mục tiêu'}), 404
            
            roadmap_id = row['roadmap_id']
            
            # 3. Get all goals for this roadmap to calculate completion rate
            cursor.execute("SELECT progress_percentage FROM goal WHERE roadmap_id = %s", (roadmap_id,))
            goals = cursor.fetchall()
            
            if goals:
                total_progress = sum(g['progress_percentage'] for g in goals)
                completion_rate = int(total_progress / len(goals))
            else:
                completion_rate = 0
                
            roadmap_status = 'completed' if completion_rate == 100 else 'in_progress'
            
            # 4. Update the roadmap completion rate and status
            cursor.execute(
                "UPDATE roadmap SET completion_rate = %s, status = %s WHERE roadmap_id = %s",
                (completion_rate, roadmap_status, roadmap_id)
            )
            conn.commit()
            
        conn.close()
        return jsonify({'success': True, 'message': 'Cập nhật tiến độ thành công', 'completion_rate': completion_rate})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Đồng bộ kỹ năng từ Lộ trình vào Profile/CV
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/sync-skills', methods=['POST'])
def sync_roadmap_skills():
    try:
        data = request.json or {}
        user_id = data.get('user_id')
        skills = data.get('skills', [])
        
        if not user_id:
            return jsonify({'success': False, 'message': 'Thiếu user_id'}), 400
            
        if not skills:
            return jsonify({'success': False, 'message': 'Không có kỹ năng nào để đồng bộ'}), 400
            
        conn = get_db()
        with conn.cursor() as cursor:
            synced_count = 0
            for skill_name in skills:
                skill_name = skill_name.strip()
                if not skill_name:
                    continue
                
                # Check if skill exists in skill table
                cursor.execute("SELECT skill_id FROM skill WHERE skill_name = %s", (skill_name,))
                skill_row = cursor.fetchone()
                
                if skill_row:
                    skill_id = skill_row['skill_id']
                else:
                    # Insert new skill
                    cursor.execute("INSERT INTO skill (skill_name, category) VALUES (%s, 'Other')", (skill_name,))
                    skill_id = cursor.lastrowid
                
                # Check if user already has this skill
                cursor.execute(
                    "SELECT 1 FROM userskill WHERE user_id = %s AND skill_id = %s",
                    (user_id, skill_id)
                )
                if not cursor.fetchone():
                    # Insert user skill mapping
                    cursor.execute(
                        "INSERT INTO userskill (user_id, skill_id, proficiency_level) VALUES (%s, %s, 'Intermediate')",
                        (user_id, skill_id)
                    )
                    synced_count += 1
            conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': f'Đồng bộ thành công! Đã thêm {synced_count} kỹ năng mới vào hồ sơ.'
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
