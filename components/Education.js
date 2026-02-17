'use client';
import { useLanguage } from '@/lib/i18n';
import styles from './Timeline.module.css';

export default function Education({ education }) {
    const { lang, t } = useLanguage();

    return (
        <section id="education" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('education.title')}</h2>
                    <p className="section-subtitle">{t('education.subtitle')}</p>
                </div>

                <div className={styles.timeline}>
                    {education.map(edu => {
                        const degree = lang === 'en' ? edu.degree_en : edu.degree_id;
                        const field = lang === 'en' ? edu.field_en : edu.field_id;
                        const desc = lang === 'en' ? edu.description_en : edu.description_id;
                        return (
                            <div key={edu.id} className={styles.timelineItem}>
                                <div className={styles.timelineDot} />
                                <div className="card">
                                    <div className={styles.itemHeader}>
                                        <div>
                                            <h3 className={styles.itemRole}>{degree}</h3>
                                            <p className={styles.itemCompany}>{edu.institution}</p>
                                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{field}</p>
                                        </div>
                                        <span className={styles.itemDate}>{edu.start_year} — {edu.end_year || t('experience.present')}</span>
                                    </div>
                                    {desc && <p className={styles.itemDesc}>{desc}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
