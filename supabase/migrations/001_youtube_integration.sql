-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  youtube_channel_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  custom_url VARCHAR(255),
  thumbnail_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  last_analyzed_at TIMESTAMP WITH TIME ZONE,
  analytics_summary JSONB,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, youtube_channel_id)
);

-- Create channel_analyses table
CREATE TABLE IF NOT EXISTS channel_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analytics_data JSONB NOT NULL,
  audience_persona JSONB,
  insights JSONB,
  videos_analyzed INTEGER DEFAULT 0,
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Create indexes
CREATE INDEX idx_channels_user_id ON channels(user_id);
CREATE INDEX idx_channels_youtube_channel_id ON channels(youtube_channel_id);
CREATE INDEX idx_channel_analyses_channel_id ON channel_analyses(channel_id);
CREATE INDEX idx_channel_analyses_user_id ON channel_analyses(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for channels
CREATE POLICY "Users can view their own channels" ON channels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channels" ON channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels" ON channels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channels" ON channels
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for channel_analyses
CREATE POLICY "Users can view their own analyses" ON channel_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses" ON channel_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);