import { useState, useEffect } from 'react';

interface PromptPhaseProps {
  task: {
    bookOwnerName?: string;
  };
  onSubmitPrompt: (prompt: string) => void;
  timer: number | null;
}

const PromptPhase: React.FC<PromptPhaseProps> = ({ task, onSubmitPrompt, timer }) => {
  const [prompt, setPrompt] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (timer === 0 && !isSubmitted) {
      onSubmitPrompt(prompt || 'Timeout');
      setIsSubmitted(true);
    }
  }, [timer, prompt, onSubmitPrompt, isSubmitted]);

  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmitPrompt(prompt);
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
              <h2 className="card-title mb-0">Write a sentence for {task.bookOwnerName}'s book!</h2>
              {timer !== null && <span className="badge bg-secondary fs-4">{timer}</span>}
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A cat wearing a tiny hat"
                disabled={isSubmitted}
              />
            </div>
            <div className="d-grid gap-2">
              {isSubmitted ? (
                <button className="btn btn-secondary" onClick={handleEdit}>Edit</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptPhase;
