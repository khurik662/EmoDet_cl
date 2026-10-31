# 🎭 Live Emotion Detection

A real-time facial emotion recognition system using a live webcam feed.
Detects 7 standard emotions (**angry, disgust, fear, happy, sad, surprise, neutral**)
with per-emotion confidence scores.

Two ways to run it:

1. **Standalone desktop** (`main.py`) — OpenCV window with live annotated feed.
2. **Flask web app** (`app.py`) — browser UI with live stats panel. Deployable.

---

## 📸 Demo

| Desktop (OpenCV)                         | Web (Flask)                        |
| ---------------------------------------- | ---------------------------------- |
| ![desktop](screenshots/desktop.png)      | ![web](screenshots/web.png)        |

> Take your own screenshots by pressing **`s`** (desktop) or the 📸 button (web).

---

## 🧠 How it works

```
   ┌──────────────┐    frame     ┌────────────────────┐    face bbox   ┌──────────────────┐
   │   Webcam     │ ───────────▶ │  Face Detection    │ ─────────────▶ │  Emotion CNN     │
   │ (OpenCV / JS)│              │ (OpenCV Haar /     │                │ (DeepFace model, │
   └──────────────┘              │  MediaPipe / etc.) │                │  ~96% FER acc.)  │
                                  └────────────────────┘                └──────────────────┘
                                                                                  │
                                                                                  ▼
                                                             ┌────────────────────────────┐
                                                             │ {angry: 0.02, happy: 0.87, │
                                                             │  sad: 0.01, ...}           │
                                                             └────────────────────────────┘
                                                                        │
                                                                        ▼
                                                             Draw bbox + label + bars
```

- **Face detection**: OpenCV Haar cascade (default) — fastest. Swap for MTCNN / RetinaFace for higher accuracy.
- **Emotion classification**: [DeepFace](https://github.com/serengil/deepface)'s pre-trained CNN, trained on the FER-2013 dataset.
- **Output**: Dominant emotion + confidence scores for all 7 emotions, per detected face.

---

## 🗂 Project structure

```
emotion-detection/
├── detector.py          ← Core EmotionDetector class (reusable)
├── main.py              ← Standalone OpenCV desktop app
├── app.py               ← Flask web app
├── requirements.txt
├── README.md
│
├── templates/
│   └── index.html       ← Web UI markup
├── static/
│   ├── css/style.css    ← Web UI styles
│   └── js/app.js        ← Client-side webcam + overlay logic
│
├── screenshots/         ← Created automatically for `s` key snapshots
└── docs/
    ├── presentation.pptx
    └── poster.pdf
```

---

## ⚙️ Setup

### 1. Clone / download this folder

### 2. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate         # Linux / macOS
# .venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

> ⚠️ This installs TensorFlow (~400 MB). First run also downloads the DeepFace emotion model (~5 MB). Both are cached after the first download.

---

## 🚀 Running

### Option A — Standalone desktop app

```bash
python main.py
```

Useful flags:

```bash
python main.py --camera 0 --skip 2                 # default: camera 0, every 2nd frame
python main.py --backend mediapipe                 # switch face detector
python main.py --save demo.mp4                     # record output video
```

Keys while running:
- **`q`** or **`ESC`** — quit
- **`s`** — save a screenshot to `screenshots/`
- **`p`** — pause / unpause

### Option B — Flask web app

```bash
python app.py
```

Open <http://localhost:5000> in Chrome, Firefox, or Safari. Click **Start Camera**, grant permission.

For production:

```bash
gunicorn -w 1 -b 0.0.0.0:5000 app:app
```

> Use `-w 1` (a single worker). Each worker loads the full TensorFlow model into memory.

---

## 🛠 Configuration

You can change the **face detector backend** in either entry point. Options:

| Backend      | Speed     | Accuracy  | Notes                                     |
| ------------ | --------- | --------- | ----------------------------------------- |
| `opencv`     | 🟢 fastest | 🟡 decent  | Haar cascade — default                    |
| `mediapipe`  | 🟢 fast    | 🟢 good    | Google's MediaPipe — recommended balance  |
| `mtcnn`      | 🟡 slower  | 🟢 great   | Deep-learning detector                    |
| `retinaface` | 🔴 slowest | 🟢 best    | State of the art, GPU strongly advised    |

Set in `app.py`:

```python
detector = EmotionDetector(detector_backend="mediapipe")
```

Or on the CLI:

```bash
python main.py --backend retinaface
```

---

## 📊 Performance notes

- CPU-only, 720p webcam: **~5–12 FPS end-to-end** depending on backend.
- Client-side downscaling to 480p before sending keeps latency low (<150 ms round-trip on localhost).
- Analysis rate is configurable from the web UI (200 ms → 1500 ms between analyses).

---

## 🧪 Troubleshooting

| Symptom                                   | Fix                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------- |
| `Could not open camera 0`                 | Close other apps using the webcam. Try `--camera 1` or `2`.          |
| Browser won't give camera permission      | HTTPS required on non-localhost. Use `localhost` or set up certs.   |
| "No module named 'deepface'"              | `pip install -r requirements.txt` inside your active venv.          |
| TensorFlow warnings / CUDA errors         | Harmless on CPU. Set `TF_CPP_MIN_LOG_LEVEL=3`.                      |
| Low FPS                                   | Increase `--skip`, switch to `opencv` backend, or lower resolution. |

---

## 📚 Tech stack

- **Python 3.10+**
- **DeepFace** — pre-trained emotion classifier
- **TensorFlow** — ML runtime for DeepFace
- **OpenCV** — camera access, image processing, drawing
- **Flask** — web backend
- **Vanilla HTML / CSS / JS** — no frontend framework; uses `getUserMedia()` and `<canvas>`.

---

## 📄 License

MIT — free to use, modify, and share.

## 🙏 Acknowledgements

- [DeepFace](https://github.com/serengil/deepface) by Sefik Ilkin Serengil
- [FER-2013 dataset](https://www.kaggle.com/datasets/msambare/fer2013)
- OpenCV community
