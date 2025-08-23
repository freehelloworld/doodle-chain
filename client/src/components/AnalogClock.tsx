import { useState, useEffect } from 'react';

interface AnalogClockProps {
  time: number;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ time }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const degrees = 360 - (time / 60) * 360;
    setRotation(degrees);
  }, [time]);

  return (
    <div style={{ width: '50px', height: '50px', position: 'relative' }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <circle cx="50" cy="50" r="48" fill="none" stroke="black" strokeWidth="2" />
        <line x1="50" y1="50" x2="50" y2="10" stroke="black" strokeWidth="2" transform={`rotate(${rotation} 50 50)`} />
      </svg>
    </div>
  );
};

export default AnalogClock;
