import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, CheckCircle, ChevronRight, Sparkles, BrainCircuit, Handshake, MessageSquare, BarChart3, Zap, Shield, Target, Award } from 'lucide-react';
import { mentors } from '../data/mockData';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export default function Home() {
  const navigate = useNavigate();
  const { handleLogin } = useGoogleAuth();

  return (
    <div className="overflow-x-hidden bg-white selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ─── 3D HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[150px] animate-float-delayed" />
          
          {/* Floating 3D-ish Shapes */}
          <div className="absolute top-40 right-[15%] w-16 h-16 bg-white shadow-2xl rounded-2xl rotate-12 border border-emerald-50 flex items-center justify-center animate-float">
            <Zap className="text-emerald-500" size={24} />
          </div>
          <div className="absolute bottom-40 left-[10%] w-20 h-20 bg-white shadow-2xl rounded-3xl -rotate-12 border border-teal-50 flex items-center justify-center animate-float-delayed">
            <Shield className="text-teal-500" size={32} />
          </div>
          <div className="absolute top-1/2 left-[5%] w-12 h-12 bg-white shadow-xl rounded-full border border-slate-50 flex items-center justify-center animate-float">
            <Target className="text-slate-400" size={20} />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-left z-10 animate-slideInLeft">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8 shadow-sm">
              <Sparkles size={12} className="animate-pulse" />
              Next-Gen AI Career Ecosystem
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-8">
              UNLEASH YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400">
                POTENTIAL.
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed font-medium">
              SkillBridge uses proprietary AI to analyze your resume gaps, match you with top-tier mentors, and automate your journey to a dream job.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/skill-analysis')}
                className="group relative px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-200 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Start Analysis <ArrowRight size={18} />
                </span>
              </button>
              
              <button
                onClick={() => navigate('/mentors')}
                className="px-8 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-2xl font-bold hover:border-emerald-200 hover:bg-emerald-50/30 transition-all active:scale-95"
              >
                Find a Mentor
              </button>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img key={i} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                  12K+
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">Trusted by students from <span className="text-slate-900 font-bold">IIT, NIT & BITs</span></p>
            </div>
          </div>

          {/* Right 3D Visual */}
          <div className="relative perspective-1000 hidden lg:block animate-fadeIn">
            <div className="relative preserve-3d rotate-x-12 rotate-y-12 transition-transform duration-700 hover:rotate-0">
              
              {/* Main Card */}
              <div className="w-[450px] h-[550px] bg-white rounded-[40px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px]" />
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                    <BrainCircuit className="text-emerald-400" size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-lg">AI Diagnosis</h3>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Active Scanning</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Job Readiness', value: 78, color: 'bg-emerald-500' },
                    { label: 'Technical Depth', value: 62, color: 'bg-teal-500' },
                    { label: 'Market Match', value: 91, color: 'bg-slate-900' }
                  ].map(stat => (
                    <div key={stat.label}>
                      <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-tighter">
                        <span>{stat.label}</span>
                        <span>{stat.value}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Top Skill Gap Identified</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900 font-bold">JS</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Advanced React Patterns</p>
                      <p className="text-[10px] text-emerald-600 font-medium">+15% Salary Impact</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <div className="absolute -top-10 -right-10 w-48 bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50 translate-z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Award size={14} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-800">Mock Interview Passed</p>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div className="absolute bottom-10 -left-16 w-56 bg-slate-900 p-5 rounded-3xl shadow-2xl translate-z-40 animate-float-delayed">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Mentor matched</p>
                <div className="flex items-center gap-3">
                  <img className="w-8 h-8 rounded-lg object-cover" src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400" alt="mentor" />
                  <p className="text-xs font-bold text-white">Riya Menon, Amazon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ───────────────────────────────────────────────────── */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-6">ALL-IN-ONE <br /> PLACEMENT OS.</h2>
            <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: BrainCircuit, title: 'AI Diagnostics', desc: 'Scan your resume against 5,000+ job descriptions instantly.', color: 'emerald' },
              { icon: Handshake, title: 'Expert Pairing', desc: 'Get 1:1 mentorship from engineers at FAANG & top startups.', color: 'teal' },
              { icon: MessageSquare, title: 'Mock Battles', desc: 'Live interview practice with AI feedback and STAR coaching.', color: 'slate' },
              { icon: BarChart3, title: 'Growth Maps', desc: 'Visual step-by-step roadmaps to close your technical gaps.', color: 'emerald' }
            ].map((f, i) => (
              <div key={i} className="group bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className={`text-${f.color}-500`} size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (3D STEPS) ─────────────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
               <div className="w-full aspect-square bg-emerald-50 rounded-[60px] flex items-center justify-center overflow-hidden">
                 <div className="w-[80%] h-[80%] bg-white rounded-[40px] shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-10 animate-float">
                    <Zap className="text-emerald-500 mb-6" size={64} />
                    <h3 className="text-2xl font-black text-slate-900 text-center mb-4">Automation of <br /> Career Growth</h3>
                    <p className="text-slate-400 text-sm text-center">Our AI takes care of the research, so you can focus on the learning.</p>
                 </div>
               </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-[0.3em] mb-6 block">The Workflow</span>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-10 leading-tight">Master Your Career <br /> in 4 Simple Phases.</h2>
              
              <div className="space-y-8">
                {[
                  { n: '01', t: 'Resume Scan', d: 'AI identifies your missing keywords and skill gaps.' },
                  { n: '02', t: 'Live Roadmap', d: 'A dynamic 4-week plan generated just for you.' },
                  { n: '03', t: 'Expert Drill', d: '1:1 sessions and mock interviews with pros.' },
                  { n: '04', t: 'Placement', d: 'Apply with confidence and a 94% higher callback rate.' }
                ].map(s => (
                  <div key={s.n} className="flex gap-6 group">
                    <div className="text-2xl font-black text-slate-200 group-hover:text-emerald-500 transition-colors">{s.n}</div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{s.t}</h4>
                      <p className="text-sm text-slate-500 font-medium">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[50px] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-8">Ready to Level Up?</h2>
            <p className="text-slate-400 text-base mb-12 max-w-xl mx-auto">Join the next generation of engineers building their careers with AI intelligence.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate('/skill-analysis')} className="px-10 py-5 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                Start My Analysis
              </button>
              <button onClick={() => navigate('/auth')} className="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95">
                Join the Platform
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-medium">© 2026 SkillBridge AI Platform. Built for Excellence.</p>
          <div className="flex gap-8">
            {['Twitter', 'LinkedIn', 'Github'].map(l => (
              <a key={l} href="#" className="text-slate-400 hover:text-emerald-500 text-xs font-bold transition-colors uppercase tracking-widest">{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
