from flask import render_template, request, session, redirect, url_for, current_app, flash
from functools import wraps
from . import admin
from ..models import Reservation, ContactMessage
from ..extensions import db

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return redirect(url_for("admin.login"))
        return f(*args, **kwargs)
    return decorated_function

@admin.route("/login", methods=["GET", "POST"])
def login():
    if session.get("admin_logged_in"):
        return redirect(url_for("admin.dashboard"))

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if username == current_app.config.get("ADMIN_USERNAME") and password == current_app.config.get("ADMIN_PASSWORD"):
            session["admin_logged_in"] = True
            return redirect(url_for("admin.dashboard"))
        else:
            flash("Invalid credentials.", "error")

    return render_template("admin/login.html")

@admin.route("/logout")
def logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("admin.login"))

@admin.route("/")
@login_required
def dashboard():
    # Fetch all reservations ordered by newest first
    reservations = Reservation.query.order_by(Reservation.created_at.desc()).all()
    # Fetch all contact messages ordered by newest first
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    
    return render_template("admin/dashboard.html", reservations=reservations, messages=messages)
