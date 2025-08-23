

import { useState } from 'react';

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface LobbyPageProps {
  gameCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: (timerSettings: { drawingTimer: number; describingTimer: number }) => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ gameCode, players, isHost, onStartGame }) => {
  const [drawingTimer, setDrawingTimer] = useState(60);
  const [describingTimer, setDescribingTimer] = useState(30);

  const handleStartGame = () => {
    onStartGame({ drawingTimer, describingTimer });
  };

  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-sm-10 col-12">
          <div className="card p-4">
            <h2 className="card-title">Lobby</h2>
            <h3 className="card-subtitle mb-2 text-muted">Game Code: {gameCode}</h3>
            <h4 className="mt-4">Players:</h4>
            <ul className="list-group">
              {players.map((player) => (
                <li key={player.id} className="list-group-item">
                  {player.name} {player.isHost ? <span className="badge bg-primary">Host</span> : ''}
                </li>
              ))}
            </ul>
            {isHost && (
              <div>
                <div className="row mt-4">
                  <div className="col">
                    <label htmlFor="drawing-timer" className="form-label">Drawing Time (seconds)</label>
                    <input
                      id="drawing-timer"
                      type="number"
                      className="form-control"
                      value={drawingTimer}
                      onChange={(e) => setDrawingTimer(parseInt(e.target.value, 10))}
                      min="10"
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="describing-timer" className="form-label">Describing Time (seconds)</label>
                    <input
                      id="describing-timer"
                      type="number"
                      className="form-control"
                      value={describingTimer}
                      onChange={(e) => setDescribingTimer(parseInt(e.target.value, 10))}
                      min="10"
                    />
                  </div>
                </div>
                <div className="d-grid gap-2 mt-4">
                  <button className="btn btn-primary" onClick={handleStartGame}>Start Game</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
