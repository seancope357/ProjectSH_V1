-- AI Studio Database Schema Migration
-- Tables for AI-driven xLights sequence creation and 3D visualization

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Layouts table - stores 3D layouts (both imported and built)
CREATE TABLE layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('xLights', 'builder')),
    layout_json JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layout models table - individual props/models within layouts
CREATE TABLE layout_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layout_id UUID NOT NULL REFERENCES layouts(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'tree', 'matrix', 'arch', 'string', 'prop', etc.
    name TEXT NOT NULL,
    meta_json JSONB NOT NULL DEFAULT '{}', -- model-specific metadata
    positions_json JSONB NOT NULL DEFAULT '[]', -- Vec3 positions for LEDs/pixels
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI sequences table - main sequence records
CREATE TABLE ai_sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'rendering', 'error')),
    layout_id UUID REFERENCES layouts(id) ON DELETE SET NULL,
    duration_ms INTEGER,
    bpm REAL,
    key TEXT, -- musical key
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI sequence versions table - version history with DSL and exports
CREATE TABLE ai_sequence_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id UUID NOT NULL REFERENCES ai_sequences(id) ON DELETE CASCADE,
    dsl_json JSONB NOT NULL DEFAULT '{}', -- Internal DSL representation
    analysis_json JSONB DEFAULT '{}', -- Audio analysis data (BPM, beats, etc.)
    xsq_xml TEXT, -- Exported xLights XML (nullable until generated)
    xsq_size INTEGER, -- Size in bytes for display
    fps INTEGER DEFAULT 50, -- Frame rate
    audio_ref TEXT, -- Supabase storage path to audio file
    preview_ref TEXT, -- Supabase storage path to preview video/gif
    changelog TEXT DEFAULT 'Initial version',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI templates table - reusable effect scaffolds
CREATE TABLE ai_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'genre', 'mood', 'holiday', 'effect'
    description TEXT,
    dsl_template_json JSONB NOT NULL DEFAULT '{}',
    params_schema_json JSONB NOT NULL DEFAULT '{}', -- JSON Schema for parameters
    is_builtin BOOLEAN NOT NULL DEFAULT FALSE, -- System vs user templates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt suggestions table - curated prompts with embeddings
CREATE TABLE prompt_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    text TEXT NOT NULL,
    embedding_vector vector(384), -- all-MiniLM-L6-v2 embeddings (384 dimensions)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI jobs table - async processing jobs (analysis, generation, rendering)
CREATE TABLE ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES ai_sequences(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('analysis', 'generation', 'render')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    progress INTEGER DEFAULT 0, -- 0-100
    error TEXT,
    logs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add ai_sequence_version_id to existing marketplace_listings
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS ai_sequence_version_id UUID REFERENCES ai_sequence_versions(id) ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX idx_layouts_owner_id ON layouts(owner_id);
CREATE INDEX idx_layout_models_layout_id ON layout_models(layout_id);
CREATE INDEX idx_ai_sequences_owner_id ON ai_sequences(owner_id);
CREATE INDEX idx_ai_sequences_status ON ai_sequences(status);
CREATE INDEX idx_ai_sequence_versions_sequence_id ON ai_sequence_versions(sequence_id);
CREATE INDEX idx_ai_templates_category ON ai_templates(category);
CREATE INDEX idx_ai_templates_is_builtin ON ai_templates(is_builtin);
CREATE INDEX idx_prompt_suggestions_category ON prompt_suggestions(category);
CREATE INDEX idx_ai_jobs_owner_id ON ai_jobs(owner_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX idx_marketplace_listings_ai_sequence_version_id ON marketplace_listings(ai_sequence_version_id);

-- Enable vector similarity search on prompt_suggestions
CREATE INDEX ON prompt_suggestions USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);

-- Row Level Security (RLS) Policies

-- Layouts: Users can CRUD their own layouts
ALTER TABLE layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own layouts" ON layouts FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own layouts" ON layouts FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own layouts" ON layouts FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own layouts" ON layouts FOR DELETE USING (auth.uid() = owner_id);

-- Layout models: Users can CRUD models in their layouts
ALTER TABLE layout_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own layout models" ON layout_models FOR SELECT 
    USING (EXISTS (SELECT 1 FROM layouts WHERE layouts.id = layout_models.layout_id AND layouts.owner_id = auth.uid()));
CREATE POLICY "Users can create own layout models" ON layout_models FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM layouts WHERE layouts.id = layout_models.layout_id AND layouts.owner_id = auth.uid()));
CREATE POLICY "Users can update own layout models" ON layout_models FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM layouts WHERE layouts.id = layout_models.layout_id AND layouts.owner_id = auth.uid()));
CREATE POLICY "Users can delete own layout models" ON layout_models FOR DELETE 
    USING (EXISTS (SELECT 1 FROM layouts WHERE layouts.id = layout_models.layout_id AND layouts.owner_id = auth.uid()));

-- AI sequences: Users can CRUD their own sequences
ALTER TABLE ai_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sequences" ON ai_sequences FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own sequences" ON ai_sequences FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own sequences" ON ai_sequences FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own sequences" ON ai_sequences FOR DELETE USING (auth.uid() = owner_id);

-- AI sequence versions: Users can CRUD versions of their sequences
ALTER TABLE ai_sequence_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sequence versions" ON ai_sequence_versions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM ai_sequences WHERE ai_sequences.id = ai_sequence_versions.sequence_id AND ai_sequences.owner_id = auth.uid()));
CREATE POLICY "Users can create own sequence versions" ON ai_sequence_versions FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM ai_sequences WHERE ai_sequences.id = ai_sequence_versions.sequence_id AND ai_sequences.owner_id = auth.uid()));
CREATE POLICY "Users can update own sequence versions" ON ai_sequence_versions FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM ai_sequences WHERE ai_sequences.id = ai_sequence_versions.sequence_id AND ai_sequences.owner_id = auth.uid()));
CREATE POLICY "Users can delete own sequence versions" ON ai_sequence_versions FOR DELETE 
    USING (EXISTS (SELECT 1 FROM ai_sequences WHERE ai_sequences.id = ai_sequence_versions.sequence_id AND ai_sequences.owner_id = auth.uid()));

-- AI templates: Everyone can read, only authenticated users can create non-builtin
ALTER TABLE ai_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view templates" ON ai_templates FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can create user templates" ON ai_templates FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated' AND is_builtin = false);
CREATE POLICY "Only service role can create builtin templates" ON ai_templates FOR INSERT 
    WITH CHECK (auth.role() = 'service_role' AND is_builtin = true);

-- Prompt suggestions: Everyone can read
ALTER TABLE prompt_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view prompt suggestions" ON prompt_suggestions FOR SELECT TO public USING (true);

-- AI jobs: Users can CRUD their own jobs
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own jobs" ON ai_jobs FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own jobs" ON ai_jobs FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own jobs" ON ai_jobs FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own jobs" ON ai_jobs FOR DELETE USING (auth.uid() = owner_id);

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('studio-audio', 'studio-audio', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']), -- 50MB limit
    ('studio-previews', 'studio-previews', true, 10485760, ARRAY['video/mp4', 'video/webm', 'image/gif', 'image/png']), -- 10MB limit
    ('studio-sequences', 'studio-sequences', false, 104857600, ARRAY['application/xml', 'application/json']) -- 100MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Authenticated users can upload studio audio" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'studio-audio' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view own studio audio" ON storage.objects FOR SELECT 
    USING (bucket_id = 'studio-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own studio audio" ON storage.objects FOR DELETE 
    USING (bucket_id = 'studio-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload studio previews" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'studio-previews' AND auth.role() = 'authenticated');
CREATE POLICY "Public can view studio previews" ON storage.objects FOR SELECT 
    USING (bucket_id = 'studio-previews');
CREATE POLICY "Users can delete own studio previews" ON storage.objects FOR DELETE 
    USING (bucket_id = 'studio-previews' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload studio sequences" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'studio-sequences' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view own studio sequences" ON storage.objects FOR SELECT 
    USING (bucket_id = 'studio-sequences' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own studio sequences" ON storage.objects FOR DELETE 
    USING (bucket_id = 'studio-sequences' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger to update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_layouts_updated_at BEFORE UPDATE ON layouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_sequences_updated_at BEFORE UPDATE ON ai_sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_jobs_updated_at BEFORE UPDATE ON ai_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();