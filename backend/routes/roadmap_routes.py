from flask import Blueprint, jsonify, request
from utils.db import get_db
from utils.ai import call_openai_json
import json

roadmap_bp = Blueprint('roadmap', __name__)

def init_additional_tables():
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            # Create resource_bookmark table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS resource_bookmark (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    platform VARCHAR(100) NOT NULL,
                    url VARCHAR(512) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    note TEXT DEFAULT NULL,
                    is_bookmarked BOOLEAN NOT NULL DEFAULT 1,
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY `user_title_platform` (user_id, title(128), platform(64))
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            ''')
            conn.commit()
    except Exception as e:
        print("Error initializing additional tables:", e)
    finally:
        conn.close()

# Run initialization immediately on import
init_additional_tables()


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

Hãy tạo ra một lộ trình học tập 3 tháng để giúp họ đạt được mục tiêu trên.
YÊU CẦU: Phản hồi hoàn toàn bằng TIẾNG VIỆT CÓ DẤU, riêng TÊN NGHỀ NGHIỆP (title) bắt buộc sử dụng TIẾNG ANH.

Lộ trình cần thiết kế tăng dần độ khó để người học không bị quá tải:
- Tháng 1: Tập trung vào kiến thức CƠ BẢN (Beginner) của kỹ năng quan trọng nhất.
- Tháng 2: Nâng lên kiến thức TRUNG CẤP (Intermediate) hoặc mở rộng kỹ năng liên quan.
- Tháng 3: Hoàn thiện kiến thức NÂNG CAO (Advanced) hoặc làm dự án thực tế.

Với mỗi tháng, hãy gợi ý các loại tài nguyên học tập đa dạng sau:
1. Khóa học (Courses): Các khóa học lớn chất lượng trên Udemy, Coursera, EdX, Pluralsight, v.v. (ĐÚNG 1 KHÓA duy nhất mỗi tháng để tránh quá tải).
2. Bài viết/Tài liệu (Articles/Ebooks): Các bài blog, bài phân tích chuyên sâu hoặc ebook miễn phí chất lượng cao trên Medium, Dev.to, freeCodeCamp, MDN, W3Schools, v.v. (1 đến 2 bài).
3. Video ngắn (Videos): Các chuỗi bài giảng hoặc video học tập chất lượng trên YouTube (1 đến 2 video).

Trả về JSON theo format:
{{
  "title": "<Tên nghề nghiệp bằng tiếng Anh. Ví dụ: Data Analyst, Backend Developer>",
  "total_months": 3,
  "goals": [
    {{
      "target_month": 1,
      "skill_name": "<Tên kỹ năng cần học ở mức CƠ BẢN>",
      "resources": [
        {{"name": "<Tên khóa học chính>", "platform": "<Udemy/Coursera/etc.>", "type": "course"}},
        {{"name": "<Tên bài viết/ebook bổ trợ>", "platform": "<Medium/Dev.to/etc.>", "type": "article"}},
        {{"name": "<Tên video/bài giảng YouTube>", "platform": "YouTube", "type": "video"}}
      ]
    }},
    {{
      "target_month": 2,
      "skill_name": "<Tên kỹ năng học ở mức TRUNG CẤP>",
      "resources": [
        {{"name": "<Tên khóa học chính>", "platform": "<Udemy/Coursera/etc.>", "type": "course"}},
        {{"name": "<Tên bài viết/ebook bổ trợ>", "platform": "<Medium/Dev.to/etc.>", "type": "article"}},
        {{"name": "<Tên video/bài giảng YouTube>", "platform": "YouTube", "type": "video"}}
      ]
    }},
    {{
      "target_month": 3,
      "skill_name": "<Tên kỹ năng học ở mức NÂNG CAO>",
      "resources": [
        {{"name": "<Tên khóa học chính>", "platform": "<Udemy/Coursera/etc.>", "type": "course"}},
        {{"name": "<Tên bài viết/ebook bổ trợ>", "platform": "<Medium/Dev.to/etc.>", "type": "article"}},
        {{"name": "<Tên video/bài giảng YouTube>", "platform": "YouTube", "type": "video"}}
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

                resources = g.get('resources', [])
                if not resources and 'courses' in g:
                    resources = [{"name": c['name'], "platform": c['platform'], "type": "course"} for c in g['courses']]

                for r in resources:
                    r['completed'] = False

                courses_json = json.dumps(resources, ensure_ascii=False)
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
# API: Cập nhật tiến độ của goal và đồng bộ roadmap
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/goal/<int:goal_id>', methods=['PUT'])
def update_goal_progress(goal_id):
    try:
        data = request.json
        suggested_courses = data.get('suggested_courses', [])

        # Tính toán phần trăm tiến độ
        total = len(suggested_courses)
        completed_count = sum(1 for c in suggested_courses if c.get('completed'))
        progress_percentage = round((completed_count / total) * 100) if total > 0 else 0

        # Xác định status của goal
        if progress_percentage >= 100:
            status = 'completed'
        elif progress_percentage > 0:
            status = 'in_progress'
        else:
            status = 'pending'

        courses_json = json.dumps(suggested_courses, ensure_ascii=False)

        conn = get_db()
        with conn.cursor() as cursor:
            # 1. Cập nhật goal
            cursor.execute(
                "UPDATE goal SET suggested_courses = %s, progress_percentage = %s, status = %s "
                "WHERE goal_id = %s",
                (courses_json, progress_percentage, status, goal_id)
            )

            # 2. Lấy roadmap_id
            cursor.execute("SELECT roadmap_id FROM goal WHERE goal_id = %s", (goal_id,))
            row = cursor.fetchone()
            if row:
                roadmap_id = row['roadmap_id']

                # 3. Tính toán lại completion_rate của roadmap
                cursor.execute("SELECT progress_percentage FROM goal WHERE roadmap_id = %s", (roadmap_id,))
                goals = cursor.fetchall()
                if goals:
                    total_progress = sum(g['progress_percentage'] for g in goals)
                    completion_rate = round(total_progress / len(goals))

                    roadmap_status = 'completed' if completion_rate >= 100 else 'in_progress'

                    cursor.execute(
                        "UPDATE roadmap SET completion_rate = %s, status = %s WHERE roadmap_id = %s",
                        (completion_rate, roadmap_status, roadmap_id)
                    )
            conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'Cập nhật tiến độ thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Tạo lộ trình tự chọn (Custom Roadmap)
# -------------------------------------------------------
@roadmap_bp.route('/roadmap/custom', methods=['POST'])
def generate_custom_roadmap():
    try:
        data = request.json
        user_id = data.get('user_id')
        title = data.get('title', 'Lộ trình tự chọn')
        total_months = data.get('total_months', 3)
        goals = data.get('goals', [])

        if not user_id:
            return jsonify({'success': False, 'message': 'Thieu user_id'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO roadmap (user_id, gap_id, title, total_months, completion_rate, status) "
                "VALUES (%s, %s, %s, %s, 0, 'in_progress')",
                (user_id, None, title, total_months)
            )
            roadmap_id = cursor.lastrowid

            for idx, g in enumerate(goals):
                skill_name = g.get('skill_name', 'Ky nang moi')
                cursor.execute("SELECT skill_id FROM skill WHERE skill_name = %s", (skill_name,))
                s = cursor.fetchone()
                if s:
                    skill_id = s['skill_id']
                else:
                    cursor.execute("INSERT INTO skill (skill_name, category) VALUES (%s, 'Other')", (skill_name,))
                    skill_id = cursor.lastrowid

                courses = g.get('courses', [])
                for c in courses:
                    c['completed'] = False
                    if 'type' not in c:
                        c['type'] = 'course'

                courses_json = json.dumps(courses, ensure_ascii=False)
                goal_status = 'in_progress' if idx == 0 else 'pending'

                cursor.execute(
                    "INSERT INTO goal (roadmap_id, skill_id, target_month, suggested_courses, status, progress_percentage) "
                    "VALUES (%s, %s, %s, %s, %s, 0)",
                    (roadmap_id, skill_id, g.get('target_month', idx + 1), courses_json, goal_status)
                )
            conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'Đã tạo lộ trình tự chọn thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# =======================================================
# BOOKMARKS & NOTES APIs
# =======================================================

@roadmap_bp.route('/bookmarks/<int:user_id>', methods=['GET'])
def get_bookmarks(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, title, platform, url, type, note, is_bookmarked, "
                "DATE_FORMAT(created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at "
                "FROM resource_bookmark WHERE user_id = %s "
                "AND (is_bookmarked = 1 OR (note IS NOT NULL AND TRIM(note) != ''))",
                (user_id,)
            )
            bookmarks = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': bookmarks})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@roadmap_bp.route('/bookmarks/toggle', methods=['POST'])
def toggle_bookmark():
    try:
        data = request.json
        user_id = data.get('user_id')
        title = data.get('title')
        platform = data.get('platform')
        url = data.get('url', '')
        resource_type = data.get('type', 'course')

        if not user_id or not title or not platform:
            return jsonify({'success': False, 'message': 'Thiếu tham số bắt buộc'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, is_bookmarked FROM resource_bookmark WHERE user_id = %s AND title = %s AND platform = %s",
                (user_id, title, platform)
            )
            row = cursor.fetchone()
            if row:
                new_state = 0 if row['is_bookmarked'] else 1
                cursor.execute(
                    "UPDATE resource_bookmark SET is_bookmarked = %s WHERE id = %s",
                    (new_state, row['id'])
                )
                is_bookmarked = bool(new_state)
            else:
                cursor.execute(
                    "INSERT INTO resource_bookmark (user_id, title, platform, url, type, is_bookmarked) "
                    "VALUES (%s, %s, %s, %s, %s, 1)",
                    (user_id, title, platform, url, resource_type)
                )
                is_bookmarked = True
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'is_bookmarked': is_bookmarked, 'message': 'Đã cập nhật trạng thái bookmark'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@roadmap_bp.route('/bookmarks/note', methods=['POST'])
def save_note():
    try:
        data = request.json
        user_id = data.get('user_id')
        title = data.get('title')
        platform = data.get('platform')
        url = data.get('url', '')
        resource_type = data.get('type', 'course')
        note = data.get('note', '')

        if not user_id or not title or not platform:
            return jsonify({'success': False, 'message': 'Thiếu tham số bắt buộc'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id FROM resource_bookmark WHERE user_id = %s AND title = %s AND platform = %s",
                (user_id, title, platform)
            )
            row = cursor.fetchone()
            if row:
                cursor.execute(
                    "UPDATE resource_bookmark SET note = %s WHERE id = %s",
                    (note, row['id'])
                )
            else:
                cursor.execute(
                    "INSERT INTO resource_bookmark (user_id, title, platform, url, type, note, is_bookmarked) "
                    "VALUES (%s, %s, %s, %s, %s, %s, 0)",
                    (user_id, title, platform, url, resource_type, note)
                )
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã lưu ghi chú thành công'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# =======================================================
# DYNAMIC QUIZ & SKILL ASSESSMENT APIs
# =======================================================

@roadmap_bp.route('/quiz/generate', methods=['POST'])
def generate_quiz():
    try:
        data = request.json
        skill_name = data.get('skill_name')
        target_month = data.get('target_month', 1)
        if not skill_name:
            return jsonify({'success': False, 'message': 'Thiếu skill_name'}), 400

        level_map = {1: "CƠ BẢN (Beginner)", 2: "TRUNG CẤP (Intermediate)", 3: "NÂNG CAO (Advanced)"}
        level_str = level_map.get(target_month, "CƠ BẢN (Beginner)")

        prompt = f"""
Bạn là AI cố vấn học tập chuyên nghiệp. Hãy tạo ra một bài quiz trắc nghiệm ngắn gồm 5 câu hỏi để đánh giá kiến thức về kỹ năng: "{skill_name}" ở cấp độ {level_str}.
Yêu cầu các câu hỏi phải thực tế, bám sát các kiến thức quan trọng của kỹ năng này.
Mỗi câu hỏi phải có ĐÚNG 4 lựa chọn trả lời và chỉ có duy nhất 1 đáp án đúng.
Yêu cầu phản hồi hoàn toàn bằng TIẾNG VIỆT CÓ DẤU, và trả về định dạng JSON thuần túy như sau:
{{
  "skill_name": "{skill_name}",
  "questions": [
    {{
      "question": "<Nội dung câu hỏi hỏi gì?>",
      "options": [
        "<Lựa chọn 0>",
        "<Lựa chọn 1>",
        "<Lựa chọn 2>",
        "<Lựa chọn 3>"
      ],
      "correct_index": <Index của lựa chọn đúng: 0, 1, 2 hoặc 3>,
      "explanation": "<Giải thích ngắn gọn tại sao đáp án này là đúng và các lựa chọn khác sai>"
    }},
    ...
  ]
}}
"""
        result = call_openai_json(prompt)
        if not result or 'questions' not in result:
            return jsonify({'success': False, 'message': 'Lỗi sinh quiz bằng AI'}), 500
        
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@roadmap_bp.route('/quiz/unlock-skill', methods=['POST'])
def unlock_skill():
    try:
        data = request.json
        user_id = data.get('user_id')
        skill_name = data.get('skill_name')
        target_month = data.get('target_month', 1)
        score_pct = data.get('score_pct', 0)

        if not user_id or not skill_name:
            return jsonify({'success': False, 'message': 'Thiếu user_id hoặc skill_name'}), 400

        if score_pct < 80:
            return jsonify({'success': False, 'message': 'Bạn chưa đạt đủ 80% số điểm để mở khóa kỹ năng này.'}), 400

        level_map = {1: "beginner", 2: "intermediate", 3: "advanced"}
        proficiency_level = level_map.get(target_month, "intermediate")

        conn = get_db()
        with conn.cursor() as cursor:
            # 1. Tìm hoặc thêm skill vào bảng skill
            cursor.execute("SELECT skill_id FROM skill WHERE skill_name = %s", (skill_name,))
            s_row = cursor.fetchone()
            if s_row:
                skill_id = s_row['skill_id']
            else:
                cursor.execute("INSERT INTO skill (skill_name, category) VALUES (%s, 'Other')", (skill_name,))
                skill_id = cursor.lastrowid

            # 2. Thêm hoặc cập nhật bảng userskill
            cursor.execute(
                "INSERT INTO userskill (user_id, skill_id, proficiency_level) VALUES (%s, %s, %s) "
                "ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level)",
                (user_id, skill_id, proficiency_level)
            )

            # 3. Đồng thời cập nhật trạng thái goal của tháng đó thành 'completed'
            cursor.execute(
                "SELECT g.goal_id FROM goal g JOIN roadmap r ON g.roadmap_id = r.roadmap_id "
                "WHERE r.user_id = %s AND g.skill_id = %s AND g.target_month = %s",
                (user_id, skill_id, target_month)
            )
            g_row = cursor.fetchone()
            if g_row:
                goal_id = g_row['goal_id']
                cursor.execute(
                    "UPDATE goal SET status = 'completed', progress_percentage = 100 "
                    "WHERE goal_id = %s",
                    (goal_id,)
                )
                
                # Đồng bộ tính toán lại completion_rate của roadmap
                cursor.execute("SELECT roadmap_id FROM goal WHERE goal_id = %s", (goal_id,))
                r_row = cursor.fetchone()
                if r_row:
                    roadmap_id = r_row['roadmap_id']
                    cursor.execute("SELECT progress_percentage FROM goal WHERE roadmap_id = %s", (roadmap_id,))
                    all_goals = cursor.fetchall()
                    if all_goals:
                        total_progress = sum(item['progress_percentage'] for item in all_goals)
                        completion_rate = round(total_progress / len(all_goals))
                        roadmap_status = 'completed' if completion_rate >= 100 else 'in_progress'
                        cursor.execute(
                            "UPDATE roadmap SET completion_rate = %s, status = %s WHERE roadmap_id = %s",
                            (completion_rate, roadmap_status, roadmap_id)
                        )

            conn.commit()
        conn.close()
        return jsonify({
            'success': True,
            'message': f"Chúc mừng! Kỹ năng '{skill_name}' đã được mở khóa với cấp độ '{proficiency_level}'."
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# =======================================================
# CV / PROFILE SKILLS SYNC API
# =======================================================

@roadmap_bp.route('/roadmap/sync-skills', methods=['POST'])
def sync_skills():
    try:
        data = request.json
        user_id = data.get('user_id')
        skills = data.get('skills', [])

        if not user_id:
            return jsonify({'success': False, 'message': 'Thiếu user_id'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            for s_name in skills:
                if not s_name:
                    continue
                # 1. Tìm hoặc thêm skill
                cursor.execute("SELECT skill_id FROM skill WHERE skill_name = %s", (s_name,))
                row = cursor.fetchone()
                if row:
                    skill_id = row['skill_id']
                else:
                    cursor.execute("INSERT INTO skill (skill_name, category) VALUES (%s, 'Other')", (s_name,))
                    skill_id = cursor.lastrowid

                # 2. Thêm vào userskill với trình độ mặc định 'intermediate' nếu chưa tồn tại
                cursor.execute(
                    "INSERT INTO userskill (user_id, skill_id, proficiency_level) "
                    "VALUES (%s, %s, 'intermediate') "
                    "ON DUPLICATE KEY UPDATE proficiency_level = IF(proficiency_level IS NULL OR proficiency_level = '', 'intermediate', proficiency_level)",
                    (user_id, skill_id)
                )
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đồng bộ kỹ năng vào hồ sơ thành công!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

