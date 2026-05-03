'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/lib/data';
import { useLanguage, LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticlesBg from '@/components/ParticlesBg';
import { ArrowLeft, ExternalLink, Github, Star, Calendar, Layers, Code } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

function ProjectDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { lang, t } = useLanguage();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProject() {
            if (!params?.id) return;
            try {
                const data = await getProjectById(params.id);
                if (data) {
                    setProject(data);
                } else {
                    router.push('/#projects'); // redirect if not found
                }
            } catch (err) {
                console.error(err);
                router.push('/#projects');
            } finally {
                setLoading(false);
            }
        }
        fetchProject();
    }, [params?.id, router]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (!project) return null;

    const title = lang === 'en' ? project.title_en : project.title_id || project.title_en;
    const desc = lang === 'en' ? project.description_en : project.description_id || project.description_en;
    const longDesc = lang === 'en' ? project.long_description_en : project.long_description_id || project.long_description_en;
    const techRationale = lang === 'en' ? project.tech_rationale_en : project.tech_rationale_id || project.tech_rationale_en;
    const coreFeatures = lang === 'en' ? project.core_features_en : project.core_features_id || project.core_features_en;

    return (
        <main className={styles.main}>
            <ParticlesBg />
            <Navbar />
            
            <div className={styles.container}>
                <Link href="/#projects" className={styles.backButton}>
                    <ArrowLeft size={18} />
                    {lang === 'en' ? 'Back to Projects' : 'Kembali ke Proyek'}
                </Link>

                <article className={styles.projectArticle}>
                    <header className={styles.projectHeader}>
                        <div className={styles.titleSection}>
                            <h1 className={styles.title}>{title}</h1>
                            {project.featured && (
                                <span className={styles.featuredBadge}>
                                    <Star size={16} /> {lang === 'en' ? 'Featured Project' : 'Proyek Unggulan'}
                                </span>
                            )}
                        </div>
                        <p className={styles.subtitle}>{desc}</p>
                        
                        <div className={styles.actionButtons}>
                            {project.live_url && project.live_url !== '#' && (
                                <a href={project.live_url} target="_blank" rel="noreferrer" className={styles.btnPrimary}>
                                    <ExternalLink size={18} /> {lang === 'en' ? 'View Live App' : 'Lihat Aplikasi Live'}
                                </a>
                            )}
                            {project.github_url && project.github_url !== '#' && (
                                <a href={project.github_url} target="_blank" rel="noreferrer" className={styles.btnSecondary}>
                                    <Github size={18} /> {lang === 'en' ? 'Source Code' : 'Kode Sumber'}
                                </a>
                            )}
                        </div>
                    </header>

                    {project.image_url && project.image_url !== '#' && (
                        <div className={styles.imageContainer}>
                            <img src={project.image_url} alt={title} className={styles.heroImage} />
                            <div className={styles.imageOverlay}></div>
                        </div>
                    )}

                    <div className={styles.contentGrid}>
                        <div className={styles.mainContent}>
                            <section className={styles.contentSection}>
                                <h2><Layers className={styles.sectionIcon} /> {lang === 'en' ? 'Project Overview' : 'Ringkasan Proyek'}</h2>
                                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: (longDesc || '').replace(/\n/g, '<br/>') || (lang === 'en' ? 'No detailed overview provided.' : 'Tidak ada ringkasan detail.') }} />
                            </section>

                            <section className={styles.contentSection}>
                                <h2><Star className={styles.sectionIcon} /> {lang === 'en' ? 'Core Features & Rationale' : 'Fitur Utama & Alasan'}</h2>
                                <div className={styles.richText} dangerouslySetInnerHTML={{ __html: (coreFeatures || '').replace(/\n/g, '<br/>') || (lang === 'en' ? 'No feature details provided.' : 'Tidak ada detail fitur.') }} />
                            </section>
                        </div>

                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarCard}>
                                <h3><Code className={styles.sectionIcon} /> {lang === 'en' ? 'Tech Stack & Architecture' : 'Tech Stack & Arsitektur'}</h3>
                                
                                <div className={styles.techStackList}>
                                    {(project.tech_stack || []).map((tech, i) => (
                                        <span key={i} className={styles.techBadge}>{tech}</span>
                                    ))}
                                </div>

                                <div className={styles.techRationale}>
                                    <h4>{lang === 'en' ? 'Why this stack?' : 'Mengapa stack ini?'}</h4>
                                    <p dangerouslySetInnerHTML={{ __html: (techRationale || '').replace(/\n/g, '<br/>') || (lang === 'en' ? 'No rationale provided.' : 'Tidak ada alasan yang diberikan.') }} />
                                </div>
                            </div>
                        </aside>
                    </div>
                </article>
            </div>
            <Footer />
        </main>
    );
}

export default function ProjectDetail() {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <ProjectDetailContent />
            </ThemeProvider>
        </LanguageProvider>
    );
}
