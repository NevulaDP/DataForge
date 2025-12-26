
import React from 'react';
import { Activity } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', theme = 'dark' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} group`}>
      {/* Outer Glow / Pulse */}
      <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg group-hover:bg-blue-500/30 transition-all animate-pulse" />
      
      {/* Main Container */}
      <div className={`relative z-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-xl ${sizeClasses[size]}`}>
        <div className="relative">
          <Activity className={`${iconSizes[size]} text-white stroke-[3]`} />
          
          {/* Decorative "Vector" Elements */}
          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-sky-300 rounded-full animate-ping" />
        </div>
      </div>
      
      {/* Background Decorative Rings */}
      <div className="absolute -inset-1 border border-blue-500/10 rounded-2xl animate-[spin_10s_linear_infinite]" />
    </div>
  );
};

export default Logo;
