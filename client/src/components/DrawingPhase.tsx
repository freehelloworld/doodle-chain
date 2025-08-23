import { useState, useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';

interface DrawingPhaseProps {
  task: {
    prompt?: string;
  };
  onSubmitDrawing: (drawingDataUrl: string) => void;
  timer: number | null;
}

const DrawingPhase: React.FC<DrawingPhaseProps> = ({ task, onSubmitDrawing, timer }) => {
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      onSubmitDrawing(drawingData || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=');
    }
  }, [timer, drawingData, onSubmitDrawing]);

  const handleDraw = (dataUrl: string) => {
    setDrawingData(dataUrl);
  };

  const handleSubmit = () => {
    if (drawingData) {
      onSubmitDrawing(drawingData);
      setIsSubmitted(true);
    } else {
      alert('Please draw something before submitting!');
    }
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="d-flex flex-column flex-grow-1 p-3">
      <div className="text-center">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="card-title h5 mb-0">Your prompt to draw is:</h2>
        </div>
        <p className="card-text p-2 bg-light border rounded small">
          <em>"{task.prompt}"</em>
        </p>
      </div>
      <div className="flex-grow-1 my-2 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 0 }}>
        <div className="w-100 flex-grow-1 d-flex justify-content-center align-items-center">
          <DrawingCanvas onDraw={handleDraw} disabled={isSubmitted} timer={timer} />
        </div>
        <div className="d-grid gap-2 mt-3">
          {isSubmitted ? (
            <button className="btn btn-secondary btn-sm" onClick={handleEdit}>Edit</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={handleSubmit}>Submit Drawing</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrawingPhase;
