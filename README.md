SketchSense 🎨→💻Draw a wireframe. Get working code. Instantly.SketchSense uses Gemini 2.0 Flash Vision to transform hand-drawn UI sketches into production-ready HTML/CSS/JS — live, streaming, in seconds.✨ Features🖊️ Full Drawing Suite — Pen, eraser, line, arrow, rectangle, ellipse tools📸 Image Upload — Import photos of paper sketches or existing mockups⚡ Streaming Generation — Watch code appear token by token via Gemini 2.0 Flash🔄 Iterative Refinement — Describe changes in plain text, AI updates the code👁️ Live Preview — Real-time iframe preview of the generated HTML💾 Export — Copy code or download as .html⌨️ Keyboard Shortcuts — P/E/L/A/R/O for tools, Ctrl+Z undo, Ctrl+Enter generate🚀 Quick Start1. PrerequisitesNode.js 18+A Gemini API Key (free)2. Install & RunBashgit clone https://github.com/oz-esra/sketchsense
cd sketchsense
npm install
npm run dev
Open http://localhost:51733. Get a Gemini API KeyGo to Google AI StudioClick "Create API Key"Paste it into SketchSense's API Key field and click "Kaydet"🏗️ ArchitectureSketchSense
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
How It WorksUser draws on Canvas
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
🛠️ Tech StackLayerTechnologyUI FrameworkReact 18 + ViteAI ModelGemini 2.0 Flash (Vision + Generation)AI SDK@google/generative-aiDrawingHTML5 Canvas APIStylingPure CSS⌨️ Keyboard ShortcutsKeyActionPPen toolEEraser toolLLine toolAArrow toolRRectangle toolOEllipse toolCtrl+ZUndoCtrl+EnterGenerate / Update UI🎯 Use CasesRapid Prototyping — Turn napkin sketches into testable prototypesDesign Handoff — Sketch a design, get the code directlyTeaching — Show students how wireframes map to codeHackathons — Build MVPs at the speed of thought📄 LicenseMIT — Built with ❤️ for the BTK Akademi Hackathon
