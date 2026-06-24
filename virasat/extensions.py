"""
VIRASAT Restaurant — Flask Extension Singletons
Instantiated here and initialized in the create_app factory to avoid circular imports.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

# SQLAlchemy ORM instance
db = SQLAlchemy()

# CSRF protection — protects all POST forms and Fetch API calls (via X-CSRFToken header)
csrf = CSRFProtect()
