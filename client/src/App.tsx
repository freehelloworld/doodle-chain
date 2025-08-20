import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import HomePage from './components/HomePage';
import LobbyPage from './components/LobbyPage';
import PromptPhase from './components/PromptPhase';
import DrawingPhase from './components/DrawingPhase';
import DescribingPhase from './components/DescribingPhase';
import RevealPage from './components/RevealPage'; // New import

const socket = io(import.meta.env.PROD ? import.meta.env.VITE_SERVER_URL : 'http://localhost:3000');

interface Player {
  id: string;
  name: string;
  isHost: boolean;
}

interface LobbyState {
  gameCode: string;
  players: Player[];
  gameState: string;
  round: number;
  bookOrder: { [key: string]: string };
  books: { [key: string]: Book };
  timer: number;
}

interface Task {
    type: 'PROMPT' | 'DRAWING' | 'DESCRIBING';
    bookId: string;
    bookOwnerName?: string; // Optional for drawing/describing tasks
    prompt?: string; // For drawing task
    drawing?: string; // For describing task
}

interface Page {
  type: 'PROMPT' | 'DRAWING' | 'DESCRIBING';
  text?: string;
  dataUrl?: string;
  authorId: string;
}

interface Book {
  owner: Player;
  pages: Page[];
}

function App() {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revealedBooks, setRevealedBooks] = useState<{ [key: string]: Book } | null>(null); // New state
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    socket.on('lobby-update', (lobbyData: LobbyState) => {
      setLobby(lobbyData);
      setError(null);
      // If the game is in the reveal phase, set the revealed books
      if (lobbyData.gameState === 'REVEAL_PHASE') {
        setRevealedBooks(lobbyData.books);
      }
    });

    socket.on('new-task', (taskData: Task) => {
        setTask(taskData);
    });

    socket.on('time-update', (time: number) => {
      setTimer(time);
    });

    socket.on('error', (errorData: { message: string }) => {
      setError(errorData.message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.off('lobby-update');
      socket.off('new-task');
      socket.off('time-update');
      socket.off('error');
    };
  }, []);

  const handleCreateGame = (playerName: string) => {
    socket.emit('create-game', { playerName });
  };

  const handleJoinGame = (playerName: string, gameCode: string) => {
    socket.emit('join-game', { playerName, gameCode });
  };

  const handleStartGame = (timerSettings: { drawingTimer: number; describingTimer: number }) => {
    if (lobby) {
      socket.emit('start-game', { gameCode: lobby.gameCode, timerSettings });
    }
  };

  const handleSubmitPrompt = useCallback((prompt: string) => {
    if (lobby && task) {
        socket.emit('submit-prompt', { gameCode: lobby.gameCode, bookId: task.bookId, prompt });
        setTask(null); // Clear task after submission to show waiting message
    }
  }, [lobby, task]);

  const handleSubmitDrawing = useCallback((drawingDataUrl: string) => {
    if (lobby && task) {
        socket.emit('submit-drawing', { gameCode: lobby.gameCode, bookId: task.bookId, drawing: drawingDataUrl });
        setTask(null); // Clear task after submission
    }
  }, [lobby, task]);

  const handleSubmitDescription = useCallback((description: string) => {
    if (lobby && task) {
        socket.emit('submit-description', { gameCode: lobby.gameCode, bookId: task.bookId, description });
        setTask(null); // Clear task after submission
    }
  }, [lobby, task]);

  const amIHost = lobby?.players.find(p => p.id === socket.id)?.isHost ?? false;

  const renderContent = () => {
    try {
      if (!lobby) {
        return <HomePage onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />;
      }

      if (lobby.gameState === 'LOBBY') {
        return (
          <LobbyPage
            gameCode={lobby.gameCode}
            players={lobby.players}
            isHost={amIHost}
            onStartGame={handleStartGame}
          />
        );
      }

      if (lobby.gameState === 'PROMPT_PHASE') {
          if (task && task.type === 'PROMPT' && task.bookOwnerName) {
              return <PromptPhase task={task} onSubmitPrompt={handleSubmitPrompt} />;
          }
          return <h2>Waiting for other players to submit their prompts...</h2>;
      }

      if (lobby.gameState === 'DRAWING_PHASE') {
          if (task && task.type === 'DRAWING' && task.prompt) {
              return <DrawingPhase task={task} onSubmitDrawing={handleSubmitDrawing} timer={timer} />;
          }
          return <h2>Waiting for other players to submit their drawings...</h2>;
      }

      if (lobby.gameState === 'DESCRIBING_PHASE') {
          if (task && task.type === 'DESCRIBING' && task.drawing) {
              return <DescribingPhase task={task} onSubmitDescription={handleSubmitDescription} timer={timer} />;
          }
          return <h2>Waiting for other players to submit their descriptions...</h2>;
      }

      if (lobby.gameState === 'REVEAL_PHASE') {
          if (revealedBooks && lobby.players) {
              return <RevealPage books={revealedBooks} players={lobby.players} />; // Pass players for author names
          }
          return <h2>Waiting for game results...</h2>;
      }

      return <h2>Game in progress...</h2>;
    } catch (e: any) {
      return <div style={{ color: 'red' }}>An error occurred: {e.message}</div>;
    }
  };

  return (
    <div className="App">
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {renderContent()}
    </div>
  );
}

export default App;