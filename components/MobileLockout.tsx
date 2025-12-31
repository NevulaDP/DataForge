
import React, { useState, useEffect } from 'react';
import { 
  Monitor, CheckCircle2, Share2, Linkedin, Sparkles, 
  Code2, ArrowUpRight, Target, GraduationCap, 
  Terminal
} from 'lucide-react';
import Logo from './Logo';
import { trackEvent } from '../analytics';

const MobileLockout: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (!isMobile) return null;

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
        if ((err as Error).name !== 'AbortError') {
          handleCopyFallback();
        }
      }
    } else {
      handleCopyFallback();
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col font-['Plus_Jakarta_Sans'] transition-colors duration-500 overflow-y-auto ${
      isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'
    } lg:hidden`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] blur-[120px] opacity-20 ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`} />
        <div className={`absolute inset-0 transition-opacity duration-500 ${isDark ? 'opacity-5' : 'opacity-10'}`} 
             style={{ backgroundImage: `radial-gradient(${isDark ? '#334155' : '#94a3b8'} 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />
      </div>
      
      <div className="relative z-10 w-full max-w-[420px] mx-auto px-6 py-12 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/20 blur-2xl rounded-full" />
              <Logo size="lg" theme={theme} />
            </div>
            <h1 className={`text-[12px] font-black uppercase tracking-[0.8em] ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>DATAFORGE</h1>
          </div>
        </header>

        {/* Status Notification */}
        <section className={`p-8 rounded-[40px] border-2 flex flex-col items-center text-center space-y-4 ${
          isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
        }`}>
          <div className={`p-4 rounded-full ${isDark ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-50 text-blue-600'}`}>
            <Monitor className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Desktop <span className="text-blue-600">Required</span>
            </h2>
            <p className={`text-[12px] font-semibold leading-relaxed px-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              DataForge runs a full WASM analytical stack (Python & SQL) that requires desktop-class processing power.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="space-y-6">
          <div className="flex items-center space-x-2 px-1">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Features</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* AI Scenario Forger */}
            <div className={`group relative p-6 rounded-[36px] border-2 overflow-hidden transition-all ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Target className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Scenario Forger</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Context-Aware Datasets</p>
                </div>
              </div>
            </div>

            {/* Socratic Mentor */}
            <div className={`group relative p-6 rounded-[36px] border-2 overflow-hidden transition-all ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Socratic Mentor</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Strategic AI Guidance</p>
                </div>
              </div>
            </div>

            {/* Notebook Environment */}
            <div className={`group relative p-6 rounded-[36px] border-2 overflow-hidden transition-all ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Code2 className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">Hybrid Notebook</h3>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unified SQL & Python</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action (Desktop Bridge) */}
        <section className={`relative p-8 rounded-[48px] border-2 overflow-hidden group/cta transition-all duration-500 ${
          isDark 
            ? 'bg-blue-600 border-blue-500 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.4)]' 
            : 'bg-blue-600 border-blue-700 shadow-[0_20px_50px_-10px_rgba(37,99,235,0.3)]'
        }`}>
          {/* Visual Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-white/20 blur-[60px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-blue-400/30 blur-[50px] rounded-full" />
          
          <div className="relative z-10 space-y-6 text-center">
            <div className="space-y-2">
              <div className="flex justify-center mb-3">
                <div className="bg-white/10 p-3 rounded-full backdrop-blur-md">
                   <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200">Bridge to Desktop</p>
              <h2 className="text-2xl font-black text-white leading-tight">Ready to Analyze?</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-blue-100/70 px-4">
                Open DataForge on your computer to start your project.
              </p>
            </div>
            
            <button 
              onClick={handleSaveAction}
              className={`w-full h-16 rounded-full flex items-center justify-center space-x-4 transition-all active:scale-[0.96] shadow-2xl relative overflow-hidden group/btn ${
                isDark ? 'bg-white text-blue-600' : 'bg-white text-blue-600'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-50 transition-opacity group-hover/btn:opacity-100" />
              <div className="relative flex items-center space-x-3">
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                <span className="text-[12px] font-black uppercase tracking-[0.2em]">{copied ? 'Link Copied' : 'Save for Later'}</span>
              </div>
            </button>
          </div>
        </section>

        {/* Social Footer */}
        <footer className={`pt-6 border-t flex flex-col items-center space-y-6 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="space-y-3 flex flex-col items-center">
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Questions?</p>
            <a 
              href="https://www.linkedin.com/in/nevobetesh/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors px-6 py-2 rounded-full border border-blue-600/20 bg-blue-600/5"
            >
              <Linkedin className="w-4 h-4" />
              <span className="text-[11px] font-bold">Connect on LinkedIn</span>
            </a>
          </div>
          
          <p className={`text-[8px] font-black uppercase tracking-[0.6em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            DataForge 2025
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MobileLockout;
