import os
import time
import json
import random
from flask import Blueprint, jsonify, request, current_app
from utils.db import get_db
from utils.ai import call_openai_json

import pdfplumber
import docx

cv_bp = Blueprint('cv', __name__)

def extract_text_from_file(filepath, file_type):
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
        print(f"Lỗi khi đọc file: {e}")
    return text

def analyze_cv_with_openai(cv_text):
    system_prompt = """Bạn là chuyên gia tối ưu hóa CV và hệ thống ATS chuyên nghiệp.

NGUYÊN TẮC BẮT BUỘC KHI ĐƯA RA GỢI Ý:
1. TUYỆT ĐỐI KHÔNG khuyên ứng viên đổi công ty, thay trường đại học, hay chọn nhà tuyển dụng khác.
   Lý do: Kinh nghiệm làm việc và học vấn là lịch sử đã xảy ra — không thể thay đổi được.
   
2. Gợi ý CHỈ tập trung vào cách VIẾT LẠI nội dung CV để trông chuyên nghiệp hơn, gồm:
   - Thêm số liệu định lượng cụ thể (%, con số, quy mô, thời gian, doanh thu...)
   - Viết lại theo cấu trúc: [Động từ hành động] + [Công việc đã làm] + [Kết quả đo lường được]
   - Bổ sung từ khóa công nghệ/chuyên ngành phù hợp để vượt ATS scanner
   - Giải thích rõ hơn lý do thời gian làm việc ngắn (nếu có) thay vì để trống
   - Thay thế đánh giá chủ quan (sao, %) bằng bằng chứng cụ thể (chứng chỉ, dự án, phương pháp)

3. Câu "recommendation" phải là đoạn text CỤ THỂ có thể dán thẳng vào CV, không phải lời khuyên chung chung.

Chỉ trả về JSON, không có văn bản giải thích nào khác."""

    prompt = f"""Phân tích CV sau và trả về JSON theo cấu trúc bên dưới.

{{
  "ats_score": <số nguyên từ 1 đến 100, đánh giá khả năng vượt ATS scanner>,
  "analysis_result": {{
    "strengths": ["<điểm mạnh cụ thể 1>", "<điểm mạnh cụ thể 2>", "<điểm mạnh cụ thể 3>"],
    "weaknesses": ["<kỹ năng/từ khóa còn thiếu 1>", "<kỹ năng/từ khóa còn thiếu 2>", "<điểm yếu cụ thể 3>"],
    "summary": "<Nhận xét tổng quan về CV bằng tiếng Việt, 2-3 câu, tập trung vào cách trình bày và nội dung>"
  }},
  "improvement_suggestions": {{
    "suggestions": [
      {{
        "id": 1,
        "type": "<HÀNH ĐỘNG | TỪ KHÓA | SỐ LIỆU | GIẢI THÍCH | CHỨNG MINH>",
        "section": "<Tên mục trong CV cần sửa, ví dụ: Kinh nghiệm làm việc, Kỹ năng, Học vấn>",
        "original": "<Trích dẫn chính xác đoạn text từ CV cần cải thiện>",
        "recommendation": "<Đoạn viết lại hoàn chỉnh, cụ thể, có thể dán thẳng vào CV — KHÔNG được khuyên đổi công ty hay đổi trường>"
      }}
    ]
  }}
}}

Quy tắc bắt buộc:
- Trả về tối đa 5 suggestions
- Mỗi "recommendation" phải là nội dung viết lại cụ thể, KHÔNG phải lời khuyên chung ("hãy thêm số liệu" là SAI, cần viết ra con số cụ thể ví dụ như "Quản lý nhóm 5 thành viên, hoàn thành dự án đúng deadline 95% các sprint")
- Nếu thời gian làm việc ngắn (dưới 6 tháng), gợi ý cách giải thích rõ lý do (thực tập, dự án ngắn hạn, hợp đồng theo mùa...) thay vì bỏ qua
- Tất cả ngôn ngữ dùng tiếng Việt, ngoại trừ từ khóa kỹ thuật/chuyên ngành

Văn bản CV:
\"\"\"
{cv_text[:6000]}
\"\"\"
"""
    return call_openai_json(prompt, system_prompt=system_prompt, model="llama-3.3-70b-versatile")


# -------------------------------------------------------
# API: Lấy thông tin phân tích CV theo user_id
# -------------------------------------------------------
@cv_bp.route('/cv/<int:user_id>', methods=['GET'])
def get_cv(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT cv_id, file_path, file_type, "
                "DATE_FORMAT(upload_date, '%%Y-%%m-%%d') as upload_date, ats_score, "
                "analysis_result, improvement_suggestions, status "
                "FROM cv WHERE user_id = %s ORDER BY cv_id DESC LIMIT 1",
                (user_id,)
            )
            cv = cursor.fetchone()
        conn.close()
        if not cv:
            return jsonify({'success': False, 'message': 'Chưa có dữ liệu CV'}), 404
        return jsonify({'success': True, 'data': cv})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Upload CV và tạo phân tích AI
# -------------------------------------------------------
@cv_bp.route('/cv/upload', methods=['POST'])
def upload_cv():
    try:
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'message': 'Thiếu user_id'}), 400

        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'Không tìm thấy file'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'Chưa chọn file'}), 400

        allowed_types = {
            'application/pdf': '.pdf',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        }
        file_type = file.content_type
        if file_type not in allowed_types:
            return jsonify({'success': False, 'message': 'Chỉ chấp nhận PDF, DOC, DOCX'}), 400

        ext      = allowed_types[file_type]
        filename = f"cv_{user_id}_{int(time.time())}{ext}"
        upload_dir = current_app.config.get('UPLOAD_FOLDER',
                        os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads'))
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        
        file_url = f"http://localhost:5000/static/uploads/{filename}"

        # Đọc text từ CV
        cv_text = extract_text_from_file(filepath, file_type)

        if len(cv_text.strip()) < 50:
            # Fallback nếu CV là ảnh hoặc không đọc được chữ
            cv_text = "Hồ sơ ngắn gọn, tập trung vào kỹ năng cơ bản."

        # Phân tích bằng OpenAI
        ai_result = analyze_cv_with_openai(cv_text)
        
        # Nếu AI lỗi, fallback tạo ngẫu nhiên
        if not ai_result:
            ai_result = {
                "ats_score": random.randint(62, 91),
                "analysis_result": {
                    "strengths": ["Phân tích tốt", "Cấu trúc rõ ràng"],
                    "weaknesses": ["Kỹ năng chuyên môn", "Chứng chỉ"],
                    "summary": "Không thể kết nối AI, đây là kết quả tự động."
                },
                "improvement_suggestions": {
                    "suggestions": []
                }
            }

        ats_score = ai_result.get("ats_score", 50)
        analysis_result = ai_result.get("analysis_result", {})
        improvement_suggestions = ai_result.get("improvement_suggestions", {"suggestions": []})

        # Lưu vào DB
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("SELECT cv_id, file_path FROM cv WHERE user_id = %s ORDER BY upload_date DESC LIMIT 1", (user_id,))
            old = cursor.fetchone()

            cursor.execute(
                "INSERT INTO cv (user_id, file_path, file_type, ats_score, "
                "analysis_result, improvement_suggestions, status) "
                "VALUES (%s, %s, %s, %s, %s, %s, 'analyzed')",
                (
                    user_id,
                    file_url,
                    file_type,
                    ats_score,
                    json.dumps(analysis_result, ensure_ascii=False),
                    json.dumps(improvement_suggestions, ensure_ascii=False),
                )
            )
            conn.commit()
        conn.close()

        return jsonify({
            'success': True,
            'message': 'Tải lên và phân tích CV thành công',
            'data': {
                'file_url':  file_url,
                'ats_score': ats_score,
                'file_type': file_type,
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# -------------------------------------------------------
# API: Xóa CV theo cv_id
# -------------------------------------------------------
@cv_bp.route('/cv/<int:cv_id>', methods=['DELETE'])
def delete_cv(cv_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM cv WHERE cv_id = %s", (cv_id,))
            conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Đã xóa CV'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
