"""VIRASAT — Contact Blueprint"""
from flask import Blueprint

contact = Blueprint("contact", __name__)

from . import routes  # noqa: E402, F401
