-- 090 legacy compatibility: service-only, snapshot-bound resolution of current aliases.
-- No rows are changed. No R2 version is invented for a legitimate legacy file.
begin;

create function genova_090.resolve_legacy_file(
  p_actor_id uuid, p_session_id uuid, p_choir_id uuid, p_alias text,
  p_kind text default null, p_resource_id uuid default null
) returns jsonb language sql stable security definer set search_path = '' as $fn$
  with actor as materialized (
    select m.id, m.voice_group from auth.sessions s
    join public.choir_members m on m.auth_user_id=s.user_id
    where s.id=p_session_id and s.user_id=p_actor_id
      and (s.not_after is null or s.not_after > now())
      and m.choir_id=p_choir_id and m.is_active is true
  ), selection as materialized (
    select chosen.choir_id from genova_005.active_choir_sessions chosen
    where chosen.session_id=p_session_id and chosen.auth_user_id=p_actor_id
  ), context as materialized (
    select a.id as member_id, a.voice_group,
      exists(select 1 from public.choir_member_roles mr join public.roles r on r.id=mr.role_id
        where mr.member_id=a.id and mr.choir_id=p_choir_id and r.choir_id=p_choir_id
          and r.name in ('Şef','Åef','Sef')) as chef,
      exists(select 1 from public.choir_member_roles mr join public.roles r on r.id=mr.role_id
        where mr.member_id=a.id and mr.choir_id=p_choir_id and r.choir_id=p_choir_id
          and r.name in ('Partisyon Şefi','Partisyon Åefi','Partisyon Sefi')) as leader
    from actor a where (select count(*) from actor)=1 and (
      ((select count(*) from selection)=1 and (select choir_id from selection)=p_choir_id)
      or ((select count(*) from selection)=0 and
        (select count(*) from public.choir_members m
          where m.auth_user_id=p_actor_id and m.is_active is true)=1)
    )
  ), candidates as materialized (
    select 'repertoire'::text as kind, f.id as resource_id, f.file_name, f.mime_type,
      f.drive_download_link as source_link,
      (c.chef or c.leader or (song.is_visible is true and exists(
        select 1 from public.song_assignments sa where sa.song_id=song.id
          and sa.member_id=c.member_id and sa.choir_id=p_choir_id))) as allowed
    from context c cross join public.repertoire_files f
    join public.repertoire song on song.id=f.song_id and song.choir_id=p_choir_id
    where f.choir_id=p_choir_id and f.drive_file_id=p_alias
    union all
    select 'comment', cm.id, cm.audio_file_name, cm.audio_mime_type, null::text,
      c.chef or (not cm.is_hidden and
        (cm.target_voice_group is null or cm.target_voice_group=c.voice_group))
    from context c cross join public.repertoire_song_comments cm
    join public.repertoire song on song.id=cm.song_id and song.choir_id=p_choir_id
    where cm.choir_id=p_choir_id and cm.audio_drive_file_id=p_alias
      and cm.audio_file_version_id is null
    union all
    select 'submission', s.id, s.file_name, s.mime_type, s.drive_download_link,
      (c.chef or s.member_id=c.member_id or (c.leader and c.voice_group is not null
        and target.is_active is true and target.voice_group=c.voice_group))
      and (s.drive_download_link is null or s.drive_download_link not like 'storage://%'
        or s.drive_download_link like 'storage://assignment-submissions/'||s.assignment_id::text||'/'||s.member_id::text||'/%')
    from context c cross join public.assignment_submissions s
    join public.assignments a on a.id=s.assignment_id and a.choir_id=p_choir_id
    join public.choir_members target on target.id=s.member_id and target.choir_id=p_choir_id
    where s.choir_id=p_choir_id and s.drive_file_id=p_alias and s.current_file_version_id is null
    union all
    select 'review', s.id, s.reviewer_audio_file_name, s.reviewer_audio_mime_type, null::text,
      c.chef or (c.leader and c.voice_group is not null and target.is_active is true
        and target.voice_group=c.voice_group) or
        (s.member_id=c.member_id and not s.is_reviewer_note_hidden)
    from context c cross join public.assignment_submissions s
    join public.assignments a on a.id=s.assignment_id and a.choir_id=p_choir_id
    join public.choir_members target on target.id=s.member_id and target.choir_id=p_choir_id
    where s.choir_id=p_choir_id and s.reviewer_audio_drive_file_id=p_alias
      and s.reviewer_audio_file_version_id is null
    union all
    select 'private-review', n.submission_id, n.reviewer_audio_file_name,
      n.reviewer_audio_mime_type, null::text,
      c.chef or (c.leader and c.voice_group is not null and target.is_active is true
        and target.voice_group=c.voice_group)
    from context c cross join public.assignment_submission_private_notes n
    join public.assignment_submissions s on s.id=n.submission_id and s.choir_id=p_choir_id
      and s.member_id=n.member_id and s.assignment_id=n.assignment_id
    join public.assignments a on a.id=n.assignment_id and a.choir_id=p_choir_id
    join public.choir_members target on target.id=n.member_id and target.choir_id=p_choir_id
    where n.choir_id=p_choir_id and n.reviewer_audio_drive_file_id=p_alias
      and n.reviewer_audio_file_version_id is null
      -- A public review commonly has an identical private mirror, not a second resource.
      and s.reviewer_audio_drive_file_id is distinct from p_alias
  )
  select case when (select count(*) from candidates)=1 then (
    select jsonb_build_object('kind',kind,'resourceId',resource_id,'choirId',p_choir_id,
      'alias',p_alias,'fileName',file_name,'mimeType',mime_type,'sourceLink',source_link)
    from candidates where allowed is true and file_name is not null
      and length(btrim(file_name)) > 0
      and p_alias ~ '^[A-Za-z0-9_-]+$' and length(p_alias)<=256
      and p_alias not like 'r2\_%' escape '\'
      and ((p_kind is null and p_resource_id is null)
        or (p_kind=kind and p_resource_id=resource_id))
  ) else null end;
$fn$;

revoke all on function genova_090.resolve_legacy_file(uuid,uuid,uuid,text,text,uuid)
  from public,anon,authenticated,service_role;
grant execute on function genova_090.resolve_legacy_file(uuid,uuid,uuid,text,text,uuid) to service_role;

-- Service RPC only. Verified identities come from Auth or a signed legacy-family ticket;
-- never from public caller metadata. The private definer reads sessions and tenant rows.
create function public.resolve_legacy_file_090(
  p_actor_id uuid, p_session_id uuid, p_choir_id uuid, p_alias text,
  p_kind text default null, p_resource_id uuid default null
) returns jsonb language sql stable security invoker set search_path = '' as $fn$
  select genova_090.resolve_legacy_file(
    p_actor_id,p_session_id,p_choir_id,p_alias,p_kind,p_resource_id);
$fn$;
revoke all on function public.resolve_legacy_file_090(uuid,uuid,uuid,text,text,uuid)
  from public,anon,authenticated,service_role;
grant execute on function public.resolve_legacy_file_090(uuid,uuid,uuid,text,text,uuid) to service_role;
commit;
