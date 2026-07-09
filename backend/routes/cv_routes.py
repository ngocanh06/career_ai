from flask import Blueprint, jsonify
from utils.db import get_db

cv_bp = Blueprint('cv', __name__)

# -------------------------------------------------------
# API: Lấy thông tin phân tích CV theo user_id
# -------------------------------------------------------
@cv_bp.route('/cv/<int:user_id>')
def get_cv(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT cv_id, file_path, file_type, "
                "DATE_FORMAT(upload_date, '%%Y-%%m-%%d %%H:%%i:%%s') as upload_date, ats_score, "
                "analysis_result, improvement_suggestions, status "
                "FROM cv WHERE user_id = %s ORDER BY upload_date DESC LIMIT 1",
                (user_id,)
            )
            cv = cursor.fetchone()
        conn.close()
        if not cv:
            return jsonify({'success': False, 'message': 'Chưa có dữ liệu CV'}), 404
        return jsonify({'success': True, 'data': cv})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
