'use client';
import { useLanguage } from '@/lib/i18n';
import styles from './Skills.module.css';

export default function Skills({ skills }) {
    const { t } = useLanguage();

    // Group by category
    const grouped = skills.reduce((acc, skill) => {
        const cat = skill.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    return (
        <section id="skills" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('skills.title')}</h2>
                    <p className="section-subtitle">{t('skills.subtitle')}</p>
                </div>

                <div className={styles.skillsGrid}>
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category} className="card">
                            <h3 className={styles.categoryTitle}>// {category}</h3>
                            {items.map(skill => (
                                <div key={skill.id} className={styles.skillItem}>
                                    <div className={styles.skillHeader}>
                                        <span className={styles.skillName}>{skill.name}</span>
                                        <span className={styles.skillPercent}>{skill.proficiency}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${skill.proficiency}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
