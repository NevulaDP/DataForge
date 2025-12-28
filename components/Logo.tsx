
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
      {/* Background Glow - Ensuring constant visibility */}
      <div className={`absolute inset-0 rounded-2xl blur-xl transition-all duration-700 ${
        isDark ? 'bg-blue-600/30' : 'bg-blue-400/15'
      } group-hover:scale-110`} />
      
      {/* The Brand Container */}
      <div className={`relative z-10 flex items-center justify-center rounded-2xl border transition-all duration-500 overflow-hidden ${sizeClasses[size]} ${
        isDark 
          ? 'bg-slate-950 border-slate-800 shadow-[0_0_30px_rgba(37,99,235,0.15)]' 
          : 'bg-white border-slate-200 shadow-[0_10px_30px_rgba(37,99,235,0.08)]'
      }`}>
        {/* Interior Shimmer Effect */}
        <div className={`absolute inset-0 bg-gradient-to-tr via-transparent to-white/5 opacity-40 ${
          isDark ? 'from-blue-600/10' : 'from-blue-600/5'
        }`} />
        
        <svg 
          width="70%" 
          height="70%" 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-20 transition-transform duration-500 ease-out group-hover:scale-110"
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

          {/* Hexagonal Tech Frame - Using solid fallback if gradient fails, but uniqueId fixes it */}
          <path 
            d="M24 4L40.4545 13.5V34.5L24 44L7.54545 34.5V13.5L24 4Z" 
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5" 
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
            x="23" 
            y="10" 
            width="2" 
            height="10" 
            rx="1" 
            fill={isDark ? "white" : "#1E293B"} 
            style={{ filter: isDark ? `url(#${filterId})` : 'none' }}
          />

          {/* Floating Data Nodes */}
          <rect x="18" y="14" width="2" height="2" fill={isDark ? "#93C5FD" : "#2563EB"} className="animate-pulse" />
          <rect x="28" y="12" width="2" height="2" fill={isDark ? "#93C5FD" : "#2563EB"} className="animate-pulse" style={{ animationDelay: '1s' }} />
        </svg>
      </div>

      {/* Outer Floating Hexagonal Orbit */}
      <div className={`absolute inset-[-6px] border rounded-3xl animate-[spin_30s_linear_infinite] pointer-events-none transition-colors duration-500 ${
        isDark ? 'border-blue-500/10' : 'border-blue-500/5'
      }`} />
    </div>
  );
};

export default Logo;
