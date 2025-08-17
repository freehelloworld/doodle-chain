import { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onDrawingComplete: (dataUrl: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width = 600, height = 400, onDrawingComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushColor, setBrushColor] = useState('black');
  const [brushSize, setBrushSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);

  const CANVAS_BACKGROUND_COLOR = 'white'; // Define a constant for background color

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        ctx.lineCap = 'round';
        ctx.fillStyle = CANVAS_BACKGROUND_COLOR; // Set background to white
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill background
      }
    }
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = isErasing ? CANVAS_BACKGROUND_COLOR : brushColor;
      context.lineWidth = brushSize;
    }
  }, [brushColor, brushSize, isErasing, context]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    const { offsetX, offsetY } = nativeEvent;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = nativeEvent;
    context.lineTo(offsetX, offsetY);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (context) {
      const dataUrl = canvasRef.current?.toDataURL('image/png');
      if (dataUrl) {
        onDrawingComplete(dataUrl);
      }
    }
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.fillStyle = CANVAS_BACKGROUND_COLOR;
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onDrawingComplete(canvasRef.current.toDataURL('image/png')); // Update drawing data after clearing
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <div className="d-flex justify-content-center align-items-center mb-3">
        <label htmlFor="brushColor" className="form-label me-2">Color:</label>
        <input
          type="color"
          id="brushColor"
          className="form-control form-control-color me-3"
          value={brushColor}
          onChange={(e) => { setBrushColor(e.target.value); setIsErasing(false); }}
        />
        <label htmlFor="brushSize" className="form-label me-2">Size:</label>
        <input
          type="range"
          id="brushSize"
          className="form-range me-3"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
        />
        <div className="btn-group me-3" role="group">
          <button type="button" className={`btn ${!isErasing ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setIsErasing(false)}>Pen</button>
          <button type="button" className={`btn ${isErasing ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setIsErasing(true)}>Eraser</button>
        </div>
        <button type="button" className="btn btn-secondary" onClick={clearCanvas}>Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-dark"
        style={{ cursor: isErasing ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M19.3 8.92L15.08 4.7c-.39-.39-1.03-.39-1.42 0L6.1 12.28c-.39.39-.39 1.03 0 1.42l4.22 4.22c.39.39 1.03.39 1.42 0l7.78-7.78c-.39-.39-.39-1.03 0-1.42zM14.08 6.12L17.88 9.92 10.12 17.68 6.32 13.88 14.08 6.12z"/></svg>') 12 12, auto` : 'crosshair' }}
      />
    </div>
  );
};

export default DrawingCanvas;
