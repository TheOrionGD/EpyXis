import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Shield, Lock, Clock, CheckCircle2, Save, Key, AlertTriangle } from 'lucide-react';

export default function TenantSettingsTab() {
  const [tenant, setTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [policy, setPolicy] = useState({
    passwordMinLength: 8,
    sessionTimeoutMinutes: 60,
    mfaRequired: false
  });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch('http://localhost:5000/api/tenants/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenant(data);
        if (data.securityPolicy) {
          setPolicy({
            passwordMinLength: data.securityPolicy.passwordMinLength || 8,
            sessionTimeoutMinutes: data.securityPolicy.sessionTimeoutMinutes || 60,
            mfaRequired: !!data.securityPolicy.mfaRequired
          });
        }
      }
    } catch (err) {
      console.error('Fetch tenant settings error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch('http://localhost:5000/api/tenants/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ securityPolicy: policy })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchSettings();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to update security policy');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-[#888888]">Loading tenant configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-base text-[#111111]">Tenant Workspace & Security Policy Settings</h2>
          <p className="text-xs text-[#555555] mt-0.5">
            Configure tenant security parameters, MFA rules, and session limits.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
          Tenant Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Workspace Organization Profile Card */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 border-b border-black/5 pb-4">
            <Building2 className="w-5 h-5 text-[#4A6CF7]" />
            <h3 className="font-extrabold text-sm text-[#111111]">Tenant Profile</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] font-bold text-[#888888] uppercase">Organization Name</div>
              <div className="font-bold text-[#111111] text-sm">{tenant?.name || 'Workspace'}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888888] uppercase">Validated Domain</div>
              <div className="font-mono text-[#4A6CF7]">{tenant?.domain || 'acme.com'}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888888] uppercase">Plan Tier</div>
              <div className="inline-block px-2 py-0.5 rounded bg-[#111111] text-white text-[10px] font-bold uppercase mt-1">
                {tenant?.planTier || 'Enterprise'}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-[#888888] uppercase mb-1">Endpoint Quota Limit</div>
              <div className="w-full bg-[#E6E6E2] h-2 rounded-full overflow-hidden">
                <div className="bg-[#4A6CF7] h-full w-[45%]" />
              </div>
              <div className="text-[10px] text-[#555555] mt-1 font-semibold">
                45 / {tenant?.endpointLimit || 100} endpoints active
              </div>
            </div>
          </div>
        </div>

        {/* Security Policy Form */}
        <form onSubmit={handleSavePolicy} className="md:col-span-2 p-6 rounded-2xl bg-white border border-black/5 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-[#4A6CF7]" />
              <h3 className="font-extrabold text-sm text-[#111111]">Security & Password Policy Defaults</h3>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Policy Saved
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Minimum Password Length</label>
              <select 
                value={policy.passwordMinLength} 
                onChange={e => setPolicy({ ...policy, passwordMinLength: Number(e.target.value) })}
                className="w-full p-3 bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl text-xs outline-none focus:border-[#4A6CF7]"
              >
                <option value={8}>8 characters (Standard)</option>
                <option value={12}>12 characters (Recommended)</option>
                <option value={16}>16 characters (Strict Security)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Session Inactivity Timeout (Minutes)</label>
              <select 
                value={policy.sessionTimeoutMinutes} 
                onChange={e => setPolicy({ ...policy, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full p-3 bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl text-xs outline-none focus:border-[#4A6CF7]"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes (Default)</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8F6] border border-black/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#111111]">Require MFA Enforcement</div>
                <div className="text-[10px] text-[#888888]">Prompt sub-users for multi-factor authentication upon login.</div>
              </div>
              <input 
                type="checkbox" 
                checked={policy.mfaRequired} 
                onChange={e => setPolicy({ ...policy, mfaRequired: e.target.checked })} 
                className="w-4 h-4 accent-[#4A6CF7] cursor-pointer" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-[#2D2D2D] transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-[#4A6CF7]" />
              <span>{saving ? 'Updating Policy...' : 'Save Policy Defaults'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
