'use client';
import { jsPDF } from 'jspdf';

// ─── Layout Constants ───
const M_LEFT = 18;
const M_RIGHT = 18;
const M_TOP = 16;
const M_BOTTOM = 16;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - M_LEFT - M_RIGHT;

// ─── Colors ───
const C = {
    black: [25, 25, 25],
    dark: [45, 45, 45],
    body: [55, 55, 55],
    muted: [120, 120, 120],
    light: [160, 160, 160],
    accent: [37, 99, 235],
    line: [200, 205, 215],
    lineDark: [80, 90, 110],
    bg: [243, 245, 248],
};

const fmtDate = (d) => {
    if (!d) return 'Present';
    const [y, m] = d.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
};

export function generatePDF(data, lang = 'en') {
    const { profile, experience, education, skills, projects, certificates } = data;
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = M_TOP;

    // ─── Helpers ───
    const setColor = (c) => doc.setTextColor(c[0], c[1], c[2]);
    const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);

    const checkPage = (needed = 14) => {
        if (y + needed > PAGE_H - M_BOTTOM) {
            doc.addPage();
            y = M_TOP;
        }
    };

    const drawSectionHeader = (title) => {
        checkPage(18);
        y += 3;

        // Section title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        setColor(C.accent);
        doc.text(title.toUpperCase(), M_LEFT, y);

        // Full-width line under title
        y += 2;
        setDraw(C.line);
        doc.setLineWidth(0.4);
        doc.line(M_LEFT, y, PAGE_W - M_RIGHT, y);
        y += 5;
    };

    const drawBulletLine = (text, indent = 4) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(C.body);

        const bulletX = M_LEFT + indent;
        const textX = bulletX + 3.5;
        const maxW = CONTENT_W - indent - 3.5;

        // Split by sentences/bullet points for cleaner display
        const lines = doc.splitTextToSize(text, maxW);
        lines.forEach((line, i) => {
            checkPage(4.2);
            if (i === 0) {
                setColor(C.accent);
                doc.text('•', bulletX, y);
                setColor(C.body);
            }
            doc.text(line, i === 0 ? textX : textX, y);
            y += 3.8;
        });
    };

    // ══════════════════════════════════════
    //  HEADER
    // ══════════════════════════════════════
    const name = lang === 'en' ? (profile?.name_en || profile?.name_id || '') : (profile?.name_id || profile?.name_en || '');
    const title = lang === 'en' ? (profile?.title_en || profile?.title_id || '') : (profile?.title_id || profile?.title_en || '');

    // Name — big and bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    setColor(C.black);
    doc.text(name, PAGE_W / 2, y, { align: 'center' });
    y += 7;

    // Title
    if (title) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        setColor(C.muted);
        doc.text(title, PAGE_W / 2, y, { align: 'center' });
        y += 5.5;
    }

    // Contact line with dividers
    const contacts = [];
    if (profile?.email) contacts.push(profile.email);
    if (profile?.github) contacts.push(profile.github.replace('https://', ''));
    if (profile?.linkedin) contacts.push(profile.linkedin.replace('https://', ''));

    if (contacts.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        setColor(C.muted);
        doc.text(contacts.join('   ·   '), PAGE_W / 2, y, { align: 'center' });
        y += 4;
    }

    // Header separator — thick accent line
    y += 1.5;
    setDraw(C.accent);
    doc.setLineWidth(0.8);
    doc.line(M_LEFT, y, PAGE_W - M_RIGHT, y);
    y += 5;

    // ══════════════════════════════════════
    //  PROFESSIONAL SUMMARY
    // ══════════════════════════════════════
    const bio = lang === 'en' ? (profile?.bio_en || profile?.bio_id) : (profile?.bio_id || profile?.bio_en);
    if (bio) {
        drawSectionHeader(lang === 'en' ? 'Professional Summary' : 'Ringkasan Profesional');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        setColor(C.body);
        const bioLines = doc.splitTextToSize(bio, CONTENT_W);
        bioLines.forEach(line => {
            checkPage(4.2);
            doc.text(line, M_LEFT, y);
            y += 4;
        });
        y += 1;
    }

    // ══════════════════════════════════════
    //  WORK EXPERIENCE
    // ══════════════════════════════════════
    if (experience && experience.length > 0) {
        drawSectionHeader(lang === 'en' ? 'Work Experience' : 'Pengalaman Kerja');

        experience.forEach((exp, idx) => {
            checkPage(16);
            const role = lang === 'en' ? (exp.role_en || exp.role_id) : (exp.role_id || exp.role_en);
            const desc = lang === 'en' ? (exp.description_en || exp.description_id) : (exp.description_id || exp.description_en);
            const dateStr = `${fmtDate(exp.start_date)} – ${exp.end_date ? fmtDate(exp.end_date) : 'Present'}`;

            // Row 1: Role (left) — Date (right)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setColor(C.dark);
            doc.text(role || '', M_LEFT, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setColor(C.muted);
            doc.text(dateStr, PAGE_W - M_RIGHT, y, { align: 'right' });
            y += 4;

            // Row 2: Company
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            setColor(C.muted);
            doc.text(exp.company || '', M_LEFT, y);
            y += 4.5;

            // Description as bullet points
            if (desc) {
                const bullets = desc.split(/[.;]\s*/).filter(s => s.trim().length > 3);
                if (bullets.length > 1) {
                    bullets.forEach(b => {
                        drawBulletLine(b.trim().replace(/\.$/, ''));
                    });
                } else {
                    drawBulletLine(desc);
                }
            }

            // Subtle spacing between entries
            if (idx < experience.length - 1) y += 2;
        });
        y += 1;
    }

    // ══════════════════════════════════════
    //  EDUCATION
    // ══════════════════════════════════════
    if (education && education.length > 0) {
        drawSectionHeader(lang === 'en' ? 'Education' : 'Pendidikan');

        education.forEach((edu, idx) => {
            checkPage(12);
            const degree = lang === 'en' ? (edu.degree_en || edu.degree_id) : (edu.degree_id || edu.degree_en);
            const field = lang === 'en' ? (edu.field_en || edu.field_id) : (edu.field_id || edu.field_en);
            const title = [degree, field].filter(Boolean).join(' — ');

            // Row 1: Degree + Field — Years
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setColor(C.dark);
            doc.text(title, M_LEFT, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setColor(C.muted);
            doc.text(`${edu.start_year} – ${edu.end_year}`, PAGE_W - M_RIGHT, y, { align: 'right' });
            y += 4;

            // Row 2: Institution
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            setColor(C.muted);
            doc.text(edu.institution || '', M_LEFT, y);
            y += 5;

            // Description if present
            if (edu.description_en || edu.description_id) {
                const desc = lang === 'en' ? (edu.description_en || edu.description_id) : (edu.description_id || edu.description_en);
                if (desc) drawBulletLine(desc);
            }

            if (idx < education.length - 1) y += 1;
        });
        y += 1;
    }

    // ══════════════════════════════════════
    //  SKILLS
    // ══════════════════════════════════════
    if (skills && skills.length > 0) {
        drawSectionHeader(lang === 'en' ? 'Technical Skills' : 'Keahlian Teknis');

        // Group by category
        const grouped = {};
        skills.forEach(s => {
            const cat = s.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(s.name);
        });

        Object.entries(grouped).forEach(([cat, items]) => {
            checkPage(7);

            // Category label
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            setColor(C.dark);
            const catLabel = `${cat}:  `;
            doc.text(catLabel, M_LEFT, y);
            const catW = doc.getTextWidth(catLabel);

            // Items
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setColor(C.body);
            const itemsText = items.join(',  ');
            const remaining = CONTENT_W - catW;
            const lines = doc.splitTextToSize(itemsText, remaining);

            doc.text(lines[0], M_LEFT + catW, y);
            y += 4.2;

            for (let i = 1; i < lines.length; i++) {
                checkPage(4.2);
                doc.text(lines[i], M_LEFT + 2, y);
                y += 4.2;
            }
        });
        y += 1;
    }

    // ══════════════════════════════════════
    //  PROJECTS
    // ══════════════════════════════════════
    if (projects && projects.length > 0) {
        drawSectionHeader(lang === 'en' ? 'Projects' : 'Proyek');

        projects.forEach((proj, idx) => {
            checkPage(14);
            const projTitle = lang === 'en' ? (proj.title_en || proj.title_id) : (proj.title_id || proj.title_en);
            const desc = lang === 'en' ? (proj.description_en || proj.description_id) : (proj.description_id || proj.description_en);

            // Project name
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setColor(C.dark);
            doc.text(projTitle || '', M_LEFT, y);
            y += 4;

            // Tech stack
            if (proj.tech_stack && proj.tech_stack.length > 0) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(8.5);
                setColor(C.muted);
                doc.text(proj.tech_stack.join('  ·  '), M_LEFT, y);
                y += 4;
            }

            // Description
            if (desc) drawBulletLine(desc);

            // Links
            const links = [];
            if (proj.live_url) links.push(proj.live_url.replace('https://', ''));
            if (proj.github_url) links.push(proj.github_url.replace('https://', ''));
            if (links.length > 0) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                setColor(C.accent);
                doc.text(links.join('   |   '), M_LEFT + 7.5, y);
                y += 3.5;
            }

            if (idx < projects.length - 1) y += 2;
        });
        y += 1;
    }

    // ══════════════════════════════════════
    //  CERTIFICATIONS
    // ══════════════════════════════════════
    if (certificates && certificates.length > 0) {
        drawSectionHeader(lang === 'en' ? 'Certifications & Licenses' : 'Sertifikasi & Lisensi');

        certificates.forEach(cert => {
            checkPage(6);

            // Bullet + Title (left) — Issuer + Date (right)
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);

            setColor(C.accent);
            doc.text('•', M_LEFT + 1, y);

            setColor(C.dark);
            doc.setFont('helvetica', 'bold');
            const certTitle = cert.title || '';
            doc.text(certTitle, M_LEFT + 5, y);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setColor(C.muted);
            doc.text(`${cert.issuer}  ·  ${fmtDate(cert.date)}`, PAGE_W - M_RIGHT, y, { align: 'right' });
            y += 4.5;
        });
    }

    // ══════════════════════════════════════
    //  FOOTER
    // ══════════════════════════════════════
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(180, 180, 180);
        doc.text(`${name}  ·  Page ${i} of ${totalPages}`, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
    }

    return doc;
}
