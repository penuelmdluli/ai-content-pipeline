CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  niche TEXT NOT NULL,
  title TEXT,
  hook TEXT,
  script TEXT NOT NULL,
  hashtags TEXT[],
  thumbnail_text TEXT,
  duration_estimate TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','recorded','edited','scheduled','published')),
  platform TEXT,
  published_url TEXT,
  views INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES scripts(id),
  scheduled_for TIMESTAMPTZ,
  platform TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL,
  niche TEXT,
  handle TEXT,
  subscribers INT DEFAULT 0,
  total_views INT DEFAULT 0,
  revenue_month INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
