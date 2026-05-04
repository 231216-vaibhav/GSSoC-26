import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Brain, Zap } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: "Hi! I'm SkillBridge Assistant. How can I help you with your career today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Get profile from localStorage if available
      const saved = localStorage.getItem('parsedResume');
      let userData = { role: 'Software Developer', score: 50, gaps: [], skills: [], experience_years: 0, projects: [] };
      if (saved) {
        const parsed = JSON.parse(saved);
        userData = {
          role: 'Software Developer',
          score: 50,
          gaps: [],
          skills: parsed.skills?.map((s: any) => s.name) || [],
          experience_years: parsed.experience_years || 0,
          projects: parsed.projects || []
        };
      }

      // Build history pairs correctly
      const conversationHistory = [];
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].role === 'user' && messages[i+1]?.role === 'ai') {
          conversationHistory.push({
            user: messages[i].text,
            ai_insight: messages[i+1].text
          });
          i++; // Skip the next one as we paired it
        } else if (messages[i].role === 'user') {
          conversationHistory.push({ user: messages[i].text, ai_insight: '' });
        }
      }

      const response = await fetch('http://localhost:5000/api/ai-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData,
          question: userText,
          conversationHistory: conversationHistory.slice(-5)
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.insight || data.chat_summary || "I'm sorry, I couldn't process that." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now. Please try again later!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="bg-[#10b981] p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Brain size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold">SkillBridge Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] text-emerald-50">Online & Ready</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-[#10b981] text-white rounded-tr-sm' 
                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-2.5 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-emerald-400 transition-colors">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-[#10b981] hover:bg-[#059669] text-white p-1.5 rounded-lg disabled:opacity-40 transition-colors"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 text-center flex items-center justify-center gap-1">
              <Sparkles size={8} /> AI-Powered Career Assistant
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-800 rotate-90' : 'bg-[#10b981] hover:bg-[#059669]'
        }`}
      >
        {isOpen ? <X className="text-white" /> : <MessageCircle className="text-white" size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-pulse" />
        )}
      </button>
    </div>
  );
}
