from flask import Blueprint, jsonify
from utils.db import get_db

career_bp = Blueprint('career', __name__)

# -------------------------------------------------------
# API: Lấy danh sách nghề nghiệp đề xuất theo user_id
# -------------------------------------------------------
@career_bp.route('/career/<int:user_id>')
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

from flask import request
from utils.ai import call_openai_json, call_openai_text

@career_bp.route('/career/generate', methods=['POST'])
def generate_careers():
    try:
        data = request.json
        user_id = data.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'message': 'Thiếu user_id'}), 400

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT bio FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            bio = prof['bio'] if prof else ''
            
            cursor.execute("SELECT s.skill_name FROM userskill us JOIN skill s ON us.skill_id = s.skill_id WHERE us.user_id = %s", (user_id,))
            skills = [row['skill_name'] for row in cursor.fetchall()]
        conn.close()

        prompt = f"""
Bạn là AI phân tích nghề nghiệp. Người dùng có hồ sơ: {bio}. Kỹ năng: {', '.join(skills)}.
Hãy đề xuất 3 nghề nghiệp phù hợp nhất. Tên nghề nghiệp (job_title) hãy sử dụng tiếng Anh (ví dụ: Data Analyst, Backend Developer).
Trả về JSON format:
{{
  "careers": [
    {{
      "job_title": "<Tên nghề bằng tiếng Anh>",
      "match_percentage": <Số nguyên 50-100>,
      "job_description": "<Mô tả ngắn gọn bằng tiếng Việt>"
    }}
  ]
}}
"""
        result = call_openai_json(prompt)
        if not result or 'careers' not in result:
            return jsonify({'success': False, 'message': 'Lỗi AI'}), 500

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM career WHERE user_id = %s", (user_id,))
            for c in result['careers']:
                cursor.execute(
                    "INSERT INTO career (user_id, job_title, match_percentage, job_description, source) VALUES (%s, %s, %s, %s, 'ai')",
                    (user_id, c['job_title'], c['match_percentage'], c['job_description'])
                )
            conn.commit()
        conn.close()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@career_bp.route('/career/chat', methods=['POST'])
def career_chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        system_prompt = "Bạn là trợ lý AI chuyên tư vấn định hướng nghề nghiệp. Trả lời bằng tiếng Việt, thân thiện và ngắn gọn (dưới 100 chữ)."
        ai_reply = call_openai_text(messages, system_prompt=system_prompt)
        
        if ai_reply:
            return jsonify({'success': True, 'data': ai_reply})
        return jsonify({'success': False, 'message': 'AI error'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
