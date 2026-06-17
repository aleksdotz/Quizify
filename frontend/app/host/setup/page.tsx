'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ParticleBackground from '@/components/ParticleBackground';
import { QuizDuration, GameMode, CATEGORIES, DURATION_LABELS } from '@/lib/types';
import { getSocket } from '@/lib/socket';

export default function HostSetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState<QuizDuration>('medium');
  const [categories, setCategories] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleStart = () => {
    if (!name.trim()) { setError('Please enter a quiz name.'); return; }
    setError('');
    setLoading(true);

    const socket = getSocket();
    const settings = { name: name.trim(), duration, categories, gameMode };

    socket.emit('host:create', settings, (res: { ok: boolean; code?: string; error?: string }) => {
      if (res.ok && res.code) {
        sessionStorage.setItem('quizify_host', JSON.stringify({ quizName: name.trim(), settings }));
        router.push(`/host/game/${res.code}`);
      } else {
        setError(res.error || 'Failed to create quiz. Is the server running?');
        setLoading(false);
      }
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-xl anim-slide-up">
        <h1 className="text-3xl font-black text-white text-center mb-8 tracking-tight">
          Set up your quiz
        </h1>

        <div className="card p-6 flex flex-col gap-6">
          {/* Quiz Name */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              QUIZ NAME
            </label>
            <input
              className="quiz-input"
              placeholder="Friday Night Pub Quiz"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              QUIZ DURATION
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['short', 'medium', 'long'] as QuizDuration[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className="p-4 rounded-xl text-left transition-all border-2"
                  style={{
                    background: duration === d ? '#f5c518' : 'var(--card-inner)',
                    borderColor: duration === d ? '#f5c518' : 'rgba(255,255,255,0.08)',
                    color: duration === d ? '#000' : 'white',
                    transform: duration === d ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div className="font-bold text-base">{DURATION_LABELS[d].label}</div>
                  <div className="text-sm mt-0.5" style={{ opacity: 0.7 }}>{DURATION_LABELS[d].questions}</div>
                  <div className="text-xs mt-0.5" style={{ opacity: 0.5 }}>{DURATION_LABELS[d].time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              CATEGORIES <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400, textTransform: 'none', fontSize: '0.7rem' }}>(select one or more)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => {
                const selected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="py-2.5 px-3 rounded-xl text-sm font-medium transition-all border-2"
                    style={{
                      background: selected ? 'rgba(224,64,251,0.15)' : 'var(--card-inner)',
                      borderColor: selected ? '#e040fb' : 'rgba(255,255,255,0.08)',
                      color: selected ? '#e040fb' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Game Mode */}
          <div>
            <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              GAME MODE
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['solo', 'teams'] as GameMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setGameMode(mode)}
                  className="py-4 rounded-xl font-bold capitalize transition-all border-2"
                  style={{
                    background: gameMode === mode ? '#f5c518' : 'var(--card-inner)',
                    borderColor: gameMode === mode ? '#f5c518' : 'rgba(255,255,255,0.08)',
                    color: gameMode === mode ? '#000' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-4 rounded-xl font-semibold border-2 transition-all"
              style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}
            >
              ← Back
            </button>
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-yellow flex-[2.5] py-4 text-lg"
            >
              {loading ? 'Creating…' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
