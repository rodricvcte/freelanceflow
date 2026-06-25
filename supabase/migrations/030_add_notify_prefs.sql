alter table profiles
  add column if not exists notify_email_viewed    boolean not null default true,
  add column if not exists notify_email_responded boolean not null default true,
  add column if not exists notify_email_followup  boolean not null default true;
