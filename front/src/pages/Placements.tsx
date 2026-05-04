import { useState, useEffect } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Search, 
  Filter, 
  ChevronRight, 
  Zap, 
  Star,
  Clock,
  Building2,
  Trophy
} from 'lucide-react';

export default function Placements() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('parsedResume');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  const jobs = [
    {
      id: 1,
      company: 'Google',
      role: 'Full Stack Engineer',
      location: 'Bangalore, India',
      package: '45-60 LPA',
      match: 92,
      deadline: '2 days left',
      logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png',
      type: 'Dream Company'
    },
    {
      id: 2,
      company: 'Razorpay',
      role: 'Frontend Architect',
      location: 'Remote / Bangalore',
      package: '32-48 LPA',
      match: 85,
      deadline: '5 days left',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Razorpay_logo.svg/1200px-Razorpay_logo.svg.png',
      type: 'High Match'
    },
    {
      id: 3,
      company: 'Amazon',
      role: 'SDE-2 (Cloud)',
      location: 'Hyderabad, India',
      package: '35-55 LPA',
      match: 78,
      deadline: '7 days left',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png',
      type: 'Opportunity'
    },
    {
      id: 4,
      company: 'Flipkart',
      role: 'Mobile App Developer',
      location: 'Bangalore, India',
      package: '28-40 LPA',
      match: 94,
      deadline: 'Tomorrow',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flipkart_logo.svg/1024px-Flipkart_logo.svg.png',
      type: 'Best Fit'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Microsoft Off-Campus Drive',
      date: 'May 15, 2026',
      type: 'Recruitment',
      attendees: '1.2k attending'
    },
    {
      id: 2,
      title: 'Zomato Hackathon 2026',
      date: 'May 22, 2026',
      type: 'Hackathon',
      attendees: '3k registered'
    },
    {
      id: 3,
      title: 'Infosys Power Programmer Test',
      date: 'June 01, 2026',
      type: 'Coding Test',
      attendees: '5k applied'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4 shadow-sm">
              <Trophy size={12} className="animate-bounce" />
              Live Placement Portal
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4">YOUR NEXT BIG <br /> <span className="text-emerald-500">OPPORTUNITY.</span></h1>
            <p className="text-slate-500 font-medium max-w-lg">AI-filtered jobs and events tailored to your skills and job readiness score.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input type="text" placeholder="Search roles..." className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs outline-none focus:border-emerald-400 w-full" />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* ─── JOB FEED (Left & Center) ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Recruitments</h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{jobs.length} Positions found</span>
            </div>

            {jobs.map((job) => (
              <div key={job.id} className="group bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-3 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                  <Building2 size={32} className="text-slate-300" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{job.type}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Clock size={10} /> {job.deadline}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{job.role}</h3>
                  <p className="text-sm font-bold text-slate-500 mb-4">{job.company}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Zap size={14} className="text-emerald-500" />
                      <span className="text-xs font-bold">{job.package}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">AI Match</p>
                    <div className={`text-2xl font-black ${job.match >= 90 ? 'text-emerald-500' : 'text-teal-500'}`}>{job.match}%</div>
                  </div>
                  <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}

            <button className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-bold text-sm hover:border-emerald-300 hover:text-emerald-500 transition-all">
              Load more opportunities...
            </button>
          </div>

          {/* ─── EVENTS & STATS (Right) ──────────────────────────────────────── */}
          <div className="space-y-8">
            
            {/* User Readiness Card */}
            <div className="bg-slate-900 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                <Star size={120} />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] mb-4">Your Profile Strength</p>
                <div className="flex items-end gap-2 mb-6">
                  <h3 className="text-6xl font-black">{profile?.score || 0}</h3>
                  <span className="text-xl font-bold text-white/40 mb-2">/100</span>
                </div>
                <p className="text-xs text-white/50 font-medium leading-relaxed mb-8">You are eligible for <span className="text-white font-bold">120+ Dream Companies</span> based on your current score.</p>
                <button 
                  onClick={() => window.location.href = '/skill-analysis'}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all"
                >
                  Boost My Score
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                <Calendar size={18} className="text-emerald-500" /> Upcoming Events
              </h3>
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="group cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{event.type}</span>
                      <span className="text-[10px] font-bold text-slate-300">{event.attendees}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mb-1">{event.title}</h4>
                    <p className="text-[11px] text-slate-400 font-medium">{event.date}</p>
                    {event.id !== events.length && <div className="h-px bg-slate-50 w-full mt-4" />}
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                View Event Calendar
              </button>
            </div>

            {/* Featured Recruiter Card */}
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-8 rounded-[40px] text-white flex flex-col items-center text-center shadow-xl">
               <TrendingUp size={40} className="mb-4 text-white/80" />
               <h4 className="font-black text-xl mb-2">Hiring Surge!</h4>
               <p className="text-xs text-white/70 font-medium mb-6">Fintech companies are currently hiring 30% more candidates with your stack.</p>
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" />
                  ))}
               </div>
               <p className="text-[9px] font-bold uppercase tracking-widest mt-4 text-white/50">12 Friends applied recently</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
