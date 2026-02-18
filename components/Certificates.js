'use client';
import { useLanguage } from '@/lib/i18n';
import { Award, ExternalLink } from 'lucide-react';
import styles from './Certificates.module.css';

export default function Certificates({ certificates }) {
    const { t, lang } = useLanguage();

    return (
        <section id="certificates" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('certificates.title')}</h2>
                    <p className="section-subtitle">{t('certificates.subtitle')}</p>
                </div>

                <div className={styles.certsGrid}>
                    {certificates.map(cert => (
                        <div key={cert.id} className={`card ${styles.certCard}`}>
                            {/* Certificate image preview */}
                            {cert.image_url && cert.image_url !== '' && cert.image_url !== '#' ? (
                                <div className={styles.certImageWrapper}>
                                    <img
                                        src={cert.image_url}
                                        alt={cert.title}
                                        className={styles.certImage}
                                    />
                                    <div className={styles.certImageOverlay}>
                                        <Award size={20} />
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.certImagePlaceholder}>
                                    <Award size={32} />
                                    <span>Certificate</span>
                                </div>
                            )}

                            {/* Certificate info */}
                            <div className={styles.certInfo}>
                                <div>
                                    <h3 className={styles.certTitle}>{cert.title}</h3>
                                    <p className={styles.certIssuer}>{cert.issuer}</p>
                                    <p className={styles.certDate}>
                                        {new Date(cert.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long' })}
                                    </p>
                                </div>

                                {cert.credential_url && cert.credential_url !== '#' && (
                                    <div className={styles.certFooter}>
                                        <a
                                            href={cert.credential_url}
                                            className={styles.certLink}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <span>{t('certificates.view_credential')}</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
