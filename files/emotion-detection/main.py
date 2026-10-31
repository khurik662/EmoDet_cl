"""
Standalone Live Emotion Detection (OpenCV)
==========================================

Run emotion detection directly from your webcam with annotated live feed.
No Flask / browser required — useful for quick local testing.

Usage
-----
    python main.py                    # use default camera (0)
    python main.py --camera 1         # use a different camera index
    python main.py --backend mtcnn    # use a different face detector
    python main.py --skip 3           # analyze every 3rd frame (faster)
    python main.py --save demo.mp4    # record annotated video to file

Keys while running
------------------
    q or ESC : quit
    s        : save a screenshot (PNG) to ./screenshots/
    p        : pause / unpause
"""

from __future__ import annotations

import argparse
import os
import time
from datetime import datetime

import cv2

from detector import EmotionDetector, EMOTION_COLORS, EMOTIONS


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Live webcam emotion detection")
    p.add_argument("--camera",  type=int, default=0,
                   help="Camera index (default: 0)")
    p.add_argument("--backend", type=str, default="opencv",
                   choices=["opencv", "mediapipe", "mtcnn", "retinaface", "ssd"],
                   help="Face detector backend (default: opencv)")
    p.add_argument("--skip",    type=int, default=2,
                   help="Analyze every Nth frame, reuse last detections for others "
                        "(default: 2 — higher = faster but more laggy labels)")
    p.add_argument("--width",   type=int, default=960,
                   help="Capture width in pixels (default: 960)")
    p.add_argument("--height",  type=int, default=540,
                   help="Capture height in pixels (default: 540)")
    p.add_argument("--save",    type=str, default=None,
                   help="Optional output video file (e.g. demo.mp4)")
    return p.parse_args()


def draw_hud(frame, fps: float, paused: bool, backend: str) -> None:
    """Draw a small status bar at the top-left of the frame."""
    h, w = frame.shape[:2]
    cv2.rectangle(frame, (0, 0), (w, 30), (20, 20, 20), -1)
    status = "PAUSED" if paused else f"{fps:5.1f} FPS"
    text = f"Emotion Detection  |  {status}  |  backend={backend}  |  q=quit  s=snap  p=pause"
    cv2.putText(frame, text, (10, 20),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (230, 230, 230), 1, cv2.LINE_AA)


def draw_legend(frame) -> None:
    """Small legend showing what color means which emotion."""
    h, w = frame.shape[:2]
    x0 = 10
    y0 = h - 10 - 20 * len(EMOTIONS)
    for i, emo in enumerate(EMOTIONS):
        color = EMOTION_COLORS[emo]
        y = y0 + i * 20
        cv2.rectangle(frame, (x0, y), (x0 + 14, y + 14), color, -1)
        cv2.putText(frame, emo, (x0 + 20, y + 12),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (240, 240, 240), 1, cv2.LINE_AA)


def main() -> int:
    args = parse_args()

    print(f"[info] Opening camera {args.camera}...")
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"[error] Could not open camera {args.camera}")
        return 1

    cap.set(cv2.CAP_PROP_FRAME_WIDTH,  args.width)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, args.height)

    print(f"[info] Loading emotion detector (backend={args.backend})...")
    detector = EmotionDetector(detector_backend=args.backend)
    print("[info] Ready.")

    writer = None
    if args.save:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        writer = cv2.VideoWriter(args.save, fourcc, 20.0, (args.width, args.height))

    os.makedirs("screenshots", exist_ok=True)

    frame_count = 0
    last_detections = []
    paused = False
    t_last = time.time()
    fps = 0.0

    while True:
        if not paused:
            ok, frame = cap.read()
            if not ok:
                print("[warn] Failed to read frame; stopping.")
                break

            # Only run (expensive) detection on every Nth frame to keep FPS up.
            if frame_count % max(1, args.skip) == 0:
                last_detections = detector.detect(frame)

            annotated = detector.annotate(frame, last_detections)

            # FPS calc
            now = time.time()
            dt = now - t_last
            t_last = now
            if dt > 0:
                fps = 0.9 * fps + 0.1 * (1.0 / dt)  # EMA smoothing

            draw_hud(annotated, fps, paused=False, backend=args.backend)
            draw_legend(annotated)

            if writer is not None:
                writer.write(annotated)

            cv2.imshow("Emotion Detection", annotated)
            frame_count += 1

        key = cv2.waitKey(1) & 0xFF
        if key in (ord("q"), 27):           # q or ESC
            break
        elif key == ord("s"):
            fname = os.path.join(
                "screenshots",
                f"snap_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png",
            )
            cv2.imwrite(fname, annotated)
            print(f"[info] Screenshot saved: {fname}")
        elif key == ord("p"):
            paused = not paused
            print(f"[info] {'Paused' if paused else 'Resumed'}")

    cap.release()
    if writer is not None:
        writer.release()
    cv2.destroyAllWindows()
    print("[info] Bye!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
