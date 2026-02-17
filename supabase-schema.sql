-- =============================================
-- PORTFOLIO WEBSITE - SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. PROFILE TABLE
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name_en TEXT DEFAULT '',
  name_id TEXT DEFAULT '',
  title_en TEXT DEFAULT '',
  title_id TEXT DEFAULT '',
  bio_en TEXT DEFAULT '',
  bio_id TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  github TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  instagram TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_profile CHECK (id = 1)
);

-- 2. SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  proficiency INTEGER DEFAULT 80 CHECK (proficiency >= 0 AND proficiency <= 100),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_id TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  description_id TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  live_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  tech_stack TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT DEFAULT '',
  date DATE,
  credential_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  role_en TEXT DEFAULT '',
  role_id TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  description_id TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  institution TEXT NOT NULL,
  degree_en TEXT DEFAULT '',
  degree_id TEXT DEFAULT '',
  field_en TEXT DEFAULT '',
  field_id TEXT DEFAULT '',
  start_year INTEGER,
  end_year INTEGER,
  description_en TEXT DEFAULT '',
  description_id TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Public can READ, only authenticated users can WRITE
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ policies
CREATE POLICY "Public read profile" ON profile FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read experience" ON experience FOR SELECT USING (true);
CREATE POLICY "Public read education" ON education FOR SELECT USING (true);

-- AUTHENTICATED WRITE policies (INSERT, UPDATE, DELETE)
CREATE POLICY "Auth insert profile" ON profile FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update profile" ON profile FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete profile" ON profile FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert skills" ON skills FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update skills" ON skills FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete skills" ON skills FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update projects" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete projects" ON projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert certificates" ON certificates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update certificates" ON certificates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete certificates" ON certificates FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert experience" ON experience FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update experience" ON experience FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete experience" ON experience FOR DELETE TO authenticated USING (true);

CREATE POLICY "Auth insert education" ON education FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update education" ON education FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete education" ON education FOR DELETE TO authenticated USING (true);

-- =============================================
-- INSERT DEFAULT PROFILE ROW
-- =============================================
INSERT INTO profile (id, name_en, name_id, title_en, title_id, bio_en, bio_id, email)
VALUES (
  1,
  'Your Name',
  'Nama Anda',
  'Full Stack Developer',
  'Pengembang Full Stack',
  'Write your bio here in English.',
  'Tulis bio Anda di sini dalam Bahasa Indonesia.',
  'your@email.com'
) ON CONFLICT (id) DO NOTHING;
