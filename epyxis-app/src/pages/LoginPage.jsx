import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useRbac } from '../context/RbacContext';
import PageTransition from '../components/common/PageTransition';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  Cpu, 
  TrendingUp, 
  Home, 
  BarChart2, 
  Users, 
  Settings, 
  Cloud, 
  BarChart3,
  Check
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const { updateUserSession } = useRbac();

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        updateUserSession({
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role === 'owner' || data.role === 'admin' ? 'TENANT_ADMIN' : 'TENANT_ANALYST'
        });
      }

      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error. Please check server connection.');
      setStatus('idle');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const { auth } = await import('../config/firebase');
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = result.user?.email;
      if (email) {
        const res = await fetch('http://localhost:5000/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data));
          updateUserSession({
            id: data._id,
            name: data.name,
            email: data.email,
            role: data.role === 'owner' || data.role === 'admin' ? 'TENANT_ADMIN' : 'TENANT_ANALYST'
          });
          navigate('/dashboard');
          return;
        } else {
          setErrorMsg(data.message || 'Google account not registered to an active workspace.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication was cancelled.');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0A0B10] text-gray-900 flex flex-col justify-center items-center p-2 sm:p-4 md:p-6 relative font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
        
        {/* Cinematic Looping Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={(e) => {
            e.currentTarget.play().catch(() => {});
          }}
          style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
          className="fixed inset-0 w-full h-full object-cover z-0 opacity-40 pointer-events-none"
        >
          <source src="/desktop.mp4" type="video/mp4" />
        </video>

        {/* Hardware Accelerated Ambient Overlay */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] pointer-events-none z-0" />

        {/* Top Floating Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-800 text-xs font-semibold shadow-lg border border-white/60 backdrop-blur-md transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
        </div>

        {/* Main Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[1000px] bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(15,17,46,0.1)] border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-2 relative z-10 min-h-[620px] my-2 sm:my-4"
        >
          {/* Left Pane - Form Section */}
          <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 bg-white">
            
            {/* Header & Logo */}
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0E102D] rounded-xl flex items-center justify-center text-indigo-400 shadow-md shadow-indigo-950/20">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-black text-[#0E102D] tracking-tight">Epyxis</span>
                  <span className="text-[#5542F6] text-2xl font-black">.</span>
                </div>
              </div>
              <p className="text-[10px] font-extrabold tracking-[0.2em] text-gray-400 uppercase mt-2">
                ENTERPRISE ACCESS PORTAL
              </p>

              {/* Title */}
              <div className="mt-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Welcome back!
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  Please sign in to continue to your workspace
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1.5 block">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-gray-200/80 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#5542F6] focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase mb-1.5 block">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-[#F8FAFC] border border-gray-200/80 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#5542F6] focus:bg-white transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#5542F6] focus:ring-[#5542F6] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="text-[#5542F6] hover:text-indigo-700 font-bold transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{status === 'submitting' ? 'Signing in...' : 'Sign in to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Social Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-xl border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign In with Google</span>
              </button>
            </form>

            {/* Bottom Footer Section */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/request-access')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5542F6] hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Request workspace access or contact administrator</span>
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                By continuing, you agree to our{' '}
                <a href="#terms" className="underline hover:text-gray-600 transition-colors">Terms of Service</a>{' '}
                and{' '}
                <a href="#privacy" className="underline hover:text-gray-600 transition-colors">Privacy Policy</a>.
              </p>
            </div>

          </div>

          {/* Right Pane - Visual Dark Showcase */}
          <div className="bg-[#0D1033] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white rounded-b-[32px] lg:rounded-b-none lg:rounded-r-[32px]">
            
            {/* Background Grid Pattern & Glow Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(#1f2668_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Floating Graphic Mockup Illustration */}
            <div className="relative my-auto py-8">
              
              {/* Floating Badges */}
              {/* Cloud Badge (Top Left) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-2 left-2 sm:left-6 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/60 text-[#5542F6]"
              >
                <Cloud className="w-5 h-5" />
              </motion.div>

              {/* Purple Sphere Orb (Middle Left) */}
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/3 left-0 sm:left-2 z-20 w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-400 shadow-[0_0_20px_rgba(139,92,246,0.6)]"
              />

              {/* Bar Chart Badge (Top Right) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-0 right-2 sm:right-6 z-20 bg-[#8B5CF6] text-white p-3 rounded-2xl shadow-xl"
              >
                <BarChart3 className="w-5 h-5" />
              </motion.div>

              {/* Leaf Metric Pill (Bottom Right) */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-4 right-2 sm:right-4 z-20 bg-white p-2.5 rounded-2xl shadow-xl border border-white/60 flex items-center gap-1"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                  <span className="text-xs font-bold">🍃</span>
                </div>
              </motion.div>

              {/* Main Floating Dashboard Card */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full max-w-[340px] mx-auto bg-white rounded-2xl p-4 text-gray-900 shadow-2xl relative border border-white/40 z-10"
              >
                {/* Window Dots Header */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                  <div className="w-2 h-2 rounded-full bg-gray-300" />
                </div>

                <div className="flex gap-3">
                  {/* Mini Sidebar */}
                  <div className="w-11 bg-[#131438] rounded-xl p-2 flex flex-col items-center gap-3 text-gray-400 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-[#5542F6] flex items-center justify-center text-white shadow-md">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <BarChart2 className="w-3.5 h-3.5" />
                    <Users className="w-3.5 h-3.5" />
                    <Settings className="w-3.5 h-3.5 mt-auto" />
                  </div>

                  {/* Main Graphic Content Area */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-gray-400 tracking-wider">METRICS</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-indigo-600" />
                        <span>+24.8%</span>
                      </span>
                    </div>

                    {/* Smooth Curve Graph SVG */}
                    <div className="h-16 w-full relative pt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 200 60">
                        <path
                          d="M0 45 C 40 45, 60 25, 100 28 C 140 31, 160 5, 200 10"
                          fill="none"
                          stroke="#5542F6"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        {/* Dot on curve */}
                        <circle cx="200" cy="10" r="4" fill="#5542F6" className="animate-ping opacity-75" />
                        <circle cx="200" cy="10" r="4" fill="#5542F6" />
                      </svg>
                    </div>

                    {/* Circular Donut & Indicator */}
                    <div className="flex items-center gap-3 pt-1 border-t border-gray-100">
                      <div className="relative w-7 h-7 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-gray-100"
                            strokeWidth="4"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-[#5542F6]"
                            strokeDasharray="75, 100"
                            strokeWidth="4"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                      </div>
                      <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#5542F6] rounded-full w-[70%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Showcase Footer Text */}
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                Everything you need,<br />
                all in one place.
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200/80 font-normal leading-relaxed max-w-md">
                Access your tools, insights, and teams seamlessly from your centralized workspace.
              </p>

              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5 pt-4">
                <div className="w-6 h-1.5 bg-[#5542F6] rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
              </div>
            </div>

          </div>

        </motion.div>
      </div>
    </PageTransition>
  );
}

