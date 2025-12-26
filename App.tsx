
import React, { useState, useEffect, useCallback } from 'react';
import { Industry, Scenario, NotebookBlock, ChatMessage, SessionState } from './types';
import Onboarding from './components/Onboarding';
import Workspace from './components/Workspace';
import Sidebar from './components/Sidebar';
import Mentor from './components/Mentor';
import { generateScenario } from './geminiService';

const SESSION_KEY = 'data_forge_session_v1';

const App: React.FC = () => {
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });
  const [blocks, setBlocks] = useState<NotebookBlock[]>([
    { id: '1', type: 'text', content: '# Mission Briefing\nWelcome, Analyst. Review the organizational context in the sidebar and begin your exploration below.' }
  ]);
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const state: SessionState = JSON.parse(saved);
        setIndustry(state.industry);
        setScenario(state.scenario);
        setBlocks(state.blocks);
        setMentorMessages(state.mentorMessages);
        if (state.theme) setTheme(state.theme);
      } catch (e) {
        console.error("Failed to restore session", e);
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (scenario) {
      const state: SessionState = {
        industry,
        scenario,
        blocks,
        mentorMessages,
        theme
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [industry, scenario, blocks, mentorMessages, theme]);

  useEffect(() => {
    const root = window.document.body;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleReset = useCallback(() => {
    const confirmed = window.confirm("Terminate current mission? All progress will be cleared.");
    if (confirmed) {
      // Synchronized wipe to ensure Onboarding component mounts correctly
      setScenario(null);
      setIndustry(null);
      setBlocks([{ id: '1', type: 'text', content: '# Mission Briefing\nWelcome, Analyst. Review the organizational context in the sidebar and begin your exploration below.' }]);
      setMentorMessages([]);
      setLoading(false);
      setError(null);
      localStorage.removeItem(SESSION_KEY);
      window.scrollTo(0, 0);
    }
  }, []);

  const handleImport = useCallback((state: SessionState) => {
    setIndustry(state.industry);
    setScenario(state.scenario);
    setBlocks(state.blocks);
    setMentorMessages(state.mentorMessages);
    if (state.theme) setTheme(state.theme);
  }, []);

  const getCurrentState = useCallback((): SessionState => ({
    industry,
    scenario,
    blocks,
    mentorMessages,
    theme
  }), [industry, scenario, blocks, mentorMessages, theme]);

  const handleUpdateScenario = useCallback((updatedScenario: Scenario) => {
    setScenario(updatedScenario);
  }, []);

  const loadingMessages = [
    "SYNTHESIZING_CORE...",
    "MAPPING_DATA_STRUCTURES...",
    "UPDATING_OPERATIONAL_LOGS...",
    "CALIBRATING_SENSORS..."
  ];

  const handleStart = async (selectedIndustry: Industry) => {
    setIndustry(selectedIndustry);
    setLoading(true);
    setError(null);
    setLoadingStep(0);
    
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const newScenario = await generateScenario(selectedIndustry);
      setScenario(newScenario);
      setMentorMessages([
        { role: 'assistant', content: `Analyst, I'm your Senior Mentor for the ${newScenario.companyName} project. Review the objectives in your briefing and start by exploring the dataset structure. I'm here if the noise becomes overwhelming.` }
      ]);
    } catch (err: any) {
      console.error("Initialization Error:", err);
      setError(err.message || "The analytical core failed to initialize. Please check your connection and retry the sequence.");
      setIndustry(null);
      setScenario(null);
      setLoading(false);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  if (!scenario || loading) {
    return (
      <Onboarding 
        onSelect={handleStart} 
        onImport={handleImport}
        loading={loading} 
        loadingMessage={loadingMessages[loadingStep]}
        error={error}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden animate-in fade-in duration-1000">
      <Sidebar 
        scenario={scenario} 
        onReset={handleReset} 
        onImport={handleImport}
        getCurrentState={getCurrentState}
      />
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <Workspace 
          scenario={scenario} 
          blocks={blocks} 
          setBlocks={setBlocks} 
          onUpdateScenario={handleUpdateScenario}
          theme={theme}
          toggleTheme={toggleTheme}
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
  );
};

export default App;
