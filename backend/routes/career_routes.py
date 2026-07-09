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
