const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const lobbies = {}; // In-memory store for lobbies

const generateGameCode = () => {
  // Generate a random 4-character alphanumeric code
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

const assignTasks = (lobby, currentPhase) => {
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


io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-game', ({ playerName }) => {
    const gameCode = generateGameCode();
    lobbies[gameCode] = {
      gameCode,
      players: [{ id: socket.id, name: playerName, isHost: true }],
      gameState: 'LOBBY'
    };
    socket.join(gameCode);
    // Send lobby data back to the creator
    io.to(gameCode).emit('lobby-update', lobbies[gameCode]);
    console.log(`Game created with code: ${gameCode} by ${playerName}`);
  });

  socket.on('join-game', ({ gameCode, playerName }) => {
    const lobby = lobbies[gameCode];
    if (lobby) {
      // Add player to the lobby
      lobby.players.push({ id: socket.id, name: playerName, isHost: false });
      socket.join(gameCode);
      // Broadcast the updated lobby state to all clients in the room
      io.to(gameCode).emit('lobby-update', lobby);
      console.log(`${playerName} joined game ${gameCode}`);
    } else {
      // Handle case where lobby doesn't exist
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('start-game', ({ gameCode }) => {
    const lobby = lobbies[gameCode];
    const player = lobby.players.find(p => p.id === socket.id);

    if (lobby && player && player.isHost) {
      console.log(`Game ${gameCode} is starting.`);
      lobby.gameState = 'PROMPT_PHASE';
      lobby.round = 2;

      // Create a "book" for each player, identified by the owner's socket ID
      lobby.books = {};
      lobby.bookOrder = {}; // Maps player ID to the book ID they currently hold
      lobby.players.forEach(p => {
        lobby.books[p.id] = {
          owner: p,
          pages: []
        };
        lobby.bookOrder[p.id] = p.id; // Initially, each player holds their own book
      });

      // First round is prompting, no need to assign tasks yet
      lobby.players.forEach(p => {
        io.to(p.id).emit('new-task', {
          type: 'PROMPT',
          bookId: p.id,
          bookOwnerName: p.name
        });
      });

      io.to(gameCode).emit('lobby-update', lobby);
    }
  });

  socket.on('submit-prompt', ({ gameCode, bookId, prompt }) => {
    const lobby = lobbies[gameCode];
    if (!lobby) return;

    const book = lobby.books[bookId];
    if (book) {
      book.pages.push({ type: 'PROMPT', text: prompt, authorId: socket.id });

      // Check if all players have submitted their prompts
      const totalPages = Object.values(lobby.books).reduce((sum, b) => sum + b.pages.length, 0);
      if (totalPages === lobby.players.length) {
        console.log(`All prompts submitted for game ${gameCode}. Starting DRAWING_PHASE.`);
        lobby.gameState = 'DRAWING_PHASE';
        assignTasks(lobby, 'DRAWING_PHASE');
        io.to(gameCode).emit('lobby-update', lobby);
      }
    }
  });

  socket.on('submit-drawing', ({ gameCode, bookId, drawing }) => {
    const lobby = lobbies[gameCode];
    if (!lobby) return;
    
    const book = lobby.books[bookId];
    if (book) {
      book.pages.push({ type: 'DRAWING', dataUrl: drawing, authorId: socket.id });

      // Check if all players have submitted their drawings
      const totalPages = Object.values(lobby.books).reduce((sum, b) => sum + b.pages.length, 0);
      if (totalPages === lobby.players.length * lobby.round) {
        lobby.round++;
        if (lobby.round > lobby.players.length) {
          console.log(`All drawings submitted for game ${gameCode}. Starting REVEAL_PHASE.`);
          lobby.gameState = 'REVEAL_PHASE';
          io.to(gameCode).emit('game-reveal', { books: lobby.books });
          io.to(gameCode).emit('lobby-update', lobby);
        } else {
          console.log(`All drawings submitted for game ${gameCode}. Starting DESCRIBING_PHASE.`);
          lobby.gameState = 'DESCRIBING_PHASE';
          assignTasks(lobby, 'DESCRIBING_PHASE');
          io.to(gameCode).emit('lobby-update', lobby);
        }
      }
    }
  });

  socket.on('submit-description', ({ gameCode, bookId, description }) => {
    const lobby = lobbies[gameCode];
    if (!lobby) return;

    const book = lobby.books[bookId];
    if (book) {
      book.pages.push({ type: 'DESCRIBING', text: description, authorId: socket.id });

      const totalPages = Object.values(lobby.books).reduce((sum, b) => sum + b.pages.length, 0);
      if (totalPages === lobby.players.length * lobby.round) {
        lobby.round++;
        if (lobby.round > lobby.players.length) {
          console.log(`All descriptions submitted for game ${gameCode}. Starting REVEAL_PHASE.`);
          lobby.gameState = 'REVEAL_PHASE';
          io.to(gameCode).emit('game-reveal', { books: lobby.books });
          io.to(gameCode).emit('lobby-update', lobby);
        } else {
          console.log(`All descriptions submitted for game ${gameCode}. Starting next DRAWING_PHASE.`);
          lobby.gameState = 'DRAWING_PHASE';
          assignTasks(lobby, 'DRAWING_PHASE');
          io.to(gameCode).emit('lobby-update', lobby);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Find which lobby the player was in and remove them
    for (const gameCode in lobbies) {
      const lobby = lobbies[gameCode];
      const playerIndex = lobby.players.findIndex(player => player.id === socket.id);
      
      if (playerIndex !== -1) {
        const wasHost = lobby.players[playerIndex].isHost;
        lobby.players.splice(playerIndex, 1);
        
        // If the lobby is empty, delete it
        if (lobby.players.length === 0) {
          delete lobbies[gameCode];
          console.log(`Lobby ${gameCode} is empty and has been deleted.`);
          break;
        }

        // If the host disconnected, assign a new host
        if (wasHost && lobby.players.length > 0) {
          lobby.players[0].isHost = true;
        }

        // Broadcast the updated lobby state
        io.to(gameCode).emit('lobby-update', lobby);
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
