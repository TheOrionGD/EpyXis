import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, ArrowRight, Building2, Mail, User, Briefcase, Lock, Sparkles, Copy, Check } from 'lucide-react';

export default function RequestAccessPage({ isEmbedded = false, theme = isEmbedded ? 'light' : 'dark' }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    orgName: '',
    workEmail: '',
    contactName: '',
    contactRole: 'Security Administrator',
    orgSize: '51-200',
    industry: 'Technology / Software',
    endpointEstimate: '100',
    phone: '',
    password: '',
    consent: true
  });
  
  const [status, setStatus] = useState('idle'); // idle, submitting, success
  const [errorMsg, setErrorMsg] = useState('');
  const [provisionedData, setProvisionedData] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'workEmail') setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.orgName || !formData.workEmail || !formData.contactName) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    
    setStatus('submitting');
    
    try {
      const res = await fetch('http://localhost:5000/api/onboarding/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Workspace provisioning failed.');
      }
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      setProvisionedData(data);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('idle');
    }
  };

  const copyEnrollmentToken = () => {
    if (provisionedData?.enrollmentToken) {
      navigator.clipboard.writeText(provisionedData.enrollmentToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const isLight = theme === 'light';

  if (status === 'success' && provisionedData) {
    return (
      <div className={`${isEmbedded ? 'py-4 bg-transparent' : isLight ? 'min-h-screen bg-[#F8F8F6] py-24' : 'min-h-screen bg-[#111111] py-24'} text-[#111111] flex items-center justify-center font-sans px-4 relative overflow-hidden`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`max-w-2xl w-full text-center p-8 sm:p-12 ${isLight ? 'bg-white/95 border border-black/10 text-[#111111]' : 'bg-[#161618]/95 border border-white/10 text-white'} rounded-[2.5rem] backdrop-blur-3xl shadow-2xl space-y-6 relative overflow-hidden`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Self-Service Workspace Provisioned</span>
            </div>

            <h2 className="editorial-headline text-3xl sm:text-4xl font-extrabold tracking-tight">
              Isolated Tenant Ready.
            </h2>

            <p className={`${isLight ? 'text-[#555555]' : 'text-[#E6E6E2]/70'} text-xs leading-relaxed max-w-lg mx-auto`}>
              Your multi-tenant open-source environment is active with zero system administrator approval gates.
            </p>
          </div>

          <div className={`p-6 rounded-2xl ${isLight ? 'bg-[#F8F8F6] border border-[#E6E6E2]' : 'bg-[#0D0D0F] border border-white/10'} text-left text-xs space-y-3 font-mono shadow-inner`}>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#888888]">Organization Tenant:</span>
              <span className="font-bold text-[#111111]">{provisionedData.tenant?.name || formData.orgName}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#888888]">Tenant ID:</span>
              <span className="font-mono text-[#4A6CF7]">{provisionedData.tenant?.id || 'TN-AUTO-01'}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#888888]">Admin Account:</span>
              <span className="font-semibold text-[#111111]">{provisionedData.user?.email || formData.workEmail}</span>
            </div>
            <div className="flex justify-between border-b border-black/5 pb-2">
              <span className="text-[#888888]">Assigned Role:</span>
              <span className="font-bold text-emerald-600 uppercase">Tenant Owner (Full Access)</span>
            </div>
            
            <div className="pt-2">
              <div className="text-[10px] text-[#888888] uppercase tracking-wider mb-1 font-sans font-bold">Device Enrollment Token (Windows Agent):</div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 border border-black/10 font-mono text-[11px] break-all">
                <span className="text-[#4A6CF7] font-bold">{provisionedData.enrollmentToken || 'epyxis-token-default-01'}</span>
                <button
                  onClick={copyEnrollmentToken}
                  className="p-1.5 rounded-lg bg-white border border-black/10 text-zinc-700 hover:bg-zinc-100 cursor-pointer shrink-0 ml-2"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-2xl bg-[#111111] text-white hover:bg-[#2D2D2D] text-xs font-bold uppercase tracking-wider transition-all shadow-xl cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#4A6CF7]" />
              <span>Launch Live Workspace Dashboard</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${isEmbedded ? 'py-4 bg-transparent' : isLight ? 'min-h-screen bg-[#F8F8F6] py-20' : 'min-h-screen bg-[#111111] py-20'} font-sans flex items-center justify-center px-4 relative`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full max-w-6xl z-10 p-7 sm:p-10 ${isLight ? 'bg-white/90 border border-black/10 text-[#111111]' : 'bg-[#161618]/90 border border-white/10 text-white'} backdrop-blur-3xl rounded-[2.5rem] shadow-xl relative overflow-hidden`}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4A6CF7]/50 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#4A6CF7]/10 text-[#4A6CF7] text-xs font-bold uppercase tracking-wider border border-[#4A6CF7]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Source Self-Service</span>
            </div>

            <h1 className="editorial-headline text-3xl sm:text-5xl font-extrabold tracking-tight">
              Instant Tenant Workspace.
            </h1>

            <p className={`${isLight ? 'text-[#555555]' : 'text-[#E6E6E2]/70'} text-xs sm:text-sm leading-relaxed`}>
              Provision an isolated multi-tenant organization instantly with zero system admin approval delays. Get instant API tokens and agent enrollment keys.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Instant Isolated Tenant Partitioning',
                'Zero System Admin Approval Gates',
                'Immediate Hardware Enrollment Token',
                'Full Owner Access to Security Dashboard'
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center space-x-3 text-xs font-semibold">
                  <div className="w-5 h-5 rounded-full bg-[#10b981]/15 text-[#10b981] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Organization Name *</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888888]" />
                    <input
                      type="text"
                      name="orgName"
                      required
                      value={formData.orgName}
                      onChange={handleChange}
                      placeholder="Acme Security Inc."
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium ${isLight ? 'bg-[#F8F8F6] border-black/10 text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border focus:outline-none focus:border-[#4A6CF7]`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Work Email *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888888]" />
                    <input
                      type="email"
                      name="workEmail"
                      required
                      value={formData.workEmail}
                      onChange={handleChange}
                      placeholder="admin@acme.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium ${isLight ? 'bg-[#F8F8F6] border-black/10 text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border focus:outline-none focus:border-[#4A6CF7]`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Contact Person Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888888]" />
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Alex Mercer"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium ${isLight ? 'bg-[#F8F8F6] border-black/10 text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border focus:outline-none focus:border-[#4A6CF7]`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Contact Role</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888888]" />
                    <input
                      type="text"
                      name="contactRole"
                      value={formData.contactRole}
                      onChange={handleChange}
                      placeholder="CISO / Lead Security Engineer"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium ${isLight ? 'bg-[#F8F8F6] border-black/10 text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border focus:outline-none focus:border-[#4A6CF7]`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Estimated Endpoints</label>
                  <select
                    name="endpointEstimate"
                    value={formData.endpointEstimate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-2xl text-xs font-medium ${isLight ? 'bg-[#F8F8F6] border-black/10 text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border focus:outline-none focus:border-[#4A6CF7]`}
                  >
                    <option value="25">1 - 25 Endpoints</option>
                    <option value="100">26 - 100 Endpoints</option>
                    <option value="500">101 - 500 Endpoints</option>
                    <option value="2500">500+ Endpoints</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Set Password (Optional)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#888888]" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-medium ${isLight ? 'bg-[#F8F8F6] border-black/10 text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border focus:outline-none focus:border-[#4A6CF7]`}
                    />
                  </div>
                </div>

              </div>

              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === 'submitting'}
                className="w-full py-4 bg-[#111111] hover:bg-[#2D2D2D] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer disabled:opacity-50 shadow-lg hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                {status === 'submitting' ? (
                  <span>Provisioning Instant Workspace...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#4A6CF7]" />
                    <span>Provision Instant Workspace Now</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
