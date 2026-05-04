import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Briefcase, Globe, Linkedin, CheckCircle2, ChevronRight, User, Star, Zap, Sparkles } from 'lucide-react';

export default function BecomeMentor() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    experience: '1-3 Years',
    domain: 'Software Engineering',
    skills: '',
    linkedin: '',
    price: '',
    bio: '',
    availability: [] as string[]
  });

  const domains = ['Software Engineering', 'Data Science', 'Product Management', 'Design', 'Marketing', 'Finance'];
  const experienceOptions = ['1-3 Years', '3-5 Years', '5-8 Years', '8-12 Years', '12+ Years'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl shadow-emerald-200/50 border border-slate-100 text-center animate-fadeIn">
          <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200">
            <CheckCircle2 size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Application Received!</h1>
          <p className="text-slate-500 mb-8 font-medium">
            We've received your application to become a mentor. Our team will review your profile and contact you within <span className="text-emerald-600 font-bold">48 hours</span>. ✅
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100">
            <Sparkles size={14} /> Join the Expert Network
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Become a <span className="text-emerald-500">SkillBridge Mentor</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium">
            Share your knowledge, help students grow, and earn while building the next generation of tech talent.
          </p>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={14} className="text-emerald-500" /> Basic Information
                </h3>
                
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Company</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                      placeholder="e.g. Google"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Role</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                      placeholder="e.g. Senior SDE"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Experience</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                      value={formData.experience}
                      onChange={e => setFormData({...formData, experience: e.target.value})}
                    >
                      {experienceOptions.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">LinkedIn URL</label>
                    <input 
                      required
                      type="url" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedin}
                      onChange={e => setFormData({...formData, linkedin: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Expertise & Pricing */}
              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Zap size={14} className="text-emerald-500" /> Expertise & Pricing
                </h3>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Primary Domain</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                    value={formData.domain}
                    onChange={e => setFormData({...formData, domain: e.target.value})}
                  >
                    {domains.map(dom => <option key={dom}>{dom}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Skills (Comma separated)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    placeholder="React, Node.js, System Design..."
                    value={formData.skills}
                    onChange={e => setFormData({...formData, skills: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Price per Hour (₹)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    placeholder="e.g. 2000"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Availability & Bio */}
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Weekly Availability</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <button
                      type="button"
                      key={day}
                      onClick={() => {
                        const newDays = formData.availability.includes(day) 
                          ? formData.availability.filter(d => d !== day)
                          : [...formData.availability, day];
                        setFormData({...formData, availability: newDays});
                      }}
                      className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${formData.availability.includes(day) ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Short Bio (Max 200 chars)</label>
                <textarea 
                  required
                  maxLength={200}
                  className="w-full h-32 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium resize-none"
                  placeholder="Tell us about your background and how you can help students..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
                <p className="text-[10px] text-slate-400 text-right mt-1 font-bold">{formData.bio.length}/200</p>
              </div>

              <div className="bg-emerald-50 rounded-3xl p-6 flex items-center gap-4 border border-emerald-100">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <p className="text-sm text-emerald-700 font-medium">
                  We verify all mentors to ensure high-quality guidance for our students. Your profile will be marked with a <span className="font-bold">Verified Badge</span> once approved.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-emerald-500 text-white font-black rounded-[24px] shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Submit Application <ChevronRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
