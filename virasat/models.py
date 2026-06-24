"""
VIRASAT Restaurant — SQLAlchemy Database Models

Models:
  - Reservation : Stores dining reservation records.
  - ContactMessage : Stores messages submitted via the contact form.
"""
from datetime import datetime
from .extensions import db


class Reservation(db.Model):
    """
    Stores a diner's table reservation.
    Status lifecycle: pending → confirmed → cancelled.
    """

    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time_slot = db.Column(db.String(20), nullable=False)
    guests = db.Column(db.Integer, nullable=False)
    special_requests = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default="pending", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<Reservation #{self.id} — {self.name} on {self.date}>"

    def to_dict(self) -> dict:
        """Serialize model to a JSON-safe dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "date": self.date.isoformat(),
            "time_slot": self.time_slot,
            "guests": self.guests,
            "special_requests": self.special_requests or "",
            "status": self.status,
            "created_at": self.created_at.isoformat(),
        }


class ContactMessage(db.Model):
    """Stores a message submitted via the public contact form."""

    __tablename__ = "contact_messages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ContactMessage #{self.id} — {self.name}: {self.subject}>"

    def to_dict(self) -> dict:
        """Serialize model to a JSON-safe dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "subject": self.subject,
            "message": self.message,
            "created_at": self.created_at.isoformat(),
        }
