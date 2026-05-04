import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { 
  User, 
  Award, 
  TrendingUp, 
  Clock, 
  Target, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  Mic, 
  CheckCircle,
  BarChart3,
  Video,
  ChevronRight,
  Brain,
  AlertTriangle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

class ProfileErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
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
          <h1 className="text-3xl font-black mb-4">PROFILE RENDER ERROR</h1>
          <div className="bg-white p-6 rounded-2xl w-full max-w-3xl overflow-auto border border-red-200 text-left shadow-xl">
            <code className="text-red-600 text-sm">{this.state.error?.toString()}</code>
            <br/><br/>
            <code className="text-slate-500 text-xs whitespace-pre-wrap">{this.state.error?.stack}</code>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Keep chart mock data as visual placeholders until time-series backend is built
const performanceData = [
  { month: 'Jan', technical: 65, behavioral: 70, design: 45 },
  { month: 'Feb', technical: 72, behavioral: 75, design: 55 },
  { month: 'Mar', technical: 78, behavioral: 76, design: 65 },
  { month: 'Apr', technical: 84, behavioral: 82, design: 78 },
  { month: 'May', technical: 92, behavioral: 88, design: 85 },
];

const skillRadarData = [
  { subject: 'Algorithms', A: 90, fullMark: 100 },
  { subject: 'System Design', A: 85, fullMark: 100 },
  { subject: 'Communication', A: 88, fullMark: 100 },
  { subject: 'React/UI', A: 95, fullMark: 100 },
  { subject: 'Backend', A: 70, fullMark: 100 },
  { subject: 'Database', A: 75, fullMark: 100 },
];

function UserProfileContent() {
  const { user } = useGoogleAuth();
  const [realSessions, setRealSessions] = useState<any[]>([]);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [f2fScore, setF2fScore] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [dynamicPerformanceData, setDynamicPerformanceData] = useState<any[]>(performanceData);
  const [dynamicRadarData, setDynamicRadarData] = useState<any[]>(skillRadarData);

  useEffect(() => {
    if (!user) return;
    const fetchResults = async () => {
      try {
        const q = query(
          collection(db, 'test_results'),
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(q);
        const sessions = snapshot.docs.map(doc => {
          const data = doc.data();
          const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Just now';
          return {
            id: doc.id,
            type: data.type,
            topic: data.topic,
            score: data.score,
            date: date,
            status: data.score >= 90 ? 'Excellent' : data.score >= 80 ? 'Passed' : 'Needs Work'
          };
        });
        setRealSessions(sessions);
        
        if (sessions.length > 0) {
          const avg = Math.round(sessions.reduce((acc, curr) => acc + curr.score, 0) / sessions.length);
          setOverallScore(avg);

          const f2fSessions = sessions.filter(s => s.type === 'Face-to-Face');
          if (f2fSessions.length > 0) {
            setF2fScore(Math.round(f2fSessions.reduce((acc, curr) => acc + curr.score, 0) / f2fSessions.length));
          }

          const quizSessions = sessions.filter(s => s.type === 'Weakness Quiz');
          if (quizSessions.length > 0) {
            setQuizScore(Math.round(quizSessions.reduce((acc, curr) => acc + curr.score, 0) / quizSessions.length));
          }

          // Performance Area Chart Data (Chronological)
          const areaData = [...sessions].reverse().map(s => ({
            month: s.date.split('/')[0] + '/' + s.date.split('/')[1], // Short date
            score: s.score
          }));
          setDynamicPerformanceData(areaData);

          // Skill Radar Data (By Topic)
          const topicMap: Record<string, number[]> = {};
          sessions.forEach(s => {
             const t = s.topic || 'General';
             if (!topicMap[t]) topicMap[t] = [];
             topicMap[t].push(s.score);
          });
          const radarData = Object.keys(topicMap).map(topic => {
             const avgScore = Math.round(topicMap[topic].reduce((a,b)=>a+b,0)/topicMap[topic].length);
             return { subject: topic, A: avgScore, fullMark: 100 };
          });
          
          // Ensure radar chart has at least 3 points to render correctly
          const paddedRadarData = radarData.length >= 3 ? radarData : [
             ...radarData,
             ...skillRadarData.filter(d => !topicMap[d.subject]).slice(0, 3 - radarData.length)
          ];
          setDynamicRadarData(paddedRadarData);
        }
      } catch (err) {
        console.error("Error fetching test results:", err);
      }
    };
    fetchResults();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 text-slate-900 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HERO BANNER & AVATAR */}
        <div className="relative mb-24">
          <div className="w-full h-64 bg-gradient-to-r from-slate-200 via-white to-slate-200 rounded-[40px] border border-slate-200 overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          </div>
          <div className="absolute -bottom-16 left-12 flex items-end gap-6">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-[40px] p-1 shadow-2xl rotate-3">
                <div className="w-full h-full bg-slate-50 rounded-[36px] flex items-center justify-center border-4 border-white overflow-hidden -rotate-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-slate-300" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-slate-50 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>
            <div className="pb-4">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border border-slate-200 text-slate-600">
                {user?.email ? 'Verified Engineer' : 'Level 4 Engineer'}
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tight text-slate-900 drop-shadow-sm">{user?.displayName || 'Alex Developer'}</h1>
              <p className="text-slate-500 font-bold mt-1">{user?.email || 'Connect your account to sync data'}</p>
            </div>
          </div>
          <div className="absolute -bottom-8 right-12 flex gap-4">
            <button className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all">
              Resume Session
            </button>
            <button className="px-6 py-3 bg-white/60 backdrop-blur-md text-slate-700 rounded-full font-bold text-sm border border-slate-200 hover:bg-white transition-all shadow-sm">
              Edit Profile
            </button>
          </div>
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT SIDEBAR (Profile Info & Radar) */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 p-8 rounded-[40px] shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Career Profile</h3>
              
              {(() => {
                let parsedResume = null;
                try {
                  const saved = localStorage.getItem('parsedResume');
                  if (saved) parsedResume = JSON.parse(saved);
                } catch(e) {}

                if (parsedResume) {
                   const skills = parsedResume.skills?.map((s: any) => s.name) || [];
                   const topSkills = skills.slice(0, 3).join(', ');
                   const exp = parsedResume.experience_years || 0;
                   
                   // Use AI-classified fields if available, otherwise fallback
                   const role = parsedResume.role || (skills.join(' ').toLowerCase().includes('react') ? 'UI Engineer' : 'Software Engineer');
                   const domain = parsedResume.domain || 'Technical';
                   const level = parsedResume.level || 'Professional';
                   
                   return (
                     <>
                        <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                          {level} {role} in the {domain} domain with {exp > 0 ? `${exp} years` : 'recent'} experience. 
                          Demonstrated expertise in {topSkills || 'modern toolsets'}. 
                          Currently utilizing SkillBridge AI to prepare for top-tier opportunities.
                        </p>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-500">Domain</span>
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2">{domain}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-500">Seniority</span>
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2">{level}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-500">Target Role</span>
                            <span className="text-sm font-black text-slate-900 flex items-center gap-2"><Target size={14} className="text-emerald-500" /> {role}</span>
                          </div>
                          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <span className="text-xs font-bold text-slate-500">Overall Score</span>
                            <span className="text-sm font-black text-slate-900">{overallScore > 0 ? `${overallScore} / 100` : 'No Data'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-600">Face-to-Face Avg</span>
                            <span className="text-sm font-black text-blue-700">{f2fScore > 0 ? `${f2fScore} / 100` : 'No Data'}</span>
                          </div>
                          <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <span className="text-xs font-bold text-emerald-600">Quiz Analytics</span>
                            <span className="text-sm font-black text-emerald-700">{quizScore > 0 ? `${quizScore} / 100` : 'No Data'}</span>
                          </div>
                        </div>
                     </>
                   )
                }

                return (
                  <>
                    <p className="text-slate-600 font-medium mb-6 leading-relaxed">
                      Upload your resume on the Skill Analysis page to generate a personalized career profile and unlock targeted AI mock interviews.
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-500">Target Role</span>
                        <span className="text-sm font-black text-slate-400 flex items-center gap-2">Pending Resume...</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-500">Global Rank</span>
                        <span className="text-sm font-black text-slate-400">Not Ranked</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <span className="text-xs font-bold text-slate-500">Overall Score</span>
                        <span className="text-sm font-black text-slate-900">{overallScore > 0 ? `${overallScore} / 100` : 'No Data'}</span>
                      </div>
                      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <span className="text-xs font-bold text-blue-600">Face-to-Face Avg</span>
                        <span className="text-sm font-black text-blue-700">{f2fScore > 0 ? `${f2fScore} / 100` : 'No Data'}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 p-8 rounded-[40px] shadow-xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Skill Readiness</h3>
              <div className="h-[220px] w-full mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={dynamicRadarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                    <Radar name="Skills" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* RIGHT MAIN CONTENT (Graphs & Analytics) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Performance Graph */}
            <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 p-8 rounded-[40px] shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-1 text-slate-900">Test Performance Graph</h3>
                  <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Score progression over time</p>
                </div>
                <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs font-bold text-emerald-600 flex items-center gap-2">
                  <TrendingUp size={14} /> +27% Growth
                </div>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTech)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Face-to-Face Analytics */}
            <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 p-8 rounded-[40px] shadow-xl">
              <div className="mb-8">
                <h3 className="text-xl font-black uppercase tracking-tight mb-1 flex items-center gap-3 text-slate-900">
                  <Video className="text-blue-500" size={24} /> Face-to-Face Analytics
                </h3>
                <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Vocal & Behavioral Metrics</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full blur-xl" />
                  <Mic size={20} className="text-emerald-500 mb-4" />
                  <h4 className="text-2xl font-black mb-1 text-slate-900">94%</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vocal Confidence</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-100 rounded-full blur-xl" />
                  <Activity size={20} className="text-blue-500 mb-4" />
                  <h4 className="text-2xl font-black mb-1 text-slate-900">1.2s</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg. Latency</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-100 rounded-full blur-xl" />
                  <MessageSquare size={20} className="text-purple-500 mb-4" />
                  <h4 className="text-2xl font-black mb-1 text-slate-900">Low</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filler Words</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldCheck size={14}/> AI Observation Highlights</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Sparkles size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">Excellent articulation on System Design</p>
                      <p className="text-xs font-medium text-slate-600">Your F2F responses regarding microservices showed high clarity and structured STAR format delivery.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Brain size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">Consistent Eye Contact Simulation</p>
                      <p className="text-xs font-medium text-slate-600">Gaze tracking analytics show you maintained a 90%+ focus on the camera during the AI prompts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test History */}
            <div className="bg-white/80 backdrop-blur-3xl border border-slate-200 p-8 rounded-[40px] shadow-xl">
              <div className="mb-6">
                <h3 className="text-xl font-black uppercase tracking-tight mb-1 text-slate-900">Recent Test Activity</h3>
              </div>
              <div className="space-y-3">
                {realSessions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-bold border border-dashed border-slate-200 rounded-3xl">
                    No recent test activity found. Launch a session to populate analytics!
                  </div>
                ) : (
                  realSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.type === 'Face-to-Face' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {session.type === 'Face-to-Face' ? <Video size={20} /> : <Cpu size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{session.topic}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{session.type} • {session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900 leading-none">{session.score}</p>
                          <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${session.score >= 90 ? 'text-emerald-600' : session.score >= 80 ? 'text-blue-600' : 'text-red-600'}`}>{session.status}</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  return (
    <ProfileErrorBoundary>
      <UserProfileContent />
    </ProfileErrorBoundary>
  );
}
