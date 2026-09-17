import React, { useEffect } from 'react';
import LiveDashboardContent from '../components/dashboard/LiveDashboardContent';
import { useNavigate } from 'react-router-dom';
import { useRbac } from '../context/RbacContext';
import PageTransition from '../components/common/PageTransition';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useRbac();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token && (!currentUser || currentUser.id === 'usr-authenticated')) {
      navigate('/login');
    }
  }, [token, currentUser, navigate]);

  if (!token && (!currentUser || currentUser.id === 'usr-authenticated')) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#F0F2F6] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900">Authentication Required</h2>
            <p className="text-xs text-slate-500">
              Please log in with your organization credentials or temporary password to access your multi-tenant security workspace.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer"
            >
              Go to Login Portal
            </button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative bg-transparent p-0 m-0">
        {/* Background Video for Desktop */}
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
          className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-15 pointer-events-none"
        >
          <source src="/desktop.mp4" type="video/mp4" />
        </video>

        {/* Full Live Dashboard UI */}
        <div className="w-full relative z-10 p-2 sm:p-4 md:p-6">
          <LiveDashboardContent />
        </div>
      </div>
    </PageTransition>
  );
}
