import React, { useState } from 'react';

interface PromptPhaseProps {
  task: {
    bookOwnerName: string;
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
    <div>
      <h2>Write a sentence for {task.bookOwnerName}'s book!</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A cat wearing a tiny hat"
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default PromptPhase;
