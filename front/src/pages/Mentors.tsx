import { useState, useRef, useEffect } from 'react';
import {
  Brain, Zap, Map, MessageSquare, ChevronRight, Loader2,
  TrendingUp, AlertCircle, CheckCircle2, Target, Calendar,
  Lightbulb, BarChart2, ListChecks, Sparkles, RefreshCw,
  FileText, User, Code2
} from 'lucide-react';

const REQUIRED_SKILLS = ["SQL", "Python", "Excel", "Power BI", "Statistics"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIResponse {
  insight: string;
  reason: string;
  actions: string[];
  roadmap: string[];
  today_task: string;
}

interface ConversationItem {
  question: string;
  response: AIResponse;
  timestamp: Date;
}

interface UserProfile {
  name: string;
  targetRole: string;
  readinessScore: number;
  skills: string[];
  gaps: string[];
  gapDetails: { name: string; isPartial: boolean }[];
  experience_years: number;
  rawSkills: { name: string; occurrences: number }[];
}

// ─── Backend API call ─────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:5000';

async function callAIMentor(userProfile: UserProfile, question: string): Promise<AIResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/ai-mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userData: {
          role: userProfile.targetRole,
          score: userProfile.readinessScore,
          gaps: userProfile.gaps,
          skills: userProfile.skills,
          experience_years: userProfile.experience_years
        },
        question
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Backend error: ${res.status}`);
    }

    const data = await res.json();
    return data as AIResponse;
  } catch (err) {
    console.error('AI Mentor backend error:', err);
    // Graceful fallback so UI still works if backend is down
    return generateDemoResponse(userProfile, question);
  }
}


function generateDemoResponse(profile: UserProfile, question: string): AIResponse {
  const gap = profile.gaps[0] || 'SQL';
  const skill = profile.skills[0] || 'Python';
  const role = profile.targetRole;

  if (question.toLowerCase().includes('reject')) {
    return {
      insight: `Your ${profile.readinessScore}% readiness score is the primary rejection trigger for ${role} roles.`,
      reason: `94% of ${role} job postings require ${gap}, yet your resume shows 0 mentions. Recruiters use ATS systems that auto-filter for these keywords before human review.`,
      actions: [
        `Add ${gap} to your resume with at least 2 project examples`,
        'Rewrite your summary to match the JD keywords for your target role',
        'Build one end-to-end project demonstrating data handling'
      ],
      roadmap: [
        `Day 1: Take a 3-hour ${gap} crash course (free on YouTube)`,
        `Day 2: Complete 10 ${gap} practice exercises`,
        `Day 3: Start a small project using ${gap}`,
        `Week 1: Deploy the project on GitHub with a clear README`,
        `Week 2: Update resume, apply to 5 jobs with tailored cover letters`
      ],
      today_task: `Watch the top-rated ${gap} beginner tutorial and take notes (2–3 hours)`
    };
  }

  return {
    insight: `To become a ${role}, mastering ${gap} is your highest-leverage skill to acquire right now.`,
    reason: `Your profile shows strong ${skill} foundation (${profile.experience_years}+ yrs), but ${gap} appears in 89% of ${role} job descriptions. This single gap explains your low readiness score.`,
    actions: [
      `Master ${gap} fundamentals in the next 2 weeks`,
      `Build one real project using ${skill} + ${gap} together`,
      'Add quantified achievements to your resume (e.g., "Reduced X by 40%")'
    ],
    roadmap: [
      `Day 1–2: ${gap} fundamentals (basic syntax + queries)`,
      `Day 3–4: Intermediate ${gap} (joins, aggregations, subqueries)`,
      'Day 5–7: Build mini-project combining your existing skills',
      'Week 2: Publish on GitHub, update LinkedIn, apply to 10 roles',
      'Week 3: Do 3 mock interviews and collect feedback'
    ],
    today_task: `Set up your development environment for ${gap} and complete 5 beginner exercises`
  };
}

// ─── Quick Action Prompts ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'reject', icon: AlertCircle, label: 'Why am I getting rejected?', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'next', icon: TrendingUp, label: 'What should I learn next?', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'roadmap', icon: Map, label: 'Generate my roadmap', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'weakness', icon: Brain, label: 'Explain my weaknesses', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'resume', icon: FileText, label: 'Improve my resume', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'interview', icon: MessageSquare, label: 'Prep for interview', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
];

const ACTION_PROMPTS: Record<string, string> = {
  reject: 'Why am I getting rejected from job applications?',
  next: 'What skills should I learn next to become a better candidate?',
  roadmap: 'Generate a detailed learning roadmap for my target role',
  weakness: 'Explain my weaknesses based on my profile and skill gaps',
  resume: 'How can I improve my resume to get more callbacks?',
  interview: 'How should I prepare for interviews for my target role?',
};

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Response Card ────────────────────────────────────────────────────────────
function ResponseCard({ item, index }: { item: ConversationItem; index: number }) {
  const r = item.response;
  return (
    <div className="animate-fadeIn">
      {/* Question bubble */}
      <div className="flex justify-end mb-4">
        <div className="bg-[#10b981] text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-md text-sm font-medium shadow-sm">
          {item.question}
        </div>
      </div>

      {/* Structured response */}
      <div className="space-y-3 mb-6">
        {/* Insight */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={15} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Insight</span>
          </div>
          <p className="text-slate-700 text-sm font-medium leading-relaxed">{r.insight}</p>
        </div>

        {/* Reason */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 hover:border-emerald-300 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={15} className="text-emerald-500" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Data-Backed Reason</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{r.reason}</p>
        </div>

        {/* Actions + Roadmap side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <ListChecks size={15} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Action Steps</span>
            </div>
            <ul className="space-y-2">
              {r.actions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 hover:border-emerald-300 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={15} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Roadmap</span>
            </div>
            <ul className="space-y-2">
              {r.roadmap.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500 font-bold text-xs mt-0.5 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Today's Task */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={15} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Today's Task</span>
          </div>
          <p className="text-emerald-950 text-sm font-semibold">{r.today_task}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900">{score}%</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wide">Ready</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Mentors() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Read parsed resume from localStorage
    const saved = localStorage.getItem('parsedResume');
    if (!saved) return;
    
    try {
      const parsedData = JSON.parse(saved);
      const extractedSkills = parsedData.skills || [];
      
      // 2. Normalize and extract unique skills
      const userSkills = Array.from(new Set(extractedSkills.map((s: any) => s.name))) as string[];
      
      // 3. Gap Calculation
      const gaps: string[] = [];
      const gapDetails: { name: string; isPartial: boolean }[] = [];
      let matchedCount = 0;
      
      REQUIRED_SKILLS.forEach(reqSkill => {
        const lowerReq = reqSkill.toLowerCase();
        // Check if required skill is in extracted skills
        const foundSkill = extractedSkills.find((s: any) => s.name.toLowerCase() === lowerReq);
        
        if (!foundSkill) {
          gaps.push(reqSkill);
          gapDetails.push({ name: reqSkill, isPartial: false });
        } else {
          matchedCount++;
          // Partial gap if low occurrences
          if (foundSkill.occurrences < 2) {
            gaps.push(reqSkill);
            gapDetails.push({ name: reqSkill, isPartial: true });
          }
        }
      });
      
      // 4. Score Calculation
      const score = Math.round((matchedCount / REQUIRED_SKILLS.length) * 100);

      setProfile({
        name: 'You',
        targetRole: 'Data Analyst',
        readinessScore: score,
        skills: userSkills,
        gaps: gaps,
        gapDetails: gapDetails,
        experience_years: parsedData.experience_years || 0,
        rawSkills: extractedSkills.map((s: any) => ({ name: s.name, occurrences: s.occurrences }))
      });
    } catch (e) {
      console.error('Error parsing saved resume data:', e);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, loading]);

  const askQuestion = async (question: string, actionId?: string) => {
    if (!question.trim() || loading || !profile) return;
    setLoading(true);
    setActiveAction(actionId || null);
    setCustomInput('');

    const response = await callAIMentor(profile, question);
    setConversations(prev => [...prev, { question, response, timestamp: new Date() }]);
    setLoading(false);
    setActiveAction(null);
  };

  const clearHistory = () => setConversations([]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-8 px-4 font-sans flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
           <FileText size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload your resume to see your skill analysis</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">
          The AI Mentor needs your resume data to calculate your readiness score and generate personalized career advice.
        </p>
        <button onClick={() => window.location.href = '/skill-analysis'} className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors">
          Upload Resume
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto h-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center shadow-sm">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AI Career Mentor</h1>
              <p className="text-xs text-slate-500">Powered by Google Gemini · Personalised to your profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini Active
            </span>
            {conversations.length > 0 && (
              <button onClick={clearHistory} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-xs border border-slate-200 hover:border-slate-300 bg-white px-3 py-1.5 rounded-full transition-all shadow-sm">
                <RefreshCw size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-180px)]">

          {/* ── LEFT PANEL ────────────────────────────── */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">

            {/* Profile card */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <User size={18} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                  <p className="text-xs text-emerald-600">→ {profile.targetRole}</p>
                </div>
              </div>

              <ScoreRing score={profile.readinessScore} />

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Top Skill Gaps</p>
                {(!profile.gapDetails || profile.gapDetails.length === 0) ? (
                  <p className="text-sm text-emerald-600 font-medium">You have all the required skills!</p>
                ) : (
                  profile.gapDetails.slice(0, 4).map((gap, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <AlertCircle size={12} className={gap.isPartial ? "text-amber-500 shrink-0" : "text-emerald-500 shrink-0"} />
                      <span className="text-sm text-slate-700 flex-1 flex items-center justify-between">
                        {gap.name}
                        {gap.isPartial && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">Low Exp</span>}
                      </span>
                      <div className="w-20 h-1 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        <div
                          className={`h-full rounded-full ${gap.isPartial ? 'bg-amber-400 w-[30%]' : 'bg-red-400 w-[0%]'}`}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(!profile.skills || profile.skills.length === 0) ? (
                    <span className="text-xs text-slate-400">No skills detected.</span>
                  ) : (
                    profile.skills.map(s => (
                      <span key={s} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full">{s}</span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="space-y-2">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    onClick={() => askQuestion(ACTION_PROMPTS[action.id], action.id)}
                    disabled={loading}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm text-left transition-all disabled:opacity-40 ${action.bg}`}
                  >
                    {activeAction === action.id
                      ? <Loader2 size={15} className={`${action.color} animate-spin shrink-0`} />
                      : <action.icon size={15} className={`${action.color} shrink-0`} />
                    }
                    <span className="text-slate-700 font-medium text-xs">{action.label}</span>
                    <ChevronRight size={13} className="ml-auto text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Debug View */}
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={14} className="text-slate-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Debug: Raw Skills</p>
              </div>
              <div className="max-h-40 overflow-y-auto pr-2 space-y-1">
                {(!profile.rawSkills || profile.rawSkills.length === 0) ? (
                  <p className="text-xs text-slate-400">No skills found by parser.</p>
                ) : (
                  profile.rawSkills.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-medium">{s.name}</span>
                      <span className="text-slate-500 bg-slate-200 px-1.5 rounded">x{s.occurrences}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ───────────────────────────── */}
          <div className="flex flex-col bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">

            {/* Conversation area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {conversations.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6">
                    <Sparkles size={36} className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Your AI Career Mentor</h2>
                  <p className="text-slate-500 text-sm max-w-sm mb-6">
                    This isn't a chatbot. It's a structured career guidance system that understands your profile and gives you data-backed, actionable insights.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    {['Why am I getting rejected?', 'What should I learn next?', 'Generate my roadmap', 'Explain my weaknesses'].map(q => (
                      <button
                        key={q}
                        onClick={() => askQuestion(q)}
                        className="text-xs text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-xl px-3 py-3 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {conversations.map((item, i) => (
                <ResponseCard key={i} item={item} index={i} />
              ))}

              {loading && (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Brain size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-slate-500 text-sm">Analyzing your profile…</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="border-t border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-emerald-400 transition-colors">
                <Target size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askQuestion(customInput)}
                  placeholder="Ask anything about your career, skills, or goals…"
                  className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                  disabled={loading}
                />
                <button
                  onClick={() => askQuestion(customInput)}
                  disabled={!customInput.trim() || loading}
                  className="bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                  Ask
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">
                Responses are personalised to your profile · Powered by Google Gemini
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
