"""
Flask Web App for Emotion Detection
====================================

Architecture
------------
- The browser uses getUserMedia() to access the webcam locally.
- Every ~500ms the browser grabs a frame, JPEG-encodes it, sends it as
  base64 to POST /analyze.
- Flask decodes the image, runs DeepFace via EmotionDetector, and returns
  JSON with bounding boxes and per-emotion probabilities.
- The browser draws overlays on a <canvas> stacked on top of the <video>.

Why client-side capture?
------------------------
This pattern means the camera access works wherever the browser runs — on
a laptop, on a phone, across a LAN — without the server needing a
physical webcam. It's the only pattern that works for a real deployment.

Run
---
    pip install -r requirements.txt
    python app.py

Then open http://localhost:5000 in Chrome, Firefox, or Safari.
"""

from __future__ import annotations

import base64
import io
import logging

import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image

from detector import EmotionDetector, EMOTIONS

# ---------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB upload limit

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(message)s")
log = logging.getLogger("emotion-app")

# Single, shared detector instance — loading the model takes a few seconds,
# so we only want to do it once at startup.
log.info("Initializing EmotionDetector (this can take 10–30s on first run)...")
detector = EmotionDetector(detector_backend="opencv")
log.info("EmotionDetector ready.")


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def _decode_image(data_url: str) -> np.ndarray | None:
    """
    Decode a data URL (e.g. 'data:image/jpeg;base64,...') into a BGR numpy
    array suitable for OpenCV / DeepFace. Returns None if decoding fails.
    """
    try:
        # Strip the data-URL header if present
        if "," in data_url:
            data_url = data_url.split(",", 1)[1]
        raw = base64.b64decode(data_url)
        img = Image.open(io.BytesIO(raw)).convert("RGB")
        arr = np.array(img)                     # RGB
        return arr[:, :, ::-1].copy()           # -> BGR for OpenCV / DeepFace
    except Exception as e:
        log.warning(f"Failed to decode image: {e}")
        return None


# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------

@app.route("/")
def index():
    """Main page: live webcam + overlays."""
    return render_template("index.html", emotions=EMOTIONS)


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Analyze a single frame.

    Expected JSON body:
        { "image": "data:image/jpeg;base64,....." }

    Response JSON:
        {
          "ok": true,
          "detections": [
            {
              "bbox":             [x, y, w, h],
              "dominant_emotion": "happy",
              "dominant_score":   0.92,
              "emotions":         { "angry": 0.01, "happy": 0.92, ... }
            },
            ...
          ],
          "frame_size": [width, height]
        }
    """
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image")
    if not image_data:
        return jsonify({"ok": False, "error": "No image in request"}), 400

    frame = _decode_image(image_data)
    if frame is None:
        return jsonify({"ok": False, "error": "Invalid image"}), 400

    detections = detector.detect(frame)

    # Convert tuples to lists so they're clean JSON
    for d in detections:
        d["bbox"] = list(d["bbox"])

    h, w = frame.shape[:2]
    return jsonify({
        "ok": True,
        "detections": detections,
        "frame_size": [w, h],
    })


@app.route("/health")
def health():
    """Simple liveness probe — useful for deployment."""
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------

if __name__ == "__main__":
    # Debug mode is fine for local development. For real deployment, serve
    # this with gunicorn: `gunicorn -w 1 -b 0.0.0.0:5000 app:app`
    # (Use only 1 worker because the DeepFace model is loaded per-process.)
    app.run(host="0.0.0.0", port=5000, debug=False)
