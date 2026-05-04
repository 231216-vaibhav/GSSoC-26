import React, { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import { 
  Play, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  RotateCcw, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  Video, 
  Volume2, 
  Brain,
  Monitor,
  Target,
  Trophy,
  Award,
  Check,
  X,
  User,
  MessageSquare,
  Zap,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { interviewQuestions } from '../data/mockData';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("ErrorBoundary caught an error", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-slate-900">
          <AlertTriangle className="text-red-500 mb-6" size={64} />
          <h1 className="text-3xl font-black mb-4">CRITICAL SYSTEM ERROR</h1>
          <p className="text-slate-600 mb-8 max-w-lg">The AI Interface encountered an unexpected rendering crash. Please review the error stack below.</p>
          <div className="bg-white p-6 rounded-2xl w-full max-w-3xl overflow-auto border border-red-200 text-left shadow-xl">
            <code className="text-red-600 text-sm">{this.state.error?.toString()}</code>
            <br/><br/>
            <code className="text-slate-500 text-xs whitespace-pre-wrap">{this.state.error?.stack}</code>
          </div>
          <button onClick={() => window.location.reload()} className="mt-8 px-8 py-4 bg-emerald-500 text-white rounded-full font-bold shadow-lg hover:bg-emerald-400 transition-all">Reboot System</button>
        </div>
      );
    }
    return this.props.children;
  }
}

type Stage = 'intro' | 'interview' | 'evaluating' | 'result' | 'facetoface';

interface Evaluation {
  score: number;
  feedback: string;
  improvement: string;
  optimalSolution?: string;
  solution_explanation?: string;
}

const categoryColors: Record<string, string> = {
  Behavioral: 'bg-blue-50 text-blue-600 border-blue-200',
  Technical: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'System Design': 'bg-purple-50 text-purple-600 border-purple-200',
};

function MockInterviewContent() {
  const [stage, setStage] = useState<Stage>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [timeLeft, setTimeLeft] = useState(120);
  const [recording, setRecording] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [questions, setQuestions] = useState<any[]>(interviewQuestions);
  const [testMode, setTestMode] = useState<'quiz' | 'f2f' | null>(null);
  
  // Face-to-Face states
  const [cameraOn, setCameraOn] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Refs
  const qIndexRef = useRef(0);
  const answersRef = useRef<string[]>([]);
  const isRecordingRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { qIndexRef.current = qIndex; answersRef.current = answers; isRecordingRef.current = recording; }, [qIndex, answers, recording]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => setRecording(true);
      recognition.onend = () => isRecordingRef.current && recognition.start();
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          const currentAnswers = [...answersRef.current];
          currentAnswers[qIndexRef.current] = (currentAnswers[qIndexRef.current] || '') + ' ' + transcript;
          setAnswers(currentAnswers);
        }
      };
      recognitionRef.current = recognition;
    }
  }, []);

  // 1. Timer Tick Logic (Only subtracts time)
  useEffect(() => {
    if (stage === 'interview' || stage === 'facetoface') {
      const timer = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage, qIndex]);

  // 2. Timer Expiration Logic (Triggers the next stage safely)
  useEffect(() => {
    if ((stage === 'interview' || stage === 'facetoface') && timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, stage]);

  useEffect(() => {
    if (stage === 'facetoface') {
      startCamera();
      const st = setTimeout(() => speakQuestion(), 1500);
      return () => { clearTimeout(st); stopCamera(); window.speechSynthesis?.cancel(); };
    }
  }, [stage, qIndex]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (err) { console.warn(err); }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const speakQuestion = () => {
    if (!('speechSynthesis' in window) || !questions[qIndex]) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(questions[qIndex].question);
    utterance.onstart = () => { setAiSpeaking(true); if (isRecordingRef.current) recognitionRef.current?.stop(); };
    utterance.onend = () => { setAiSpeaking(false); try { recognitionRef.current?.start(); } catch(e){} };
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = async () => {
    if (isRecordingRef.current) try { recognitionRef.current?.stop(); } catch(e){}
    if (qIndex + 1 < questions.length) {
      setQIndex(q => q + 1);
      setTimeLeft(180);
    } else {
      await submitInterview();
    }
  };

  const submitInterview = async () => {
    setStage('evaluating');
    try {
      const qaPairs = questions.map((q, i) => ({
        question: q.question,
        category: q.category || 'General',
        answer: answers[i] || 'No response captured.',
        is_mcq: !!q.options
      }));
      const saved = localStorage.getItem('parsedResume');
      let profileData = {};
      if (saved) {
         try {
            const parsed = JSON.parse(saved);
            profileData = {
               role: parsed.role,
               domain: parsed.domain,
               level: parsed.level,
               gaps: parsed.gaps || ['Core']
            };
         } catch(e) {}
      }

      const res = await fetch('http://localhost:5000/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairs, profile: profileData })
      });
      if (res.ok) {
        const data = await res.json();
        const evals = data.evaluations || [];
        setEvaluations(evals);

        // Save to Firebase
        if (auth.currentUser) {
           const totalScore = evals.reduce((acc: number, curr: any) => acc + (curr.score >= 90 ? 5 : 0), 0);
           const percentageScore = Math.round((totalScore / (questions.length * 5)) * 100);
           
           await addDoc(collection(db, 'test_results'), {
             uid: auth.currentUser.uid,
             type: testMode === 'f2f' ? 'Face-to-Face' : 'Weakness Quiz',
             topic: questions[0]?.category || 'General',
             score: percentageScore,
             evaluations: evals,
             timestamp: serverTimestamp()
           });
        }
      }
    } catch (e) { console.error(e); }
    setStage('result');
  };

  const startAIBasedMode = async (mode: 'quiz' | 'f2f') => {
    setTestMode(mode);
    const saved = localStorage.getItem('parsedResume');
    if (!saved) return alert("Upload your resume first!");
    setLoadingAI(true);
    try {
      const parsed = JSON.parse(saved);
      const res = await fetch('http://localhost:5000/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profile: { 
            skills: parsed.skills?.map((s: any) => s.name) || [], 
            gaps: parsed.gaps || ['Core'],
            domain: parsed.domain || 'Technical',
            level: parsed.level || 'Professional',
            role: parsed.role || 'Software Developer'
          }, 
          mode: mode === 'quiz' ? 'quiz' : 'normal' 
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Strict array check to prevent .map crashes during render
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setAnswers(new Array(data.questions.length).fill(''));
          setQuestions(data.questions);
          setQIndex(0);
          setStage(mode === 'f2f' ? 'facetoface' : 'interview');
        } else {
          console.warn("Invalid AI output, falling back to standard questions.");
          setAnswers(new Array(interviewQuestions.length).fill(''));
          setQuestions(interviewQuestions);
          setQIndex(0);
          setStage(mode === 'f2f' ? 'facetoface' : 'interview');
        }
      } else {
        alert("Server error. Using standard question set.");
        setAnswers(new Array(interviewQuestions.length).fill(''));
        setQuestions(interviewQuestions);
        setQIndex(0);
        setStage(mode === 'f2f' ? 'facetoface' : 'interview');
      }
    } catch (e) { 
      console.error(e); 
      alert("Network error. Using standard question set.");
      setAnswers(new Array(interviewQuestions.length).fill(''));
      setQuestions(interviewQuestions);
      setQIndex(0);
      setStage(mode === 'f2f' ? 'facetoface' : 'interview');
    }
    finally { setLoadingAI(false); }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleReset = () => {
    stopCamera();
    if (isRecordingRef.current) try { recognitionRef.current?.stop(); } catch(e){}
    window.speechSynthesis?.cancel();
    setStage('intro');
    setQIndex(0);
    setAnswers([]);
    setEvaluations([]);
    setQuestions(interviewQuestions);
  };

  // ─── RENDERING ─────────────────────────────────────────────────────────────

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-emerald-200 backdrop-blur-md">
              <Sparkles size={14} className="animate-pulse" /> Next-Gen AI Simulation
            </div>
            <h1 className="text-7xl font-black text-slate-900 tracking-tighter mb-6 uppercase leading-none">
              Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-500">Interview.</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
              Professional-grade simulations powered by <span className="text-slate-900 font-bold">FAANG-level</span> AI. 
              Bridging the gap between your skills and your dream career.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* MODE 1: QUIZ */}
            <div className="group relative">
               <div className="absolute inset-0 bg-emerald-200 rounded-[60px] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
               <div className="relative bg-white border border-slate-200 p-14 rounded-[60px] hover:border-emerald-300 transition-all duration-500 flex flex-col items-center text-center backdrop-blur-xl h-full shadow-xl">
                  <div className="w-24 h-24 bg-emerald-50 rounded-[30px] flex items-center justify-center text-emerald-500 mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm">
                     <Cpu size={48} />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Weakness Quiz</h3>
                  <p className="text-slate-600 mb-12 font-medium leading-relaxed">Targeted technical MCQs focused on your resume gaps. Instant scoring & deep analysis.</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mb-12">
                     <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left">
                        <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Scoring</p>
                        <p className="text-xs text-slate-900 font-bold">5 Pts / Answer</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left">
                        <p className="text-[8px] font-black text-emerald-600 uppercase mb-1">Focus</p>
                        <p className="text-xs text-slate-900 font-bold">Resume Gaps</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => startAIBasedMode('quiz')}
                    disabled={loadingAI}
                    className="w-full py-7 bg-emerald-500 text-white rounded-[32px] font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loadingAI ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                    {loadingAI ? 'Analyzing Gaps...' : 'Start Quiz Test'}
                  </button>
               </div>
            </div>

            {/* MODE 2: FACE TO FACE */}
            <div className="group relative">
               <div className="absolute inset-0 bg-blue-200 rounded-[60px] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
               <div className="relative bg-white border border-slate-200 p-14 rounded-[60px] hover:border-blue-300 transition-all duration-500 flex flex-col items-center text-center backdrop-blur-xl h-full shadow-xl">
                  <div className="w-24 h-24 bg-blue-50 rounded-[30px] flex items-center justify-center text-blue-500 mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 shadow-sm">
                     <Video size={48} />
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Face-to-Face</h3>
                  <p className="text-slate-600 mb-12 font-medium leading-relaxed">Pure voice immersion. No text prompts. AI speaks, you respond with your voice.</p>
                  
                  <div className="grid grid-cols-2 gap-4 w-full mb-12">
                     <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left">
                        <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Analysis</p>
                        <p className="text-xs text-slate-900 font-bold">Vocal Delivery</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-left">
                        <p className="text-[8px] font-black text-blue-600 uppercase mb-1">Tech</p>
                        <p className="text-xs text-slate-900 font-bold">AI STT/TTS</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => startAIBasedMode('f2f')}
                    disabled={loadingAI}
                    className="w-full py-7 bg-slate-900 text-white rounded-[32px] font-black text-sm hover:bg-slate-800 transition-all shadow-[0_10px_30px_rgba(15,23,42,0.2)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loadingAI ? <Loader2 className="animate-spin" size={20} /> : <Activity size={20} />}
                    {loadingAI ? 'Initializing Vision...' : 'Launch Session'}
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'evaluating') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="relative w-48 h-48 mb-16">
           <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
           <div className="absolute inset-4 bg-emerald-500 rounded-full animate-pulse" />
           <div className="absolute inset-8 bg-emerald-500 rounded-full blur-2xl opacity-50" />
           <div className="absolute inset-0 flex items-center justify-center text-white"><Loader2 size={64} className="animate-spin" /></div>
        </div>
        <h2 className="text-6xl font-black text-slate-900 mb-6 tracking-tighter uppercase leading-none">Diagnostic in <br/> Progress</h2>
        <p className="text-slate-600 font-medium max-w-md mx-auto text-lg">SkillBridge AI is benchmarking your technical precision, vocal clarity, and strategic response patterns...</p>
      </div>
    );
  }

  if (stage === 'facetoface') {
    const q = questions[qIndex];
    if (!q) return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
        <p className="text-white/40 font-bold tracking-widest">INITIALIZING AI MENTOR...</p>
      </div>
    );
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden relative">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* AI SIDE */}
          <div className="relative aspect-[16/10] bg-white rounded-[60px] overflow-hidden border border-slate-200 flex flex-col items-center justify-center shadow-xl">
             <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ${aiSpeaking ? 'bg-emerald-100 scale-110 shadow-[0_0_100px_rgba(16,185,129,0.3)]' : 'bg-slate-50 scale-100 border border-slate-100'}`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${aiSpeaking ? 'bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-slate-200'}`}>
                  <Volume2 className={aiSpeaking ? 'text-white' : 'text-slate-400'} size={40} />
                </div>
             </div>
             <div className="mt-16 text-center">
                <p className={`text-[11px] font-black uppercase tracking-[0.6em] transition-all duration-700 ${aiSpeaking ? 'text-emerald-500' : 'text-slate-400'}`}>
                   {aiSpeaking ? "AI TRANSMITTING" : recording ? "AI LISTENING" : "IDLE"}
                </p>
                <div className="flex gap-2 justify-center mt-8 h-12 items-center">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className={`w-1.5 rounded-full transition-all duration-300 ${aiSpeaking ? 'bg-emerald-500 animate-bounce h-12' : 'bg-slate-200 h-2'}`} style={{ animationDelay: `${i * 100}ms` }} />
                   ))}
                </div>
             </div>
          </div>

          {/* USER SIDE */}
          <div className="relative aspect-[16/10] bg-white rounded-[60px] overflow-hidden border border-slate-200 shadow-xl">
            <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-all duration-1000 ${recording ? 'grayscale-0' : 'grayscale opacity-60'}`} />
            {recording && <div className="absolute inset-0 border-8 border-emerald-500/30 rounded-[60px] animate-pulse pointer-events-none" />}
            
            {/* HUD */}
            <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
               <div className="flex justify-between items-start">
                  <div className={`flex items-center gap-4 bg-white/90 backdrop-blur-2xl px-6 py-3 rounded-3xl border transition-all duration-500 ${recording ? 'border-emerald-300 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                     <div className={`w-3 h-3 rounded-full ${recording ? 'bg-emerald-500 shadow-[0_0_15px_emerald]' : 'bg-red-500'}`} />
                     <span className="text-[10px] font-black tracking-widest uppercase">{recording ? 'Voice Capture Active' : 'Waiting...'}</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-2xl px-6 py-3 rounded-3xl border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest">Confidence: 94%</div>
               </div>
               <div className="flex justify-between items-end">
                  <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-white/80 px-2 py-1 rounded-md inline-block">Sonic Waveform</p>
                     <div className="flex gap-1.5 h-6 items-end">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                          <div key={i} className={`w-1.5 bg-emerald-500 transition-all duration-150 ${recording ? 'opacity-100' : 'opacity-20'}`} style={{ height: recording ? `${Math.random() * 100}%` : '10%' }} />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="mt-16 max-w-5xl w-full bg-white/80 backdrop-blur-3xl border border-slate-200 p-16 rounded-[70px] shadow-xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-8">
                 <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-center text-slate-700">
                   <Clock size={32} />
                 </div>
                 <div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mb-2">Session Timer</p>
                    <p className={`text-4xl font-black ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-slate-900'}`}>{formatTime(timeLeft)}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.4em] mb-3">Topic {qIndex + 1}/{questions.length}</p>
                 <div className="flex gap-2.5">
                    {questions.map((_, i) => (
                      <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i <= qIndex ? 'w-16 bg-emerald-500' : 'w-5 bg-slate-200'}`} />
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 rounded-[45px] p-12 mb-12 border border-slate-100 min-h-[160px] flex items-center justify-center shadow-inner">
              <p className="text-emerald-600 text-2xl font-bold text-center italic leading-relaxed">
                 {answers[qIndex] || (recording ? "Transcribing your response..." : "Listening...")}
              </p>
           </div>

           <div className="flex gap-8">
              <button onClick={handleNext} className="flex-1 py-8 bg-emerald-500 text-white rounded-[40px] font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.2)] uppercase tracking-[0.2em] active:scale-95">
                {qIndex + 1 === questions.length ? 'Finalize Analysis' : 'Next Question'}
              </button>
              <button onClick={handleReset} className="px-16 py-8 bg-slate-100 text-slate-600 rounded-[40px] font-bold text-sm hover:bg-slate-200 transition-all uppercase tracking-[0.2em]">Exit</button>
           </div>
        </div>
      </div>
    );
  }

  // INTERVIEW PAGE
  if (stage === 'interview') {
    const q = questions[qIndex];
    if (!q) return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={48} />
        <p className="text-slate-400 font-bold tracking-widest">LOADING TEST MODULE...</p>
      </div>
    );
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 flex flex-col items-center">
        <div className="max-w-4xl w-full">
          <div className="flex justify-between items-center mb-12">
             <div className="flex items-center gap-6">
                <div className="px-8 py-3 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest">Q {qIndex + 1}/{questions.length}</div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{q.category}</div>
             </div>
             <p className="text-3xl font-black text-slate-900">{formatTime(timeLeft)}</p>
          </div>
          <div className="bg-white p-16 rounded-[70px] border border-slate-100 shadow-sm relative overflow-hidden mb-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-[150px]" />
            <h3 className="text-4xl font-black leading-tight mb-14 tracking-tight relative z-10">{q.question}</h3>
            {q.options ? (
              <div className="grid grid-cols-1 gap-5 relative z-10">
                {q.options.map((opt: string) => (
                  <button key={opt} onClick={() => setAnswers(prev => { const n = [...prev]; n[qIndex] = opt; return n; })} className={`w-full p-8 rounded-[40px] text-left font-bold transition-all border-2 text-lg ${answers[qIndex] === opt ? 'bg-emerald-500 text-white border-emerald-500 scale-[1.02] shadow-2xl' : 'bg-slate-50 border-transparent text-slate-600 hover:border-emerald-200'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea value={answers[qIndex] || ''} onChange={e => setAnswers(prev => { const n = [...prev]; n[qIndex] = e.target.value; return n; })} placeholder="Type your industry-level response..." className="w-full h-80 p-12 bg-slate-50 rounded-[50px] border-2 border-transparent focus:border-emerald-400 text-slate-800 font-medium outline-none transition-all resize-none shadow-inner text-lg" />
            )}
          </div>
          <button onClick={handleNext} disabled={!answers[qIndex]} className="w-full py-9 bg-emerald-500 text-white rounded-[50px] font-black text-sm shadow-2xl hover:bg-emerald-400 transition-all uppercase tracking-[0.2em] disabled:opacity-30">
            {qIndex + 1 === questions.length ? 'Submit Final Quiz' : 'Confirm & Next'}
          </button>
        </div>
      </div>
    );
  }

  // RESULTS PAGE
  if (stage === 'result') {
    const totalScore = evaluations.reduce((acc, curr) => acc + (curr.score >= 90 ? 5 : 0), 0);
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-20 rounded-[80px] border border-slate-100 shadow-sm text-center mb-16 relative overflow-hidden">
             <div className="w-32 h-32 bg-emerald-500 rounded-[45px] flex items-center justify-center text-white mx-auto mb-12 shadow-[0_40px_80px_rgba(16,185,129,0.3)]">
               <Trophy size={64} />
             </div>
             <h2 className="text-6xl font-black text-slate-900 mb-8 tracking-tighter uppercase">Diagnostic Insight</h2>
             <div className="flex flex-col sm:flex-row justify-center gap-16">
                <div className="bg-slate-50 p-14 rounded-[60px] flex-1">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Technical Points</p>
                   <p className="text-8xl font-black text-slate-900">{totalScore}</p>
                </div>
                <div className="bg-emerald-50 p-14 rounded-[60px] flex-1 border border-emerald-100">
                   <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-3">Industry Accuracy</p>
                   <p className="text-8xl font-black text-emerald-500">{Math.round((totalScore / (questions.length * 5)) * 100)}%</p>
                </div>
             </div>
          </div>

          <div className="space-y-12 mb-20">
             {questions.map((q, i) => (
               <div key={i} className="bg-white p-16 rounded-[70px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-14">
                     <span className={`px-8 py-3 rounded-full font-black text-[12px] uppercase tracking-widest ${evaluations[i]?.score >= 90 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {evaluations[i]?.score >= 90 ? <Check size={18} className="inline mr-2" /> : <X size={18} className="inline mr-2" />}
                        {evaluations[i]?.score >= 90 ? 'Gap Bridged' : 'Knowledge Gap'}
                     </span>
                     <span className="text-xs font-black text-slate-200 uppercase tracking-[0.3em]">Analysis Q{i+1}</span>
                  </div>
                  <h4 className="text-3xl font-black text-slate-900 mb-16 tracking-tight">{q.question}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                     <div className="p-14 bg-slate-50 rounded-[55px]">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">Your Response</p>
                        <p className="text-lg font-bold italic text-slate-700 leading-relaxed italic">"{answers[i] || 'No response captured.'}"</p>
                     </div>
                     <div className="p-14 bg-slate-900 rounded-[55px] text-white shadow-2xl">
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-8">Expert Master Answer</p>
                        <p className="text-lg font-medium text-white/80 leading-relaxed whitespace-pre-line">{q.correct_answer || evaluations[i]?.optimalSolution}</p>
                     </div>
                  </div>
                  <div className="p-12 bg-emerald-50 rounded-[55px] border border-emerald-100">
                     <p className="text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-8">AI In-Depth Diagnostic</p>
                     <p className="text-lg text-emerald-700 font-medium leading-relaxed mb-10">{evaluations[i]?.solution_explanation || evaluations[i]?.feedback}</p>
                     {evaluations[i]?.improvement && (
                       <div className="flex gap-5 bg-white p-8 rounded-[40px] border border-emerald-100 shadow-sm">
                          <Sparkles className="text-emerald-500 shrink-0" size={24} />
                          <p className="text-base text-emerald-900 font-bold italic">Expert Optimization: {evaluations[i].improvement}</p>
                       </div>
                     )}
                  </div>
               </div>
             ))}
          </div>
          <button onClick={handleReset} className="w-full py-10 bg-slate-900 text-white rounded-[60px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all">Back to Command Center</button>
        </div>
      </div>
    );
  }

  return null;
}

export default function MockInterview() {
  return (
    <ErrorBoundary>
      <MockInterviewContent />
    </ErrorBoundary>
  );
}
