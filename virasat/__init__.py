"""
VIRASAT Restaurant — Application Factory

Usage:
    from virasat import create_app
    app = create_app('development')
"""
import os
from flask import Flask
from config import config
from .extensions import db, csrf


def create_app(config_name: str = "default") -> Flask:
    """
    Flask application factory.
    Creates a configured Flask instance, registers extensions and blueprints,
    and initialises the database schema.
    """
    # Resolve absolute paths for templates and static files,
    # which live at the project root (one level above this package).
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    app = Flask(
        __name__,
        template_folder=os.path.join(project_root, "templates"),
        static_folder=os.path.join(project_root, "static"),
    )

    # ── Load configuration ───────────────────────────────────────────────────
    app.config.from_object(config[config_name])

    # Guarantee the instance folder exists (SQLite database lives here)
    os.makedirs(app.instance_path, exist_ok=True)

    # ── Initialise extensions ────────────────────────────────────────────────
    db.init_app(app)
    csrf.init_app(app)

    # ── Register blueprints ──────────────────────────────────────────────────
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .menu import menu as menu_blueprint
    app.register_blueprint(menu_blueprint)

    from .reservations import reservations as reservations_blueprint
    app.register_blueprint(reservations_blueprint)

    from .contact import contact as contact_blueprint
    app.register_blueprint(contact_blueprint)

    from .pages import pages as pages_blueprint
    app.register_blueprint(pages_blueprint)

    from .admin import admin as admin_blueprint
    app.register_blueprint(admin_blueprint)

    # ── Create database tables ───────────────────────────────────────────────
    with app.app_context():
        db.create_all()

    # ── Custom Error Handlers ────────────────────────────────────────────────
    @app.errorhandler(404)
    def page_not_found(e):
        from flask import render_template
        return render_template('404.html'), 404

    return app
