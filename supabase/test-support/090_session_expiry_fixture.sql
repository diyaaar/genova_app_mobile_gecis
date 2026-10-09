-- Synthetic relational fixture ONLY. Not a recovered Supabase schema/RLS/Auth server.
-- Actual003tenant-link/060read+guard/090authority bodies are installed by the runner.
create schema auth;
create schema genova_003;
create schema genova_005;
create schema genova_060;
create function auth.uid() returns uuid language sql stable as 'select null::uuid';
create table auth.users(id uuid primary key);
create table auth.sessions(id uuid primary key,user_id uuid references auth.users,not_after timestamptz);
create table public.choirs(id uuid primary key,slug text,name text);
create table public.choir_members(id uuid primary key,choir_id uuid references public.choirs,
  auth_user_id uuid references auth.users,first_name text,last_name text,voice_group text,
  join_date date,is_active boolean not null default true);
create table public.roles(id uuid primary key,choir_id uuid references public.choirs,name text);
create table public.choir_member_roles(choir_id uuid references public.choirs,
  member_id uuid references public.choir_members,role_id uuid references public.roles,
  primary key(member_id,role_id));
create table genova_005.active_choir_sessions(session_id uuid primary key,auth_user_id uuid,choir_id uuid);
create table public.repertoire(id uuid primary key,choir_id uuid,title text,is_visible boolean default true);
create table public.repertoire_files(id uuid primary key,choir_id uuid,song_id uuid,file_name text,
  file_type text,drive_file_id text,mime_type text,drive_download_link text);
create table public.song_assignments(choir_id uuid,song_id uuid,member_id uuid,assigned_by uuid,part_name text);
create table public.assignments(id uuid primary key,choir_id uuid,title text,description text,
  created_by uuid,is_active boolean,is_locked boolean);
create table public.assignment_submissions(id uuid primary key,choir_id uuid,assignment_id uuid,member_id uuid,
  drive_file_id text,file_name text,mime_type text,drive_download_link text,current_file_version_id uuid,
  reviewer_audio_drive_file_id text,reviewer_audio_file_name text,reviewer_audio_mime_type text,
  reviewer_audio_file_version_id uuid,is_reviewer_note_hidden boolean not null default false);
create table public.assignment_submission_private_notes(submission_id uuid,choir_id uuid,assignment_id uuid,
  member_id uuid,reviewer_audio_drive_file_id text,reviewer_audio_file_name text,reviewer_audio_mime_type text,
  reviewer_audio_file_version_id uuid);
create table public.assignment_submission_history(member_id uuid,choir_id uuid,reviewer_audio_file_version_id uuid);
create table public.assignment_submission_file_versions(id uuid primary key,choir_id uuid,submission_id uuid,
  assignment_id uuid,member_id uuid,version_number integer,provider text,bucket text,object_key text,
  content_length bigint,mime_type text,sha256_hex text,file_name text,created_at timestamptz default now());
create table public.assignment_review_audio_versions(id uuid primary key,choir_id uuid,submission_id uuid,
  assignment_id uuid,member_id uuid,created_by uuid,version_number integer,provider text,bucket text,object_key text,
  content_length bigint,mime_type text,sha256_hex text,file_name text,created_at timestamptz default now());
create table public.repertoire_comment_audio_versions(id uuid primary key,choir_id uuid,comment_id uuid,
  song_id uuid,created_by uuid,provider text,bucket text,object_key text,content_length bigint,mime_type text,
  sha256_hex text,file_name text,created_at timestamptz default now());
create table public.repertoire_song_comments(id uuid primary key,choir_id uuid,song_id uuid,content_html text,
  created_by uuid,target_voice_group text,audio_drive_file_id text,audio_file_name text,audio_mime_type text,
  audio_file_version_id uuid,is_hidden boolean not null default false);
create table public.chat_rooms(id uuid primary key,choir_id uuid,name text,slug text,type text,created_by uuid,
  is_archived boolean default false,avatar_url text,avatar_media_version_id uuid);
create table public.chat_room_members(choir_id uuid,room_id uuid,member_id uuid,role text,
  primary key(room_id,member_id));
create table public.chat_messages(id uuid primary key,choir_id uuid,room_id uuid,
  is_deleted boolean default false,metadata_json jsonb);
create table public.chat_media_versions(id uuid primary key,choir_id uuid,room_id uuid,kind text,batch_id uuid,
  position integer,created_by uuid,provider text,bucket text,object_key text,content_length bigint,
  mime_type text,sha256_hex text,file_name text,state text,message_id uuid,created_at timestamptz default now());
create table public.repertoire_file_storage_locations(repertoire_file_id uuid primary key,choir_id uuid,
  provider text,bucket text,object_key text,content_length bigint,mime_type text,sha256_hex text,
  verified_at timestamptz,is_active boolean);
-- Specific metadata reads for real reader adapters, never blanket fixture grants.
grant usage on schema public to service_role;
grant select on public.repertoire_files,public.repertoire_file_storage_locations,
  public.assignment_submission_file_versions,public.assignment_review_audio_versions,
  public.repertoire_comment_audio_versions,public.chat_media_versions to service_role;
