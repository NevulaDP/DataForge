
import React, { useState, useRef, useEffect } from 'react';
import { Scenario, NotebookBlock, ChatMessage } from '../types';
import { MessageSquare, Send, X, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { getMentorAdvice } from '../geminiService';
// @ts-ignore
import { marked } from "marked";

interface Props {
  scenario: Scenario;
  blocks: NotebookBlock[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const Mentor: React.FC<Props> = ({ scenario, blocks, messages, setMessages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getMentorAdvice(scenario, [...messages, userMessage], blocks);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to the mentor network. Could you repeat that?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMarkdown = (content: string) => {
    try {
      return marked.parse(content);
    } catch (e) {
      return content;
    }
  };

  return (
    <div className="fixed bottom-12 right-12 z-[100]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-20 h-20 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <MessageSquare className="w-9 h-9" />
          <span className="absolute -top-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 animate-pulse" />
        </button>
      ) : (
        <div className="w-[520px] h-[780px] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-300">
          <div className="p-8 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Bot className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200">Senior Mentor</h3>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-[0.2em]">Live Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex space-x-4 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className={`p-6 rounded-[32px] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none font-bold' 
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 rounded-tl-none border border-transparent dark:border-slate-700/50 markdown-preview'
                  }`}
                  dangerouslySetInnerHTML={msg.role === 'assistant' ? { __html: renderMarkdown(msg.content) } : undefined}
                  >
                    {msg.role === 'user' ? msg.content : null}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-[32px] rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 border-t-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your mentor for strategy..."
                className="w-full bg-slate-100 dark:bg-slate-900 border-2 border-transparent dark:border-slate-800 rounded-[28px] py-5 pl-8 pr-16 text-base text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-2.5 top-2.5 w-12 h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-[20px] flex items-center justify-center transition-all shadow-xl shadow-blue-600/20 active:scale-90"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center space-x-2 text-slate-400 dark:text-slate-600">
               <Sparkles className="w-3 h-3" />
               <span className="text-[9px] font-black uppercase tracking-[0.2em]">Context-aware guidance active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentor;
