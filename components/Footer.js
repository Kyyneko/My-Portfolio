'use client';
import { useLanguage } from '@/lib/i18n';
import { Heart, Code2 } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerGradient} />
            <div className="container">
                <div className={styles.footerContent}>
                    <p className={styles.footerText}>
                        <Code2 size={14} className={styles.footerIcon} />
                        {t('footer.built_with')}{' '}
                        <Heart size={13} className={styles.footerHeart} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                        & <a href="https://nextjs.org" className={styles.footerLink} target="_blank" rel="noreferrer">Next.js</a>
                    </p>
                    <p className={styles.footerCopy}>© {year} — {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
}
