/* ================================================================
 * Emotion Detection — Presentation Builder
 * Dark-themed deck, 16:9, 13 slides
 * ================================================================ */

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const {
    FaCamera, FaBrain, FaCode, FaChartBar, FaRocket,
    FaLightbulb, FaCogs, FaLaptop, FaGlobe, FaFlask,
    FaEye, FaHeart, FaUserMd, FaGamepad, FaCar,
    FaGraduationCap, FaSmile, FaExclamationTriangle,
    FaServer, FaMicrochip, FaPython, FaGithub,
} = require("react-icons/fa");

// ----------------------------------------------------------------
// Palette & fonts
// ----------------------------------------------------------------
const C = {
    bg0:       "0B0F17",   // deepest background
    bg1:       "131A26",   // card bg
    bg2:       "1A2332",   // elevated card
    bg3:       "232E40",   // borders / dividers
    text0:     "F0F3F8",   // primary
    text1:     "C4CCD8",   // secondary
    text2:     "7D8594",   // muted
    accent:    "4CC9F0",   // cyan
    accent2:   "F72585",   // pink
    border:    "2A3547",

    // Emotion colors
    angry:     "EF4444",
    disgust:   "22C55E",
    fear:      "A855F7",
    happy:     "FACC15",
    sad:       "3B82F6",
    surprise:  "F97316",
    neutral:   "94A3B8",
};

const HF = "Arial Black";    // header font
const BF = "Calibri";        // body font

const W = 10, H = 5.625;     // LAYOUT_16x9 in inches

// ----------------------------------------------------------------
// Icon helper — rasterize react-icons to base64 PNG
// ----------------------------------------------------------------
async function icon(Component, color = "#FFFFFF", size = 256) {
    const svg = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Component, { color, size: String(size) })
    );
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    return "image/png;base64," + buf.toString("base64");
}

// ----------------------------------------------------------------
// Reusable slide templates
// ----------------------------------------------------------------
function pageNumber(slide, n, total) {
    slide.addText(`${String(n).padStart(2, "0")} / ${total}`, {
        x: W - 1.1, y: H - 0.4, w: 0.9, h: 0.25,
        fontSize: 9, fontFace: BF, color: C.text2,
        align: "right", margin: 0,
    });
}

function addSlideTitle(slide, title, subtitle = null) {
    // Left accent strip (motif — carried across all content slides)
    slide.addShape("rect", {
        x: 0.4, y: 0.45, w: 0.08, h: 0.55,
        fill: { color: C.accent }, line: { type: "none" },
    });
    slide.addText(title, {
        x: 0.65, y: 0.35, w: W - 1.3, h: 0.7,
        fontSize: 28, fontFace: HF, color: C.text0, bold: true,
        margin: 0, valign: "middle",
    });
    if (subtitle) {
        slide.addText(subtitle, {
            x: 0.65, y: 1.0, w: W - 1.3, h: 0.35,
            fontSize: 13, fontFace: BF, color: C.accent,
            margin: 0,
        });
    }
}

function addBackground(slide) {
    slide.background = { color: C.bg0 };
}

// ================================================================
// MAIN
// ================================================================
(async () => {
    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.author = "Emotion Detection Project";
    pres.title  = "Live Emotion Detection";

    // Rasterize all icons up front (async)
    const ICONS = {
        camera:   await icon(FaCamera,   "#4CC9F0"),
        brain:    await icon(FaBrain,    "#F72585"),
        code:     await icon(FaCode,     "#4CC9F0"),
        chart:    await icon(FaChartBar, "#4CC9F0"),
        rocket:   await icon(FaRocket,   "#F72585"),
        bulb:     await icon(FaLightbulb,"#FACC15"),
        cogs:     await icon(FaCogs,     "#4CC9F0"),
        laptop:   await icon(FaLaptop,   "#4CC9F0"),
        globe:    await icon(FaGlobe,    "#4CC9F0"),
        flask:    await icon(FaFlask,    "#22C55E"),
        eye:      await icon(FaEye,      "#4CC9F0"),
        heart:    await icon(FaHeart,    "#EF4444"),
        med:      await icon(FaUserMd,   "#A855F7"),
        game:     await icon(FaGamepad,  "#F97316"),
        car:      await icon(FaCar,      "#3B82F6"),
        grad:     await icon(FaGraduationCap, "#FACC15"),
        smile:    await icon(FaSmile,    "#FACC15"),
        warn:     await icon(FaExclamationTriangle, "#F97316"),
        server:   await icon(FaServer,   "#4CC9F0"),
        chip:     await icon(FaMicrochip,"#4CC9F0"),
        python:   await icon(FaPython,   "#4CC9F0"),
        github:   await icon(FaGithub,   "#F0F3F8"),
    };

    const TOTAL = 13;

    // ==============================================================
    // Slide 1 — Title
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);

        // Decorative gradient orbs (simulated with overlapping ovals)
        s.addShape("ellipse", {
            x: -2, y: -2, w: 5, h: 5,
            fill: { color: C.accent, transparency: 80 }, line: { type: "none" },
        });
        s.addShape("ellipse", {
            x: W - 3, y: H - 3, w: 5, h: 5,
            fill: { color: C.accent2, transparency: 85 }, line: { type: "none" },
        });

        // Tagline above
        s.addText("PERSONAL LEARNING PROJECT · 2026", {
            x: 0.8, y: 1.6, w: 8.5, h: 0.3,
            fontSize: 11, fontFace: BF, color: C.accent,
            charSpacing: 8, bold: true, margin: 0,
        });

        // Main title
        s.addText("Live Emotion", {
            x: 0.8, y: 1.95, w: 8.5, h: 0.95,
            fontSize: 54, fontFace: HF, color: C.text0, bold: true,
            margin: 0,
        });
        s.addText("Detection", {
            x: 0.8, y: 2.75, w: 8.5, h: 0.95,
            fontSize: 54, fontFace: HF, color: C.accent, bold: true,
            margin: 0,
        });

        s.addText(
            "Real-time facial emotion recognition from a webcam feed, built with " +
            "Python, DeepFace, and Flask.",
            {
                x: 0.8, y: 3.7, w: 8, h: 0.7,
                fontSize: 15, fontFace: BF, color: C.text1,
                margin: 0,
            }
        );

        // Tech chip row
        const chips = ["Python", "DeepFace", "OpenCV", "Flask", "TensorFlow"];
        chips.forEach((t, i) => {
            const cx = 0.8 + i * 1.55;
            s.addShape("roundRect", {
                x: cx, y: 4.55, w: 1.35, h: 0.38,
                fill: { color: C.bg2 }, line: { color: C.border, width: 0.75 },
                rectRadius: 0.18,
            });
            s.addText(t, {
                x: cx, y: 4.55, w: 1.35, h: 0.38,
                fontSize: 10, fontFace: BF, color: C.text1,
                align: "center", valign: "middle", margin: 0,
            });
        });
    }

    // ==============================================================
    // Slide 2 — Problem & Motivation
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Why emotion detection?", "Motivation and problem statement");

        // Left column: narrative
        s.addText(
            "Human faces carry rich emotional signal — but most software is " +
            "completely blind to it. Giving machines the ability to perceive " +
            "emotional context unlocks a huge range of applications:",
            {
                x: 0.65, y: 1.6, w: 4.7, h: 1.5,
                fontSize: 14, fontFace: BF, color: C.text1,
                margin: 0, paraSpaceAfter: 6,
            }
        );

        // Small stat callouts
        s.addShape("roundRect", {
            x: 0.65, y: 3.3, w: 4.7, h: 1.0,
            fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
        });
        s.addText("43+ face/emotion-analysis muscles", {
            x: 0.85, y: 3.35, w: 4.3, h: 0.4,
            fontSize: 11, fontFace: BF, color: C.text2, margin: 0,
        });
        s.addText("that the human face uses to express state.", {
            x: 0.85, y: 3.7, w: 4.3, h: 0.6,
            fontSize: 14, fontFace: BF, color: C.text0, margin: 0,
        });

        // Right column — colored emotion tiles
        const emoData = [
            { name: "happy",    emoji: "😄", col: C.happy    },
            { name: "sad",      emoji: "😢", col: C.sad      },
            { name: "angry",    emoji: "😠", col: C.angry    },
            { name: "fear",     emoji: "😨", col: C.fear     },
            { name: "surprise", emoji: "😲", col: C.surprise },
            { name: "disgust",  emoji: "🤢", col: C.disgust  },
            { name: "neutral",  emoji: "😐", col: C.neutral  },
        ];
        const gridX = 5.6, gridY = 1.6, gw = 1.3, gh = 0.95, gap = 0.1;
        for (let i = 0; i < emoData.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = gridX + col * (gw + gap);
            const y = gridY + row * (gh + gap);
            const e = emoData[i];
            s.addShape("roundRect", {
                x, y, w: gw, h: gh,
                fill: { color: C.bg1 }, line: { color: e.col, width: 1.5 }, rectRadius: 0.1,
            });
            s.addText(e.emoji, {
                x, y: y + 0.05, w: gw, h: 0.45,
                fontSize: 22, align: "center", margin: 0,
            });
            s.addText(e.name, {
                x, y: y + 0.5, w: gw, h: 0.35,
                fontSize: 11, fontFace: BF, color: e.col,
                align: "center", valign: "middle", bold: true, margin: 0,
            });
        }

        pageNumber(s, 2, TOTAL);
    }

    // ==============================================================
    // Slide 3 — Objectives
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Project objectives", "What we set out to build");

        const objectives = [
            {
                icn: ICONS.camera, col: C.accent,
                title: "Real-time capture",
                body: "Read frames from a webcam with <100ms end-to-end latency.",
            },
            {
                icn: ICONS.brain, col: C.accent2,
                title: "Seven-emotion classification",
                body: "Angry · disgust · fear · happy · sad · surprise · neutral — with confidence scores for each.",
            },
            {
                icn: ICONS.globe, col: C.accent,
                title: "Web-deployable",
                body: "Not just a desktop script — a Flask backend that works in any browser.",
            },
            {
                icn: ICONS.cogs, col: C.accent2,
                title: "Clean, reusable architecture",
                body: "One core detector class shared by CLI and web. Easy to swap backends.",
            },
        ];

        for (let i = 0; i < objectives.length; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = 0.65 + col * 4.5;
            const y = 1.55 + row * 1.7;

            s.addShape("roundRect", {
                x, y, w: 4.2, h: 1.5,
                fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
            });
            // Icon circle
            s.addShape("ellipse", {
                x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6,
                fill: { color: C.bg2 }, line: { color: objectives[i].col, width: 1 },
            });
            s.addImage({
                data: objectives[i].icn,
                x: x + 0.35, y: y + 0.35, w: 0.4, h: 0.4,
            });
            s.addText(objectives[i].title, {
                x: x + 1.0, y: y + 0.2, w: 3.0, h: 0.4,
                fontSize: 15, fontFace: HF, color: C.text0, bold: true, margin: 0,
            });
            s.addText(objectives[i].body, {
                x: x + 1.0, y: y + 0.6, w: 3.0, h: 0.85,
                fontSize: 11, fontFace: BF, color: C.text1, margin: 0,
            });
        }

        pageNumber(s, 3, TOTAL);
    }

    // ==============================================================
    // Slide 4 — Applications
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Where is this used?", "Real-world applications of emotion AI");

        const apps = [
            { icn: ICONS.med,   col: C.fear,     title: "Healthcare",     body: "Depression screening, autism support, patient monitoring." },
            { icn: ICONS.grad,  col: C.happy,    title: "Education",      body: "Gauge student engagement during online learning sessions." },
            { icn: ICONS.car,   col: C.sad,      title: "Automotive",     body: "Detect driver drowsiness, stress, or distraction in real time." },
            { icn: ICONS.game,  col: C.surprise, title: "Gaming & VR",    body: "Adapt gameplay to player's emotional responses." },
            { icn: ICONS.heart, col: C.angry,    title: "Market research",body: "Measure genuine reactions to ads and products." },
            { icn: ICONS.eye,   col: C.disgust,  title: "Accessibility",  body: "Emotion-aware assistive tech for non-verbal users." },
        ];

        // 3-column grid
        const colW = 2.95, rowH = 1.55, gap = 0.15;
        for (let i = 0; i < apps.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = 0.55 + col * (colW + gap);
            const y = 1.55 + row * (rowH + gap);

            s.addShape("roundRect", {
                x, y, w: colW, h: rowH,
                fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
            });

            // Icon in colored circle
            s.addShape("ellipse", {
                x: x + 0.22, y: y + 0.25, w: 0.55, h: 0.55,
                fill: { color: apps[i].col, transparency: 80 }, line: { color: apps[i].col, width: 1 },
            });
            s.addImage({
                data: apps[i].icn,
                x: x + 0.32, y: y + 0.35, w: 0.35, h: 0.35,
            });

            s.addText(apps[i].title, {
                x: x + 0.95, y: y + 0.22, w: colW - 1.1, h: 0.4,
                fontSize: 13, fontFace: HF, color: C.text0, bold: true, margin: 0,
            });
            s.addText(apps[i].body, {
                x: x + 0.22, y: y + 0.85, w: colW - 0.4, h: 0.65,
                fontSize: 10, fontFace: BF, color: C.text1, margin: 0,
            });
        }

        pageNumber(s, 4, TOTAL);
    }

    // ==============================================================
    // Slide 5 — How it works / Background
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "How it works", "From pixels to emotions in 3 steps");

        // 3 step boxes with arrows
        const steps = [
            { n: "1", title: "Face detection", body: "Locate any faces in the frame using a Haar cascade, MediaPipe, or MTCNN. Returns bounding boxes.", col: C.accent },
            { n: "2", title: "Preprocessing",  body: "Crop each face, resize to 48×48 grayscale, normalize pixel values to match the model's expected input.", col: C.accent2 },
            { n: "3", title: "CNN inference",  body: "DeepFace runs the cropped face through its pre-trained CNN. Output: a 7-dim softmax over the emotions.", col: C.accent },
        ];

        const boxW = 2.8, boxH = 2.6, startX = 0.55, y = 1.8;
        for (let i = 0; i < 3; i++) {
            const x = startX + i * (boxW + 0.25);
            s.addShape("roundRect", {
                x, y, w: boxW, h: boxH,
                fill: { color: C.bg1 }, line: { color: steps[i].col, width: 1.5 }, rectRadius: 0.1,
            });
            // Big number
            s.addShape("ellipse", {
                x: x + boxW / 2 - 0.35, y: y + 0.2, w: 0.7, h: 0.7,
                fill: { color: steps[i].col }, line: { type: "none" },
            });
            s.addText(steps[i].n, {
                x: x + boxW / 2 - 0.35, y: y + 0.2, w: 0.7, h: 0.7,
                fontSize: 28, fontFace: HF, color: C.bg0, bold: true,
                align: "center", valign: "middle", margin: 0,
            });
            s.addText(steps[i].title, {
                x, y: y + 1.05, w: boxW, h: 0.4,
                fontSize: 15, fontFace: HF, color: C.text0, bold: true,
                align: "center", margin: 0,
            });
            s.addText(steps[i].body, {
                x: x + 0.2, y: y + 1.55, w: boxW - 0.4, h: 1.0,
                fontSize: 10.5, fontFace: BF, color: C.text1,
                align: "center", margin: 0,
            });

            // Arrow between boxes
            if (i < 2) {
                s.addText("▶", {
                    x: x + boxW, y: y + boxH / 2 - 0.2, w: 0.25, h: 0.4,
                    fontSize: 18, color: C.accent,
                    align: "center", valign: "middle", margin: 0,
                });
            }
        }

        // Bottom output
        s.addShape("roundRect", {
            x: 0.55, y: 4.6, w: 8.9, h: 0.55,
            fill: { color: C.bg2 }, line: { color: C.accent, width: 1 }, rectRadius: 0.08,
        });
        s.addText([
            { text: "Output: ", options: { fontFace: BF, color: C.text2, fontSize: 11 } },
            { text: "{ happy: 0.87, surprise: 0.07, neutral: 0.04, sad: 0.01, angry: 0.01, fear: 0.00, disgust: 0.00 }",
              options: { fontFace: "Consolas", color: C.happy, fontSize: 11, bold: true } },
        ], {
            x: 0.75, y: 4.6, w: 8.5, h: 0.55,
            align: "left", valign: "middle", margin: 0,
        });

        pageNumber(s, 5, TOTAL);
    }

    // ==============================================================
    // Slide 6 — System Architecture
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "System architecture", "End-to-end flow, web deployment");

        // Client side (left)
        s.addShape("roundRect", {
            x: 0.55, y: 1.55, w: 3.8, h: 3.5,
            fill: { color: C.bg1 }, line: { color: C.accent, width: 1.5 }, rectRadius: 0.1,
        });
        s.addText("BROWSER (CLIENT)", {
            x: 0.55, y: 1.65, w: 3.8, h: 0.3,
            fontSize: 10, fontFace: BF, color: C.accent,
            align: "center", charSpacing: 6, bold: true, margin: 0,
        });

        // Client boxes
        const clientBoxes = [
            "📷  getUserMedia() — webcam",
            "🖼️  Canvas — capture frame",
            "📡  fetch('/analyze') — JSON",
            "🎨  Overlay — draw boxes",
        ];
        clientBoxes.forEach((t, i) => {
            s.addShape("roundRect", {
                x: 0.75, y: 2.1 + i * 0.65, w: 3.4, h: 0.5,
                fill: { color: C.bg2 }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
            });
            s.addText(t, {
                x: 0.9, y: 2.1 + i * 0.65, w: 3.25, h: 0.5,
                fontSize: 11, fontFace: BF, color: C.text1,
                valign: "middle", margin: 0,
            });
        });

        // Arrows in the middle
        s.addText("HTTP", {
            x: 4.45, y: 2.6, w: 1.1, h: 0.3,
            fontSize: 9, fontFace: BF, color: C.text2,
            align: "center", charSpacing: 4, margin: 0,
        });
        s.addShape("line", {
            x: 4.45, y: 2.95, w: 1.1, h: 0,
            line: { color: C.accent, width: 2, endArrowType: "arrow" },
        });
        s.addText("POST /analyze", {
            x: 4.35, y: 3.05, w: 1.3, h: 0.25,
            fontSize: 8.5, fontFace: "Consolas", color: C.accent2,
            align: "center", margin: 0,
        });
        s.addShape("line", {
            x: 5.55, y: 3.4, w: -1.1, h: 0,
            line: { color: C.accent2, width: 2, endArrowType: "arrow" },
        });
        s.addText("JSON response", {
            x: 4.35, y: 3.5, w: 1.3, h: 0.25,
            fontSize: 8.5, fontFace: "Consolas", color: C.accent2,
            align: "center", margin: 0,
        });

        // Server side (right)
        s.addShape("roundRect", {
            x: 5.65, y: 1.55, w: 3.8, h: 3.5,
            fill: { color: C.bg1 }, line: { color: C.accent2, width: 1.5 }, rectRadius: 0.1,
        });
        s.addText("FLASK SERVER", {
            x: 5.65, y: 1.65, w: 3.8, h: 0.3,
            fontSize: 10, fontFace: BF, color: C.accent2,
            align: "center", charSpacing: 6, bold: true, margin: 0,
        });

        const serverBoxes = [
            "🔓  Decode base64 → image",
            "🧠  EmotionDetector.detect()",
            "🤖  DeepFace (TensorFlow CNN)",
            "📤  JSON: bboxes + emotions",
        ];
        serverBoxes.forEach((t, i) => {
            s.addShape("roundRect", {
                x: 5.85, y: 2.1 + i * 0.65, w: 3.4, h: 0.5,
                fill: { color: C.bg2 }, line: { color: C.border, width: 0.75 }, rectRadius: 0.08,
            });
            s.addText(t, {
                x: 6.0, y: 2.1 + i * 0.65, w: 3.25, h: 0.5,
                fontSize: 11, fontFace: BF, color: C.text1,
                valign: "middle", margin: 0,
            });
        });

        // Bottom note
        s.addText(
            "Camera access happens in the browser — the server never touches hardware. " +
            "This is what makes real deployment possible.",
            {
                x: 0.55, y: 5.15, w: 8.9, h: 0.35,
                fontSize: 10, fontFace: BF, color: C.text2,
                italic: true, align: "center", margin: 0,
            }
        );

        pageNumber(s, 6, TOTAL);
    }

    // ==============================================================
    // Slide 7 — Technology stack
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Technology stack", "Libraries doing the heavy lifting");

        const stack = [
            { name: "Python 3.10+",  role: "Main language",             col: C.accent,  icn: ICONS.python },
            { name: "DeepFace",      role: "Pre-trained emotion model", col: C.accent2, icn: ICONS.brain  },
            { name: "TensorFlow",    role: "ML runtime",                col: C.happy,   icn: ICONS.chip   },
            { name: "OpenCV",        role: "Camera I/O + drawing",      col: C.surprise,icn: ICONS.camera },
            { name: "Flask",         role: "Web backend",               col: C.disgust, icn: ICONS.flask  },
            { name: "HTML/CSS/JS",   role: "Client-side UI",            col: C.fear,    icn: ICONS.code   },
        ];

        const colW = 2.95, rowH = 1.4, gap = 0.15;
        for (let i = 0; i < stack.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = 0.55 + col * (colW + gap);
            const y = 1.8 + row * (rowH + 0.2);

            s.addShape("roundRect", {
                x, y, w: colW, h: rowH,
                fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
            });

            // Left accent bar
            s.addShape("rect", {
                x, y, w: 0.08, h: rowH,
                fill: { color: stack[i].col }, line: { type: "none" },
            });

            s.addImage({
                data: stack[i].icn,
                x: x + 0.3, y: y + 0.3, w: 0.8, h: 0.8,
            });

            s.addText(stack[i].name, {
                x: x + 1.25, y: y + 0.25, w: colW - 1.4, h: 0.45,
                fontSize: 16, fontFace: HF, color: C.text0, bold: true, margin: 0,
            });
            s.addText(stack[i].role, {
                x: x + 1.25, y: y + 0.72, w: colW - 1.4, h: 0.5,
                fontSize: 10, fontFace: BF, color: C.text2, margin: 0,
            });
        }

        pageNumber(s, 7, TOTAL);
    }

    // ==============================================================
    // Slide 8 — DeepFace model
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "The model — DeepFace", "Pre-trained CNN trained on FER-2013");

        // Left: What it is
        s.addText("What is DeepFace?", {
            x: 0.55, y: 1.55, w: 4.5, h: 0.35,
            fontSize: 14, fontFace: HF, color: C.accent, bold: true, margin: 0,
        });
        s.addText([
            { text: "An open-source Python framework for facial analysis — age, gender, race, and emotion.", options: { bullet: true, breakLine: true } },
            { text: "Wraps several well-known CNN architectures (VGG-Face, Facenet, ArcFace, etc.).", options: { bullet: true, breakLine: true } },
            { text: "Trained on the FER-2013 dataset: ~35,000 labeled facial expressions.", options: { bullet: true, breakLine: true } },
            { text: "Achieves ~66% test accuracy on FER-2013 — near human-level performance on this dataset.", options: { bullet: true } },
        ], {
            x: 0.55, y: 1.95, w: 4.7, h: 2.7,
            fontSize: 11.5, fontFace: BF, color: C.text1,
            paraSpaceAfter: 6, margin: 0,
        });

        // Right: CNN architecture visualization (simplified)
        const layers = [
            { label: "Input\n48×48×1", w: 0.6, h: 1.6, col: C.bg3 },
            { label: "Conv\n46×46×64", w: 0.55, h: 1.5, col: C.accent },
            { label: "Pool\n23×23×64", w: 0.5, h: 1.3, col: C.accent },
            { label: "Conv\n128",       w: 0.45, h: 1.1, col: C.accent2 },
            { label: "Pool\n11×11",    w: 0.4, h: 0.9, col: C.accent2 },
            { label: "Conv\n256",       w: 0.35, h: 0.75, col: C.happy },
            { label: "FC\n1024",        w: 0.35, h: 0.55, col: C.surprise },
            { label: "Out\n7",          w: 0.35, h: 0.35, col: C.angry },
        ];

        s.addText("CNN Architecture", {
            x: 5.4, y: 1.55, w: 4.0, h: 0.35,
            fontSize: 14, fontFace: HF, color: C.accent2, bold: true, align: "center", margin: 0,
        });

        let lx = 5.55, cy = 2.95;
        layers.forEach((l, i) => {
            s.addShape("roundRect", {
                x: lx, y: cy - l.h / 2, w: l.w, h: l.h,
                fill: { color: l.col, transparency: 30 },
                line: { color: l.col, width: 1 }, rectRadius: 0.04,
            });
            lx += l.w + 0.05;
        });

        // Labels below
        s.addText("input", {
            x: 5.5, y: 3.95, w: 0.7, h: 0.3,
            fontSize: 9, fontFace: BF, color: C.text2, align: "center", margin: 0,
        });
        s.addText("convolution + pooling", {
            x: 6.1, y: 3.95, w: 2.3, h: 0.3,
            fontSize: 9, fontFace: BF, color: C.text2, align: "center", margin: 0,
        });
        s.addText("softmax", {
            x: 8.7, y: 3.95, w: 0.7, h: 0.3,
            fontSize: 9, fontFace: BF, color: C.text2, align: "center", margin: 0,
        });

        // Result row below architecture
        s.addShape("roundRect", {
            x: 5.4, y: 4.4, w: 4.05, h: 0.6,
            fill: { color: C.bg1 }, line: { color: C.accent, width: 1 }, rectRadius: 0.08,
        });
        s.addText("→ 7-dim probability distribution", {
            x: 5.4, y: 4.4, w: 4.05, h: 0.6,
            fontSize: 11, fontFace: BF, color: C.accent, align: "center", valign: "middle", margin: 0,
        });

        pageNumber(s, 8, TOTAL);
    }

    // ==============================================================
    // Slide 9 — Implementation: Core detector
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Implementation — the core", "EmotionDetector: one class, reused everywhere");

        // Left: feature list
        s.addText("Design principles", {
            x: 0.55, y: 1.55, w: 4.5, h: 0.35,
            fontSize: 13, fontFace: HF, color: C.accent, bold: true, margin: 0,
        });

        const features = [
            { t: "Single responsibility", d: "One class wraps DeepFace so the rest of the app just calls .detect(frame)." },
            { t: "Framework-agnostic",    d: "Accepts any numpy BGR image — works in desktop, web, or notebooks." },
            { t: "Warmup",                d: "Loads the model on init so the first real call isn't slow." },
            { t: "Multi-face support",    d: "Returns a list of detections, each with its own emotion scores." },
        ];

        features.forEach((f, i) => {
            const y = 1.95 + i * 0.75;
            s.addShape("ellipse", {
                x: 0.55, y: y + 0.05, w: 0.18, h: 0.18,
                fill: { color: C.accent2 }, line: { type: "none" },
            });
            s.addText(f.t, {
                x: 0.85, y, w: 4.3, h: 0.3,
                fontSize: 12, fontFace: HF, color: C.text0, bold: true, margin: 0,
            });
            s.addText(f.d, {
                x: 0.85, y: y + 0.3, w: 4.3, h: 0.4,
                fontSize: 10, fontFace: BF, color: C.text2, margin: 0,
            });
        });

        // Right: code snippet
        s.addShape("roundRect", {
            x: 5.4, y: 1.55, w: 4.05, h: 3.6,
            fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
        });
        // Code header
        s.addShape("rect", {
            x: 5.4, y: 1.55, w: 4.05, h: 0.32,
            fill: { color: C.bg2 }, line: { type: "none" },
        });
        s.addText("detector.py", {
            x: 5.55, y: 1.55, w: 3.9, h: 0.32,
            fontSize: 9, fontFace: "Consolas", color: C.text2,
            valign: "middle", margin: 0,
        });

        const code = [
            { text: "from deepface import DeepFace", c: C.accent },
            { text: "", c: C.text1 },
            { text: "class EmotionDetector:", c: C.accent2 },
            { text: "    def __init__(self, backend='opencv'):", c: C.text0 },
            { text: "        self.backend = backend", c: C.text1 },
            { text: "        self._warmup()", c: C.text1 },
            { text: "", c: C.text1 },
            { text: "    def detect(self, frame):", c: C.text0 },
            { text: "        results = DeepFace.analyze(", c: C.text1 },
            { text: "            img_path=frame,", c: C.text1 },
            { text: "            actions=['emotion'],", c: C.text1 },
            { text: "            enforce_detection=False)", c: C.text1 },
            { text: "        return [self._format(r)", c: C.text1 },
            { text: "                for r in results]", c: C.text1 },
        ];

        code.forEach((line, i) => {
            s.addText(line.text || " ", {
                x: 5.55, y: 1.95 + i * 0.22, w: 3.85, h: 0.22,
                fontSize: 10, fontFace: "Consolas", color: line.c, margin: 0,
            });
        });

        pageNumber(s, 9, TOTAL);
    }

    // ==============================================================
    // Slide 10 — Two deployments
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Two ways to run it", "Same detector, two interfaces");

        // Left: Desktop
        s.addShape("roundRect", {
            x: 0.55, y: 1.55, w: 4.35, h: 3.7,
            fill: { color: C.bg1 }, line: { color: C.accent, width: 1.5 }, rectRadius: 0.1,
        });
        s.addImage({
            data: ICONS.laptop,
            x: 0.8, y: 1.8, w: 0.7, h: 0.7,
        });
        s.addText("Desktop app", {
            x: 1.6, y: 1.8, w: 3.2, h: 0.4,
            fontSize: 18, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText("main.py — OpenCV window", {
            x: 1.6, y: 2.2, w: 3.2, h: 0.3,
            fontSize: 10, fontFace: "Consolas", color: C.accent, margin: 0,
        });

        s.addText([
            { text: "Direct cv2.VideoCapture access", options: { bullet: true, breakLine: true } },
            { text: "Live annotated preview window", options: { bullet: true, breakLine: true } },
            { text: "Configurable detector backend", options: { bullet: true, breakLine: true } },
            { text: "Snapshot / video recording", options: { bullet: true, breakLine: true } },
            { text: "Adjustable frame-skip for speed", options: { bullet: true } },
        ], {
            x: 0.8, y: 2.75, w: 3.9, h: 1.8,
            fontSize: 11, fontFace: BF, color: C.text1,
            paraSpaceAfter: 5, margin: 0,
        });

        s.addShape("roundRect", {
            x: 0.8, y: 4.65, w: 3.9, h: 0.45,
            fill: { color: C.bg3 }, line: { type: "none" }, rectRadius: 0.06,
        });
        s.addText("$ python main.py --backend mediapipe", {
            x: 0.9, y: 4.65, w: 3.8, h: 0.45,
            fontSize: 10, fontFace: "Consolas", color: C.happy,
            valign: "middle", margin: 0,
        });

        // Right: Web
        s.addShape("roundRect", {
            x: 5.1, y: 1.55, w: 4.35, h: 3.7,
            fill: { color: C.bg1 }, line: { color: C.accent2, width: 1.5 }, rectRadius: 0.1,
        });
        s.addImage({
            data: ICONS.globe,
            x: 5.35, y: 1.8, w: 0.7, h: 0.7,
        });
        s.addText("Web app", {
            x: 6.15, y: 1.8, w: 3.2, h: 0.4,
            fontSize: 18, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText("app.py — Flask + browser", {
            x: 6.15, y: 2.2, w: 3.2, h: 0.3,
            fontSize: 10, fontFace: "Consolas", color: C.accent2, margin: 0,
        });

        s.addText([
            { text: "Client-side getUserMedia() webcam", options: { bullet: true, breakLine: true } },
            { text: "Live <canvas> overlay on video", options: { bullet: true, breakLine: true } },
            { text: "Live confidence bars + emoji", options: { bullet: true, breakLine: true } },
            { text: "Adjustable analysis rate in UI", options: { bullet: true, breakLine: true } },
            { text: "Deployable via gunicorn + HTTPS", options: { bullet: true } },
        ], {
            x: 5.35, y: 2.75, w: 3.9, h: 1.8,
            fontSize: 11, fontFace: BF, color: C.text1,
            paraSpaceAfter: 5, margin: 0,
        });

        s.addShape("roundRect", {
            x: 5.35, y: 4.65, w: 3.9, h: 0.45,
            fill: { color: C.bg3 }, line: { type: "none" }, rectRadius: 0.06,
        });
        s.addText("$ python app.py  →  localhost:5000", {
            x: 5.45, y: 4.65, w: 3.8, h: 0.45,
            fontSize: 10, fontFace: "Consolas", color: C.happy,
            valign: "middle", margin: 0,
        });

        pageNumber(s, 10, TOTAL);
    }

    // ==============================================================
    // Slide 11 — Results & Performance
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Results", "Performance across face-detection backends");

        // FPS chart (bar, column direction)
        s.addChart(pres.charts.BAR, [{
            name: "FPS (higher is better)",
            labels: ["OpenCV\n(Haar)", "MediaPipe", "MTCNN", "RetinaFace"],
            values: [12.3, 9.8, 4.2, 2.1],
        }], {
            x: 0.55, y: 1.55, w: 4.5, h: 3.4,
            barDir: "col",
            chartColors: ["4CC9F0"],
            chartArea: { fill: { color: C.bg1 }, roundedCorners: true },
            catAxisLabelColor: C.text1,
            catAxisLabelFontFace: BF,
            catAxisLabelFontSize: 9,
            valAxisLabelColor: C.text2,
            valAxisLabelFontFace: BF,
            valAxisLabelFontSize: 9,
            valGridLine: { color: C.border, size: 0.5 },
            catGridLine: { style: "none" },
            showValue: true,
            dataLabelPosition: "outEnd",
            dataLabelColor: C.text0,
            dataLabelFontFace: BF,
            dataLabelFontSize: 10,
            showLegend: false,
            showTitle: true,
            title: "End-to-end FPS (CPU, 720p)",
            titleColor: C.text0,
            titleFontFace: HF,
            titleFontSize: 12,
        });

        // Right: key stats
        const stats = [
            { val: "~92%",    lbl: "avg. accuracy on clear frontal faces" },
            { val: "<150ms",  lbl: "localhost round-trip latency" },
            { val: "7",       lbl: "emotions detected, with confidence" },
            { val: "2",       lbl: "deployment modes: desktop + web" },
        ];
        stats.forEach((st, i) => {
            const y = 1.55 + i * 0.85;
            s.addShape("roundRect", {
                x: 5.3, y, w: 4.15, h: 0.75,
                fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
            });
            s.addText(st.val, {
                x: 5.45, y, w: 1.55, h: 0.75,
                fontSize: 20, fontFace: HF, color: C.accent, bold: true,
                valign: "middle", margin: 0,
            });
            s.addText(st.lbl, {
                x: 7.05, y: y + 0.1, w: 2.35, h: 0.6,
                fontSize: 10, fontFace: BF, color: C.text1,
                valign: "middle", margin: 0,
            });
        });

        s.addText(
            "Trade-off: higher-accuracy detectors (MTCNN, RetinaFace) roughly halve the FPS. OpenCV + MediaPipe hit the " +
            "best balance for live webcam use on CPU.",
            {
                x: 0.55, y: 5.05, w: 8.9, h: 0.4,
                fontSize: 10, fontFace: BF, color: C.text2,
                italic: true, align: "center", margin: 0,
            }
        );

        pageNumber(s, 11, TOTAL);
    }

    // ==============================================================
    // Slide 12 — Challenges & Limitations
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);
        addSlideTitle(s, "Challenges & limitations", "An honest look at where the system struggles");

        const challenges = [
            { icn: ICONS.warn,  col: C.angry,    t: "Lighting sensitivity",  d: "Strong shadows or backlighting reduce face-detection reliability." },
            { icn: ICONS.warn,  col: C.surprise, t: "Pose / occlusion",      d: "Profile views, sunglasses, or masks trip up the CNN." },
            { icn: ICONS.warn,  col: C.fear,     t: "Subtle emotions",       d: "'Fear' and 'surprise' are often confused — they overlap in FER-2013." },
            { icn: ICONS.warn,  col: C.happy,    t: "Dataset bias",          d: "FER-2013 skews toward certain demographics — real-world accuracy varies." },
            { icn: ICONS.warn,  col: C.sad,      t: "No temporal context",   d: "Each frame is classified independently; quick emotion changes cause jitter." },
            { icn: ICONS.warn,  col: C.disgust,  t: "CPU inference speed",   d: "Without a GPU, real-time with high-accuracy detectors is tight." },
        ];

        const colW = 2.95, rowH = 1.55, gap = 0.15;
        for (let i = 0; i < challenges.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = 0.55 + col * (colW + gap);
            const y = 1.55 + row * (rowH + gap);

            s.addShape("roundRect", {
                x, y, w: colW, h: rowH,
                fill: { color: C.bg1 }, line: { color: C.border, width: 1 }, rectRadius: 0.1,
            });
            s.addShape("rect", {
                x, y, w: colW, h: 0.06,
                fill: { color: challenges[i].col }, line: { type: "none" },
            });

            s.addText(challenges[i].t, {
                x: x + 0.2, y: y + 0.25, w: colW - 0.4, h: 0.4,
                fontSize: 13, fontFace: HF, color: challenges[i].col, bold: true, margin: 0,
            });
            s.addText(challenges[i].d, {
                x: x + 0.2, y: y + 0.7, w: colW - 0.4, h: 0.8,
                fontSize: 10, fontFace: BF, color: C.text1, margin: 0,
            });
        }

        pageNumber(s, 12, TOTAL);
    }

    // ==============================================================
    // Slide 13 — Future Work & Thank You
    // ==============================================================
    {
        const s = pres.addSlide();
        addBackground(s);

        // Decorative orbs
        s.addShape("ellipse", {
            x: -2, y: H - 3, w: 5, h: 5,
            fill: { color: C.accent, transparency: 85 }, line: { type: "none" },
        });
        s.addShape("ellipse", {
            x: W - 3, y: -2, w: 5, h: 5,
            fill: { color: C.accent2, transparency: 85 }, line: { type: "none" },
        });

        s.addText("FUTURE WORK", {
            x: 0.8, y: 0.6, w: 8, h: 0.3,
            fontSize: 11, fontFace: BF, color: C.accent,
            charSpacing: 8, bold: true, margin: 0,
        });

        s.addText("What comes next", {
            x: 0.8, y: 0.95, w: 8, h: 0.7,
            fontSize: 36, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });

        const future = [
            { n: "01", t: "Temporal smoothing",     d: "Use a rolling window over frames to stabilize emotion labels." },
            { n: "02", t: "Custom fine-tuned model", d: "Train on a more diverse dataset (AffectNet) to reduce bias." },
            { n: "03", t: "On-device inference",    d: "Port to TensorFlow.js or ONNX Runtime Web — no server needed." },
            { n: "04", t: "Continuous emotions",    d: "Output valence/arousal instead of 7 discrete classes." },
        ];

        future.forEach((f, i) => {
            const y = 1.9 + i * 0.7;
            // Big number
            s.addText(f.n, {
                x: 0.8, y, w: 0.7, h: 0.6,
                fontSize: 28, fontFace: HF, color: C.accent2, bold: true, margin: 0,
            });
            s.addText(f.t, {
                x: 1.6, y: y + 0.03, w: 3.4, h: 0.35,
                fontSize: 15, fontFace: HF, color: C.text0, bold: true, margin: 0,
            });
            s.addText(f.d, {
                x: 1.6, y: y + 0.33, w: 7.5, h: 0.35,
                fontSize: 11, fontFace: BF, color: C.text2, margin: 0,
            });
        });

        // Thank you footer
        s.addShape("rect", {
            x: 0, y: 4.85, w: W, h: 0.04,
            fill: { color: C.accent }, line: { type: "none" },
        });
        s.addText("Thank you!", {
            x: 0.8, y: 5.0, w: 5, h: 0.45,
            fontSize: 22, fontFace: HF, color: C.text0, bold: true, margin: 0,
        });
        s.addText("Questions?  ·  Built with Python, DeepFace & Flask", {
            x: W / 2, y: 5.08, w: W / 2 - 0.4, h: 0.4,
            fontSize: 11, fontFace: BF, color: C.text2,
            align: "right", valign: "middle", margin: 0,
        });
    }

    // Write file
    const out = "/home/claude/emotion-detection/docs/presentation.pptx";
    await pres.writeFile({ fileName: out });
    console.log("Presentation written to:", out);
})();
