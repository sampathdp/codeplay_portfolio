"""Entry point for cPanel's "Setup Python App" (Phusion Passenger).

Passenger on shared hosting expects a WSGI callable named `application` in
this exact file - but FastAPI/Starlette is an ASGI app. a2wsgi's
ASGIMiddleware bridges the two: it runs our async app's event loop
internally per request and presents a plain synchronous WSGI interface to
Passenger, so nothing about app/main.py has to change for this deployment
target vs. running it locally with uvicorn.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from a2wsgi import ASGIMiddleware  # noqa: E402

from app.main import app as _asgi_app  # noqa: E402

application = ASGIMiddleware(_asgi_app)
