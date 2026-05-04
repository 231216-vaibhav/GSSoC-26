import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Zap, Sparkles, User, LogOut } from 'lucide-react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogin, user } = useGoogleAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Skill Analysis', path: '/skill-analysis' },
    { label: 'Mentors', path: '/mentors' },
    { label: 'Mock Interview', path: '/mock-interview' },
    { label: 'Profile', path: '/user-profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 flex justify-center py-4 ${
      scrolled ? 'px-4' : 'px-2'
    }`}>
      <div className={`max-w-7xl w-full mx-auto px-6 h-16 flex items-center justify-between transition-all duration-500 ${
        scrolled 
        ? 'bg-white/90 backdrop-blur-xl border border-white/20 shadow-lg rounded-[24px]' 
        : 'bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-sm rounded-[20px]'
      }`}>
        
        {/* Brand */}
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Zap size={20} className="text-emerald-400 fill-emerald-400" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-black text-xl text-slate-900 tracking-tighter leading-none">SkillBridge</span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mt-1 flex items-center gap-1">
              <Sparkles size={8} /> AI Powered
            </span>
          </div>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => { navigate(link.path); setOpen(false); }}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all relative group ${
                isActive(link.path) 
                ? 'text-emerald-600 bg-emerald-50/50' 
                : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {link.label}
              {!isActive(link.path) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-emerald-500 group-hover:w-4 transition-all duration-300 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="px-3 hidden lg:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                <p className="text-xs font-bold text-slate-900 leading-none">{user.displayName?.split(' ')[0]}</p>
              </div>
              <img src={user.photoURL || ''} alt="User" className="w-9 h-9 rounded-xl border-2 border-white shadow-sm" />
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-9 h-9 flex items-center justify-center bg-white rounded-xl text-slate-400 hover:text-emerald-500 hover:shadow-md transition-all border border-slate-100"
              >
                <User size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/auth')}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={handleLogin}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-emerald-200/50 hover:bg-emerald-600 transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setOpen(!open)} 
          className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-500 transition-all"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="absolute top-24 left-4 right-4 bg-white/95 backdrop-blur-2xl rounded-[32px] border border-slate-100 shadow-2xl p-6 md:hidden animate-slideUp overflow-hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => { navigate(link.path); setOpen(false); }}
                className={`w-full text-left px-5 py-4 rounded-2xl text-base font-bold transition-all ${
                  isActive(link.path) 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                  : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
              {user ? (
                <button 
                  onClick={() => { navigate('/dashboard'); setOpen(false); }}
                  className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white rounded-2xl font-bold"
                >
                  My Dashboard
                  <User size={18} />
                </button>
              ) : (
                <button
                  onClick={() => { handleLogin(); setOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold"
                >
                  Get Started Free <Sparkles size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
