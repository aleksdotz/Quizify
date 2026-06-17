'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import ParticleBackground from '@/components/ParticleBackground';
import CountdownTimer from '@/components/CountdownTimer';
import { getSocket } from '@/lib/socket';
import { PlayerInfo, QuestionPayload, PlayerScore, QuestionEndedPayload, RoundEndPayload } from '@/lib/types';

type HostView = 'waiting' | 'question' | 'question-ended' | 'round-end' | 'ended';

export default function HostGamePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const socket = getSocket();

  const [view, setView] = useState<HostView>('waiting');
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [quizName, setQuizName] = useState('');
  const [joinUrl, setJoinUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(null);
  const [answeredPlayers, setAnsweredPlayers] = useState<string[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [questionResult, setQuestionResult] = useState<QuestionEndedPayload | null>(null);
  const [scores, setScores] = useState<PlayerScore[]>([]);
  const [roundData, setRoundData] = useState<RoundEndPayload | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'multiple-choice' | 'open' | 'match'>('multiple-choice');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/join/${code}`);
      const stored = sessionStorage.getItem('quizify_host');
      if (stored) {
        const { quizName: qn } = JSON.parse(stored);
        if (qn) setQuizName(qn);
      }
    }

    socket.on('quiz:player-joined', ({ players: ps, count }) => {
      setPlayers(ps);
    });

    socket.on('quiz:player-left', ({ players: ps }) => {
      setPlayers(ps);
    });

    socket.on('quiz:started', () => {
      // handled by next question event
    });

    socket.on('quiz:question', (payload: QuestionPayload) => {
      setAnsweredPlayers([]);
      setAnsweredCount(0);
      setQuestionResult(null);
      setCurrentQuestion(payload);
      setTimerKey(k => k + 1);
      setActiveTab(payload.question.type as 'multiple-choice' | 'open' | 'match');
      setView('question');
    });

    socket.on('quiz:answer-received', ({ count, total, answeredPlayers: ap }) => {
      setAnsweredCount(count);
      setAnsweredPlayers(ap);
    });

    socket.on('quiz:question-ended', (payload: QuestionEndedPayload) => {
      setQuestionResult(payload);
      setScores(payload.scores);
      setView('question-ended');
    });

    socket.on('quiz:round-end', (payload: RoundEndPayload) => {
      setRoundData(payload);
      setScores(payload.scores);
      setView('round-end');
    });

    socket.on('quiz:ended', ({ scores: finalScores }) => {
      setScores(finalScores);
      setView('ended');
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
    };
  }, [code]);

  const handleStart = () => {
    socket.emit('host:start', { code }, () => {});
  };

  const handleNext = () => {
    socket.emit('host:next', { code }, () => {});
  };

  const handleSkip = () => {
    socket.emit('host:skip', { code });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
  };

  // ── WAITING ROOM ─────────────────────────────────────────────────────────
  if (view === 'waiting') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center pt-10 pb-8 px-4">
          <p className="text-xs tracking-widest font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>WAITING ROOM</p>
          <h1 className="text-2xl font-black text-white mb-8">{quizName || 'Your Quiz'}</h1>

          <div className="w-full max-w-2xl flex flex-col gap-4 anim-slide-up">
            {/* Top row: QR + link/count */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-5 flex flex-col items-center gap-3">
                <p className="text-xs tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>QR CODE</p>
                <div className="qr-wrap">
                  <QRCode value={joinUrl || `http://localhost:3000/join/${code}`} size={110} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="card p-4 flex-1">
                  <p className="text-xs tracking-widest font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>JOIN LINK</p>
                  <p className="text-sm font-mono break-all" style={{ color: '#f5c518' }}>
                    {joinUrl || `localhost:3000/join/${code}`}
                  </p>
                  <button onClick={copyLink} className="mt-2 text-xs py-1 px-3 rounded-lg border transition-colors" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                    Copy
                  </button>
                </div>
                <div className="card p-4 flex flex-col items-center justify-center flex-1">
                  <span className="font-black text-5xl" style={{ color: '#e040fb', lineHeight: 1.1 }}>{players.length}</span>
                  <span className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Players Connected</span>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="card-inner flex items-center justify-center gap-3 py-4 px-6">
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Game Code:</span>
              <span className="text-2xl font-black tracking-widest text-white">{code}</span>
            </div>

            {/* Players */}
            <div className="card p-5">
              <p className="text-xs tracking-widest font-semibold mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>JOINED PLAYERS</p>
              {players.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Waiting for players to join…</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {players.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `hsl(${i * 47 + 200},60%,40%)`, color: 'white' }}>
                        {i + 1}
                      </div>
                      <span className="font-medium text-white">{p.nickname}</span>
                      <div className="ml-auto w-2 h-2 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/host/setup')}
                className="flex items-center gap-2 px-5 py-4 rounded-xl font-semibold border-2 transition-all text-sm"
                style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
              >
                ⚙ Edit Settings
              </button>
              <button
                onClick={handleStart}
                disabled={players.length === 0}
                className="btn-yellow flex-1 py-4 text-lg"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE QUESTION (HOST VIEW) ───────────────────────────────────────────
  if (view === 'question' && currentQuestion) {
    const q = currentQuestion;
    const LABELS = ['A', 'B', 'C', 'D'];
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0818' }}>
        <ParticleBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6 pb-8">
          {/* Header bar */}
          <div className="flex items-center gap-4 mb-5 card-inner px-5 py-3 rounded-xl">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Round <strong className="text-white">{q.round}</strong> / {q.totalRounds}
            </span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Q <strong className="text-white">{q.questionInRound}</strong> / {q.questionsPerRound}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(224,64,251,0.2)', color: '#e040fb' }}>
              {q.question.category}
            </span>
            <div className="ml-auto">
              <CountdownTimer key={timerKey} timeLimit={q.timeLimit} />
            </div>
          </div>

          {/* Question */}
          <div className="card p-6 mb-4">
            <h2 className="text-2xl font-black text-white">{q.question.question}</h2>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {q.question.options.map((opt, i) => (
              <div
                key={i}
                className="answer-option p-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                  {LABELS[i]}
                </div>
                <span className="font-semibold text-white">{opt}</span>
              </div>
            ))}
          </div>

          {/* Answers received */}
          <div className="card p-5 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#4ade80' }}>
                <span>✓</span> Answers Received
              </span>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg" style={{ color: '#f5c518' }}>{answeredCount}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>/ {players.length}</span>
                <div style={{ width: 80, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: players.length ? `${(answeredCount / players.length) * 100}%` : '0%', background: '#4ade80', height: '100%', borderRadius: 9999, transition: 'width 0.3s' }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-xs"
                  style={{ background: answeredPlayers.includes(p.nickname) ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)', color: answeredPlayers.includes(p.nickname) ? '#4ade80' : 'rgba(255,255,255,0.35)' }}>
                  <span>{answeredPlayers.includes(p.nickname) ? '✓' : '○'}</span>
                  <span className="truncate">{p.nickname}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button onClick={handleSkip} className="flex-1 py-4 rounded-xl font-semibold border-2 text-sm flex items-center justify-center gap-2"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
              ⏭ Skip Question
            </button>
            <button onClick={handleNext} disabled className="btn-yellow flex-[2] py-4 opacity-40 cursor-not-allowed">
              Next Question ›
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUESTION ENDED ────────────────────────────────────────────────────────
  if (view === 'question-ended' && questionResult && currentQuestion) {
    const q = currentQuestion;
    const LABELS = ['A', 'B', 'C', 'D'];
    return (
      <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a0818' }}>
        <ParticleBackground />
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-center gap-4 mb-5 card-inner px-5 py-3 rounded-xl">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Round {q.round} / {q.totalRounds}</span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Q {q.questionInRound} / {q.questionsPerRound}</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold ml-auto" style={{ background: 'rgba(224,64,251,0.2)', color: '#e040fb' }}>{q.question.category}</span>
          </div>

          <div className="card p-5 mb-4">
            <h2 className="text-xl font-black text-white">{q.question.question}</h2>
          </div>

          {/* Answer reveal */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {q.question.options.map((opt, i) => {
              const isCorrect = opt === questionResult.correctAnswer;
              return (
                <div key={i} className={`answer-option ${isCorrect ? 'correct' : 'wrong disabled'} p-4 flex items-center gap-3`}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.2)', color: isCorrect ? '#4ade80' : '#f87171' }}>
                    {LABELS[i]}
                  </div>
                  <span className="font-semibold">{opt}</span>
                  {isCorrect && <span className="ml-auto text-green-400 font-bold">✓</span>}
                </div>
              );
            })}
          </div>

          {/* Player answers */}
          <div className="card p-5 mb-4">
            <p className="text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>PLAYER ANSWERS</p>
            <div className="grid grid-cols-4 gap-2">
              {questionResult.allAnswers.map((a, i) => (
                <div key={i} className="p-2 rounded-lg text-xs text-center"
                  style={{ background: a.correct ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.1)', color: a.correct ? '#4ade80' : '#f87171', border: `1px solid ${a.correct ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
                  <div className="font-semibold truncate">{a.nickname}</div>
                  <div className="opacity-70 truncate mt-0.5">{a.answer}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleNext} className="btn-yellow w-full py-4 text-lg">
            Next Question ›
          </button>
        </div>
      </div>
    );
  }

  // ── ROUND END ─────────────────────────────────────────────────────────────
  if (view === 'round-end' && roundData) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-lg px-4 anim-scale-in">
          <div className="card p-6">
            <h2 className="text-center text-lg font-bold mb-6" style={{ color: '#f5c518' }}>
              Intermediate Score Round {roundData.round}
            </h2>
            <div className="flex flex-col gap-2 mb-6">
              {scores.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', animationDelay: `${i * 0.05}s` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: i === 0 ? '#f5c518' : i === 1 ? '#9ca3af' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)', color: i < 3 ? '#000' : 'white' }}>
                    {p.rank}
                  </div>
                  <span className="font-semibold text-white flex-1">{p.nickname}</span>
                  {p.gained > 0 && <span className="text-sm" style={{ color: '#4ade80' }}>↗ +{p.gained}</span>}
                  <span className="font-black text-white">{p.score} pts</span>
                </div>
              ))}
            </div>
            <button onClick={handleNext} className="btn-yellow w-full py-4 text-lg">
              {roundData.round >= roundData.totalRounds ? 'View Final Leaderboard ›' : `Start Round ${roundData.round + 1} ›`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── FINAL LEADERBOARD ─────────────────────────────────────────────────────
  if (view === 'ended') {
    const top3 = scores.slice(0, 3);
    const rest = scores.slice(3);
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

    return (
      <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center py-10">
        <ParticleBackground />
        <div className="relative z-10 w-full max-w-xl px-4">
          <h1 className="text-center font-black text-4xl mb-8 anim-bounce-in" style={{ color: '#f5c518' }}>
            🏆 Leaderboard 🏆
          </h1>

          {/* Podium */}
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-3 mb-8">
              {podiumOrder.map((p, vi) => {
                const rank = p.rank;
                const height = rank === 1 ? 160 : rank === 2 ? 130 : 105;
                return (
                  <div key={p.id} className="flex flex-col items-center" style={{ animationDelay: `${vi * 0.15}s` }}>
                    <span className="text-sm mb-1 font-semibold text-white">{p.nickname}</span>
                    <div
                      className={`podium-${rank} flex items-center justify-center rounded-xl`}
                      style={{ width: 100, height, borderRadius: 12 }}
                    >
                      <span className="font-black text-4xl" style={{ color: rank === 1 ? '#1a0a2e' : 'rgba(0,0,0,0.6)' }}>{rank}</span>
                    </div>
                    <span className="text-xs mt-1 font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>{p.score} pts</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="card p-4 mb-6">
              {rest.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    {p.rank}
                  </div>
                  <span className="font-medium text-white flex-1">{p.nickname}</span>
                  <span className="font-black text-white">{p.score} pts</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => router.push('/host/setup')} className="flex-1 py-4 rounded-xl font-semibold border-2"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
              ↺ Play Again
            </button>
            <button onClick={() => router.push('/')} className="btn-yellow flex-1 py-4 text-base">
              ⌂ Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <ParticleBackground />
      <div className="relative z-10 text-white text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p>Loading quiz…</p>
      </div>
    </div>
  );
}
