import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Download, Copy, RefreshCw, UserX, Check, Shield, Mail, Key, UserCheck } from 'lucide-react';

export default function TeamManagementTab() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'analyst', password: '' });
  const [createdUserTempCreds, setCreatedUserTempCreds] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch('http://localhost:5000/api/team/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch('http://localhost:5000/api/team/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedUserTempCreds({ 
          name: data.name,
          email: data.email,
          username: data.email, 
          tempPassword: data.tempPassword,
          role: data.role
        });
        setShowAddModal(false);
        setNewUser({ name: '', email: '', role: 'analyst', password: '' });
        fetchUsers();
      } else {
        alert(data.message || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch(`http://localhost:5000/api/team/users/${userId}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedUserTempCreds({
          name: data.name || 'User',
          email: data.email || 'User',
          username: data.email || 'User',
          tempPassword: data.tempPassword,
          role: 'reset'
        });
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisableUser = async (userId) => {
    if (!window.confirm('Are you sure you want to disable access for this user?')) return;
    try {
      const token = localStorage.getItem('token') || 'dummy-token';
      const res = await fetch(`http://localhost:5000/api/team/users/${userId}/disable`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleExportCSV = () => {
    const header = 'Name,Email,Username,Temporary Password,Role,Created Date\n';
    const rows = users.map(u => {
      const tempPass = (createdUserTempCreds && createdUserTempCreds.email === u.email) 
        ? createdUserTempCreds.tempPassword 
        : '[EXPIRED/SET_BY_USER]';
      return `"${u.name}","${u.email}","${u.username || u.email}","${tempPass}","${u.role}","${new Date(u.createdAt).toISOString()}"`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `epyxis-workspace-credentials-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-white border border-black/5 shadow-xs gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-extrabold text-base text-[#111111]">Workspace Users & Team RBAC</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#4A6CF7]/10 text-[#4A6CF7] text-[10px] font-bold">
              {users.length} Active Members
            </span>
          </div>
          <p className="text-xs text-[#555555] mt-0.5">
            Provision team members, assign role permissions, and issue single-use temporary credentials.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={handleExportCSV} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-white text-[#111111] border border-[#E6E6E2] rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#4A6CF7]" />
            <span>Download credentials (.csv)</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#111111] text-white rounded-xl text-xs font-bold hover:bg-[#2D2D2D] transition cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#4A6CF7]" />
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      {/* Generated Temp Credential Notification Banner */}
      {createdUserTempCreds && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="font-extrabold text-sm text-emerald-950 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Temporary Credentials Generated</span>
            </div>
            <p className="text-emerald-800 text-xs">
              Single-use 72-hour temporary password created for <span className="font-bold">{createdUserTempCreds.name}</span>. Distribute securely via internal channels.
            </p>
            <div className="pt-2 flex items-center space-x-4 font-mono text-xs">
              <div><span className="text-emerald-700 font-sans">Username:</span> <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-emerald-300">{createdUserTempCreds.username}</span></div>
              <div><span className="text-emerald-700 font-sans">Temp Password:</span> <span className="font-bold text-black bg-white px-2 py-0.5 rounded border border-emerald-300">{createdUserTempCreds.tempPassword}</span></div>
            </div>
          </div>
          <button 
            onClick={() => copyToClipboard(`Username: ${createdUserTempCreds.username}\nTemporary Password: ${createdUserTempCreds.tempPassword}`)} 
            className="px-4 py-2 bg-white text-emerald-900 border border-emerald-300 rounded-xl font-bold hover:bg-emerald-100 flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
          </button>
        </div>
      )}

      {/* User Table */}
      {isLoading ? (
        <div className="p-12 text-center text-[#888888] bg-white rounded-2xl border border-[#E6E6E2]">
          Loading workspace team members...
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 text-center text-[#888888] bg-white rounded-2xl border border-[#E6E6E2] space-y-3">
          <UserCheck className="w-10 h-10 text-[#4A6CF7] mx-auto opacity-50" />
          <div className="font-bold text-sm text-[#111111]">
            No one's here yet. Add your first teammate to get started.
          </div>
          <p className="text-xs text-[#888888] max-w-sm mx-auto">
            Invite analysts, administrators, or auditors to collaborate inside your secure workspace.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E6E6E2] overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F8F6] border-b border-[#E6E6E2] text-[#888888] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Work Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E6E2] font-medium text-[#2D2D2D]">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-[#F8F8F6]/80 transition-colors">
                  <td className="p-4 font-bold text-[#111111] flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[10px]">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-[#4A6CF7]">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'owner' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                      u.role === 'admin' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      u.role === 'analyst' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                      'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      u.status === 'invited' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleResetPassword(u._id)} 
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E6E2] hover:bg-gray-50 text-xs font-semibold text-[#111111] transition cursor-pointer"
                    >
                      Force Reset
                    </button>
                    {u.status !== 'disabled' && u.role !== 'owner' && (
                      <button 
                        onClick={() => handleDisableUser(u._id)} 
                        className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-semibold transition cursor-pointer"
                      >
                        Disable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal Panel */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6 border border-[#E6E6E2]"
            >
              <div className="flex items-center justify-between border-b border-[#E6E6E2] pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-[#111111]">Provision Sub-User</h3>
                  <p className="text-xs text-[#555555] mt-0.5">Add employee to workspace with role-based access.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#888888] uppercase mb-1">Full Name *</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="Sarah Chen"
                    value={newUser.name} 
                    onChange={e => setNewUser({...newUser, name: e.target.value})} 
                    className="w-full bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#4A6CF7]" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#888888] uppercase mb-1">Corporate Work Email *</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="sarah.chen@acme.com"
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})} 
                    className="w-full bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#4A6CF7]" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#888888] uppercase mb-1">Role Permission Scope *</label>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})} 
                    className="w-full bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#4A6CF7] cursor-pointer"
                  >
                    <option value="admin">Admin — Workspace, users, policies</option>
                    <option value="analyst">Analyst — Telemetry, alerts, reports</option>
                    <option value="viewer">Viewer — Read-only dashboard view</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#888888] uppercase mb-1">
                    Temporary Password (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Leave blank for cryptographically random 72h password" 
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})} 
                    className="w-full bg-[#F8F8F6] border border-[#E6E6E2] rounded-xl px-4 py-2.5 text-xs font-mono outline-none focus:border-[#4A6CF7]" 
                  />
                  <span className="text-[10px] text-[#888888] mt-1 block">
                    Sub-users are required to set a permanent password on first login.
                  </span>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-[#E6E6E2]">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="px-4 py-2 text-xs font-semibold text-[#555555] hover:text-[#111111]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-[#2D2D2D] transition shadow-xs cursor-pointer"
                  >
                    Provision Sub-User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

