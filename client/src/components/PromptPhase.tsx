import { useState } from 'react';

interface PromptPhaseProps {
  task: {
    bookOwnerName?: string;
  };
  onSubmitPrompt: (prompt: string) => void;
}

const PromptPhase: React.FC<PromptPhaseProps> = ({ task, onSubmitPrompt }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmitPrompt(prompt);
    }
  };

  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card p-4">
            <h2 className="card-title mb-4">Write a sentence for {task.bookOwnerName}'s book!</h2>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cat wearing a tiny hat"
              />
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptPhase;
