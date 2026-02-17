'use client';
import { useState, useEffect, useRef } from 'react';
import { getCertificates, upsertCertificate, deleteCertificate } from '@/lib/data';
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import styles from '../admin.module.css';

const empty = { title: '', issuer: '', date: '', credential_url: '', image_url: '', sort_order: 0 };

export default function AdminCertificates() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const load = () => getCertificates().then(setItems);
    useEffect(() => { load(); }, []);

    const save = async () => {
        setSaving(true);
        try {
            await upsertCertificate(editing);
            await load();
            setEditing(null);
            setToast('Saved!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            setToast('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this certificate?')) return;
        try {
            await deleteCertificate(id);
            await load();
            setToast('Deleted.');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            setToast('Error: ' + err.message);
        }
    };

    const update = (key, val) => setEditing(prev => ({ ...prev, [key]: val }));

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setToast('Error: Please upload an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToast('Error: File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'certificates');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            update('image_url', data.url);
            setToast('Image uploaded!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            setToast('Error: ' + err.message);
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        update('image_url', '');
    };

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Certificates</h1>
                <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}>
                    <Plus size={18} /> Add Certificate
                </button>
            </div>

            <div className={styles.itemList}>
                {items.map(item => (
                    <div key={item.id} className={styles.itemRow}>
                        {item.image_url && item.image_url !== '' && item.image_url !== '#' ? (
                            <img
                                src={item.image_url}
                                alt={item.title}
                                style={{
                                    width: 48, height: 48, objectFit: 'cover',
                                    borderRadius: '8px', flexShrink: 0,
                                    border: '1px solid var(--border-color)',
                                }}
                            />
                        ) : (
                            <div style={{
                                width: 48, height: 48, borderRadius: '8px',
                                background: 'rgba(96,165,250,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-muted)', flexShrink: 0,
                            }}>
                                <ImageIcon size={20} />
                            </div>
                        )}
                        <div className={styles.itemRowInfo}>
                            <div className={styles.itemRowTitle}>{item.title}</div>
                            <div className={styles.itemRowSub}>{item.issuer} · {(() => { if (!item.date) return ''; const [y, m] = item.date.split('-'); const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return months[parseInt(m, 10) - 1] + ' ' + y; })()}</div>
                        </div>
                        <div className={styles.itemRowActions}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...item })}><Pencil size={14} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        No certificates yet.
                    </p>
                )}
            </div>

            {/* Edit/Add Modal */}
            {editing && (
                <div className={styles.modal} onClick={() => setEditing(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{editing.id ? 'Edit Certificate' : 'New Certificate'}</h2>
                        <div className={styles.formGrid}>
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Title</label>
                                <input className="form-input" value={editing.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Machine Learning Terapan" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Issuer</label>
                                <input className="form-input" value={editing.issuer} onChange={e => update('issuer', e.target.value)} placeholder="e.g. Dicoding Indonesia" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input type="month" className="form-input" value={editing.date} onChange={e => update('date', e.target.value)} />
                            </div>
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Credential URL (link to verify certificate)</label>
                                <input className="form-input" value={editing.credential_url} onChange={e => update('credential_url', e.target.value)} placeholder="https://www.dicoding.com/certificates/..." />
                            </div>

                            {/* Photo Upload */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Certificate Photo</label>

                                {editing.image_url && editing.image_url !== '' ? (
                                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '0.75rem' }}>
                                        <img
                                            src={editing.image_url}
                                            alt="Certificate preview"
                                            style={{
                                                maxWidth: '100%', maxHeight: '220px',
                                                borderRadius: '12px', objectFit: 'contain',
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-secondary)',
                                                display: 'block',
                                            }}
                                        />
                                        <button
                                            onClick={removeImage}
                                            style={{
                                                position: 'absolute', top: '8px', right: '8px',
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: 'rgba(248,113,113,0.9)', border: 'none',
                                                color: 'white', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: '2px dashed var(--border-color)',
                                            borderRadius: '12px',
                                            padding: '2rem',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            background: 'var(--bg-secondary)',
                                        }}
                                        onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                                        onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                                    >
                                        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {uploading ? 'Uploading...' : 'Click to upload certificate photo'}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                            PNG, JPG, WEBP — Max 5MB
                                        </p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />

                                {editing.image_url && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn btn-secondary"
                                        style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                                    >
                                        <Upload size={14} /> Replace Photo
                                    </button>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sort Order</label>
                                <input type="number" className="form-input" value={editing.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving || uploading}>
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '1.5rem', right: '1.5rem',
                    padding: '0.75rem 1.5rem', borderRadius: '10px',
                    background: toast.startsWith('Error') ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
                    color: toast.startsWith('Error') ? '#f87171' : '#34d399',
                    border: `1px solid ${toast.startsWith('Error') ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`,
                    fontSize: '0.875rem', fontWeight: 500, zIndex: 300,
                    backdropFilter: 'blur(8px)',
                }}>
                    {toast}
                </div>
            )}
        </div>
    );
}
