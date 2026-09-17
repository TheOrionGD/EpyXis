import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Shield, Clock, User, Filter, CheckCircle2, Lock, Activity, FileText } from 'lucide-react';

export default function AuditTrailTab() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch('http://localhost:5000/api/team/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-5">
      {/* Header section with mandatory microcopy */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-white border border-black/5 shadow-xs gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-extrabold text-base text-[#111111]">Tenant Audit Trail & Cryptographic History</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Immutable Ledger
            </span>
          </div>
          <p className="text-xs text-[#555555] mt-1 font-serif italic">
            "Everything that's happened, in order."
          </p>
        </div>

        <button 
          onClick={fetchAuditLogs}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-[#111111] border border-[#E6E6E2] rounded-xl text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-[#4A6CF7]" />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Audit Logs Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#888888] bg-white rounded-2xl border border-[#E6E6E2]">
          Loading audit events...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 text-center text-[#888888] bg-white rounded-2xl border border-[#E6E6E2]">
          No recorded audit trail events yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E6E6E2] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8F6] border-b border-[#E6E6E2] text-[#888888] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Event Action</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Target User</th>
                <th className="p-4 text-right">Metadata / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E2] font-medium text-[#2D2D2D]">
              {logs.map((log, idx) => (
                <tr key={log._id || idx} className="hover:bg-[#F8F8F6]/80 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-[#888888]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#111111] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    {log.actorUserId ? (
                      <div className="font-bold text-[#111111]">
                        {log.actorUserId.name} <span className="text-[10px] text-[#4A6CF7] font-normal">({log.actorUserId.role})</span>
                      </div>
                    ) : (
                      <span className="text-[#888888] font-mono text-[10px]">System / Provider Admin</span>
                    )}
                  </td>
                  <td className="p-4">
                    {log.targetUserId ? (
                      <div className="font-semibold text-[#2D2D2D]">
                        {log.targetUserId.name || log.targetUserId.email}
                      </div>
                    ) : (
                      <span className="text-[#888888]">—</span>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono text-[10px] text-[#555555]">
                    {log.metadata ? JSON.stringify(log.metadata) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
