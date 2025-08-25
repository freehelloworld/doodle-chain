import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import AnalogClock from './AnalogClock';
import { floodFill } from '../utils/floodFill';

interface DrawingCanvasProps {
  onDraw: (dataUrl: string) => void;
  disabled?: boolean;
  timer: number | null;
}

export interface DrawingCanvasRef {
  getCanvasData: () => string | undefined;
}

type Tool = 'pen' | 'eraser' | 'circle' | 'rectangle' | 'bucket';

const DrawingCanvas: React.ForwardRefRenderFunction<DrawingCanvasRef, DrawingCanvasProps> = ({ onDraw, disabled = false, timer }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<Tool>('pen');
  const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const CANVAS_BACKGROUND_COLOR = 'white';
  const BASIC_COLORS = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FFA500', '#800080', '#FFC0CB', '#00FFFF', '#8B4513', '#808080'
  ];

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (canvas && container) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        setContext(ctx);
        const resizeCanvas = () => {
          const { width } = container.getBoundingClientRect();
          const aspectRatio = 2 / 1;
          const newWidth = width;
          const newHeight = width / aspectRatio;

          const currentHistory = ctx.getImageData(0, 0, canvas.width, canvas.height);

          canvas.width = newWidth;
          canvas.height = newHeight;

          if (currentHistory) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentHistory.width;
            tempCanvas.height = currentHistory.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.putImageData(currentHistory, 0, 0);
              ctx.drawImage(tempCanvas, 0, 0, newWidth, newHeight);
            }
          } else {
            ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
            ctx.fillRect(0, 0, newWidth, newHeight);
            saveState();
          }

          ctx.lineCap = 'round';
          ctx.strokeStyle = tool === 'eraser' ? CANVAS_BACKGROUND_COLOR : brushColor;
          ctx.lineWidth = brushSize;
          onDraw(canvas.toDataURL('image/png'));
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
      }
    }
  }, [tool, brushColor, brushSize]);

  useImperativeHandle(ref, () => ({
    getCanvasData: () => {
      return canvasRef.current?.toDataURL('image/png');
    }
  }));

  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === 'eraser' ? CANVAS_BACKGROUND_COLOR : brushColor;
      context.lineWidth = brushSize;
    }
  }, [brushColor, brushSize, tool, context]);

  const saveState = () => {
    if (context && canvasRef.current) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
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

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || disabled) return;
    const { x, y } = getTransformedCoords(e.nativeEvent);
    if (tool === 'bucket') {
      floodFill(context, x, y, brushColor);
      saveState();
      if (canvasRef.current) {
        onDraw(canvasRef.current.toDataURL('image/png'));
      }
      return;
    }
    setIsDrawing(true);
    setStartCoords({ x, y });
    context.beginPath();
    if (tool === 'pen' || tool === 'eraser') {
      context.moveTo(x, y);
    } else {
      setSnapshot(context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height));
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const { x, y } = getTransformedCoords(e.nativeEvent);

    if (snapshot) {
      context.putImageData(snapshot, 0, 0);
    }

    if (tool === 'pen' || tool === 'eraser') {
      context.lineTo(x, y);
      context.stroke();
    } else if (tool === 'rectangle') {
      context.strokeRect(startCoords.x, startCoords.y, x - startCoords.x, y - startCoords.y);
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startCoords.x, 2) + Math.pow(y - startCoords.y, 2));
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

  const getTransformedCoords = (nativeEvent: MouseEvent | Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (nativeEvent.clientX - rect.left) * scaleX,
      y: (nativeEvent.clientY - rect.top) * scaleY,
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    startDrawing({ nativeEvent: e.touches[0] } as any);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    draw({ nativeEvent: e.touches[0] } as any);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="d-flex justify-content-center align-items-start" style={{ width: '100%' }}>
      {/* Left Sidebar for Colors */}
      <div className="d-flex flex-column align-items-center me-3 h-100 justify-content-center">
        <div className="p-2 border rounded">
          <label htmlFor="brushColor" className="form-label mb-2">Custom Color:</label>
          <div className="custom-color-picker-wrapper">
            <input
              type="color"
              id="brushColor"
              className="form-control form-control-color custom-color-picker"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              disabled={disabled}
              style={{ borderRadius: '50%' }}
            />
          </div>
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
                  disabled={disabled}
                ></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="d-flex flex-column align-items-center flex-grow-1" style={{ width: '100%' }}>
        <div ref={canvasContainerRef} className="w-100 h-100 d-flex justify-content-center align-items-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="border border-dark"
            style={{ cursor: disabled ? 'not-allowed' : 'crosshair', touchAction: 'none', maxWidth: '100%', maxHeight: '100%', backgroundColor: 'white' }}
          />
        </div>
        <div className="d-flex justify-content-center align-items-center mt-3">
          <label htmlFor="brushSize" className="form-label me-2">Size:</label>
          <input
            type="range"
            id="brushSize"
            className="form-range me-3"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            disabled={disabled}
          />
          <div className="btn-group me-3" role="group">
            <button type="button" className="btn btn-outline-secondary" onClick={undo} disabled={historyIndex <= 0 || disabled}>Undo</button>
            <button type="button" className="btn btn-outline-secondary" onClick={redo} disabled={historyIndex >= history.length - 1 || disabled}>Redo</button>
          </div>
          <button type="button" className="btn btn-secondary" onClick={clearCanvas} disabled={disabled}>Clear</button>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center ms-3">
        {timer !== null && <AnalogClock time={timer} />}
        {timer !== null && <span className="badge bg-secondary fs-6 mb-2">{formatTime(timer)}</span>}
        <div className="d-flex flex-column align-items-center justify-content-center p-2 border rounded h-100">
            <div className="btn-group-vertical" role="group">
              <button type="button" className={`btn ${tool === 'pen' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('pen')} disabled={disabled}>Pen</button>
              <button type="button" className={`btn ${tool === 'eraser' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('eraser')} disabled={disabled}>Eraser</button>
              <button type="button" className={`btn ${tool === 'circle' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('circle')} disabled={disabled}>Circle</button>
              <button type="button" className={`btn ${tool === 'rectangle' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('rectangle')} disabled={disabled}>Rectangle</button>
              <button type="button" className={`btn ${tool === 'bucket' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTool('bucket')} disabled={disabled}>Bucket</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(DrawingCanvas);
