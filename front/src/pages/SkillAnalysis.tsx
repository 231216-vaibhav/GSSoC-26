import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, CheckCircle, XCircle, AlertCircle, ChevronRight,
  RotateCcw, FileText, MousePointerClick, Loader2, Github,
  Linkedin, Briefcase, BookOpen, Code2, Star
} from 'lucide-react';
import { skillCategories } from '../data/mockData';

type Mode = 'choose' | 'upload' | 'select' | 'parsing' | 'result';

interface ParsedSkill {
  name: string;
  occurrences: number;
  confidence: 'high' | 'medium';
}

interface ParsedProject {
  title: string;
  description: string;
  tools: string[];
}

interface ParsedResume {
  skills: ParsedSkill[];
  projects: ParsedProject[];
  experience_years: number;
  education: string | null;
  links: { github: string | null; linkedin: string | null };
  rawTextPreview: string;
  timestamp: number;
}

const NLP_API = 'http://localhost:5000/api/resume/parse';

const questions: Record<string, { q: string; options: string[]; correct: number }[]> = {
  'JavaScript / TypeScript': [
    { q: 'What does `typeof null` return in JavaScript?', options: ['"null"', '"object"', '"undefined"', '"boolean"'], correct: 1 },
    { q: 'Which method converts a JSON string to an object?', options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.decode()'], correct: 1 },
    { q: 'What is a closure?', options: ['A loop construct', 'A function bundled with its lexical scope', 'A type annotation', 'A class method'], correct: 1 },
  ],
  'React & Frontend': [
    { q: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correct: 1 },
    { q: 'What does the key prop help React with?', options: ['Styling elements', 'Identifying list items', 'Event handling', 'Context sharing'], correct: 1 },
    { q: 'What is JSX?', options: ['A database query language', 'A JavaScript extension for writing HTML-like syntax', 'A CSS preprocessor', 'A testing framework'], correct: 1 },
  ],
};

const defaultQuestions = [
  { q: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correct: 1 },
  { q: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Heap', 'Graph'], correct: 1 },
  { q: 'What does REST stand for?', options: ['Remote State Transfer', 'Representational State Transfer', 'Reliable System Technology', 'Real-time Exchange Standard'], correct: 1 },
];

function ConfidenceBadge({ confidence }: { confidence: string }) {
  if (confidence === 'high')
    return <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">High</span>;
  return <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Medium</span>;
}

export default function SkillAnalysis() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);

  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizSkill, setQuizSkill] = useState('');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const qs = quizSkill && questions[quizSkill] ? questions[quizSkill] : defaultQuestions;

  // ----------------------------------------------------------
  // RESUME UPLOAD & LIVE PARSING
  // ----------------------------------------------------------
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError('');
    setMode('parsing');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch(NLP_API, {
        method: 'POST',
        body: formData,
        // Force no caching so every upload is fresh
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse resume.');
      }

      const data: ParsedResume = await res.json();
      setParsedData(data);
      // Save globally for AI Mentor page
      localStorage.setItem('parsedResume', JSON.stringify(data));
      setMode('result');
    } catch (err: any) {
      setParseError(err.message || 'Could not connect to the parser. Make sure the NLP server is running on port 5000.');
      setMode('upload');
    }
  };

  const toggleSkill = (s: string) => {
    setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const startQuiz = (skill: string) => {
    setQuizSkill(skill);
    setQIndex(0);
    setAnswers([]);
    setSelected(null);
    setQuizActive(true);
  };

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      if (qIndex + 1 < qs.length) {
        setAnswers(newAnswers);
        setQIndex(q => q + 1);
        setSelected(null);
      } else {
        setAnswers(newAnswers);
        setQuizActive(false);
        setMode('result');
      }
    }, 700);
  };

  // ----------------------------------------------------------
  // QUIZ SCREEN
  // ----------------------------------------------------------
  if (quizActive) {
    const q = qs[qIndex];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-medium text-gray-500">Question {qIndex + 1} of {qs.length}</span>
            <span className="text-sm font-semibold text-teal-600">{quizSkill || 'General'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-8">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${((qIndex + 1) / qs.length) * 100}%` }} />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">{q.q}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let cls = 'border-gray-200 bg-white text-gray-700 hover:border-teal-400 hover:bg-teal-50';
                if (selected !== null) {
                  if (i === q.correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
                  else if (i === selected && i !== q.correct) cls = 'border-red-400 bg-red-50 text-red-600';
                  else cls = 'border-gray-100 bg-gray-50 text-gray-400';
                }
                return (
                  <button
                    key={i}
                    disabled={selected !== null}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${cls}`}
                  >
                    <span className="font-bold mr-3 text-xs">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // PARSED RESUME RESULT SCREEN
  // ----------------------------------------------------------
  if (mode === 'result' && parsedData) {
    const highSkills = parsedData.skills.filter(s => s.confidence === 'high');
    const mediumSkills = parsedData.skills.filter(s => s.confidence === 'medium');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <CheckCircle size={12} /> Resume Parsed Successfully
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Your Skill Report</h1>
            <p className="text-gray-500 mt-2 text-sm">Extracted from <span className="font-semibold text-teal-600">{fileName}</span></p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-teal-600">{parsedData.skills.length}</div>
              <div className="text-xs text-gray-400 mt-1">Skills Found</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-emerald-600">{highSkills.length}</div>
              <div className="text-xs text-gray-400 mt-1">High Confidence</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-indigo-600">{parsedData.projects.length}</div>
              <div className="text-xs text-gray-400 mt-1">Projects</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
              <div className="text-3xl font-extrabold text-amber-500">{parsedData.experience_years}</div>
              <div className="text-xs text-gray-400 mt-1">Years Exp.</div>
            </div>
          </div>

          {/* Skills Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <Code2 size={18} className="text-teal-500" />
              <h3 className="font-bold text-gray-900">Detected Skills</h3>
            </div>

            {parsedData.skills.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No skills could be extracted from this resume.</p>
              </div>
            ) : (
              <>
                {highSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">🔥 High Confidence</p>
                    <div className="flex flex-wrap gap-2">
                      {highSkills.map(skill => (
                        <div key={skill.name} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                          <Star size={11} className="fill-emerald-500 text-emerald-500" />
                          {skill.name}
                          <span className="text-xs text-emerald-500 font-normal">×{skill.occurrences}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mediumSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">📌 Medium Confidence</p>
                    <div className="flex flex-wrap gap-2">
                      {mediumSkills.map(skill => (
                        <div key={skill.name} className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium">
                          {skill.name}
                          <span className="text-xs text-gray-400 font-normal">×{skill.occurrences}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Projects */}
          {parsedData.projects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <Briefcase size={18} className="text-indigo-500" />
                <h3 className="font-bold text-gray-900">Projects</h3>
              </div>
              <div className="space-y-4">
                {parsedData.projects.map((proj, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-800 text-sm mb-1">{proj.title}</h4>
                    <p className="text-xs text-gray-500 mb-2 leading-relaxed">{proj.description}</p>
                    {proj.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.tools.map(t => (
                          <span key={t} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {(parsedData.links.github || parsedData.links.linkedin) && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={18} className="text-gray-500" />
                <h3 className="font-bold text-gray-900">Links</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {parsedData.links.github && (
                  <a href={parsedData.links.github} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-colors">
                    <Github size={15} /> GitHub Profile
                  </a>
                )}
                {parsedData.links.linkedin && (
                  <a href={parsedData.links.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:border-blue-400 transition-colors">
                    <Linkedin size={15} /> LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/mentors')} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-teal-200 transition-all text-sm">
              Find a Mentor <ChevronRight size={16} />
            </button>
            <button onClick={() => { setMode('choose'); setFileName(''); setParsedData(null); setParseError(''); }} className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm">
              <RotateCcw size={14} /> Upload Another Resume
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // MAIN CHOOSE / UPLOAD / SELECT SCREEN
  // ----------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
            <MousePointerClick size={12} /> Skill Analysis
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Discover Your Skill Score</h1>
          <p className="text-gray-500 mt-2">Upload your resume and we'll extract your skills automatically</p>
        </div>

        {mode === 'choose' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button
              onClick={() => setMode('upload')}
              className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-400 p-8 text-left shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Upload size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Upload Resume</h3>
              <p className="text-sm text-gray-500">We'll extract and analyse your skills automatically from your resume PDF or DOCX.</p>
            </button>
            <button
              onClick={() => setMode('select')}
              className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-400 p-8 text-left shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <FileText size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Select Skills</h3>
              <p className="text-sm text-gray-500">Choose your skill areas and take a quick quiz to get your scores.</p>
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <button onClick={() => { setMode('choose'); setParseError(''); }} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Back</button>
            
            {parseError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{parseError}</p>
              </div>
            )}

            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFile} />
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-teal-200 rounded-2xl p-12 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-100 transition-colors">
                <Upload size={28} className="text-teal-500" />
              </div>
              <p className="font-semibold text-gray-700 mb-1">Click to upload your resume</p>
              <p className="text-sm text-gray-400">PDF, DOCX, TXT supported • Max 10MB</p>
            </div>
          </div>
        )}

        {/* Parsing Loader */}
        {mode === 'parsing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-teal-500 animate-spin" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Parsing your resume...</h3>
            <p className="text-sm text-gray-400">Extracting skills, projects, and links from <span className="font-medium text-gray-600">{fileName}</span></p>
            <div className="mt-6 flex gap-2 justify-center">
              {['Extracting text', 'Matching skills', 'Building report'].map((step, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'select' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <button onClick={() => setMode('choose')} className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1">← Back</button>
            <h3 className="font-bold text-gray-900 mb-4">Select Your Skill Areas</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {skillCategories.map(s => (
                <button
                  key={s}
                  onClick={() => toggleSkill(s)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${selectedSkills.includes(s) ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-teal-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 font-medium">Take a quick quiz for each skill:</p>
                {selectedSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => startQuiz(skill)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-teal-50 border border-teal-200 rounded-xl text-sm font-semibold text-teal-700 hover:bg-teal-100 transition-colors"
                  >
                    {skill}
                    <ChevronRight size={16} />
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
