'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/data';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
            router.push('/admin');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            fontFamily: 'var(--font-body)',
        }}>
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '24px',
                padding: '2.5rem',
                width: '100%',
                maxWidth: '420px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '16px',
                        background: 'rgba(96,165,250,0.1)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', color: 'var(--accent-primary)',
                        fontSize: '1.5rem',
                    }}>
                        🔒
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Admin Login
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Sign in to manage your portfolio
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.2)',
                        color: '#f87171',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.875rem', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '0.4rem'
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                            required
                            style={{
                                width: '100%', padding: '0.65rem 0.9rem',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                borderRadius: '10px', color: 'var(--text-primary)',
                                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{
                            display: 'block', fontSize: '0.875rem', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '0.4rem'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%', padding: '0.65rem 0.9rem',
                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                borderRadius: '10px', color: 'var(--text-primary)',
                                fontFamily: 'var(--font-body)', fontSize: '0.875rem',
                                outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '0.75rem',
                            background: 'var(--accent-primary)', color: '#0a0e17',
                            border: 'none', borderRadius: '10px',
                            fontFamily: 'var(--font-body)', fontSize: '0.95rem',
                            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
