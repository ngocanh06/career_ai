from flask import Blueprint, jsonify
from utils.db import get_db
import json

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
                "salary, skills, potential, trend_analysis, "
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
            db_skills = [row['skill_name'] for row in cursor.fetchall()]
        conn.close()

        # Kết hợp kỹ năng từ DB và kỹ năng từ portfolio (frontend gửi lên)
        portfolio_skills = data.get('portfolio_skills', [])
        skills = list(dict.fromkeys(db_skills + [s for s in portfolio_skills if s not in db_skills]))

        prompt = f"""
Bạn là AI phân tích nghề nghiệp chuyên sâu. Người dùng có hồ sơ: {bio}. Kỹ năng hiện tại: {', '.join(skills)}.
Hãy đề xuất 3 nghề nghiệp phù hợp nhất tại thị trường Việt Nam.
YÊU CẦU: Phản hồi hoàn toàn bằng TIẾNG VIỆT CÓ DẤU, riêng TÊN NGHỀ NGHIỆP (job_title) bắt buộc sử dụng TIẾNG ANH.
Trả về JSON format:
{{
  "careers": [
    {{
      "job_title": "<Tên nghề bằng tiếng Anh. Ví dụ: Data Analyst>",
      "match_percentage": <Số nguyên 50-100>,
      "job_description": "<Mô tả ngắn gọn bằng tiếng Việt>",
      "salary": "<Mức lương trung bình tại VN. VD: 15M - 35M>",
      "skills": ["<Kỹ năng 1>", "<Kỹ năng 2>", "<Kỹ năng 3>"],
      "potential": <Điểm tiềm năng tương lai từ 1-10 (1 chữ số thập phân)>,
      "trend_analysis": "<Phân tích xu hướng phát triển và sự phù hợp với user>"
    }}
  ]
}}
"""
        result = call_openai_json(prompt, model="llama-3.3-70b-versatile")
        if not result or 'careers' not in result:
            return jsonify({'success': False, 'message': 'Lỗi AI'}), 500

        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM career WHERE user_id = %s", (user_id,))
            for c in result['careers']:
                cursor.execute(
                    "INSERT INTO career (user_id, job_title, match_percentage, job_description, source, salary, skills, potential, trend_analysis) "
                    "VALUES (%s, %s, %s, %s, 'ai', %s, %s, %s, %s)",
                    (
                        user_id, c['job_title'], c['match_percentage'], c['job_description'], 
                        c.get('salary', ''), json.dumps(c.get('skills', []), ensure_ascii=False), 
                        c.get('potential', 0), c.get('trend_analysis', '')
                    )
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
        
        system_prompt = "Bạn là chuyên gia tư vấn nghề nghiệp. Trả lời bằng tiếng Việt, thân thiện. Hãy định dạng văn bản rõ ràng: sử dụng xuống dòng (\\n) để chia các đoạn hoặc các mục liệt kê, dùng dấu **in đậm** cho các từ khóa quan trọng."
        ai_reply = call_openai_text(messages, system_prompt=system_prompt)
        
        if ai_reply:
            return jsonify({'success': True, 'data': ai_reply})
        return jsonify({'success': False, 'message': 'AI error'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
