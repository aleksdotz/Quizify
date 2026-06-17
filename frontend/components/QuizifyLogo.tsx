interface Props { size?: 'sm' | 'md' | 'lg'; }

export default function QuizifyLogo({ size = 'md' }: Props) {
  const iconSizes = { sm: 32, md: 44, lg: 72 };
  const textSizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-6xl' };
  const iconSize = iconSizes[size];

  return (
    <div className="flex items-center gap-3">
      <div
        style={{
          width: iconSize,
          height: iconSize,
          background: 'linear-gradient(135deg, #f5c518 0%, #f07012 40%, #e040fb 100%)',
          borderRadius: size === 'lg' ? 20 : 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width={iconSize * 0.55} height={iconSize * 0.55} viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2L4.5 13.5H11.5L11 22L19.5 10.5H12.5L13 2Z"
            fill="#1a0a2e"
            stroke="#1a0a2e"
            strokeWidth="0.5"
          />
        </svg>
      </div>
      {size !== 'sm' && (
        <span className={`logo-gradient font-black ${textSizes[size]} tracking-tight`}>
          Quizify
        </span>
      )}
    </div>
  );
}
