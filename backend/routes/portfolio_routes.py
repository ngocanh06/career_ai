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
