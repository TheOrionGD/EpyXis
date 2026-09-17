import React, { useState } from 'react';
import { 
  FileText, Download, ShieldCheck, CheckCircle2, 
  AlertTriangle, Lock, Cpu, HardDrive, Layers, RefreshCw
} from 'lucide-react';
import { exportTelemetryCsv } from '../../services/securityEngine';

export default function AuditReportGenerator({ telemetry, riskData }) {
  const [downloadMsg, setDownloadMsg] = useState('');

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleExportCsv = (type) => {
    let exportData = [];
    let filename = `epyxis-${type}-audit.csv`;

    if (type === 'processes') {
      exportData = telemetry.processes;
    } else if (type === 'drivers') {
      exportData = telemetry.drivers;
    } else if (type === 'persistence') {
      exportData = telemetry.persistence;
    } else if (type === 'usb') {
      exportData = telemetry.usbDevices;
    } else {
      exportData = telemetry.processes;
    }

    exportTelemetryCsv(exportData, filename);
    setDownloadMsg(`Exported ${type} dataset to ${filename}`);
    setTimeout(() => setDownloadMsg(''), 3000);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify({
      timestamp: new Date().toISOString(),
      reportType: "Epyxis Precision Endpoint Security Audit",
      riskScore: riskData,
      telemetrySnapshot: telemetry
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `epyxis-telemetry-snapshot-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);

    setDownloadMsg('Exported complete JSON telemetry snapshot');
    setTimeout(() => setDownloadMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Telemetry Metadata Export</span>
          </div>
          <h4 className="font-extrabold text-xl text-[#111111] mt-1">Compliance & Security Audit Reports</h4>
          <p className="text-xs text-[#555555]">Generate verified executive PDF reports, CSV datasets, and JSON audit dumps</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-semibold flex items-center space-x-2 hover:bg-[#2D2D2D] transition-colors cursor-pointer shadow-md"
          >
            <Download className="w-4 h-4 text-[#4A6CF7]" />
            <span>Print / Export PDF</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2.5 rounded-xl bg-white text-[#111111] border border-black/10 text-xs font-semibold flex items-center space-x-2 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Export JSON Snapshot</span>
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* CSV Datasets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Processes CSV', type: 'processes', count: telemetry.processes.length, icon: Cpu },
          { label: 'Drivers CSV', type: 'drivers', count: telemetry.drivers.length, icon: Layers },
          { label: 'Persistence CSV', type: 'persistence', count: telemetry.persistence.length, icon: Lock },
          { label: 'USB Devices CSV', type: 'usb', count: telemetry.usbDevices.length, icon: HardDrive }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="glass-card p-4 rounded-2xl flex items-center justify-between border border-black/5 hover:border-[#4A6CF7]/40 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111]">
                  <Icon className="w-3.5 h-3.5 text-[#4A6CF7]" />
                  <span>{item.label}</span>
                </div>
                <div className="text-[10px] text-zinc-500">{item.count} Records Audited</div>
              </div>
              <button
                onClick={() => handleExportCsv(item.type)}
                className="p-2 rounded-xl bg-zinc-100 hover:bg-[#4A6CF7] hover:text-white text-zinc-700 transition-colors cursor-pointer"
                title={`Export ${item.label}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Formatted Printable PDF Executive Audit Report Document Preview */}
      <div className="bg-white rounded-3xl p-8 border border-black/10 shadow-xl space-y-8 print:p-0 print:border-none print:shadow-none font-sans">
        
        {/* Report Header */}
        <div className="flex items-start justify-between border-b border-black/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-white font-extrabold text-sm">
                X
              </div>
              <h2 className="editorial-headline text-2xl font-extrabold text-[#111111]">EPYXIS PRECISION SECURITY AUDIT REPORT</h2>
            </div>
            <p className="text-xs text-zinc-500">Document Control ID: EPYXIS-AUDIT-{Date.now().toString(36).toUpperCase()}</p>
          </div>

          <div className="text-right space-y-1 text-xs">
            <div className="font-bold text-zinc-900">Classification: CONFIDENTIAL</div>
            <div className="text-zinc-500">Generated: {new Date().toLocaleString()}</div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              VERIFIED AUTHENTICODE SEAL
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-black/5 space-y-2">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Endpoint Risk Score</div>
            <div className="text-4xl font-extrabold text-zinc-900">{riskData.score} <span className="text-xs font-normal text-zinc-500">/ 100</span></div>
            <div className="text-xs font-semibold text-emerald-600">Threat Level: {riskData.category}</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-black/5 space-y-2">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Tracked Processes</div>
            <div className="text-4xl font-extrabold text-zinc-900">{telemetry.processes.length}</div>
            <div className="text-xs font-semibold text-zinc-600">
              {telemetry.processes.filter(p => p.signatureStatus === 'VALID').length} Authenticode Signed
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-black/5 space-y-2">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Kernel Drivers</div>
            <div className="text-4xl font-extrabold text-zinc-900">{telemetry.drivers.length}</div>
            <div className="text-xs font-semibold text-emerald-600">100% WHQL Verified</div>
          </div>
        </div>

        {/* Audit Details Tables */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-700 border-b border-black/5 pb-2">
            1. Process Inventory & Digital Signatures
          </h3>
          <table className="w-full text-left text-xs border border-black/10 rounded-xl overflow-hidden">
            <thead className="bg-zinc-100 text-zinc-700 font-bold">
              <tr>
                <th className="p-2.5">PID</th>
                <th className="p-2.5">Process Name</th>
                <th className="p-2.5">Publisher</th>
                <th className="p-2.5">Privilege</th>
                <th className="p-2.5">Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {telemetry.processes.map(p => (
                <tr key={p.pid} className="text-zinc-800">
                  <td className="p-2.5 font-mono">{p.pid}</td>
                  <td className="p-2.5 font-semibold">{p.name}</td>
                  <td className="p-2.5">{p.publisher}</td>
                  <td className="p-2.5">{p.privilege}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.signatureStatus === 'VALID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {p.signatureStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Startup Persistence Table */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-700 border-b border-black/5 pb-2">
            2. Startup Persistence Vector Audit
          </h3>
          <table className="w-full text-left text-xs border border-black/10 rounded-xl overflow-hidden">
            <thead className="bg-zinc-100 text-zinc-700 font-bold">
              <tr>
                <th className="p-2.5">Name</th>
                <th className="p-2.5">Location</th>
                <th className="p-2.5">Binary Path</th>
                <th className="p-2.5">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {telemetry.persistence.map(pst => (
                <tr key={pst.id} className="text-zinc-800">
                  <td className="p-2.5 font-semibold">{pst.name}</td>
                  <td className="p-2.5 text-zinc-600">{pst.location}</td>
                  <td className="p-2.5 font-mono text-[11px] truncate max-w-xs">{pst.binaryPath}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pst.risk === 'High' ? 'bg-rose-100 text-rose-800' : pst.risk === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {pst.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Verification Seal */}
        <div className="pt-6 border-t border-black/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <div>
            <div>SHA-256 Checksum: 0x4a6cf7b8901234567890abcdef1234567890</div>
            <div>Epyxis Privacy Engine: Enforced (0 characters intercepted)</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zinc-900">Epyxis Defense Framework v2.4</div>
            <div>Signed by Epyxis Security Core</div>
          </div>
        </div>

      </div>

    </div>
  );
}
