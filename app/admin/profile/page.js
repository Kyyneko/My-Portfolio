'use client';
import { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile } from '@/lib/data';
import { Upload, X, Camera } from 'lucide-react';
import TranslateButton from '@/components/TranslateButton';
import ImageCropper from '@/components/ImageCropper';
import styles from '../admin.module.css';

export default function AdminProfile() {
    const [form, setForm] = useState({
        name_en: '', name_id: '', title_en: '', title_id: '',
        bio_en: '', bio_id: '', avatar_url: '', resume_url: '',
        email: '', github: '', linkedin: '', instagram: ''
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState('');
    const [cropSrc, setCropSrc] = useState(null); // image source for cropper
    const avatarInputRef = useRef(null);

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

    // Step 1: User picks a file → show cropper
    const handleFileSelect = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) { setToast('Error: Please upload an image file'); return; }
        if (file.size > 10 * 1024 * 1024) { setToast('Error: File size must be less than 10MB'); return; }
        const reader = new FileReader();
        reader.onload = () => setCropSrc(reader.result);
        reader.readAsDataURL(file);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    // Step 2: User crops → upload the cropped blob
    const handleCropComplete = async (blob) => {
        setCropSrc(null);
        setUploading(true);
        try {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'profile');
            if (form.avatar_url) formData.append('oldUrl', form.avatar_url);
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            update('avatar_url', data.url);
            setToast('Avatar uploaded!');
            setTimeout(() => setToast(''), 3000);
        } catch (err) { setToast('Error: ' + err.message); }
        finally { setUploading(false); }
    };

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
                    {/* Avatar Upload */}
                    <div className={`form-group ${styles.formFull}`}>
                        <label className="form-label">Avatar Photo</label>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem', flexWrap: 'wrap' }}>
                            {/* Preview */}
                            {form.avatar_url ? (
                                <div style={{ position: 'relative' }}>
                                    <img
                                        src={form.avatar_url}
                                        alt="Avatar preview"
                                        style={{
                                            width: 120, height: 120, borderRadius: '50%',
                                            objectFit: 'cover', border: '3px solid var(--border-color)',
                                            display: 'block',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => update('avatar_url', '')}
                                        style={{
                                            position: 'absolute', top: 0, right: 0,
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'rgba(248,113,113,0.9)', border: '2px solid var(--bg-card)',
                                            color: 'white', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                        title="Remove avatar"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => !uploading && avatarInputRef.current?.click()}
                                    style={{
                                        width: 120, height: 120, borderRadius: '50%',
                                        border: '2px dashed var(--border-color)',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        cursor: uploading ? 'wait' : 'pointer',
                                        background: 'rgba(96,165,250,0.05)',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Camera size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }} />
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </span>
                                </div>
                            )}

                            {/* Upload actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', paddingTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => avatarInputRef.current?.click()}
                                    disabled={uploading}
                                >
                                    <Upload size={14} /> {form.avatar_url ? 'Change Photo' : 'Upload Photo'}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                    PNG, JPG, WEBP — Max 5MB
                                </p>
                            </div>
                        </div>

                        <input
                            type="file"
                            ref={avatarInputRef}
                            accept="image/*"
                            onChange={e => handleFileSelect(e.target.files[0])}
                            style={{ display: 'none' }}
                        />
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

            {/* Image Cropper Modal */}
            {cropSrc && (
                <ImageCropper
                    imageSrc={cropSrc}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropSrc(null)}
                    aspect={1}
                    cropShape="round"
                />
            )}

            {toast && (
                <div className={`toast ${toast.startsWith('Error') ? 'toast-error' : 'toast-success'}`}>
                    {toast}
                </div>
            )}
        </div>
    );
}
