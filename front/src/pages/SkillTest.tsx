import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Brain, CheckCircle, XCircle, ChevronRight, RotateCcw,
  Trophy, Loader2, Zap, Target, ArrowRight, BookOpen, Star
} from 'lucide-react';

interface MCQ {
  question: string;
  options: string[];
  correct_answer: string;
  solution_explanation: string;
}

type TestPhase = 'intro' | 'loading' | 'quiz' | 'result';

const NLP_API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/interview/generate`;

// Fallback questions per skill topic
const FALLBACK_QUESTIONS: Record<string, MCQ[]> = {
  sql: [
    { question: 'Which SQL clause filters results AFTER grouping?', options: ['A) WHERE', 'B) HAVING', 'C) FILTER', 'D) LIMIT'], correct_answer: 'B', solution_explanation: 'HAVING filters after GROUP BY; WHERE filters before grouping.' },
    { question: 'Which JOIN returns rows only when there is a match in BOTH tables?', options: ['A) LEFT JOIN', 'B) FULL OUTER JOIN', 'C) INNER JOIN', 'D) CROSS JOIN'], correct_answer: 'C', solution_explanation: 'INNER JOIN returns only rows where the join condition is satisfied in both tables.' },
    { question: 'What does TRUNCATE do vs DELETE?', options: ['A) Same thing', 'B) TRUNCATE removes all rows fast without logging individual rows', 'C) DELETE is faster', 'D) TRUNCATE adds rows'], correct_answer: 'B', solution_explanation: 'TRUNCATE is faster and non-logged; DELETE logs each row removal.' },
  ],
  linux: [
    { question: 'What does "grep" do?', options: ['A) Copy files', 'B) Search text patterns', 'C) Delete files', 'D) Compress archives'], correct_answer: 'B', solution_explanation: 'grep searches for patterns within text files using regular expressions.' },
    { question: 'Which command shows running processes?', options: ['A) top', 'B) run', 'C) proc', 'D) task'], correct_answer: 'A', solution_explanation: 'top displays real-time information about running processes.' },
    { question: 'What does "sudo" stand for?', options: ['A) Super User Do', 'B) System Update Do', 'C) Secure User Domain', 'D) Switch User Default'], correct_answer: 'A', solution_explanation: 'sudo stands for "Super User Do" and grants admin-level command execution.' },
  ],
  docker: [
    { question: 'What is a Docker container?', options: ['A) A virtual machine', 'B) A lightweight isolated runtime environment', 'C) A cloud service', 'D) A storage volume'], correct_answer: 'B', solution_explanation: 'Containers are lightweight, isolated environments that share the host OS kernel.' },
    { question: 'Which file defines a Docker image?', options: ['A) docker.yml', 'B) compose.json', 'C) Dockerfile', 'D) image.conf'], correct_answer: 'C', solution_explanation: 'A Dockerfile is a script with instructions to build a Docker image.' },
    { question: 'What command runs a Docker container?', options: ['A) docker start', 'B) docker run', 'C) docker exec', 'D) docker launch'], correct_answer: 'B', solution_explanation: 'docker run creates and starts a container from an image.' },
    { question: 'What does docker-compose do?', options: ['A) Builds images', 'B) Manages multi-container apps', 'C) Pushes to registry', 'D) Monitors resources'], correct_answer: 'B', solution_explanation: 'docker-compose orchestrates multiple containers defined in a YAML file.' },
    { question: 'What is a Docker volume?', options: ['A) A network bridge', 'B) A container registry', 'C) Persistent data storage for containers', 'D) A build cache'], correct_answer: 'C', solution_explanation: 'Volumes persist data outside the container lifecycle.' },
  ],
};

function getLetterIndex(letter: string): number {
  return ['A', 'B', 'C', 'D'].indexOf(letter.toUpperCase().trim());
}

export default function SkillTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
  const company = searchParams.get('company') || 'Target Company';
  const role = searchParams.get('role') || 'Software Engineer';

  const [phase, setPhase] = useState<TestPhase>('intro');
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [, setLoadError] = useState('');

  const fetchQuestions = async () => {
    setPhase('loading');
    setLoadError('');

    const profile = {
      skills: skills,
      gaps: skills,
      domain: 'Software Engineering',
      level: 'Entry'
    };

    try {
      const res = await fetch(NLP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, role, mode: 'quiz' }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      const qs: MCQ[] = (data.questions || []).slice(0, 10);

      if (qs.length > 0) {
        setQuestions(qs);
        setPhase('quiz');
        return;
      }
      throw new Error('No questions returned');
    } catch {
      // Use fallback questions based on first skill
      const key = skills[0]?.toLowerCase() || 'sql';
      const fallbackKey = Object.keys(FALLBACK_QUESTIONS).find(k => key.includes(k)) || 'sql';
      const fallback = FALLBACK_QUESTIONS[fallbackKey] || FALLBACK_QUESTIONS.sql;
      setQuestions(fallback);
      setPhase('quiz');
    }
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      if (currentQ + 1 < questions.length) {
        setCurrentQ(q => q + 1);
        setSelected(null);
      } else {
        setPhase('result');
      }
    }, 1200);
  };

  const score = answers.filter((ans, i) => ans === getLetterIndex(questions[i]?.correct_answer || 'A')).length;
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const getGrade = () => {
    if (percent >= 80) return { label: 'Excellent!', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (percent >= 60) return { label: 'Good Job!', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (percent >= 40) return { label: 'Keep Going!', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { label: 'Need Practice', color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  };

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-xs font-black text-slate-400 hover:text-slate-900 mb-10 flex items-center gap-2 uppercase tracking-widest transition-colors">
            <RotateCcw size={14} /> Back to Placements
          </button>

          <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />

            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Brain size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Skill Assessment</h1>
                <p className="text-slate-400 font-medium text-sm">Tailored for {company} — {role}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 mb-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Skills Being Tested</p>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: <BookOpen size={20} />, label: 'Questions', value: '10 MCQs' },
                { icon: <Target size={20} />, label: 'Topic', value: skills[0] || 'Mixed' },
                { icon: <Star size={20} />, label: 'Pass Score', value: '60%' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                  <div className="text-emerald-500 flex justify-center mb-2">{item.icon}</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-black text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <button
              onClick={fetchQuestions}
              className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl font-black text-base hover:from-emerald-500 hover:to-teal-500 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 group"
            >
              <Zap size={20} /> Start Assessment
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ──
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-[48px] p-16 border border-slate-100 shadow-2xl text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-[28px] bg-emerald-50 flex items-center justify-center mx-auto mb-8">
            <Loader2 size={36} className="text-emerald-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">Generating Questions</h2>
          <p className="text-slate-400 font-medium text-sm">AI is creating personalized questions for <span className="text-emerald-600 font-bold">{skills.join(', ')}</span></p>
          <div className="flex gap-2 justify-center mt-8">
            {['Analyzing skills', 'Building MCQs', 'Setting difficulty'].map((s, i) => (
              <span key={i} className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (phase === 'quiz') {
    const q = questions[currentQ];
    const correctIdx = getLetterIndex(q.correct_answer);
    const progress = ((currentQ) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-xs font-black text-emerald-600">{company} Test</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-10 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-10 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                {currentQ + 1}
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{skills[0] || 'General'} — MCQ</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 leading-snug tracking-tight mb-10">{q.question}</h2>

            <div className="space-y-4">
              {q.options.map((opt, i) => {
                let cls = 'border-slate-100 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer';
                if (selected !== null) {
                  if (i === correctIdx) cls = 'border-emerald-500 bg-emerald-500 text-white cursor-default';
                  else if (i === selected && i !== correctIdx) cls = 'border-red-500 bg-red-500 text-white cursor-default';
                  else cls = 'border-slate-50 bg-slate-50 text-slate-300 opacity-40 cursor-default';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selected !== null}
                    className={`w-full text-left px-7 py-5 rounded-[20px] border-2 text-sm font-bold transition-all duration-300 flex items-center gap-4 ${cls}`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black border-2 transition-all ${
                      selected === null ? 'border-slate-200 text-slate-400' :
                      i === correctIdx ? 'border-white/50 text-white' :
                      i === selected ? 'border-white/50 text-white' : 'border-slate-100 text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt.replace(/^[A-D]\)\s*/, '')}
                    {selected !== null && i === correctIdx && <CheckCircle size={18} className="ml-auto flex-shrink-0" />}
                    {selected !== null && i === selected && i !== correctIdx && <XCircle size={18} className="ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation after answer */}
            {selected !== null && (
              <div className={`mt-6 p-5 rounded-2xl border text-sm font-medium ${selected === correctIdx ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <p className="font-black mb-1">{selected === correctIdx ? '✅ Correct!' : `❌ Correct answer: ${q.correct_answer}`}</p>
                <p>{q.solution_explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  const grade = getGrade();
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl text-center relative overflow-hidden mb-8">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className={`inline-flex items-center gap-2 border text-sm font-black px-5 py-2.5 rounded-full mb-8 ${grade.bg} ${grade.color}`}>
            <Trophy size={16} /> {grade.label}
          </div>

          <div className="w-36 h-36 rounded-full border-8 border-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/10">
            <div>
              <div className="text-4xl font-black text-emerald-600">{percent}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</div>
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Assessment Complete</h2>
          <p className="text-slate-400 font-medium mb-8">
            You answered <span className="text-emerald-600 font-black">{score}</span> out of <span className="font-black text-slate-700">{questions.length}</span> questions correctly for <span className="font-black text-slate-700">{company}</span>.
          </p>

          {/* Per-question breakdown */}
          <div className="space-y-3 text-left mb-10">
            {questions.map((q, i) => {
              const correct = answers[i] === getLetterIndex(q.correct_answer);
              return (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border ${correct ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${correct ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {correct ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 leading-snug">{q.question}</p>
                    {!correct && <p className="text-[10px] text-red-600 font-bold mt-1">Correct: {q.correct_answer} — {q.solution_explanation?.slice(0, 80)}...</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/mentors')}
              className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black text-sm hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              Get Learning Roadmap <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => { setCurrentQ(0); setAnswers([]); setSelected(null); setPhase('intro'); }}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
