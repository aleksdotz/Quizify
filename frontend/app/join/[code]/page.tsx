'use client';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import QuizifyLogo from '@/components/QuizifyLogo';
import StepIndicator from '@/components/StepIndicator';
import { getSocket } from '@/lib/socket';

export default function JoinWithCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    const trimmedNickname = nickname.trim();
    if (!trimmedNickname || trimmedNickname.length < 2) {
      setError('Nickname must be at least 2 characters.');
      return;
    }
    setError('');
    setLoading(true);

    const socket = getSocket();
    socket.emit('player:join', { code: code.toUpperCase(), nickname: trimmedNickname }, (res: {
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
        router.push('/play');
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
          <div className="flex justify-center mb-6">
            <QuizifyLogo size="md" />
          </div>

          <div className="card-inner p-5 text-center mb-6">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>JOINING QUIZ</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Code:</span>
              <span className="font-black text-sm tracking-widest text-white">{code.toUpperCase()}</span>
            </div>
          </div>

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

          <p className="text-center text-xs mt-4" style={{ color: 'rgba(255,255,255,0.25)' }}>No account required</p>
        </div>
      </div>
    </div>
  );
}
