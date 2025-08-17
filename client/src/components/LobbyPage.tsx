

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
    <div>
      <h2>Lobby</h2>
      <h3>Game Code: {gameCode}</h3>
      <h4>Players:</h4>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.name} {player.isHost ? '(Host)' : ''}
          </li>
        ))}
      </ul>
      {isHost && <button onClick={onStartGame}>Start Game</button>}
    </div>
  );
};

export default LobbyPage;
