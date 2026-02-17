'use client';
import {
    Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle,
    AlignmentType, TabStopPosition, TabStopType
} from 'docx';

const fmtDate = (d) => {
    if (!d) return 'Present';
    const [y, m] = d.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(m, 10) - 1] + ' ' + y;
};

const sectionTitle = (text) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: 'Calibri', color: '1a1a1a' })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'b0b0b0', space: 4 } },
});

export function generateDOCX(data, lang = 'en') {
    const { profile, experience, education, skills, projects, certificates } = data;

    const name = lang === 'en' ? (profile?.name_en || profile?.name_id || 'Name') : (profile?.name_id || profile?.name_en || 'Nama');
    const title = lang === 'en' ? (profile?.title_en || profile?.title_id || '') : (profile?.title_id || profile?.title_en || '');
    const bio = lang === 'en' ? (profile?.bio_en || profile?.bio_id) : (profile?.bio_id || profile?.bio_en);

    const contacts = [];
    if (profile?.email) contacts.push(profile.email);
    if (profile?.linkedin) contacts.push(profile.linkedin);
    if (profile?.github) contacts.push(profile.github);

    const sections = [];

    // ==================
    // HEADER
    // ==================
    sections.push(
        new Paragraph({
            children: [new TextRun({ text: name, bold: true, size: 36, font: 'Calibri' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
        }),
        new Paragraph({
            children: [new TextRun({ text: title, size: 22, font: 'Calibri', color: '555555' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
        }),
    );

    if (contacts.length > 0) {
        sections.push(new Paragraph({
            children: [new TextRun({ text: contacts.join('  |  '), size: 18, font: 'Calibri', color: '777777' })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
        }));
    }

    // ==================
    // SUMMARY
    // ==================
    if (bio) {
        sections.push(sectionTitle(lang === 'en' ? 'PROFESSIONAL SUMMARY' : 'RINGKASAN PROFESIONAL'));
        sections.push(new Paragraph({
            children: [new TextRun({ text: bio, size: 20, font: 'Calibri', color: '333333' })],
            spacing: { after: 80 },
        }));
    }

    // ==================
    // EXPERIENCE
    // ==================
    if (experience && experience.length > 0) {
        sections.push(sectionTitle(lang === 'en' ? 'WORK EXPERIENCE' : 'PENGALAMAN KERJA'));

        experience.forEach(exp => {
            const role = lang === 'en' ? (exp.role_en || exp.role_id) : (exp.role_id || exp.role_en);
            const desc = lang === 'en' ? (exp.description_en || exp.description_id) : (exp.description_id || exp.description_en);
            const dateStr = `${fmtDate(exp.start_date)} — ${exp.end_date ? fmtDate(exp.end_date) : 'Present'}`;

            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: role || '', bold: true, size: 21, font: 'Calibri' }),
                    new TextRun({ text: '\t' }),
                    new TextRun({ text: dateStr, size: 18, font: 'Calibri', color: '777777' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { before: 80, after: 20 },
            }));

            sections.push(new Paragraph({
                children: [new TextRun({ text: exp.company || '', italics: true, size: 20, font: 'Calibri', color: '555555' })],
                spacing: { after: 40 },
            }));

            if (desc) {
                sections.push(new Paragraph({
                    children: [new TextRun({ text: desc, size: 19, font: 'Calibri', color: '333333' })],
                    spacing: { after: 80 },
                    indent: { left: 120 },
                }));
            }
        });
    }

    // ==================
    // EDUCATION
    // ==================
    if (education && education.length > 0) {
        sections.push(sectionTitle(lang === 'en' ? 'EDUCATION' : 'PENDIDIKAN'));

        education.forEach(edu => {
            const degree = lang === 'en' ? (edu.degree_en || edu.degree_id) : (edu.degree_id || edu.degree_en);
            const field = lang === 'en' ? (edu.field_en || edu.field_id) : (edu.field_id || edu.field_en);

            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `${degree || ''} — ${field || ''}`, bold: true, size: 21, font: 'Calibri' }),
                    new TextRun({ text: '\t' }),
                    new TextRun({ text: `${edu.start_year} — ${edu.end_year}`, size: 18, font: 'Calibri', color: '777777' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { before: 80, after: 20 },
            }));

            sections.push(new Paragraph({
                children: [new TextRun({ text: edu.institution || '', italics: true, size: 20, font: 'Calibri', color: '555555' })],
                spacing: { after: 80 },
            }));
        });
    }

    // ==================
    // SKILLS
    // ==================
    if (skills && skills.length > 0) {
        sections.push(sectionTitle(lang === 'en' ? 'SKILLS' : 'KEAHLIAN'));

        const grouped = {};
        skills.forEach(s => {
            const cat = s.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(s.name);
        });

        Object.entries(grouped).forEach(([cat, items]) => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `${cat}: `, bold: true, size: 20, font: 'Calibri' }),
                    new TextRun({ text: items.join(', '), size: 19, font: 'Calibri', color: '333333' }),
                ],
                spacing: { after: 40 },
            }));
        });
    }

    // ==================
    // PROJECTS
    // ==================
    if (projects && projects.length > 0) {
        sections.push(sectionTitle(lang === 'en' ? 'PROJECTS' : 'PROYEK'));

        projects.forEach(proj => {
            const projTitle = lang === 'en' ? (proj.title_en || proj.title_id) : (proj.title_id || proj.title_en);
            const desc = lang === 'en' ? (proj.description_en || proj.description_id) : (proj.description_id || proj.description_en);

            sections.push(new Paragraph({
                children: [new TextRun({ text: projTitle || '', bold: true, size: 21, font: 'Calibri' })],
                spacing: { before: 80, after: 20 },
            }));

            if (proj.tech_stack && proj.tech_stack.length > 0) {
                sections.push(new Paragraph({
                    children: [new TextRun({ text: proj.tech_stack.join(', '), italics: true, size: 18, font: 'Calibri', color: '777777' })],
                    spacing: { after: 20 },
                }));
            }

            if (desc) {
                sections.push(new Paragraph({
                    children: [new TextRun({ text: desc, size: 19, font: 'Calibri', color: '333333' })],
                    spacing: { after: 80 },
                    indent: { left: 120 },
                }));
            }
        });
    }

    // ==================
    // CERTIFICATES
    // ==================
    if (certificates && certificates.length > 0) {
        sections.push(sectionTitle(lang === 'en' ? 'CERTIFICATIONS' : 'SERTIFIKASI'));

        certificates.forEach(cert => {
            sections.push(new Paragraph({
                children: [
                    new TextRun({ text: `• ${cert.title}`, size: 20, font: 'Calibri' }),
                    new TextRun({ text: '\t' }),
                    new TextRun({ text: `${cert.issuer} — ${fmtDate(cert.date)}`, size: 18, font: 'Calibri', color: '777777' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { after: 40 },
            }));
        });
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 720, bottom: 720, left: 720, right: 720 },
                },
            },
            children: sections,
        }],
    });

    return doc;
}

export async function downloadDOCX(data, lang = 'en', filename = 'CV') {
    const doc = generateDOCX(data, lang);
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    a.click();
    URL.revokeObjectURL(url);
}
