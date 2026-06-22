import Link from 'next/link';
import ParticleBackground from '@/components/ParticleBackground';
import QuizifyLogo from '@/components/QuizifyLogo';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 flex flex-col items-center text-center px-6 anim-fade-in">
        {/* Logo icon large */}
        <div className="mb-6 anim-bounce-in" style={{ animationDelay: '0.1s' }}>
          <div style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, #f5c518 0%, #f07012 40%, #e040fb 100%)',
            borderRadius: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(245,197,24,0.35)',
          }}>
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z" fill="#1a0a2e" stroke="#1a0a2e" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="logo-gradient font-black text-7xl tracking-tight mb-4 anim-slide-up" style={{ animationDelay: '0.2s' }}>
          Quizify
        </h1>

        {/* Tagline */}
        <p className="text-base mb-10 anim-slide-up" style={{ color: 'rgba(255,255,255,0.5)', animationDelay: '0.3s' }}>
          Multiplayer pubquiz, direct vanaf je telefoon.
        </p>

        {/* CTA Button */}
        <Link href="/host/setup" className="anim-slide-up" style={{ animationDelay: '0.4s' }}>
          <button
            className="btn-yellow text-xl px-16 py-5 flex items-center gap-3"
            style={{ borderRadius: 16, fontSize: '1.15rem', letterSpacing: '-0.01em' }}
          >
            <span style={{ fontSize: '1.2rem' }}>+</span>
            <span>Create Quiz</span>
          </button>
        </Link>

        {/* Join link */}
        <div className="mt-6 anim-slide-up" style={{ animationDelay: '0.5s' }}>
          <Link href="/join" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', textDecoration: 'none' }}>
            Have a code? <span style={{ color: '#f5c518', textDecoration: 'underline' }}>Join a quiz</span>
          </Link>
        </div>

        
      </div>
    </div>
  );
}
