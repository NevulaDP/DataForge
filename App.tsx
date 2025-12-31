
import React, { useState, useEffect, useCallback } from 'react';
import { Industry, Scenario, NotebookBlock, ChatMessage, SessionState, Difficulty } from './types';
import Onboarding from './components/Onboarding';
import Workspace from './components/Workspace';
import Sidebar from './components/Sidebar';
import Mentor from './components/Mentor';
import MobileLockout from './components/MobileLockout';
import AboutModal from './components/AboutModal';
import ConfirmModal from './components/ConfirmModal';
import CookieBanner from './components/CookieBanner';
import { generateScenario } from './geminiService';
import { initEngines } from './codeExecutionService';
import { trackEvent, Analytics } from './analytics';

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
        handleImport(state);
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

  const handleOpenAbout = useCallback(() => {
    setIsAboutOpen(true);
    trackEvent(Analytics.ABOUT_VIEWED, {
      context: scenario ? 'active_session' : 'onboarding'
    });
  }, [scenario]);

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
    setPendingImport(state);
  }, []);

  const finalizeImport = useCallback(async () => {
    if (!pendingImport) return;
    const state = pendingImport;
    
    setLoading(true);
    setProgress(15);
    setLoadingMessage("Checking environment");
    setError(null); 
    setPendingImport(null);

    try {
      setLoadingMessage("Synchronizing datasets");
      setProgress(40);

      // Fault tolerant boot
      await initEngines(state.scenario!);
      
      setIndustry(state.industry);
      setDifficulty(state.difficulty);
      setScenario(state.scenario);
      setBlocks(state.blocks);
      setMentorMessages(state.mentorMessages);
      if (state.theme) setTheme(state.theme);
      
      setProgress(100);
      setLoadingMessage("Workspace Restored");
      
      setTimeout(() => {
        setLoading(false);
        trackEvent(Analytics.SESSION_RESUMED, {
          method: 'file_import'
        });
      }, 500);
    } catch (err: any) {
      console.error("App: finalizeImport error:", err);
      setError(`Workspace failed to boot: ${err.message || 'Unknown Error'}`);
      setLoading(false);
    }
  }, [pendingImport]);

  const handleStart = async (selectedIndustry: Industry, selectedDifficulty: Difficulty) => {
    setIndustry(selectedIndustry);
    setDifficulty(selectedDifficulty);
    setLoading(true);
    setError(null);
    setProgress(5);
    setLoadingMessage("Preparing environment");

    trackEvent(Analytics.MISSION_STARTED, {
      industry: selectedIndustry,
      difficulty: selectedDifficulty
    });

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 40) return prev + 3;
        if (prev < 70) {
           setLoadingMessage("Configuring dataset schema");
           return prev + 1;
        }
        if (prev < 90) {
           setLoadingMessage("Generating simulation data");
           return prev + 0.5;
        }
        return prev;
      });
    }, 200);

    try {
      const newScenario = await generateScenario(selectedIndustry, selectedDifficulty);
      
      setLoadingMessage("Allocating memory for SQL core");
      setProgress(95);
      
      // SQL is the mandatory part for entry. Python will handle itself in background.
      await initEngines(newScenario);
      
      setProgress(100);
      setLoadingMessage("Forge Initialized");
      
      setTimeout(() => {
        setScenario(newScenario);
        
        const introMessage = `### 🎯 MISSION BRIEFING: ${newScenario.companyName}

Welcome to the team. We have a critical situation: **${newScenario.problemStatement}**

I have initialized your workspace with the relevant production datasets. You can find our specific strategic goals in the **Mission Hub** on the sidebar.

**Your first priority:**
${newScenario.objectives[0].task}

I recommend starting with the **Dataset Explorer** to understand the schema, then creating your first SQL or Python block to verify the data quality. How do you want to proceed?`;
        
        setMentorMessages([{ role: 'assistant', content: introMessage }]);
        setLoading(false);
        clearInterval(progressTimer);
      }, 800);
    } catch (err: any) {
      console.error("App: handleStart error:", err);
      setError(`Environment failure: ${err.message || 'Check connection.'}`);
      setIndustry(null);
      setScenario(null);
      setLoading(false);
      clearInterval(progressTimer);
    }
  };

  return (
    <>
      <MobileLockout theme={theme} />
      <CookieBanner theme={theme} />
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
          onAbout={handleOpenAbout}
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
              onAbout={handleOpenAbout}
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
