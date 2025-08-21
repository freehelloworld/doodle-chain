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
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="card-title mb-0">Your prompt to draw is:</h2>
              {timer !== null && <span className="badge bg-secondary fs-4">{timer}</span>}
            </div>
            <p className="card-text p-3 bg-light border rounded">
              <em>"{task.prompt}"</em>
            </p>
            <div className="mt-4">
              <DrawingCanvas onDraw={handleDraw} disabled={isSubmitted} />
            </div>
            <div className="d-grid gap-2 mt-4">
              {isSubmitted ? (
                <button className="btn btn-secondary" onClick={handleEdit}>Edit</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>Submit Drawing</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingPhase;