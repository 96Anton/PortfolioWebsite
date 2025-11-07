#!/usr/bin/env python3
"""Run a lightweight dev server so every page shares one origin.

Usage:
    python serve.py              # serves on http://127.0.0.1:8000
    python serve.py --port 5050  # choose a custom port

The script deliberately anchors the document root to the folder that
contains this file (PortfolioWebsite/). With the site served over HTTP
instead of file:// links, features that rely on localStorage – such as
achievement tracking – persist correctly between pages.
"""
from __future__ import annotations

import argparse
import json
import socket
import sys
import threading
import webbrowser
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

# Point the handler at the PortfolioWebsite directory so all links
# (including /Pages/contact.html) resolve under the same origin.
ROOT_DIR = Path(__file__).resolve().parent

# Shared in-memory achievement progress. This keeps state for the current dev session
# and is intentionally simple—ideal for a local preview environment. Because
# ThreadingHTTPServer handles each request in its own thread, access to the shared
# dictionary is protected with a lock.
_PROGRESS = {"clicks": 0, "unlocked": []}
_PROGRESS_LOCK = threading.Lock()


class PortfolioRequestHandler(SimpleHTTPRequestHandler):
    """Serve static files and expose a tiny JSON API for achievements."""

    # Ensure the handler serves files relative to the PortfolioWebsite directory.
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def _send_json(self, payload: dict, status: int = HTTPStatus.OK) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:  # noqa: N802 (follow BaseHTTPRequestHandler signature)
        parsed = urlparse(self.path)
        if parsed.path == "/api/achievements":
            with _PROGRESS_LOCK:
                payload = dict(_PROGRESS)
            self._send_json(payload)
            return

        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/achievements":
            content_length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(content_length) if content_length else b""

            try:
                body = json.loads(raw_body.decode("utf-8")) if raw_body else {}
                clicks = int(body.get("clicks", 0))
                unlocked = body.get("unlocked", [])
                if not isinstance(unlocked, list):
                    raise ValueError("'unlocked' must be a list")
            except Exception as error:  # broad catch to report malformed payloads
                self._send_json({"error": f"Invalid payload: {error}"}, HTTPStatus.BAD_REQUEST)
                return

            with _PROGRESS_LOCK:
                _PROGRESS["clicks"] = max(clicks, 0)
                # Ensure only unique string keys are stored.
                unique_keys = []
                for key in unlocked:
                    if isinstance(key, str) and key not in unique_keys:
                        unique_keys.append(key)
                _PROGRESS["unlocked"] = unique_keys

            self._send_json({"status": "ok"})
            return

        super().do_POST()


def find_available_port(preferred: int) -> int:
    """Return the preferred port if free, otherwise ask the OS for any free one."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind(("127.0.0.1", preferred))
        except OSError:
            # Port is busy; let the OS choose an available port by binding to 0.
            sock.bind(("127.0.0.1", 0))
        # getsockname returns (host, port) for the bound socket.
        return sock.getsockname()[1]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Serve the portfolio locally")
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to listen on (defaults to 8000, falls back to a free port if taken)",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not auto-open the site in the default browser",
    )
    args = parser.parse_args(argv)

    port = find_available_port(args.port)
    # ThreadingHTTPServer handles multiple requests concurrently and keeps the CLI responsive.
    server = ThreadingHTTPServer(("127.0.0.1", port), PortfolioRequestHandler)

    url = f"http://127.0.0.1:{port}/home.html"
    print(f"Serving PortfolioWebsite from {ROOT_DIR}")
    print(f"Open {url} to view the site. Press Ctrl+C to stop.\n")

    if not args.no_browser:
        # Open the site automatically to streamline the dev workflow.
        webbrowser.open(url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
