

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface LobbyPageProps {
  gameCode: string;
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ gameCode, players, isHost, onStartGame }) => {
  return (
    <div className="container text-center mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
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
              <div className="d-grid gap-2 mt-4">
                <button className="btn btn-primary" onClick={onStartGame}>Start Game</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
