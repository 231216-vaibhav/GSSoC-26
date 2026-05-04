import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, Clock, Briefcase, ChevronRight, Sparkles, TrendingUp, ShieldCheck, Zap, GraduationCap, CheckCircle } from 'lucide-react';
import mentorsDataRaw from '../data/mentors.json';
import { Mentor, matchMentors } from '../utils/mentorMatching';

const mentorsData = Array.isArray(mentorsDataRaw) ? mentorsDataRaw : ((mentorsDataRaw as any).default || []);

export default function MentorsMarketplace() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Best Match');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const saved = localStorage.getItem('parsedResume');
      let currentSkills: string[] = [];
      let currentRole = '';
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          currentSkills = (parsed.skills || []).map((s: any) => s.name);
          currentRole = parsed.role || '';
          setUserSkills(currentSkills);
        } catch (e) {}
      }
      
      const matched = matchMentors(currentSkills, currentRole, mentorsData as Mentor[]);
      setMentors(matched);
      setLoading(false);
    }, 1000);
  }, []);

  const filters = ['All', 'FAANG', 'Startup', 'Data Science', 'Frontend', 'Product'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesFilter = activeFilter === 'All' || 
      (activeFilter === 'FAANG' && ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple', 'Uber'].includes(mentor.company)) ||
      (activeFilter === 'Startup' && ['Razorpay', 'CRED', 'Swiggy', 'Zomato', 'PhonePe'].includes(mentor.company)) ||
      (activeFilter === 'Data Science' && mentor.domain.includes('Data Science')) ||
      (activeFilter === 'Frontend' && mentor.domain.includes('Frontend')) ||
      (activeFilter === 'Product' && mentor.domain.includes('Product'));

    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'Best Match') return (b.matchScore || 0) - (a.matchScore || 0);
    if (sortBy === 'Rating') return b.rating - a.rating;
    if (sortBy === 'Price') return (a.lowest_session_price || 0) - (b.lowest_session_price || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      
      {/* 🛠️ TRUST BANNER */}
      <div className="bg-emerald-50 border-y border-emerald-100 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
          <div className="hidden md:flex items-center gap-12 text-[11px] font-black text-emerald-800 uppercase tracking-[0.1em]">
            <span className="flex items-center gap-2">🎁 All mentors offer First Session Free</span>
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
            <span className="flex items-center gap-2">✅ Verified Industry Professionals</span>
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
            <span className="flex items-center gap-2">🎓 IIT / NIT / IIM Alumni Network</span>
          </div>
          {/* Mobile Marquee */}
          <div className="md:hidden flex whitespace-nowrap animate-marquee">
            <span className="mx-4 text-[10px] font-black text-emerald-800 uppercase">🎁 All mentors offer First Session Free • ✅ Verified Industry Professionals • 🎓 IIT / NIT / IIM Alumni Network</span>
            <span className="mx-4 text-[10px] font-black text-emerald-800 uppercase">🎁 All mentors offer First Session Free • ✅ Verified Industry Professionals • 🎓 IIT / NIT / IIM Alumni Network</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">
            Industry <span className="text-emerald-500">Mentors</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium italic">
            Book a <span className="text-emerald-600 font-bold">FREE 1:1 Intro Session</span> with experts who've been where you want to be.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, company, or skill..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-700 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    activeFilter === f 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort By</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option>Best Match</option>
                <option>Rating</option>
                <option>Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mentor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => <MentorSkeleton key={i} />)
          ) : (
            filteredMentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} onClick={() => navigate(`/mentors/${mentor.id}`)} onBook={() => navigate(`/mentors/${mentor.id}/book`)} />
            ))
          )}
        </div>

        {!loading && filteredMentors.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No mentors found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
      `}} />
    </div>
  );
}

function MentorCard({ mentor, onClick, onBook }: { mentor: Mentor; onClick: () => void; onBook: () => void }) {
  const matchColor = (mentor.matchScore || 0) > 70 ? 'text-emerald-500 bg-emerald-50' : (mentor.matchScore || 0) > 50 ? 'text-amber-500 bg-amber-50' : 'text-orange-500 bg-orange-50';
  const tierColor = mentor.tier === 'Expert' ? 'border-l-4 border-amber-400 shadow-amber-100/50' : mentor.tier === 'Pro' ? 'border-l-4 border-blue-400 shadow-blue-100/50' : '';

  const trustSignals = [
    "✅ Verified via LinkedIn",
    "🕐 Usually responds in 2 hrs",
    "🚀 Top rated by mentees"
  ];
  const randomSignal = trustSignals[mentor.id % trustSignals.length];

  return (
    <div className="flex flex-col">
      {mentor.first_session_free && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-t-[20px] text-center shadow-lg">
          🎁 First Session Free — Limited Slots
        </div>
      )}
      <div 
        className={`group bg-white ${mentor.first_session_free ? 'rounded-b-[32px]' : 'rounded-[32px]'} overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-emerald-200/20 transition-all duration-500 cursor-pointer flex flex-col ${tierColor} shadow-sm`}
        onClick={onClick}
      >
        <div className="p-6 flex-1">
          {/* Top: Photo & Info */}
          <div className="flex gap-4 mb-6">
            <div className="relative shrink-0">
              <img src={mentor.photo} alt={mentor.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <div className="bg-emerald-500 w-2.5 h-2.5 rounded-full border-2 border-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-black text-slate-900 group-hover:text-emerald-600 transition-colors truncate">{mentor.name}</h3>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-lg shrink-0">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-black text-slate-700">{mentor.rating}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-bold truncate">
                {mentor.current_role} @ <span className="text-slate-900">{mentor.company}</span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${mentor.tier === 'Expert' ? 'bg-amber-100 text-amber-700' : mentor.tier === 'Pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {mentor.tier}
                </span>
                {mentor.alumni_badge && (
                  <span className="bg-slate-100 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <GraduationCap size={10} /> {mentor.alumni_badge}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {mentor.skills.slice(0, 3).map(skill => (
              <span key={skill} className="px-2.5 py-1 bg-white text-slate-500 text-[9px] font-bold rounded-lg border border-slate-100">
                {skill}
              </span>
            ))}
            {mentor.skills.length > 3 && (
              <span className="text-slate-300 text-[9px] font-bold py-1">+{mentor.skills.length - 3} more</span>
            )}
          </div>

          {/* Pricing & Trust Signals */}
          <div className="mb-6 flex justify-between items-end">
            <div>
              {mentor.first_session_free ? (
                <div className="flex flex-col">
                  <span className="text-emerald-600 font-black text-sm flex items-center gap-1">
                    🎁 1st Session FREE
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">then from ₹{mentor.lowest_session_price}</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Sessions from</span>
                  <span className="text-lg font-black text-slate-900">₹{mentor.lowest_session_price}</span>
                </div>
              )}
            </div>
            
            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 ${matchColor.replace('bg-', 'border-').split(' ')[1]} ${matchColor.split(' ')[0]} font-black text-xs`}>
              {mentor.matchScore || 0}% Match
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 italic">
            <CheckCircle size={10} className="text-emerald-500" />
            {randomSignal}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="flex-1 py-3 text-xs font-black text-slate-600 hover:text-slate-900 transition-all bg-white rounded-xl border border-slate-200"
          >
            Profile
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onBook(); }}
            className="flex-[2] py-3 text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            {mentor.first_session_free ? 'Book Free Session' : 'Book Session'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MentorSkeleton() {
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 p-6 flex flex-col h-[400px] animate-pulse">
      <div className="flex gap-4 mb-6">
        <div className="w-16 h-16 bg-slate-100 rounded-full" />
        <div className="flex-1 space-y-2 pt-2">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-8 pt-4">
        <div className="h-6 bg-slate-100 rounded w-16" />
        <div className="h-6 bg-slate-100 rounded w-16" />
        <div className="h-6 bg-slate-100 rounded w-16" />
      </div>
      <div className="mt-auto h-8 bg-slate-50 rounded-xl mb-6" />
      <div className="flex gap-3">
        <div className="h-12 bg-slate-100 rounded-xl flex-1" />
        <div className="h-12 bg-slate-100 rounded-xl flex-[2]" />
      </div>
    </div>
  );
}
