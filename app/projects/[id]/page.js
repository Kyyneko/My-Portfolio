'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/lib/data';
import { useLanguage, LanguageProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticlesBg from '@/components/ParticlesBg';
import { ArrowLeft, ExternalLink, Github, Star, Calendar, Layers, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';

function ProjectDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { lang, t } = useLanguage();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

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

    const allImages = [];
    if (project?.image_url && project.image_url !== '#') allImages.push(project.image_url);
    if (project?.gallery_urls && project.gallery_urls.length > 0) {
        allImages.push(...project.gallery_urls);
    }

    useEffect(() => {
        if (allImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % allImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [allImages.length]);

    const nextSlide = () => setCurrentSlide(prev => (prev + 1) % allImages.length);
    const prevSlide = () => setCurrentSlide(prev => (prev - 1 + allImages.length) % allImages.length);

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
    const coreFeatures = lang === 'en' ? project.core_features_en : project.core_features_id || project.core_features_en;

    let techStackList = [];
    try {
        techStackList = JSON.parse(project.tech_rationale_en || '[]');
        if (!Array.isArray(techStackList)) techStackList = [];
    } catch {
        techStackList = (project.tech_stack || []).map(t => ({
            name: t,
            reason_id: project.tech_rationale_id || '',
            reason_en: project.tech_rationale_en || ''
        }));
    }

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

                    {allImages.length > 0 && (
                        <div className={styles.imageContainer}>
                            {allImages.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`${title} - ${idx + 1}`}
                                    className={`${styles.heroImage} ${idx === currentSlide ? styles.activeSlide : styles.inactiveSlide}`}
                                />
                            ))}
                            <div className={styles.imageOverlay}></div>
                            
                            {allImages.length > 1 && (
                                <>
                                    <button onClick={prevSlide} className={`${styles.carouselBtn} ${styles.prevBtn}`}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button onClick={nextSlide} className={`${styles.carouselBtn} ${styles.nextBtn}`}>
                                        <ChevronRight size={24} />
                                    </button>
                                    
                                    <div className={styles.carouselDots}>
                                        {allImages.map((_, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => setCurrentSlide(idx)}
                                                className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ''}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
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
                                
                                <div className={styles.dynamicTechList}>
                                    {techStackList.map((tech, i) => {
                                        const reason = lang === 'en' ? tech.reason_en : tech.reason_id || tech.reason_en;
                                        return (
                                            <div key={i} className={styles.dynamicTechItem}>
                                                <div className={styles.techBadgeContainer}>
                                                    <span className={styles.techBadge}>{tech.name}</span>
                                                </div>
                                                {reason ? (
                                                    <div className={styles.techReason} dangerouslySetInnerHTML={{ __html: reason.replace(/\n/g, '<br/>') }} />
                                                ) : (
                                                    <div className={styles.techReason} style={{ fontStyle: 'italic', opacity: 0.6 }}>
                                                        {lang === 'en' ? 'No rationale provided.' : 'Tidak ada alasan.'}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {techStackList.length === 0 && (
                                        <p style={{ color: 'var(--text-muted)' }}>{lang === 'en' ? 'No tech stack details.' : 'Tidak ada detail tech stack.'}</p>
                                    )}
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
