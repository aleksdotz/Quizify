'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import QuizifyLogo from '@/components/QuizifyLogo';
import StepIndicator from '@/components/StepIndicator';
import { getSocket } from '@/lib/socket';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [step, setStep] = useState<'code' | 'nickname'>('code');
  const [quizInfo, setQuizInfo] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCodeSubmit = () => {
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length < 4) { setError('Enter a valid game code.'); return; }
    setError('');
    // We'll validate the code when we join
    setStep('nickname');
  };

  const handleJoin = () => {
    const trimmedNickname = nickname.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedNickname || trimmedNickname.length < 2) {
      setError('Nickname must be at least 2 characters.');
      return;
    }
    setError('');
    setLoading(true);

    const socket = getSocket();
    socket.emit('player:join', { code: trimmedCode, nickname: trimmedNickname }, (res: {
      ok: boolean; error?: string;
      player?: { id: string; nickname: string };
      quizInfo?: { name: string; code: string; duration: string; categories: string[]; gameMode: string };
      players?: { id: string; nickname: string }[];
    }) => {
      if (res.ok && res.player && res.quizInfo) {
        sessionStorage.setItem('quizify_player', JSON.stringify({
          playerId: res.player.id,
          nickname: res.player.nickname,
          quizInfo: res.quizInfo,
          players: res.players,
        }));
        router.push(`/play`);
      } else {
        setError(res.error || 'Could not join. Try again.');
        setLoading(false);
      }
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-sm anim-slide-up">
        <StepIndicator current={0} />

        <div className="card p-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <QuizifyLogo size="md" />
          </div>

          {step === 'code' ? (
            <>
              <div className="card-inner p-5 text-center mb-6">
                <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>ENTER GAME CODE</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Ask your host for the code</p>
              </div>

              <div className="mb-2">
                <input
                  className="quiz-input text-center text-2xl font-black tracking-widest uppercase"
                  placeholder="XK92A"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  onKeyDown={e => e.key === 'Enter' && handleCodeSubmit()}
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

              <button onClick={handleCodeSubmit} className="btn-yellow w-full py-4 text-lg mt-3">
                Continue →
              </button>
            </>
          ) : (
            <>
              {quizInfo ? (
                <div className="card-inner p-5 text-center mb-6">
                  <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>JOINING QUIZ</p>
                  <h2 className="text-xl font-black text-white">{quizInfo.name}</h2>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Code:</span>
                    <span className="font-black text-sm tracking-widest text-white">{code.toUpperCase()}</span>
                  </div>
                </div>
              ) : (
                <div className="card-inner p-5 text-center mb-6">
                  <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>JOINING QUIZ</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mt-1" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Code:</span>
                    <span className="font-black text-sm tracking-widest text-white">{code.toUpperCase()}</span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>NICKNAME</label>
                <input
                  className="quiz-input"
                  placeholder="e.g. QuizMaster3000"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  maxLength={20}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}

              <button onClick={handleJoin} disabled={loading} className="btn-yellow w-full py-4 text-lg mb-3">
                {loading ? 'Joining…' : 'Join Quiz →'}
              </button>

              <button onClick={() => { setStep('code'); setError(''); }} className="w-full text-sm py-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                ← Back
              </button>
            </>
          )}

          <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No account required</p>
        </div>
      </div>
    </div>
  );
}
