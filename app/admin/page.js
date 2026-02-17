'use client';
import { useState, useEffect } from 'react';
import { getProfile, getSkills, getProjects, getCertificates, getExperience, getEducation } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { User, FolderOpen, Code, Award, Briefcase, GraduationCap, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const configured = isSupabaseConfigured();

    useEffect(() => {
        async function load() {
            const [profile, skills, projects, certs, exp, edu] = await Promise.all([
                getProfile(), getSkills(), getProjects(), getCertificates(), getExperience(), getEducation()
            ]);
            setStats({
                profile: profile ? 1 : 0,
                skills: skills.length,
                projects: projects.length,
                certificates: certs.length,
                experience: exp.length,
                education: edu.length,
            });
        }
        load();
    }, []);

    const cards = [
        { key: 'profile', icon: <User size={24} />, label: 'Profile', count: stats?.profile, href: '/admin/profile', color: 'var(--accent-primary)' },
        { key: 'projects', icon: <FolderOpen size={24} />, label: 'Projects', count: stats?.projects, href: '/admin/projects', color: 'var(--accent-secondary)' },
        { key: 'skills', icon: <Code size={24} />, label: 'Skills', count: stats?.skills, href: '/admin/skills', color: 'var(--accent-green)' },
        { key: 'certificates', icon: <Award size={24} />, label: 'Certificates', count: stats?.certificates, href: '/admin/certificates', color: 'var(--accent-orange)' },
        { key: 'experience', icon: <Briefcase size={24} />, label: 'Experience', count: stats?.experience, href: '/admin/experience', color: 'var(--accent-pink)' },
        { key: 'education', icon: <GraduationCap size={24} />, label: 'Education', count: stats?.education, href: '/admin/education', color: 'var(--accent-cyan)' },
    ];

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Dashboard</h1>
            </div>

            {!configured && (
                <div style={{
                    background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem',
                    display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--accent-yellow)'
                }}>
                    <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <strong>Supabase not configured</strong>
                        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '0.25rem', opacity: 0.8 }}>
                            The site is showing demo data. To enable editing, add your Supabase credentials to <code>.env.local</code>.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid-3">
                {cards.map(card => (
                    <Link key={card.key} href={card.href} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                                background: `${card.color}15`, color: card.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem'
                            }}>
                                {card.icon}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-3xl)', fontWeight: 700 }}>
                                {stats ? card.count : '—'}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{card.label}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
