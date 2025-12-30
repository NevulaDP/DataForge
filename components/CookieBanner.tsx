
import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ExternalLink } from 'lucide-react';
import { setConsent } from '../analytics';

interface CookieBannerProps {
  theme: 'light' | 'dark';
}

const CookieBanner: React.FC<CookieBannerProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const preference = localStorage.getItem('data_forge_consent_v1');
    if (!preference) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsent('granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    setConsent('denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed bottom-6 right-6 z-[1000] w-[calc(100%-48px)] sm:w-80 animate-in fade-in slide-in-from-right-8 duration-500">
      <div className={`p-5 rounded-[32px] border shadow-2xl backdrop-blur-md ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">Privacy Protocol</span>
            </div>
            <button 
              onClick={handleDecline}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors opacity-40 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <p className={`text-[11px] font-semibold leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            We utilize <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>1st party cookies</span> for anonymous telemetry to refine our forging algorithms. No personal identifiers are stored.
          </p>

          <div className="flex flex-col space-y-3 pt-1">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleAccept}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/10"
              >
                Accept
              </button>
              <button 
                onClick={handleDecline}
                className={`flex-1 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border ${
                  isDark 
                    ? 'border-slate-800 text-slate-500 hover:text-white' 
                    : 'border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
              >
                Decline
              </button>
            </div>
            
            <div className="flex justify-center">
              <a 
                href="https://support.google.com/analytics/answer/12159330" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center space-x-1.5 text-[8px] font-black uppercase tracking-widest transition-colors ${
                  isDark ? 'text-slate-600 hover:text-blue-400' : 'text-slate-400 hover:text-blue-600'
                }`}
              >
                <span>Full Policy</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
