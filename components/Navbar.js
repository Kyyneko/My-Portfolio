'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
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

    // Refs for sliding indicator
    const navLinksRef = useRef(null);
    const linkRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 0 });

    // Update indicator position when active section changes
    const updateIndicator = useCallback(() => {
        if (!activeSection || !navLinksRef.current) {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
            return;
        }
        const activeLink = linkRefs.current[activeSection];
        const container = navLinksRef.current;
        if (activeLink && container) {
            const linkRect = activeLink.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            setIndicatorStyle({
                width: linkRect.width,
                left: linkRect.left - containerRect.left,
                opacity: 1,
            });
        }
    }, [activeSection]);

    useEffect(() => {
        updateIndicator();
    }, [updateIndicator]);

    // Also update on resize (font/layout changes)
    useEffect(() => {
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [updateIndicator]);

    // Scroll spy
    useEffect(() => {
        if (pathname !== '/') return;

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);

            let current = '';

            for (const sec of sections) {
                const el = document.getElementById(sec);
                if (el) {
                    // Use getBoundingClientRect for accurate position regardless of
                    // CSS transforms (e.g. ScrollReveal) or nested positioned parents
                    const rect = el.getBoundingClientRect();
                    if (rect.top <= 120) {
                        current = sec;
                    }
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

                <ul className={styles.navLinks} ref={navLinksRef}>
                    {/* Sliding indicator */}
                    <div
                        className={styles.navIndicator}
                        style={{
                            width: `${indicatorStyle.width}px`,
                            transform: `translateX(${indicatorStyle.left}px)`,
                            opacity: indicatorStyle.opacity,
                        }}
                    />
                    {sections.map(sec => (
                        <li key={sec}>
                            <button
                                ref={el => { linkRefs.current[sec] = el; }}
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
