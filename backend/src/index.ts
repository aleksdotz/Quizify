import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
  createRoom, getRoom, addPlayer, removePlayer, getRoomByHostSocket,
  getPlayersList, startNextQuestion, submitAnswer, endQuestion, endRound,
  isRoundComplete, areAllAnswered, getAnsweredCount, deleteRoom,
} from './gameManager';

const allowedOrigins: string | string[] = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : '*';

const app = express();
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
});

app.get('/health', (_, res) => res.json({ ok: true }));

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  // ─── HOST: Create quiz ────────────────────────────────────────────────
  socket.on('host:create', (settings, callback) => {
    try {
      const room = createRoom(socket.id, settings);
      socket.join(`quiz-${room.code}`);
      socket.join(`host-${room.code}`);
      callback({ ok: true, code: room.code, room: serializeRoom(room) });
    } catch (e) {
      callback({ ok: false, error: 'Failed to create quiz' });
    }
  });

  // ─── HOST: Start quiz ─────────────────────────────────────────────────
  socket.on('host:start', ({ code }, callback) => {
    const room = getRoom(code);
    if (!room || room.hostSocketId !== socket.id) {
      return callback?.({ ok: false, error: 'Unauthorized' });
    }

    io.to(`quiz-${code}`).emit('quiz:started');
    sendNextQuestion(code);
    callback?.({ ok: true });
  });

  // ─── HOST: Next question ──────────────────────────────────────────────
  socket.on('host:next', ({ code }, callback) => {
    const room = getRoom(code);
    if (!room || room.hostSocketId !== socket.id) return;

    if (room.status === 'question-ended') {
      if (isRoundComplete(code)) {
        const result = endRound(code);
        if (!result) return;

        if (result.isLastRound) {
          io.to(`quiz-${code}`).emit('quiz:ended', { scores: result.scores });
        } else {
          io.to(`quiz-${code}`).emit('quiz:round-end', {
            round: result.round,
            totalRounds: result.totalRounds,
            scores: result.scores,
          });
        }
      } else {
        sendNextQuestion(code);
      }
    } else if (room.status === 'round-end') {
      sendNextQuestion(code);
    }

    callback?.({ ok: true });
  });

  // ─── HOST: Skip question ──────────────────────────────────────────────
  socket.on('host:skip', ({ code }) => {
    const room = getRoom(code);
    if (!room || room.hostSocketId !== socket.id) return;
    if (room.status !== 'question') return;

    const result = endQuestion(code);
    if (!result) return;

    const { count, total } = getAnsweredCount(code);
    io.to(`quiz-${code}`).emit('quiz:question-ended', {
      correctAnswer: result.correctAnswer,
      scores: result.scores,
      allAnswers: result.allAnswers,
      answeredCount: count,
      totalPlayers: total,
    });
  });

  // ─── PLAYER: Join quiz ────────────────────────────────────────────────
  socket.on('player:join', ({ code, nickname }, callback) => {
    const room = getRoom(code);
    if (!room) return callback({ ok: false, error: 'Quiz not found. Check your code.' });
    if (room.status !== 'waiting') return callback({ ok: false, error: 'Quiz has already started.' });

    const trimmed = nickname?.trim();
    if (!trimmed || trimmed.length < 2) return callback({ ok: false, error: 'Nickname must be at least 2 characters.' });
    if (trimmed.length > 20) return callback({ ok: false, error: 'Nickname too long (max 20 chars).' });

    const existingNames = getPlayersList(code).map(p => p.nickname.toLowerCase());
    if (existingNames.includes(trimmed.toLowerCase())) {
      return callback({ ok: false, error: 'Nickname already taken. Choose another.' });
    }

    const player = addPlayer(code, socket.id, trimmed);
    if (!player) return callback({ ok: false, error: 'Could not join quiz.' });

    socket.join(`quiz-${code}`);
    socket.data.playerId = player.id;
    socket.data.quizCode = code;

    const players = getPlayersList(code);
    io.to(`quiz-${code}`).emit('quiz:player-joined', {
      player: { id: player.id, nickname: player.nickname },
      players: players.map(p => ({ id: p.id, nickname: p.nickname })),
      count: players.length,
    });

    callback({
      ok: true,
      player: { id: player.id, nickname: player.nickname },
      quizInfo: {
        name: room.settings.name,
        code: room.code,
        duration: room.settings.duration,
        categories: room.settings.categories,
        gameMode: room.settings.gameMode,
      },
      players: players.map(p => ({ id: p.id, nickname: p.nickname })),
    });
  });

  // ─── PLAYER: Submit answer ────────────────────────────────────────────
  socket.on('player:answer', ({ code, answer }, callback) => {
    const playerId = socket.data.playerId;
    if (!playerId) return callback?.({ ok: false });

    const result = submitAnswer(code, playerId, answer);
    if (result.alreadyAnswered) return callback?.({ ok: false, error: 'Already answered' });

    callback?.({ ok: true, timeTaken: result.timeTaken });

    const { count, total, answeredPlayers } = getAnsweredCount(code);
    io.to(`host-${code}`).emit('quiz:answer-received', { count, total, answeredPlayers });

    if (areAllAnswered(code)) {
      const room = getRoom(code);
      if (room?.status === 'question') triggerEndQuestion(code);
    }
  });

  // ─── Disconnect ───────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);

    // Check if host disconnected
    const hostedRoom = getRoomByHostSocket(socket.id);
    if (hostedRoom) {
      io.to(`quiz-${hostedRoom.code}`).emit('quiz:host-disconnected');
      deleteRoom(hostedRoom.code);
      return;
    }

    // Check if player disconnected
    const removed = removePlayer(socket.id);
    if (removed) {
      const players = getPlayersList(removed.code);
      io.to(`quiz-${removed.code}`).emit('quiz:player-left', {
        player: { id: removed.player.id, nickname: removed.player.nickname },
        players: players.map(p => ({ id: p.id, nickname: p.nickname })),
        count: players.length,
      });

      if (areAllAnswered(removed.code)) {
        const room = getRoom(removed.code);
        if (room?.status === 'question') triggerEndQuestion(removed.code);
      }
    }
  });

  // ─── Helpers ──────────────────────────────────────────────────────────
  function sendNextQuestion(code: string) {
    const result = startNextQuestion(code);
    if (!result) return;

    const room = getRoom(code);
    if (!room) return;

    const { question, questionIndex } = result;
    const questionInRound = (questionIndex % room.questionsPerRound) + 1;

    const basePayload = {
      questionIndex,
      totalQuestions: room.questions.length,
      questionInRound,
      questionsPerRound: room.questionsPerRound,
      round: room.currentRound,
      totalRounds: room.totalRounds,
      timeLimit: question.timeLimit,
      question: {
        id: question.id,
        type: question.type,
        category: question.category,
        question: question.question,
        options: question.options,
      },
    };

    // Send to players WITHOUT correct answer
    socket.to(`quiz-${code}`).emit('quiz:question', basePayload);

    // Send to host WITH correct answer
    io.to(`host-${code}`).emit('quiz:question', {
      ...basePayload,
      question: { ...basePayload.question, correct: question.correct },
    });

    // Start server-side timer
    const timer = setTimeout(() => {
      const room = getRoom(code);
      if (room?.status === 'question') triggerEndQuestion(code);
    }, question.timeLimit * 1000 + 1000);

    room.timer = timer;
  }

  function triggerEndQuestion(code: string) {
    const result = endQuestion(code);
    if (!result) return;
    const { count, total } = getAnsweredCount(code);
    io.to(`quiz-${code}`).emit('quiz:question-ended', {
      correctAnswer: result.correctAnswer,
      scores: result.scores,
      allAnswers: result.allAnswers,
      answeredCount: count,
      totalPlayers: total,
    });
  }
});

function serializeRoom(room: ReturnType<typeof createRoom>) {
  return {
    code: room.code,
    settings: room.settings,
    status: room.status,
    totalQuestions: room.questions.length,
    questionsPerRound: room.questionsPerRound,
    totalRounds: room.totalRounds,
  };
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Quizify server running on port ${PORT}`);
});
