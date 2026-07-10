from flask import Blueprint, jsonify
from utils.db import get_db
import json as json_lib

dashboard_bp = Blueprint('dashboard', __name__)

# -------------------------------------------------------
# API: Lấy dữ liệu tổng hợp cho Dashboard Home
# GET /api/dashboard/<user_id>
# -------------------------------------------------------
@dashboard_bp.route('/dashboard/<int:user_id>', methods=['GET'])
def get_dashboard(user_id):
    try:
        conn = get_db()
        with conn.cursor() as cursor:

            # 1. User + profile
            cursor.execute(
                "SELECT u.user_id, u.email, u.role, "
                "p.profile_id, p.full_name, p.phone, p.bio, p.avatar_url "
                "FROM user u LEFT JOIN profile p ON u.user_id = p.user_id "
                "WHERE u.user_id = %s", (user_id,)
            )
            user = cursor.fetchone() or {}
            profile_id = user.get('profile_id')

            # 2. CV mới nhất
            cursor.execute(
                "SELECT cv_id, file_path, file_type, "
                "DATE_FORMAT(upload_date, '%%Y-%%m-%%d') as upload_date, "
                "ats_score, analysis_result, improvement_suggestions, status "
                "FROM cv WHERE user_id = %s ORDER BY upload_date DESC LIMIT 1",
                (user_id,)
            )
            cv = cursor.fetchone()

            # 3. Roadmap mới nhất
            cursor.execute(
                "SELECT roadmap_id, title, total_months, completion_rate, status "
                "FROM roadmap WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
                (user_id,)
            )
            roadmap = cursor.fetchone()

            # 4. Goals của roadmap
            roadmap_goals = []
            if roadmap:
                cursor.execute(
                    "SELECT g.goal_id, g.target_month, g.status, g.progress_percentage, "
                    "s.skill_name "
                    "FROM goal g LEFT JOIN skill s ON g.skill_id = s.skill_id "
                    "WHERE g.roadmap_id = %s ORDER BY g.target_month ASC LIMIT 4",
                    (roadmap['roadmap_id'],)
                )
                roadmap_goals = cursor.fetchall()

            # 5. Education, experience, certificate (dùng profile_id)
            edu_count = exp_count = cert_count = 0
            if profile_id:
                cursor.execute("SELECT COUNT(*) as cnt FROM education WHERE profile_id = %s", (profile_id,))
                edu_count = (cursor.fetchone() or {}).get('cnt', 0)

                cursor.execute("SELECT COUNT(*) as cnt FROM experience WHERE profile_id = %s", (profile_id,))
                exp_count = (cursor.fetchone() or {}).get('cnt', 0)

                cursor.execute("SELECT COUNT(*) as cnt FROM certificate WHERE profile_id = %s", (profile_id,))
                cert_count = (cursor.fetchone() or {}).get('cnt', 0)

            # 6. Tính % hoàn thiện profile
            completion = 0
            if user.get('full_name'):   completion += 20
            if user.get('phone'):       completion += 10
            if user.get('bio'):         completion += 15
            if user.get('avatar_url'):  completion += 15
            if edu_count > 0:           completion += 15
            if exp_count > 0:           completion += 15
            if cert_count > 0:          completion += 10

            # 7. Kỹ năng từ CV
            missing_skills = []
            strong_skills  = []
            if cv:
                for field in ['analysis_result', 'improvement_suggestions']:
                    if isinstance(cv.get(field), str):
                        try:
                            cv[field] = json_lib.loads(cv[field])
                        except Exception:
                            pass
                if cv.get('analysis_result'):
                    analysis = cv['analysis_result']
                    missing_skills = analysis.get('weaknesses', [])[:4]
                    strong_skills  = analysis.get('strengths',  [])[:3]

            # 8. User skills từ bảng userskill
            cursor.execute(
                "SELECT s.skill_name, us.proficiency_level "
                "FROM userskill us JOIN skill s ON us.skill_id = s.skill_id "
                "WHERE us.user_id = %s LIMIT 5",
                (user_id,)
            )
            user_skills = cursor.fetchall()

        conn.close()

        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'user_id':    user.get('user_id'),
                    'email':      user.get('email'),
                    'role':       user.get('role'),
                    'full_name':  user.get('full_name'),
                    'phone':      user.get('phone'),
                    'bio':        user.get('bio'),
                    'avatar_url': user.get('avatar_url'),
                },
                'cv':               cv,
                'roadmap':          roadmap,
                'roadmap_goals':    roadmap_goals,
                'profile_completion': completion,
                'missing_skills':   missing_skills,
                'strong_skills':    strong_skills,
                'user_skills':      user_skills,
                'has_cv':           cv is not None,
                'has_roadmap':      roadmap is not None,
                'stats': {
                    'edu_count':  edu_count,
                    'exp_count':  exp_count,
                    'cert_count': cert_count,
                }
            }
        })

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
