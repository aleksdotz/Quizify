const STEPS = ['JOIN', 'LOBBY', 'QUESTION', 'SUBMITTED', 'RESULTS'];

interface Props { current: number; }

export default function StepIndicator({ current }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 mb-6">
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div key={i} className={`step-bar w-10 ${i <= current ? 'active' : ''}`} />
        ))}
      </div>
      <span className="text-xs font-semibold tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {STEPS[current]}
      </span>
    </div>
  );
}
