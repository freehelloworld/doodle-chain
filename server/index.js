const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const lobbies = {}; // In-memory store for lobbies

const generateGameCode = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

const getSanitizedLobby = (lobby) => {
  const sanitizedLobby = { ...lobby };
  delete sanitizedLobby.timer;
  delete sanitizedLobby.submittedPlayers;
  return sanitizedLobby;
};

const startTimer = (gameCode, duration, onTimeout) => {
  const lobby = lobbies[gameCode];
  if (!lobby) return;

  if (lobby.timer) {
    clearInterval(lobby.timer);
  }

  let remainingTime = duration;
  io.to(gameCode).emit('time-update', remainingTime);

  lobby.timer = setInterval(() => {
    remainingTime--;
    io.to(gameCode).emit('time-update', remainingTime);

    if (remainingTime <= 0) {
      clearInterval(lobby.timer);
      onTimeout();
    }
  }, 1000);
};

const assignTasks = (lobby, currentPhase) => {
  lobby.submittedPlayers = new Set();
  const players = lobby.players.map(p => p.id);
  const currentBookOrder = { ...lobby.bookOrder };
  const newBookOrder = {};

  players.forEach((playerId, index) => {
    const nextPlayerIndex = (index + 1) % players.length;
    const nextPlayerId = players[nextPlayerIndex];
    newBookOrder[nextPlayerId] = currentBookOrder[playerId];
  });

  lobby.bookOrder = newBookOrder;

  players.forEach(playerId => {
    const bookId = lobby.bookOrder[playerId];
    const bookToWorkOn = lobby.books[bookId];
    let task;

    if (currentPhase === 'PROMPT_PHASE') {
      task = {
        type: 'PROMPT',
        bookId: bookId,
        bookOwnerName: bookToWorkOn.owner.name
      };
    } else if (currentPhase === 'DRAWING_PHASE') {
      const lastPage = bookToWorkOn.pages[bookToWorkOn.pages.length - 1];
      task = {
        type: 'DRAWING',
        bookId: bookId,
        prompt: lastPage.text
      };
    } else if (currentPhase === 'DESCRIBING_PHASE') {
      const lastPage = bookToWorkOn.pages[bookToWorkOn.pages.length - 1];
      task = {
        type: 'DESCRIBING',
        bookId: bookId,
        drawing: lastPage.dataUrl
      };
    }
    io.to(playerId).emit('new-task', task);
  });
};

const handleSubmission = (gameCode, playerId, bookId, data, type, isTimeout = false) => {
  const lobby = lobbies[gameCode];
  if (!lobby || lobby.submittedPlayers.has(playerId)) return;

  const book = lobby.books[bookId];
  if (book) {
    const page = { type, authorId: playerId };
    if (type === 'PROMPT') page.text = data;
    else if (type === 'DRAWING') page.dataUrl = data;
    else if (type === 'DESCRIBING') page.text = data;

    book.pages.push(page);
    lobby.submittedPlayers.add(playerId);

    if (lobby.submittedPlayers.size === lobby.players.length) {
      clearInterval(lobby.timer);
      if (lobby.gameState === 'DRAWING_PHASE' || lobby.gameState === 'DESCRIBING_PHASE') {
        lobby.round++;
        if (lobby.round > lobby.players.length) {
          lobby.gameState = 'REVEAL_PHASE';
          io.to(gameCode).emit('lobby-update', getSanitizedLobby(lobby));
        } else {
          lobby.gameState = lobby.gameState === 'DRAWING_PHASE' ? 'DESCRIBING_PHASE' : 'DRAWING_PHASE';
          assignTasks(lobby, lobby.gameState);
          if (!isTimeout) {
            const timerDuration = lobby.gameState === 'DRAWING_PHASE' ? lobby.timerSettings.drawingTimer : lobby.timerSettings.describingTimer;
            startTimer(gameCode, timerDuration, () => handleTimeout(gameCode));
          }
        }
      } else if (lobby.gameState === 'PROMPT_PHASE') {
        lobby.gameState = 'DRAWING_PHASE';
        assignTasks(lobby, lobby.gameState);
        if (!isTimeout) {
          startTimer(gameCode, lobby.timerSettings.drawingTimer, () => handleTimeout(gameCode));
        }
      }
      io.to(gameCode).emit('lobby-update', getSanitizedLobby(lobby));
    }
  }
};

const handleTimeout = (gameCode) => {
  const lobby = lobbies[gameCode];
  if (!lobby) return;

  console.log(`Timer ended for ${lobby.gameState} in game ${gameCode}.`);
  const playersToSubmit = lobby.players.filter(p => !lobby.submittedPlayers.has(p.id));

  playersToSubmit.forEach(player => {
    const bookId = lobby.bookOrder[player.id];
    if (lobby.gameState === 'DRAWING_PHASE') {
      handleSubmission(gameCode, player.id, bookId, 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'DRAWING', true);
    } else if (lobby.gameState === 'DESCRIBING_PHASE') {
      handleSubmission(gameCode, player.id, bookId, 'Timeout', 'DESCRIBING', true);
    }
  });
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-game', ({ playerName }) => {
    const gameCode = generateGameCode();
    lobbies[gameCode] = {
      gameCode,
      players: [{ id: socket.id, name: playerName, isHost: true }],
      gameState: 'LOBBY',
      timerSettings: { drawingTimer: 60, describingTimer: 30 },
      submittedPlayers: new Set(),
    };
    socket.join(gameCode);
    io.to(gameCode).emit('lobby-update', getSanitizedLobby(lobbies[gameCode]));
    console.log(`Game created with code: ${gameCode} by ${playerName}`);
  });

  socket.on('join-game', ({ gameCode, playerName }) => {
    const lobby = lobbies[gameCode];
    if (lobby) {
      lobby.players.push({ id: socket.id, name: playerName, isHost: false });
      socket.join(gameCode);
      io.to(gameCode).emit('lobby-update', getSanitizedLobby(lobby));
      console.log(`${playerName} joined game ${gameCode}`);
    } else {
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('start-game', ({ gameCode, timerSettings }) => {
    const lobby = lobbies[gameCode];
    const player = lobby.players.find(p => p.id === socket.id);

    if (lobby && player && player.isHost) {
      console.log(`Game ${gameCode} is starting.`);
      lobby.gameState = 'PROMPT_PHASE';
      lobby.round = 2;
      lobby.timerSettings = timerSettings;

      lobby.books = {};
      lobby.bookOrder = {};
      lobby.players.forEach(p => {
        lobby.books[p.id] = {
          owner: p,
          pages: []
        };
        lobby.bookOrder[p.id] = p.id;
      });

      assignTasks(lobby, 'PROMPT_PHASE');
      io.to(gameCode).emit('lobby-update', getSanitizedLobby(lobby));
    }
  });

  socket.on('submit-prompt', ({ gameCode, bookId, prompt }) => {
    handleSubmission(gameCode, socket.id, bookId, prompt, 'PROMPT');
  });

  socket.on('submit-drawing', ({ gameCode, bookId, drawing }) => {
    handleSubmission(gameCode, socket.id, bookId, drawing, 'DRAWING');
  });

  socket.on('submit-description', ({ gameCode, bookId, description }) => {
    handleSubmission(gameCode, socket.id, bookId, description, 'DESCRIBING');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const gameCode in lobbies) {
      const lobby = lobbies[gameCode];
      if (lobby.timer) {
        clearInterval(lobby.timer);
      }
      const playerIndex = lobby.players.findIndex(player => player.id === socket.id);
      
      if (playerIndex !== -1) {
        const wasHost = lobby.players[playerIndex].isHost;
        lobby.players.splice(playerIndex, 1);
        
        if (lobby.players.length === 0) {
          delete lobbies[gameCode];
          console.log(`Lobby ${gameCode} is empty and has been deleted.`);
          break;
        }

        if (wasHost && lobby.players.length > 0) {
          lobby.players[0].isHost = true;
        }

        io.to(gameCode).emit('lobby-update', getSanitizedLobby(lobby));
        break;
      }
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`listening on *:${port}`);
});