import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Filter, 
  ChevronRight, 
  Zap, 
  Building2,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  LayoutDashboard,
  ExternalLink
} from 'lucide-react';
import { companiesData } from '../data/companies';
import { calculateJobMatches, MatchResult } from '../utils/matchingEngine';

export default function Placements() {
  const [profile, setProfile] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('Match %');
  const [selectedJob, setSelectedJob] = useState<MatchResult | null>(null);
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApplyNow = (job: MatchResult) => {
    const url = job.apply_url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.role + ' ' + job.company)}`;
    console.log(`User applied to ${job.company} for ${job.role}`);
    showToast(`Redirecting to ${job.company} careers page...`);
    setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 600);
  };

  const handleStartLearning = (job: MatchResult) => {
    const skills = job.missingSkills.slice(0, 5).join(',');
    navigate(`/skill-test?skills=${encodeURIComponent(skills)}&company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.role)}`);
    setIsGapModalOpen(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('parsedResume');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const allMatches = useMemo(() => {
    const userSkills = profile?.skills || [];
    const experience = profile?.experience_years || 0;
    return calculateJobMatches(userSkills, companiesData, experience);
  }, [profile]);

  const filteredMatches = useMemo(() => {
    let result = allMatches.filter(job => {
      const matchesSearch = job.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           job.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || job.type === filterType;
      return matchesSearch && matchesType;
    });

    if (sortBy === 'Match %') result = [...result].sort((a, b) => b.matchScore - a.matchScore);
    if (sortBy === 'Salary') result = [...result].sort((a, b) => {
      const getVal = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0;
      return getVal(b.salary) - getVal(a.salary);
    });
    if (sortBy === 'Company') result = [...result].sort((a, b) => a.company.localeCompare(b.company));

    return result;
  }, [allMatches, searchQuery, filterType, sortBy]);

  const stats = useMemo(() => {
    return {
      total: allMatches.length,
      strong: allMatches.filter(m => m.matchLevel === 'Strong Match').length,
      good: allMatches.filter(m => m.matchLevel === 'Good Match').length
    };
  }, [allMatches]);




  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Briefcase size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">No Resume Found</h2>
        <p className="text-slate-500 max-w-md mb-8 font-medium">Please upload your resume in the Skill Analysis section to unlock personalized job matching and placement opportunities.</p>
        <button 
          onClick={() => window.location.href = '/skill-analysis'}
          className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-500 transition-all flex items-center gap-3"
        >
          <Zap size={20} /> Analyze My Resume
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* ─── HEADER & STATS ─────────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 shadow-sm">
                <Trophy size={12} className="animate-bounce" />
                Your Job Matching Engine
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4">
                HELLO, <span className="text-emerald-500 uppercase">{profile.name?.split(' ')[0] || 'DEVELOPER'}!</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-xl">
                Based on your <span className="text-emerald-600 font-bold">{profile.skills?.length || 0} skills</span>, we found <span className="text-emerald-600 font-bold">{stats.total} matching opportunities</span>.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
              {[
                { label: 'Total Matches', value: stats.total, color: 'text-slate-900' },
                { label: 'Strong Matches', value: stats.strong, color: 'text-emerald-500' },
                { label: 'Good Matches', value: stats.good, color: 'text-blue-500' }
              ].map((s, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search by company or role..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-400 w-full transition-all" 
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {['All', 'Full Time', 'Internship', 'Remote'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    filterType === type 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105' 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
              {['Match %', 'Salary', 'Company'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    sortBy === s ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── JOB GRID ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.length > 0 ? filteredMatches.map((job) => (
            <div key={job.id} className="group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              {/* Match Indicator */}
              <div className="absolute top-0 right-0 mt-6 mr-6 flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-black transition-all ${
                  job.matchScore >= 70 ? 'border-emerald-500 text-emerald-600' : 
                  job.matchScore >= 50 ? 'border-blue-500 text-blue-600' : 'border-orange-500 text-orange-600'
                }`}>
                  {job.matchScore}%
                </div>
                <span className={`text-[9px] font-black uppercase mt-2 ${
                  job.matchScore >= 70 ? 'text-emerald-500' : 
                  job.matchScore >= 50 ? 'text-blue-500' : 'text-orange-500'
                }`}>
                  {job.matchLevel}
                </span>
              </div>

              <div className="flex items-start gap-6 mb-8">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center p-4 border border-slate-100 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 size={32} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors">{job.role}</h3>
                  <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 italic text-sm">
                    {job.company} • {job.location}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold">
                  <Zap size={14} className="text-emerald-500" /> {job.salary}
                </div>
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold">
                  <Briefcase size={14} className="text-emerald-500" /> {job.type}
                </div>
              </div>

              {/* Skills matching visualization */}
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Skill Alignment</p>
                <div className="flex flex-wrap gap-2">
                  {job.matchingSkills.map(skill => (
                    <span key={skill} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 border border-emerald-100">
                      <CheckCircle2 size={10} /> {skill}
                    </span>
                  ))}
                  {job.missingSkills.map(skill => (
                    <span key={skill} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 border border-red-100 opacity-60">
                      <XCircle size={10} /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApplyNow(job)}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                >
                  APPLY NOW <ExternalLink size={13} className="opacity-70" />
                </button>
                <button 
                  onClick={() => { setSelectedJob(job); setIsGapModalOpen(true); }}
                  className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs hover:border-emerald-200 hover:text-emerald-600 transition-all shadow-sm"
                >
                  VIEW GAP
                </button>
              </div>

              {/* Mentor Connection Link */}
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-center">
                <button 
                  onClick={() => navigate(`/mentors?domain=${encodeURIComponent(job.role.includes('Frontend') ? 'Frontend' : job.role.includes('Data') ? 'Data Science' : 'Software Engineering')}`)}
                  className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 uppercase tracking-widest group"
                >
                  Talk to a {job.role.includes('Frontend') ? 'Frontend' : job.role.includes('Data') ? 'Data Science' : 'Software'} Mentor <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )) : (
            <div className="lg:col-span-2 bg-white p-20 rounded-[40px] border border-slate-100 text-center">
              <p className="text-slate-400 font-bold text-lg">No matches found for your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── TOAST NOTIFICATION ─────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[200] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm font-bold">{toast}</span>
          <ExternalLink size={14} className="text-emerald-400" />
        </div>
      )}

      {/* ─── SKILL GAP MODAL ────────────────────────────────────────────── */}
      {isGapModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[48px] p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsGapModalOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <XCircle size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100">
                <img src={selectedJob.logo} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Skill Analysis</h2>
                <p className="text-slate-500 font-bold italic">{selectedJob.company} — {selectedJob.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Skills You Have
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.matchingSkills.map(s => (
                    <span key={s} className="bg-white text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm">{s}</span>
                  ))}
                  {selectedJob.matchingSkills.length === 0 && <p className="text-xs text-emerald-400 italic">None matched yet</p>}
                </div>
              </div>
              <div className="bg-red-50 p-6 rounded-[32px] border border-red-100">
                <h4 className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <XCircle size={14} /> Skills Needed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.missingSkills.map(s => (
                    <span key={s} className="bg-white text-red-600 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm">{s}</span>
                  ))}
                  {selectedJob.missingSkills.length === 0 && <p className="text-xs text-red-400 italic">You're fully qualified!</p>}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 mb-10">
              <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">AI Recommendation</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                To maximize your chances at <span className="text-emerald-600 font-bold">{selectedJob.company}</span>, we recommend focusing on <span className="text-red-500 font-bold">{selectedJob.missingSkills[0] || 'advanced projects'}</span> first. 
                Our AI Mentor can generate a custom roadmap to close these gaps in under 2 weeks.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setIsGapModalOpen(false)}
                className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-3xl font-black text-xs hover:bg-slate-200 transition-all"
              >
                CLOSE
              </button>
              <button 
                onClick={() => handleStartLearning(selectedJob)}
                className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black text-xs hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-3 group"
              >
                START LEARNING <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
