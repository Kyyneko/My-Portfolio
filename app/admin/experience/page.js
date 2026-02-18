'use client';
import { useState, useEffect } from 'react';
import { getExperience, upsertExperience, deleteExperience, bulkDelete } from '@/lib/data';
import { Plus, Pencil, Trash2, Search, Check, X } from 'lucide-react';
import TranslateButton from '@/components/TranslateButton';
import { useConfirm } from '@/components/ConfirmDialog';
import styles from '../admin.module.css';

const empty = {
    company: '', role_en: '', role_id: '', description_en: '', description_id: '',
    start_date: '', end_date: '', is_current: false, sort_order: 0
};

const fmtDate = (d) => {
    if (!d) return '';
    const [y, m] = d.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(m, 10) - 1] + ' ' + y;
};

export default function AdminExperience() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());
    const confirm = useConfirm();

    const load = () => getExperience().then(setItems);
    useEffect(() => { load(); }, []);

    const save = async () => {
        setSaving(true);
        try {
            const data = { ...editing };
            if (data.is_current) data.end_date = null;
            await upsertExperience(data);
            await load(); setEditing(null);
            setToast('Saved!'); setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        const yes = await confirm('Are you sure you want to delete this experience? This action cannot be undone.');
        if (!yes) return;
        try { await deleteExperience(id); await load(); setToast('Deleted.'); setTimeout(() => setToast(''), 3000); }
        catch (err) { setToast('Error: ' + err.message); }
    };

    const bulkRemove = async () => {
        const yes = await confirm(`Delete ${selected.size} selected experience(s)? This action cannot be undone.`);
        if (!yes) return;
        try {
            await bulkDelete('experience', [...selected]);
            setSelected(new Set());
            await load();
            setToast(`${selected.size} experience(s) deleted.`);
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
        e.company?.toLowerCase().includes(search.toLowerCase()) ||
        e.role_en?.toLowerCase().includes(search.toLowerCase()) ||
        e.role_id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Work Experience</h1>
                <button className="btn btn-primary" onClick={() => setEditing({ ...empty })}><Plus size={18} /> Add Experience</button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input className={styles.searchInput} placeholder="Search experience..." value={search} onChange={e => setSearch(e.target.value)} />
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
                            <div className={styles.itemRowTitle}>{item.role_en || item.role_id} {item.is_current && <span className="badge badge-green" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Current</span>}</div>
                            <div className={styles.itemRowSub}>{item.company} · {fmtDate(item.start_date)} — {item.end_date ? fmtDate(item.end_date) : 'Present'}</div>
                        </div>
                        <div className={styles.itemRowActions}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditing({ ...item })}><Pencil size={14} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>{search ? 'No experience matches your search.' : 'No experience entries yet.'}</p>}
            </div>

            {editing && (
                <div className={styles.modal} onClick={() => setEditing(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{editing.id ? 'Edit Experience' : 'New Experience'}</h2>
                        <div className={styles.formGrid}>
                            <div className={`form-group ${styles.formFull}`}>
                                <label className="form-label">Company</label>
                                <input className="form-input" value={editing.company} onChange={e => update('company', e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role (ID) 🇮🇩</label>
                                <input className="form-input" value={editing.role_id} onChange={e => update('role_id', e.target.value)} placeholder="Jabatan dalam Bahasa Indonesia" />
                            </div>
                            <div className="form-group">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Role (EN) 🇺🇸</label>
                                    <TranslateButton sourceText={editing.role_id} onTranslated={(t) => update('role_en', t)} />
                                </div>
                                <input className="form-input" value={editing.role_en} onChange={e => update('role_en', e.target.value)} placeholder="Role in English" />
                            </div>

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

                            <div className="form-group"><label className="form-label">Start Date</label><input type="date" className="form-input" value={editing.start_date} onChange={e => update('start_date', e.target.value)} /></div>
                            <div className="form-group"><label className="form-label">End Date</label><input type="date" className="form-input" value={editing.end_date || ''} onChange={e => update('end_date', e.target.value)} disabled={editing.is_current} /></div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={editing.is_current} onChange={e => update('is_current', e.target.checked)} />
                                    <span className="form-label" style={{ margin: 0 }}>Currently working here</span>
                                </label>
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
