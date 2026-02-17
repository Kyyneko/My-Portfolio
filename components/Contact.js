'use client';
import { useLanguage } from '@/lib/i18n';
import { Mail, Github, Linkedin, Instagram } from 'lucide-react';
import styles from './Contact.module.css';

export default function Contact({ profile }) {
    const { t } = useLanguage();

    const links = [
        { key: 'email', icon: <Mail size={22} />, label: 'Email', value: profile.email, href: `mailto:${profile.email}`, style: styles.iconEmail },
        { key: 'github', icon: <Github size={22} />, label: 'GitHub', value: profile.github?.replace('https://github.com/', '').replace('https://github.com', 'github.com'), href: profile.github, style: styles.iconGithub },
        { key: 'linkedin', icon: <Linkedin size={22} />, label: 'LinkedIn', value: 'LinkedIn Profile', href: profile.linkedin, style: styles.iconLinkedin },
        { key: 'instagram', icon: <Instagram size={22} />, label: 'Instagram', value: profile.instagram?.replace('https://instagram.com/', '@').replace('https://instagram.com', 'instagram.com'), href: profile.instagram, style: styles.iconInstagram },
    ].filter(l => l.href && l.href !== '#' && l.href !== 'mailto:' && l.href !== '');

    return (
        <section id="contact" className="section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{t('contact.title')}</h2>
                    <p className="section-subtitle">{t('contact.subtitle')}</p>
                </div>

                <div className={styles.contactGrid}>
                    {links.map(link => (
                        <a key={link.key} href={link.href} className={`card ${styles.contactCard}`} target="_blank" rel="noreferrer">
                            <div className={`${styles.contactIcon} ${link.style}`}>
                                {link.icon}
                            </div>
                            <div>
                                <div className={styles.contactLabel}>{link.label}</div>
                                <div className={styles.contactValue}>{link.value}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
