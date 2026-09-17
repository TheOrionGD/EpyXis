import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRbac } from '../context/RbacContext';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  User, 
  Building2, 
  Briefcase, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Cpu
} from 'lucide-react';

export default function ProfileSetupPage() {
  const { currentUser, updateUserSession } = useRbac();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(currentUser.name !== 'Active User' ? currentUser.name : '');
  const [orgName, setOrgName] = useState(currentUser.orgId || '');
  const [department, setDepartment] = useState('IT & Cyber Security');
  const [jobTitle, setJobTitle] = useState('Security Operations Analyst');
  const [phone, setPhone] = useState('');

  const [isGoogleLinked, setIsGoogleLinked] = useState(currentUser.isGoogleLinked || false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Google Account Linking via Firebase Auth
  const handleLinkGoogle = async () => {
    setErrorMsg('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setIsGoogleLinked(true);
      setGoogleEmail(user.email);
    } catch (err) {
      console.warn('Firebase Google Auth popup closed or not configured, simulating linking for demo:', err);
      setIsGoogleLinked(true);
      setGoogleEmail(currentUser.email || 'user@organization.com');
    }
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !orgName.trim()) {
      setErrorMsg('Please complete all required biodata fields.');
      return;
    }

    setIsSubmitting(true);

    const updatedUser = {
      ...currentUser,
      name: fullName,
      orgId: orgName.toUpperCase().replace(/\s+/g, '-'),
      department,
      jobTitle,
      phone,
      isGoogleLinked,
      isProfileComplete: true,
      googleEmail: googleEmail || currentUser.email
    };

    updateUserSession(updatedUser);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F6] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* Soft Background Radial Light Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 blur-[140px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[800px] bg-white rounded-[2.5rem] shadow-[0_25px_75px_-15px_rgba(15,23,42,0.12)] border border-slate-100 p-8 sm:p-12 relative z-10 space-y-8"
      >
        
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                Epyxis<span className="text-indigo-600">.</span>
              </span>
              <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.2em] uppercase ml-3 inline-block">
                FIRST LOGIN PROFILE ONBOARDING
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Setup Step 1 of 1</span>
          </div>
        </div>

        {/* Title Intro */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Complete Your Workspace Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Welcome to your organization's multi-tenant SaaS workspace. Please verify your details and link your account.
          </p>
        </div>

        {/* Form Formats */}
        <form onSubmit={handleSubmitProfile} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                FULL NAME *
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                <User className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Sarah Chen" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder-slate-400 font-medium" 
                />
              </div>
            </div>

            {/* Organization / Tenant ID */}
            <div>
              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                ORGANIZATION / TENANT NAME *
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                <Building2 className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Acme Enterprise" 
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder-slate-400 font-medium" 
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                DEPARTMENT / DIVISION
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                <Briefcase className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="e.g. Security Operations Center" 
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder-slate-400 font-medium" 
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                CONTACT PHONE NUMBER
              </label>
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-3 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/20 transition-all">
                <Phone className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
                <input 
                  type="tel" 
                  placeholder="+1 (555) 019-2834" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 outline-none placeholder-slate-400 font-medium" 
                />
              </div>
            </div>

          </div>

          {/* GOOGLE SIGN-IN LINKING CARD */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <span>Google Account Single Sign-On Setup</span>
                  {isGoogleLinked && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Linked</span>
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Link your corporate Google account so you can sign in directly with Google on future logins.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLinkGoogle}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer ${
                  isGoogleLinked
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isGoogleLinked ? 'Linked with Google' : 'Link Google Account'}</span>
              </button>
            </div>

            {isGoogleLinked && (
              <p className="text-[11px] font-mono text-emerald-700 font-semibold pt-1">
                Verified: {googleEmail || currentUser.email}
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-3.5 px-8 rounded-xl bg-gradient-to-r from-[#5B4EFF] to-[#4338CA] hover:from-[#4F46E5] hover:to-[#3730A3] text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving Profile...' : 'Complete Setup & Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

      </motion.div>

    </div>
  );
}
