'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { Sun, Moon, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';

const sections = ['about', 'skills', 'projects', 'certificates', 'experience', 'education', 'contact'];

export default function Navbar() {
    const { lang, switchLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Scroll spy
    useEffect(() => {
        if (pathname !== '/') return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            const scrollPos = window.scrollY + 100;
            let current = '';

            for (const sec of sections) {
                const el = document.getElementById(sec);
                if (el && el.offsetTop <= scrollPos) {
                    current = sec;
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname]);

    const scrollTo = (id) => {
        setMobileOpen(false);
        if (pathname === '/') {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            router.push(`/#${id}`);
        }
    };

    const handleLogoClick = () => {
        if (pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            router.push('/');
        }
    };

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
            <div className={styles.navInner}>
                <div className={styles.logo} onClick={handleLogoClick}>
                    <span className={styles.logoAccent}>{'<'}</span>
                    Portfolio
                    <span className={styles.logoAccent}>{' />'}</span>
                </div>

                <ul className={styles.navLinks}>
                    {sections.map(sec => (
                        <li key={sec}>
                            <button
                                className={`${styles.navLink} ${activeSection === sec ? styles.navLinkActive : ''}`}
                                onClick={() => scrollTo(sec)}
                            >
                                {t(`nav.${sec}`)}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className={styles.navControls}>
                    <button
                        className={styles.langBtn}
                        onClick={() => switchLanguage(lang === 'en' ? 'id' : 'en')}
                        title={lang === 'en' ? 'Switch to Bahasa Indonesia' : 'Switch to English'}
                    >
                        {lang === 'en' ? 'ID' : 'EN'}
                    </button>

                    <button className={styles.iconBtn} onClick={toggleTheme} title={t(`theme.${theme === 'dark' ? 'light' : 'dark'}`)}>
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    <button
                        className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>

            <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
                {sections.map(sec => (
                    <button
                        key={sec}
                        className={`${styles.navLink} ${activeSection === sec ? styles.navLinkActive : ''}`}
                        onClick={() => scrollTo(sec)}
                    >
                        {t(`nav.${sec}`)}
                    </button>
                ))}
            </div>
        </nav>
    );
}
