import { useState } from 'react';

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
    <div className="container text-center mt-5">
      <h1 className="mb-4">Doodle Chain</h1>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="d-grid gap-2">
              <button className="btn btn-primary" onClick={handleCreateGame}>Create New Game</button>
            </div>
            <hr className="my-4" />
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
                placeholder="Enter game code"
              />
              <button className="btn btn-secondary" onClick={handleJoinGame}>Join Game</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
