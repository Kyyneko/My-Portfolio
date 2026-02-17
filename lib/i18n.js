'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import en from '@/locales/en.json';
import id from '@/locales/id.json';

const translations = { en, id };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const saved = localStorage.getItem('portfolio-lang');
        if (saved && translations[saved]) setLang(saved);
    }, []);

    const switchLanguage = (newLang) => {
        setLang(newLang);
        localStorage.setItem('portfolio-lang', newLang);
    };

    const t = (path) => {
        const keys = path.split('.');
        let result = translations[lang];
        for (const key of keys) {
            result = result?.[key];
        }
        return result || path;
    };

    return (
        <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};
