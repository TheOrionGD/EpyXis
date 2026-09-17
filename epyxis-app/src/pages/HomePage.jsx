import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/hero/HeroSection';
import StatsSection from '../components/stats/StatsSection';
import ModuleShowcase from '../components/modules/ModuleShowcase';
import ArchitectureSection from '../components/architecture/ArchitectureSection';
import DashboardPreviewSection from '../components/dashboard/DashboardPreviewSection';
import PrivacyMatrix from '../components/modules/PrivacyMatrix';
import RequestAccessPage from '../pages/RequestAccessPage';
import Footer from '../components/common/Footer';
import ScrollReveal from '../components/common/ScrollReveal';
import PageTransition from '../components/common/PageTransition';

export default function HomePage({ onSelectModule }) {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="space-y-16 pb-12">

        {/* Editorial Hero Section */}
        <section id="hero">
          <HeroSection
            onExplorePlatform={() => navigate('/dashboard')}
            onWatchExperience={() => navigate('/experience')}
          />
        </section>

        {/* Animated Statistics Counter */}
        <section id="stats" className="scroll-mt-28">
          <ScrollReveal direction="up" delay={0.1}>
            <StatsSection />
          </ScrollReveal>
        </section>

        {/* 6 Modular Security Engines Showcase */}
        <section id="modules" className="scroll-mt-28">
          <ScrollReveal direction="up" delay={0.15}>
            <ModuleShowcase onSelectModule={(mod) => onSelectModule(mod)} />
          </ScrollReveal>
        </section>

        {/* Interactive 10-Node OS Architecture Canvas */}
        <section id="architecture" className="scroll-mt-28">
          <ScrollReveal direction="up" delay={0.15}>
            <ArchitectureSection />
          </ScrollReveal>
        </section>

        {/* 3D Perspective Floating Dashboard Telemetry Preview */}
        <section id="preview" className="scroll-mt-28">
          <ScrollReveal direction="up" delay={0.15}>
            <DashboardPreviewSection onOpenDashboard={() => navigate('/dashboard')} />
          </ScrollReveal>
        </section>

        {/* Privacy-by-Design Matrix Section */}
        <section id="privacy" className="scroll-mt-28">
          <ScrollReveal direction="up" delay={0.15}>
            <PrivacyMatrix />
          </ScrollReveal>
        </section>

        {/* Embedded Request Access Section */}
        <section id="request-access" className="scroll-mt-28 max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" delay={0.15}>
            <RequestAccessPage isEmbedded={true} theme="light" />
          </ScrollReveal>
        </section>

        {/* Editorial Conclusion Footer */}
        <Footer
          onOpenDashboard={() => navigate('/dashboard')}
          onOpenExperience={() => navigate('/experience')}
        />
      </div>
    </PageTransition>
  );
}
