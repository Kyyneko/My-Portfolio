'use client';
import { LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { useState, useEffect } from 'react';
import { getProfile, getSkills, getProjects, getCertificates, getExperience, getEducation } from '@/lib/data';
import ParticlesBg from '@/components/ParticlesBg';
import ScrollReveal from '@/components/ScrollReveal';
import SectionDivider from '@/components/SectionDivider';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Certificates from '@/components/Certificates';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profile, skills, projects, certificates, experience, education] = await Promise.all([
          getProfile(),
          getSkills(),
          getProjects(),
          getCertificates(),
          getExperience(),
          getEducation(),
        ]);
        setData({ profile, skills, projects, certificates, experience, education });
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <LanguageProvider>
        <ThemeProvider>
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-primary)',
            fontSize: '1.25rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '3px solid rgba(96,165,250,0.15)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 1.5rem',
              }} />
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Loading portfolio...
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        </ThemeProvider>
      </LanguageProvider>
    );
  }

  if (!data) return null;

  return (
    <LanguageProvider>
      <ThemeProvider>
        <ParticlesBg />
        <Navbar />
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Hero profile={data.profile} />

          <SectionDivider />
          <ScrollReveal>
            <About profile={data.profile} />
          </ScrollReveal>

          <SectionDivider flip />
          <ScrollReveal>
            <Skills skills={data.skills} />
          </ScrollReveal>

          <SectionDivider />
          <ScrollReveal>
            <Projects projects={data.projects} />
          </ScrollReveal>

          <SectionDivider flip />
          <ScrollReveal>
            <Certificates certificates={data.certificates} />
          </ScrollReveal>

          <SectionDivider />
          <ScrollReveal>
            <Experience experience={data.experience} />
          </ScrollReveal>

          <SectionDivider flip />
          <ScrollReveal>
            <Education education={data.education} />
          </ScrollReveal>

          <SectionDivider />
          <ScrollReveal>
            <Contact profile={data.profile} />
          </ScrollReveal>
        </main>
        <Footer />
      </ThemeProvider>
    </LanguageProvider>
  );
}
