'use client';
import { useLanguage } from '@/lib/i18n';
import { User, MapPin, Briefcase, Sparkles } from 'lucide-react';
import styles from './About.module.css';

export default function About({ profile }) {
    const { lang, t } = useLanguage();
    const bio = lang === 'en' ? profile.bio_en : profile.bio_id;

    return (
        <section id="about" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('about.title')}</h2>
                    <p className="section-subtitle">{t('about.subtitle')}</p>
                </div>

                <div className={styles.aboutGrid}>
                    <div className={styles.avatarColumn}>
                        <div className={styles.avatarWrapper}>
                            <div className={styles.avatarGlow} />
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.name_en} className={styles.avatar} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <User size={64} />
                                </div>
                            )}
                        </div>

                        {/* Quick info cards */}
                        <div className={styles.quickInfo}>
                            <div className={styles.infoItem}>
                                <Briefcase size={14} className={styles.infoIcon} />
                                <span>{lang === 'en' ? 'Backend Developer' : 'Backend Developer'}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <Sparkles size={14} className={styles.infoIcon} />
                                <span>{lang === 'en' ? 'Open to Work' : 'Terbuka untuk Kerja'}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bioColumn}>
                        <p className={styles.bio}>{bio}</p>
                        <div className={styles.bioCodeBlock}>
                            <div className={styles.codeHeader}>
                                <span className={styles.codeDot} style={{ background: '#ff5f57' }} />
                                <span className={styles.codeDot} style={{ background: '#febc2e' }} />
                                <span className={styles.codeDot} style={{ background: '#28c840' }} />
                                <span className={styles.codeFileName}>about.js</span>
                            </div>
                            <div className={styles.codeBody}>
                                <div><span className={styles.lineNum}>1</span><span style={{ color: 'var(--accent-primary)' }}>const</span> aboutMe = {'{'}</div>
                                <div><span className={styles.lineNum}>2</span>  <span style={{ color: 'var(--accent-pink)' }}>email</span>: <span style={{ color: 'var(--accent-green)' }}>&quot;{profile.email}&quot;</span>,</div>
                                <div><span className={styles.lineNum}>3</span>  <span style={{ color: 'var(--accent-pink)' }}>github</span>: <span style={{ color: 'var(--accent-green)' }}>&quot;{profile.github}&quot;</span>,</div>
                                <div><span className={styles.lineNum}>4</span>  <span style={{ color: 'var(--accent-pink)' }}>linkedin</span>: <span style={{ color: 'var(--accent-green)' }}>&quot;{profile.linkedin}&quot;</span>,</div>
                                <div><span className={styles.lineNum}>5</span>{'};'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
