import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, ChevronRight, Activity, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

const SmartDoctor = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: "Hello, I am the Sanjeevni AI Medical Advisor. Please share the patient's symptoms and vitals for a clinical assessment.", status: 'normal' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // For the mock, we simulate parsing symptoms/vitals from the single input
      const res = await api.ai.smartDoctor({
        symptoms: input,
        vitals: input, // Simplified for the single box chat
        notes: ""
      });

      const botMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: res.data.recommendation,
        urgency: res.data.urgency
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "Sorry, I'm having trouble connecting to the medical AI engine.", status: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] space-y-6 animate-in slide-in-from-bottom-5 duration-700">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Smart Doctor AI <Sparkles className="text-sanjeevni-500 fill-sanjeevni-500" size={24} />
          </h1>
          <p className="text-slate-500">Clinical decision support system specialized in emergency triage</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          AI Engine Online
        </div>
      </header>

      <div className="flex-1 card flex flex-col p-0 overflow-hidden border-2 border-slate-100 shadow-xl">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-sm ${
                  msg.type === 'user' ? 'bg-slate-800 text-white' : 'bg-white text-sanjeevni-600'
                }`}>
                  {msg.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl shadow-sm leading-relaxed ${
                    msg.type === 'user' 
                      ? 'bg-sanjeevni-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.urgency === 'critical' && (
                    <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center justify-between animate-in zoom-in-95">
                      <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                        <Activity size={16} /> Urgent Action Recommended
                      </div>
                      <button 
                        onClick={() => window.location.hash = '/transfer'}
                        className="text-white bg-rose-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-rose-700 transition-all flex items-center gap-1"
                      >
                        Start Transfer <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm font-medium italic">Analyzing clinical data...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-4 items-center">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe symptoms, enter vitals (e.g. SpO2 85%, patient lethargic)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-sanjeevni-500/20 transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-sanjeevni-500 text-white w-14 h-14 rounded-xl flex items-center justify-center hover:bg-sanjeevni-600 transition-all shadow-lg shadow-sanjeevni-500/30 disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </div>

      <div className="flex gap-4">
        {[
          "SpO2 decreasing, chest pain reported",
          "High fever 103F, cough, fatigue",
          "BP low, heart rate elevated, pale"
        ].map((prompt, i) => (
          <button 
            key={i} 
            onClick={() => setInput(prompt)}
            className="flex-1 text-xs font-semibold text-slate-500 bg-white border border-slate-100 p-3 rounded-xl hover:bg-sanjeevni-50 hover:text-sanjeevni-600 hover:border-sanjeevni-100 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SmartDoctor;
