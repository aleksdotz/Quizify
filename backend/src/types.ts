export type QuizDuration = 'short' | 'medium' | 'long';
export type GameMode = 'solo' | 'teams';
export type QuestionType = 'multiple-choice' | 'open' | 'match';
export type GameStatus = 'waiting' | 'question' | 'question-ended' | 'round-end' | 'ended';

export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  score: number;
  roundScore: number;
  answeredCurrentQuestion: boolean;
  lastAnswerCorrect?: boolean;
  lastScoreGained?: number;
  lastAnswerTime?: number;
  answer?: string;
}

export interface QuizSettings {
  name: string;
  duration: QuizDuration;
  categories: string[];
  gameMode: GameMode;
}

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  question: string;
  options: string[];
  correct: string;
  timeLimit: number;
  image?: string;
}

export interface PlayerScore {
  id: string;
  nickname: string;
  score: number;
  roundScore: number;
  gained: number;
  rank: number;
  answeredCorrectly?: boolean;
  answer?: string;
}

export interface GameRoom {
  code: string;
  hostSocketId: string;
  settings: QuizSettings;
  players: Map<string, Player>;
  questions: Question[];
  currentQuestionIndex: number;
  currentRound: number;
  questionsPerRound: number;
  totalRounds: number;
  status: GameStatus;
  currentAnswers: Map<string, string>;
  timer: ReturnType<typeof setTimeout> | null;
  questionStartTime: number;
}
