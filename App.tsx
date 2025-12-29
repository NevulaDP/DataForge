
import React, { useState, useEffect, useCallback } from 'react';
import { Industry, Scenario, NotebookBlock, ChatMessage, SessionState, Difficulty } from './types';
import Onboarding from './components/Onboarding';
import Workspace from './components/Workspace';
import Sidebar from './components/Sidebar';
import Mentor from './components/Mentor';
import MobileLockout from './components/MobileLockout';
import AboutModal from './components/AboutModal';
import ConfirmModal from './components/ConfirmModal';
import { generateScenario } from './geminiService';

const SESSION_KEY = 'data_forge_session_v2';

const App: React.FC = () => {
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<SessionState | null>(null);
  
  const [blocks, setBlocks] = useState<NotebookBlock[]>([
    { id: '1', type: 'text', content: '# Strategic Briefing\nWelcome. Use the dataset explorer to understand your target sources and document your logic below.' }
  ]);
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const state: SessionState = JSON.parse(saved);
        setIndustry(state.industry);
        setDifficulty(state.difficulty || null);
        setScenario(state.scenario);
        setBlocks(state.blocks);
        setMentorMessages(state.mentorMessages);
        if (state.theme) setTheme(state.theme);
      } catch (e) { localStorage.removeItem(SESSION_KEY); }
    }
  }, []);

  useEffect(() => {
    if (scenario) {
      const state: SessionState = { industry, difficulty, scenario, blocks, mentorMessages, theme };
      localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [industry, difficulty, scenario, blocks, mentorMessages, theme]);

  useEffect(() => {
    const root = window.document.body;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleReset = useCallback(() => {
    if (window.confirm("Terminate project? Progress will be erased.")) {
      setScenario(null);
      setIndustry(null);
      setDifficulty(null);
      setBlocks([{ id: '1', type: 'text', content: '# Strategic Briefing\nWelcome. Documentation and analysis core initialized.' }]);
      setMentorMessages([]);
      setLoading(false);
      setError(null);
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const handleImport = useCallback((state: SessionState) => {
    // Stage for confirmation
    setPendingImport(state);
  }, []);

  const finalizeImport = useCallback(() => {
    if (!pendingImport) return;
    const state = pendingImport;
    setIndustry(state.industry);
    setDifficulty(state.difficulty);
    setScenario(state.scenario);
    setBlocks(state.blocks);
    setMentorMessages(state.mentorMessages);
    if (state.theme) setTheme(state.theme);
    setPendingImport(null);
  }, [pendingImport]);

  const handleStart = async (selectedIndustry: Industry, selectedDifficulty: Difficulty) => {
    setIndustry(selectedIndustry);
    setDifficulty(selectedDifficulty);
    setLoading(true);
    setError(null);
    setProgress(5);
    setLoadingMessage("Preparing environment");

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + 2;
        if (prev < 60) {
           setLoadingMessage("Configuring dataset schema");
           return prev + 1;
        }
        if (prev < 85) {
           setLoadingMessage("Generating simulation data");
           return prev + 0.5;
        }
        setLoadingMessage("Finalizing setup");
        return prev;
      });
    }, 300);

    try {
      const newScenario = await generateScenario(selectedIndustry, selectedDifficulty);
      setProgress(100);
      setLoadingMessage("Ready");
      
      setTimeout(() => {
        setScenario(newScenario);
        setMentorMessages([{ role: 'assistant', content: `The ${newScenario.companyName} data environment is now live. I've logged our primary objectives in the Mission Hub. How would you like to approach this investigation?` }]);
        setLoading(false);
        clearInterval(progressTimer);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Initialization failed.");
      setIndustry(null);
      setScenario(null);
      setLoading(false);
      clearInterval(progressTimer);
    }
  };

  return (
    <>
      <MobileLockout theme={theme} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} theme={theme} />
      <ConfirmModal 
        isOpen={!!pendingImport} 
        onClose={() => setPendingImport(null)} 
        onConfirm={finalizeImport} 
        pendingState={pendingImport} 
        theme={theme} 
        isExistingSession={!!scenario}
      />
      {!scenario || loading ? (
        <Onboarding 
          onSelect={handleStart} 
          onImport={handleImport} 
          onAbout={() => setIsAboutOpen(true)}
          loading={loading} 
          loadingMessage={loadingMessage} 
          progress={progress}
          error={error} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      ) : (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
          <Sidebar 
            scenario={scenario} 
            onReset={handleReset} 
            onImport={handleImport} 
            onUpdateScenario={s => setScenario(s)}
            getCurrentState={() => ({ industry, difficulty, scenario, blocks, mentorMessages, theme })}
            theme={theme}
          />
          <div className="flex-1 relative overflow-hidden flex flex-col">
            <Workspace 
              scenario={scenario} 
              blocks={blocks} 
              setBlocks={setBlocks} 
              onUpdateScenario={s => setScenario(s)} 
              theme={theme} 
              toggleTheme={toggleTheme} 
              onAbout={() => setIsAboutOpen(true)}
              onReset={handleReset} 
            />
            <Mentor 
              scenario={scenario} 
              blocks={blocks} 
              messages={mentorMessages} 
              setMessages={setMentorMessages} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default App;
