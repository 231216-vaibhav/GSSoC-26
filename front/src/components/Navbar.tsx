import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
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

  const goHome = (section?: string) => {
    setOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      if (section) {
        setTimeout(() => {
          document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else if (section) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Home', action: () => goHome() },
    { label: 'Skill Analysis', action: () => { setOpen(false); navigate('/skill-analysis'); } },
    { label: 'Mentors', action: () => { setOpen(false); navigate('/mentors'); } },
    { label: 'Mock Interview', action: () => { setOpen(false); navigate('/mock-interview'); } },
    { label: 'For Colleges', action: () => { setOpen(false); navigate('/dashboard'); } },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => goHome()} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-teal-200 transition-shadow">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Seek<span className="text-teal-500">Out</span></span>
          </button>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-teal-500 group-hover:w-full transition-all duration-200" />
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full" />
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors px-4 py-2 rounded-lg hover:bg-teal-50"
                >
                  Log In
                </Link>
                <button
                  onClick={handleLogin}
                  className="text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 px-5 py-2 rounded-lg shadow-md hover:shadow-teal-200 transition-all duration-200"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={link.action}
                className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
              {user ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                </div>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg text-center transition-colors">
                    Log In
                  </Link>
                  <button onClick={() => { setOpen(false); handleLogin(); }} className="px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg text-center w-full">
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
