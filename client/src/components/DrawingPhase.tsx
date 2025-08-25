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
      
      <div className="flex-grow-1 my-2 d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 0 }}>
        <div className="w-100 flex-grow-1 d-flex justify-content-center align-items-center">
          <DrawingCanvas onDraw={handleDraw} disabled={isSubmitted} timer={timer} title="Your prompt to draw is:" prompt={task.prompt} />
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
