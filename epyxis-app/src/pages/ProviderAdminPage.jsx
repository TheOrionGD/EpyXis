import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, User, Mail, ShieldCheck, CheckCircle2, 
  XCircle, HelpCircle, FileText, Lock, Filter, Search, 
  Clock, Server, ChevronRight, X, AlertCircle, Copy
} from 'lucide-react';

export default function ProviderAdminPage({ isEmbedded = false, theme = isEmbedded ? 'light' : 'dark' }) {
  const [activeView, setActiveView] = useState('requests'); // 'requests' or 'tenants'
  const [requests, setRequests] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [providerToken, setProviderToken] = useState(localStorage.getItem('providerToken'));
  
  // Login state
  const [username, setUsername] = useState('admin@epyxis.io');
  const [password, setPassword] = useState('secure_provider_password_123');
  const [loginError, setLoginError] = useState('');

  // Selected request detail modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [actionAlert, setActionAlert] = useState(null);

  const isLight = theme === 'light';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('http://localhost:5000/api/provider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('providerToken', data.token);
        setProviderToken(data.token);
      } else {
        setLoginError(data.message || 'Invalid provider credentials');
      }
    } catch (err) {
      setLoginError('Server error while authenticating provider');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('providerToken');
    setProviderToken(null);
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === 'all' 
        ? 'http://localhost:5000/api/provider/requests' 
        : `http://localhost:5000/api/provider/requests?status=${statusFilter}`;
        
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${providerToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTenants = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/provider/tenants', {
        headers: { 'Authorization': `Bearer ${providerToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (providerToken) {
      if (activeView === 'requests') {
        fetchRequests();
      } else {
        fetchTenants();
      }
    }
  }, [providerToken, statusFilter, activeView]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/provider/requests/${id}/approve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}` 
        },
        body: JSON.stringify({ notes: internalNotes })
      });
      const data = await res.json();
      if (res.ok) {
        setActionAlert({
          type: 'success',
          message: `Workspace provisioned! Temporary password for tenant owner: ${data.tempPassword}`
        });
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(data.message || 'Approval failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/provider/requests/${id}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}` 
        },
        body: JSON.stringify({ notes: internalNotes })
      });
      if (res.ok) {
        setActionAlert({ type: 'error', message: 'Tenant request rejected.' });
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestInfo = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/provider/requests/${id}/more-info`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${providerToken}` 
        },
        body: JSON.stringify({ notes: internalNotes })
      });
      if (res.ok) {
        setActionAlert({ type: 'info', message: 'Requested additional details from tenant.' });
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Unauthenticated provider view
  if (!providerToken) {
    return (
      <div className={`${isEmbedded ? 'py-4 bg-transparent' : isLight ? 'min-h-screen bg-[#F8F8F6] py-20' : 'min-h-screen bg-[#111111] py-20'} flex items-center justify-center font-sans px-4 relative`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full z-10 p-7 sm:p-10 ${isLight ? 'bg-white/90 border border-black/10 text-[#111111]' : 'bg-[#161618]/90 border border-white/10 text-white'} backdrop-blur-3xl rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#4A6CF7]/50 to-transparent" />

          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#4A6CF7] flex items-center justify-center font-extrabold text-white text-xl shadow-md">
              X
            </div>
            <div className="text-xl font-extrabold tracking-tight">Epyxis System Admin</div>
          </div>

          <h2 className={`text-center text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-[#888888]' : 'text-[#E6E6E2]/50'}`}>
            Stage 2 — Provider Review Console
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-[10px] ${isLight ? 'text-[#555555]' : 'text-[#E6E6E2]/60'} uppercase tracking-widest font-bold mb-1.5`}>
                Provider Email / Username
              </label>
              <input 
                required 
                type="text" 
                placeholder="admin@epyxis.io" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className={`w-full ${isLight ? 'bg-[#F8F8F6] border-[#E6E6E2] text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#4A6CF7] transition-all`} 
              />
            </div>

            <div>
              <label className={`block text-[10px] ${isLight ? 'text-[#555555]' : 'text-[#E6E6E2]/60'} uppercase tracking-widest font-bold mb-1.5`}>
                Password
              </label>
              <input 
                required 
                type="password" 
                placeholder="••••••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full ${isLight ? 'bg-[#F8F8F6] border-[#E6E6E2] text-[#111111]' : 'bg-[#0D0D0F] border-white/10 text-white'} border rounded-2xl px-4 py-3 text-xs outline-none focus:border-[#4A6CF7] transition-all`} 
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-medium">
                {loginError}
              </div>
            )}

            <button 
              type="submit" 
              className={`w-full py-3.5 ${isLight ? 'bg-[#111111] text-white hover:bg-[#2D2D2D]' : 'bg-[#4A6CF7] text-white hover:bg-[#4A6CF7]/90'} text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]`}
            >
              Authenticate Provider Session
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${isEmbedded ? 'py-4 bg-transparent' : 'min-h-screen bg-[#F8F8F6]'} text-[#111111] font-sans`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E6E6E2] pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest">
                System Provider
              </span>
              <h1 className="editorial-headline text-3xl font-extrabold tracking-tight">
                Epyxis Provisioning Console
              </h1>
            </div>
            <p className="text-xs text-[#555555]">
              Review enterprise onboarding requests, vet organizations, and provision root tenant accounts.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white border border-[#E6E6E2] p-1 rounded-xl shadow-xs">
              <button 
                onClick={() => setActiveView('requests')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'requests' ? 'bg-[#111111] text-white shadow-xs' : 'text-[#555555] hover:text-[#111111]'
                }`}
              >
                Tenant Requests
              </button>
              <button 
                onClick={() => setActiveView('tenants')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'tenants' ? 'bg-[#111111] text-white shadow-xs' : 'text-[#555555] hover:text-[#111111]'
                }`}
              >
                Active Tenants
              </button>
            </div>

            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-[#2D2D2D] text-white rounded-xl text-xs font-semibold hover:bg-black transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Action feedback alert */}
        {actionAlert && (
          <div className="p-4 rounded-2xl bg-white border border-green-200 shadow-md text-sm flex items-start justify-between relative overflow-hidden">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-green-900">{actionAlert.title}</h4>
                <p className="text-xs text-green-800 mt-0.5">{actionAlert.message}</p>
                {actionAlert.tempPassword && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl font-mono text-xs text-green-900 flex items-center gap-4">
                    <div>
                      <span className="text-green-700 font-sans font-bold">One-Time Password: </span>
                      <span className="font-extrabold select-all text-black bg-white px-2 py-1 rounded border border-green-300">{actionAlert.tempPassword}</span>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText(actionAlert.tempPassword)}
                      className="px-2.5 py-1 bg-white border border-green-300 rounded text-[10px] font-bold text-green-800 hover:bg-green-100 cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setActionAlert(null)} className="text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Requests View */}
        {activeView === 'requests' && (
          <div className="space-y-6">
            
            {/* Filter Tabs */}
            <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-[#E6E6E2] shadow-xs overflow-x-auto">
              <div className="flex items-center space-x-2 shrink-0">
                {[
                  { id: 'all', label: 'All Requests' },
                  { id: 'pending', label: 'Pending Review' },
                  { id: 'approved', label: 'Approved' },
                  { id: 'rejected', label: 'Rejected' },
                  { id: 'more_info', label: 'More Info Requested' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === tab.id 
                        ? 'bg-[#4A6CF7] text-white shadow-xs' 
                        : 'text-[#555555] hover:bg-[#F8F8F6] hover:text-[#111111]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs text-[#888888] font-bold uppercase tracking-wider pr-2 shrink-0">
                Showing: {requests.length} records
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="p-12 text-center text-[#888888] bg-white rounded-2xl border border-[#E6E6E2]">
                Fetching tenant requests...
              </div>
            ) : (
              <div className="bg-white border border-[#E6E6E2] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F8F6] text-[#888888] uppercase tracking-wider text-[10px] font-bold border-b border-[#E6E6E2]">
                    <tr>
                      <th className="px-6 py-4">Organization</th>
                      <th className="px-6 py-4">Contact Person</th>
                      <th className="px-6 py-4">Est. Endpoints</th>
                      <th className="px-6 py-4">Submitted Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E2] font-medium text-[#2D2D2D]">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-[#888888]">
                          No requests found matching current filter.
                        </td>
                      </tr>
                    ) : (
                      requests.map(req => (
                        <tr 
                          key={req._id} 
                          className="hover:bg-[#F8F8F6]/80 transition-colors cursor-pointer"
                          onClick={() => handleOpenDetail(req)}
                        >
                          <td className="px-6 py-4 font-bold text-[#111111]">
                            {req.orgName}
                            {req.phone && <div className="text-[10px] font-normal text-[#888888]">{req.phone}</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-[#111111] font-semibold">{req.contactName}</div>
                            <div className="text-[10px] text-[#4A6CF7] font-mono">{req.workEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold">{req.endpointEstimate || 50}</span> endpoints
                          </td>
                          <td className="px-6 py-4 text-[#888888]">
                            {new Date(req.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                              req.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              req.status === 'more_info' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                              'bg-red-100 text-red-800 border border-red-300'
                            }`}>
                              {req.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleOpenDetail(req)}
                              className="px-3 py-1.5 bg-white border border-[#E6E6E2] text-[#111111] rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
                            >
                              Review Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Active Tenants View */}
        {activeView === 'tenants' && (
          <div className="bg-white border border-[#E6E6E2] rounded-2xl overflow-hidden shadow-xs p-6 space-y-4">
            <h2 className="font-extrabold text-lg">Provisioned Tenant Workspaces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenants.length === 0 ? (
                <div className="text-center text-[#888888] col-span-2 py-8">No provisioned tenants yet.</div>
              ) : (
                tenants.map(t => (
                  <div key={t._id} className="p-5 rounded-2xl bg-[#F8F8F6] border border-black/5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-base text-[#111111]">{t.name}</h3>
                        <div className="text-xs text-[#4A6CF7] font-mono">Domain: {t.domain}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-xs text-[#555555]">
                      <div>
                        <div className="text-[10px] font-bold text-[#888888] uppercase">Plan Tier</div>
                        <div className="font-bold text-[#111111]">{t.planTier}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#888888] uppercase">Endpoint Limit</div>
                        <div className="font-bold text-[#111111]">{t.endpointLimit} units</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#888888] uppercase">Active Users</div>
                        <div className="font-bold text-[#111111]">{t.activeUsers}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Detail Drawer Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="bg-white border border-[#E6E6E2] rounded-3xl w-full max-w-lg h-full max-h-[90vh] shadow-2xl p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E6E6E2] pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#888888] tracking-widest">
                      Request ID: {selectedRequest._id}
                    </span>
                    <h3 className="editorial-headline text-2xl font-extrabold text-[#111111]">
                      {selectedRequest.orgName}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200">
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                {/* Submitted fields grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-[#F8F8F6] rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Contact Name</div>
                    <div className="font-semibold text-[#111111]">{selectedRequest.contactName}</div>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Role</div>
                    <div className="font-semibold text-[#111111]">{selectedRequest.contactRole || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl col-span-2">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Work Email</div>
                    <div className="font-mono text-[#4A6CF7] font-semibold">{selectedRequest.workEmail}</div>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Org Size</div>
                    <div className="font-semibold text-[#111111]">{selectedRequest.orgSize}</div>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Est Endpoints</div>
                    <div className="font-semibold text-[#111111]">{selectedRequest.endpointEstimate}</div>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Industry</div>
                    <div className="font-semibold text-[#111111]">{selectedRequest.industry || 'General'}</div>
                  </div>
                  <div className="p-3 bg-[#F8F8F6] rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-[#888888]">Phone</div>
                    <div className="font-semibold text-[#111111]">{selectedRequest.phone || 'N/A'}</div>
                  </div>
                </div>

                {/* Internal Notes Editor */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider">
                    Internal Provider Notes & Vetting Remarks
                  </label>
                  <textarea 
                    rows={3} 
                    value={internalNotes} 
                    onChange={e => setInternalNotes(e.target.value)} 
                    placeholder="Add internal risk notes or vetting commentary..." 
                    className="w-full p-3 bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl text-xs outline-none focus:border-[#4A6CF7]" 
                  />
                  <div className="flex justify-end">
                    <button onClick={handleSaveNotes} className="px-3 py-1.5 bg-[#2D2D2D] text-white rounded-lg text-xs font-semibold hover:bg-black">
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-[#E6E6E2] space-y-3">
                <div className="text-[10px] font-bold uppercase text-[#888888] tracking-widest text-center">
                  Provisioning Vetting Actions
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleAction(selectedRequest._id, 'approve')}
                    className="py-3 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-[#2D2D2D] transition shadow-sm"
                  >
                    Approve & Provision
                  </button>
                  <button 
                    onClick={() => handleAction(selectedRequest._id, 'more-info')}
                    className="py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                  >
                    Request Info
                  </button>
                  <button 
                    onClick={() => handleAction(selectedRequest._id, 'reject')}
                    className="py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                  >
                    Reject Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
