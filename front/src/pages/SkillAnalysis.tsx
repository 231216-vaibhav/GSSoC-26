import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, CheckCircle, AlertCircle, ChevronRight,
  RotateCcw, FileText, Loader2, Code2, Star, Briefcase,
  Users, Zap, Trophy
} from 'lucide-react';
import { skillCategories } from '../data/mockData';

type Mode = 'choose' | 'upload' | 'select' | 'parsing' | 'result';

interface ParsedSkill { name: string; occurrences: number; confidence: 'high' | 'medium'; }
interface ParsedProject { title: string; description: string; tools: string[]; }
interface ParsedResume {
  skills: ParsedSkill[];
  projects: ParsedProject[];
  experience_years: number;
  education: string | null;
  current_role: string;
  target_role: string;
  gaps: string[];
  links: { github: string | null; linkedin: string | null };
  timestamp: number;
}

const NLP_API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/resume/parse`;

const questions: Record<string, { q: string; options: string[]; correct: number }[]> = {
  'JavaScript / TypeScript': [
    { q: 'What does `typeof null` return?', options: ['"null"', '"object"', '"undefined"', '"boolean"'], correct: 1 },
    { q: 'Which converts a JSON string to an object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.decode()'], correct: 1 },
    { q: 'What is a closure?', options: ['A loop', 'Function bundled with its lexical scope', 'Type annotation', 'Class method'], correct: 1 },
  ],
  'React & Frontend': [
    { q: 'Which hook is used for side effects?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1 },
    { q: 'What does the key prop help React with?', options: ['Styling', 'Identifying list items', 'Event handling', 'Context sharing'], correct: 1 },
    { q: 'What is JSX?', options: ['DB query lang', 'JS extension for HTML-like syntax', 'CSS preprocessor', 'Testing framework'], correct: 1 },
  ],
};
const defaultQuestions = [
  { q: 'Time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
  { q: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Heap', 'Graph'], correct: 1 },
  { q: 'What does REST stand for?', options: ['Remote State Transfer', 'Representational State Transfer', 'Reliable System Tech', 'Real-time Exchange Std'], correct: 1 },
];

export default function SkillAnalysis() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizSkill, setQuizSkill] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizResults, setQuizResults] = useState<{ skill: string; score: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const qs = quizSkill && questions[quizSkill] ? questions[quizSkill] : defaultQuestions;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError('');
    setMode('parsing');
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const res = await fetch(NLP_API, { method: 'POST', body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to parse resume.'); }
      const data: ParsedResume = await res.json();
      setParsedData(data);
      localStorage.setItem('parsedResume', JSON.stringify(data));
      setMode('result');
    } catch (err: any) {
      setParseError(err.message || 'Could not connect to the parser. Make sure the NLP server is running on port 5000.');
      setMode('upload');
    }
  };

  const toggleSkill = (s: string) => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const startQuiz = (skill: string) => { setQuizSkill(skill); setQIndex(0); setAnswers([]); setSelected(null); setQuizActive(true); };

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      if (qIndex + 1 < qs.length) { setAnswers(newAnswers); setQIndex(q => q + 1); setSelected(null); }
      else {
        const score = Math.round((newAnswers.filter((a, i) => a === qs[i].correct).length / qs.length) * 100);
        setQuizResults(prev => [...prev.filter(r => r.skill !== quizSkill), { skill: quizSkill, score }]);
        setQuizActive(false); setMode('result');
      }
    }, 700);
  };

  // ── QUIZ SCREEN ──
  if (quizActive) {
    const q = qs[qIndex];
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Q {qIndex + 1}/{qs.length}</span>
            <span className="text-sm font-black text-emerald-600">{quizSkill || 'General'}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-10 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${((qIndex + 1) / qs.length) * 100}%` }} />
          </div>
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 p-10">
            <h2 className="text-xl font-black text-slate-900 mb-8 leading-tight">{q.q}</h2>
            <div className="space-y-4">
              {q.options.map((opt, i) => {
                let cls = 'border-slate-100 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50';
                if (selected !== null) {
                  if (i === q.correct) cls = 'border-emerald-500 bg-emerald-500 text-white scale-105';
                  else if (i === selected) cls = 'border-red-500 bg-red-500 text-white';
                  else cls = 'border-slate-50 bg-slate-50 text-slate-300 opacity-50';
                }
                return (
                  <button key={i} disabled={selected !== null} onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-8 py-5 rounded-[24px] border-2 text-base font-bold transition-all duration-300 ${cls}`}>
                    <span className="font-black mr-4 text-xs opacity-50">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT SCREEN ──
  if (mode === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              <CheckCircle size={12} /> Resume Parsed Successfully
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Your Skill Report</h1>
            {fileName && <p className="text-slate-400 mt-2 text-sm font-medium">Extracted from <span className="text-emerald-600 font-bold">{fileName}</span></p>}
          </div>

          {/* Stats */}
          {parsedData && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Skills Found', value: parsedData.skills.length, color: 'text-teal-600' },
                { label: 'High Confidence', value: parsedData.skills.filter(s => s.confidence === 'high').length, color: 'text-emerald-500' },
                { label: 'Projects', value: parsedData.projects.length, color: 'text-indigo-600' },
                { label: 'Years Exp.', value: parsedData.experience_years, color: 'text-amber-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 text-center shadow-sm">
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Detected Skills */}
          {parsedData && parsedData.skills.length > 0 && (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mb-6">
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
                <Code2 size={18} className="text-teal-500" /> Detected Skills
              </h3>
              {parsedData.skills.filter(s => s.confidence === 'high').length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">🔥 High Confidence</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.filter(s => s.confidence === 'high').map(s => (
                      <span key={s.name} className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={10} className="fill-emerald-500 text-emerald-500" /> {s.name} <span className="text-emerald-400 font-normal">×{s.occurrences}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {parsedData.skills.filter(s => s.confidence === 'medium').length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">📌 Medium Confidence</p>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.filter(s => s.confidence === 'medium').map(s => (
                      <span key={s.name} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium">
                        {s.name} <span className="text-slate-400">×{s.occurrences}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Projects */}
          {parsedData && parsedData.projects.length > 0 && (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mb-6">
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-500" /> Projects
              </h3>
              <div className="space-y-4">
                {parsedData.projects.map((proj, i) => (
                  <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{proj.title}</h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{proj.description}</p>
                    {proj.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.tools.map(t => (
                          <span key={t} className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {parsedData && parsedData.gaps && parsedData.gaps.length > 0 && (
            <div className="bg-red-50 rounded-[32px] p-8 border border-red-100 shadow-sm mb-6">
              <h3 className="font-black text-red-700 text-lg mb-4 flex items-center gap-2">
                <AlertCircle size={18} /> Skill Gaps Identified
              </h3>
              <div className="flex flex-wrap gap-2">
                {parsedData.gaps.map(gap => (
                  <span key={gap} className="bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">{gap}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Results */}
          {quizResults.length > 0 && (
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mb-6">
              <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" /> Assessment Scores
              </h3>
              <div className="space-y-4">
                {quizResults.map(res => (
                  <div key={res.skill} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white ${res.score >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                        {res.score}%
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{res.skill}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{res.score >= 70 ? 'Proficient' : 'Learning'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── BIG AI MENTOR CTA ─── */}
          <div
            onClick={() => navigate('/mentors')}
            className="cursor-pointer bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-10 text-white shadow-2xl mb-6 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300"
          >
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                  <Zap size={10} /> Powered by AI
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tighter mb-2">
                  Talk to Your <br /><span className="text-emerald-400">AI Career Mentor</span>
                </h2>
                <p className="text-slate-400 text-sm font-medium max-w-xs">
                  Get a personalized roadmap, resume tips, and interview prep — based on your exact extracted skills.
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group-hover:rotate-12 transition-transform duration-500">
                  <Users size={36} className="text-white" />
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-3 text-emerald-400 font-black text-sm uppercase tracking-widest">
              Open AI Mentor <ChevronRight size={18} />
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/placements')}
              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2">
              View Job Matches <ChevronRight size={16} />
            </button>
            <button onClick={() => { setMode('choose'); setFileName(''); setParsedData(null); }}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <RotateCcw size={14} /> Upload New Resume
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ── MAIN CHOOSE SCREEN ──
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Zap size={12} /> Powered by SkillBridge AI
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
            MASTER YOUR <span className="text-emerald-500">CAREER.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">Analyze your resume and discover your path to top tech companies.</p>
        </div>

        {mode === 'choose' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => setMode('upload')}
              className="group bg-white rounded-[48px] border border-slate-100 p-12 text-left shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="w-16 h-16 rounded-3xl bg-emerald-500 flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20 group-hover:rotate-12 transition-transform">
                <Upload size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Upload Resume</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">Let our AI extract your skills, projects, and professional history automatically.</p>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">Start Analysis <ChevronRight size={16} /></div>
            </button>
            <button onClick={() => setMode('select')}
              className="group bg-white rounded-[48px] border border-slate-100 p-12 text-left shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform" />
              <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center mb-8 shadow-xl group-hover:-rotate-12 transition-transform">
                <FileText size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Direct Quiz</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">Pick your skill categories and prove your proficiency with a quick quiz.</p>
              <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest">Select Skills <ChevronRight size={16} /></div>
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl">
            <button onClick={() => { setMode('choose'); setParseError(''); }} className="text-xs font-black text-slate-400 hover:text-slate-900 mb-10 flex items-center gap-2 uppercase tracking-widest">
              <RotateCcw size={14} /> Back
            </button>
            {parseError && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-4">
                <AlertCircle size={20} className="text-red-500 mt-1 flex-shrink-0" />
                <p className="text-sm font-bold text-red-700">{parseError}</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
            <div onClick={() => fileRef.current?.click()}
              className="border-4 border-dashed border-slate-100 rounded-[40px] p-20 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group">
              <div className="w-24 h-24 rounded-[32px] bg-slate-50 flex items-center justify-center mx-auto mb-8 group-hover:bg-white group-hover:shadow-xl transition-all">
                <Upload size={36} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Drop your resume here</p>
              <p className="text-slate-400 font-medium">PDF, DOCX, TXT • Max 10MB</p>
            </div>
          </div>
        )}

        {mode === 'parsing' && (
          <div className="bg-white rounded-[48px] p-20 text-center border border-slate-100 shadow-2xl">
            <div className="w-24 h-24 rounded-[32px] bg-emerald-50 flex items-center justify-center mx-auto mb-8">
              <Loader2 size={40} className="text-emerald-500 animate-spin" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Analyzing...</h3>
            <p className="text-slate-400 font-medium">Scanning <span className="text-emerald-600 font-bold">{fileName}</span> for skills and projects.</p>
          </div>
        )}

        {mode === 'select' && (
          <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl">
            <button onClick={() => setMode('choose')} className="text-xs font-black text-slate-400 hover:text-slate-900 mb-10 flex items-center gap-2 uppercase tracking-widest">
              <RotateCcw size={14} /> Back
            </button>
            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Select Skill Areas</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {skillCategories.map(s => (
                <button key={s} onClick={() => toggleSkill(s)}
                  className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${selectedSkills.includes(s) ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-emerald-100'}`}>
                  {s}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Validate Proficiency</p>
                {selectedSkills.map(skill => (
                  <button key={skill} onClick={() => startQuiz(skill)}
                    className="w-full flex items-center justify-between px-8 py-5 bg-white border border-slate-100 rounded-[24px] text-sm font-black text-slate-900 hover:border-emerald-400 hover:shadow-xl transition-all group">
                    {skill}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ChevronRight size={18} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
