'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, onAuthStateChange, signOut } from '@/lib/data';
import { LanguageProvider } from '@/lib/i18n';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { User, FolderOpen, Award, Briefcase, GraduationCap, Code, ArrowLeft, LogOut, LayoutDashboard, Sun, Moon, FileDown } from 'lucide-react';
import Link from 'next/link';
import styles from './admin.module.css';

const navItems = [
    { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '/admin' },
    { key: 'profile', icon: <User size={18} />, label: 'Profile', href: '/admin/profile' },
    { key: 'projects', icon: <FolderOpen size={18} />, label: 'Projects', href: '/admin/projects' },
    { key: 'skills', icon: <Code size={18} />, label: 'Skills', href: '/admin/skills' },
    { key: 'certificates', icon: <Award size={18} />, label: 'Certificates', href: '/admin/certificates' },
    { key: 'experience', icon: <Briefcase size={18} />, label: 'Experience', href: '/admin/experience' },
    { key: 'education', icon: <GraduationCap size={18} />, label: 'Education', href: '/admin/education' },
    { key: 'cv', icon: <FileDown size={18} />, label: 'Generate CV', href: '/admin/cv' },
];

function AdminShell({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        getSession().then(s => {
            setSession(s);
            setLoading(false);
            if (!s) router.push('/admin/login');
        });

        const { data: { subscription } } = onAuthStateChange((event, session) => {
            setSession(session);
            if (!session) router.push('/admin/login');
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/admin/login');
    };

    // Don't block login page with auth check
    const isLoginPage = pathname === '/admin/login';

    if (loading && !isLoginPage) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary)', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)'
            }}>
                Loading...
            </div>
        );
    }

    if (isLoginPage) return <>{children}</>;

    if (!session) return null;

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span className={styles.sidebarLogoAccent}>{'<'}</span>Admin<span className={styles.sidebarLogoAccent}>{' />'}</span>
                    </div>
                    <div className={styles.sidebarLabel}>Portfolio Manager</div>
                </div>

                <ul className={styles.sidebarNav}>
                    {navItems.map(item => (
                        <li key={item.key}>
                            <Link
                                href={item.href}
                                className={`${styles.sidebarLink} ${pathname === item.href ? styles.sidebarLinkActive : ''}`}
                            >
                                {item.icon} {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <hr className={styles.sidebarDivider} />

                <ul className={styles.sidebarNav}>
                    <li>
                        <button className={styles.sidebarLink} onClick={toggleTheme}>
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </li>
                    <li>
                        <Link href="/" className={styles.sidebarLink} target="_blank">
                            <ArrowLeft size={18} /> Back to Site
                        </Link>
                    </li>
                    <li>
                        <button className={styles.sidebarLink} onClick={handleSignOut} style={{ color: 'var(--accent-red)' }}>
                            <LogOut size={18} /> Sign Out
                        </button>
                    </li>
                </ul>
            </aside>

            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}

export default function AdminLayout({ children }) {
    return (
        <LanguageProvider>
            <ThemeProvider>
                <AdminShell>{children}</AdminShell>
            </ThemeProvider>
        </LanguageProvider>
    );
}
