'use client';
import { useLanguage } from '@/lib/i18n';
import { ChevronDown, FileText, Mail, Github, Linkedin, ArrowRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import styles from './Hero.module.css';

function TypeWriter({ texts, speed = 80, deleteSpeed = 40, pauseTime = 2000 }) {
    const [text, setText] = useState('');
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const current = texts[textIndex];
        let timeout;

        if (!isDeleting && charIndex < current.length) {
            timeout = setTimeout(() => {
                setText(current.slice(0, charIndex + 1));
                setCharIndex(c => c + 1);
            }, speed + Math.random() * 40);
        } else if (!isDeleting && charIndex === current.length) {
            timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        } else if (isDeleting && charIndex > 0) {
            timeout = setTimeout(() => {
                setText(current.slice(0, charIndex - 1));
                setCharIndex(c => c - 1);
            }, deleteSpeed);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setTextIndex((textIndex + 1) % texts.length);
        }

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime]);

    return (
        <span className={styles.typewriter}>
            {text}
            <span className={styles.cursor}>|</span>
        </span>
    );
}

export default function Hero({ profile }) {
    const { lang, t } = useLanguage();
    const name = lang === 'en' ? profile.name_en : profile.name_id;
    const title = lang === 'en' ? profile.title_en : profile.title_id;
    const heroRef = useRef(null);
    const [loaded, setLoaded] = useState(false);
    const [showScroll, setShowScroll] = useState(true);

    const roleTitles = lang === 'en'
        ? ['Full-Stack Developer', 'ML Enthusiast', 'UI/UX Designer', 'Lab Coordinator']
        : ['Pengembang Full-Stack', 'Penggemar Machine Learning', 'Desainer UI/UX', 'Koordinator Laboratorium'];

    useEffect(() => {
        setLoaded(true);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowScroll(window.scrollY < 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section id="home" className={styles.hero} ref={heroRef}>
            {/* Animated background layers */}
            <div className={styles.bgOrbs}>
                <div className={`${styles.orb} ${styles.orb1}`} />
                <div className={`${styles.orb} ${styles.orb2}`} />
                <div className={`${styles.orb} ${styles.orb3}`} />
            </div>
            <div className={styles.gridOverlay} />
            <div className={styles.heroFade} />

            <div className={`${styles.heroContent} ${loaded ? styles.loaded : ''}`}>
                {/* Status badge */}
                <div className={styles.statusBadge}>
                    <span className={styles.statusDot} />
                    <span>{t('hero.greeting')}</span>
                </div>

                {/* Main name with gradient */}
                <h1 className={styles.heroName}>
                    <span className={styles.heroNameLine}>{name}</span>
                </h1>

                {/* Animated role typewriter */}
                <div className={styles.roleWrapper}>
                    <span className={styles.roleLabel}>{'>'} </span>
                    <TypeWriter texts={roleTitles} />
                </div>

                {/* Subtitle */}
                <p className={styles.heroSubtitle}>{t('hero.subtitle')}</p>

                {/* CTA buttons */}
                <div className={styles.heroCta}>
                    <button
                        className={styles.btnPrimary}
                        onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <span>{t('hero.cta_projects') || 'View Projects'}</span>
                        <ArrowRight size={18} />
                    </button>
                    <button
                        className={styles.btnOutline}
                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <Mail size={18} />
                        <span>{t('hero.cta_contact')}</span>
                    </button>
                    {profile.resume_url && profile.resume_url !== '#' && (
                        <a href={profile.resume_url} className={styles.btnGhost} target="_blank" rel="noreferrer">
                            <FileText size={18} />
                            <span>{t('hero.cta_resume')}</span>
                        </a>
                    )}
                </div>

                {/* Social links */}
                <div className={styles.socialLinks}>
                    {profile.github && (
                        <a href={profile.github} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="GitHub">
                            <Github size={20} />
                        </a>
                    )}
                    {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                            <Linkedin size={20} />
                        </a>
                    )}
                </div>

                {/* Terminal card removed */}
            </div>

            <div className={`${styles.scrollHint} ${showScroll ? styles.scrollVisible : styles.scrollHidden}`} onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
                <div className={styles.scrollMouse}>
                    <div className={styles.scrollWheel} />
                </div>
                <span>{t('hero.scroll_down')}</span>
            </div>
        </section>
    );
}
