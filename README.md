# SketchSense 🎨→💻

**Draw a wireframe. Get working code. Instantly.**

SketchSense uses Gemini 2.0 Flash Vision to transform hand-drawn UI sketches into production-ready HTML/CSS/JS — live, streaming, in seconds.

---

## ✨ Features

- **🖊️ Full Drawing Suite** — Pen, eraser, line, arrow, rectangle, ellipse tools
- **📸 Image Upload** — Import photos of paper sketches or existing mockups
- **⚡ Streaming Generation** — Watch code appear token by token via Gemini 2.0 Flash
- **🔄 Iterative Refinement** — Describe changes in plain text, AI updates the code
- **👁️ Live Preview** — Real-time iframe preview of the generated HTML
- **💾 Export** — Copy code or download as `.html`
- **⌨️ Keyboard Shortcuts** — P/E/L/A/R/O for tools, Ctrl+Z undo, Ctrl+Enter generate

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- A [Gemini API Key](https://aistudio.google.com/app/apikey) (free)

### 2. Install & Run

```bash
git clone https://github.com/YOUR_USERNAME/sketchsense
cd sketchsense
npm install
npm run dev
```

Open `http://localhost:5173`

### 3. Get a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Paste it into SketchSense's API Key field and click "Kaydet"

---

## 🌐 Deploy to Vercel (1 minute)

```bash
npm install -g vercel
vercel --prod
```

Or connect your GitHub repo to [vercel.com](https://vercel.com) — zero config needed.

---

## 🏗️ Architecture

```
SketchSense
├── src/
│   ├── App.jsx              # Main app — state, layout, orchestration
│   ├── index.css            # Design system — dark studio theme
│   ├── components/
│   │   └── Canvas.jsx       # HTML5 Canvas drawing engine
│   └── utils/
│       └── gemini.js        # Gemini 2.0 Flash streaming integration
├── index.html
├── vite.config.js
└── package.json
```

### How It Works

```
User draws on Canvas
       ↓
Canvas → toDataURL() → base64 PNG
       ↓
Gemini 2.0 Flash Vision API
  - Analyzes wireframe image
  - Identifies UI components
  - Generates HTML/CSS/JS
  - Streams response token by token
       ↓
Preview iframe → srcdoc → live render
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + Vite |
| AI Model | Gemini 2.0 Flash (Vision + Generation) |
| AI SDK | `@google/generative-ai` |
| Drawing | HTML5 Canvas API |
| Styling | Pure CSS (custom design system) |
| Deployment | Vercel / Netlify |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `P` | Pen tool |
| `E` | Eraser tool |
| `L` | Line tool |
| `A` | Arrow tool |
| `R` | Rectangle tool |
| `O` | Ellipse tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Enter` | Generate / Update UI |

---

## 🎯 Use Cases

- **Rapid Prototyping** — Turn napkin sketches into testable prototypes
- **Design Handoff** — Sketch a design, get the code directly
- **Teaching** — Show students how wireframes map to code
- **Hackathons** — Build MVPs at the speed of thought
- **Client Demos** — Sketch in a meeting, show a prototype before the call ends

---

## 📄 License

MIT — Built with ❤️ for the BTK Akademi Hackathon
