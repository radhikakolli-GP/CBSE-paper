#!/bin/bash
# Double-click this file (in Finder) to start the whole app and open it in
# your browser. Leave this Terminal window open while you use the app -
# closing it stops the backend and frontend. Press Ctrl+C here to stop them
# without closing the window.
#
# Why this exists: the frontend is a Vite + React app now, not a plain HTML
# file - opening frontend/index.html or frontend/dist/index.html directly
# (double-click, or a file:/// URL) shows a blank page, because browsers
# block the ES module <script> tags Vite's build relies on when a page is
# loaded from disk instead of served over http://. This script starts a
# real local server for both halves of the app instead.

cd "$(dirname "$0")"

BACKEND_PORT=8000
FRONTEND_PORT=5173

cleanup() {
  echo ""
  echo "Stopping..."
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
  exit 0
}
trap cleanup INT TERM

# Free up the ports first, in case a previous run didn't shut down cleanly.
lsof -ti:$BACKEND_PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null
lsof -ti:$FRONTEND_PORT -sTCP:LISTEN | xargs -r kill 2>/dev/null

echo "Starting backend on port $BACKEND_PORT..."
(cd backend && python3 server.py) &
BACKEND_PID=$!

if [ ! -d "frontend/node_modules" ]; then
  echo "First run - installing frontend dependencies (this can take a minute)..."
  (cd frontend && npm install)
fi

echo "Starting frontend on port $FRONTEND_PORT..."
(cd frontend && npm run dev -- --port $FRONTEND_PORT) &
FRONTEND_PID=$!

echo "Waiting for both to come up..."
for i in $(seq 1 60); do
  curl -sf "http://localhost:$BACKEND_PORT/api/subjects" >/dev/null 2>&1 && BACKEND_UP=1
  curl -sf "http://localhost:$FRONTEND_PORT" >/dev/null 2>&1 && FRONTEND_UP=1
  [ -n "$BACKEND_UP" ] && [ -n "$FRONTEND_UP" ] && break
  sleep 1
done

if [ -z "$BACKEND_UP" ] || [ -z "$FRONTEND_UP" ]; then
  echo "Something didn't start in time - check the output above for errors."
else
  echo "Both are up. Opening the app..."
  open "http://localhost:$FRONTEND_PORT"
fi

echo ""
echo "The app is running. Keep this window open while you use it."
echo "Press Ctrl+C, or just close this window, to stop it."
wait
