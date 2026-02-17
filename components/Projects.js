'use client';
import { useLanguage } from '@/lib/i18n';
import { ExternalLink, Github, FolderOpen, Star } from 'lucide-react';
import styles from './Projects.module.css';

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
                        return (
                            <div key={project.id} className={`card ${styles.projectCard}`}>
                                <div className={styles.cardContent}>
                                    {project.featured && (
                                        <div className={styles.featuredBadge}>
                                            <span className="badge badge-orange"><Star size={12} /> {t('projects.featured')}</span>
                                        </div>
                                    )}

                                    {project.image_url ? (
                                        <img src={project.image_url} alt={title} className={styles.projectImage} />
                                    ) : (
                                        <div className={styles.projectImagePlaceholder}>
                                            <FolderOpen size={40} />
                                        </div>
                                    )}

                                    <h3 className={styles.projectTitle}>{title}</h3>
                                    <p className={styles.projectDesc}>{desc}</p>

                                    <div className={styles.techStack}>
                                        {(project.tech_stack || []).map((tech, i) => (
                                            <span key={i} className="badge">{tech}</span>
                                        ))}
                                    </div>

                                    <div className={styles.projectLinks}>
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
