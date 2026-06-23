'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import QuizifyLogo from '@/components/QuizifyLogo';
import CountdownTimer from '@/components/CountdownTimer';
import { getSocket } from '@/lib/socket';
import { QuestionPayload, PlayerScore, QuestionEndedPayload, RoundEndPayload, QuizInfo, PlayerInfo } from '@/lib/types';

type PlayerView = 'lobby' | 'question' | 'submitted' | 'question-result' | 'round-end' | 'ended';

interface StoredPlayerData {
  playerId: string;
  nickname: string;
  quizInfo: QuizInfo;
  players: PlayerInfo[];
}

export default function PlayPage() {
  const router = useRouter();
  const socket = getSocket();

  const [playerData, setPlayerData] = useState<StoredPlayerData | null>(null);
  const [view, setView] = useState<PlayerView>('lobby');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [questionResult, setQuestionResult] = useState<QuestionEndedPayload | null>(null);
  const [roundData, setRoundData] = useState<RoundEndPayload | null>(null);
  const [finalScores, setFinalScores] = useState<PlayerScore[]>([]);
  const [myScore, setMyScore] = useState<PlayerScore | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('quizify_player');
    if (!stored) { router.push('/join'); return; }

    const data: StoredPlayerData = JSON.parse(stored);
    setPlayerData(data);
    setPlayers(data.players || []);
    setTotalPlayers(data.players?.length || 0);

    socket.on('quiz:player-joined', ({ players: ps, count }: { players: PlayerInfo[]; count: number }) => {
      setPlayers(ps);
      setTotalPlayers(count);
    });

    socket.on('quiz:player-left', ({ players: ps }: { players: PlayerInfo[] }) => {
      setPlayers(ps);
      setTotalPlayers(ps.length);
    });

    socket.on('quiz:started', () => {
      // handled by quiz:question
    });

    socket.on('quiz:question', (payload: QuestionPayload) => {
      setCurrentQuestion(payload);
      setSelectedAnswer(null);
      setSubmittedAnswer(null);
      setAnswerSubmitted(false);
      setTimeTaken(0);
      setAnsweredCount(0);
      setQuestionResult(null);
      setView('question');
      setTimerKey(k => k + 1);
      startTimeRef.current = Date.now();
    });

    socket.on('quiz:answer-received', ({ count, total }: { count: number; total: number; answeredPlayers: string[] }) => {
      setAnsweredCount(count);
      setTotalPlayers(total);
    });

    socket.on('quiz:question-ended', (payload: QuestionEndedPayload) => {
      setQuestionResult(payload);
      const me = payload.scores.find(s => s.id === data.playerId);
      if (me) setMyScore(me);
      setAnsweredCount(payload.answeredCount);
      setTotalPlayers(payload.totalPlayers);
      setView('question-result');
    });

    socket.on('quiz:round-end', (payload: RoundEndPayload) => {
      setRoundData(payload);
      const me = payload.scores.find(s => s.id === data.playerId);
      if (me) setMyScore(me);
      setView('round-end');
    });

    socket.on('quiz:ended', ({ scores }: { scores: PlayerScore[] }) => {
      setFinalScores(scores);
      const me = scores.find(s => s.id === data.playerId);
      if (me) setMyScore(me);
      setView('ended');
    });

    socket.on('quiz:host-disconnected', () => {
      alert('The host disconnected. Returning home.');
      router.push('/');
    });

    return () => {
      socket.off('quiz:player-joined');
      socket.off('quiz:player-left');
      socket.off('quiz:started');
      socket.off('quiz:question');
      socket.off('quiz:answer-received');
      socket.off('quiz:question-ended');
      socket.off('quiz:round-end');
      socket.off('quiz:ended');
      socket.off('quiz:host-disconnected');
    };
  }, []);

  const handleSubmit = (answer: string) => {
    if (!answer || answerSubmitted || !playerData || !currentQuestion) return;
    const taken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setTimeTaken(taken);
    setSelectedAnswer(answer);
    setAnswerSubmitted(true);
    setSubmittedAnswer(answer);
    setView('submitted');

    socket.emit('player:answer', {
      code: playerData.quizInfo.code,
      answer,
    }, (res: { ok: boolean; timeTaken?: number }) => {
      if (res.timeTaken !== undefined) setTimeTaken(res.timeTaken);
    });
  };

  // ── LOBBY ────────────────────────────────────────────────────────────────
  if (view === 'lobby' && playerData) {
    const qi = playerData.quizInfo;
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-10">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-sm anim-slide-up">
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex justify-center">
              <QuizifyLogo size="md" />
            </div>

            {/* You joined */}
            <div className="card-inner p-4 text-center">
              <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>YOU JOINED</p>
              <h2 className="text-xl font-black text-white">{qi.name}</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Playing as: <strong className="text-white">{playerData.nickname}</strong></p>
            </div>

            {/* Waiting */}
            <div className="card-inner p-5 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full border-2 flex items-center justify-center ping-slow" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                <div className="w-8 h-8 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Waiting for host to start the quiz.</p>
            </div>

            {/* Players */}
            <div className="card-inner p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>PLAYERS IN LOBBY</p>
                <span className="text-xs font-semibold" style={{ color: '#f5c518' }}>{players.length} Joined</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {players.map(p => {
                  const isMe = p.id === playerData.playerId;
                  return (
                    <span key={p.id} className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{ background: isMe ? 'rgba(245,197,24,0.15)' : 'rgba(255,255,255,0.06)', borderColor: isMe ? '#f5c518' : 'rgba(255,255,255,0.12)', color: isMe ? '#f5c518' : 'rgba(255,255,255,0.7)' }}>
                      {p.nickname}{isMe ? ' (You)' : ''}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Quiz info */}
            <div className="card-inner p-4">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>QUIZ INFO</p>
              <div className="flex flex-col gap-2">
                {[
                  ['Duration', qi.duration === 'short' ? 'Short (15 min)' : qi.duration === 'medium' ? 'Medium (30 min)' : 'Long (60 min)'],
                  ['Categories', qi.categories.length ? qi.categories.join(', ') : 'All Categories'],
                  ['Mode', qi.gameMode === 'solo' ? 'Solo' : 'Teams'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-sm text-white">{k}</span>
                    <span className="text-sm font-semibold" style={{ color: '#8b8ded' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION ─────────────────────────────────────────────────────────────
  if (view === 'question' && currentQuestion) {
    const q = currentQuestion;
    const LABELS = ['A', 'B', 'C', 'D'];
    const TAB_LABELS: Record<string, string> = { 'multiple-choice': 'MULTIPLE CHOICE', 'open': 'OPEN QUESTION', 'match': 'MATCH / CONNECT' };

    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-8">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-sm anim-slide-up">
          <div className="card p-4 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--card-inner)' }}>
              {['multiple-choice', 'open', 'match'].map(tab => (
                <button key={tab} disabled className="flex-1 py-2 px-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: q.question.type === tab ? '#f5c518' : 'transparent',
                    color: q.question.type === tab ? '#000' : 'rgba(255,255,255,0.35)',
                  }}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                {q.question.category}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Q {q.questionInRound} / {q.questionsPerRound}</span>
              <CountdownTimer key={timerKey} timeLimit={q.timeLimit} compact onExpire={() => { if (!answerSubmitted) setView('submitted'); }} />
            </div>

            {/* Question */}
            <div className="card-inner p-4 text-center">
              <p className="text-base font-bold text-white leading-snug">{q.question.question}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2">
              {q.question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmit(opt)}
                  disabled={answerSubmitted}
                  className={`answer-option p-3 flex items-center gap-2 text-left ${selectedAnswer === opt ? 'selected' : ''}`}
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: selectedAnswer === opt ? '#f5c518' : 'rgba(255,255,255,0.1)',
                      color: selectedAnswer === opt ? '#000' : 'rgba(255,255,255,0.6)',
                    }}>
                    {LABELS[i]}
                  </div>
                  <span className="text-sm font-medium text-white leading-tight">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SUBMITTED ─────────────────────────────────────────────────────────────
  if (view === 'submitted') {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-8">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-sm anim-slide-up">
          <div className="card p-4 flex flex-col gap-4">
            {/* Submitted confirmation */}
            <div className="card-inner p-6 text-center anim-bounce-in">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(245,197,24,0.15)', border: '2px solid rgba(245,197,24,0.4)' }}>
                <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-white">Answer Submitted!</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Your answer has been recorded</p>
            </div>

            {/* Waiting for others */}
            <div className="card-inner p-5 text-center">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>WAITING FOR OTHERS</p>
              <div className="flex items-center justify-center gap-1.5 mb-2 flex-wrap">
                {Array.from({ length: totalPlayers }).map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full transition-all"
                    style={{ background: i < answeredCount ? '#f5c518' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              <p className="font-bold text-lg text-white">
                {answeredCount} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>/ {totalPlayers}</span>
                <span className="text-sm ml-2" style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Answered</span>
              </p>
            </div>

            {/* Summary */}
            {currentQuestion && (
              <div className="card-inner p-5">
                <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>QUESTION SUMMARY</p>
                <div className="flex flex-col gap-2">
                  {[
                    ['Question', `${currentQuestion.questionInRound} / ${currentQuestion.questionsPerRound}`],
                    ['Your answer', submittedAnswer || '—'],
                    ['Time taken', `${timeTaken}s`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-sm text-white">{k}</span>
                      <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Results will be shown when all players have answered or time runs out
            </p>

            <button disabled className="btn-yellow w-full py-4 opacity-40 cursor-not-allowed">
              View Results →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION RESULT ────────────────────────────────────────────────────────
  if (view === 'question-result' && questionResult && currentQuestion) {
    const wasCorrect = myScore?.answeredCorrectly;
    const myAnswer = questionResult.allAnswers.find(a => a.nickname === playerData?.nickname);

    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-8">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-sm anim-scale-in">
          <div className="card p-4 flex flex-col gap-4">
            {/* Correct/Wrong */}
            <div className={`card-inner p-5 text-center ${wasCorrect ? '' : ''}`} style={{ borderColor: wasCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)', borderWidth: 1, borderStyle: 'solid' }}>
              <div className="text-4xl mb-2">{wasCorrect ? '🎉' : '❌'}</div>
              <h2 className="text-xl font-black" style={{ color: wasCorrect ? '#4ade80' : '#f87171' }}>
                {wasCorrect ? 'Correct!' : 'Wrong!'}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Correct answer: <strong className="text-white">{questionResult.correctAnswer}</strong>
              </p>
              {wasCorrect && myScore && myScore.gained > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(74,222,128,0.15)' }}>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>+{myScore.gained} pts</span>
                </div>
              )}
            </div>

            {/* My position */}
            {myScore && (
              <div className="card-inner p-4 text-center">
                <p className="text-xs font-bold tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>YOUR POSITION</p>
                <p className="text-3xl font-black text-white">#{myScore.rank}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Total: <strong className="text-white">{myScore.score} pts</strong></p>
              </div>
            )}

            {/* Top scores */}
            <div className="card-inner p-4">
              <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>LEADERBOARD</p>
              {questionResult.scores.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-xs w-5 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>{i + 1}</span>
                  <span className="text-sm font-medium flex-1 text-white truncate">{s.nickname}</span>
                  {s.gained > 0 && <span className="text-xs" style={{ color: '#4ade80' }}>+{s.gained}</span>}
                  <span className="text-sm font-bold text-white">{s.score}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Waiting for host to continue…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── ROUND END ──────────────────────────────────────────────────────────────
  if (view === 'round-end' && roundData) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-8">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-sm anim-scale-in">
          <div className="card p-5 flex flex-col gap-4">
            <h2 className="text-center text-lg font-bold" style={{ color: '#f5c518' }}>
              Intermediate Score Round {roundData.round}
            </h2>

            {myScore && (
              <div className="card-inner p-4 text-center">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Your rank</p>
                <p className="text-4xl font-black text-white">#{myScore.rank}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{myScore.score} pts total</p>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {roundData.scores.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: i === 0 ? '#f5c518' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)', color: i < 3 ? '#000' : 'white' }}>
                    {s.rank}
                  </div>
                  <span className={`font-semibold flex-1 ${s.id === playerData?.playerId ? 'text-yellow-300' : 'text-white'}`}>{s.nickname}</span>
                  {s.gained > 0 && <span className="text-xs" style={{ color: '#4ade80' }}>↗ +{s.gained}</span>}
                  <span className="font-black text-sm text-white">{s.score} pts</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>Waiting for host to start next round…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── FINAL RESULTS ──────────────────────────────────────────────────────────
  if (view === 'ended') {
    const top3 = finalScores.slice(0, 3);
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-8">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-sm anim-slide-up">
          <div className="card p-5 flex flex-col gap-4">
            <div className="flex justify-center">
              <QuizifyLogo size="md" />
            </div>

            {myScore && (
              <div className="card-inner p-4 text-center">
                <p className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  YOU ENDED IN {myScore.rank}{['st','nd','rd'][myScore.rank - 1] || 'th'} PLACE
                </p>
              </div>
            )}

            {/* Mini podium */}
            <div className="flex items-end justify-center gap-3">
              {podiumOrder.map(p => {
                if (!p) return null;
                const rank = p.rank;
                const h = rank === 1 ? 90 : rank === 2 ? 72 : 58;
                const isMe = p.id === playerData?.playerId;
                return (
                  <div key={p.id} className="flex flex-col items-center">
                    <span className="text-xs mb-1" style={{ color: isMe ? '#f5c518' : 'rgba(255,255,255,0.7)', fontWeight: isMe ? 700 : 400 }}>{p.nickname}</span>
                    <div className={`podium-${rank} flex items-center justify-center rounded-xl`} style={{ width: 72, height: h }}>
                      <span className="font-black text-2xl" style={{ color: 'rgba(0,0,0,0.6)' }}>{rank}</span>
                    </div>
                    <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.score} pts</span>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-2">
              <button onClick={() => { sessionStorage.removeItem('quizify_player'); router.push('/'); }}
                className="flex-1 py-3.5 rounded-xl font-semibold border-2 text-sm"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                ↺ Play Again
              </button>
              <button onClick={() => { sessionStorage.removeItem('quizify_player'); router.push('/'); }}
                className="btn-yellow flex-1 py-3.5 text-sm">
                ⌂ Return Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading fallback
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <ParticleBackground />
      <div className="relative z-10 text-white text-center">
        <div className="w-10 h-10 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin mx-auto mb-4" />
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Connecting…</p>
      </div>
    </div>
  );
}
