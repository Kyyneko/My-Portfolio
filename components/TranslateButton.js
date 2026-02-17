'use client';
import { useState } from 'react';
import { Languages } from 'lucide-react';

/**
 * Auto-translate button component.
 * Translates text from one field and sets it to another.
 *
 * @param {string} sourceText - The Indonesian text to translate
 * @param {function} onTranslated - Callback with translated text
 * @param {string} from - Source language (default: 'id')
 * @param {string} to - Target language (default: 'en')
 */
export default function TranslateButton({ sourceText, onTranslated, from = 'id', to = 'en', label }) {
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (!sourceText || sourceText.trim() === '') return;

        setLoading(true);
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: sourceText, from, to }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (data.translated) {
                onTranslated(data.translated);
            }
        } catch (err) {
            console.error('Translation failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleTranslate}
            disabled={loading || !sourceText}
            title={label || `Auto-translate from ${from.toUpperCase()} to ${to.toUpperCase()}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: loading ? 'var(--text-muted)' : 'var(--accent-primary)',
                background: 'rgba(96, 165, 250, 0.08)',
                border: '1px solid rgba(96, 165, 250, 0.15)',
                borderRadius: '6px',
                cursor: loading || !sourceText ? 'not-allowed' : 'pointer',
                opacity: !sourceText ? 0.4 : 1,
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-body)',
            }}
            onMouseOver={e => {
                if (!loading && sourceText) {
                    e.currentTarget.style.background = 'rgba(96, 165, 250, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.3)';
                }
            }}
            onMouseOut={e => {
                e.currentTarget.style.background = 'rgba(96, 165, 250, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.15)';
            }}
        >
            <Languages size={12} />
            {loading ? 'Translating...' : (label || 'Auto Translate')}
        </button>
    );
}
