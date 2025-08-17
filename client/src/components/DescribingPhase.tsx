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
    <div>
      <h2>Describe this drawing:</h2>
      <img src={task.drawing} alt="Drawing to describe" style={{ maxWidth: '100%', border: '1px solid #ccc' }} />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., A dog chasing a butterfly"
        rows={4}
        style={{ width: '100%', marginTop: '10px' }}
      />
      <button onClick={handleSubmit}>Submit Description</button>
    </div>
  );
};

export default DescribingPhase;
