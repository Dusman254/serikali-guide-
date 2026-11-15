import React from 'react';

interface SerikaliLogoMarkProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'inverted';
}

export const SerikaliLogoMark: React.FC<SerikaliLogoMarkProps> = ({
  className = '',
  size = 40,
  variant = 'default',
}) => {
  const bg = variant === 'inverted' ? '#F4F3EF' : '#141413';
  const pillar = variant === 'inverted' ? '#141413' : '#F4F3EF';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Architectural Obsidian Stamp Frame */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill={bg} />
      <rect
        x="4"
        y="4"
        width="56"
        height="56"
        rx="12"
        stroke="#D94E34"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Kenya Emerald Civic Foundation Band */}
      <rect x="12" y="47" width="40" height="5" rx="2.5" fill="#1F6F43" />

      {/* Crimson Beacon Sun Above Gate */}
      <circle cx="32" cy="18" r="6" fill="#D94E34" />

      {/* Twin Civic Arch Pillars */}
      <path
        d="M15 44V30C15 20.6112 22.6112 13 32 13C41.3888 13 49 20.6112 49 30V44H41.5V30C41.5 24.7533 37.2467 20.5 32 20.5C26.7533 20.5 22.5 24.7533 22.5 30V44H15Z"
        fill={pillar}
      />

      {/* Central Compass Keystone / Passage */}
      <path d="M32 26L36.5 35.5H27.5L32 26Z" fill="#D94E34" />
      <rect x="29" y="38" width="6" height="6" rx="1" fill={pillar} />
    </svg>
  );
};

interface SerikaliBrandProps {
  onClick?: () => void;
  variant?: 'default' | 'inverted';
  compact?: boolean;
  subtitle?: string;
  className?: string;
}

export const SerikaliBrand: React.FC<SerikaliBrandProps> = ({
  onClick,
  variant = 'default',
  compact = false,
  subtitle = 'Civic Protocol & Guide',
  className = '',
}) => {
  const titleColor = variant === 'inverted' ? 'text-[#F4F3EF]' : 'text-[#141413]';
  const subColor = variant === 'inverted' ? 'text-[#F4F3EF]/60' : 'text-[#141413]/55';

  const content = (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <SerikaliLogoMark
        size={compact ? 34 : 40}
        variant={variant}
        className="shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span className="flex flex-col text-left leading-none">
        <span
          className={`font-serif tracking-tight ${
            compact ? 'text-[17px]' : 'text-[20px]'
          } font-bold ${titleColor}`}
        >
          Serikali <span className="text-[#D94E34]">Guide</span>
        </span>
        {subtitle && (
          <span
            className={`font-mono text-[8.5px] uppercase tracking-[0.22em] mt-1 ${subColor}`}
          >
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group inline-flex items-center focus:outline-none"
        aria-label="Serikali Guide Home"
      >
        {content}
      </button>
    );
  }

  return <div className="group inline-flex items-center">{content}</div>;
};
