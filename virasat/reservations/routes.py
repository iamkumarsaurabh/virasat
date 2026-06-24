"""
VIRASAT — Reservations Blueprint Routes

GET  /reserve          — Render the booking form page.
POST /api/reserve      — Accept JSON booking data, validate, and persist to DB.
"""
import re
from datetime import date, datetime, timedelta
from flask import render_template, request, jsonify
from . import reservations
from ..extensions import db
from ..models import Reservation

# ── Available time slots ──────────────────────────────────────────────────────
TIME_SLOTS = [
    # Lunch
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    # Dinner
    "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM",
]

# Regex for basic phone validation (10–15 digits, optional leading +)
PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")


def _validate_reservation(data: dict) -> dict:
    """
    Validate the incoming reservation payload.
    Returns a dict of field → error string (empty dict means all valid).
    """
    errors: dict = {}
    today = date.today()
    one_year_later = today + timedelta(days=365)

    # Name
    name = str(data.get("name", "")).strip()
    if not name:
        errors["name"] = "Full name is required."
    elif len(name) < 2 or len(name) > 100:
        errors["name"] = "Name must be between 2 and 100 characters."

    # Email
    email = str(data.get("email", "")).strip().lower()
    if not email:
        errors["email"] = "Email address is required."
    elif "@" not in email or "." not in email.split("@")[-1]:
        errors["email"] = "Please enter a valid email address."

    # Phone
    phone = str(data.get("phone", "")).strip().replace(" ", "").replace("-", "")
    if not phone:
        errors["phone"] = "Phone number is required."
    elif not PHONE_RE.match(phone):
        errors["phone"] = "Enter a valid phone number (10–15 digits)."

    # Date
    raw_date = str(data.get("date", "")).strip()
    parsed_date = None
    if not raw_date:
        errors["date"] = "Reservation date is required."
    else:
        try:
            parsed_date = date.fromisoformat(raw_date)
            if parsed_date < today:
                errors["date"] = "Reservation date cannot be in the past."
            elif parsed_date > one_year_later:
                errors["date"] = "Reservations can only be made up to one year in advance."
        except ValueError:
            errors["date"] = "Invalid date format. Use YYYY-MM-DD."

    # Time slot
    time_slot = str(data.get("time_slot", "")).strip()
    if not time_slot:
        errors["time_slot"] = "Please select a time slot."
    elif time_slot not in TIME_SLOTS:
        errors["time_slot"] = "Invalid time slot selected."

    # Guests
    try:
        guests = int(data.get("guests", 0))
        if guests < 1 or guests > 20:
            errors["guests"] = "Number of guests must be between 1 and 20."
    except (TypeError, ValueError):
        errors["guests"] = "Please enter a valid number of guests."
        guests = 0

    return errors, {
        "name": name,
        "email": email,
        "phone": phone,
        "parsed_date": parsed_date,
        "time_slot": time_slot,
        "guests": guests,
        "special_requests": str(data.get("special_requests", "")).strip()[:500],
    }


@reservations.route("/reserve")
def index():
    """Render the reservation booking page."""
    return render_template("reserve.html", time_slots=TIME_SLOTS)


@reservations.route("/api/reserve", methods=["POST"])
def create_reservation():
    """
    JSON API endpoint — creates a new reservation.
    Expects: Content-Type: application/json
    Returns: { success: bool, message: str, errors?: dict, reservation_id?: int }
    CSRF is validated via the X-CSRFToken request header (set by reserve.js).
    """
    if not request.is_json:
        return jsonify({"success": False, "message": "Request must be JSON."}), 415

    data = request.get_json(silent=True) or {}
    
    # Anti-spam Honeypot Check
    if data.get("website_url") or not data.get("js_timestamp"):
        return jsonify({"success": False, "message": "Automated spam detected. Request rejected."}), 400

    errors, cleaned = _validate_reservation(data)

    if errors:
        return jsonify({"success": False, "message": "Please correct the errors below.", "errors": errors}), 400

    # Persist to database
    try:
        reservation = Reservation(
            name=cleaned["name"],
            email=cleaned["email"],
            phone=cleaned["phone"],
            date=cleaned["parsed_date"],
            time_slot=cleaned["time_slot"],
            guests=cleaned["guests"],
            special_requests=cleaned["special_requests"] or None,
            status="confirmed",
        )
        db.session.add(reservation)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "A server error occurred. Please try again shortly.",
        }), 500

    return jsonify({
        "success": True,
        "message": (
            f"Your royal table has been reserved! Confirmation details have been noted "
            f"for {cleaned['name']} on {cleaned['parsed_date'].strftime('%d %B %Y')} "
            f"at {cleaned['time_slot']} for {cleaned['guests']} guest(s). "
            f"We look forward to welcoming you to VIRASAT."
        ),
        "reservation_id": reservation.id,
    }), 201
