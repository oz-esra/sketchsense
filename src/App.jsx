import { useRef, useState, useCallback, useEffect } from "react";
import Canvas from "./components/Canvas";
import { generateUI, refineUI } from "./utils/gemini";
import "./index.css";

const TOOLS = [
  { id: "pen",     icon: "ti-pencil",        label: "Pen (P)" },
  { id: "eraser",  icon: "ti-eraser",        label: "Eraser (E)" },
  { id: "line",    icon: "ti-minus",         label: "Line (L)" },
  { id: "arrow",   icon: "ti-arrow-narrow-right", label: "Arrow (A)" },
  { id: "rect",    icon: "ti-rectangle",     label: "Rectangle (R)" },
  { id: "ellipse", icon: "ti-circle",        label: "Ellipse (O)" },
];

const COLORS = ["#1a1a2e", "#374151", "#6366F1", "#EC4899", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];
const STROKES = [1, 2, 3, 5, 8];

const LOADING_MSGS = [
  "Çiziminiz analiz ediliyor...",
  "Gemini Vision ile işleniyor...",
  "UI bileşenleri tanımlanıyor...",
  "Kod üretiliyor...",
];

export default function App() {
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const abortRef = useRef(null);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem("ss_key") || "");
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("ss_key") || "");
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1a1a2e");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [refinement, setRefinement] = useState("");
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [toast, setToast] = useState(null);
  const [charCount, setCharCount] = useState(0);

  // Cycle loading messages
  useEffect(() => {
    if (!isGenerating) return;
    const iv = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MSGS.length), 1800);
    return () => clearInterval(iv);
  }, [isGenerating]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveApiKey = () => {
    localStorage.setItem("ss_key", apiKeyInput);
    setApiKey(apiKeyInput);
    showToast("API anahtarı kaydedildi ✓");
  };

  const handleGenerate = useCallback(async () => {
    if (!apiKey) { showToast("Lütfen önce Gemini API anahtarınızı girin", "error"); return; }
    if (!hasDrawing) { showToast("Lütfen önce bir şeyler çizin", "error"); return; }

    abortRef.current = new AbortController();
    setIsGenerating(true);
    setLoadingMsg(0);
    setActiveTab("preview");

    try {
      const imageBase64 = canvasRef.current.toBase64();
      const fn = generatedCode ? refineUI : generateUI;
      const result = await fn({
        apiKey,
        imageBase64,
        currentCode: generatedCode,
        refinement: refinement.trim(),
        signal: abortRef.current.signal,
        onChunk: (partial) => {
          setGeneratedCode(partial);
          setCharCount(partial.length);
        },
      });
      setGeneratedCode(result);
      setCharCount(result.length);
      setRefinement("");
      showToast(`UI oluşturuldu! ${(result.length / 1000).toFixed(1)}k karakter`);
    } catch (err) {
      if (err.name !== "AbortError") {
        showToast(err.message || "Bir hata oluştu", "error");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, hasDrawing, generatedCode, refinement]);

  const handleStop = () => { abortRef.current?.abort(); setIsGenerating(false); };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => canvasRef.current.loadImage(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    showToast("Kod kopyalandı ✓");
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "sketchsense-output.html"; a.click();
    URL.revokeObjectURL(url);
    showToast("HTML indirildi ✓");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const map = { p: "pen", e: "eraser", l: "line", a: "arrow", r: "rect", o: "ellipse" };
      if (map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()]);
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); canvasRef.current?.undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleGenerate(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleGenerate]);

  const iframeCode = generatedCode.includes("<!DOCTYPE") || generatedCode.includes("<html")
    ? generatedCode
    : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${generatedCode}</body></html>`;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon"><i className="ti ti-vector-bezier-2" style={{ fontSize: 15, color: "white" }} /></div>
          Sketch<span>Sense</span>
        </div>
        <div className="header-divider" />
        <div className="api-row">
          <span className="api-label">Gemini API</span>
          <input
            className="api-input"
            type="password"
            placeholder="AIza..."
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveApiKey()}
          />
          <button className="api-save" onClick={saveApiKey}>Kaydet</button>
        </div>
        <div className="header-right">
          <div className={`status-dot ${isGenerating ? "loading" : apiKey ? "ready" : ""}`} />
          <span style={{ fontSize: 11, color: "var(--text3)" }}>
            {isGenerating ? "Üretiliyor..." : apiKey ? "Hazır" : "API anahtarı bekleniyor"}
          </span>
          {charCount > 0 && (
            <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--mono)" }}>
              {(charCount / 1000).toFixed(1)}k
            </span>
          )}
        </div>
      </header>

      {/* LEFT — CANVAS PANEL */}
      <div className="left-panel">
        {/* Toolbar */}
        <div className="toolbar">
          {/* Drawing tools */}
          <div className="tool-group">
            {TOOLS.map(t => (
              <button
                key={t.id}
                className={`tool-btn ${tool === t.id ? "active" : ""}`}
                onClick={() => setTool(t.id)}
                title={t.label}
              >
                <i className={`ti ${t.icon}`} />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="tool-group">
            <button className="tool-btn" onClick={() => canvasRef.current?.undo()} title="Geri al (Ctrl+Z)">
              <i className="ti ti-arrow-back-up" />
            </button>
            <button className="tool-btn" onClick={() => canvasRef.current?.clear()} title="Tümünü sil">
              <i className="ti ti-trash" />
            </button>
            <button className="tool-btn-wide" onClick={() => fileRef.current?.click()} title="Görsel yükle">
              <i className="ti ti-upload" style={{ fontSize: 14 }} />
              <span>Yükle</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
          </div>

          {/* Colors */}
          <div className="toolbar-row">
            {COLORS.map(c => (
              <button
                key={c}
                className={`color-swatch ${color === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              style={{ width: 22, height: 22, padding: 0, border: "none", background: "none", cursor: "pointer", borderRadius: 4 }}
              title="Özel renk"
            />
          </div>

          {/* Stroke width */}
          <div className="toolbar-row">
            <i className="ti ti-line-dashed" style={{ fontSize: 14, color: "var(--text3)" }} />
            <input
              type="range"
              className="stroke-slider"
              min={1}
              max={16}
              step={1}
              value={strokeWidth}
              onChange={e => setStrokeWidth(+e.target.value)}
            />
            <span className="stroke-label">{strokeWidth}px</span>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-wrap">
          <Canvas
            ref={canvasRef}
            tool={tool}
            color={color}
            strokeWidth={strokeWidth}
            onDrawingChange={setHasDrawing}
          />
          <div className="canvas-hint">1200 × 800 · Noktalı kılavuz</div>
        </div>

        {/* Generate */}
        <div className="generate-area">
          <textarea
            className="refine-input"
            rows={2}
            placeholder={generatedCode ? "Değişiklik isteği yaz... (ör: arka planı koyu yap, navbar ekle)" : "Ek talimat yaz... (isteğe bağlı)"}
            value={refinement}
            onChange={e => setRefinement(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleGenerate(); }}
          />
          {isGenerating ? (
            <button className="generate-btn loading" onClick={handleStop}>
              <i className="ti ti-player-stop" /> Durdur
            </button>
          ) : (
            <button className="generate-btn" onClick={handleGenerate} disabled={!apiKey || !hasDrawing}>
              <i className="ti ti-sparkles" />
              {generatedCode ? "Güncelle (Ctrl+↵)" : "UI Üret (Ctrl+↵)"}
            </button>
          )}
        </div>
      </div>

      {/* RIGHT — PREVIEW/CODE */}
      <div className="right-panel">
        <div className="panel-tabs">
          <button className={`tab-btn ${activeTab === "preview" ? "active" : ""}`} onClick={() => setActiveTab("preview")}>
            <i className="ti ti-eye" /> Önizleme
          </button>
          <button className={`tab-btn ${activeTab === "code" ? "active" : ""}`} onClick={() => setActiveTab("code")}>
            <i className="ti ti-code" /> Kod
          </button>
          {generatedCode && (
            <div className="tab-actions">
              <button className="icon-btn" onClick={copyCode}><i className="ti ti-copy" /> Kopyala</button>
              <button className="icon-btn" onClick={downloadCode}><i className="ti ti-download" /> İndir</button>
            </div>
          )}
        </div>

        <div className="panel-content">
          {isGenerating && (
            <div className="loading-overlay">
              <div className="spinner" />
              <div className="loading-text">{LOADING_MSGS[loadingMsg]}</div>
              <div className="loading-sub">Gemini 2.0 Flash · Streaming</div>
            </div>
          )}

          {!generatedCode && !isGenerating ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="ti ti-wand" /></div>
              <div className="empty-title">Çizin, oluşturun, görün</div>
              <div className="empty-desc">
                Sol tarafta bir UI taslağı çizin — navigasyon, kartlar, form, tablo — istediğiniz herhangi bir şey. Ardından "UI Üret" butonuna tıklayın.
              </div>
            </div>
          ) : activeTab === "preview" ? (
            <iframe
              className="preview-frame"
              srcDoc={iframeCode}
              sandbox="allow-scripts allow-same-origin"
              title="Canlı Önizleme"
            />
          ) : (
            <div className="code-view">
              <pre>{generatedCode}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <i className={`ti ${toast.type === "error" ? "ti-alert-circle" : "ti-check"}`} style={{ fontSize: 16 }} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
