'use client';
import { useState, useEffect, useRef } from 'react';
import { getProjects, upsertProject, deleteProject } from '@/lib/data';
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import TranslateButton from '@/components/TranslateButton';
import styles from '../admin.module.css';

const emptyProject = {
    title_en: '', title_id: '', description_en: '', description_id: '',
    image_url: '', live_url: '', github_url: '', tech_stack: [],
    featured: false, sort_order: 0
};

export default function AdminProjects() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [techInput, setTechInput] = useState('');
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const load = () => getProjects().then(setItems);
    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing({ ...emptyProject }); setTechInput(''); };
    const openEdit = (item) => { setEditing({ ...item }); setTechInput((item.tech_stack || []).join(', ')); };
    const close = () => setEditing(null);

    const save = async () => {
        setSaving(true);
        try {
            const data = { ...editing, tech_stack: techInput.split(',').map(s => s.trim()).filter(Boolean) };
            await upsertProject(data);
            await load();
            close();
            setToast('Project saved!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            setToast('Error: ' + err.message);
        } finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            await deleteProject(id);
            await load();
            setToast('Project deleted.');
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
    };

    const update = (key, val) => setEditing(prev => ({ ...prev, [key]: val }));

    // ─── Photo Upload ───
    const handleFileUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setToast('Error: Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setToast('Error: File size must be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'projects');

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
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = () => update('image_url', '');

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Projects</h1>
                <button className="btn btn-primary" onClick={openNew}><Plus size={18} /> Add Project</button>
            </div>

            <div className={styles.itemList}>
                {items.map(item => (
                    <div key={item.id} className={styles.itemRow}>
                        {/* Thumbnail */}
                        {item.image_url && item.image_url !== '' && item.image_url !== '#' ? (
                            <img
                                src={item.image_url}
                                alt={item.title_en}
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
                            <div className={styles.itemRowTitle}>{item.title_en || item.title_id} {item.featured && <span className="badge badge-green" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Featured</span>}</div>
                            <div className={styles.itemRowSub} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                {(item.tech_stack || []).map(t => (
                                    <span key={t} style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--accent-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>{t}</span>
                                ))}
                            </div>
                        </div>
                        <div className={styles.itemRowActions}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        No projects yet.
                    </p>
                )}</div>

            {editing && (
                <div className={styles.modal} onClick={close}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{editing.id ? 'Edit Project' : 'New Project'}</h2>
                        <div className={styles.formGrid}>
                            {/* ─── Photo Upload ─── */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Project Image</label>
                                {editing.image_url && editing.image_url !== '' ? (
                                    <div style={{
                                        position: 'relative', display: 'inline-block',
                                        borderRadius: '10px', overflow: 'hidden',
                                        border: '1px solid var(--border-color)',
                                        maxWidth: '100%',
                                    }}>
                                        <img
                                            src={editing.image_url}
                                            alt="Preview"
                                            style={{
                                                display: 'block', maxWidth: '100%',
                                                maxHeight: '200px', objectFit: 'cover',
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute', top: 0, right: 0,
                                            display: 'flex', gap: '0.25rem', padding: '0.35rem',
                                        }}>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    background: 'rgba(0,0,0,0.6)', border: 'none',
                                                    color: '#fff', borderRadius: '6px',
                                                    padding: '0.3rem 0.5rem', cursor: 'pointer',
                                                    fontSize: '0.7rem', fontWeight: 600,
                                                }}
                                            >
                                                Replace
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                style={{
                                                    background: 'rgba(220,50,50,0.8)', border: 'none',
                                                    color: '#fff', borderRadius: '6px',
                                                    width: 26, height: 26, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => !uploading && fileInputRef.current?.click()}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }}
                                        onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; handleFileUpload(e.dataTransfer.files[0]); }}
                                        style={{
                                            border: '2px dashed var(--border-color)',
                                            borderRadius: '10px', padding: '1.5rem',
                                            textAlign: 'center', cursor: uploading ? 'wait' : 'pointer',
                                            background: 'rgba(96,165,250,0.03)',
                                            transition: 'all 0.2s ease',
                                        }}
                                    >
                                        <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                            {uploading ? 'Uploading...' : 'Click or drag & drop project screenshot'}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                            PNG, JPG up to 5MB
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={e => handleFileUpload(e.target.files[0])}
                                />
                            </div>

                            {/* Title ID → EN */}
                            <div className="form-group">
                                <label className="form-label">Title (ID) 🇮🇩</label>
                                <input className="form-input" value={editing.title_id} onChange={e => update('title_id', e.target.value)} placeholder="Judul dalam Bahasa Indonesia" />
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Title (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.title_id} onTranslated={(t) => update('title_en', t)} />
                                </div>
                                <input className="form-input" value={editing.title_en} onChange={e => update('title_en', e.target.value)} placeholder="Title in English" />
                            </div>

                            {/* Description ID → EN */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Description (ID) 🇮🇩</label>
                                <textarea className="form-textarea" value={editing.description_id} onChange={e => update('description_id', e.target.value)} placeholder="Deskripsi dalam Bahasa Indonesia" />
                            </div>
                            <div className={`form-group ${styles.formFull}`}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Description (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.description_id} onTranslated={(t) => update('description_en', t)} />
                                </div>
                                <textarea className="form-textarea" value={editing.description_en} onChange={e => update('description_en', e.target.value)} placeholder="Description in English" />
                            </div>

                            <div className="form-group"><label className="form-label">Live URL</label><input className="form-input" value={editing.live_url} onChange={e => update('live_url', e.target.value)} placeholder="https://..." /></div>
                            <div className="form-group"><label className="form-label">GitHub URL</label><input className="form-input" value={editing.github_url} onChange={e => update('github_url', e.target.value)} placeholder="https://github.com/..." /></div>
                            <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={editing.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} /></div>
                            <div className={`form-group ${styles.formFull}`}><label className="form-label">Tech Stack (comma-separated)</label><input className="form-input" value={techInput} onChange={e => setTechInput(e.target.value)} placeholder="Next.js, React, Supabase" /></div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={editing.featured} onChange={e => update('featured', e.target.checked)} />
                                    <span className="form-label" style={{ margin: 0 }}>Featured Project</span>
                                </label>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-secondary" onClick={close}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>{toast}</div>}
        </div>
    );
}
