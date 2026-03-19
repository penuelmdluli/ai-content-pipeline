CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  niche TEXT NOT NULL, language TEXT DEFAULT 'english', tone TEXT DEFAULT 'educational',
  topic TEXT, content TEXT NOT NULL,
  hook TEXT, body TEXT, cta TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','approved','voiced','animated','published')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE video_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES scripts(id),
  user_id UUID NOT NULL,
  voice_url TEXT, video_url TEXT, final_url TEXT,
  elevenlabs_job_id TEXT, kling_job_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','voicing','animating','editing','done','failed')),
  error_message TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ
);

CREATE TABLE publish_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_job_id UUID REFERENCES video_jobs(id),
  user_id UUID NOT NULL,
  platforms TEXT[] DEFAULT '{"tiktok","youtube_shorts"}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','published','failed')),
  tiktok_post_id TEXT, youtube_video_id TEXT, instagram_post_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE channel_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, platform TEXT NOT NULL, niche TEXT,
  date DATE DEFAULT CURRENT_DATE,
  views INT DEFAULT 0, likes INT DEFAULT 0, shares INT DEFAULT 0, followers_gained INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own scripts" ON scripts FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users own jobs" ON video_jobs FOR ALL USING (user_id = auth.uid());
