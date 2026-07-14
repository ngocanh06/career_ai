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
Trích xuất các thông tin cá nhân và chuyên môn từ CV sau để xây dựng Portfolio.
Hãy trả về một JSON có cấu trúc sau:
{{
<<<<<<< HEAD
  "name": "Họ và tên của ứng viên",
  "title": "Chức danh nghề nghiệp chính (ví dụ: Software Engineer, Data Analyst...)",
  "bio": "Đoạn giới thiệu bản thân ngắn gọn (Professional Summary) được viết lại sao cho chuyên nghiệp, dưới 50 chữ",
=======
  "title": "Chức danh/vị trí công việc mong muốn (ví dụ: Frontend Developer, Data Analyst, MIS Student)",
  "phone": "Số điện thoại liên hệ",
  "address": "Địa chỉ liên hệ hoặc thành phố/quốc gia cư trú",
>>>>>>> 48bbca6c0188965d7ef62333307efa371a901905
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


# -------------------------------------------------------
# API: AI Rewrite bio / project description (Co-pilot)
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/rewrite', methods=['POST'])
def rewrite_text():
    data = request.json
    text = data.get('text', '').strip()
    tone = data.get('tone', 'professional')

    if not text:
        return jsonify({'success': False, 'message': 'Không có nội dung để viết lại'})

    tone_map = {
        'professional': 'chuyên nghiệp, formal, dùng ngôn ngữ trang trọng',
        'creative': 'sáng tạo, phóng khoáng, thể hiện cá tính riêng',
        'tech': 'kỹ thuật, data-driven, tập trung vào công nghệ và số liệu',
    }
    tone_desc = tone_map.get(tone, tone_map['professional'])

    prompt = f"""Bạn là chuyên gia viết Portfolio và CV chuyên nghiệp.
Hãy viết lại đoạn văn sau theo phong cách: {tone_desc}.

YÊU CẦU BẮT BUỘC:
- Viết theo ngôi thứ nhất (Tôi là..., Tôi có kinh nghiệm..., Tôi đam mê...)
- Đây là phần "Giới thiệu bản thân" hoặc "Mô tả dự án" dành cho Portfolio công khai
- KHÔNG nhận xét hay đánh giá ứng viên như HR, chỉ trình bày điểm mạnh
- Độ dài: 2-4 câu, ngắn gọn và ấn tượng
- Phản hồi HOÀN TOÀN bằng TIẾNG VIỆT CÓ DẤU

Nội dung gốc: "{text}"

Trả về JSON: {{"rewritten": "<nội dung đã viết lại>"}}"""

    result = call_openai_json(prompt)
    if result and 'rewritten' in result:
        return jsonify({'success': True, 'data': result['rewritten']})
    return jsonify({'success': False, 'message': 'Lỗi gọi AI'})


# -------------------------------------------------------
# API: AI Generate professional bio từ dữ liệu CV
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/generate-bio', methods=['POST'])
def generate_bio():
    data = request.json
    name = data.get('name', '').strip()
    title = data.get('title', '').strip()
    skills = data.get('skills', [])
    projects = data.get('projects', [])
    raw_summary = data.get('raw_summary', '').strip()
    tone = data.get('tone', 'professional')

    tone_map = {
        'professional': 'chuyên nghiệp và trang trọng',
        'creative': 'sáng tạo và cá tính',
        'tech': 'kỹ thuật và data-driven',
    }
    tone_desc = tone_map.get(tone, tone_map['professional'])

    # Build context from available data
    skills_str = ', '.join(skills[:8]) if skills else 'chưa xác định'
    projects_str = ', '.join(projects[:3]) if projects else 'chưa có'

    # Use raw_summary as source material if it's a critique (AI will transform it)
    source_context = ''
    if raw_summary:
        source_context = f'\nThông tin từ CV (dùng làm tham khảo để hiểu nền tảng của ứng viên): "{raw_summary[:500]}"'

    prompt = f"""Bạn là chuyên gia viết Portfolio và hồ sơ cá nhân.
Hãy tạo một đoạn "Giới thiệu bản thân" (About Me) chuyên nghiệp cho người dùng.

Thông tin về ứng viên:
- Họ tên: {name or 'Ứng viên'}
- Chức danh / Lĩnh vực: {title or 'Chuyên ngành IT'}
- Kỹ năng nổi bật: {skills_str}
- Dự án tiêu biểu: {projects_str}{source_context}

YÊU CẦU BẮT BUỘC:
1. Viết theo NGÔI THỨ NHẤT (Tôi là..., Với {title or 'chuyên ngành'}..., Tôi có kinh nghiệm...)
2. Phong cách: {tone_desc}
3. Đây là phần công khai trên Portfolio — TUYỆT ĐỐI KHÔNG nhận xét tiêu cực
4. Tập trung vào ĐIỂM MẠNH: kỹ năng, đam mê, mục tiêu nghề nghiệp
5. Độ dài: 3-4 câu (khoảng 60-100 chữ), súc tích và ấn tượng
6. Phản hồi HOÀN TOÀN bằng TIẾNG VIỆT CÓ DẤU
7. Kết thúc bằng một câu thể hiện mục tiêu hoặc đam mê

Trả về JSON: {{"bio": "<đoạn giới thiệu bản thân>"}}"""

    result = call_openai_json(prompt)
    if result and 'bio' in result:
        return jsonify({'success': True, 'data': result['bio']})
    return jsonify({'success': False, 'message': 'Lỗi gọi AI'})


# -------------------------------------------------------
# API: ATS Keyword Scanner
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/ats-scan', methods=['POST'])
def ats_scan():
    data = request.json
    jd = data.get('jd', '').strip()
    skills = data.get('skills', [])

    if not jd:
        return jsonify({'success': False, 'message': 'Thiếu Job Description'})

    prompt = f"""Bạn là chuyên gia phân tích từ khóa ATS (Applicant Tracking System).
Phân tích Job Description (JD) sau và danh sách kỹ năng của ứng viên.

JD:
{jd[:3000]}

Kỹ năng hiện có của ứng viên: {', '.join(skills) if skills else 'chưa có'}

Hãy:
1. Trích xuất 10-15 từ khóa kỹ thuật quan trọng nhất từ JD (tên công nghệ, framework, tool, kỹ năng cụ thể)
2. Phân loại chúng thành "matched" (có trong kỹ năng ứng viên) và "missing" (chưa có)

Trả về JSON:
{{"matched": ["kw1", "kw2"], "missing": ["kw3", "kw4"]}}"""

    result = call_openai_json(prompt)
    if result and ('matched' in result or 'missing' in result):
        return jsonify({
            'success': True,
            'data': {
                'matched': result.get('matched', []),
                'missing': result.get('missing', [])
            }
        })
    return jsonify({'success': False, 'message': 'Lỗi gọi AI'})


# -------------------------------------------------------
# API: Lưu bản nháp (Draft) Portfolio của người dùng
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/save-draft', methods=['POST'])
def save_draft():
    try:
        data = request.json
        user_id = data.get('user_id')
        draft_data = data.get('draft_data')

        if not user_id:
            return jsonify({'success': False, 'message': 'Thiếu user_id'}), 400
        if not draft_data:
            return jsonify({'success': False, 'message': 'Thiếu dữ liệu nháp'}), 400

        draft_str = json.dumps(draft_data, ensure_ascii=False)

        conn = get_db()
        with conn.cursor() as cursor:
            # Kiểm tra xem đã có bản ghi portfolio nào cho user này chưa
            cursor.execute("SELECT portfolio_id FROM portfolio WHERE user_id = %s LIMIT 1", (user_id,))
            exists = cursor.fetchone()

            if exists:
                cursor.execute(
                    "UPDATE portfolio SET content_json = %s, updated_at = NOW() WHERE user_id = %s",
                    (draft_str, user_id)
                )
            else:
                # Tạo một slug ngẫu nhiên ngắn gọn
                import random
                import string
                random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))
                slug = f"portfolio-{user_id}-{random_suffix}"
                cursor.execute(
                    "INSERT INTO portfolio (user_id, slug, title, is_published, content_json, created_at) "
                    "VALUES (%s, %s, %s, 0, %s, NOW())",
                    (user_id, slug, 'Hồ sơ năng lực cá nhân', draft_str)
                )
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Lưu bản nháp thành công!'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Tải bản nháp (Draft) Portfolio của người dùng
# -------------------------------------------------------
@portfolio_bp.route('/portfolio/draft/<int:user_id>', methods=['GET'])
def get_draft(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT content_json FROM portfolio WHERE user_id = %s LIMIT 1", (user_id,))
            row = cursor.fetchone()
        conn.close()

        if not row or not row['content_json']:
            return jsonify({'success': False, 'message': 'Chưa có bản nháp nào'}), 404

        # Parse chuỗi JSON ra object trước khi gửi về
        parsed_data = json.loads(row['content_json'])
        return jsonify({'success': True, 'data': parsed_data})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


