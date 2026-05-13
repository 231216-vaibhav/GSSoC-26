import { useState, useRef, useEffect } from 'react';
import {
  Brain, Zap, Map, MessageSquare, ChevronRight, Loader2,
  TrendingUp, AlertCircle, CheckCircle2, Target, Calendar,
  Lightbulb, BarChart2, ListChecks, Sparkles, RefreshCw,
  FileText, User, Code2, ShieldCheck
} from 'lucide-react';

const ROLE_REQUIREMENTS: Record<string, string[]> = {
  // Technical
  "Software Developer":     ["JavaScript", "Python", "React", "Node.js", "Git", "SQL"],
  "Frontend Engineer":      ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Tailwind"],
  "Backend Engineer":       ["Node.js", "Python", "Java", "SQL", "Docker", "AWS"],
  "Full Stack Developer":   ["React", "Node.js", "MongoDB", "REST API", "Git", "TypeScript"],
  "Data Scientist":         ["Python", "Machine Learning", "Pandas", "SQL", "TensorFlow", "Statistics"],
  "Data Analyst":           ["SQL", "Python", "Excel", "Power BI", "Statistics", "Tableau"],
  "DevOps Engineer":        ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Terraform"],
  "Cloud Architect":        ["AWS", "Azure", "GCP", "Docker", "Terraform", "Networking"],
  "Mobile Developer":       ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "Git"],
  "AI/ML Engineer":         ["Python", "TensorFlow", "PyTorch", "Machine Learning", "NLP", "Deep Learning"],
  "Cybersecurity Analyst":  ["Networking", "Linux", "Ethical Hacking", "Firewalls", "SIEM", "Penetration Testing"],
  "QA Engineer":            ["Selenium", "Cypress", "Jest", "Test Planning", "API Testing", "Bug Tracking"],
  // Business & Management
  "Product Manager":        ["Agile", "Jira", "Communication", "Data Analysis", "SQL", "Strategy"],
  "Project Manager":        ["PMP", "Agile", "Scrum", "Risk Management", "MS Project", "Communication"],
  "Business Analyst":       ["Requirements Gathering", "SQL", "Excel", "UML", "JIRA", "Communication"],
  "Management Consultant":  ["Strategy", "PowerPoint", "Excel", "Problem Solving", "Data Analysis", "Communication"],
  "Operations Manager":     ["Supply Chain", "Lean", "Six Sigma", "ERP", "Leadership", "Data Analysis"],
  // Marketing & Sales
  "Digital Marketer":       ["SEO", "Google Ads", "Social Media", "Analytics", "Content Marketing", "Email Marketing"],
  "Sales Manager":          ["CRM", "Negotiation", "Communication", "Lead Generation", "Salesforce", "Forecasting"],
  "Content Writer":         ["SEO Writing", "Copywriting", "Research", "WordPress", "Social Media", "Editing"],
  // Design & Creative
  "UI/UX Designer":         ["Figma", "User Research", "Wireframing", "Prototyping", "Adobe XD", "Accessibility"],
  "Graphic Designer":       ["Photoshop", "Illustrator", "InDesign", "Typography", "Branding", "Figma"],
  // Finance & HR
  "Financial Analyst":      ["Excel", "Financial Modeling", "SQL", "Accounting", "Power BI", "Bloomberg"],
  "HR Manager":             ["Recruitment", "HRIS", "Labor Law", "Performance Management", "Communication", "Training"],
  // Medical & Science
  "Doctor / MBBS":          ["Clinical Skills", "Diagnosis", "Patient Care", "Medical Ethics", "Research", "Communication"],
  "Nurse":                  ["Patient Care", "Clinical Skills", "Medication Administration", "EMR", "Communication", "Team Collaboration"],
  "Pharmacist":             ["Pharmacology", "Drug Interactions", "Patient Counseling", "Dispensing", "Regulatory Knowledge", "Inventory Management"],
  // Student & Fresher
  "Fresher / Student":      ["Communication", "Problem Solving", "MS Office", "Teamwork", "Time Management", "Learning Agility"],
  "Research Intern":        ["Research Methodology", "Data Collection", "Academic Writing", "Statistics", "Excel", "Communication"],
};

// ─── Backend API (Gemini key stays server-side) ───────────────────────────────
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AIResponse {
  insight: string;
  reason: string;
  chat_summary: string;
  priority_skill: string;
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
  projects: { title: string; description: string; tools: string[] }[];
}

// ─── Secure backend call — API key NEVER leaves the server ────────────────────
async function callAIMentor(userProfile: UserProfile, question: string, history: ConversationItem[]): Promise<AIResponse> {
  try {
    // Map the SELECTED role to its correct domain — always prioritize user selection over resume AI classification
    const ROLE_DOMAIN_MAP: Record<string, string> = {
      'Software Developer':    'Technical',
      'Frontend Engineer':     'Technical',
      'Backend Engineer':      'Technical',
      'Full Stack Developer':  'Technical',
      'Data Scientist':        'Data Science',
      'Data Analyst':          'Data & Analytics',
      'DevOps Engineer':       'Technical',
      'Cloud Architect':       'Technical',
      'Mobile Developer':      'Technical',
      'AI/ML Engineer':        'AI & Machine Learning',
      'Cybersecurity Analyst': 'Cybersecurity',
      'QA Engineer':           'Technical',
      'Product Manager':       'Product Management',
      'Project Manager':       'Management',
      'Business Analyst':      'Business',
      'Management Consultant': 'Business',
      'Operations Manager':    'Operations',
      'Digital Marketer':      'Marketing',
      'Sales Manager':         'Sales',
      'Content Writer':        'Marketing',
      'UI/UX Designer':        'Design',
      'Graphic Designer':      'Design',
      'Financial Analyst':     'Finance',
      'HR Manager':            'Human Resources',
      'Doctor / MBBS':         'Medical',
      'Nurse':                 'Healthcare',
      'Pharmacist':            'Healthcare',
      'Fresher / Student':     'Student',
      'Research Intern':       'Research',
    };

    const domain = ROLE_DOMAIN_MAP[userProfile.targetRole] || 'General';

    // Level still comes from resume classification (seniority doesn't change with role switch)
    let level = 'Professional';
    try {
      const saved = localStorage.getItem('parsedResume');
      if (saved) { level = JSON.parse(saved).level || level; }
    } catch(e) {}

    const res = await fetch(`${BACKEND_URL}/api/ai-mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userData: {
          role: userProfile.targetRole,
          domain,
          level,
          score: userProfile.readinessScore,
          skills: userProfile.skills,
          gaps: userProfile.gaps,
          experience_years: userProfile.experience_years,
          projects: userProfile.projects
        },
        question,
        conversationHistory: history.slice(-5).map(h => ({ 
          user: h.question, 
          ai_insight: h.response.insight 
        }))
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Backend error: ${res.status}`);
    }

    const data = await res.json();
    return {
      insight: data.insight,
      reason: data.reason,
      chat_summary: data.chat_summary,
      priority_skill: userProfile.gaps[0] || 'Core Skills',
      actions: data.actions || [],
      roadmap: data.roadmap || [],
      today_task: data.today_task
    };
  } catch (err) {
    console.error('AI Mentor error:', err);
    return generateFallback(userProfile, question);
  }
}

function generateFallback(profile: UserProfile, question: string): AIResponse {
  const gap = profile.gaps[0] || 'Technical Skills';
  const role = profile.targetRole;
  
  const fallbacks = [
    {
      insight: `Currently analyzing your ${role} profile. Focusing on ${gap} is your best next move.`,
      reason: `Market trends for ${role} show high demand for ${gap}. Improving this will boost your score.`,
      chat_summary: `You're on the right track! Just a few more steps to reach your goal.`
    },
    {
      insight: `Your background looks solid, but we need to sharpen your ${gap} expertise.`,
      reason: `Many ${role} job descriptions list ${gap} as a top priority. Let's work on that.`,
      chat_summary: `Small improvements in ${gap} will lead to big results in your job search.`
    }
  ];

  const selected = fallbacks[Math.floor(Math.random() * fallbacks.length)];

  return {
    ...selected,
    priority_skill: gap,
    actions: [
      `Review latest tutorials for ${gap} on YouTube.`,
      `Practice ${gap} concepts on a small side project.`,
      `Update your resume to highlight any ${gap} experience.`
    ],
    roadmap: [
      `Week 1: Focus on ${gap} basics.`,
      `Week 2: Build a small project.`
    ],
    today_task: `Spend 30 minutes reading about ${gap} best practices.`
  };
}

// ─── Quick Action Prompts ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'reject', icon: AlertCircle, label: 'Why am I getting rejected?', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'next', icon: TrendingUp, label: 'What should I learn next?', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'roadmap', icon: Map, label: 'Generate my roadmap', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'resume', icon: FileText, label: 'Improve my resume', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'weakness', icon: Brain, label: 'Explain my weaknesses', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'interview', icon: MessageSquare, label: 'Prep for interview', color: 'text-emerald-600', bg: 'bg-white hover:bg-slate-50 border-slate-200' },
];

const getActionPrompt = (id: string, role: string, skills: string[]) => {
  const skillsList = skills.slice(0, 8).join(', ');
  switch (id) {
    case 'reject': return `Analyze my resume skills vs current job market for ${role}. List exact skill gaps causing rejections. Be very specific.`;
    case 'next': return `Based on my skills [${skillsList}], give me top 3 things to learn with resources and realistic timeline.`;
    case 'roadmap': return `Create a 90-day learning roadmap for ${role} based on my current skills. Give week by week plan with specific resources.`;
    case 'resume': return `Review my resume and give 5 specific improvements with before and after examples for each point.`;
    case 'weakness': return `Explain my weaknesses based on my profile and skill gaps for ${role}`;
    case 'interview': return `How should I prepare for interviews for ${role}?`;
    default: return '';
  }
};

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Chat Message Components ──────────────────────────────────────────────────
function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end mb-4 animate-slideInRight">
      <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[75%] text-sm leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  );
}

// Typewriter hook for ChatGPT-like streaming effect
function useTypewriter(text: string, speed = 12) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);
  return { displayed, done };
}

function AIMessage({ item }: { item: ConversationItem }) {
  const [showDetails, setShowDetails] = useState(false);
  const r = item.response;
  const { displayed, done } = useTypewriter(r.insight || '', 10);
  const hasDetails = !!(r.reason || (r.actions?.length > 0) || (r.roadmap?.length > 0) || r.today_task);

  return (
    <div className="flex flex-col mb-6">
      <div className="flex items-start gap-3">
        {/* AI Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Brain size={14} className="text-white" />
        </div>

        <div className="flex-1 max-w-[85%]">
          {/* Main answer bubble */}
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
            <p className="text-slate-800 text-sm leading-relaxed">
              {displayed}
              {!done && <span className="inline-block w-0.5 h-4 bg-emerald-500 ml-0.5 animate-pulse align-middle" />}
            </p>

            {/* Show career details toggle only after typewriter finishes AND there's detail content */}
            {done && hasDetails && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-800 transition-colors"
              >
                <Sparkles size={10} />
                {showDetails ? 'Hide Details' : 'Show Career Analysis & Roadmap'}
              </button>
            )}
          </div>

          {/* Expandable career details */}
          {showDetails && done && hasDetails && (
            <div className="mt-3 space-y-3 animate-fadeIn">
              {r.reason && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Analysis</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{r.reason}</p>
                </div>
              )}

              {r.actions?.length > 0 && r.actions[0] && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action Steps</span>
                  </div>
                  <ul className="space-y-2">
                    {r.actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {r.roadmap?.length > 0 && r.roadmap[0] && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Learning Roadmap</span>
                  </div>
                  <ul className="space-y-2">
                    {r.roadmap.map((step, i) => (
                      <li key={i} className="text-xs text-slate-600 border-l-2 border-emerald-200 pl-3 py-0.5">{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {r.today_task && (
                <div className="bg-emerald-600 text-white rounded-xl p-3 flex items-center gap-3 shadow-md">
                  <Zap size={14} className="text-white shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider mb-0.5">Today's Priority</p>
                    <p className="text-xs font-medium">{r.today_task}</p>
                  </div>
                </div>
              )}

              {/* Mentor Suggestion Card */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white shadow-lg shadow-emerald-200 mt-4 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <h4 className="font-bold text-sm">Want personalized guidance?</h4>
                </div>
                <p className="text-xs text-emerald-50 mb-4 opacity-90">
                  Connect with a real industry mentor from Google or Amazon for a 1-on-1 session.
                </p>
                <button 
                  onClick={() => window.location.href = '/mentors'}
                  className="w-full py-2 bg-white text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  Find a Mentor <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
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

// Fuzzy-match the AI-classified role from the resume to the closest key in ROLE_REQUIREMENTS
function detectInitialRole(): string {
  try {
    const saved = localStorage.getItem('parsedResume');
    if (!saved) return 'Software Developer';
    const parsed = JSON.parse(saved);
    const aiRole = (parsed.role || '').toLowerCase();
    if (!aiRole) return 'Software Developer';

    // Exact match first
    const exactMatch = Object.keys(ROLE_REQUIREMENTS).find(
      k => k.toLowerCase() === aiRole
    );
    if (exactMatch) return exactMatch;

    // Keyword-based fuzzy match
    const keywordMap: Record<string, string[]> = {
      'Software Developer':    ['software', 'developer', 'programmer', 'coder', 'engineer', 'sde', 'swe'],
      'Frontend Engineer':     ['frontend', 'front-end', 'ui developer', 'react developer'],
      'Backend Engineer':      ['backend', 'back-end', 'server', 'api developer'],
      'Full Stack Developer':  ['full stack', 'fullstack', 'full-stack'],
      'Data Scientist':        ['data scientist', 'ml engineer', 'machine learning', 'ai engineer'],
      'Data Analyst':          ['data analyst', 'analytics', 'business intelligence', 'bi'],
      'DevOps Engineer':       ['devops', 'sre', 'cloud engineer', 'infrastructure'],
      'AI/ML Engineer':        ['ai', 'artificial intelligence', 'deep learning', 'nlp engineer'],
      'Product Manager':       ['product manager', 'pm ', 'product owner', 'po '],
      'Project Manager':       ['project manager', 'pmo', 'scrum master'],
      'Business Analyst':      ['business analyst', 'ba ', 'requirements'],
      'Digital Marketer':      ['marketing', 'seo', 'digital marketing', 'growth'],
      'Sales Manager':         ['sales', 'account manager', 'business development', 'bdm'],
      'UI/UX Designer':        ['ux', 'ui/ux', 'designer', 'figma', 'user experience'],
      'Financial Analyst':     ['finance', 'financial', 'investment', 'equity', 'accounting'],
      'HR Manager':            ['hr', 'human resource', 'recruiter', 'talent acquisition'],
      'Doctor / MBBS':         ['doctor', 'mbbs', 'physician', 'medical', 'clinical'],
      'Nurse':                 ['nurse', 'nursing', 'rn', 'healthcare'],
      'Fresher / Student':     ['student', 'fresher', 'graduate', 'intern', 'btech', 'bsc'],
      'Research Intern':       ['researcher', 'research', 'phd', 'scientist'],
    };

    for (const [role, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(kw => aiRole.includes(kw))) return role;
    }
  } catch (e) {}
  return 'Software Developer';
}

export default function Mentors() {
  const [targetRole, setTargetRole] = useState<string>(() => detectInitialRole());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('parsedResume');
    if (!saved) return;
    
    try {
      const parsedData = JSON.parse(saved);
      const extractedSkills = parsedData.skills || [];
      const userSkills = Array.from(new Set(extractedSkills.map((s: any) => s.name))) as string[];
      
      const requiredSkills = ROLE_REQUIREMENTS[targetRole] || ROLE_REQUIREMENTS["Software Developer"];
      
      const gaps: string[] = [];
      const gapDetails: { name: string; isPartial: boolean }[] = [];
      let matchedCount = 0;
      
      requiredSkills.forEach(reqSkill => {
        const lowerReq = reqSkill.toLowerCase();
        const foundSkill = extractedSkills.find((s: any) => s.name.toLowerCase() === lowerReq);
        
        if (!foundSkill) {
          gaps.push(reqSkill);
          gapDetails.push({ name: reqSkill, isPartial: false });
        } else {
          matchedCount++;
          if (foundSkill.occurrences < 2) {
            gaps.push(reqSkill);
            gapDetails.push({ name: reqSkill, isPartial: true });
          }
        }
      });
      
      const score = Math.round((matchedCount / requiredSkills.length) * 100);

      setProfile({
        name: 'You',
        targetRole: targetRole,
        readinessScore: score,
        skills: userSkills,
        gaps: gaps,
        gapDetails: gapDetails,
        experience_years: parsedData.experience_years || 0,
        rawSkills: extractedSkills.map((s: any) => ({ name: s.name, occurrences: s.occurrences })),
        projects: parsedData.projects || []
      });
    } catch (e) {
      console.error('Error parsing saved resume data:', e);
    }
  }, [targetRole]);

  // Clear chat history whenever the user switches roles so the new role's context starts fresh
  useEffect(() => {
    setConversations([]);
  }, [targetRole]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, loading]);

  const askQuestion = async (question: string, actionId?: string) => {
    if (!question.trim() || loading || !profile) return;
    setLoading(true);
    setActiveAction(actionId || null);
    setCustomInput('');

    // If it's a quick action, use the specialized prompt
    let finalPrompt = question;
    if (actionId) {
      finalPrompt = getActionPrompt(actionId, targetRole, profile.skills);
    }

    // ⚡ CRITICAL FIX: Always inject the live targetRole from state into profile
    const currentProfile = { ...profile, targetRole };

    const response = await callAIMentor(currentProfile, finalPrompt, conversations);
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
              <p className="text-xs text-slate-500">Guidance based on your uploaded resume · Powered by Google Gemini</p>
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
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{profile.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">✦ AI Detected</span>
                  </div>
                  <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 mt-1 font-semibold w-full">
                    {targetRole}
                  </p>
                </div>
              </div>

              <div className="text-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score calculated based on your skills</span>
              </div>
              <ScoreRing score={profile.readinessScore} />

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Missing Skills</p>
                {(!profile.gapDetails || profile.gapDetails.length === 0) ? (
                  <p className="text-sm text-emerald-600 font-medium">You have all the required skills!</p>
                ) : (
                  profile.gapDetails.slice(0, 4).map((gap, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <AlertCircle size={12} className={gap.isPartial ? "text-amber-500 shrink-0" : "text-red-500 shrink-0"} />
                      <span className="text-sm text-slate-700 flex-1 flex items-center justify-between">
                        {gap.name}
                        {gap.isPartial && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">Low Exp</span>}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected from your resume</p>
                <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {(!profile.rawSkills || profile.rawSkills.length === 0) ? (
                    <span className="text-xs text-slate-400">No skills detected.</span>
                  ) : (
                    profile.rawSkills.slice(0, 8).map((s, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                        <span className="text-xs text-slate-700 font-medium">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.occurrences} mention{s.occurrences > 1 ? 's' : ''}</span>
                      </div>
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
                    onClick={() => askQuestion(action.label, action.id)}
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
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                    <Sparkles size={32} className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Ask anything about your career!</h2>
                  <p className="text-slate-500 text-sm max-w-sm mb-6">
                    I'm your AI career chatbot. I use your resume data to give you the most accurate advice.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md px-4">
                    {QUICK_ACTIONS.slice(0, 4).map(action => (
                      <button
                        key={action.id}
                        onClick={() => askQuestion(action.label, action.id)}
                        className="text-xs text-left bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-xl px-4 py-3 transition-all flex items-center justify-between"
                      >
                        {action.label} <ChevronRight size={12} className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {conversations.map((item, i) => (
                  <div key={i} className={i > 0 ? "pt-6 border-t border-slate-100" : ""}>
                    <UserMessage text={item.question} />
                    <AIMessage item={item} />
                  </div>
                ))}
              </div>

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
              <p className="text-[11px] text-slate-500 mt-2 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck size={11} className="text-emerald-500" />
                Guidance based on your uploaded resume · No generic advice — fully personalized · Powered by Google Gemini
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
