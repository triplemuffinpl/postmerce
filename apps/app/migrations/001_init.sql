create table if not exists settings (
  id bigserial primary key,
  key text not null unique,
  value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists social_accounts (
  id bigserial primary key,
  platform text not null,
  platform_user_id text,
  display_name text,
  username text,
  avatar_url text,
  account_type text,
  status text not null default 'disconnected',
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, platform_user_id)
);

create table if not exists oauth_tokens (
  id bigserial primary key,
  social_account_id bigint not null references social_accounts(id) on delete cascade,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  expires_at timestamptz,
  scopes text[] not null default '{}',
  token_type text,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_assets (
  id bigserial primary key,
  original_filename text not null,
  storage_disk text not null default 'local',
  storage_key text not null,
  storage_path text not null,
  thumbnail_path text,
  mime_type text not null,
  size_bytes bigint not null,
  duration_sec numeric(10, 3),
  width integer,
  height integer,
  fps numeric(10, 3),
  video_codec text,
  audio_codec text,
  checksum text not null,
  status text not null default 'uploaded',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_variants (
  id bigserial primary key,
  media_asset_id bigint not null references media_assets(id) on delete cascade,
  platform text,
  variant_type text not null,
  storage_disk text not null default 'local',
  storage_key text not null,
  storage_path text not null,
  width integer,
  height integer,
  duration_sec numeric(10, 3),
  size_bytes bigint not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id bigserial primary key,
  media_asset_id bigint references media_assets(id) on delete set null,
  title text not null,
  base_caption text not null default '',
  base_hashtags text,
  status text not null default 'draft',
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists post_targets (
  id bigserial primary key,
  post_id bigint not null references posts(id) on delete cascade,
  social_account_id bigint references social_accounts(id) on delete set null,
  platform text not null,
  platform_title text,
  platform_caption text not null default '',
  platform_hashtags text,
  platform_options_json jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  external_post_id text,
  external_url text,
  error_code text,
  error_message text,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists publish_jobs (
  id bigserial primary key,
  post_target_id bigint references post_targets(id) on delete cascade,
  job_type text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  max_attempts integer not null default 5,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_until timestamptz,
  locked_by text,
  finished_at timestamptz,
  failed_at timestamptz,
  error_class text,
  last_error text,
  idempotency_key text not null unique,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists platform_events (
  id bigserial primary key,
  post_target_id bigint references post_targets(id) on delete set null,
  platform text not null,
  event_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists analytics_snapshots (
  id bigserial primary key,
  post_target_id bigint not null references post_targets(id) on delete cascade,
  platform text not null,
  views bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  saves bigint,
  collected_at timestamptz not null default now()
);

create table if not exists app_logs (
  id bigserial primary key,
  level text not null,
  context text not null,
  message text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists worker_heartbeats (
  worker_id text primary key,
  last_seen_at timestamptz not null default now(),
  metadata_json jsonb not null default '{}'::jsonb
);

create index if not exists idx_post_targets_post_id on post_targets(post_id);
create index if not exists idx_publish_jobs_ready on publish_jobs(status, run_after, id);
create index if not exists idx_publish_jobs_locked_until on publish_jobs(status, locked_until);
create index if not exists idx_platform_events_target on platform_events(post_target_id, created_at desc);
create index if not exists idx_app_logs_created_at on app_logs(created_at desc);
