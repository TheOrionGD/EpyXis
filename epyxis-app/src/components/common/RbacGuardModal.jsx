import React from 'react';
import { useRbac } from '../../context/RbacContext';
import { ShieldAlert, Lock, UserCheck, X } from 'lucide-react';

export default function RbacGuardModal() {
  const { rbacGuardModal, closeGuardModal, currentUser } = useRbac();

  if (!rbacGuardModal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 space-y-6 relative border border-rose-500/30 bg-white shadow-2xl">
        
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600">
            <Lock className="w-5 h-5" />
          </div>
          <button
            onClick={closeGuardModal}
            className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-zinc-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>RBAC Authorization Required</span>
          </div>

          <h3 className="editorial-headline text-2xl font-extrabold text-[#111111]">
            Access Denied
          </h3>

          <p className="text-xs text-[#555555] leading-relaxed">
            Your current active role <strong className="text-[#111111]">{currentUser.role}</strong> does not possess the <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-rose-700">{rbacGuardModal.requiredPermission}</code> privilege needed to <span className="font-semibold text-zinc-900">{rbacGuardModal.actionName}</span>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-2 text-xs">
          <div className="font-bold text-amber-900 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Privilege Escalation Required</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            This action is restricted by enterprise policy. To perform administrative or high-impact security operations, please contact your workspace administrator or request temporary role elevation.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={closeGuardModal}
            className="px-5 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2D2D2D] transition-colors cursor-pointer"
          >
            Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
}
