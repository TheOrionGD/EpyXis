import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Key, Layers, Calendar, Hash } from 'lucide-react';

export default function CertificateInspectorModal({ cert, onClose }) {
  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 relative border border-white/40 bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#4A6CF7]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                WinVerifyTrust Authenticode
              </span>
              <h3 className="font-extrabold text-xl text-[#111111]">{cert.subjectName || cert.publisher}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Signature Status Banner */}
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
          cert.signatureStatus === 'VALID' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center space-x-2">
            {cert.signatureStatus === 'VALID' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                Authenticode Digital Signature: {cert.signatureStatus}
              </div>
              <p className="text-[11px] opacity-80 font-normal">
                {cert.signatureStatus === 'VALID' 
                  ? 'Verified against Microsoft Root Certificate Program & WinVerifyTrust API' 
                  : 'Binary image lacks valid Microsoft Authenticode certificate signature'}
              </p>
            </div>
          </div>
          {cert.hashAlgorithm && (
            <span className="px-3 py-1 rounded-full bg-white font-mono text-[11px] font-bold border border-black/10">
              {cert.hashAlgorithm}
            </span>
          )}
        </div>

        {/* Certificate Hierarchy Chain */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#888888] flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-[#4A6CF7]" />
            <span>X.509 Certificate Chain Hierarchy</span>
          </h4>

          <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-black/5 space-y-3 font-mono text-xs">
            {/* Root CA */}
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-black/5">
              <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">R</div>
              <div>
                <div className="font-bold text-zinc-900">{cert.rootCa || cert.issuer}</div>
                <div className="text-[10px] text-zinc-500">Root Certification Authority (Trusted OS Store)</div>
              </div>
            </div>

            {/* Intermediate CA */}
            {cert.intermediateCa && (
              <div className="ml-4 pl-4 border-l-2 border-dashed border-[#4A6CF7] flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-black/5">
                <div className="w-6 h-6 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">I</div>
                <div>
                  <div className="font-bold text-zinc-900">{cert.intermediateCa}</div>
                  <div className="text-[10px] text-zinc-500">Intermediate Code Signing Authority</div>
                </div>
              </div>
            )}

            {/* End Entity / Leaf Certificate */}
            <div className="ml-8 pl-4 border-l-2 border-emerald-500 flex items-center space-x-3 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200">
              <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">S</div>
              <div>
                <div className="font-bold text-emerald-950">{cert.subjectName || cert.publisher || cert.name}</div>
                <div className="text-[10px] text-emerald-700">Leaf Code Signing Certificate (Subject)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-black/5 space-y-1.5">
            <div className="text-[#888888] font-bold text-[10px] uppercase flex items-center space-x-1">
              <Key className="w-3.5 h-3.5 text-[#4A6CF7]" />
              <span>Public Key Parameters</span>
            </div>
            <div className="font-semibold text-[#111111]">{cert.keySpec}</div>
            {cert.thumbprint && (
              <div className="text-[10px] font-mono text-zinc-500 truncate">Thumbprint: {cert.thumbprint}</div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F8F6] border border-black/5 space-y-1.5">
            <div className="text-[#888888] font-bold text-[10px] uppercase flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#4A6CF7]" />
              <span>Validity Period</span>
            </div>
            <div className="font-semibold text-[#111111]">{cert.validTo ? `Valid until ${cert.validTo}` : 'Active Certificate'}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">RFC 3161 Authenticode Timestamped</div>
          </div>

          {cert.sha256Hash && (
            <div className="sm:col-span-2 p-4 rounded-2xl bg-[#F8F8F6] border border-black/5 space-y-1.5">
              <div className="text-[#888888] font-bold text-[10px] uppercase flex items-center space-x-1">
                <Hash className="w-3.5 h-3.5 text-[#4A6CF7]" />
                <span>Binary Image SHA-256 Hash Digest</span>
              </div>
              <div className="font-mono text-[11px] text-zinc-900 bg-white p-2 rounded-xl border border-black/10 break-all select-all">
                {cert.sha256Hash}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2D2D2D] transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
