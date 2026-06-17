export type QuizDuration = 'short' | 'medium' | 'long';
export type GameMode = 'solo' | 'teams';
export type QuestionType = 'multiple-choice' | 'open' | 'match';
export type GameStatus = 'waiting' | 'question' | 'question-ended' | 'round-end' | 'ended';

export interface QuizSettings {
  name: string;
  duration: QuizDuration;
  categories: string[];
  gameMode: GameMode;
}

export interface PlayerInfo {
  id: string;
  nickname: string;
}

export interface QuizInfo {
  name: string;
  code: string;
  duration: QuizDuration;
  categories: string[];
  gameMode: GameMode;
}

export interface QuestionData {
  id: string;
  type: QuestionType;
  category: string;
  question: string;
  options: string[];
  correct?: string;
}

export interface QuestionPayload {
  questionIndex: number;
  totalQuestions: number;
  questionInRound: number;
  questionsPerRound: number;
  round: number;
  totalRounds: number;
  timeLimit: number;
  question: QuestionData;
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

export interface QuestionEndedPayload {
  correctAnswer: string;
  scores: PlayerScore[];
  allAnswers: { nickname: string; answer: string; correct: boolean }[];
  answeredCount: number;
  totalPlayers: number;
}

export interface RoundEndPayload {
  round: number;
  totalRounds: number;
  scores: PlayerScore[];
}

export const DURATION_LABELS: Record<QuizDuration, { label: string; questions: string; time: string }> = {
  short:  { label: 'Short',  questions: '10 questions', time: '~15 min' },
  medium: { label: 'Medium', questions: '20 questions', time: '~30 min' },
  long:   { label: 'Long',   questions: '30 questions', time: '~60 min' },
};

export const CATEGORIES = ['History', 'Sports', 'Music', 'Movies', 'General Knowledge', 'Technology'];
