-- SQL Schema for AMA Nature Explorer (Supabase / PostgreSQL)

-- 1. Automatic Timestamp Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    full_name TEXT,
    email TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Allow individual write access to own profile" 
    ON public.profiles FOR ALL 
    USING (auth.uid() = id);

-- Trigger for profile creation on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT, -- emoji or Lucide icon key (e.g. "Bird", "Leaf")
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for active categories" 
    ON public.categories FOR SELECT 
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow admin write permissions on categories" 
    ON public.categories FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Points of Interest (Especies / Senderos) Table
CREATE TABLE IF NOT EXISTS public.points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number INTEGER UNIQUE NOT NULL, -- Permanent physical number on trail sign
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    scientific_name TEXT,
    
    -- Small descriptive blocks for mobile UX
    description_es TEXT,
    description_en TEXT,
    habitat_es TEXT,
    habitat_en TEXT,
    diet_es TEXT,
    diet_en TEXT,
    sabias_que_es TEXT,
    sabias_que_en TEXT,
    conservation_es TEXT,
    conservation_en TEXT,
    
    -- Images & Storage
    main_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    
    -- Offline interactive map coordinates (percentages 0-100)
    map_x NUMERIC DEFAULT 0,
    map_y NUMERIC DEFAULT 0,
    
    -- Future-proof assets
    ar_enabled BOOLEAN DEFAULT false,
    model_3d_url TEXT,
    model_3d_offline_size TEXT,
    marker_info JSONB DEFAULT '{}'::jsonb,
    audio_es_url TEXT,
    audio_en_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select for active points" 
    ON public.points FOR SELECT 
    USING (active = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow admin write permissions on points" 
    ON public.points FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE TRIGGER update_points_updated_at
    BEFORE UPDATE ON public.points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Application Settings (e.g. general configs, map image URL)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to app settings" 
    ON public.app_settings FOR SELECT 
    USING (true);

CREATE POLICY "Allow admin write permissions on settings" 
    ON public.app_settings FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Offline Content Versions
CREATE TABLE IF NOT EXISTS public.offline_versions (
    version SERIAL PRIMARY KEY,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    file_size_approx TEXT DEFAULT '0 MB',
    total_points INTEGER DEFAULT 0,
    total_images INTEGER DEFAULT 0
);

ALTER TABLE public.offline_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to offline versions" 
    ON public.offline_versions FOR SELECT 
    USING (true);

CREATE POLICY "Allow admin write permissions on versions" 
    ON public.offline_versions FOR ALL 
    USING (auth.role() = 'authenticated');

-- 7. Seed Initial Settings
INSERT INTO public.app_settings (key, value) VALUES
('content_version', '1'),
('map_image_url', ''),
('welcome_title_es', 'Explora el Bosque Lluvioso'),
('welcome_title_en', 'Explore the Rainforest'),
('welcome_subtitle_es', 'Cada paso es un nuevo descubrimiento.'),
('welcome_subtitle_en', 'Every step is a new discovery.')
ON CONFLICT (key) DO NOTHING;

-- Seed initial version
INSERT INTO public.offline_versions (version, description, file_size_approx, total_points, total_images)
VALUES (1, 'Versión inicial de lanzamiento', '0 MB', 0, 0)
ON CONFLICT (version) DO NOTHING;

-- 8. Storage Buckets and Policies for 'media'
-- Creates the 'media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public read access for files in the media bucket
CREATE POLICY "Allow public read access to media bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');

-- Allow authenticated administrators to upload files
CREATE POLICY "Allow admin upload to media bucket"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'media');

-- Allow authenticated administrators to update/overwrite files
CREATE POLICY "Allow admin update to media bucket"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'media');

-- Allow authenticated administrators to delete files
CREATE POLICY "Allow admin delete from media bucket"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'media');

