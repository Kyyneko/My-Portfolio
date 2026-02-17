'use client';
import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/lib/data';
import TranslateButton from '@/components/TranslateButton';
import styles from '../admin.module.css';

export default function AdminProfile() {
    const [form, setForm] = useState({
        name_en: '', name_id: '', title_en: '', title_id: '',
        bio_en: '', bio_id: '', avatar_url: '', resume_url: '',
        email: '', github: '', linkedin: '', instagram: ''
    });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        getProfile().then(p => {
            if (p) setForm({
                name_en: p.name_en || '', name_id: p.name_id || '',
                title_en: p.title_en || '', title_id: p.title_id || '',
                bio_en: p.bio_en || '', bio_id: p.bio_id || '',
                avatar_url: p.avatar_url || '', resume_url: p.resume_url || '',
                email: p.email || '', github: p.github || '',
                linkedin: p.linkedin || '', instagram: p.instagram || ''
            });
        });
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(form);
            setToast('Profile saved successfully!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) {
            setToast('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    return (
        <div>
            <div className={styles.contentHeader}>
                <h1 className={styles.contentTitle}>Edit Profile</h1>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form onSubmit={handleSave}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>// Personal Information</h3>
                <div className={styles.formGrid}>
                    <div className="form-group">
                        <label className="form-label">Name (ID) 🇮🇩</label>
                        <input className="form-input" value={form.name_id} onChange={e => update('name_id', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Name (EN) 🇺🇸</label>
                        <input className="form-input" value={form.name_en} onChange={e => update('name_en', e.target.value)} />
                    </div>

                    {/* Title ID → EN */}
                    <div className="form-group">
                        <label className="form-label">Title (ID) 🇮🇩</label>
                        <input className="form-input" value={form.title_id} onChange={e => update('title_id', e.target.value)} placeholder="e.g. Pengembang Full Stack" />
                    </div>
                    <div className="form-group">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>Title (EN) 🇺🇸</label>
                            <TranslateButton sourceText={form.title_id} onTranslated={(t) => update('title_en', t)} />
                        </div>
                        <input className="form-input" value={form.title_en} onChange={e => update('title_en', e.target.value)} placeholder="e.g. Full Stack Developer" />
                    </div>

                    {/* Bio ID → EN */}
                    <div className={`form-group ${styles.formFull}`}>
                        <label className="form-label">Bio (ID) 🇮🇩</label>
                        <textarea className="form-textarea" value={form.bio_id} onChange={e => update('bio_id', e.target.value)} rows={4} placeholder="Bio dalam Bahasa Indonesia" />
                    </div>
                    <div className={`form-group ${styles.formFull}`}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>Bio (EN) 🇺🇸</label>
                            <TranslateButton sourceText={form.bio_id} onTranslated={(t) => update('bio_en', t)} />
                        </div>
                        <textarea className="form-textarea" value={form.bio_en} onChange={e => update('bio_en', e.target.value)} rows={4} placeholder="Bio in English" />
                    </div>
                </div>

                <h3 style={{ margin: '2rem 0 1rem', color: 'var(--accent-secondary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)' }}>// Links & Media</h3>
                <div className={styles.formGrid}>
                    <div className="form-group">
                        <label className="form-label">Avatar URL</label>
                        <input className="form-input" value={form.avatar_url} onChange={e => update('avatar_url', e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Resume URL</label>
                        <input className="form-input" value={form.resume_url} onChange={e => update('resume_url', e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" value={form.email} onChange={e => update('email', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">GitHub</label>
                        <input className="form-input" value={form.github} onChange={e => update('github', e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">LinkedIn</label>
                        <input className="form-input" value={form.linkedin} onChange={e => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Instagram</label>
                        <input className="form-input" value={form.instagram} onChange={e => update('instagram', e.target.value)} placeholder="https://instagram.com/username" />
                    </div>
                </div>
            </form>

            {toast && (
                <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>
                    {toast}
                </div>
            )}
        </div>
    );
}
