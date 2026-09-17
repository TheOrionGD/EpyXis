import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { RbacProvider } from './context/RbacContext';
import RbacGuardModal from './components/common/RbacGuardModal';
import CanvasContainer from './components/3d/CanvasContainer';
import BackgroundVideo from './components/common/BackgroundVideo';
import MobileBlocker from './components/common/MobileBlocker';
import HeaderNavbar from './components/common/HeaderNavbar';

import ScrollProgressControls from './components/common/ScrollProgressControls';

import HomePage from './pages/HomePage';
import ModulesPage from './pages/ModulesPage';
import ArchitecturePage from './pages/ArchitecturePage';
import DashboardPage from './pages/DashboardPage';
import PrivacyPage from './pages/PrivacyPage';
import ExperiencePage from './pages/ExperiencePage';
import RequestAccessPage from './pages/RequestAccessPage';
import ProviderAdminPage from './pages/ProviderAdminPage';
import LoginPage from './pages/LoginPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

import { X, CheckCircle2 } from 'lucide-react';


import SplashScreen from './components/common/SplashScreen';

function AppRoutes() {
  const [selectedModule, setSelectedModule] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Lenis Smooth Scroll Integration
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <MobileBlocker>
      {/* EPYXIS Splash Screen */}
      <SplashScreen />

      <div className="min-h-screen bg-[#F8F8F6] text-[#111111] selection:bg-[#4A6CF7] selection:text-white relative overflow-x-hidden">
        
        {/* Global Scroll Progress Bar & Floating Top Button */}
        <ScrollProgressControls />

        {/* Studio Fog Background */}
        <div className="studio-bg-fog" />

        {/* RBAC Security Guard Modal */}
        <RbacGuardModal />

        {/* Conditional Background: Video for Dashboard, 3D Canvas elsewhere */}
        {location.pathname === '/dashboard' ? (
          <BackgroundVideo />
        ) : (
          <CanvasContainer />
        )}



      {/* Dedicated Multi-Page Routes */}
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage onSelectModule={(mod) => setSelectedModule(mod)} />} />
          <Route path="/modules" element={<ModulesPage onSelectModule={(mod) => setSelectedModule(mod)} />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/request-access" element={<RequestAccessPage />} />
          <Route path="/provider-admin" element={<ProviderAdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile-setup" element={<ProfileSetupPage />} />
        </Routes>
      </div>

      {/* Module Inspector Drawer */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 sm:p-10 space-y-6 relative border border-white/80 bg-white/95 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1 rounded-full bg-[#111111] text-white text-xs font-bold">
                {selectedModule.badge}
              </span>
              <button
                onClick={() => setSelectedModule(null)}
                className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-[#111111] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="editorial-headline text-3xl font-extrabold text-[#111111]">
              {selectedModule.title}
            </h3>

            <p className="text-sm text-[#555555] leading-relaxed">
              {selectedModule.description}
            </p>

            <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-[#F8F8F6] border border-black/5">
              {selectedModule.metrics.map((m, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#888888]">{m.label}</div>
                  <div className="text-xl font-extrabold text-[#111111]">{m.value}</div>
                  <div className="text-xs text-[#4A6CF7] font-semibold">{m.status}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#888888]">Engine Technical Specs</h4>
              {selectedModule.highlights.map((h, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-xs text-[#2D2D2D] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#4A6CF7] mt-0.5 shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedModule(null);
                  navigate('/dashboard');
                }}
                className="btn-magnetic px-6 py-3 rounded-2xl bg-[#111111] text-white text-xs font-semibold hover:bg-[#2D2D2D] cursor-pointer shadow-md"
              >
                Test in Live Dashboard Page
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
    </MobileBlocker>
  );
}

export default function App() {
  return (
    <RbacProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </RbacProvider>
  );
}
