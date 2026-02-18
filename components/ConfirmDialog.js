'use client';
import { useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ─── Context for global confirm dialog ───
let globalShowConfirm = null;

export function useConfirm() {
    return useCallback((message) => {
        return new Promise((resolve) => {
            if (globalShowConfirm) {
                globalShowConfirm({ message, resolve });
            } else {
                // Fallback to native confirm if provider not mounted
                resolve(window.confirm(message));
            }
        });
    }, []);
}

export default function ConfirmDialog() {
    const [state, setState] = useState(null);

    // Register global handler
    globalShowConfirm = ({ message, resolve }) => {
        setState({ message, resolve });
    };

    const handleConfirm = () => {
        state?.resolve(true);
        setState(null);
    };

    const handleCancel = () => {
        state?.resolve(false);
        setState(null);
    };

    if (!state) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, animation: 'fadeIn 0.15s ease-out',
        }} onClick={handleCancel}>
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: '16px', padding: '1.75rem', maxWidth: '400px', width: '90%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
                animation: 'slideUp 0.2s ease-out',
            }} onClick={e => e.stopPropagation()}>
                {/* Icon */}
                <div style={{
                    width: 48, height: 48, borderRadius: '12px',
                    background: 'rgba(248,113,113,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                }}>
                    <AlertTriangle size={24} style={{ color: '#f87171' }} />
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: '1.1rem', fontWeight: 700,
                    color: 'var(--text-primary)', margin: '0 0 0.5rem 0',
                }}>
                    Confirm Delete
                </h3>

                {/* Message */}
                <p style={{
                    fontSize: '0.9rem', color: 'var(--text-secondary)',
                    lineHeight: 1.5, margin: '0 0 1.5rem 0',
                }}>
                    {state.message}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '0.6rem 1.25rem', borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseOver={e => { e.target.style.background = 'var(--bg-card)'; e.target.style.borderColor = 'var(--border-accent)'; }}
                        onMouseOut={e => { e.target.style.background = 'var(--bg-secondary)'; e.target.style.borderColor = 'var(--border-color)'; }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        autoFocus
                        style={{
                            padding: '0.6rem 1.25rem', borderRadius: '10px',
                            border: '1px solid rgba(248,113,113,0.3)',
                            background: 'rgba(248,113,113,0.15)', color: '#f87171',
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s ease',
                        }}
                        onMouseOver={e => { e.target.style.background = 'rgba(248,113,113,0.25)'; }}
                        onMouseOut={e => { e.target.style.background = 'rgba(248,113,113,0.15)'; }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
            `}</style>
        </div>
    );
}
