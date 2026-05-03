import { useState, useEffect, useRef } from 'react';
import { Play, Clock, ChevronRight, CheckCircle, RotateCcw, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { interviewQuestions } from '../data/mockData';

type Stage = 'intro' | 'interview' | 'evaluating' | 'result';

interface Evaluation {
  score: number;
  feedback: string;
  improvement: string;
}

const categoryColors: Record<string, string> = {
  Behavioral: 'bg-blue-50 text-blue-600 border-blue-200',
  Technical: 'bg-teal-50 text-teal-600 border-teal-200',
  'System Design': 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

const tips = [
  'Speak clearly and at a moderate pace.',
  'Use the STAR method for behavioral questions.',
  'It\'s okay to take a moment to think before answering.',
  'Be specific — use real examples where possible.',
  'Keep answers to 2-3 minutes per question.',
];

export default function MockInterview() {
  const [stage, setStage] = useState<Stage>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(interviewQuestions.length).fill(''));
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [totalTime, setTotalTime] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [recording, setRecording] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (stage === 'interview') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleNext();
            return 120;
          }
          return t - 1;
        });
      }, 1000);
      totalRef.current = setInterval(() => setTotalTime(t => t + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (totalRef.current) clearInterval(totalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, qIndex]);

  const resetTimer = () => setTimeLeft(120);

  const handleNext = async () => {
    setShowHint(false);
    setRecording(false);
    if (qIndex + 1 < interviewQuestions.length) {
      setQIndex(q => q + 1);
      setTimeLeft(120);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (totalRef.current) clearInterval(totalRef.current);
      await submitInterview();
    }
  };

  const submitInterview = async () => {
    setStage('evaluating');
    try {
      const qaPairs = interviewQuestions.map((q, i) => ({
        question: q.question,
        category: q.category,
        answer: answers[i]
      }));

      const res = await fetch('http://localhost:5000/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairs })
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluations(data.evaluations || []);
      }
    } catch (e) {
      console.error('Failed to evaluate interview', e);
    }
    setStage('result');
  };

  const startInterview = () => {
    setStage('interview');
    setQIndex(0);
    setAnswers(Array(interviewQuestions.length).fill(''));
    setTimeLeft(120);
    setTotalTime(0);
    setShowHint(false);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalRef.current) clearInterval(totalRef.current);
    setStage('intro');
    setQIndex(0);
    setEvaluations([]);
    setAnswers(Array(interviewQuestions.length).fill(''));
    setTimeLeft(120);
    setTotalTime(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const answered = answers.filter(a => a.trim().length > 0).length;
  const percent = Math.round((timeLeft / 120) * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (percent / 100) * circumference;

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <Mic size={12} /> Mock Interview
            </span>
            <h1 className="text-4xl font-bold text-gray-900">Prepare Like a Pro</h1>
            <p className="text-gray-500 mt-3">Practice with {interviewQuestions.length} real interview questions. Timed, structured, and reviewed.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Questions', value: interviewQuestions.length.toString(), sub: 'Mixed difficulty' },
              { label: 'Time per Q', value: '2:00', sub: 'Auto-advance' },
              { label: 'Categories', value: '3', sub: 'Behavioral, Technical, System Design' },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                <div className="text-3xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" /> Interview Tips
            </h3>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-teal-500 mt-0.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Question Preview</h3>
            <div className="space-y-3">
              {interviewQuestions.map((q, i) => (
                <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <span className="text-xs font-bold text-gray-400 w-5 shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[q.category]} mr-2`}>{q.category}</span>
                    <span className="text-sm text-gray-600">{q.question}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startInterview}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-teal-200 transition-all text-sm"
          >
            <Play size={18} /> Start Interview
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'evaluating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4 flex flex-col items-center justify-center">
        <div className="animate-spin mb-6">
          <svg className="w-16 h-16 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your responses...</h2>
        <p className="text-gray-500">Gemini AI is evaluating your answers and generating personalized feedback.</p>
      </div>
    );
  }

  if (stage === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-teal-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Interview Complete!</h2>
            <p className="text-gray-500 text-sm mb-5">Great effort! Here's a summary of your session.</p>
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900">{answered}</div>
                <div className="text-xs text-gray-500 mt-1">Answered</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-gray-900">{interviewQuestions.length - answered}</div>
                <div className="text-xs text-gray-500 mt-1">Skipped</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-teal-600">{formatTime(totalTime)}</div>
                <div className="text-xs text-gray-500 mt-1">Total Time</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-5">Your Responses & Feedback</h3>
            <div className="space-y-5">
              {interviewQuestions.map((q, i) => (
                <div key={q.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${categoryColors[q.category]}`}>{q.category}</span>
                    <span className="text-xs text-gray-500 font-medium">Q{i + 1}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">{q.question}</p>
                  {answers[i] ? (
                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed mb-3">Your Answer: "{answers[i]}"</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic mb-3">No answer provided</p>
                  )}
                  
                  {evaluations[i] && (
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">AI Evaluation</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${evaluations[i].score >= 70 ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                          Score: {evaluations[i].score}/100
                        </span>
                      </div>
                      <p className="text-sm text-teal-900 mb-2">{evaluations[i].feedback}</p>
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-teal-700 shrink-0 mt-0.5">Improvement:</span>
                        <p className="text-sm text-teal-800 italic">{evaluations[i].improvement}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm"
          >
            <RotateCcw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const q = interviewQuestions[qIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">Question {qIndex + 1} of {interviewQuestions.length}</p>
            <div className="flex gap-1.5">
              {interviewQuestions.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i < qIndex ? 'bg-teal-500 w-6' : i === qIndex ? 'bg-teal-300 w-8' : 'bg-gray-200 w-6'}`} />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <svg width="96" height="96" className="-rotate-90">
              <circle cx="48" cy="48" r={radius} stroke="#f0fdf4" strokeWidth="8" fill="none" />
              <circle cx="48" cy="48" r={radius} stroke={timeLeft < 30 ? '#f97316' : '#14b8a6'} strokeWidth="8" fill="none"
                strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear' }} />
            </svg>
            <div className={`-mt-16 text-center`}>
              <Clock size={12} className={`mx-auto mb-0.5 ${timeLeft < 30 ? 'text-orange-500' : 'text-teal-500'}`} />
              <span className={`text-lg font-extrabold tabular-nums ${timeLeft < 30 ? 'text-orange-600' : 'text-gray-900'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[q.category]}`}>{q.category}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-relaxed mb-6">{q.question}</h2>

          {showHint && q.hint && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm text-teal-700 mb-5">
              <span className="font-semibold">Hint:</span> {q.hint}
            </div>
          )}

          <textarea
            value={answers[qIndex]}
            onChange={e => setAnswers(prev => { const next = [...prev]; next[qIndex] = e.target.value; return next; })}
            placeholder="Type your answer here..."
            rows={5}
            className="w-full border-2 border-gray-100 focus:border-teal-400 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none transition-colors"
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={() => setRecording(r => !r)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${recording ? 'border-red-400 bg-red-50 text-red-600 animate-pulse' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
          >
            {recording ? <MicOff size={16} /> : <Mic size={16} />}
            {recording ? 'Recording...' : 'Record Voice'}
          </button>
          <button
            onClick={() => setShowHint(h => !h)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-teal-300 transition-all"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <button onClick={resetTimer} className="px-5 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:border-teal-300 transition-all">
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handleNext}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-teal-200 transition-all text-sm"
          >
            {qIndex + 1 < interviewQuestions.length ? 'Next Question' : 'Submit Interview'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
