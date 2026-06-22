import { GameRoom, Player, PlayerScore, Question } from './types';
import { getQuestionsByCategories, getDurationConfig } from './questions';

const rooms = new Map<string, GameRoom>();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateCode() : code;
}

export function createRoom(hostSocketId: string, settings: { name: string; duration: string; categories: string[]; gameMode: string }): GameRoom {
  const code = generateCode();
  const { totalQuestions, questionsPerRound, totalRounds } = getDurationConfig(settings.duration);
  const questions = getQuestionsByCategories(settings.categories, totalQuestions);

  const room: GameRoom = {
    code,
    hostSocketId,
    settings: {
      name: settings.name,
      duration: settings.duration as 'short' | 'medium' | 'long',
      categories: settings.categories,
      gameMode: settings.gameMode as 'solo' | 'teams',
    },
    players: new Map(),
    questions,
    currentQuestionIndex: -1,
    currentRound: 1,
    questionsPerRound,
    totalRounds,
    status: 'waiting',
    currentAnswers: new Map(),
    timer: null,
    questionStartTime: 0,
  };

  rooms.set(code, room);
  return room;
}

export function getRoom(code: string): GameRoom | undefined {
  return rooms.get(code);
}

export function addPlayer(code: string, socketId: string, nickname: string): Player | null {
  const room = rooms.get(code);
  if (!room || room.status !== 'waiting') return null;

  const id = `player-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const player: Player = {
    id,
    socketId,
    nickname,
    score: 0,
    roundScore: 0,
    answeredCurrentQuestion: false,
  };

  room.players.set(id, player);
  return player;
}

export function removePlayer(socketId: string): { code: string; player: Player } | null {
  for (const [code, room] of rooms.entries()) {
    for (const [id, player] of room.players.entries()) {
      if (player.socketId === socketId) {
        room.players.delete(id);
        return { code, player };
      }
    }
  }
  return null;
}

export function getRoomByHostSocket(socketId: string): GameRoom | undefined {
  for (const room of rooms.values()) {
    if (room.hostSocketId === socketId) return room;
  }
  return undefined;
}

export function getPlayersList(code: string): Player[] {
  const room = rooms.get(code);
  if (!room) return [];
  return Array.from(room.players.values());
}

export function startNextQuestion(code: string): { question: Question; questionIndex: number; isLastInRound: boolean } | null {
  const room = rooms.get(code);
  if (!room) return null;

  room.currentQuestionIndex++;
  if (room.currentQuestionIndex >= room.questions.length) return null;

  const question = room.questions[room.currentQuestionIndex];
  room.status = 'question';
  room.currentAnswers.clear();
  room.questionStartTime = Date.now();

  for (const player of room.players.values()) {
    player.answeredCurrentQuestion = false;
    player.lastAnswerCorrect = undefined;
    player.lastScoreGained = undefined;
    player.answer = undefined;
  }

  const questionInRound = (room.currentQuestionIndex % room.questionsPerRound) + 1;
  const isLastInRound = questionInRound === room.questionsPerRound;

  return { question, questionIndex: room.currentQuestionIndex, isLastInRound };
}

export function submitAnswer(code: string, playerId: string, answer: string): { alreadyAnswered: boolean; timeTaken: number } {
  const room = rooms.get(code);
  if (!room) return { alreadyAnswered: true, timeTaken: 0 };

  const player = room.players.get(playerId);
  if (!player || player.answeredCurrentQuestion) return { alreadyAnswered: true, timeTaken: 0 };

  const timeTaken = Math.floor((Date.now() - room.questionStartTime) / 1000);
  room.currentAnswers.set(playerId, answer);
  player.answeredCurrentQuestion = true;
  player.answer = answer;
  player.lastAnswerTime = timeTaken;

  return { alreadyAnswered: false, timeTaken };
}

export function endQuestion(code: string): { scores: PlayerScore[]; correctAnswer: string; allAnswers: { nickname: string; answer: string; correct: boolean }[] } | null {
  const room = rooms.get(code);
  if (!room || room.status !== 'question') return null;

  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }

  const currentQuestion = room.questions[room.currentQuestionIndex];
  const correctAnswer = currentQuestion.correct;
  const timeLimit = currentQuestion.timeLimit;

  for (const [playerId, player] of room.players.entries()) {
    const answer = room.currentAnswers.get(playerId);
    const isCorrect = answer === correctAnswer;

    if (isCorrect) {
      const timeTaken = player.lastAnswerTime ?? timeLimit;
      const speedBonus = Math.max(0, Math.floor(((timeLimit - timeTaken) / timeLimit) * 50));
      const gained = 100 + speedBonus;
      player.score += gained;
      player.roundScore += gained;
      player.lastScoreGained = gained;
      player.lastAnswerCorrect = true;
    } else {
      player.lastScoreGained = 0;
      player.lastAnswerCorrect = false;
    }
  }

  const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
  const scores: PlayerScore[] = sortedPlayers.map((p, i) => ({
    id: p.id,
    nickname: p.nickname,
    score: p.score,
    roundScore: p.roundScore,
    gained: p.lastScoreGained ?? 0,
    rank: i + 1,
    answeredCorrectly: p.lastAnswerCorrect,
    answer: p.answer,
  }));

  const allAnswers = Array.from(room.players.values()).map(p => ({
    nickname: p.nickname,
    answer: p.answer ?? '—',
    correct: p.answer === correctAnswer,
  }));

  room.status = 'question-ended';
  return { scores, correctAnswer, allAnswers };
}

export function endRound(code: string): { scores: PlayerScore[]; round: number; totalRounds: number; isLastRound: boolean } | null {
  const room = rooms.get(code);
  if (!room) return null;

  const sortedPlayers = Array.from(room.players.values()).sort((a, b) => b.score - a.score);
  const scores: PlayerScore[] = sortedPlayers.map((p, i) => ({
    id: p.id,
    nickname: p.nickname,
    score: p.score,
    roundScore: p.roundScore,
    gained: p.roundScore,
    rank: i + 1,
  }));

  const isLastRound = room.currentRound >= room.totalRounds;
  const round = room.currentRound;

  room.status = 'round-end';

  for (const player of room.players.values()) {
    player.roundScore = 0;
  }

  if (!isLastRound) {
    room.currentRound++;
  } else {
    room.status = 'ended';
  }

  return { scores, round, totalRounds: room.totalRounds, isLastRound };
}

export function isRoundComplete(code: string): boolean {
  const room = rooms.get(code);
  if (!room) return false;
  const questionInRound = (room.currentQuestionIndex % room.questionsPerRound) + 1;
  return questionInRound >= room.questionsPerRound;
}

export function areAllAnswered(code: string): boolean {
  const room = rooms.get(code);
  if (!room) return false;
  return Array.from(room.players.values()).every(p => p.answeredCurrentQuestion);
}

export function getAnsweredCount(code: string): { count: number; total: number; answeredPlayers: string[] } {
  const room = rooms.get(code);
  if (!room) return { count: 0, total: 0, answeredPlayers: [] };
  const players = Array.from(room.players.values());
  const answered = players.filter(p => p.answeredCurrentQuestion);
  return {
    count: answered.length,
    total: players.length,
    answeredPlayers: answered.map(p => p.nickname),
  };
}

export function deleteRoom(code: string) {
  rooms.delete(code);
}
