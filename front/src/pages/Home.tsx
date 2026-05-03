import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Users, Award, TrendingUp, CheckCircle, ChevronRight, Sparkles, BrainCircuit, Handshake, MessageSquare, BarChart3 } from 'lucide-react';
import { mentors } from '../data/mockData';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const stats = [
  { value: '12,400+', label: 'Students Placed' },
  { value: '94%', label: 'Success Rate' },
  { value: '380+', label: 'Expert Mentors' },
  { value: '200+', label: 'Partner Colleges' },
];

const features = [
  {
    icon: BrainCircuit,
    title: 'AI Skill Analysis',
    desc: 'Upload your resume or take a skill test. Get a detailed score with gap analysis and a personalised roadmap.',
    color: 'from-teal-500 to-emerald-400',
  },
  {
    icon: Handshake,
    title: 'Smart Mentor Match',
    desc: 'Get matched with industry mentors based on your skills, goals, and availability in seconds.',
    color: 'from-cyan-500 to-teal-400',
  },
  {
    icon: MessageSquare,
    title: 'Mock Interviews',
    desc: 'Practice with real interview questions, timed sessions, and structured feedback before the big day.',
    color: 'from-emerald-500 to-green-400',
  },
  {
    icon: BarChart3,
    title: 'College Dashboard',
    desc: 'Colleges get placement analytics, student progress tracking, and batch skill heatmaps.',
    color: 'from-teal-600 to-cyan-500',
  },
];

const testimonials = [
  {
    name: 'Riya Menon',
    role: 'SDE at Amazon',
    text: 'SeekOut\'s skill gap report was a wake-up call. In 6 weeks I went from rejected to offer letter.',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400',
    stars: 5,
  },
  {
    name: 'Karan Mehta',
    role: 'Data Analyst at Flipkart',
    text: 'The mentor sessions were incredibly focused. My mentor helped me nail the case study round.',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
    stars: 5,
  },
  {
    name: 'Ananya Iyer',
    role: 'ML Engineer at Razorpay',
    text: 'Mock interviews here are better than anywhere else. Real questions, real pressure, real growth.',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=400',
    stars: 5,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { handleLogin } = useGoogleAuth();

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/60 pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 shadow-sm">
            <Sparkles size={12} />
            AI-Powered Career Intelligence Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Bridge the Gap Between{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Skills</span>
            </span>{' '}
            &{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">Careers</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            SeekOut analyses your skills, matches you with expert mentors, and prepares you for interviews — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/skill-analysis')}
              className="group flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-teal-200/60 transition-all duration-200 text-sm"
            >
              Start Skill Analysis
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/mentors')}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-8 py-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 text-sm"
            >
              Explore Mentors
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Everything You Need</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Built for Modern Career Success</h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">From skill gaps to offer letters — SeekOut powers every step of your journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300 cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-teal-50/50 to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">From Zero to Job-Ready in 4 Steps</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Assess Your Skills', desc: 'Upload resume or take our adaptive skill test to get your baseline score.', icon: BrainCircuit },
              { num: '02', title: 'Get Your Roadmap', desc: 'Receive a personalised gap analysis with step-by-step learning path.', icon: TrendingUp },
              { num: '03', title: 'Connect with Mentor', desc: 'Book 1:1 sessions with industry experts matched to your goals.', icon: Users },
              { num: '04', title: 'Ace the Interview', desc: 'Practice in mock sessions, get feedback, and land your dream role.', icon: Award },
            ].map((step, i) => (
              <div key={step.num} className="relative">
                {i < 3 && <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-teal-200 to-transparent z-0" />}
                <div className="relative z-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all">
                  <div className="text-5xl font-extrabold text-teal-100 mb-3">{step.num}</div>
                  <step.icon size={24} className="text-teal-500 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12">
            <div>
              <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Top Mentors</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">Learn from the Best</h2>
            </div>
            <button onClick={() => navigate('/mentors')} className="mt-4 sm:mt-0 flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold text-sm transition-colors group">
              View All Mentors
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.slice(0, 3).map(mentor => (
              <div key={mentor.id} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-teal-200 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <img src={mentor.avatar} alt={mentor.name} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                  <div>
                    <h3 className="font-bold text-gray-900">{mentor.name}</h3>
                    <p className="text-xs text-gray-500">{mentor.role}</p>
                    <p className="text-xs text-teal-600 font-medium">{mentor.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    <Star size={13} fill="currentColor" />
                    <span className="font-semibold text-gray-700">{mentor.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400">{mentor.sessions} sessions</span>
                  <span className="ml-auto text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{mentor.domain}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {mentor.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/mentors')}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-teal-600 text-sm font-semibold uppercase tracking-widest">Success Stories</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-3">Students Who Made It</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-teal-600">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-teal-100 text-lg mb-8">Join 12,000+ students who used SeekOut to go from skill gaps to offer letters.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white text-teal-700 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all text-sm"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 border-2 border-white/50 text-white font-semibold px-8 py-4 rounded-xl hover:border-white transition-all text-sm"
            >
              View College Dashboard
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-teal-200 text-xs mt-5">
            <CheckCircle size={12} className="inline mr-1" />
            No credit card required. Free tier available.
          </p>
        </div>
      </section>
    </div>
  );
}
