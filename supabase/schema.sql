-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  features JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channels table
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  youtube_channel_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subscriber_count INTEGER DEFAULT 0,
  voice_profile JSONB DEFAULT '{}',
  analytics_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice profiles
CREATE TABLE public.voice_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  profile_name TEXT NOT NULL,
  training_data JSONB DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scripts table
CREATE TABLE public.scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  hook TEXT,
  description TEXT,
  tags TEXT[],
  credits_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research sources
CREATE TABLE public.research_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  script_id UUID REFERENCES public.scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_url TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('web', 'youtube', 'pdf', 'text')),
  content TEXT,
  citations JSONB DEFAULT '[]',
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credits transactions
CREATE TABLE public.credits_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat history for ideation
CREATE TABLE public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_channels_user_id ON public.channels(user_id);
CREATE INDEX idx_scripts_channel_id ON public.scripts(channel_id);
CREATE INDEX idx_research_sources_script_id ON public.research_sources(script_id);
CREATE INDEX idx_research_sources_user_id ON public.research_sources(user_id);
CREATE INDEX idx_credits_transactions_user_id ON public.credits_transactions(user_id);
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Channels policies
CREATE POLICY "Users can view own channels" ON public.channels
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own channels" ON public.channels
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels" ON public.channels
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels" ON public.channels
  FOR DELETE USING (auth.uid() = user_id);

-- Scripts policies
CREATE POLICY "Users can view scripts from own channels" ON public.scripts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = scripts.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create scripts for own channels" ON public.scripts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scripts from own channels" ON public.scripts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = scripts.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scripts from own channels" ON public.scripts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = scripts.channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- Research sources policies
CREATE POLICY "Users can view own research sources" ON public.research_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own research sources" ON public.research_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own research sources" ON public.research_sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own research sources" ON public.research_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Credits transactions policies
CREATE POLICY "Users can view own transactions" ON public.credits_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view own chat history" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat history" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history" ON public.chat_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Voice profiles policies
CREATE POLICY "Users can view voice profiles from own channels" ON public.voice_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = voice_profiles.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage voice profiles for own channels" ON public.voice_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.channels
      WHERE channels.id = voice_profiles.channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT COALESCE(SUM(
    CASE 
      WHEN type IN ('purchase', 'refund', 'bonus') THEN amount
      WHEN type = 'usage' THEN -amount
    END
  ), 0) INTO v_current_balance
  FROM public.credits_transactions
  WHERE user_id = p_user_id;

  -- Check if user has enough credits
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credits
  INSERT INTO public.credits_transactions (user_id, amount, type, description)
  VALUES (p_user_id, p_amount, 'usage', p_description);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credit balance
CREATE OR REPLACE FUNCTION public.get_credit_balance(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE(SUM(
    CASE 
      WHEN type IN ('purchase', 'refund', 'bonus') THEN amount
      WHEN type = 'usage' THEN -amount
    END
  ), 0)
  FROM public.credits_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, credits, price, features) VALUES
  ('Free', 10, 0.00, '["10 scripts per month", "Basic AI models", "Standard export formats"]'),
  ('Starter', 100, 29.00, '["100 scripts per month", "Advanced AI models", "All export formats", "Voice training", "Priority support"]'),
  ('Pro', 500, 99.00, '["500 scripts per month", "Premium AI models", "Team collaboration", "API access", "Custom voice profiles", "Analytics dashboard"]'),
  ('Enterprise', 999999, 299.00, '["Unlimited scripts", "Custom AI models", "Dedicated support", "Custom integrations", "White-label options"]');