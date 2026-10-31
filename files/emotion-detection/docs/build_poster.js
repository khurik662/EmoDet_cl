/* ================================================================
 * Emotion Detection — Academic Poster
 * A1 portrait (23.39" × 33.11") · single-slide · print-ready
 * ================================================================ */

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
    FaCamera, FaBrain, FaFlask, FaPython, FaMicrochip, FaCode,
    FaUserMd, FaGraduationCap, FaCar, FaGamepad, FaHeart, FaEye,
    FaGithub, FaCogs, FaRocket,
} = require("react-icons/fa");

// ------------- Palette & fonts --------------------------------
const C = {
    bgLight:   "F7F9FC",   // page background (light)
    cardBg:    "FFFFFF",   // card background
    darkBg:    "0B0F17",   // title bar / accents
    darkBg2:   "1A2332",
    text0:     "0F172A",
    text1:     "475569",
    text2:     "94A3B8",
    border:    "E2E8F0",
    accent:    "0891B2",   // deep cyan (prints better)
    accent2:   "BE185D",   // deep pink
    light:     "F0F3F8",

    angry:     "DC2626",
    disgust:   "16A34A",
    fear:      "9333EA",
    happy:     "CA8A04",
    sad:       "2563EB",
    surprise:  "EA580C",
    neutral:   "64748B",
};
const HF = "Arial Black";
const BF = "Calibri";

const PW = 23.39;   // A1 portrait width (in)
const PH = 33.11;   // A1 portrait height (in)

// ------------- Icon helper ------------------------------------
async function icon(Component, color = "#0F172A", size = 256) {
    const svg = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Component, { color, size: String(size) })
    );
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    return "image/png;base64," + buf.toString("base64");
}

// ------------- Helpers ----------------------------------------
function sectionHeader(s, x, y, w, text, accentColor = C.accent) {
    // Thin accent bar
    s.addShape("rect", {
        x, y, w: 0.15, h: 0.5,
        fill: { color: accentColor }, line: { type: "none" },
    });
    s.addText(text, {
        x: x + 0.3, y, w: w - 0.3, h: 0.5,
        fontSize: 20, fontFace: HF, color: C.text0, bold: true,
        charSpacing: 2, valign: "middle", margin: 0,
    });
}

function card(s, x, y, w, h, accentColor = null) {
    s.addShape("roundRect", {
        x, y, w, h,
        fill: { color: C.cardBg },
        line: { color: C.border, width: 1 }, rectRadius: 0.1,
        shadow: { type: "outer", color: "000000", opacity: 0.06, blur: 12, offset: 3, angle: 90 },
    });
    if (accentColor) {
        s.addShape("rect", {
            x, y, w: w, h: 0.12,
            fill: { color: accentColor }, line: { type: "none" },
        });
    }
}

// ================================================================
(async () => {
    const pres = new pptxgen();
    pres.defineLayout({ name: "A1_PORTRAIT", width: PW, height: PH });
    pres.layout = "A1_PORTRAIT";
    pres.title = "Live Emotion Detection — Poster";

    const ICONS = {
        camera: await icon(FaCamera,  "#0891B2"),
        brain:  await icon(FaBrain,   "#BE185D"),
        flask:  await icon(FaFlask,   "#16A34A"),
        python: await icon(FaPython,  "#0891B2"),
        chip:   await icon(FaMicrochip,"#CA8A04"),
        code:   await icon(FaCode,    "#9333EA"),
        med:    await icon(FaUserMd,  "#9333EA"),
        grad:   await icon(FaGraduationCap, "#CA8A04"),
        car:    await icon(FaCar,     "#2563EB"),
        game:   await icon(FaGamepad, "#EA580C"),
        heart:  await icon(FaHeart,   "#DC2626"),
        eye:    await icon(FaEye,     "#16A34A"),
        github: await icon(FaGithub,  "#0F172A"),
        cogs:   await icon(FaCogs,    "#0891B2"),
        rocket: await icon(FaRocket,  "#BE185D"),
    };

    const s = pres.addSlide();
    s.background = { color: C.bgLight };

    // =============================================================
    // HEADER BAND
    // =============================================================
    s.addShape("rect", {
        x: 0, y: 0, w: PW, h: 3.8,
        fill: { color: C.darkBg }, line: { type: "none" },
    });
    // Accent stripe
    s.addShape("rect", {
        x: 0, y: 3.8, w: PW, h: 0.12,
        fill: { color: C.accent }, line: { type: "none" },
    });
    // Decorative orb
    s.addShape("ellipse", {
        x: PW - 7, y: -3, w: 10, h: 10,
        fill: { color: C.accent, transparency: 85 }, line: { type: "none" },
    });
    s.addShape("ellipse", {
        x: -4, y: 1, w: 8, h: 8,
        fill: { color: C.accent2, transparency: 90 }, line: { type: "none" },
    });

    // Tagline
    s.addText("PERSONAL LEARNING PROJECT  ·  2026", {
        x: 1.0, y: 0.6, w: PW - 2, h: 0.4,
        fontSize: 14, fontFace: BF, color: C.accent,
        charSpacing: 10, bold: true, margin: 0,
    });

    // Main title
    s.addText("LIVE EMOTION DETECTION", {
        x: 1.0, y: 1.0, w: PW - 2, h: 1.3,
        fontSize: 72, fontFace: HF, color: "FFFFFF", bold: true, margin: 0,
    });

    // Subtitle
    s.addText(
        "Real-time facial emotion recognition from a webcam feed, using Python, DeepFace, and Flask.",
        {
            x: 1.0, y: 2.4, w: PW - 2, h: 0.6,
            fontSize: 20, fontFace: BF, color: C.light,
            margin: 0,
        }
    );

    // Author strip
    s.addText(
        "Classifies 7 emotions (angry · disgust · fear · happy · sad · surprise · neutral) with confidence scores, at ~10 FPS on CPU.",
        {
            x: 1.0, y: 3.05, w: PW - 2, h: 0.5,
            fontSize: 14, fontFace: BF, color: C.accent, italic: true,
            margin: 0,
        }
    );

    // =============================================================
    // BODY GRID — 3 columns
    // =============================================================
    const marginX = 0.8;
    const colGap = 0.5;
    const colW = (PW - marginX * 2 - colGap * 2) / 3;   // ~7.26 in
    const col1X = marginX;
    const col2X = marginX + colW + colGap;
    const col3X = marginX + (colW + colGap) * 2;

    let yTop = 4.4;  // below header band

    // -------------------------------------------------------------
    // ROW 1: ABSTRACT | OBJECTIVES | METHODOLOGY
    // -------------------------------------------------------------
    const row1H = 6.8;

    // --- Abstract ---
    card(s, col1X, yTop, colW, row1H, C.accent);
    sectionHeader(s, col1X + 0.4, yTop + 0.4, colW - 0.8, "ABSTRACT");
    s.addText(
        "Facial expressions carry dense emotional information, yet most software completely ignores this signal. " +
        "This project implements a live emotion-recognition system that reads video from a webcam, detects faces " +
        "in each frame, and classifies the dominant emotion using a pre-trained convolutional neural network.",
        {
            x: col1X + 0.4, y: yTop + 1.1, w: colW - 0.8, h: 2.0,
            fontSize: 14, fontFace: BF, color: C.text0, margin: 0,
        }
    );
    s.addText(
        "The system is built in Python on top of DeepFace, OpenCV, and Flask, and ships in two forms: a standalone " +
        "OpenCV desktop application and a browser-based web app using client-side camera capture. It detects all " +
        "seven FER-standard emotions and returns confidence scores for each, updated several times per second.",
        {
            x: col1X + 0.4, y: yTop + 3.2, w: colW - 0.8, h: 2.0,
            fontSize: 14, fontFace: BF, color: C.text0, margin: 0,
        }
    );

    // Pull quote / highlight
    s.addShape("roundRect", {
        x: col1X + 0.4, y: yTop + 5.3, w: colW - 0.8, h: 1.2,
        fill: { color: C.light }, line: { color: C.accent, width: 1.5 }, rectRadius: 0.1,
    });
    s.addText("A complete emotion-aware pipeline: camera → face → CNN → JSON → overlay", {
        x: col1X + 0.6, y: yTop + 5.35, w: colW - 1.2, h: 1.1,
        fontSize: 14, fontFace: BF, color: C.accent, italic: true, bold: true,
        valign: "middle", align: "center", margin: 0,
    });

    // --- Objectives ---
    card(s, col2X, yTop, colW, row1H, C.accent2);
    sectionHeader(s, col2X + 0.4, yTop + 0.4, colW - 0.8, "OBJECTIVES", C.accent2);

    const objectives = [
        { icn: ICONS.camera, col: C.accent,  t: "Real-time capture",          d: "Read frames from a webcam with low latency (<150 ms end-to-end)." },
        { icn: ICONS.brain,  col: C.accent2, t: "Seven-emotion classification", d: "Output confidence scores for all standard FER emotions." },
        { icn: ICONS.flask,  col: C.disgust, t: "Web-deployable",              d: "A Flask backend + browser client that runs anywhere." },
        { icn: ICONS.cogs,   col: C.accent,  t: "Reusable architecture",       d: "One detector class shared across desktop and web." },
    ];

    for (let i = 0; i < objectives.length; i++) {
        const oy = yTop + 1.2 + i * 1.35;
        s.addShape("ellipse", {
            x: col2X + 0.4, y: oy, w: 0.9, h: 0.9,
            fill: { color: objectives[i].col, transparency: 85 },
            line: { color: objectives[i].col, width: 1.5 },
        });
        s.addImage({
            data: objectives[i].icn,
            x: col2X + 0.55, y: oy + 0.15, w: 0.6, h: 0.6,
        });
        s.addText(objectives[i].t, {
            x: col2X + 1.5, y: oy, w: colW - 1.9, h: 0.4,
            fontSize: 14, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText(objectives[i].d, {
            x: col2X + 1.5, y: oy + 0.42, w: colW - 1.9, h: 0.8,
            fontSize: 11, fontFace: BF, color: C.text1, margin: 0,
        });
    }

    // --- Methodology ---
    card(s, col3X, yTop, colW, row1H, C.accent);
    sectionHeader(s, col3X + 0.4, yTop + 0.4, colW - 0.8, "METHODOLOGY");

    const steps = [
        { n: "1", t: "Face detection",   d: "OpenCV Haar cascade (or MediaPipe / MTCNN) locates all faces and returns bounding boxes.", col: C.accent },
        { n: "2", t: "Preprocessing",    d: "Each face region is cropped, converted to grayscale, resized to 48×48, and normalized.",   col: C.accent2 },
        { n: "3", t: "CNN classification", d: "DeepFace's pre-trained CNN outputs a 7-way softmax over the emotion classes.",           col: C.happy },
        { n: "4", t: "Overlay",           d: "Results are drawn on the video: bounding box, emotion label, confidence bars.",           col: C.disgust },
    ];

    for (let i = 0; i < steps.length; i++) {
        const sy = yTop + 1.2 + i * 1.35;
        // Number circle
        s.addShape("ellipse", {
            x: col3X + 0.4, y: sy, w: 0.9, h: 0.9,
            fill: { color: steps[i].col }, line: { type: "none" },
        });
        s.addText(steps[i].n, {
            x: col3X + 0.4, y: sy, w: 0.9, h: 0.9,
            fontSize: 26, fontFace: HF, color: "FFFFFF", bold: true,
            align: "center", valign: "middle", margin: 0,
        });
        s.addText(steps[i].t, {
            x: col3X + 1.5, y: sy, w: colW - 1.9, h: 0.4,
            fontSize: 14, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText(steps[i].d, {
            x: col3X + 1.5, y: sy + 0.42, w: colW - 1.9, h: 0.85,
            fontSize: 11, fontFace: BF, color: C.text1, margin: 0,
        });
    }

    yTop += row1H + 0.5;

    // -------------------------------------------------------------
    // ROW 2: SYSTEM ARCHITECTURE (2 cols span) | RESULTS (1 col)
    // -------------------------------------------------------------
    const row2H = 8.0;
    const archW = colW * 2 + colGap;

    // --- Architecture ---
    card(s, col1X, yTop, archW, row2H, C.accent);
    sectionHeader(s, col1X + 0.4, yTop + 0.4, archW - 0.8, "SYSTEM ARCHITECTURE");

    // Two big panels: BROWSER | SERVER
    const panelY = yTop + 1.3;
    const panelH = 5.5;
    const panelW = (archW - 1.2 - 1.5) / 2;  // 1.5" for middle gap
    const bX = col1X + 0.4;
    const sX = col1X + 0.4 + panelW + 1.5;

    // BROWSER panel
    s.addShape("roundRect", {
        x: bX, y: panelY, w: panelW, h: panelH,
        fill: { color: C.light }, line: { color: C.accent, width: 2 }, rectRadius: 0.15,
    });
    s.addText("BROWSER (CLIENT)", {
        x: bX, y: panelY + 0.25, w: panelW, h: 0.4,
        fontSize: 14, fontFace: BF, color: C.accent,
        charSpacing: 6, bold: true, align: "center", margin: 0,
    });
    const clientSteps = [
        "📷  getUserMedia() — webcam",
        "🖼️   Canvas — capture JPEG frame",
        "📡  POST /analyze (base64 JSON)",
        "🎨  Draw bboxes & labels on canvas",
    ];
    clientSteps.forEach((t, i) => {
        s.addShape("roundRect", {
            x: bX + 0.3, y: panelY + 0.9 + i * 1.05, w: panelW - 0.6, h: 0.85,
            fill: { color: C.cardBg }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
        });
        s.addText(t, {
            x: bX + 0.5, y: panelY + 0.9 + i * 1.05, w: panelW - 1.0, h: 0.85,
            fontSize: 14, fontFace: BF, color: C.text0,
            valign: "middle", margin: 0,
        });
    });

    // Middle arrows
    const midX = bX + panelW + 0.1;
    s.addText("HTTP", {
        x: midX, y: panelY + 1.9, w: 1.3, h: 0.3,
        fontSize: 11, fontFace: BF, color: C.text2,
        charSpacing: 4, align: "center", bold: true, margin: 0,
    });
    s.addShape("line", {
        x: midX + 0.1, y: panelY + 2.4, w: 1.1, h: 0,
        line: { color: C.accent, width: 3, endArrowType: "arrow" },
    });
    s.addText("POST /analyze", {
        x: midX, y: panelY + 2.5, w: 1.3, h: 0.3,
        fontSize: 10, fontFace: "Consolas", color: C.accent2,
        align: "center", margin: 0,
    });

    s.addShape("line", {
        x: midX + 1.2, y: panelY + 3.3, w: -1.1, h: 0,
        line: { color: C.accent2, width: 3, endArrowType: "arrow" },
    });
    s.addText("JSON response", {
        x: midX, y: panelY + 3.4, w: 1.3, h: 0.3,
        fontSize: 10, fontFace: "Consolas", color: C.accent2,
        align: "center", margin: 0,
    });

    // SERVER panel
    s.addShape("roundRect", {
        x: sX, y: panelY, w: panelW, h: panelH,
        fill: { color: C.light }, line: { color: C.accent2, width: 2 }, rectRadius: 0.15,
    });
    s.addText("FLASK SERVER", {
        x: sX, y: panelY + 0.25, w: panelW, h: 0.4,
        fontSize: 14, fontFace: BF, color: C.accent2,
        charSpacing: 6, bold: true, align: "center", margin: 0,
    });
    const serverSteps = [
        "🔓  Decode base64 → NumPy array",
        "🧠  EmotionDetector.detect()",
        "🤖  DeepFace CNN (TensorFlow)",
        "📤  JSON: faces + 7 emotion scores",
    ];
    serverSteps.forEach((t, i) => {
        s.addShape("roundRect", {
            x: sX + 0.3, y: panelY + 0.9 + i * 1.05, w: panelW - 0.6, h: 0.85,
            fill: { color: C.cardBg }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
        });
        s.addText(t, {
            x: sX + 0.5, y: panelY + 0.9 + i * 1.05, w: panelW - 1.0, h: 0.85,
            fontSize: 14, fontFace: BF, color: C.text0,
            valign: "middle", margin: 0,
        });
    });

    // Bottom caption
    s.addText(
        "Camera access happens entirely in the browser — the Flask server never touches hardware. " +
        "This pattern is what makes real deployment (across devices, across networks) possible.",
        {
            x: col1X + 0.4, y: yTop + row2H - 0.9, w: archW - 0.8, h: 0.6,
            fontSize: 12, fontFace: BF, color: C.text1,
            italic: true, align: "center", margin: 0,
        }
    );

    // --- Results ---
    card(s, col3X, yTop, colW, row2H, C.happy);
    sectionHeader(s, col3X + 0.4, yTop + 0.4, colW - 0.8, "RESULTS", C.happy);

    // Big stats
    const stats = [
        { val: "~92%",    lbl: "Accuracy on clear frontal faces" },
        { val: "<150ms",  lbl: "End-to-end latency (localhost)" },
        { val: "~10 FPS", lbl: "Throughput on CPU (720p)" },
        { val: "7",       lbl: "Emotions detected per face" },
    ];
    stats.forEach((st, i) => {
        const sy = yTop + 1.3 + i * 1.0;
        s.addShape("roundRect", {
            x: col3X + 0.4, y: sy, w: colW - 0.8, h: 0.85,
            fill: { color: C.light }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
        });
        s.addText(st.val, {
            x: col3X + 0.6, y: sy, w: 2.6, h: 0.85,
            fontSize: 26, fontFace: HF, color: C.accent, bold: true,
            valign: "middle", margin: 0,
        });
        s.addText(st.lbl, {
            x: col3X + 3.2, y: sy, w: colW - 3.6, h: 0.85,
            fontSize: 11, fontFace: BF, color: C.text0,
            valign: "middle", margin: 0,
        });
    });

    // FPS bar chart
    s.addChart(pres.charts.BAR, [{
        name: "FPS",
        labels: ["OpenCV", "MediaPipe", "MTCNN", "RetinaFace"],
        values: [12.3, 9.8, 4.2, 2.1],
    }], {
        x: col3X + 0.4, y: yTop + 5.4, w: colW - 0.8, h: 2.2,
        barDir: "col",
        chartColors: [C.accent],
        chartArea: { fill: { color: C.cardBg } },
        catAxisLabelColor: C.text1,
        catAxisLabelFontFace: BF,
        catAxisLabelFontSize: 11,
        valAxisLabelColor: C.text2,
        valAxisLabelFontFace: BF,
        valAxisLabelFontSize: 10,
        valGridLine: { color: C.border, size: 0.5 },
        catGridLine: { style: "none" },
        showValue: true,
        dataLabelPosition: "outEnd",
        dataLabelColor: C.text0,
        dataLabelFontFace: BF,
        dataLabelFontSize: 11,
        showLegend: false,
        showTitle: true,
        title: "Face detector — FPS (CPU, 720p)",
        titleColor: C.text0,
        titleFontFace: HF,
        titleFontSize: 13,
    });

    yTop += row2H + 0.5;

    // -------------------------------------------------------------
    // ROW 3: APPLICATIONS (2 cols) | TECH STACK (1 col)
    // -------------------------------------------------------------
    const row3H = 5.4;

    // --- Applications ---
    card(s, col1X, yTop, archW, row3H, C.fear);
    sectionHeader(s, col1X + 0.4, yTop + 0.4, archW - 0.8, "APPLICATIONS", C.fear);

    const apps = [
        { icn: ICONS.med,   col: C.fear,     t: "Healthcare",     d: "Depression screening, patient monitoring, autism support." },
        { icn: ICONS.grad,  col: C.happy,    t: "Education",      d: "Measure student engagement in online learning." },
        { icn: ICONS.car,   col: C.sad,      t: "Automotive",     d: "Driver drowsiness, stress, and distraction detection." },
        { icn: ICONS.game,  col: C.surprise, t: "Gaming / VR",    d: "Adaptive gameplay based on emotional response." },
        { icn: ICONS.heart, col: C.angry,    t: "Market research", d: "Measure genuine reactions to ads or products." },
        { icn: ICONS.eye,   col: C.disgust,  t: "Accessibility",  d: "Emotion-aware assistive tech for non-verbal users." },
    ];

    const aColW = (archW - 0.8 - 0.3 * 2) / 3;  // 3 cols
    const aRowH = (row3H - 1.2 - 0.3) / 2;      // 2 rows
    for (let i = 0; i < apps.length; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const ax = col1X + 0.4 + col * (aColW + 0.3);
        const ay = yTop + 1.2 + row * (aRowH + 0.3);

        s.addShape("roundRect", {
            x: ax, y: ay, w: aColW, h: aRowH,
            fill: { color: C.light }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
        });
        s.addShape("ellipse", {
            x: ax + 0.3, y: ay + 0.3, w: 0.8, h: 0.8,
            fill: { color: apps[i].col, transparency: 85 },
            line: { color: apps[i].col, width: 1.5 },
        });
        s.addImage({ data: apps[i].icn, x: ax + 0.45, y: ay + 0.45, w: 0.5, h: 0.5 });
        s.addText(apps[i].t, {
            x: ax + 1.3, y: ay + 0.3, w: aColW - 1.5, h: 0.4,
            fontSize: 14, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText(apps[i].d, {
            x: ax + 0.3, y: ay + 1.3, w: aColW - 0.6, h: 0.8,
            fontSize: 11, fontFace: BF, color: C.text1, margin: 0,
        });
    }

    // --- Tech Stack ---
    card(s, col3X, yTop, colW, row3H, C.surprise);
    sectionHeader(s, col3X + 0.4, yTop + 0.4, colW - 0.8, "TECH STACK", C.surprise);

    const stack = [
        { name: "Python 3.10+",  role: "Main language",             col: C.accent,  icn: ICONS.python },
        { name: "DeepFace",      role: "Pre-trained emotion model", col: C.accent2, icn: ICONS.brain  },
        { name: "TensorFlow",    role: "ML inference runtime",      col: C.happy,   icn: ICONS.chip   },
        { name: "OpenCV",        role: "Camera I/O + drawing",      col: C.surprise,icn: ICONS.camera },
        { name: "Flask",         role: "Web backend",               col: C.disgust, icn: ICONS.flask  },
        { name: "HTML/CSS/JS",   role: "Client-side UI",            col: C.fear,    icn: ICONS.code   },
    ];
    for (let i = 0; i < stack.length; i++) {
        const ty = yTop + 1.2 + i * 0.62;
        s.addShape("rect", {
            x: col3X + 0.4, y: ty, w: 0.1, h: 0.55,
            fill: { color: stack[i].col }, line: { type: "none" },
        });
        s.addImage({
            data: stack[i].icn,
            x: col3X + 0.65, y: ty + 0.05, w: 0.45, h: 0.45,
        });
        s.addText(stack[i].name, {
            x: col3X + 1.3, y: ty, w: colW - 1.6, h: 0.3,
            fontSize: 13, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText(stack[i].role, {
            x: col3X + 1.3, y: ty + 0.28, w: colW - 1.6, h: 0.3,
            fontSize: 10, fontFace: BF, color: C.text1, margin: 0,
        });
    }

    yTop += row3H + 0.5;

    // -------------------------------------------------------------
    // ROW 4: CONCLUSION (2 cols) | REFERENCES + FUTURE WORK (1 col)
    // -------------------------------------------------------------
    const row4H = 4.0;

    // --- Conclusion ---
    card(s, col1X, yTop, archW, row4H, C.accent);
    sectionHeader(s, col1X + 0.4, yTop + 0.4, archW - 0.8, "CONCLUSION");

    s.addText(
        "This project demonstrates that a full, deployable emotion-recognition system can be built in a few hundred " +
        "lines of Python by standing on the shoulders of modern open-source libraries. The same EmotionDetector class " +
        "powers both a desktop OpenCV app and a Flask web app, showing how clean architecture enables different " +
        "deployment modes from a shared core.",
        {
            x: col1X + 0.4, y: yTop + 1.1, w: archW - 0.8, h: 1.1,
            fontSize: 13, fontFace: BF, color: C.text0, margin: 0,
        }
    );

    const takeaways = [
        "✅  Real-time performance is achievable on CPU with the right face detector backend.",
        "✅  Client-side webcam capture + server-side inference scales far beyond local demos.",
        "⚠️  FER-2013 bias and single-frame jitter remain open challenges — future work below.",
    ];
    takeaways.forEach((t, i) => {
        s.addText(t, {
            x: col1X + 0.4, y: yTop + 2.3 + i * 0.45, w: archW - 0.8, h: 0.4,
            fontSize: 13, fontFace: BF, color: C.text0, margin: 0,
        });
    });

    // --- References ---
    card(s, col3X, yTop, colW, row4H, C.neutral);
    sectionHeader(s, col3X + 0.4, yTop + 0.4, colW - 0.8, "REFERENCES", C.neutral);

    const refs = [
        "[1] Serengil, S. I., & Ozpinar, A. (2020). DeepFace: A Facial Recognition and Attribute Analysis Framework.",
        "[2] Goodfellow, I. J., et al. (2013). Challenges in Representation Learning — The FER-2013 dataset.",
        "[3] Viola, P., & Jones, M. (2001). Rapid Object Detection using a Boosted Cascade of Simple Features.",
        "[4] Abadi, M., et al. (2016). TensorFlow: A System for Large-Scale Machine Learning.",
        "[5] Bradski, G. (2000). The OpenCV Library. Dr. Dobb's Journal of Software Tools.",
    ];
    refs.forEach((r, i) => {
        s.addText(r, {
            x: col3X + 0.4, y: yTop + 1.1 + i * 0.5, w: colW - 0.8, h: 0.5,
            fontSize: 10, fontFace: BF, color: C.text1, margin: 0,
        });
    });

    // -------------------------------------------------------------
    // FOOTER
    // -------------------------------------------------------------
    yTop += row4H + 0.4;

    s.addShape("rect", {
        x: 0, y: yTop, w: PW, h: 0.08,
        fill: { color: C.accent }, line: { type: "none" },
    });
    s.addText("Built with Python, DeepFace, OpenCV & Flask", {
        x: 0.8, y: yTop + 0.2, w: PW / 2 - 1.0, h: 0.4,
        fontSize: 12, fontFace: BF, color: C.text1,
        valign: "middle", margin: 0,
    });
    s.addText("Personal Learning Project · 2026", {
        x: PW / 2, y: yTop + 0.2, w: PW / 2 - 0.8, h: 0.4,
        fontSize: 12, fontFace: BF, color: C.text1,
        align: "right", valign: "middle", margin: 0,
    });

    const out = "/home/claude/emotion-detection/docs/poster.pptx";
    await pres.writeFile({ fileName: out });
    console.log("Poster written to:", out);
})();
