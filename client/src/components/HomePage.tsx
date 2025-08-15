import React, { useState } from 'react';

interface HomePageProps {
  onCreateGame: (playerName: string) => void;
  onJoinGame: (playerName: string, gameCode: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCreateGame, onJoinGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName);
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && gameCode.trim()) {
      onJoinGame(playerName, gameCode.toUpperCase());
    }
  };

  return (
    <div>
      <h1>Doodle Chain</h1>
      <div>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <div>
        <button onClick={handleCreateGame}>Create New Game</button>
      </div>
      <hr />
      <div>
        <input
          type="text"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          placeholder="Enter game code"
        />
        <button onClick={handleJoinGame}>Join Game</button>
      </div>
    </div>
  );
};

export default HomePage;
