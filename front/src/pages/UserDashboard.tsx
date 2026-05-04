import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  Users, 
  MessageSquare, 
  BarChart3, 
  ChevronRight, 
  Zap, 
  Target, 
  Award, 
  TrendingUp, 
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Building2,
  ArrowRight,
  Briefcase,
  Star
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { companiesData } from '../data/companies';
import { calculateJobMatches } from '../utils/matchingEngine';
import mentorsDataRaw from '../data/mentors.json';
import { Mentor, matchMentors } from '../utils/mentorMatching';

const mentorsData = Array.isArray(mentorsDataRaw) ? mentorsDataRaw : ((mentorsDataRaw as any).default || []);

export default function UserDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('parsedResume');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const jobMatches = useMemo(() => {
    if (!profile) return [];
    return calculateJobMatches(profile.skills || [], companiesData, profile.experience_years || 0).slice(0, 3);
  }, [profile]);

  const mentorMatches = useMemo(() => {
    const skills = (profile?.skills || []).map((s: any) => typeof s === 'string' ? s : s.name);
    if (!profile) return (mentorsData as Mentor[]).slice(0, 3);
    const matched = matchMentors(skills, profile.role || '', mentorsData as Mentor[]);
    return matched.slice(0, 3);
  }, [profile]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', active: true },
    { icon: BrainCircuit, label: 'Skill Analysis', path: '/skill-analysis' },
    { icon: Users, label: 'Mentors', path: '/mentors' },
    { icon: MessageSquare, label: 'Mock Interview', path: '/mock-interview' },
    { icon: Briefcase, label: 'Placements', path: '/placements' },
  ];

  const tools = [
    {
      title: 'Skill Analysis',
      desc: 'Check your job readiness score and identify gaps.',
      icon: BrainCircuit,
      color: 'bg-emerald-500',
      path: '/skill-analysis',
      stats: '85% Scanned'
    },
    {
      title: 'Mentor Network',
      desc: 'Connect with experts from Google, Amazon & Meta.',
      icon: Users,
      color: 'bg-teal-500',
      path: '/mentors',
      stats: '380+ Experts'
    },
    {
      title: 'Mock Interview',
      desc: 'Practice with AI-powered resume-aware questions.',
      icon: MessageSquare,
      color: 'bg-slate-900',
      path: '/mock-interview',
      stats: 'AI Powered'
    },
    {
      title: 'Placements',
      desc: 'Access placement analytics and campus stats.',
      icon: Briefcase,
      color: 'bg-emerald-600',
      path: '/placements',
      stats: `${companiesData.length}+ Active`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* ─── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-screen z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black shadow-lg shadow-emerald-200">S</div>
          <span className="font-black text-slate-900 tracking-tighter text-xl">SkillBridge</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                item.active 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-10 pb-24">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-slate-400 font-medium italic">Welcome back, {profile?.name || 'Candidate'}!</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Search mentors, jobs..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-emerald-400 transition-colors w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-lg">
              {profile?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-emerald-500 p-6 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-emerald-500/20 group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <TrendingUp className="mb-4 opacity-80" size={24} />
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Job Readiness</p>
            <h3 className="text-3xl font-black">{profile?.score || 0}%</h3>
            <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-1000" style={{ width: `${profile?.score || 0}%` }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                <BrainCircuit size={20} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Updated Today</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Skills Detected</p>
              <h3 className="text-3xl font-black text-slate-900">{profile?.skills?.length || 0}</h3>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[32px] text-white flex flex-col justify-between shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400">
                <Target size={20} />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Skill Gaps</p>
              <h3 className="text-3xl font-black text-white">{profile?.gaps?.length || 0}</h3>
            </div>
          </div>
        </div>

        {/* Section Navigation Cards */}
        <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Quick Access Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tools.map((tool) => (
            <button
              key={tool.title}
              onClick={() => navigate(tool.path)}
              className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                <tool.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-4">{tool.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tool.stats}</span>
                <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={16} />
              </div>
            </button>
          ))}
        </div>

        {/* Top Matches Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Job Matches */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Job Matches</h3>
                <p className="text-xs font-medium text-slate-400 italic">Based on your extracted skills</p>
              </div>
              <button onClick={() => navigate('/placements')} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            
            {jobMatches.length > 0 ? (
              <div className="space-y-4">
                {jobMatches.map((job) => (
                  <div key={job.id} className="group flex items-center gap-4 p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-all cursor-pointer" onClick={() => navigate('/placements')}>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 border border-slate-100 group-hover:scale-110 transition-transform">
                      {job.logo ? (
                        <img src={job.logo} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 size={20} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 leading-tight">{job.role}</h4>
                      <p className="text-[11px] font-bold text-slate-500">{job.company}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${job.matchScore >= 70 ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {job.matchScore}%
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Match</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                 <p className="text-slate-400 font-bold text-sm">Upload resume to see matches</p>
              </div>
            )}
          </div>

          {/* Mentor Matches */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Mentor Matches</h3>
                <p className="text-xs font-medium text-slate-400 italic">Experts who can guide you</p>
              </div>
              <button onClick={() => navigate('/mentors')} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {mentorMatches.map((mentor) => (
                <div key={mentor.id} className="group flex items-center gap-4 p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl border border-slate-100 hover:border-emerald-100 transition-all cursor-pointer" onClick={() => navigate(`/mentors/${mentor.id}`)}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform overflow-hidden shadow-sm">
                    <img src={mentor.photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-slate-900 leading-tight">{mentor.name}</h4>
                    <p className="text-[11px] font-bold text-slate-500">{mentor.company}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-bold text-slate-700">{mentor.rating}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${(mentor.matchScore || 0) >= 70 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {mentor.matchScore || 0}%
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Match</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute -right-10 -bottom-10 p-10 opacity-10">
              <BarChart3 size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-black mb-4 leading-tight">Placement <br /> Analytics</h3>
              <p className="text-slate-400 text-sm font-medium mb-8">See how you rank against other candidates applying for similar roles.</p>
              <button 
                onClick={() => navigate('/placements')}
                className="w-full bg-white text-slate-900 font-black px-6 py-4 rounded-2xl shadow-xl hover:bg-emerald-500 hover:text-white transition-all text-sm flex items-center justify-center gap-2"
              >
                View Insights <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Active Roadmap</h3>
              <button onClick={() => navigate('/skill-analysis')} className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'Learn Advanced React Patterns', status: 'In Progress', progress: 45 },
                { title: 'System Design Fundamentals', status: 'Pending', progress: 0 },
                { title: 'Prepare Behavioral Answers', status: 'Pending', progress: 0 }
              ].map((step, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">{step.title}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{step.status}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all" style={{ width: `${step.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[40px] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap size={150} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-4 leading-tight">Ready for a Mock <br /> Interview?</h3>
              <p className="text-emerald-100 text-sm font-medium mb-8 max-w-xs">Our AI is ready to test you on your identified skill gaps. Practice makes perfect.</p>
              <button 
                onClick={() => navigate('/mock-interview')}
                className="bg-white text-emerald-600 font-black px-8 py-4 rounded-2xl shadow-xl hover:scale-105 transition-all text-sm"
              >
                Launch Mock Battle
              </button>
            </div>
            <div className="mt-8 flex items-center gap-3 relative z-10">
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                 <Award size={16} />
               </div>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em]">120+ Interview questions ready</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
