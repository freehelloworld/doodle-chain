import { useState } from 'react';

interface DescribingPhaseProps {
  task: {
    drawing?: string;
  };
  onSubmitDescription: (description: string) => void;
}

const DescribingPhase: React.FC<DescribingPhaseProps> = ({ task, onSubmitDescription }) => {
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (description.trim()) {
      onSubmitDescription(description);
    }
  };

  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <h2 className="card-title mb-4">Describe this drawing:</h2>
            <img src={task.drawing} alt="Drawing to describe" className="img-fluid border rounded mb-4" />
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., A dog chasing a butterfly"
              />
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={handleSubmit}>Submit Description</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescribingPhase;
