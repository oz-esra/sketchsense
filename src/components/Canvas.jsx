import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

const CANVAS_W = 1200;
const CANVAS_H = 800;

const Canvas = forwardRef(({ tool, color, strokeWidth, hasDrawing, onDrawingChange }, ref) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);
  const startPos = useRef(null);
  const snapshot = useRef(null);
  const history = useRef([]);
  const historyIdx = useRef(-1);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx.fillStyle = "#F8F8F5";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawGrid(ctx);
    saveHistory();
  }, []);

  function drawGrid(ctx) {
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    for (let x = 24; x < CANVAS_W; x += 24) {
      for (let y = 24; y < CANVAS_H; y += 24) {
        ctx.beginPath();
        ctx.arc(x, y, 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    historyIdx.current++;
    history.current = history.current.slice(0, historyIdx.current);
    history.current.push(canvas.toDataURL());
    if (onDrawingChange) onDrawingChange(historyIdx.current > 0);
  }, [onDrawingChange]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const applyStyle = (ctx) => {
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation = "source-over";
    if (tool === "eraser") {
      ctx.strokeStyle = "#F8F8F5";
      ctx.lineWidth = strokeWidth * 4;
    } else {
      ctx.strokeStyle = color;
    }
  };

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    lastPos.current = pos;
    startPos.current = pos;
    const ctx = canvasRef.current.getContext("2d");

    if (["rect", "ellipse", "line", "arrow"].includes(tool)) {
      snapshot.current = canvasRef.current.toDataURL();
    } else {
      applyStyle(ctx);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [tool, color, strokeWidth]);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    applyStyle(ctx);

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    } else if (snapshot.current) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.drawImage(img, 0, 0);
        applyStyle(ctx);
        const sx = startPos.current.x, sy = startPos.current.y;
        const w = pos.x - sx, h = pos.y - sy;
        ctx.beginPath();

        if (tool === "rect") {
          ctx.strokeRect(sx, sy, w, h);
        } else if (tool === "ellipse") {
          ctx.ellipse(sx + w / 2, sy + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (tool === "line") {
          ctx.moveTo(sx, sy);
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
        } else if (tool === "arrow") {
          drawArrow(ctx, sx, sy, pos.x, pos.y);
        }
      };
      img.src = snapshot.current;
    }
  }, [tool, color, strokeWidth]);

  function drawArrow(ctx, x1, y1, x2, y2) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 12;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - size * Math.cos(angle - 0.4), y2 - size * Math.sin(angle - 0.4));
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - size * Math.cos(angle + 0.4), y2 - size * Math.sin(angle + 0.4));
    ctx.stroke();
  }

  const endDraw = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    saveHistory();
  }, [saveHistory]);

  useImperativeHandle(ref, () => ({
    undo() {
      if (historyIdx.current <= 0) return;
      historyIdx.current--;
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.drawImage(img, 0, 0);
      };
      img.src = history.current[historyIdx.current];
      if (onDrawingChange) onDrawingChange(historyIdx.current > 0);
    },
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#F8F8F5";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      drawGrid(ctx);
      historyIdx.current = 0;
      history.current = [canvas.toDataURL()];
      if (onDrawingChange) onDrawingChange(false);
    },
    toBase64() {
      return canvasRef.current.toDataURL("image/png").split(",")[1];
    },
    loadImage(src) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#F8F8F5";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        const scale = Math.min(CANVAS_W / img.width, CANVAS_H / img.height);
        const x = (CANVAS_W - img.width * scale) / 2;
        const y = (CANVAS_H - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        saveHistory();
      };
      img.src = src;
    },
  }));

  useEffect(() => {
    initCanvas();
  }, []);

  const cursor = tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair";

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", cursor, display: "block", touchAction: "none" }}
      onMouseDown={startDraw}
      onMouseMove={draw}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onTouchStart={startDraw}
      onTouchMove={draw}
      onTouchEnd={endDraw}
    />
  );
});

Canvas.displayName = "Canvas";
export default Canvas;
