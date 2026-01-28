-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ab_test_conversions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  variant_id text NOT NULL,
  user_id uuid,
  session_id text,
  conversion_type text NOT NULL,
  conversion_value numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  converted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ab_test_conversions_pkey PRIMARY KEY (id),
  CONSTRAINT ab_test_conversions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ab_test_exposures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id text NOT NULL,
  variant_id text NOT NULL,
  user_id uuid,
  session_id text,
  page_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  exposed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ab_test_exposures_pkey PRIMARY KEY (id),
  CONSTRAINT ab_test_exposures_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ab_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text])),
  traffic_percentage numeric DEFAULT 1.0 CHECK (traffic_percentage >= 0::numeric AND traffic_percentage <= 1::numeric),
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  success_metrics jsonb DEFAULT '{}'::jsonb,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ab_tests_pkey PRIMARY KEY (id)
);
CREATE TABLE public.action_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel_name text NOT NULL,
  topic text NOT NULL,
  plan_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT action_plans_pkey PRIMARY KEY (id),
  CONSTRAINT action_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.beta_signups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  channel_name text NOT NULL,
  channel_url text NOT NULL,
  channel_id text,
  video_types text NOT NULL,
  upload_frequency text NOT NULL,
  content_source text NOT NULL,
  value_add text NOT NULL,
  long_term_vision text NOT NULL,
  other_tools text,
  specific_needs text,
  how_heard text,
  automation_interest text,
  paid_subscriber boolean DEFAULT false,
  score integer DEFAULT 0,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'accepted'::text, 'rejected'::text, 'waitlisted'::text])),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT beta_signups_pkey PRIMARY KEY (id),
  CONSTRAINT beta_signups_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.channel_analyses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  analytics_data jsonb NOT NULL,
  audience_persona jsonb,
  insights jsonb,
  videos_analyzed integer DEFAULT 0,
  analysis_date timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  audience_description text,
  content_ideas jsonb,
  CONSTRAINT channel_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT channel_analyses_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT channel_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.channel_metrics_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL,
  subscriber_count integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  video_count integer DEFAULT 0,
  average_views bigint DEFAULT 0,
  engagement_rate numeric DEFAULT 0,
  snapshot_date timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT channel_metrics_history_pkey PRIMARY KEY (id),
  CONSTRAINT channel_metrics_history_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.channel_remix_analyses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  remix_channel_id uuid NOT NULL,
  analysis_type text NOT NULL CHECK (analysis_type = ANY (ARRAY['audience'::text, 'content'::text, 'voice'::text, 'performance'::text])),
  analysis_data jsonb NOT NULL,
  generated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT channel_remix_analyses_pkey PRIMARY KEY (id),
  CONSTRAINT channel_remix_analyses_remix_channel_id_fkey FOREIGN KEY (remix_channel_id) REFERENCES public.remix_channels(id)
);
CREATE TABLE public.channels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  youtube_channel_id text NOT NULL,
  name text NOT NULL,
  subscriber_count integer DEFAULT 0,
  voice_profile jsonb DEFAULT '{}'::jsonb,
  analytics_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title text,
  description text,
  custom_url text,
  thumbnail_url text,
  video_count integer DEFAULT 0,
  view_count bigint DEFAULT 0,
  published_at timestamp with time zone,
  last_analyzed_at timestamp with time zone,
  analytics_summary jsonb,
  raw_data jsonb,
  voice_training_status text DEFAULT 'pending'::text CHECK (voice_training_status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'failed'::text, 'skipped'::text])),
  last_voice_training timestamp with time zone,
  auto_train_enabled boolean DEFAULT true,
  voice_training_attempts integer DEFAULT 0,
  voice_training_error text,
  voice_training_job_id uuid,
  audience_description text,
  topics text[] DEFAULT '{}'::text[],
  velocity_score numeric,
  performance_score numeric,
  audience_demographics jsonb DEFAULT '{}'::jsonb,
  category text,
  embedding vector(1536),  -- Requires: CREATE EXTENSION IF NOT EXISTS vector;
  last_intel_sync timestamp with time zone,
  intel_data jsonb DEFAULT '{}'::jsonb,
  voice_training_progress integer DEFAULT 0 CHECK (voice_training_progress >= 0 AND voice_training_progress <= 100),
  handle text,
  is_active boolean DEFAULT true,
  is_verified boolean DEFAULT false,
  is_remix boolean DEFAULT false,
  remix_id uuid,
  remix_source_ids uuid[] DEFAULT '{}'::uuid[],
  is_custom boolean DEFAULT false,
  webhook_url text,
  webhook_secret text,
  webhook_events text[] DEFAULT ARRAY['voice_training.completed'::text, 'voice_training.failed'::text],
  CONSTRAINT channels_pkey PRIMARY KEY (id),
  CONSTRAINT channels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT channels_remix_id_fkey FOREIGN KEY (remix_id) REFERENCES public.remix_channels(id)
);
CREATE TABLE public.chat_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  channel_id uuid,
  messages jsonb DEFAULT '[]'::jsonb,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chat_history_pkey PRIMARY KEY (id),
  CONSTRAINT chat_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT chat_history_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.competitor_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  competitor text NOT NULL,
  user_id uuid,
  session_id text,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT competitor_events_pkey PRIMARY KEY (id),
  CONSTRAINT competitor_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.competitor_migrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  previous_tool text NOT NULL,
  migration_reason text,
  offered_discount numeric,
  discount_claimed boolean DEFAULT false,
  migration_completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT competitor_migrations_pkey PRIMARY KEY (id),
  CONSTRAINT competitor_migrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.content_calendar (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  team_id uuid,
  title character varying NOT NULL,
  description text,
  content_type character varying NOT NULL,
  platform character varying NOT NULL,
  status character varying NOT NULL DEFAULT 'IDEA'::character varying,
  publish_date date NOT NULL,
  publish_time time without time zone,
  timezone character varying DEFAULT 'UTC'::character varying,
  tags text[],
  keywords text[],
  target_audience character varying,
  estimated_duration_minutes integer,
  performance_goals jsonb,
  actual_metrics jsonb,
  notes text,
  attachments jsonb,
  collaborators uuid[],
  platform_data jsonb,
  workflow_id uuid,
  script_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  CONSTRAINT content_calendar_pkey PRIMARY KEY (id),
  CONSTRAINT content_calendar_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT content_calendar_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT content_calendar_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id),
  CONSTRAINT content_calendar_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id)
);
CREATE TABLE public.conversion_funnel (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  source_competitor text,
  funnel_step text NOT NULL,
  step_order integer,
  time_on_step interval,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversion_funnel_pkey PRIMARY KEY (id),
  CONSTRAINT conversion_funnel_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.credit_packages (
  id text NOT NULL,
  name text NOT NULL,
  credits integer NOT NULL,
  price numeric NOT NULL,
  stripe_price_id text NOT NULL UNIQUE,
  stripe_product_id text NOT NULL,
  per_credit_price numeric NOT NULL,
  badge text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_packages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.credit_purchase_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  package_id text,
  credits_purchased integer NOT NULL,
  amount_paid numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  discount_reason text,
  stripe_payment_intent_id text UNIQUE,
  purchase_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT credit_purchase_history_pkey PRIMARY KEY (id),
  CONSTRAINT credit_purchase_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT credit_purchase_history_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.credit_packages(id)
);
CREATE TABLE public.credits_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['purchase'::text, 'usage'::text, 'refund'::text, 'bonus'::text])),
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  stripe_payment_intent_id text,
  stripe_price_id text,
  expires_at timestamp with time zone,
  original_amount integer,
  discount_applied numeric DEFAULT 0,
  is_expired boolean DEFAULT false,
  model_tier character varying,
  actual_api_cost numeric,
  profit_margin numeric,
  script_length integer,
  features_used jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT credits_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT credits_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.cron_job_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['started'::text, 'completed'::text, 'failed'::text])),
  message text,
  error_details text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cron_job_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.intel_bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  resource_type text CHECK (resource_type = ANY (ARRAY['channel'::text, 'video'::text])),
  resource_id text NOT NULL,
  tags text[] DEFAULT '{}'::text[],
  notes text,
  folder text DEFAULT 'general'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT intel_bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT intel_bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.intel_channel_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid,
  date date NOT NULL,
  subscriber_count bigint,
  subscriber_growth integer,
  view_count bigint,
  view_growth bigint,
  video_count integer,
  avg_views_per_video bigint,
  engagement_rate numeric,
  growth_rate numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT intel_channel_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT intel_channel_analytics_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.intel_search_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  query_hash text NOT NULL UNIQUE,
  query_text text NOT NULL,
  results jsonb NOT NULL,
  result_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '01:00:00'::interval),
  CONSTRAINT intel_search_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.intel_search_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  result_count integer DEFAULT 0,
  clicked_results text[] DEFAULT '{}'::text[],
  search_type text DEFAULT 'natural'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT intel_search_history_pkey PRIMARY KEY (id),
  CONSTRAINT intel_search_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.intel_trending (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource_type text CHECK (resource_type = ANY (ARRAY['channel'::text, 'video'::text])),
  resource_id text NOT NULL,
  title text NOT NULL,
  thumbnail_url text,
  metrics jsonb NOT NULL,
  velocity_score numeric,
  rank integer,
  category text,
  snapshot_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT intel_trending_pkey PRIMARY KEY (id)
);
CREATE TABLE public.intel_video_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id text,
  date date NOT NULL,
  hour_1_views bigint,
  hour_24_views bigint,
  day_7_views bigint,
  day_30_views bigint,
  view_velocity numeric,
  like_ratio numeric,
  comment_ratio numeric,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT intel_video_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT intel_video_analytics_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.intel_videos(id)
);
CREATE TABLE public.intel_videos (
  id text NOT NULL,
  channel_id uuid,
  youtube_channel_id text NOT NULL,
  title text NOT NULL,
  description text,
  published_at timestamp with time zone,
  duration integer,
  view_count bigint DEFAULT 0,
  like_count bigint DEFAULT 0,
  comment_count integer DEFAULT 0,
  tags text[] DEFAULT '{}'::text[],
  category_id integer,
  thumbnail_url text,
  topics text[] DEFAULT '{}'::text[],
  performance_score numeric,
  virality_score numeric,
  embedding vector(1536),  -- Requires: CREATE EXTENSION IF NOT EXISTS vector;
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_synced timestamp with time zone,
  CONSTRAINT intel_videos_pkey PRIMARY KEY (id),
  CONSTRAINT intel_videos_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  channel_id uuid,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT notifications_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.onboarding_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY['started'::text, 'step_completed'::text, 'step_skipped'::text, 'completed'::text, 'abandoned'::text])),
  step_name text,
  step_number integer,
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT onboarding_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT onboarding_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.onboarding_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_type text NOT NULL CHECK (reward_type = ANY (ARRAY['credits'::text, 'badge'::text, 'feature_unlock'::text])),
  reward_value jsonb NOT NULL,
  reason text NOT NULL,
  claimed boolean DEFAULT false,
  claimed_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT onboarding_rewards_pkey PRIMARY KEY (id),
  CONSTRAINT onboarding_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page text NOT NULL,
  session_id text NOT NULL,
  user_id uuid,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  metadata jsonb DEFAULT '{}'::jsonb,
  viewed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT page_views_pkey PRIMARY KEY (id),
  CONSTRAINT page_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.processed_webhook_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  processed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT processed_webhook_events_pkey PRIMARY KEY (id)
);
CREATE TABLE public.processing_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  job_type text NOT NULL DEFAULT 'full_analysis'::text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  priority integer NOT NULL DEFAULT 0,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  CONSTRAINT processing_jobs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.promotional_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percentage numeric NOT NULL,
  discount_type text DEFAULT 'percentage'::text CHECK (discount_type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text])),
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  usage_limit integer,
  times_used integer DEFAULT 0,
  first_purchase_only boolean DEFAULT false,
  min_credits integer,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotional_codes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.remix_channels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  channel_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  source_channel_ids uuid[] NOT NULL,
  remix_config jsonb DEFAULT '{"weights": {}, "elements": {"voice_style": true, "video_formats": true, "content_strategy": true, "audience_targeting": true, "publishing_schedule": true}}'::jsonb,
  combined_analytics jsonb DEFAULT '{}'::jsonb,
  combined_voice_profile jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT remix_channels_pkey PRIMARY KEY (id),
  CONSTRAINT remix_channels_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT remix_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.remix_source_channels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  remix_channel_id uuid NOT NULL,
  source_channel_id uuid NOT NULL,
  weight numeric DEFAULT 0.33 CHECK (weight >= 0::numeric AND weight <= 1::numeric),
  elements_used jsonb DEFAULT '{"voice_style": true, "content_strategy": true, "audience_targeting": true}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT remix_source_channels_pkey PRIMARY KEY (id),
  CONSTRAINT remix_source_channels_remix_channel_id_fkey FOREIGN KEY (remix_channel_id) REFERENCES public.remix_channels(id),
  CONSTRAINT remix_source_channels_source_channel_id_fkey FOREIGN KEY (source_channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.research_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid,
  user_id uuid,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  upload_date timestamp with time zone DEFAULT now(),
  is_selected boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT research_documents_pkey PRIMARY KEY (id),
  CONSTRAINT research_documents_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id),
  CONSTRAINT research_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.research_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step text,
  error_message text,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  research_params jsonb NOT NULL,
  research_results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  processing_time_seconds integer,
  priority integer DEFAULT 5,
  CONSTRAINT research_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT research_jobs_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id),
  CONSTRAINT research_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.research_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT research_messages_pkey PRIMARY KEY (id),
  CONSTRAINT research_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.research_sessions(id)
);
CREATE TABLE public.research_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT research_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT research_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.research_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  url text,
  title text,
  content text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT research_sources_pkey PRIMARY KEY (id),
  CONSTRAINT research_sources_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.research_sessions(id)
);
CREATE TABLE public.saved_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id text NOT NULL,
  video_title text NOT NULL,
  channel_name text NOT NULL,
  channel_id text,
  thumbnail_url text,
  duration text,
  views text,
  likes text,
  topic_category text,
  saved_at timestamp with time zone DEFAULT now(),
  notes text,
  watched boolean DEFAULT false,
  CONSTRAINT saved_videos_pkey PRIMARY KEY (id),
  CONSTRAINT saved_videos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.script_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL,
  user_id uuid NOT NULL,
  parent_comment_id uuid,
  content text NOT NULL,
  position_data jsonb DEFAULT '{}'::jsonb,
  is_resolved boolean DEFAULT false,
  resolved_by uuid,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT script_comments_pkey PRIMARY KEY (id),
  CONSTRAINT script_comments_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id),
  CONSTRAINT script_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT script_comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.script_comments(id),
  CONSTRAINT script_comments_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id)
);
CREATE TABLE public.script_edits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL,
  edited_by uuid NOT NULL,
  previous_content text,
  new_content text,
  previous_title text,
  new_title text,
  change_summary text,
  version_number integer NOT NULL DEFAULT 1,
  edited_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT script_edits_pkey PRIMARY KEY (id),
  CONSTRAINT script_edits_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id),
  CONSTRAINT script_edits_edited_by_fkey FOREIGN KEY (edited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.script_frames (
  id uuid NOT NULL,
  script_id uuid,
  problem text,
  solution text,
  transformation text,
  audience_goals jsonb,
  CONSTRAINT script_frames_pkey PRIMARY KEY (id),
  CONSTRAINT script_frames_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id)
);
CREATE TABLE public.script_generation_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])),
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_chunk integer DEFAULT 0,
  total_chunks integer DEFAULT 0,
  current_step text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  generation_params jsonb,
  generated_script text,
  script_metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  processing_time_seconds integer,
  priority integer NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  CONSTRAINT script_generation_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT script_generation_jobs_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id),
  CONSTRAINT script_generation_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.script_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  script_id uuid,
  workflow_id uuid,
  channel_id uuid,
  tier character varying NOT NULL,
  model_used character varying NOT NULL,
  script_length integer NOT NULL,
  credits_charged integer NOT NULL,
  features_used jsonb DEFAULT '[]'::jsonb,
  actual_cost numeric,
  prompt text,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  generation_time_ms integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT script_generations_pkey PRIMARY KEY (id),
  CONSTRAINT script_generations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT script_generations_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id),
  CONSTRAINT script_generations_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id),
  CONSTRAINT script_generations_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.script_outlines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workflow_id uuid,
  title text NOT NULL,
  total_minutes integer NOT NULL CHECK (total_minutes >= 35),
  chunk_count integer NOT NULL CHECK (chunk_count >= 2),
  outline_data jsonb NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'regenerating'::text])),
  user_feedback text,
  research_score numeric,
  recommended_model text,
  estimated_generation_time text,
  created_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  version integer DEFAULT 1,
  CONSTRAINT script_outlines_pkey PRIMARY KEY (id),
  CONSTRAINT script_outlines_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id)
);
CREATE TABLE public.script_research (
  id uuid NOT NULL,
  script_id uuid,
  sources jsonb,
  fact_checks jsonb,
  created_at timestamp without time zone,
  CONSTRAINT script_research_pkey PRIMARY KEY (id),
  CONSTRAINT script_research_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id)
);
CREATE TABLE public.script_thumbnails (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid,
  concepts jsonb,
  selected_concept jsonb,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT script_thumbnails_pkey PRIMARY KEY (id),
  CONSTRAINT script_thumbnails_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id)
);
CREATE TABLE public.script_titles (
  id uuid NOT NULL,
  script_id uuid,
  variations jsonb,
  selected_title text,
  performance_prediction jsonb,
  CONSTRAINT script_titles_pkey PRIMARY KEY (id),
  CONSTRAINT script_titles_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id)
);
CREATE TABLE public.script_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL,
  version_number integer NOT NULL,
  title text,
  content text,
  hook text,
  description text,
  tags text[],
  edited_by uuid NOT NULL,
  change_summary text,
  is_auto_save boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT script_versions_pkey PRIMARY KEY (id),
  CONSTRAINT script_versions_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.scripts(id),
  CONSTRAINT script_versions_edited_by_fkey FOREIGN KEY (edited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.script_workflows (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title text,
  current_step text DEFAULT 'summary'::text,
  completed_steps jsonb DEFAULT '[]'::jsonb,
  workflow_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT script_workflows_pkey PRIMARY KEY (id),
  CONSTRAINT script_workflows_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.scripts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid,
  title text NOT NULL,
  content text,
  hook text,
  description text,
  tags text[],
  credits_used integer DEFAULT 0,
  status text DEFAULT 'draft'::text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  team_id uuid,
  is_team_script boolean DEFAULT false,
  last_edited_by uuid,
  last_edited_at timestamp with time zone DEFAULT now(),
  edit_count integer DEFAULT 0,
  is_editable boolean DEFAULT true,
  user_id uuid,
  version_number integer DEFAULT 1,
  visibility text DEFAULT 'private'::text CHECK (visibility = ANY (ARRAY['private'::text, 'team'::text, 'public'::text])),
  team_channel_id uuid,
  generation_tier character varying,
  generation_features jsonb DEFAULT '[]'::jsonb,
  actual_api_cost numeric,
  script_length integer,
  CONSTRAINT scripts_pkey PRIMARY KEY (id),
  CONSTRAINT scripts_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT scripts_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT scripts_last_edited_by_fkey FOREIGN KEY (last_edited_by) REFERENCES auth.users(id),
  CONSTRAINT scripts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT scripts_team_channel_id_fkey FOREIGN KEY (team_channel_id) REFERENCES public.team_channels(id)
);
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  credits integer NOT NULL,
  price numeric NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  stripe_price_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.team_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_activity_pkey PRIMARY KEY (id),
  CONSTRAINT team_activity_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.team_channels (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  youtube_channel_id text,
  is_default boolean DEFAULT false,
  settings jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_channels_pkey PRIMARY KEY (id),
  CONSTRAINT team_channels_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.team_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'editor'::text, 'viewer'::text])),
  invited_by uuid NOT NULL,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'pending'::text,
  declined_at timestamp with time zone,
  CONSTRAINT team_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT team_invitations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_invitations_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'editor'::text, 'viewer'::text])),
  created_at timestamp with time zone DEFAULT now(),
  invited_by uuid,
  invited_at timestamp with time zone DEFAULT now(),
  joined_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text,
  permissions jsonb DEFAULT '{}'::jsonb,
  last_active timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT team_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES auth.users(id)
);
CREATE TABLE public.team_settings (
  team_id uuid NOT NULL,
  auto_save_enabled boolean DEFAULT true,
  version_retention_days integer DEFAULT 30,
  notification_preferences jsonb DEFAULT '{}'::jsonb,
  collaboration_settings jsonb DEFAULT '{}'::jsonb,
  export_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_settings_pkey PRIMARY KEY (team_id),
  CONSTRAINT team_settings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text,
  subscription_tier text DEFAULT 'free'::text,
  max_members integer DEFAULT 5,
  is_active boolean DEFAULT true,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id)
);
CREATE TABLE public.trending_channels_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id text NOT NULL,
  channel_name text NOT NULL,
  category text,
  avg_views bigint,
  subscriber_estimate bigint,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT trending_channels_history_pkey PRIMARY KEY (id)
);
CREATE TABLE public.trending_topics_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_name text NOT NULL,
  category text,
  score integer,
  engagement_rate numeric,
  avg_views bigint,
  channel_count integer,
  recorded_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  hashtags text,
  CONSTRAINT trending_topics_history_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_onboarding_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  step_name text NOT NULL,
  step_number integer NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  data jsonb DEFAULT '{}'::jsonb,
  time_spent integer,
  skipped boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_onboarding_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_onboarding_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel_id uuid,
  preferences jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_preferences_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  avatar_url text,
  subscription_tier text DEFAULT 'free'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  bypass_credits boolean DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'inactive'::text,
  subscription_plan text DEFAULT 'free'::text,
  subscription_period_end timestamp with time zone,
  credits integer DEFAULT 50,
  total_credit_purchases integer DEFAULT 0,
  first_purchase_date timestamp with time zone,
  last_purchase_date timestamp with time zone,
  lifetime_credits_purchased integer DEFAULT 0,
  preferences jsonb DEFAULT '{}'::jsonb,
  last_credit_reset timestamp with time zone DEFAULT now(),
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'moderator'::text])),
  onboarding_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  onboarding_started_at timestamp with time zone,
  onboarding_completed_at timestamp with time zone,
  user_type text CHECK (user_type = ANY (ARRAY['creator'::text, 'agency'::text, 'business'::text, 'hobbyist'::text])),
  experience_level text CHECK (experience_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'expert'::text])),
  content_goals jsonb DEFAULT '[]'::jsonb,
  target_audience jsonb DEFAULT '{}'::jsonb,
  upload_frequency text CHECK (upload_frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'biweekly'::text, 'monthly'::text, 'irregular'::text])),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.video_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  video_id text NOT NULL,
  video_title text NOT NULL,
  channel_name text NOT NULL,
  topic_category text,
  action_type text NOT NULL CHECK (action_type = ANY (ARRAY['watch'::text, 'save'::text, 'unsave'::text, 'share'::text])),
  clicked_at timestamp with time zone DEFAULT now(),
  referrer_page text,
  session_id text,
  CONSTRAINT video_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT video_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.video_transcripts_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id text NOT NULL UNIQUE,
  transcript_data jsonb NOT NULL,
  full_text text,
  has_transcript boolean DEFAULT true,
  language text DEFAULT 'en'::text,
  cached_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  access_count integer DEFAULT 0,
  last_accessed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT video_transcripts_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.voice_analysis_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id text NOT NULL UNIQUE,
  analysis_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  version text NOT NULL DEFAULT '1.0.0'::text,
  cached_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
  access_count integer DEFAULT 0,
  last_accessed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT voice_analysis_cache_pkey PRIMARY KEY (id)
);
CREATE TABLE public.voice_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  channel_id uuid NOT NULL UNIQUE,
  profile_name text NOT NULL,
  training_data jsonb DEFAULT '{}'::jsonb,
  parameters jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT voice_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT voice_profiles_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.voice_training_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'queued'::text CHECK (status = ANY (ARRAY['queued'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])),
  priority integer DEFAULT 5,
  attempt_count integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  error_message text,
  credits_used integer DEFAULT 0,
  training_data jsonb DEFAULT '{}'::jsonb,
  result_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT voice_training_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT voice_training_jobs_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id),
  CONSTRAINT voice_training_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.webhook_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  channel_id uuid,
  event text NOT NULL,
  url text NOT NULL,
  success boolean NOT NULL DEFAULT false,
  status_code integer,
  error text,
  attempts integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT webhook_logs_pkey PRIMARY KEY (id),
  CONSTRAINT webhook_logs_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id)
);
CREATE TABLE public.workflow_research (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid,
  source_type text,
  source_url text,
  source_title text,
  source_content text,
  fact_check_status text,
  is_starred boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  is_selected boolean DEFAULT true,
  added_at timestamp with time zone DEFAULT now(),
  relevance numeric DEFAULT 0.5 CHECK (relevance >= 0::numeric AND relevance <= 1::numeric),
  content_length integer,
  word_count integer,
  quality_score numeric DEFAULT 0.5,
  source_metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT workflow_research_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_research_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id)
);
CREATE TABLE public.workflow_sponsors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL,
  user_id uuid NOT NULL,
  sponsor_name text NOT NULL,
  sponsor_product text NOT NULL,
  sponsor_cta text NOT NULL,
  sponsor_key_points text[] DEFAULT '{}'::text[],
  sponsor_duration integer DEFAULT 30,
  placement_preference text DEFAULT 'auto'::text CHECK (placement_preference = ANY (ARRAY['auto'::text, 'early'::text, 'mid'::text, 'late'::text, 'custom'::text])),
  custom_placement_time integer,
  transition_style text DEFAULT 'natural'::text CHECK (transition_style = ANY (ARRAY['natural'::text, 'direct'::text, 'segue'::text])),
  tone_match boolean DEFAULT true,
  include_disclosure boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workflow_sponsors_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_sponsors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.workflow_titles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid,
  variations jsonb,
  selected_title text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT workflow_titles_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_titles_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id)
);
CREATE TABLE public.workflow_video_transcripts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workflow_id uuid NOT NULL,
  video_id text NOT NULL,
  video_url text NOT NULL,
  video_title text NOT NULL,
  channel_name text,
  channel_id text,
  video_duration integer,
  transcript_language text DEFAULT 'en'::text,
  transcript_type text NOT NULL CHECK (transcript_type = ANY (ARRAY['auto'::text, 'manual'::text, 'translated'::text])),
  word_count integer,
  extraction_date timestamp with time zone DEFAULT now(),
  transcript_data jsonb NOT NULL,
  analysis_data jsonb DEFAULT '{}'::jsonb,
  is_starred boolean DEFAULT false,
  is_selected boolean DEFAULT true,
  relevance_score numeric DEFAULT 0.50 CHECK (relevance_score >= 0::numeric AND relevance_score <= 1::numeric),
  user_notes text,
  user_tags text[],
  research_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workflow_video_transcripts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_workflow FOREIGN KEY (workflow_id) REFERENCES public.script_workflows(id),
  CONSTRAINT fk_research FOREIGN KEY (research_id) REFERENCES public.workflow_research(id)
);

-- =============================================
-- PERFORMANCE INDEXES
-- Added to fix slow query performance
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_subscription ON public.users(subscription_tier, subscription_status);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Channels table indexes (high-traffic table)
CREATE INDEX idx_channels_user_id ON public.channels(user_id);
CREATE INDEX idx_channels_youtube_id ON public.channels(youtube_channel_id);
CREATE INDEX idx_channels_voice_training_status ON public.channels(voice_training_status) WHERE voice_training_status != 'completed';

-- Scripts table indexes
CREATE INDEX idx_scripts_user_id ON public.scripts(user_id);
CREATE INDEX idx_scripts_channel_id ON public.scripts(channel_id) WHERE channel_id IS NOT NULL;
CREATE INDEX idx_scripts_created_at ON public.scripts(created_at DESC);
CREATE INDEX idx_scripts_user_created ON public.scripts(user_id, created_at DESC);

-- Voice training jobs indexes (frequently queried by status)
CREATE INDEX idx_voice_training_jobs_status ON public.voice_training_jobs(status);
CREATE INDEX idx_voice_training_jobs_user_id ON public.voice_training_jobs(user_id);
CREATE INDEX idx_voice_training_jobs_channel_id ON public.voice_training_jobs(channel_id);
CREATE INDEX idx_voice_training_jobs_pending ON public.voice_training_jobs(status, priority DESC) WHERE status = 'queued';

-- Credits transactions indexes
CREATE INDEX idx_credits_transactions_user_id ON public.credits_transactions(user_id);
CREATE INDEX idx_credits_transactions_created_at ON public.credits_transactions(created_at DESC);
CREATE INDEX idx_credits_transactions_user_created ON public.credits_transactions(user_id, created_at DESC);
CREATE INDEX idx_credits_transactions_type ON public.credits_transactions(type);

-- Channel analyses indexes
CREATE INDEX idx_channel_analyses_channel_id ON public.channel_analyses(channel_id);
CREATE INDEX idx_channel_analyses_user_id ON public.channel_analyses(user_id);
CREATE INDEX idx_channel_analyses_date ON public.channel_analyses(analysis_date DESC);

-- Script workflows indexes
CREATE INDEX idx_script_workflows_user_id ON public.script_workflows(user_id);
CREATE INDEX idx_script_workflows_updated ON public.script_workflows(updated_at DESC);

-- Script generation jobs indexes
CREATE INDEX idx_script_generation_jobs_status ON public.script_generation_jobs(status);
CREATE INDEX idx_script_generation_jobs_user_id ON public.script_generation_jobs(user_id);
CREATE INDEX idx_script_generation_jobs_workflow ON public.script_generation_jobs(workflow_id);
CREATE INDEX idx_script_generation_jobs_pending ON public.script_generation_jobs(status, priority DESC) WHERE status = 'pending';

-- Research jobs indexes
CREATE INDEX idx_research_jobs_workflow_id ON public.research_jobs(workflow_id);
CREATE INDEX idx_research_jobs_user_id ON public.research_jobs(user_id);
CREATE INDEX idx_research_jobs_status ON public.research_jobs(status);

-- Team members indexes
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;

-- Trending history indexes
CREATE INDEX idx_trending_topics_recorded_at ON public.trending_topics_history(recorded_at DESC);
CREATE INDEX idx_trending_channels_recorded_at ON public.trending_channels_history(recorded_at DESC);

-- Voice profiles index
CREATE INDEX idx_voice_profiles_channel_id ON public.voice_profiles(channel_id);

-- Intel tables indexes
CREATE INDEX idx_intel_videos_channel_id ON public.intel_videos(channel_id);
CREATE INDEX idx_intel_videos_youtube_channel ON public.intel_videos(youtube_channel_id);
CREATE INDEX idx_intel_channel_analytics_channel ON public.intel_channel_analytics(channel_id);
CREATE INDEX idx_intel_channel_analytics_date ON public.intel_channel_analytics(date DESC);