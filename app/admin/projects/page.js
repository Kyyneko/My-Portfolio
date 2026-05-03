'use client';
import { useState, useEffect, useRef } from 'react';
import { getProjects, upsertProject, deleteProject, bulkDelete } from '@/lib/data';
import { Plus, Pencil, Trash2, Upload, X, Image as ImageIcon, Search, Check } from 'lucide-react';
import TranslateButton from '@/components/TranslateButton';
import { useConfirm } from '@/components/ConfirmDialog';
import ImageCropper from '@/components/ImageCropper';
import styles from '../admin.module.css';

const emptyProject = {
    title_en: '', title_id: '', slug: '', description_en: '', description_id: '',
    long_description_en: '', long_description_id: '', tech_rationale_en: '', tech_rationale_id: '',
    core_features_en: '', core_features_id: '',
    image_url: '', gallery_urls: [], live_url: '', github_url: '', tech_stack: [],
    featured: false, sort_order: 0
};

export default function AdminProjects() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [techList, setTechList] = useState([]);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());
    const fileInputRef = useRef(null);
    const galleryFileInputRef = useRef(null);
    const [cropSrc, setCropSrc] = useState(null);
    const confirm = useConfirm();

    const load = () => getProjects().then(setItems);
    useEffect(() => { load(); }, []);

    const openNew = () => { setEditing({ ...emptyProject }); setTechList([]); };
    const openEdit = (item) => { 
        setEditing({ ...item }); 
        let parsedTech = [];
        try {
            parsedTech = JSON.parse(item.tech_rationale_en || '[]');
            if (!Array.isArray(parsedTech)) parsedTech = [];
        } catch (e) {
            parsedTech = (item.tech_stack || []).map(t => ({ name: t, reason_id: '', reason_en: '' }));
        }
        setTechList(parsedTech);
    };
    const close = () => setEditing(null);

    const generateSlug = (text) => {
        if (!text) return '';
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const save = async () => {
        setSaving(true);
        try {
            const validTechList = techList.filter(t => t.name && t.name.trim() !== '');
            const names = validTechList.map(t => t.name.trim());
            
            let finalSlug = editing.slug;
            if (!finalSlug && editing.title_en) {
                finalSlug = generateSlug(editing.title_en);
            }

            const data = { 
                ...editing, 
                slug: finalSlug,
                tech_stack: names,
                tech_rationale_en: JSON.stringify(validTechList)
            };
            await upsertProject(data);
            await load(); close();
            setToast('Project saved!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        const yes = await confirm('Are you sure you want to delete this project? This action cannot be undone.');
        if (!yes) return;
        try { await deleteProject(id); await load(); setToast('Project deleted.'); setTimeout(() => setToast(''), 3000); }
        catch (err) { setToast('Error: ' + err.message); }
    };

    const bulkRemove = async () => {
        const yes = await confirm(`Delete ${selected.size} selected project(s)? This action cannot be undone.`);
        if (!yes) return;
        try {
            await bulkDelete('projects', [...selected]);
            setSelected(new Set());
            await load();
            setToast(`${selected.size} project(s) deleted.`);
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

    const addTech = () => setTechList(prev => [...prev, { name: '', reason_id: '', reason_en: '' }]);
    const removeTech = (index) => setTechList(prev => prev.filter((_, i) => i !== index));
    const updateTech = (index, field, value) => {
        setTechList(prev => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

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

    const handleCropComplete = async (blob) => {
        setCropSrc(null);
        setUploading(true);
        try {
            const file = new File([blob], 'project.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'projects');
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

    // Gallery upload handler
    const handleGalleryUpload = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) { setToast('Error: Please upload an image file'); return; }
        if (file.size > 5 * 1024 * 1024) { setToast('Error: File size must be less than 5MB'); return; }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'projects_gallery');
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            const newGallery = [...(editing.gallery_urls || []), data.url];
            update('gallery_urls', newGallery);
            setToast('Gallery image added!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
        finally { setUploading(false); }
        if (galleryFileInputRef.current) galleryFileInputRef.current.value = '';
    };

    const removeGalleryImage = (index) => {
        const newGallery = [...(editing.gallery_urls || [])];
        newGallery.splice(index, 1);
        update('gallery_urls', newGallery);
    };

    // Filter
    const filtered = items.filter(p =>
        p.title_en?.toLowerCase().includes(search.toLowerCase()) ||
        p.title_id?.toLowerCase().includes(search.toLowerCase()) ||
        (p.tech_stack || []).some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Projects</h1>
                <button className="btn btn-primary" onClick={openNew}><Plus size={18} /> Add Project</button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input className={styles.searchInput} placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {items.length > 0 && (
                    <button className={`${styles.checkbox} ${selected.size === filtered.length && filtered.length > 0 ? styles.checkboxChecked : ''}`} onClick={toggleSelectAll} title="Select all">
                        {selected.size === filtered.length && filtered.length > 0 && <Check size={14} color="#fff" />}
                    </button>
                )}
            </div>

            {selected.size > 0 && (
                <div className={styles.bulkBar}>
                    <span className={styles.bulkCount}>{selected.size}</span> selected
                    <button className="btn btn-danger btn-sm" onClick={bulkRemove} style={{ marginLeft: 'auto' }}><Trash2 size={14} /> Delete Selected</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelected(new Set())}><X size={14} /> Clear</button>
                </div>
            )}

            <div className={styles.itemList}>
                {filtered.map(item => (
                    <div key={item.id} className={`${styles.itemRow} ${selected.has(item.id) ? styles.itemRowSelected : ''}`}>
                        <button className={`${styles.checkbox} ${selected.has(item.id) ? styles.checkboxChecked : ''}`} onClick={() => toggleSelect(item.id)}>
                            {selected.has(item.id) && <Check size={14} color="#fff" />}
                        </button>
                        {item.image_url && item.image_url !== '' && item.image_url !== '#' ? (
                            <img src={item.image_url} alt={item.title_en} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid var(--border-color)' }} />
                        ) : (
                            <div style={{ width: 48, height: 48, borderRadius: '8px', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
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
                {filtered.length === 0 && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        {search ? 'No projects match your search.' : 'No projects yet.'}
                    </p>
                )}
            </div>

            {editing && (
                <div className={styles.modal} onClick={close}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{editing.id ? 'Edit Project' : 'New Project'}</h2>
                        <div className={styles.formGrid}>
                            {/* Photo Upload */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Project Image (Main)</label>
                                {editing.image_url && editing.image_url !== '' ? (
                                    <div style={{ position: 'relative', display: 'inline-block', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', maxWidth: '100%' }}>
                                        <img src={editing.image_url} alt="Preview" style={{ display: 'block', maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '0.25rem', padding: '0.35rem' }}>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '6px', padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600 }}>Replace</button>
                                            <button type="button" onClick={removeImage} style={{ background: 'rgba(220,50,50,0.8)', border: 'none', color: '#fff', borderRadius: '6px', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div onClick={() => !uploading && fileInputRef.current?.click()} onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent-primary)'; }} onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }} onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; handleFileSelect(e.dataTransfer.files[0]); }} style={{ border: '2px dashed var(--border-color)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', cursor: uploading ? 'wait' : 'pointer', background: 'rgba(96,165,250,0.03)', transition: 'all 0.2s ease' }}>
                                        <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{uploading ? 'Uploading...' : 'Click or drag & drop project screenshot'}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                            </div>

                            {/* Gallery Upload */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Project Gallery (Optional)</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {(editing.gallery_urls || []).map((url, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '100px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                            <img src={url} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button type="button" onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(220,50,50,0.8)', border: 'none', color: '#fff', borderRadius: '4px', width: 20, height: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
                                        </div>
                                    ))}
                                    <div onClick={() => !uploading && galleryFileInputRef.current?.click()} style={{ width: '100px', height: '80px', borderRadius: '8px', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: uploading ? 'wait' : 'pointer', background: 'rgba(96,165,250,0.03)' }}>
                                        <Plus size={20} style={{ color: 'var(--text-muted)' }} />
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Add Image</span>
                                    </div>
                                </div>
                                <input ref={galleryFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleGalleryUpload(e.target.files[0])} />
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
                                <input className="form-input" value={editing.title_en} onChange={e => {
                                    update('title_en', e.target.value);
                                    if (!editing.id) update('slug', generateSlug(e.target.value));
                                }} placeholder="Title in English" />
                            </div>
                            
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">URL Slug (e.g., my-project)</label>
                                <input className="form-input" value={editing.slug || ''} onChange={e => update('slug', e.target.value)} placeholder="Auto-generated from Title (EN) if left empty" />
                            </div>

                            {/* Description ID → EN */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Description (ID) 🇮🇩</label>
                                <textarea className="form-textarea" value={editing.description_id} onChange={e => update('description_id', e.target.value)} placeholder="Deskripsi pendek dalam Bahasa Indonesia" />
                            </div>
                            <div className={`form-group ${styles.formFull}`}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Description (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.description_id} onTranslated={(t) => update('description_en', t)} />
                                </div>
                                <textarea className="form-textarea" value={editing.description_en} onChange={e => update('description_en', e.target.value)} placeholder="Short description in English" />
                            </div>

                            {/* Long Description ID → EN */}
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Long Description (ID) 🇮🇩</label>
                                <textarea className="form-textarea" style={{ minHeight: '120px' }} value={editing.long_description_id} onChange={e => update('long_description_id', e.target.value)} placeholder="Penjelasan sangat rinci tentang proyek..." />
                            </div>
                            <div className={`form-group ${styles.formFull}`}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Long Description (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.long_description_id} onTranslated={(t) => update('long_description_en', t)} />
                                </div>
                                <textarea className="form-textarea" style={{ minHeight: '120px' }} value={editing.long_description_en} onChange={e => update('long_description_en', e.target.value)} placeholder="Detailed explanation of the project..." />
                            </div>

                            {/* Dynamic Tech Stack */}
                            <div className={`form-group ${styles.formFull}`}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Tech Stack & Architecture</h3>
                                    <button type="button" onClick={addTech} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}><Plus size={14} /> Add Tech Stack</button>
                                </div>
                                
                                {techList.length === 0 && (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>No tech stack added yet. Click the button above to add one.</p>
                                )}
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {techList.map((tech, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
                                            <button type="button" onClick={() => removeTech(idx)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(220,50,50,0.1)', color: '#ef4444', border: 'none', borderRadius: '6px', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            
                                            <div className="form-group" style={{ maxWidth: '300px' }}>
                                                <label className="form-label">Tech Name</label>
                                                <input className="form-input" value={tech.name} onChange={e => updateTech(idx, 'name', e.target.value)} placeholder="e.g. Next.js, Supabase, Tailwind" />
                                            </div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <label className="form-label">Reason (ID) 🇮🇩</label>
                                                    <textarea className="form-textarea" style={{ minHeight: '80px' }} value={tech.reason_id} onChange={e => updateTech(idx, 'reason_id', e.target.value)} placeholder="Alasan mengapa menggunakan teknologi ini..." />
                                                </div>
                                                <div className="form-group" style={{ marginBottom: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                        <label className="form-label" style={{ margin: 0 }}>Reason (EN) 🇺🇸</label>
                                                        <TranslateButton sourceText={tech.reason_id} onTranslated={(t) => updateTech(idx, 'reason_en', t)} />
                                                    </div>
                                                    <textarea className="form-textarea" style={{ minHeight: '80px' }} value={tech.reason_en} onChange={e => updateTech(idx, 'reason_en', e.target.value)} placeholder="Reason for using this technology..." />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group"><label className="form-label">Live URL</label><input className="form-input" value={editing.live_url} onChange={e => update('live_url', e.target.value)} placeholder="https://..." /></div>
                            <div className="form-group"><label className="form-label">GitHub URL</label><input className="form-input" value={editing.github_url} onChange={e => update('github_url', e.target.value)} placeholder="https://github.com/..." /></div>
                            <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={editing.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} /></div>
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

            {cropSrc && (
                <ImageCropper
                    imageSrc={cropSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropSrc(null)}
                    aspect={16 / 9}
                    cropShape="rect"
                />
            )}
            {toast && <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>{toast}</div>}
        </div>
    );
}
