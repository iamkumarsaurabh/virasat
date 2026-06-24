"""
VIRASAT Restaurant — Application Entry Point
Run with: python app.py  (development)
      or: flask run       (using FLASK_APP env variable)
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file before importing the app factory
load_dotenv()

from virasat import create_app  # noqa: E402 — must come after load_dotenv

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", 5000)),
        debug=app.config["DEBUG"],
    )
