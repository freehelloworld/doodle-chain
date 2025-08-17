import { useState } from 'react';
import DrawingCanvas from './DrawingCanvas';

interface DrawingPhaseProps {
  task: {
    prompt?: string;
  };
  onSubmitDrawing: (drawingDataUrl: string) => void;
}

const DrawingPhase: React.FC<DrawingPhaseProps> = ({ task, onSubmitDrawing }) => {
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
    <div>
      <h2>Your prompt to draw is:</h2>
      <p style={{ border: '1px solid #ccc', padding: '10px', background: '#f9f9f9' }}>
        <em>"{task.prompt}"</em>
      </p>
      <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
      <button onClick={handleSubmit} disabled={!drawingData}>Submit Drawing</button>
    </div>
  );
};

export default DrawingPhase;
