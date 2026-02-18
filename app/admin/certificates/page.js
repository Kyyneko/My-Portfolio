'use client';
import { useState, useEffect, useRef } from 'react';
import { getCertificates, upsertCertificate, deleteCertificate, bulkDelete } from '@/lib/data';
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon, Search, Check } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';
import ImageCropper from '@/components/ImageCropper';
import styles from '../admin.module.css';

const empty = { title: '', issuer: '', date: '', credential_url: '', image_url: '', sort_order: 0 };

export default function AdminCertificates() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());
    const fileInputRef = useRef(null);
    const [cropSrc, setCropSrc] = useState(null);
    const confirm = useConfirm();

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
        const yes = await confirm('Are you sure you want to delete this certificate? This action cannot be undone.');
        if (!yes) return;
        try {
            await deleteCertificate(id);
            await load();
            setToast('Deleted.');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            setToast('Error: ' + err.message);
        }
    };

    const bulkRemove = async () => {
        const yes = await confirm(`Delete ${selected.size} selected certificate(s)? This action cannot be undone.`);
        if (!yes) return;
        try {
            await bulkDelete('certificates', [...selected]);
            setSelected(new Set());
            await load();
            setToast(`${selected.size} certificate(s) deleted.`);
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
    };

    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === filtered.length) setSelected(new Set());
        else setSelected(new Set(filtered.map(i => i.id)));
    };

    const update = (key, val) => setEditing(prev => ({ ...prev, [key]: val }));

    // Step 1: File selected → open cropper
    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) { setToast('Error: Please upload an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setToast('Error: File size must be less than 5MB'); return; }
        const reader = new FileReader();
        reader.onload = () => setCropSrc(reader.result);
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Step 2: Crop complete → upload
    const handleCropComplete = async (blob) => {
        setCropSrc(null);
        setUploading(true);
        try {
            const file = new File([blob], 'certificate.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'certificates');
            if (editing?.image_url) formData.append('oldUrl', editing.image_url);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            update('image_url', data.url);
            setToast('Image uploaded!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
        finally { setUploading(false); }
    };

    const removeImage = () => update('image_url', '');

    // Filter
    const filtered = items.filter(c =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.issuer?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Certificates</h1>
                <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}>
                    <Plus size={18} /> Add Certificate
                </button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search certificates..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {items.length > 0 && (
                    <button
                        className={`${styles.checkbox} ${selected.size === filtered.length && filtered.length > 0 ? styles.checkboxChecked : ''}`}
                        onClick={toggleSelectAll}
                        title="Select all"
                    >
                        {selected.size === filtered.length && filtered.length > 0 && <Check size={14} color="#fff" />}
                    </button>
                )}
            </div>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className={styles.bulkBar}>
                    <span className={styles.bulkCount}>{selected.size}</span> selected
                    <button className="btn btn-danger btn-sm" onClick={bulkRemove} style={{ marginLeft: 'auto' }}>
                        <Trash2 size={14} /> Delete Selected
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(new Set())}>
                        <X size={14} /> Clear
                    </button>
                </div>
            )}

            <div className={styles.itemList}>
                {filtered.map(item => (
                    <div key={item.id} className={`${styles.itemRow} ${selected.has(item.id) ? styles.itemRowSelected : ''}`}>
                        <button
                            className={`${styles.checkbox} ${selected.has(item.id) ? styles.checkboxChecked : ''}`}
                            onClick={() => toggleSelect(item.id)}
                        >
                            {selected.has(item.id) && <Check size={14} color="#fff" />}
                        </button>
                        {item.image_url && item.image_url !== '' && item.image_url !== '#' ? (
                            <img src={item.image_url} alt={item.title} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border-color)' }} />
                        ) : (
                            <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
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
                {filtered.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        {search ? 'No certificates match your search.' : 'No certificates yet.'}
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
                                <input type="date" className="form-input" value={editing.date} onChange={e => update('date', e.target.value)} />
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
                                        <img src={editing.image_url} alt="Certificate preview" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '12px', objectFit: 'contain', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'block' }} />
                                        <button onClick={removeImage} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(248,113,113,0.9)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove image">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; handleFileSelect(e.dataTransfer.files[0]); }}
                                        style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', transition: 'all 0.2s ease', background: 'var(--bg-secondary)' }}
                                    >
                                        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {uploading ? 'Uploading...' : 'Click or drag & drop certificate photo'}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>PNG, JPG, WEBP — Max 5MB</p>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={e => handleFileSelect(e.target.files[0])} style={{ display: 'none' }} />
                                {editing.image_url && (
                                    <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
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

            {cropSrc && (
                <ImageCropper
                    imageSrc={cropSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropSrc(null)}
                    aspect={4 / 3}
                    cropShape="rect"
                />
            )}
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
