import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const perks = [
  'Free skill analysis & gap report',
  'Access to 380+ industry mentors',
  'Mock interview with AI feedback',
  'Personalised career roadmap',
];

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [isSignup, setIsSignup] = useState(params.get('signup') === 'true');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;
      
      const userRef = doc(db, 'users', loggedInUser.uid);
      const userSnap = await getDoc(userRef);
      
      // Update/Create User Document
      await setDoc(userRef, {
        uid: loggedInUser.uid,
        name: loggedInUser.displayName,
        email: loggedInUser.email,
        profilePicture: loggedInUser.photoURL,
        lastLogin: serverTimestamp(),
      }, { merge: true });
      
      // Log Auth Activity
      await addDoc(collection(db, 'auth_logs'), {
        uid: loggedInUser.uid,
        email: loggedInUser.email,
        action: 'login_google',
        timestamp: serverTimestamp()
      });

      setDone(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (error: any) {
      console.error("Error during login:", error);
      setErrors({ google: error.message });
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (isSignup && !form.name.trim()) e.name = 'Name is required';
    if (!form.email.includes('@')) e.email = 'Enter a valid email';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 1800);
    }, 1400);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <CheckCircle size={36} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{isSignup ? 'Account Created!' : 'Welcome Back!'}</h2>
          <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
          <div className="mt-4 w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full animate-[progress_1.8s_linear_forwards]" style={{ animation: 'width 1.8s linear forwards' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-emerald-600 p-12 flex-col justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-2xl text-white">SeekOut</span>
        </Link>

        <div>
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Your career journey starts here.
          </h2>
          <div className="space-y-4">
            {perks.map(perk => (
              <div key={perk} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle size={14} className="text-white" />
                </div>
                {perk}
              </div>
            ))}
          </div>
        </div>

        <p className="text-teal-200 text-xs">Trusted by 200+ colleges across India</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Seek<span className="text-teal-500">Out</span></span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {isSignup ? 'Start your journey to employability' : 'Sign in to continue to SeekOut'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${errors.name ? 'border-red-400' : 'border-gray-100 focus:border-teal-400'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className={`w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-gray-100 focus:border-teal-400'}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none transition-colors ${errors.password ? 'border-red-400' : 'border-gray-100 focus:border-teal-400'}`}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {!isSignup && (
              <div className="text-right">
                <button type="button" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-teal-200 transition-all text-sm disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isSignup ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                <>
                  {isSignup ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 hover:border-teal-200 hover:bg-teal-50 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm shadow-sm"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            {errors.google && <p className="text-xs text-red-500 mt-2 text-center">{errors.google}</p>}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
              {' '}
              <button
                onClick={() => setIsSignup(s => !s)}
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                {isSignup ? 'Sign in' : 'Sign up free'}
              </button>
            </p>
          </div>

          {isSignup && (
            <p className="mt-5 text-center text-xs text-gray-400">
              By signing up you agree to our{' '}
              <button className="text-teal-600 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="text-teal-600 hover:underline">Privacy Policy</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
