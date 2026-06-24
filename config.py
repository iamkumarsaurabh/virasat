"""
VIRASAT Restaurant — Application Configuration
Supports Development and Production configurations.
To switch to PostgreSQL in production, set DATABASE_URL in the .env file.
"""
import os
from datetime import timedelta

# Absolute path to the project root (the directory containing this file)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base configuration shared by all environments."""

    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-replace-in-production")
    
    # ── Database ─────────────────────────────────────────────────────────────
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── Admin Credentials ────────────────────────────────────────────────────
    ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "virasat2026")
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    # Flask-WTF CSRF
    WTF_CSRF_TIME_LIMIT = 3600  # 1 hour
    WTF_CSRF_HEADERS = ["X-CSRFToken"]  # Accept CSRF token from Fetch API headers

    # Sessions
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)


class DevelopmentConfig(Config):
    """Development-specific settings. SQLite for easy local setup."""

    DEBUG = True
    TESTING = False
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(
        BASE_DIR, "instance", "virasat.db"
    )
    SQLALCHEMY_ECHO = False  # Set True to log all SQL queries for debugging


class ProductionConfig(Config):
    """
    Production settings. Reads DATABASE_URL from environment for PostgreSQL support.
    Falls back to SQLite if DATABASE_URL is not set.
    """

    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "sqlite:///" + os.path.join(BASE_DIR, "instance", "virasat.db"),
    )
    # Handle Heroku's postgres:// vs postgresql:// prefix
    if SQLALCHEMY_DATABASE_URI and SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace(
            "postgres://", "postgresql://", 1
        )


# Config registry — used by the create_app factory
config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
