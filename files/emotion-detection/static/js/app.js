/* ================================================================
 * Emotion Detection — client-side controller
 *
 * Flow:
 *   1. User clicks Start -> request webcam via getUserMedia()
 *   2. Video plays into a <video> element (mirrored)
 *   3. Every N ms we snap a JPEG frame, POST it to /analyze
 *   4. Draw bounding boxes + labels onto an <canvas> overlay
 *   5. Update the side panel with confidence bars
 * ================================================================ */

(() => {
    "use strict";

    // ---------- Elements -----------------------------------------
    const video        = document.getElementById("video");
    const overlay      = document.getElementById("overlay");
    const ctx          = overlay.getContext("2d");
    const startBtn     = document.getElementById("startBtn");
    const stopBtn      = document.getElementById("stopBtn");
    const snapBtn      = document.getElementById("snapBtn");
    const rateInput    = document.getElementById("rate");
    const rateVal      = document.getElementById("rateVal");
    const statusEl     = document.getElementById("status");
    const statusText   = statusEl.querySelector(".status-text");
    const videoWrap    = document.getElementById("videoWrap");
    const dominantName  = document.getElementById("dominantName");
    const dominantScore = document.getElementById("dominantScore");
    const dominantEmoji = document.getElementById("dominantEmoji");
    const faceCountEl   = document.getElementById("faceCount");
    const fpsEl         = document.getElementById("fps");
    const latencyEl     = document.getElementById("latency");

    // ---------- Config -------------------------------------------
    const EMOJI = {
        angry: "😠", disgust: "🤢", fear: "😨", happy: "😄",
        sad: "😢", surprise: "😲", neutral: "😐",
    };
    const EMOTION_COLORS = {
        angry: "#ef4444", disgust: "#22c55e", fear: "#a855f7",
        happy: "#facc15", sad: "#3b82f6", surprise: "#f97316",
        neutral: "#94a3b8",
    };
    const EMOTIONS = Object.keys(EMOJI);

    // ---------- State --------------------------------------------
    let stream = null;
    let analyzeTimer = null;
    let snapCanvas = null;
    let snapCtx = null;
    let analyzeMs = parseInt(rateInput.value, 10);
    let inFlight = false;
    let analysesInWindow = [];
    let lastLatencyMs = null;

    // ---------- UI helpers ---------------------------------------
    function setStatus(state, text) {
        statusEl.className = `status status--${state}`;
        statusText.textContent = text;
    }

    function resizeOverlayToVideo() {
        if (!video.videoWidth) return;
        overlay.width  = video.videoWidth;
        overlay.height = video.videoHeight;
    }

    function clearUi() {
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        dominantName.textContent = "waiting…";
        dominantScore.textContent = "—";
        dominantEmoji.textContent = "—";
        faceCountEl.textContent = "0";
        fpsEl.textContent = "0.0";
        latencyEl.textContent = "—";
        for (const e of EMOTIONS) {
            const row = document.querySelector(`.bar-row[data-emotion="${e}"]`);
            row.querySelector(".bar-fill").style.width = "0%";
            row.querySelector(".bar-value").textContent = "0%";
        }
    }

    // ---------- Camera control -----------------------------------
    async function startCamera() {
        setStatus("loading", "Requesting camera…");
        startBtn.disabled = true;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: "user" },
                audio: false,
            });
            video.srcObject = stream;
            await video.play();
            resizeOverlayToVideo();
            video.addEventListener("loadedmetadata", resizeOverlayToVideo);

            // Hidden canvas we use to grab JPEG frames
            snapCanvas = document.createElement("canvas");
            snapCtx = snapCanvas.getContext("2d");

            videoWrap.classList.add("active");
            stopBtn.disabled = false;
            snapBtn.disabled = false;
            setStatus("live", "Live");
            scheduleAnalyze();
        } catch (err) {
            console.error(err);
            setStatus("error", "Camera denied");
            startBtn.disabled = false;
            alert(
                "Could not access camera.\n\n" +
                "Make sure you granted permission and that no other app is using it.\n\n" +
                "Details: " + err.message
            );
        }
    }

    function stopCamera() {
        if (analyzeTimer) { clearTimeout(analyzeTimer); analyzeTimer = null; }
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        video.srcObject = null;
        videoWrap.classList.remove("active");
        clearUi();
        setStatus("idle", "Stopped");
        startBtn.disabled = false;
        stopBtn.disabled = true;
        snapBtn.disabled = true;
    }

    // ---------- Frame capture + analysis -------------------------
    function scheduleAnalyze() {
        analyzeTimer = setTimeout(async () => {
            await analyzeOnce();
            if (stream) scheduleAnalyze();
        }, analyzeMs);
    }

    async function analyzeOnce() {
        if (!video.videoWidth || inFlight) return;

        inFlight = true;
        const t0 = performance.now();

        // Grab frame (downscaled for speed — 480p is plenty for emotion detection)
        const targetW = 480;
        const scale = targetW / video.videoWidth;
        snapCanvas.width  = targetW;
        snapCanvas.height = Math.round(video.videoHeight * scale);
        snapCtx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
        const dataUrl = snapCanvas.toDataURL("image/jpeg", 0.7);

        try {
            const res = await fetch("/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: dataUrl }),
            });
            const json = await res.json();
            const t1 = performance.now();
            lastLatencyMs = Math.round(t1 - t0);

            if (json.ok) {
                renderDetections(json.detections, json.frame_size);
                updateStats(json.detections.length);
            }
        } catch (err) {
            console.warn("Analyze failed:", err);
        } finally {
            inFlight = false;
        }
    }

    // ---------- Rendering ----------------------------------------
    function renderDetections(detections, frameSize) {
        const [sourceW, sourceH] = frameSize;
        const scaleX = overlay.width  / sourceW;
        const scaleY = overlay.height / sourceH;

        ctx.clearRect(0, 0, overlay.width, overlay.height);

        if (detections.length === 0) {
            dominantName.textContent = "no face";
            dominantScore.textContent = "—";
            dominantEmoji.textContent = "—";
            for (const e of EMOTIONS) {
                const row = document.querySelector(`.bar-row[data-emotion="${e}"]`);
                row.querySelector(".bar-fill").style.width = "0%";
                row.querySelector(".bar-value").textContent = "0%";
            }
            return;
        }

        // Draw each face box + emotion label
        for (const det of detections) {
            const [x, y, w, h] = det.bbox;
            const color = EMOTION_COLORS[det.dominant_emotion] || "#fff";
            const sx = x * scaleX;
            const sy = y * scaleY;
            const sw = w * scaleX;
            const sh = h * scaleY;

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(sx, sy, sw, sh);

            // Label background
            const label = `${det.dominant_emotion.toUpperCase()} ${Math.round(det.dominant_score * 100)}%`;
            ctx.font = "600 16px -apple-system, Segoe UI, Roboto, sans-serif";
            const pad = 6;
            const textW = ctx.measureText(label).width;
            const labelH = 22;
            ctx.fillStyle = color;
            ctx.fillRect(sx, sy - labelH, textW + pad * 2, labelH);
            ctx.fillStyle = "#0b0f17";
            ctx.fillText(label, sx + pad, sy - 6);
        }

        // Side-panel: use the face with the largest box as "main" subject
        const main = detections.reduce((a, b) =>
            (b.bbox[2] * b.bbox[3] > a.bbox[2] * a.bbox[3] ? b : a)
        );
        dominantName.textContent  = main.dominant_emotion;
        dominantScore.textContent = `${(main.dominant_score * 100).toFixed(1)}%`;
        dominantEmoji.textContent = EMOJI[main.dominant_emotion] || "🙂";

        for (const e of EMOTIONS) {
            const row = document.querySelector(`.bar-row[data-emotion="${e}"]`);
            const pct = (main.emotions[e] || 0) * 100;
            row.querySelector(".bar-fill").style.width = pct.toFixed(1) + "%";
            row.querySelector(".bar-value").textContent = Math.round(pct) + "%";
        }
    }

    function updateStats(faceCount) {
        faceCountEl.textContent = faceCount;

        const now = performance.now();
        analysesInWindow.push(now);
        analysesInWindow = analysesInWindow.filter(t => now - t < 1000);
        fpsEl.textContent = analysesInWindow.length.toFixed(1);

        if (lastLatencyMs !== null) {
            latencyEl.textContent = lastLatencyMs + " ms";
        }
    }

    // ---------- Snapshot -----------------------------------------
    function takeSnapshot() {
        // Combine video frame + overlay into one image
        const c = document.createElement("canvas");
        c.width = overlay.width;
        c.height = overlay.height;
        const cctx = c.getContext("2d");
        // Mirror the video to match the display
        cctx.save();
        cctx.translate(c.width, 0);
        cctx.scale(-1, 1);
        cctx.drawImage(video, 0, 0, c.width, c.height);
        cctx.restore();
        cctx.drawImage(overlay, 0, 0);

        const link = document.createElement("a");
        link.download = `emotion_snap_${Date.now()}.png`;
        link.href = c.toDataURL("image/png");
        link.click();
    }

    // ---------- Wire up events -----------------------------------
    startBtn.addEventListener("click", startCamera);
    stopBtn .addEventListener("click", stopCamera);
    snapBtn .addEventListener("click", takeSnapshot);

    rateInput.addEventListener("input", () => {
        analyzeMs = parseInt(rateInput.value, 10);
        rateVal.textContent = analyzeMs + " ms";
    });

    // Redraw overlay on video resize (e.g. window resize)
    window.addEventListener("resize", resizeOverlayToVideo);
    video.addEventListener("resize", resizeOverlayToVideo);

    // Tell user we're ready
    setStatus("idle", "Ready");
    rateVal.textContent = analyzeMs + " ms";
})();
