'use client';
import { useLanguage } from '@/lib/i18n';
import styles from './Timeline.module.css';

export default function Experience({ experience }) {
    const { lang, t } = useLanguage();

    const formatDate = (date) => {
        if (!date) return t('experience.present');
        return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    };

    return (
        <section id="experience" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('experience.title')}</h2>
                    <p className="section-subtitle">{t('experience.subtitle')}</p>
                </div>

                <div className={styles.timeline}>
                    {experience.map(exp => {
                        const role = lang === 'en' ? exp.role_en : exp.role_id;
                        const desc = lang === 'en' ? exp.description_en : exp.description_id;
                        return (
                            <div key={exp.id} className={styles.timelineItem}>
                                <div className={`${styles.timelineDot} ${exp.is_current ? styles.timelineDotCurrent : ''}`} />
                                <div className="card">
                                    <div className={styles.itemHeader}>
                                        <div>
                                            <h3 className={styles.itemRole}>{role}</h3>
                                            <p className={styles.itemCompany}>{exp.company}</p>
                                        </div>
                                        <span className={styles.itemDate}>
                                            {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                                            {exp.is_current && <span className="badge badge-green" style={{ marginLeft: '0.5rem' }}>Current</span>}
                                        </span>
                                    </div>
                                    <p className={styles.itemDesc}>{desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
