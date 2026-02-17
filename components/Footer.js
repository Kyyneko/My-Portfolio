'use client';
import { useLanguage } from '@/lib/i18n';
import { Heart } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className="container">
                <p className={styles.footerText}>
                    {t('footer.built_with')} <Heart size={14} className={styles.footerHeart} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                    & <a href="https://nextjs.org" className={styles.footerLink} target="_blank" rel="noreferrer">Next.js</a>
                </p>
                <p className={styles.footerText}>© {year} — {t('footer.rights')}</p>
            </div>
        </footer>
    );
}
