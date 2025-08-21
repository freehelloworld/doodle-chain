import { useState, useEffect } from 'react';

interface DescribingPhaseProps {
  task: {
    drawing?: string;
  };
  onSubmitDescription: (description: string) => void;
  timer: number | null;
}

const DescribingPhase: React.FC<DescribingPhaseProps> = ({ task, onSubmitDescription, timer }) => {
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      onSubmitDescription(description || 'Timeout');
    }
  }, [timer, description, onSubmitDescription]);

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmitDescription(description);
      setIsSubmitted(true);
    }
  };

  const handleEdit = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="card-title mb-0">Describe this drawing:</h2>
              {timer !== null && <span className="badge bg-secondary fs-4">{timer}</span>}
            </div>
            <img src={task.drawing} alt="Drawing to describe" className="img-fluid border rounded mb-4" />
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., A dog chasing a butterfly"
                disabled={isSubmitted}
              />
            </div>
            <div className="d-grid gap-2">
              {isSubmitted ? (
                <button className="btn btn-secondary" onClick={handleEdit}>Edit</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>Submit Description</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescribingPhase;