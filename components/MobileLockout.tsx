
import React, { useState } from 'react';
import { Monitor, CheckCircle2, Share2, Linkedin } from 'lucide-react';
import Logo from './Logo';
import { trackEvent } from '../analytics';

const MobileLockout: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const APP_URL = window.location.origin;

  const handleCopyFallback = () => {
    navigator.clipboard.writeText(APP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent('mobile_link_copied');
  };

  const handleSaveAction = async () => {
    const shareData = {
      title: 'DataForge',
      text: 'Master the end-to-end analytical workflow with DataForge.',
      url: APP_URL,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackEvent('mobile_link_shared');
      } catch (err) {
        // If user cancels or share fails, fallback to copy if it wasn't an abort
        if ((err as Error).name !== 'AbortError') {
          handleCopyFallback();
        }
      }
    } else {
      handleCopyFallback();
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 lg:hidden font-['Plus_Jakarta_Sans'] transition-colors duration-500 ${
      isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Subtle Background Mesh */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-5' : 'opacity-10'}`} 
           style={{ backgroundImage: `radial-gradient(${isDark ? '#334155' : '#94a3b8'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      
      <div className="relative z-10 max-w-[340px] w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="flex flex-col items-center space-y-3 mb-2">
          <Logo size="sm" theme={theme} />
          <h1 className={`text-[12px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white' : 'text-slate-900'}`}>DATAFORGE</h1>
        </div>

        <div className={`border rounded-[40px] p-6 sm:p-8 backdrop-blur-3xl shadow-2xl relative overflow-hidden transition-all duration-500 ${
          isDark ? 'bg-slate-900/70 border-slate-800/50' : 'bg-white/95 border-slate-200'
        }`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 opacity-30" />
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center mb-3">
                <div className={`p-3 rounded-full ${isDark ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
                  <Monitor className="w-7 h-7" />
                </div>
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                Desktop <span className="text-blue-600">Required</span>
              </h2>
              <p className={`text-[12px] font-semibold leading-relaxed px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                To run high-performance SQL and Python engines, DataForge requires a desktop-class browser.
              </p>
            </div>

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Access via Desktop</p>
                <button 
                  onClick={handleSaveAction}
                  className={`w-full h-15 py-4 rounded-full border-2 flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-lg ${
                    isDark 
                      ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500' 
                      : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50 shadow-blue-600/10'
                  }`}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span className="text-[11px] font-black uppercase tracking-widest">{copied ? 'Link Copied' : 'Save for Later'}</span>
                </button>
              </div>

              <div className={`pt-6 border-t flex flex-col items-center space-y-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Questions?</p>
                <a 
                  href="https://www.linkedin.com/in/nevobetesh/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Connect on LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLockout;
