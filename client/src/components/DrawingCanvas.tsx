
import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { floodFill } from '../utils/floodFill';

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onDraw: (dataUrl: string) => void;
}

export interface DrawingCanvasRef {
  getCanvasData: () => string | undefined;
}

type Tool = 'pen' | 'eraser' | 'circle' | 'rectangle' | 'bucket';

const DrawingCanvas: React.ForwardRefRenderFunction<DrawingCanvasRef, DrawingCanvasProps> = ({ width = 800, height = 600, onDraw }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushColor, setBrushColor] = useState('black');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('pen');
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const CANVAS_BACKGROUND_COLOR = 'white';
  const BASIC_COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080'];

  useImperativeHandle(ref, () => ({
    getCanvasData: () => {
      return canvasRef.current?.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        ctx.lineCap = 'round';
        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Initial state, call onDraw
        if (canvasRef.current) {
          onDraw(canvasRef.current.toDataURL('image/png'));
        }
        saveState();
      }
    }
  }, []);

  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === 'eraser' ? CANVAS_BACKGROUND_COLOR : brushColor;
      context.lineWidth = brushSize;
    }
  }, [brushColor, brushSize, tool, context]);

  const saveState = () => {
    if (context && canvasRef.current) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(context.getImageData(0, 0, width, height));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      context?.putImageData(history[newIndex], 0, 0);
      if (canvasRef.current) {
        onDraw(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      context?.putImageData(history[newIndex], 0, 0);
      if (canvasRef.current) {
        onDraw(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    const { offsetX, offsetY } = nativeEvent;
    if (tool === 'bucket') {
      floodFill(context, offsetX, offsetY, brushColor);
      saveState();
      if (canvasRef.current) {
        onDraw(canvasRef.current.toDataURL('image/png'));
      }
      return;
    }
    setIsDrawing(true);
    setStartCoords({ x: offsetX, y: offsetY });
    context.beginPath();
    if (tool === 'pen' || tool === 'eraser') {
      context.moveTo(offsetX, offsetY);
    } else {
      setSnapshot(context.getImageData(0, 0, width, height));
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = nativeEvent;

    if (snapshot) {
      context.putImageData(snapshot, 0, 0);
    }

    if (tool === 'pen' || tool === 'eraser') {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else if (tool === 'rectangle') {
      context.strokeRect(startCoords.x, startCoords.y, offsetX - startCoords.x, offsetY - startCoords.y);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(offsetX - startCoords.x, 2) + Math.pow(offsetY - startCoords.y, 2));
      context.beginPath();
      context.arc(startCoords.x, startCoords.y, radius, 0, 2 * Math.PI);
      context.stroke();
    }
    if (canvasRef.current) {
      onDraw(canvasRef.current.toDataURL('image/png'));
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (context && (tool === 'pen' || tool === 'eraser' || tool === 'circle' || tool === 'rectangle')) {
      saveState();
    }
    setSnapshot(null);
    if (canvasRef.current) {
      onDraw(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    if (context && canvasRef.current) {
      context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      context.fillStyle = CANVAS_BACKGROUND_COLOR;
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveState();
      if (canvasRef.current) {
        onDraw(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-start" style={{ width: '100%' }}>
      {/* Left Sidebar for Colors */}
      <div className="d-flex flex-column align-items-center me-3 p-2 border rounded">
        <label htmlFor="brushColor" className="form-label mb-2">Custom Color:</label>
        <input
          type="color"
          id="brushColor"
          className="form-control form-control-color mb-3"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
        />
        <div className="row g-1" style={{ maxWidth: '100px' }}>
          {BASIC_COLORS.map((color, index) => (
            <div key={index} className="col-6 d-grid">
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: color,
                  height: '30px',
                  border: `1px solid ${brushColor === color ? '#000' : '#ccc'}`,
                }}
                onClick={() => setBrushColor(color)}
              ></button>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas and Controls */}
      <div className="d-flex flex-column align-items-center">
        <div className="d-flex justify-content-center align-items-center mb-3">
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
            <button type="button" className="btn btn-outline-secondary" onClick={undo} disabled={historyIndex <= 0}>Undo</button>
            <button type="button" className="btn btn-outline-secondary" onClick={redo} disabled={historyIndex >= history.length - 1}>Redo</button>
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
          style={{ cursor: 'crosshair' }}
        />
      </div>

      {/* Right Sidebar for Tools */}
      <div className="d-flex flex-column align-items-center ms-3 p-2 border rounded">
        <div className="btn-group-vertical" role="group">
          <button type="button" className={`btn ${tool === 'pen' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('pen')}>Pen</button>
          <button type="button" className={`btn ${tool === 'eraser' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('eraser')}>Eraser</button>
          <button type="button" className={`btn ${tool === 'circle' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('circle')}>Circle</button>
          <button type="button" className={`btn ${tool === 'rectangle' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('rectangle')}>Rectangle</button>
          <button type="button" className={`btn ${tool === 'bucket' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('bucket')}>Bucket</button>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(DrawingCanvas);
