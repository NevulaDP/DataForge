
import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', theme = 'dark' }) => {
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `forgeGradient-${uniqueId}`;
  const filterId = `forgeGlow-${uniqueId}`;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-24 h-24'
  };

  const isDark = theme === 'dark';

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} group select-none`}>
      <style>{`
        @keyframes dash-crawl {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 24; }
        }
        .animate-dash-crawl {
          animation: dash-crawl 4s linear infinite;
        }
      `}</style>
      
      {/* Dynamic Gradient Glow - High intensity depth */}
      <div className={`absolute inset-[-10px] rounded-full blur-[30px] transition-all duration-700 ease-in-out group-hover:blur-[40px] ${
        isDark 
          ? 'bg-gradient-to-tr from-blue-600/50 via-indigo-500/30 to-transparent opacity-70 group-hover:opacity-100' 
          : 'bg-gradient-to-tr from-blue-400/30 via-blue-200/20 to-transparent opacity-50 group-hover:opacity-70'
      }`} />

      {/* Pulsing Core Glow */}
      <div className={`absolute w-3/4 h-3/4 rounded-full blur-xl animate-pulse transition-colors duration-500 ${
        isDark ? 'bg-blue-500/25' : 'bg-blue-400/15'
      }`} />

      {/* Container */}
      <div className={`relative z-10 flex items-center justify-center transition-all duration-500 ${sizeClasses[size]}`}>
        <svg 
          width="80%" 
          height="80%" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-20 transition-transform duration-500 ease-out group-hover:scale-105"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor={isDark ? "#60A5FA" : "#3B82F6"} />
              <stop offset="1" stopColor={isDark ? "#3B82F6" : "#2563EB"} />
            </linearGradient>
            <filter id={filterId}>
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Tech Frame */}
          <path 
            d="M24 4L40.4545 13.5V34.5L24 44L7.54545 34.5V13.5L24 4Z" 
            stroke={`url(#${gradientId})`}
            strokeWidth="3" 
            strokeLinejoin="round" 
            className="opacity-100"
          />

          {/* The Anvil (Base) */}
          <path 
            d="M12 32H36L33 36H15L12 32Z" 
            fill={`url(#${gradientId})`}
          />
          <path 
            d="M15 22H33L36 26V28L12 28V26L15 22Z" 
            fill={`url(#${gradientId})`}
          />

          {/* Data Strike Line */}
          <rect 
            x="23" y="10" 
            width="2" height="10" 
            rx="1" 
            fill={isDark ? "white" : "#1E293B"} 
            style={{ filter: isDark ? `url(#${filterId})` : 'none' }}
          />
        </svg>
      </div>

      {/* Outer Dashed Frame - Static "Bloat Square" with Moving Dashes */}
      <div className="absolute inset-[-6px] pointer-events-none">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect 
            x="2" y="2" 
            width="96" height="96" 
            rx="28" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeDasharray="10,10"
            className={`animate-dash-crawl transition-colors duration-500 ${
              isDark ? 'text-blue-500/30' : 'text-blue-500/20'
            }`}
          />
        </svg>
      </div>
    </div>
  );
};

export default Logo;
