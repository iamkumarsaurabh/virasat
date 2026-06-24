"""
VIRASAT — Main Blueprint Routes
Serves the landing page with testimonials data.
"""
from flask import render_template
from . import main

# ── Testimonials data ─────────────────────────────────────────────────────────
TESTIMONIALS = [
    {
        "id": 1,
        "name": "Arjun Mehta",
        "location": "Mumbai",
        "rating": 5,
        "text": (
            "An extraordinary pre-launch tasting evening. The Kakori Kebab simply melted on "
            "the tongue, and the ambiance transported me straight to a royal Mughal court. "
            "VIRASAT is set to redefine fine dining in the city."
        ),
        "initial": "A",
    },
    {
        "id": 2,
        "name": "Priya Sharma",
        "location": "Delhi",
        "rating": 5,
        "text": (
            "The Hyderabadi Dum Biryani was an absolute revelation — fragrant, perfectly spiced, "
            "and presented with such elegance. The gold-and-black décor is breathtaking. "
            "I've already reserved my Diwali table!"
        ),
        "initial": "P",
    },
    {
        "id": 3,
        "name": "Rohan Kapoor",
        "location": "Bangalore",
        "rating": 5,
        "text": (
            "VIRASAT is not just a restaurant; it is an experience. The Maharaja Thali "
            "was a culinary journey through centuries of royal kitchens. Every course was "
            "a masterpiece. Cannot wait for the grand opening."
        ),
        "initial": "R",
    },
    {
        "id": 4,
        "name": "Anika Verma",
        "location": "Pune",
        "rating": 5,
        "text": (
            "The Dal Makhani here is the finest I have ever tasted — slow-cooked to perfection "
            "with that unmistakable smoky depth. The staff's warmth and the elegant setting "
            "made the evening truly unforgettable."
        ),
        "initial": "A",
    },
]


@main.route("/")
def index():
    """Render the main landing page."""
    return render_template("index.html", testimonials=TESTIMONIALS)
