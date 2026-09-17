import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp, Shield, Layers, Cpu, Eye, Lock, Send, Menu, X, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'top', label: 'Top', icon: ChevronUp, path: '/' },
  { id: 'metrics', label: 'Metrics', icon: Shield, path: '/#stats' },
  { id: 'engines', label: 'Engines', icon: Layers, path: '/modules' },
  { id: 'architecture', label: 'Architecture', icon: Cpu, path: '/architecture' },
  { id: 'dashboard', label: 'Dashboard', icon: Eye, path: '/dashboard' },
  { id: 'privacy', label: 'Privacy', icon: Lock, path: '/privacy' },
  { id: 'access', label: 'Access', icon: Send, path: '/request-access' },
];

export default function HeaderNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Reveal header when scrolled up, hide when scrolled down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 40) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false); // Scroll down -> hide
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true); // Scroll up -> reveal
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (item) => {
    if (item.id === 'top') {
      return location.pathname === '/' && (!location.hash || location.hash === '#top' || location.hash === '#hero');
    }
    if (item.id === 'metrics') {
      return location.pathname === '/' && location.hash === '#stats';
    }
    if (item.path.includes('#')) {
      const hash = item.path.split('#')[1];
      return location.pathname === '/' && location.hash === `#${hash}`;
    }
    return location.pathname === item.path;
  };

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    if (item.id === 'top') {
      if (location.pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/');
      }
    } else if (item.path.includes('#')) {
      const hash = item.path.split('#')[1];
      if (location.pathname === '/') {
        const el = document.getElementById(hash);
        if (el) {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      } else {
        navigate(item.path);
      }
    } else {
      navigate(item.path);
    }
  };

  return (
    <header className={`fixed top-4 left-0 right-0 z-50 max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 transform ${
      isVisible || mobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-28 opacity-0 pointer-events-none'
    }`}>
      <div className="glass-capsule rounded-full px-4 sm:px-6 py-2 flex items-center justify-between shadow-2xl backdrop-blur-2xl border border-white/90 bg-white/85 transition-all duration-300">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 cursor-pointer group shrink-0 pr-2">
          <img src="/EPYXIS.png" alt="EPYXIS Logo" className="w-7 h-7 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300 border border-black/10" />
          <span className="font-extrabold text-base tracking-tight text-[#111111]">
            Epyxis<span className="text-[#4A6CF7]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation Items (Exact Screenshot Match: Icon + Label Pills) */}
        <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium text-[#555555]">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`relative px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-[#111111] text-white font-bold shadow-md'
                    : 'text-[#555555] hover:text-[#111111] hover:bg-black/5'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${active ? 'text-[#4A6CF7]' : ''}`} />
                <span className="text-xs tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Action CTA Buttons */}
        <div className="hidden sm:flex items-center space-x-2 pl-2">
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#2D2D2D] hover:bg-black/5 transition-all cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-magnetic inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-[#2D2D2D] shadow-md shadow-black/10 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A6CF7]" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center space-x-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-magnetic px-3 py-1 rounded-full bg-[#111111] text-white text-xs font-semibold cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-full bg-black/5 text-[#111111] hover:bg-black/10 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl bg-white/95 backdrop-blur-2xl border border-black/5 shadow-2xl space-y-1.5 animate-fadeIn">
          {NAV_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                  active ? 'bg-[#111111] text-white font-bold' : 'text-[#2D2D2D] hover:bg-black/5'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${active ? 'text-[#4A6CF7]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-black/5 flex flex-col space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-center bg-black/5 text-[#111111] cursor-pointer"
            >
              Login Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
