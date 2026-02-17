'use client';
import { useState, useEffect } from 'react';
import { getProfile, getSkills, getProjects, getCertificates, getExperience, getEducation } from '@/lib/data';
import { FileText, FileDown, Globe, Loader2 } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminCVGenerator() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState('');
    const [lang, setLang] = useState('en');
    const [toast, setToast] = useState('');

    useEffect(() => {
        async function load() {
            const [profile, skills, projects, certificates, experience, education] = await Promise.all([
                getProfile(), getSkills(), getProjects(), getCertificates(), getExperience(), getEducation()
            ]);
            setData({ profile, skills, projects, certificates, experience, education });
            setLoading(false);
        }
        load();
    }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handlePDF = async () => {
        setGenerating('pdf');
        try {
            const { generatePDF } = await import('@/lib/cv-pdf');
            const doc = generatePDF(data, lang);
            const name = lang === 'en' ? (data.profile?.name_en || 'CV') : (data.profile?.name_id || 'CV');
            doc.save(`CV_${name.replace(/\s+/g, '_')}_${lang.toUpperCase()}.pdf`);
            showToast('PDF downloaded!');
        } catch (err) {
            console.error(err);
            showToast('Error: ' + err.message);
        } finally { setGenerating(''); }
    };

    const handleDOCX = async () => {
        setGenerating('docx');
        try {
            const { downloadDOCX } = await import('@/lib/cv-docx');
            const name = lang === 'en' ? (data.profile?.name_en || 'CV') : (data.profile?.name_id || 'CV');
            await downloadDOCX(data, lang, `CV_${name.replace(/\s+/g, '_')}_${lang.toUpperCase()}`);
            showToast('DOCX downloaded!');
        } catch (err) {
            console.error(err);
            showToast('Error: ' + err.message);
        } finally { setGenerating(''); }
    };

    const stats = data ? {
        experience: data.experience?.length || 0,
        education: data.education?.length || 0,
        skills: data.skills?.length || 0,
        projects: data.projects?.length || 0,
        certificates: data.certificates?.length || 0,
    } : null;

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Generate CV</h1>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '0.75rem' }}>Loading portfolio data...</p>
                </div>
            ) : (
                <>
                    {/* CV Preview Summary */}
                    <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                            color: 'var(--accent-secondary)', marginBottom: '1rem'
                        }}>
                            {'// CV Content Preview'}
                        </h3>

                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '0.75rem', marginBottom: '1.25rem'
                        }}>
                            {[
                                { label: 'Experience', count: stats.experience, color: 'var(--accent-pink)' },
                                { label: 'Education', count: stats.education, color: 'var(--accent-cyan)' },
                                { label: 'Skills', count: stats.skills, color: 'var(--accent-green)' },
                                { label: 'Projects', count: stats.projects, color: 'var(--accent-orange)' },
                                { label: 'Certificates', count: stats.certificates, color: 'var(--accent-primary)' },
                            ].map(s => (
                                <div key={s.label} style={{
                                    padding: '0.75rem', borderRadius: 'var(--radius-md)',
                                    background: `${s.color}08`, border: `1px solid ${s.color}20`,
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.count}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                            fontSize: 'var(--font-size-sm)', color: 'var(--accent-green)'
                        }}>
                            ✅ ATS-Friendly format: clean layout, standard fonts, no graphics, proper heading hierarchy
                        </div>
                    </div>

                    {/* Language & Download Options */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)',
                            color: 'var(--accent-secondary)', marginBottom: '1rem'
                        }}>
                            {'// Download Options'}
                        </h3>

                        {/* Language Selection */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginBottom: '0.5rem', color: 'var(--text-secondary)',
                                fontSize: 'var(--font-size-sm)', fontWeight: 500
                            }}>
                                <Globe size={16} /> Language
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {[
                                    { value: 'en', label: '🇺🇸 English', desc: 'ATS standard' },
                                    { value: 'id', label: '🇮🇩 Indonesia', desc: 'Bahasa' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setLang(opt.value)}
                                        style={{
                                            flex: 1, padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: `2px solid ${lang === opt.value ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                            background: lang === opt.value ? 'rgba(96,165,250,0.08)' : 'transparent',
                                            color: lang === opt.value ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            fontFamily: 'var(--font-body)',
                                        }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{opt.label}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.7, marginTop: '0.15rem' }}>{opt.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Download Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                onClick={handlePDF}
                                disabled={generating !== ''}
                                style={{
                                    flex: 1, minWidth: '200px',
                                    padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    background: 'var(--accent-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                    opacity: generating ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <FileDown size={18} />
                                {generating === 'pdf' ? 'Generating...' : 'Download PDF'}
                            </button>

                            <button
                                type="button"
                                onClick={handleDOCX}
                                disabled={generating !== ''}
                                style={{
                                    flex: 1, minWidth: '200px',
                                    padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    background: 'rgba(96,165,250,0.08)',
                                    border: '2px solid rgba(96,165,250,0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--accent-primary)',
                                    cursor: generating ? 'not-allowed' : 'pointer',
                                    opacity: generating ? 0.6 : 1,
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <FileText size={18} />
                                {generating === 'docx' ? 'Generating...' : 'Download DOCX'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {toast && <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>{toast}</div>}
        </div>
    );
}
