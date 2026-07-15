from .db_routes import db_bp
from .auth_routes import auth_bp
from .user_routes import user_bp
from .career_routes import career_bp
from .roadmap_routes import roadmap_bp
from .cv_routes import cv_bp
from .portfolio_routes import portfolio_bp
from .dashboard_routes import dashboard_bp
from .admin_routes import admin_bp

all_blueprints = [
    db_bp,
    auth_bp,
    user_bp,
    career_bp,
    roadmap_bp,
    cv_bp,
    portfolio_bp,
    dashboard_bp,
    admin_bp,
]
