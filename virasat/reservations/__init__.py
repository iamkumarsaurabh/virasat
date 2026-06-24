"""VIRASAT — Reservations Blueprint"""
from flask import Blueprint

reservations = Blueprint("reservations", __name__)

from . import routes  # noqa: E402, F401
