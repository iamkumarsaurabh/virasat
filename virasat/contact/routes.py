"""
VIRASAT — Contact Blueprint Routes

GET  /contact          — Render the contact page.
POST /api/contact      — Accept JSON contact form, validate, and persist to DB.
"""
import re
from flask import render_template, request, jsonify
from . import contact
from ..extensions import db
from ..models import ContactMessage

# ── Restaurant Info (single source of truth, passed to template) ──────────────
RESTAURANT_INFO = {
    "address": "Virasat Estate, NH-44 (Grand Trunk Road), Near Panipat, Haryana — 132103",
    "phone_primary": "+91 98765 43210",
    "phone_secondary": "+91 22 2600 1234",
    "email": "reservations@virasat.in",
    "hours": [
        ("Monday – Thursday", "12:00 PM – 10:00 PM"),
        ("Friday & Saturday", "12:00 PM – 11:00 PM"),
        ("Sunday", "12:00 PM – 9:00 PM"),
    ],
    "map_embed_src": "https://maps.google.com/maps?q=29.453167,76.971694&hl=en&z=14&output=embed",
}

PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")


def _validate_contact(data: dict) -> dict:
    """Validate contact form payload. Returns (errors_dict, cleaned_dict)."""
    errors: dict = {}

    name = str(data.get("name", "")).strip()
    if not name:
        errors["name"] = "Your name is required."
    elif len(name) < 2 or len(name) > 100:
        errors["name"] = "Name must be between 2 and 100 characters."

    email = str(data.get("email", "")).strip().lower()
    if not email:
        errors["email"] = "Email address is required."
    elif "@" not in email or "." not in email.split("@")[-1]:
        errors["email"] = "Please enter a valid email address."

    subject = str(data.get("subject", "")).strip()
    if not subject:
        errors["subject"] = "A subject is required."
    elif len(subject) > 200:
        errors["subject"] = "Subject must not exceed 200 characters."

    message = str(data.get("message", "")).strip()
    if not message:
        errors["message"] = "Please write your message."
    elif len(message) < 10:
        errors["message"] = "Message must be at least 10 characters."
    elif len(message) > 2000:
        errors["message"] = "Message must not exceed 2000 characters."

    return errors, {
        "name": name,
        "email": email,
        "subject": subject[:200],
        "message": message[:2000],
    }


@contact.route("/contact")
def index():
    """Render the contact page."""
    return render_template("contact.html", info=RESTAURANT_INFO)


@contact.route("/api/contact", methods=["POST"])
def submit_contact():
    """
    JSON API endpoint — stores a contact message.
    CSRF validated via the X-CSRFToken request header (set by contact.js).
    """
    if not request.is_json:
        return jsonify({"success": False, "message": "Request must be JSON."}), 415

    data = request.get_json(silent=True) or {}
    
    # Anti-spam Honeypot Check
    if data.get("website_url") or not data.get("js_timestamp"):
        return jsonify({"success": False, "message": "Automated spam detected. Request rejected."}), 400
        
    errors, cleaned = _validate_contact(data)

    if errors:
        return jsonify({
            "success": False,
            "message": "Please correct the errors below.",
            "errors": errors,
        }), 400

    try:
        msg = ContactMessage(
            name=cleaned["name"],
            email=cleaned["email"],
            subject=cleaned["subject"],
            message=cleaned["message"],
        )
        db.session.add(msg)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "A server error occurred. Please try again shortly.",
        }), 500

    return jsonify({
        "success": True,
        "message": (
            f"Thank you, {cleaned['name']}! Your message has been received. "
            "Our team will respond within 24 hours."
        ),
    }), 201
