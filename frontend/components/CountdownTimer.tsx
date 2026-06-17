'use client';
import { useEffect, useState } from 'react';

interface Props {
  timeLimit: number;
  onExpire?: () => void;
  compact?: boolean;
}

export default function CountdownTimer({ timeLimit, onExpire, compact = false }: Props) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    setTimeLeft(timeLimit);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit]);

  const pct = Math.max(0, (timeLeft / timeLimit) * 100);
  const urgent = timeLeft <= 10;

  if (compact) {
    return (
      <span className={`font-black text-3xl tabular-nums ${urgent ? 'text-red-400' : 'text-white'}`} style={{ minWidth: 48, textAlign: 'right' }}>
        {timeLeft}s
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`font-black text-3xl tabular-nums ${urgent ? 'text-red-400' : 'text-green-400'}`} style={{ minWidth: 52 }}>
        {timeLeft}s
      </span>
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 9999, height: 6, overflow: 'hidden', minWidth: 80 }}>
        <div className={`timer-bar ${urgent ? 'urgent' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
