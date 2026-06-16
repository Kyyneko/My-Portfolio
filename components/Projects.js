'use client';
import { useLanguage } from '@/lib/i18n';
import { ExternalLink, Github, FolderOpen, Star } from 'lucide-react';
import styles from './Projects.module.css';

import Link from 'next/link';
import Image from 'next/image';

const getCleanTechStack = (techStack) => {
    if (!techStack || !Array.isArray(techStack)) return [];
    
    const cleanTechs = [];
    techStack.forEach(tech => {
        // Extract part after colon if exists (e.g. "Backend Framework: Laravel 10" -> "Laravel 10")
        let parts = tech.includes(':') ? tech.split(':')[1] : tech;
        
        // Remove parentheses and their contents (e.g. "SQLite (Default Development)" -> "SQLite")
        parts = parts.replace(/\([^)]*\)/g, '');
        
        // Split by comma in case there are multiple items in one string (e.g. "Blade Templates, Alpine.js")
        const items = parts.split(',').map(item => item.trim()).filter(Boolean);
        
        cleanTechs.push(...items);
    });
    
    return cleanTechs;
};

export default function Projects({ projects }) {
    const { lang, t } = useLanguage();

    return (
        <section id="projects" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('projects.title')}</h2>
                    <p className="section-subtitle">{t('projects.subtitle')}</p>
                </div>

                <div className={styles.projectsGrid}>
                    {projects.map(project => {
                        const title = lang === 'en' ? project.title_en : project.title_id;
                        const desc = lang === 'en' ? project.description_en : project.description_id;
                        const cleanTechs = getCleanTechStack(project.tech_stack);
                        const visibleTechs = cleanTechs.slice(0, 4);
                        const remainingCount = cleanTechs.length - visibleTechs.length;
                        
                        return (
                            <div key={project.id} className={`card ${styles.projectCard}`}>
                                <div className={styles.cardContent}>
                                    {project.featured && (
                                        <div className={styles.featuredBadge}>
                                            <span className="badge badge-orange"><Star size={12} /> {t('projects.featured')}</span>
                                        </div>
                                    )}

                                    {project.image_url && project.image_url !== '#' ? (
                                        <Link href={`/projects/${project.slug}`} className={styles.projectImageWrapper}>
                                            <Image 
                                                src={project.image_url} 
                                                alt={title} 
                                                fill
                                                className={styles.projectImage} 
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </Link>
                                    ) : (
                                        <Link href={`/projects/${project.slug}`} className={styles.projectImagePlaceholder}>
                                            <FolderOpen size={40} />
                                        </Link>
                                    )}

                                    <div className={styles.projectContentBody}>
                                        <Link href={`/projects/${project.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <h3 className={styles.projectTitle}>{title}</h3>
                                        </Link>
                                        <p className={styles.projectDesc}>{desc}</p>

                                         <div className={styles.techStack}>
                                            {visibleTechs.map((tech, i) => (
                                                <span key={i} className="badge">{tech}</span>
                                            ))}
                                            {remainingCount > 0 && (
                                                <span className="badge badge-purple" style={{ opacity: 0.95 }}>
                                                    +{remainingCount} {lang === 'en' ? 'more' : 'lainnya'}
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.projectLinks}>
                                            <Link href={`/projects/${project.slug}`} className="btn btn-primary btn-sm">
                                                {lang === 'en' ? 'Details' : 'Detail'}
                                            </Link>
                                            {project.live_url && project.live_url !== '#' && (
                                                <a href={project.live_url} className="btn btn-outline btn-sm" target="_blank" rel="noreferrer">
                                                    <ExternalLink size={14} /> {t('projects.view_live')}
                                                </a>
                                            )}
                                            {project.github_url && project.github_url !== '#' && (
                                                <a href={project.github_url} className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
                                                    <Github size={14} /> {t('projects.view_code')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
