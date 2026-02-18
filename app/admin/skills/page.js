'use client';
import { useState, useEffect } from 'react';
import { getSkills, upsertSkill, deleteSkill, bulkDelete } from '@/lib/data';
import { Plus, Pencil, Trash2, Search, Check, X } from 'lucide-react';
import { useConfirm } from '@/components/ConfirmDialog';
import styles from '../admin.module.css';

const emptySkill = { name: '', category: '', icon: '', proficiency: 80, sort_order: 0 };

export default function AdminSkills() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [toast, setToast] = useState('');
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(new Set());
    const confirm = useConfirm();

    const load = () => getSkills().then(setItems);
    useEffect(() => { load(); }, []);

    const openNew = () => setEditing({ ...emptySkill });
    const openEdit = (item) => setEditing({ ...item });
    const close = () => setEditing(null);

    const save = async () => {
        setSaving(true);
        try {
            await upsertSkill(editing);
            await load(); close();
            setToast('Skill saved!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        const yes = await confirm('Are you sure you want to delete this skill? This action cannot be undone.');
        if (!yes) return;
        try { await deleteSkill(id); await load(); setToast('Deleted.'); setTimeout(() => setToast(''), 3000); }
        catch (err) { setToast('Error: ' + err.message); }
    };

    const bulkRemove = async () => {
        const yes = await confirm(`Delete ${selected.size} selected skill(s)? This action cannot be undone.`);
        if (!yes) return;
        try {
            await bulkDelete('skills', [...selected]);
            setSelected(new Set());
            await load();
            setToast(`${selected.size} skill(s) deleted.`);
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

    // Filter by search
    const filtered = items.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase())
    );

    // Group for display
    const grouped = filtered.reduce((acc, s) => { const c = s.category || 'Other'; if (!acc[c]) acc[c] = []; acc[c].push(s); return acc; }, {});

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Skills</h1>
                <button className="btn btn-primary" onClick={openNew}><Plus size={18} /> Add Skill</button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        className={styles.searchInput}
                        placeholder="Search skills..."
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

            {Object.entries(grouped).map(([cat, skills]) => (
                <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--accent-secondary)', marginBottom: '0.75rem' }}>// {cat}</h3>
                    <div className={styles.itemList}>
                        {skills.map(item => (
                            <div key={item.id} className={`${styles.itemRow} ${selected.has(item.id) ? styles.itemRowSelected : ''}`}>
                                <button
                                    className={`${styles.checkbox} ${selected.has(item.id) ? styles.checkboxChecked : ''}`}
                                    onClick={() => toggleSelect(item.id)}
                                >
                                    {selected.has(item.id) && <Check size={14} color="#fff" />}
                                </button>
                                <div className={styles.itemRowInfo}>
                                    <div className={styles.itemRowTitle}>{item.name}</div>
                                    <div className={styles.itemRowSub}>{item.proficiency}%</div>
                                </div>
                                <div className={styles.itemRowActions}>
                                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}><Pencil size={14} /></button>
                                    <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {filtered.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                    {search ? 'No skills match your search.' : 'No skills yet.'}
                </p>
            )}

            {editing && (
                <div className={styles.modal} onClick={close}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>{editing.id ? 'Edit Skill' : 'New Skill'}</h2>
                        <div className={styles.formGrid}>
                            <div className="form-group"><label className="form-label">Skill Name</label><input className="form-input" value={editing.name} onChange={e => update('name', e.target.value)} placeholder="e.g. JavaScript" /></div>
                            <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={editing.category} onChange={e => update('category', e.target.value)} placeholder="e.g. Frontend" /></div>
                            <div className="form-group"><label className="form-label">Proficiency (%)</label><input type="number" min="0" max="100" className="form-input" value={editing.proficiency} onChange={e => update('proficiency', parseInt(e.target.value) || 0)} /></div>
                            <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-input" value={editing.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} /></div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn btn-ghost" onClick={close}>Cancel</button>
                            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>{toast}</div>}
        </div>
    );
}
