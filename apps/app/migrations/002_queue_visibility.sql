create index if not exists idx_publish_jobs_created_at on publish_jobs(created_at desc, id desc);
create index if not exists idx_worker_heartbeats_last_seen on worker_heartbeats(last_seen_at desc);
