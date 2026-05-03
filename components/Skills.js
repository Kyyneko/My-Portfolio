'use client';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import styles from './Skills.module.css';

export default function Skills({ skills }) {
    const { t, lang } = useLanguage();

    const focusGroups = {};
    const otherGroups = {};

    skills.forEach(skill => {
        const cat = skill.category || 'Other';
        const catLower = cat.toLowerCase();
        if (catLower.includes('backend') || catLower.includes('data') || catLower.includes('ai') || catLower.includes('ml')) {
            if (!focusGroups[cat]) focusGroups[cat] = [];
            focusGroups[cat].push(skill);
        } else {
            if (!otherGroups[cat]) otherGroups[cat] = [];
            otherGroups[cat].push(skill);
        }
    });

    const otherCategories = Object.keys(otherGroups);
    const [activeFilter, setActiveFilter] = useState(null);

    useEffect(() => {
        if (otherCategories.length > 0 && !activeFilter) {
            setActiveFilter(otherCategories[0]);
        }
    }, [otherCategories, activeFilter]);

    return (
        <section id="skills" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('skills.title')}</h2>
                    <p className="section-subtitle">{t('skills.subtitle')}</p>
                </div>

                <div className={styles.skillsGrid}>
                    {/* Focus Categories */}
                    {Object.entries(focusGroups).map(([category, items]) => (
                        <div key={category} className="card">
                            <h3 className={styles.categoryTitle}>// {category}</h3>
                            <div className={styles.skillTagsWrapper}>
                                {items.map(skill => (
                                    <div key={skill.id} className={styles.skillBadge}>
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Other Categories */}
                    {otherCategories.length > 0 && activeFilter && (
                        <div className={`card ${styles.otherSection}`}>
                            <div className={styles.otherHeader}>
                                <h3 className={styles.categoryTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                                    // {lang === 'en' ? 'Other Technologies' : 'Teknologi Lainnya'}
                                </h3>
                                <div className={styles.filterTabs}>
                                    {otherCategories.map(cat => (
                                        <button 
                                            key={cat}
                                            onClick={() => setActiveFilter(cat)}
                                            className={`${styles.filterTab} ${activeFilter === cat ? styles.activeTab : ''}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className={styles.skillTagsWrapper} style={{ marginTop: '1.5rem' }}>
                                {otherGroups[activeFilter]?.map(skill => (
                                    <div key={skill.id} className={styles.skillBadge}>
                                        {skill.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
