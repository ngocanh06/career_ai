from flask import Blueprint, jsonify
from utils.db import get_db

portfolio_bp = Blueprint('portfolio', __name__)

# -------------------------------------------------------
# API: Lấy kỹ năng hiện tại của người dùng
# -------------------------------------------------------
@portfolio_bp.route('/skills/<int:user_id>')
def get_skills(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT s.skill_id, s.skill_name, s.category, us.proficiency_level "
                "FROM userskill us JOIN skill s ON us.skill_id = s.skill_id "
                "WHERE us.user_id = %s",
                (user_id,)
            )
            skills = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': skills})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy thông tin Portfolio theo user_id
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/<int:user_id>')
def get_portfolio(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT portfolio_id, slug, title, is_published, view_count, "
                "DATE_FORMAT(created_at, '%%Y-%%m-%%d %%H:%%i:%%s') as created_at, "
                "DATE_FORMAT(updated_at, '%%Y-%%m-%%d %%H:%%i:%%s') as updated_at "
                "FROM portfolio WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            portfolio = cursor.fetchone()
        conn.close()
        if not portfolio:
            return jsonify({'success': False, 'message': 'Chưa có Portfolio'}), 404
        return jsonify({'success': True, 'data': portfolio})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy kinh nghiệm làm việc (Dự án tiêu biểu) theo user_id
# -------------------------------------------------------
@portfolio_bp.route('/experience/<int:user_id>')
def get_experience(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if not prof:
                return jsonify({'success': True, 'data': []})
            profile_id = prof['profile_id']
            cursor.execute(
                "SELECT experience_id, company, position, description, "
                "DATE_FORMAT(start_date, '%%Y-%%m-%%d') as start_date, "
                "DATE_FORMAT(end_date, '%%Y-%%m-%%d') as end_date "
                "FROM experience WHERE profile_id = %s ORDER BY start_date DESC",
                (profile_id,)
            )
            exp = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': exp})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy thành tựu giải thưởng (Chứng chỉ) theo user_id
# -------------------------------------------------------
@portfolio_bp.route('/certificate/<int:user_id>')
def get_certificates(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if not prof:
                return jsonify({'success': True, 'data': []})
            profile_id = prof['profile_id']
            cursor.execute(
                "SELECT certificate_id, name, organization, "
                "DATE_FORMAT(issue_date, '%%Y-%%m-%%d') as issue_date "
                "FROM certificate WHERE profile_id = %s ORDER BY issue_date DESC",
                (profile_id,)
            )
            certs = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': certs})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Lấy quá trình học tập (Học vấn) theo user_id
# -------------------------------------------------------
@portfolio_bp.route('/education/<int:user_id>')
def get_education(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT profile_id FROM profile WHERE user_id = %s", (user_id,))
            prof = cursor.fetchone()
            if not prof:
                return jsonify({'success': True, 'data': []})
            profile_id = prof['profile_id']
            cursor.execute(
                "SELECT education_id, school_name, degree, major, "
                "DATE_FORMAT(start_date, '%%Y-%%m-%%d') as start_date, "
                "DATE_FORMAT(end_date, '%%Y-%%m-%%d') as end_date "
                "FROM education WHERE profile_id = %s ORDER BY start_date DESC",
                (profile_id,)
            )
            edu = cursor.fetchall()
        conn.close()
        return jsonify({'success': True, 'data': edu})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

from flask import request
from utils.ai import call_openai_json

@portfolio_bp.route('/portfolio/optimize-project', methods=['POST'])
def optimize_project():
    data = request.json
    desc = data.get('description', '')
    if not desc:
        return jsonify({'success': False, 'message': 'Không có mô tả dự án'})
        
    prompt = f"""
Bạn là chuyên gia viết CV và Portfolio. Dưới đây là mô tả ngắn về một dự án.
Hãy tối ưu lại mô tả này sao cho chuyên nghiệp, nhấn mạnh vào hành động, kỹ năng và kết quả (sử dụng action verbs và số liệu nếu có thể).
Mô tả gốc: "{desc}"
Trả về JSON với format: {{"optimized_desc": "<mô tả đã tối ưu>"}}
"""
    result = call_openai_json(prompt)
    if result and 'optimized_desc' in result:
        return jsonify({'success': True, 'data': result['optimized_desc']})
    return jsonify({'success': False, 'message': 'Lỗi gọi AI'})

@portfolio_bp.route('/portfolio/insight', methods=['POST'])
def get_portfolio_insight():
    data = request.json
    projects = data.get('projects', [])
    skills = data.get('skills', [])
    
    prompt = f"""
Bạn là một AI phân tích Portfolio chuyên nghiệp.
Dựa vào danh sách kỹ năng và dự án sau, hãy phân tích và đưa ra 1 câu gợi ý ngắn (dưới 30 chữ) để người dùng cải thiện Portfolio, kèm theo một điểm số ấn tượng (từ 1 đến 100).
YÊU CẦU: Phản hồi hoàn toàn bằng TIẾNG VIỆT CÓ DẤU.
Kỹ năng: {', '.join(skills)}
Dự án: {', '.join([p.get('title', '') for p in projects])}
Trả về JSON format: {{"insight": "<câu gợi ý>", "score": <số nguyên từ 1-100>}}
"""
    result = call_openai_json(prompt)
    if result and 'insight' in result:
        return jsonify({'success': True, 'data': {'insight': result['insight'], 'score': result.get('score', 85)}})
    return jsonify({'success': False, 'message': 'Lỗi gọi AI'})

from flask import request
import os, json
import pdfplumber, docx
from utils.ai import call_openai_json

def extract_text_from_file_local(filepath, file_type):
    text = ""
    try:
        if file_type == 'application/pdf':
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        elif file_type in ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            doc = docx.Document(filepath)
            for para in doc.paragraphs:
                text += para.text + "\n"
    except Exception as e:
        print(f"Loi doc file: {e}")
    return text

@portfolio_bp.route('/portfolio/extract-cv/<int:user_id>', methods=['POST'])
def extract_portfolio_from_cv(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT file_path, file_type FROM cv WHERE user_id = %s ORDER BY cv_id DESC LIMIT 1", (user_id,))
            cv = cursor.fetchone()
        conn.close()
        
        if not cv:
            return jsonify({'success': False, 'message': 'Không tìm thấy CV nào của bạn'})
            
        file_path = cv['file_path'].split('/static/uploads/')[-1]
        from flask import current_app
        upload_dir = current_app.config.get('UPLOAD_FOLDER', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads'))
        full_path = os.path.join(upload_dir, file_path)
        
        if not os.path.exists(full_path):
            return jsonify({'success': False, 'message': 'Không tìm thấy file trên server'})
            
        text = extract_text_from_file_local(full_path, cv['file_type'])
        if len(text.strip()) < 50:
            return jsonify({'success': False, 'message': 'CV quá ngắn hoặc không đọc được'})
            
        prompt = f"""
Trích xuất các thông tin chuyên môn từ CV sau để xây dựng Portfolio.
Hãy trả về một JSON có cấu trúc sau:
{{
  "skills": ["kỹ năng 1", "kỹ năng 2"],
  "projects": [
    {{ "title": "Tên dự án", "desc": "Mô tả ngắn gọn", "tech": "Các công nghệ sử dụng" }}
  ],
  "awards": [
    {{ "title": "Tên giải thưởng/chứng chỉ", "org": "Tổ chức cấp (Kèm năm nếu có)" }}
  ]
}}

CV Text:
{text[:6000]}
"""
        ai_res = call_openai_json(prompt)
        if ai_res:
            return jsonify({'success': True, 'data': ai_res})
        return jsonify({'success': False, 'message': 'Lỗi AI'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: AI gợi ý kỹ năng theo chức danh / ngành nghề
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/suggest-skills', methods=['POST'])
def suggest_skills():
    data = request.json
    job_title = data.get('job_title', '').strip()
    existing_skills = data.get('existing_skills', [])

    if not job_title:
        return jsonify({'success': False, 'message': 'Thiếu job_title'}), 400

    prompt = f"""Bạn là chuyên gia tuyển dụng IT & kỹ thuật. 
Dựa vào chức danh "{job_title}", hãy gợi ý 10 kỹ năng/công cụ kỹ thuật phổ biến và được nhà tuyển dụng tìm kiếm nhiều nhất cho vị trí này.

Yêu cầu:
- Chỉ liệt kê tên kỹ năng/công cụ ngắn gọn (ví dụ: "Python", "SQL", "Tableau")
- Ưu tiên kỹ năng cụ thể (tool, language, framework) hơn kỹ năng mềm
- KHÔNG lặp lại các kỹ năng đã có: {', '.join(existing_skills) if existing_skills else 'không có'}
- Trả về đúng 10 kỹ năng

Trả về JSON: {{"skills": ["kỹ năng 1", "kỹ năng 2", ..., "kỹ năng 10"]}}"""

    result = call_openai_json(prompt)
    if result and 'skills' in result:
        return jsonify({'success': True, 'data': result['skills']})
    return jsonify({'success': False, 'message': 'Lỗi gọi AI'}), 500
