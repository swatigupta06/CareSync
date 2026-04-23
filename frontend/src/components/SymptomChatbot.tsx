import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { aiAPI } from '../services/api';

interface Message { role: 'user' | 'model'; text: string; }

export default function SymptomChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const res = await aiAPI.chat(input, history);
      const data = res.data as Record<string, unknown>;
      setMessages(prev => [...prev, { role: 'model', text: (data.reply as string) || "I'm here to help. Please describe your symptoms." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please try again shortly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden flex flex-col h-[500px]">
      <div className="bg-slate-900 p-6 text-white flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-black text-lg uppercase tracking-tight">AI Symptom Checker</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Powered by AI</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Describe your symptoms to get started</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1",
              m.role === 'user' ? "bg-blue-600 text-white" : "bg-white border border-slate-100 text-slate-500"
            )}>
              {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn("max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
              m.role === 'user'
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
            )}>
              <div className="prose prose-sm max-w-none prose-p:my-1 prose-li:my-0">
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-400" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm p-4">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe your symptoms..."
          className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-600 transition-all"
        />
        <button type="submit" disabled={isLoading || !input.trim()}
          className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-50">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
