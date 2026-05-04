import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Globe, Linkedin, CheckCircle2, ChevronLeft, Calendar, MessageSquare, Briefcase, Zap, ShieldCheck, GraduationCap, Award, TrendingUp } from 'lucide-react';
import mentorsData from '../data/mentors.json';
import { Mentor } from '../utils/mentorMatching';

export default function MentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mentor, setMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    const found = (mentorsData as Mentor[]).find(m => m.id === Number(id));
    if (found) setMentor(found);
  }, [id]);

  if (!mentor) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/mentors')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={18} /> Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header Card */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
              
              <div className="flex flex-col md:flex-row gap-10 items-start relative">
                <div className="relative shrink-0">
                  <img 
                    src={mentor.photo} 
                    alt={mentor.name} 
                    className="w-40 h-40 rounded-[40px] object-cover border-8 border-white shadow-2xl" 
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-50">
                    <div className="bg-emerald-500 text-white p-1.5 rounded-xl">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{mentor.name}</h1>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${mentor.tier === 'Expert' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {mentor.tier} Mentor
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <p className="text-xl text-slate-500 font-bold">
                      {mentor.current_role} @ <span className="text-slate-900">{mentor.company}</span>
                    </p>
                    {mentor.alumni_badge && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">
                        <GraduationCap size={16} /> {mentor.alumni_badge} {mentor.batch && `(${mentor.batch})`}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <Stat icon={Star} label="Average Rating" value={`${mentor.rating}/5.0`} color="text-amber-500" />
                    <Stat icon={Briefcase} label="Industry Exp" value={`${mentor.experience_years} Years`} color="text-emerald-500" />
                    <Stat icon={MessageSquare} label="Total Sessions" value={`${mentor.total_sessions}+`} color="text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex flex-wrap items-center justify-between gap-6">
                <div className="flex gap-4">
                  <a 
                    href={mentor.linkedin} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-8 py-4 bg-[#0077b5] text-white rounded-[20px] font-black text-sm hover:shadow-xl hover:shadow-blue-200 transition-all hover:-translate-y-1"
                  >
                    <Linkedin size={20} /> Verified LinkedIn
                  </a>
                  <button className="p-4 bg-slate-50 text-slate-400 rounded-[20px] border border-slate-100 hover:bg-white hover:text-emerald-500 transition-all">
                    <Globe size={24} />
                  </button>
                </div>
                <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
                  <TrendingUp className="text-emerald-500" size={18} />
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Usually responds in 2 hours</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Award size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Mentor Bio & Expertise</h2>
              </div>
              
              <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium italic">
                "{mentor.bio}"
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Skills & Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.skills.map(skill => (
                      <span key={skill} className="px-5 py-2.5 bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Domain Speciality</h3>
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100 font-black text-sm">
                    <Zap size={18} fill="currentColor" /> {mentor.speciality}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/30 border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Calendar size={24} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Weekly Availability</h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                  const isAvailable = mentor.availability.includes(day);
                  return (
                    <div key={day} className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${isAvailable ? 'bg-emerald-50 border-emerald-100 scale-105 shadow-lg shadow-emerald-500/5' : 'bg-slate-50 border-slate-50 opacity-40'}`}>
                      <span className={`text-xs font-black uppercase tracking-widest mb-3 ${isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>{day}</span>
                      {isAvailable ? (
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <CheckCircle2 size={16} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-white">
                          <Clock size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-8 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                All times are in Indian Standard Time (IST)
              </p>
            </div>

            {/* Reviews */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight">
                <Star className="text-amber-500" fill="currentColor" /> What students say
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: "Rahul S.", role: "Final Year, NIT Trichy", text: "Incredible insight into the FAANG hiring process. The mock interview felt so real!" },
                  { name: "Ananya M.", role: "Associate SDE", text: "Helped me transition from a startup to a big tech role. Truly grateful for the guidance." },
                  { name: "Karthik P.", role: "Data Science Aspirant", text: "Very patient and clear. Simplified complex system design concepts in just 30 mins." },
                  { name: "Sneha K.", role: "Frontend Dev", text: "The resume review session was a game changer. Got 3 interview calls in a week after the changes!" }
                ].map((review, i) => (
                  <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-lg shadow-slate-200/20">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 font-black">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{review.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{review.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} size={10} className="text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-500 font-medium italic leading-relaxed">
                      "{review.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-[48px] p-8 shadow-2xl shadow-emerald-200/20 border border-slate-100 sticky top-28">
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Available Sessions</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-black text-slate-900">₹{mentor.lowest_session_price}</span>
                  <span className="text-slate-400 font-bold text-sm">starting from</span>
                </div>
              </div>

              <div className="space-y-3 mb-10">
                {mentor.session_types.map(type => (
                  <div 
                    key={type.name} 
                    className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group relative overflow-hidden ${type.is_free ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-50 hover:border-emerald-200'}`}
                  >
                    {type.is_free && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                        FREE INTRO
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-800 group-hover:text-emerald-600 leading-tight">{type.name}</h4>
                      {type.is_free ? (
                        <span className="text-xs font-black text-emerald-600 uppercase">FREE</span>
                      ) : (
                        <span className="text-sm font-black text-slate-900">₹{type.price}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-wider">
                      <Clock size={12} /> {type.duration} Mins
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => navigate(`/mentors/${mentor.id}/book`)}
                className="w-full py-5 bg-emerald-500 text-white font-black rounded-[24px] shadow-2xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                Book a Session <Zap size={20} fill="currentColor" />
              </button>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <ShieldCheck className="text-emerald-500" size={18} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">100% Satisfaction Guarantee</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest leading-relaxed">
                  Join 10,000+ students who accelerated their career with SkillBridge Mentors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center ${color} shadow-sm border border-slate-100`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-base font-black text-slate-900 leading-none">{value}</p>
      </div>
    </div>
  );
}
