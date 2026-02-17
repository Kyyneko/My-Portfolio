import { supabase, isSupabaseConfigured } from './supabase';

// ============ DEMO DATA (used when Supabase is not configured) ============

const demoProfile = {
    id: 1,
    name_en: 'Mahendra Kirana M.B',
    name_id: 'Mahendra Kirana M.B',
    title_en: 'Full-Stack Developer',
    title_id: 'Pengembang Full-Stack',
    bio_en: 'Detail-oriented Information Systems graduate from Universitas Hasanuddin with a strong foundation in full-stack web development and database management. Experienced in building innovative web solutions using Python (Flask), SQL, JavaScript, React.js/Next.js, and Laravel. Passionate about Machine Learning and creating clean, efficient code.',
    bio_id: 'Sarjana Sistem Informasi dari Universitas Hasanuddin yang berorientasi pada detail dengan pemahaman kuat dalam pengembangan aplikasi web full-stack dan manajemen basis data. Berpengalaman membangun solusi web inovatif menggunakan Python (Flask), SQL, JavaScript, React.js/Next.js, dan Laravel. Antusias dalam Machine Learning dan menghasilkan kode yang bersih dan efisien.',
    avatar_url: '',
    resume_url: '#',
    email: 'mahendrakirana284@gmail.com',
    github: 'https://github.com/Kyyneko',
    linkedin: 'https://linkedin.com/in/mahendra-kirana-m-b-a20797329',
    instagram: '',
};

const demoSkills = [
    { id: 1, name: 'JavaScript', category: 'Frontend', icon: 'code', proficiency: 85, sort_order: 1 },
    { id: 2, name: 'React.js', category: 'Frontend', icon: 'layout', proficiency: 80, sort_order: 2 },
    { id: 3, name: 'Next.js', category: 'Frontend', icon: 'layout', proficiency: 75, sort_order: 3 },
    { id: 4, name: 'HTML & CSS', category: 'Frontend', icon: 'palette', proficiency: 90, sort_order: 4 },
    { id: 5, name: 'Tailwind CSS', category: 'Frontend', icon: 'palette', proficiency: 80, sort_order: 5 },
    { id: 6, name: 'Python', category: 'Backend', icon: 'terminal', proficiency: 85, sort_order: 6 },
    { id: 7, name: 'Flask', category: 'Backend', icon: 'server', proficiency: 75, sort_order: 7 },
    { id: 8, name: 'Laravel', category: 'Backend', icon: 'server', proficiency: 70, sort_order: 8 },
    { id: 9, name: 'REST API', category: 'Backend', icon: 'server', proficiency: 80, sort_order: 9 },
    { id: 10, name: 'Java', category: 'Backend', icon: 'code', proficiency: 70, sort_order: 10 },
    { id: 11, name: 'MySQL', category: 'Database', icon: 'database', proficiency: 80, sort_order: 11 },
    { id: 12, name: 'PostgreSQL', category: 'Database', icon: 'database', proficiency: 75, sort_order: 12 },
    { id: 13, name: 'Git & GitHub', category: 'Tools', icon: 'git-branch', proficiency: 85, sort_order: 13 },
    { id: 14, name: 'Machine Learning', category: 'AI/ML', icon: 'brain', proficiency: 75, sort_order: 14 },
    { id: 15, name: 'TensorFlow / Keras', category: 'AI/ML', icon: 'brain', proficiency: 70, sort_order: 15 },
    { id: 16, name: 'Pandas & NumPy', category: 'AI/ML', icon: 'bar-chart', proficiency: 80, sort_order: 16 },
];

const demoProjects = [
    {
        id: 1, title_en: 'Emotica – Sentiment Analysis', title_id: 'Emotica – Analisis Sentimen',
        description_en: 'A full-stack web application for real-time Indonesian text sentiment analysis. Covers the complete development cycle: UI design (Front-End), REST API (Back-End), and Deep Learning model integration (Machine Learning) as its core engine.',
        description_id: 'Aplikasi web full-stack untuk analisis sentimen teks Bahasa Indonesia secara real-time. Mencakup seluruh siklus pengembangan: perancangan UI (Front-End), REST API (Back-End), dan integrasi model Deep Learning (Machine Learning) sebagai mesin utamanya.',
        image_url: '', live_url: '#', github_url: 'https://github.com/Kyyneko',
        tech_stack: ['Python', 'Flask', 'TensorFlow', 'NLP', 'React.js'], featured: true, sort_order: 1
    },
    {
        id: 2, title_en: 'KyySchool Website', title_id: 'Website KyySchool',
        description_en: 'A school profile and information website built with Laravel 10, Blade, and MySQL. Features a public portal (profile, facilities, achievements, news, extracurriculars) and an admin/teacher dashboard for managing users, articles, organizations, banners, and teaching documents.',
        description_id: 'Website profil dan informasi sekolah berbasis Laravel 10, Blade, dan MySQL. Menampilkan portal publik (profil, fasilitas, prestasi, berita, ekstrakurikuler) serta dashboard admin/guru untuk mengelola pengguna, artikel, organisasi, banner, dan dokumen perangkat pembelajaran.',
        image_url: '', live_url: '#', github_url: 'https://github.com/Kyyneko',
        tech_stack: ['Laravel', 'Blade', 'MySQL', 'Bootstrap'], featured: true, sort_order: 2
    },
    {
        id: 3, title_en: 'KyyNime – Anime Catalog', title_id: 'KyyNime – Katalog Anime',
        description_en: 'A modern anime information website built with React + Vite that consumes a third-party API to display anime lists and details (synopsis, characters, seasons, ratings) with a responsive, fast, and user-friendly interface.',
        description_id: 'Website informasi anime modern berbasis React + Vite yang mengkonsumsi API pihak ketiga untuk menampilkan daftar dan detail anime (sinopsis, karakter, season, rating) dengan tampilan yang responsif, cepat, dan mudah digunakan.',
        image_url: '', live_url: '#', github_url: 'https://github.com/Kyyneko',
        tech_stack: ['React.js', 'Vite', 'REST API', 'CSS'], featured: false, sort_order: 3
    },
    {
        id: 4, title_en: 'RNR Shoe Webstore', title_id: 'RNR Shoe Webstore',
        description_en: 'A full-stack e-commerce web application with Flask REST API and React.js interactive UI. Features a product recommendation system for personalized suggestions to enhance user shopping experience.',
        description_id: 'Aplikasi web e-commerce full-stack dengan REST API Flask dan UI interaktif React.js. Memiliki fitur sistem rekomendasi produk untuk memberikan saran yang dipersonalisasi dan meningkatkan pengalaman belanja pengguna.',
        image_url: '', live_url: '#', github_url: 'https://github.com/Kyyneko',
        tech_stack: ['Flask', 'React.js', 'Python', 'REST API'], featured: false, sort_order: 4
    },
    {
        id: 5, title_en: 'CinePedia Mobile App', title_id: 'Aplikasi Mobile CinePedia',
        description_en: 'A native Android app (Java) for movie cataloging, integrating TMDB API for real-time data displayed with RecyclerView. Includes SQLite local database for CRUD on profiles and watchlist, plus login session management with Shared Preferences.',
        description_id: 'Aplikasi Android native (Java) untuk katalog film, mengintegrasikan TMDB API untuk data real-time dengan RecyclerView. Mencakup database lokal SQLite untuk CRUD profil dan watchlist, serta manajemen sesi login dengan Shared Preferences.',
        image_url: '', live_url: '#', github_url: 'https://github.com/Kyyneko',
        tech_stack: ['Java', 'Android', 'SQLite', 'TMDB API'], featured: false, sort_order: 5
    },
    {
        id: 6, title_en: 'Sleep Disorder Predictor', title_id: 'Prediksi Gangguan Tidur',
        description_en: 'A web application to diagnose potential sleep disorders based on health data and daily habits. Uses a trained ML model to predict insomnia, sleep apnea, or healthy conditions. Frontend built with Next.js, backend with Flask.',
        description_id: 'Aplikasi web untuk mendiagnosis potensi gangguan tidur berdasarkan data kesehatan dan kebiasaan sehari-hari. Menggunakan model ML terlatih untuk memprediksi insomnia, sleep apnea, atau kondisi sehat. Frontend Next.js, backend Flask.',
        image_url: '', live_url: '#', github_url: 'https://github.com/Kyyneko',
        tech_stack: ['Next.js', 'Flask', 'Machine Learning', 'Python'], featured: true, sort_order: 6
    },
];

const demoCertificates = [
    { id: 1, title: 'Machine Learning Terapan', issuer: 'Dicoding Indonesia', date: '2025-06-01', credential_url: '#', image_url: '', sort_order: 1 },
    { id: 2, title: 'Belajar Pengembangan Machine Learning', issuer: 'Dicoding Indonesia', date: '2025-05-15', credential_url: '#', image_url: '', sort_order: 2 },
    { id: 3, title: 'Belajar Machine Learning untuk Pemula', issuer: 'Dicoding Indonesia', date: '2025-05-01', credential_url: '#', image_url: '', sort_order: 3 },
    { id: 4, title: 'Belajar Fundamental Pemrosesan Data', issuer: 'Dicoding Indonesia', date: '2025-05-10', credential_url: '#', image_url: '', sort_order: 4 },
    { id: 5, title: 'Belajar Analisis Data dengan Python', issuer: 'Dicoding Indonesia', date: '2025-03-01', credential_url: '#', image_url: '', sort_order: 5 },
    { id: 6, title: 'Belajar Dasar Git dengan GitHub', issuer: 'Dicoding Indonesia', date: '2025-02-01', credential_url: '#', image_url: '', sort_order: 6 },
    { id: 7, title: 'Belajar Dasar Structured Language (SQL)', issuer: 'Dicoding Indonesia', date: '2025-02-01', credential_url: '#', image_url: '', sort_order: 7 },
    { id: 8, title: 'Belajar Visualisasi Data', issuer: 'Dicoding Indonesia', date: '2025-02-01', credential_url: '#', image_url: '', sort_order: 8 },
    { id: 9, title: 'Belajar Pemrograman JavaScript', issuer: 'Dicoding Indonesia', date: '2024-11-01', credential_url: '#', image_url: '', sort_order: 9 },
    { id: 10, title: 'Belajar AWS Cloud', issuer: 'Dicoding Indonesia', date: '2024-11-01', credential_url: '#', image_url: '', sort_order: 10 },
    { id: 11, title: 'Memulai Pemrograman Python', issuer: 'Dicoding Indonesia', date: '2024-11-01', credential_url: '#', image_url: '', sort_order: 11 },
    { id: 12, title: 'Belajar Dasar Manajemen Proyek', issuer: 'Dicoding Indonesia', date: '2024-08-01', credential_url: '#', image_url: '', sort_order: 12 },
];

const demoExperience = [
    {
        id: 1, company: 'Universitas Hasanuddin',
        role_en: 'Lab Coordinator – Algorithm & Programming', role_id: 'Koordinator Asisten Lab Algoritma & Pemrograman',
        description_en: 'Coordinated 14 lab assistants for scheduling and student group assignments. Provided technical guidance and troubleshooting sessions during practicum. Conducted assessments and gave feedback to ensure student understanding meets curriculum targets.',
        description_id: 'Mengkoordinir 14 asisten laboratorium untuk pembagian jadwal mengajar dan pembagian grup praktikan. Memberikan bimbingan teknis dan sesi troubleshooting selama praktikum. Melakukan penilaian dan feedback untuk memastikan pemahaman mahasiswa sesuai target kurikulum.',
        start_date: '2025-08-01', end_date: null, is_current: true, sort_order: 1
    },
    {
        id: 2, company: 'Universitas Hasanuddin',
        role_en: 'Lab Assistant – Mobile Programming', role_id: 'Asisten Lab Pemrograman Mobile',
        description_en: 'Assisted lecturers in teaching mobile programming practicum. Provided technical guidance to 25 students per class and troubleshooting during lab hours. Conducted assessments and feedback aligned with curriculum targets.',
        description_id: 'Membantu dosen mengajarkan materi praktikum pemrograman mobile. Memberikan bimbingan teknis kepada 25 mahasiswa per kelas dan troubleshooting selama jam praktikum. Melakukan penilaian dan feedback sesuai target kurikulum.',
        start_date: '2025-02-01', end_date: '2025-06-30', is_current: false, sort_order: 2
    },
    {
        id: 3, company: 'Dicoding Indonesia – DBS Foundation',
        role_en: 'Coding Camp Participant – Machine Learning', role_id: 'Peserta Coding Camp – Machine Learning',
        description_en: 'Completed intensive training on Machine Learning path. Developed a capstone project: a text sentiment analysis model. Actively participated in mentoring sessions and collaborated in a team for the final project.',
        description_id: 'Menyelesaikan pelatihan intensif pada alur belajar Machine Learning. Mengembangkan proyek capstone yaitu model analisis sentimen teks. Aktif berpartisipasi dalam sesi mentoring dan berkolaborasi dalam tim untuk proyek akhir.',
        start_date: '2025-02-01', end_date: '2025-06-30', is_current: false, sort_order: 3
    },
    {
        id: 4, company: 'AIESEC in Unhas',
        role_en: 'Coach – Future Leaders Winter Peak 2024', role_id: 'Coach – AIESEC Future Leaders Winter Peak 2024',
        description_en: 'Mentored a team of 8 participants in designing and executing personal branding strategies on social media. Facilitated discussion and brainstorming sessions. Provided regular feedback and evaluation on social media development progress.',
        description_id: 'Membimbing satu tim berisi 8 peserta dalam merancang dan mengeksekusi strategi personal branding di media sosial. Memfasilitasi sesi diskusi dan brainstorming. Memberikan feedback dan evaluasi secara berkala pada progres pengembangan akun media sosial peserta.',
        start_date: '2024-12-01', end_date: '2025-02-28', is_current: false, sort_order: 4
    },
    {
        id: 5, company: 'AIESEC in Unhas',
        role_en: 'Organizing Committee – Local Project', role_id: 'Panitia – Proyek Lokal Summer Peak 2024',
        description_en: 'Oversaw planning, logistics, and execution of a community-focused project event for elderly communities. Mentored team members to develop leadership skills. Facilitated effective communication between the project team and the community.',
        description_id: 'Mengawasi perencanaan, logistik, dan eksekusi acara proyek yang berfokus pada komunitas lansia. Memberikan mentoring kepada anggota tim untuk mengembangkan keterampilan kepemimpinan. Memfasilitasi komunikasi efektif antara tim proyek dan komunitas.',
        start_date: '2024-07-01', end_date: '2024-07-31', is_current: false, sort_order: 5
    },
];

const demoEducation = [
    {
        id: 1, institution: 'Universitas Hasanuddin',
        degree_en: 'Bachelor of Science (S1)', degree_id: 'Sarjana (S1)',
        field_en: 'Information Systems', field_id: 'Sistem Informasi',
        start_year: 2022, end_year: 2026,
        description_en: 'GPA: 3.77 — Coursework: Intelligent Information Systems Engineering, Machine Learning, Deep Learning.',
        description_id: 'IPK: 3.77 — Mata Kuliah: Rekayasa Sistem Informasi Cerdas, Machine Learning, Deep Learning.',
        sort_order: 1
    },
    {
        id: 2, institution: 'SMAN 2 Bulukumba',
        degree_en: 'High School Diploma', degree_id: 'SMA',
        field_en: 'Natural Sciences', field_id: 'Ilmu Pengetahuan Alam',
        start_year: 2019, end_year: 2022,
        description_en: 'Score: 92.32',
        description_id: 'Nilai: 92.32',
        sort_order: 2
    },
];

// ============ DATA FETCHING ============

export async function getProfile() {
    if (!isSupabaseConfigured()) return demoProfile;
    const { data, error } = await supabase.from('profile').select('*').single();
    if (error || !data) return demoProfile;
    return data;
}

export async function getSkills() {
    if (!isSupabaseConfigured()) return demoSkills;
    const { data, error } = await supabase.from('skills').select('*').order('sort_order');
    if (error || !data || data.length === 0) return demoSkills;
    return data;
}

export async function getProjects() {
    if (!isSupabaseConfigured()) return demoProjects;
    const { data, error } = await supabase.from('projects').select('*').order('sort_order');
    if (error || !data || data.length === 0) return demoProjects;
    return data;
}

export async function getCertificates() {
    if (!isSupabaseConfigured()) return demoCertificates;
    const { data, error } = await supabase.from('certificates').select('*').order('sort_order');
    if (error || !data || data.length === 0) return demoCertificates;
    return data;
}

export async function getExperience() {
    if (!isSupabaseConfigured()) return demoExperience;
    const { data, error } = await supabase.from('experience').select('*').order('sort_order');
    if (error || !data || data.length === 0) return demoExperience;
    return data;
}

export async function getEducation() {
    if (!isSupabaseConfigured()) return demoEducation;
    const { data, error } = await supabase.from('education').select('*').order('sort_order');
    if (error || !data || data.length === 0) return demoEducation;
    return data;
}

// ============ ADMIN MUTATIONS ============

export async function updateProfile(profileData) {
    const { data, error } = await supabase
        .from('profile')
        .upsert({ id: 1, ...profileData })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function upsertSkill(skill) {
    const { data, error } = await supabase.from('skills').upsert(skill).select().single();
    if (error) throw error;
    return data;
}

export async function deleteSkill(id) {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) throw error;
}

export async function upsertProject(project) {
    const { data, error } = await supabase.from('projects').upsert(project).select().single();
    if (error) throw error;
    return data;
}

export async function deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
}

export async function upsertCertificate(cert) {
    const { data, error } = await supabase.from('certificates').upsert(cert).select().single();
    if (error) throw error;
    return data;
}

export async function deleteCertificate(id) {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) throw error;
}

export async function upsertExperience(exp) {
    const { data, error } = await supabase.from('experience').upsert(exp).select().single();
    if (error) throw error;
    return data;
}

export async function deleteExperience(id) {
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (error) throw error;
}

export async function upsertEducation(edu) {
    const { data, error } = await supabase.from('education').upsert(edu).select().single();
    if (error) throw error;
    return data;
}

export async function deleteEducation(id) {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) throw error;
}

// ============ BULK DELETE ============
// Removed as per user request

// ============ AUTH ============

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}

export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
