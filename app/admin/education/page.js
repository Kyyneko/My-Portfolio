'use client';
import { useState, useEffect } from 'react';
import { getEducation, upsertEducation, deleteEducation, bulkDelete } from '@/lib/data';
import { Plus, Pencil, Trash2, Search, Check, X } from 'lucide-react';
import TranslateButton from '@/components/TranslateButton';
import { useConfirm } from '@/components/ConfirmDialog';
import styles from '../admin.module.css';

const empty = {
    institution: '', degree_en: '', degree_id: '', field_en: '', field_id: '',
    start_year: 2020, end_year: 2024, description_en: '', description_id: '', sort_order: 0
};

export default function AdminEducation() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());
    const confirm = useConfirm();

    const load = () => getEducation().then(setItems);
    useEffect(() => { load(); }, []);

    const save = async () => {
        setSaving(true);
        try { await upsertEducation(editing); await load(); setEditing(null); setToast('Saved!'); setTimeout(() => setToast(''), 3000); }
        catch (err) { setToast('Error: ' + err.message); } finally { setSaving(false); }
    };

    const remove = async (id) => {
        const yes = await confirm('Are you sure you want to delete this education entry? This action cannot be undone.');
        if (!yes) return;
        try { await deleteEducation(id); await load(); setToast('Deleted.'); setTimeout(() => setToast(''), 3000); }
        catch (err) { setToast('Error: ' + err.message); }
    };

    const bulkRemove = async () => {
        const yes = await confirm(`Delete ${selected.size} selected education entry(s)? This action cannot be undone.`);
        if (!yes) return;
        try {
            await bulkDelete('education', [...selected]);
            setSelected(new Set());
            await load();
            setToast(`${selected.size} education entry(s) deleted.`);
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

    // Filter
    const filtered = items.filter(e =>
        e.institution?.toLowerCase().includes(search.toLowerCase()) ||
        e.degree_en?.toLowerCase().includes(search.toLowerCase()) ||
        e.degree_id?.toLowerCase().includes(search.toLowerCase()) ||
        e.field_en?.toLowerCase().includes(search.toLowerCase()) ||
        e.field_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Education</h1>
                <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}><Plus size={18} /> Add Education</button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input className={styles.searchInput} placeholder="Search education..." value={search} onChange={e => setSearch(e.target.value)} />
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
                        <div className={styles.itemRowInfo}>
                            <div className={styles.itemRowTitle}>{item.degree_en || item.degree_id} — {item.field_en || item.field_id}</div>
                            <div className={styles.itemRowSub}>{item.institution} · {item.start_year}–{item.end_year}</div>
                        </div>
                        <div className={styles.itemRowActions}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...item })}><Pencil size={14} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>{search ? 'No education matches your search.' : 'No education entries yet.'}</p>}
            </div>

            {editing && (
                <div className={styles.modal} onClick={() => setEditing(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{editing.id ? 'Edit Education' : 'New Education'}</h2>
                        <div className={styles.formGrid}>
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Institution</label>
                                <input className="form-input" value={editing.institution} onChange={e => update('institution', e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Degree (ID) 🇮🇩</label>
                                <input className="form-input" value={editing.degree_id} onChange={e => update('degree_id', e.target.value)} placeholder="e.g. Sarjana (S1)" />
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Degree (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.degree_id} onTranslated={(t) => update('degree_en', t)} />
                                </div>
                                <input className="form-input" value={editing.degree_en} onChange={e => update('degree_en', e.target.value)} placeholder="e.g. Bachelor of Science" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Field of Study (ID) 🇮🇩</label>
                                <input className="form-input" value={editing.field_id} onChange={e => update('field_id', e.target.value)} placeholder="e.g. Sistem Informasi" />
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Field of Study (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.field_id} onTranslated={(t) => update('field_en', t)} />
                                </div>
                                <input className="form-input" value={editing.field_en} onChange={e => update('field_en', e.target.value)} placeholder="e.g. Information Systems" />
                            </div>

                            <div className="form-group"><label className="form-label">Start Year</label><input type="number" className="form-input" value={editing.start_year} onChange={e => update('start_year', parseInt(e.target.value) || 0)} /></div>
                            <div className="form-group"><label className="form-label">End Year</label><input type="number" className="form-input" value={editing.end_year} onChange={e => update('end_year', parseInt(e.target.value) || 0)} /></div>

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

                            <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={editing.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} /></div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>{toast}</div>}
        </div>
    );
}
