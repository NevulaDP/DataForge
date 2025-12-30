
import React, { useState } from 'react';
import { Monitor, Mail, Send, CheckCircle2, Loader2, Copy, AlertCircle, RefreshCw, Linkedin } from 'lucide-react';
import Logo from './Logo';
import { trackEvent, Analytics } from '../analytics';

const MAIL_BRIDGE_URL = 'https://dataforge-mail-bridge.nevobetesh.workers.dev'; 

const MobileLockout: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const isDark = theme === 'dark';

  const APP_URL = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APP_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackEvent('mobile_link_copied');
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus('sending');
    setErrorMessage('');
    
    trackEvent(Analytics.MOBILE_INTEREST_CAPTURED, {
      source: 'mobile_lockout_overlay',
      method: 'resend_api'
    });

    try {
      // Simplified payload for better deliverability
      const response = await fetch(MAIL_BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          url: APP_URL
        }),
      });

      const data = await response.json().catch(() => ({ error: 'Communication error' }));

      if (response.ok && !data.error) {
        setStatus('success');
      } else {
        const msg = data.error || 'Failed to send';
        setErrorMessage(msg.toLowerCase().includes('onboarding') 
          ? 'System is currently restricted. Please use the direct link below.' 
          : 'Delivery failed. Please try again or copy the direct link.');
        setStatus('error');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage('Service temporarily unavailable. Please use the direct link below.');
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

            <div className="space-y-4 text-left">
              {status === 'success' ? (
                <div className="py-2 space-y-5 animate-in fade-in slide-in-from-bottom-2 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-emerald-500">Welcome Sent</p>
                    <p className={`text-[11px] font-bold opacity-70 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Check your inbox (and <b>spam folder</b>) for your access link.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Let's connect while you wait</p>
                    <a 
                      href="https://www.linkedin.com/in/nevobetesh/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span className="text-[11px] font-bold">Nevo Betesh on LinkedIn</span>
                    </a>
                  </div>

                  <button 
                    onClick={() => { setStatus('idle'); setEmail(''); }} 
                    className="flex items-center justify-center mx-auto space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-500 transition-colors pt-2"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Try another email</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-slate-700 group-focus-within:text-blue-500' : 'text-slate-400'}`} />
                      <input 
                        type="email" 
                        required
                        placeholder="analyst@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full h-14 pl-12 pr-6 text-sm font-bold rounded-full border-2 outline-none transition-all ${
                          isDark 
                            ? 'bg-slate-950 border-slate-800 focus:border-blue-500 text-white placeholder:text-slate-800' 
                            : 'bg-white border-slate-100 focus:border-blue-600 shadow-sm placeholder:text-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                  
                  {errorMessage && (
                    <div className="text-[9px] font-bold text-rose-500 bg-rose-500/10 p-3 rounded-[20px] border border-rose-500/20 leading-tight uppercase">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={status === 'sending'}
                    className="w-full h-15 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
                  >
                    {status === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{status === 'sending' ? 'Dispatching...' : 'Email Me the Link'}</span>
                  </button>

                  <div className="flex items-center space-x-3 pt-1">
                    <div className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>Or</span>
                    <div className={`h-px flex-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                  </div>

                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className={`w-full h-15 py-4 rounded-full border-2 flex items-center justify-center space-x-3 transition-all active:scale-[0.98] ${
                      isDark 
                        ? 'bg-slate-800/40 border-slate-800 text-slate-500 hover:text-white' 
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    <span className="text-[11px] font-black uppercase tracking-widest">{copied ? 'Link Copied' : 'Copy Direct URL'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLockout;
