"""VIRASAT — Menu Blueprint"""
from flask import Blueprint

menu = Blueprint("menu", __name__)

from . import routes  # noqa: E402, F401
