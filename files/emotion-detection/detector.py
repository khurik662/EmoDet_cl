"""
Emotion Detection Core Module
==============================

Wraps DeepFace to provide a simple, reusable interface for detecting emotions
in images or video frames. Returns the dominant emotion plus confidence scores
for all 7 standard emotions: angry, disgust, fear, happy, sad, surprise, neutral.

Used by both `main.py` (standalone OpenCV app) and `app.py` (Flask web app).
"""

from __future__ import annotations

import logging
from typing import Dict, List, Tuple

import cv2
import numpy as np

# Silence DeepFace/TensorFlow noisy logging at import time
logging.getLogger("tensorflow").setLevel(logging.ERROR)
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from deepface import DeepFace  # noqa: E402


# The 7 standard emotions that DeepFace outputs
EMOTIONS: Tuple[str, ...] = (
    "angry", "disgust", "fear", "happy", "sad", "surprise", "neutral",
)

# BGR colors (OpenCV uses BGR, not RGB) for visualization
EMOTION_COLORS: Dict[str, Tuple[int, int, int]] = {
    "angry":    (60,  60,  220),   # red
    "disgust":  (60,  140, 60),    # green
    "fear":     (140, 60,  140),   # purple
    "happy":    (60,  200, 230),   # yellow-gold
    "sad":      (200, 120, 60),    # blue
    "surprise": (50,  150, 240),   # orange
    "neutral":  (180, 180, 180),   # gray
}


class EmotionDetector:
    """
    Detects emotions in images using DeepFace.

    Parameters
    ----------
    detector_backend : str
        Face detection backend. Options:
          - 'opencv'     (fastest, slightly lower accuracy) — default
          - 'mediapipe'  (fast, good accuracy)
          - 'mtcnn'      (slower, high accuracy)
          - 'retinaface' (slowest, highest accuracy)
        Choose based on your hardware and accuracy needs.
    """

    def __init__(self, detector_backend: str = "opencv") -> None:
        self.detector_backend = detector_backend
        self._warmup()

    def _warmup(self) -> None:
        """Trigger model download and loading on first use, so the first real
        call isn't slow."""
        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        try:
            DeepFace.analyze(
                img_path=dummy,
                actions=["emotion"],
                enforce_detection=False,
                detector_backend=self.detector_backend,
                silent=True,
            )
        except Exception:
            # Warmup failures are non-fatal; real calls will surface errors
            pass

    def detect(self, frame: np.ndarray) -> List[Dict]:
        """
        Run emotion detection on a BGR image/frame.

        Returns
        -------
        list of dict
            Each dict describes one detected face:
              - 'bbox':             (x, y, w, h) in pixels
              - 'dominant_emotion': str
              - 'dominant_score':   float in [0.0, 1.0]
              - 'emotions':         dict mapping each emotion to its probability
            Returns an empty list if no faces are detected.
        """
        if frame is None or frame.size == 0:
            return []

        try:
            results = DeepFace.analyze(
                img_path=frame,
                actions=["emotion"],
                enforce_detection=False,
                detector_backend=self.detector_backend,
                silent=True,
            )
        except Exception:
            return []

        # DeepFace returns a list in newer versions, a dict in older ones
        if isinstance(results, dict):
            results = [results]

        h, w = frame.shape[:2]
        detections: List[Dict] = []

        for r in results:
            region = r.get("region", {}) or {}
            x = int(region.get("x", 0))
            y = int(region.get("y", 0))
            bw = int(region.get("w", 0))
            bh = int(region.get("h", 0))

            # Skip the "whole frame" fallback when no real face is detected.
            # DeepFace returns the full image bounds when it can't find a face.
            if bw == 0 or bh == 0:
                continue
            if x == 0 and y == 0 and bw == w and bh == h:
                continue

            # DeepFace gives emotion scores as percentages (0-100). Normalize.
            raw = r.get("emotion", {}) or {}
            emotions = {k: float(v) / 100.0 for k, v in raw.items()}

            dominant = r.get("dominant_emotion", "neutral")
            dominant_score = emotions.get(dominant, 0.0)

            detections.append({
                "bbox": (x, y, bw, bh),
                "dominant_emotion": dominant,
                "dominant_score": dominant_score,
                "emotions": emotions,
            })

        return detections

    # ------------------------------------------------------------------ #
    # Visualization helpers                                              #
    # ------------------------------------------------------------------ #

    @staticmethod
    def annotate(frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """
        Draw bounding boxes, labels, and mini confidence bars on a frame.
        Returns a new annotated frame (does not modify input).
        """
        out = frame.copy()

        for det in detections:
            x, y, bw, bh = det["bbox"]
            emotion = det["dominant_emotion"]
            score = det["dominant_score"]
            color = EMOTION_COLORS.get(emotion, (255, 255, 255))

            # Face bounding box
            cv2.rectangle(out, (x, y), (x + bw, y + bh), color, 2)

            # Emotion label above the box
            label = f"{emotion.upper()} {score * 100:.0f}%"
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.65
            thickness = 2
            (text_w, text_h), baseline = cv2.getTextSize(label, font, font_scale, thickness)

            # Label background
            label_y = max(y - 10, text_h + 10)
            cv2.rectangle(
                out,
                (x, label_y - text_h - 8),
                (x + text_w + 10, label_y + baseline - 4),
                color,
                -1,
            )
            cv2.putText(
                out, label, (x + 5, label_y - 4),
                font, font_scale, (20, 20, 20), thickness, cv2.LINE_AA,
            )

            # Mini probability bars on the right of the face box
            _draw_probability_bars(out, det["emotions"], x + bw + 8, y, height=bh)

        return out


def _draw_probability_bars(
    frame: np.ndarray,
    emotions: Dict[str, float],
    origin_x: int,
    origin_y: int,
    height: int,
    bar_width: int = 120,
) -> None:
    """Draw a vertical stack of horizontal confidence bars next to a face box."""
    # Don't draw bars if they'd go off the right edge
    frame_w = frame.shape[1]
    if origin_x + bar_width > frame_w - 5:
        return

    n = len(EMOTIONS)
    row_h = max(14, height // n)
    label_w = 70  # space for the emotion name

    for i, emo in enumerate(EMOTIONS):
        p = emotions.get(emo, 0.0)
        y0 = origin_y + i * row_h
        y1 = y0 + row_h - 3
        color = EMOTION_COLORS.get(emo, (200, 200, 200))

        # Emotion label
        cv2.putText(
            frame, emo, (origin_x, y1 - 2),
            cv2.FONT_HERSHEY_SIMPLEX, 0.4, (230, 230, 230), 1, cv2.LINE_AA,
        )

        # Bar background
        bx0 = origin_x + label_w
        bx1 = origin_x + bar_width
        cv2.rectangle(frame, (bx0, y0 + 2), (bx1, y1 - 2), (60, 60, 60), -1)

        # Filled portion
        fill_end = int(bx0 + (bx1 - bx0) * p)
        if fill_end > bx0:
            cv2.rectangle(frame, (bx0, y0 + 2), (fill_end, y1 - 2), color, -1)


# ----------------------------------------------------------------------- #
# Quick self-test                                                         #
# ----------------------------------------------------------------------- #

if __name__ == "__main__":
    print("Warming up detector...")
    det = EmotionDetector()
    print("Ready. EmotionDetector can now be used.")
    print("Supported emotions:", ", ".join(EMOTIONS))
