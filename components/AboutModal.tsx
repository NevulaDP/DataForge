
import React, { useState } from 'react';
import { X, Linkedin, Mail, GraduationCap, Database, BrainCircuit, Terminal, Sparkles, ShieldCheck, Github } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, theme }) => {
  const [imageError, setImageError] = useState(false);
  
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-12">
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      <div className={`relative w-full max-w-2xl bg-white dark:bg-[#0c1222] border-2 border-slate-200 dark:border-slate-800 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500`}>
        
        {/* Decorative Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 bg-blue-600/10 blur-[100px] pointer-events-none" />

        {/* Header Section */}
        <div className="p-10 pb-0 flex justify-between items-start relative z-10">
          <div className="flex items-center space-x-8">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
              
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {!imageError ? (
                  <img 
                    src="https://media.licdn.com/dms/image/v2/D4D03AQGla1pHxhmTVw/profile-displayphoto-scale_200_200/B4DZr597hIIAAY-/0/1765130354866?e=2147483647&v=beta&t=dleKih7ELvwjzHdf9srfL4LWZ7xLxmM3AMnzeYzfJ3Q" 
                    alt="Nevo Betesh"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-[#0a66c2] flex items-center justify-center">
                    <span className="text-3xl font-black text-white">NB</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Nevo Betesh</h2>
                <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[8px] font-black uppercase text-blue-500 tracking-widest">Open to New Roles</div>
              </div>
              <p className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-1.5 mb-4`}>Data Analyst & Industrial Engineer</p>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center px-3 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-100 text-slate-700'
                }`}>
                  <GraduationCap className="w-3.5 h-3.5 mr-2 text-blue-500" />
                  <span>Industrial Engineer</span>
                </div>
                <div className={`flex items-center px-3 py-1.5 rounded-full border-2 text-[9px] font-black uppercase tracking-widest transition-colors ${
                  isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-300 bg-slate-100 text-slate-700'
                }`}>
                  <ShieldCheck className="w-3.5 h-3.5 mr-2 text-blue-500" />
                  <span>Unit 8200 Alumnus</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-10 relative z-10">
          {/* Bio Section - Maintaining Established Narrative */}
          <div className="space-y-4">
            <div className={`text-[15px] leading-relaxed font-medium text-justify ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <p className="mb-4">
                I am a B.Sc. graduate in <strong className={isDark ? 'text-white' : 'text-slate-900'}>Industrial Engineering and Management</strong>, specializing in Information Systems. My analytical foundation was built in <strong className="text-emerald-500">Unit 8200</strong>, where I served as an intelligence analyst and later led a mission-critical team to deliver actionable insights in high-stakes environments.
              </p>
              <p>
                During my academic journey, I consistently applied <strong className="text-blue-500">out-of-the-box thinking</strong> to move past theoretical constraints. This mindset led me to develop unconventional projects like <strong className="text-slate-900 dark:text-white">Property Matcher</strong> (a vector-based search engine) and this simulator, DataForge. I am now seeking my first role as a <strong className="text-blue-500">Data Analyst</strong>, eager to apply this fusion of technical precision and creative engineering to solve real-world business challenges.
              </p>
            </div>
          </div>

          {/* Optimized Skills Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-6 rounded-[32px] border transition-all hover:border-blue-500/30 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <Database className="w-4 h-4 text-blue-500" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Data Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Python', 'SQL', 'R', 'ETL', 'SAP ERP', 'Pandas'].map(skill => (
                  <span key={skill} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                    isDark ? 'border-slate-800 bg-slate-900/60 text-slate-500' : 'border-slate-300 bg-slate-100 text-slate-700 shadow-sm'
                  }`}>{skill}</span>
                ))}
              </div>
            </div>
            
            <div className={`p-6 rounded-[32px] border transition-all hover:border-emerald-500/30 ${isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <BrainCircuit className="w-4 h-4 text-emerald-500" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Analysis & BI</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Looker', 'Tableau', 'PowerBI', 'LLM', 'Modeling', 'Excel'].map(skill => (
                  <span key={skill} className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                    isDark ? 'border-slate-800 bg-slate-900/60 text-slate-500' : 'border-slate-300 bg-slate-100 text-slate-700 shadow-sm'
                  }`}>{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Connect Section - Clean and Professional */}
          <div className={`flex items-center justify-between p-8 rounded-[40px] transition-all ${isDark ? 'bg-slate-900/60 border border-slate-800' : 'bg-blue-50 border border-blue-100'}`}>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Let's talk data</h4>
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Open to new career opportunities</p>
            </div>
            <div className="flex items-center space-x-3">
              <a 
                href="https://www.linkedin.com/in/nevobetesh/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-8 py-3.5 bg-[#0a66c2] hover:bg-[#084e96] text-white rounded-full transition-all active:scale-95 shadow-xl shadow-blue-900/10 group/link border-2 border-transparent"
              >
                <Linkedin className="w-4 h-4 fill-white group-hover/link:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Connect</span>
              </a>
              <a 
                href="https://github.com/NevulaDP" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`p-3.5 rounded-full border transition-all active:scale-95 ${isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white shadow-lg' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-md'}`}
                title="View GitHub (Property Matcher & more)"
              >
                <Github className="w-6 h-6" />
              </a>
              <a 
                href="mailto:nevobetesh@gmail.com"
                className={`p-3.5 rounded-full border transition-all active:scale-95 ${isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white shadow-lg' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-600 shadow-md'}`}
                title="Email Nevo"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
