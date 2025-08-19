
import { useState } from 'react';
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

  const handleDrawingComplete = (dataUrl: string) => {
    setDrawingData(dataUrl);
  };

  const handleSubmit = () => {
    if (drawingData) {
      onSubmitDrawing(drawingData);
    } else {
      alert('Please draw something before submitting!');
    }
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
              <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
            </div>
            <div className="d-grid gap-2 mt-4">
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!drawingData}>Submit Drawing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingPhase;

