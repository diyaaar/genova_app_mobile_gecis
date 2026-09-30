-- 090: one snapshot for the actor/session/selected-choir and family-specific read decision.
-- This does not activate a reader or alter existing data; Edge v2 readers consume it later.
begin;

do $preflight$
begin
  if to_regnamespace('genova_090') is not null then
    raise exception '090 refused: authority schema already exists';
  end if;
  if to_regclass('auth.sessions') is null
    or to_regclass('genova_005.active_choir_sessions') is null
    or to_regclass('public.assignment_submission_file_versions') is null
    or to_regclass('public.assignment_review_audio_versions') is null
    or to_regclass('public.repertoire_comment_audio_versions') is null
    or to_regprocedure('public.can_read_chat_media_060(uuid,uuid,uuid)') is null then
    raise exception '090 requires Auth, 005 and private file 057-060';
  end if;
end
$preflight$;

create schema genova_090;
revoke all on schema genova_090 from public, anon, authenticated, service_role;
grant usage on schema genova_090 to service_role;

-- The caller of the public invoker wrapper is service_role only. The private helper
-- needs owner privileges for auth.sessions and tenant rows; it never takes caller JWT
-- metadata as authority. Actor/session IDs arrive only from a signed v2 Edge ticket.
create function genova_090.can_read_private_file(
  p_actor_id uuid, p_session_id uuid, p_choir_id uuid, p_family text, p_file_id uuid
) returns boolean language sql stable security definer set search_path = '' as $fn$
  with actor as materialized (
    select m.id, m.voice_group
    from auth.sessions s
    join public.choir_members m on m.auth_user_id=s.user_id
    where s.id=p_session_id and s.user_id=p_actor_id
      and m.choir_id=p_choir_id and m.is_active is true
  ), selection as materialized (
    select chosen.choir_id
    from genova_005.active_choir_sessions chosen
    where chosen.session_id=p_session_id and chosen.auth_user_id=p_actor_id
  ), context as materialized (
    select actor.id as member_id, actor.voice_group,
      exists(select 1 from public.choir_member_roles cmr
        join public.roles r on r.id=cmr.role_id
        where cmr.member_id=actor.id and cmr.choir_id=p_choir_id
          and r.choir_id=p_choir_id and r.name in ('Şef','Åef','Sef')) as is_chef,
      exists(select 1 from public.choir_member_roles cmr
        join public.roles r on r.id=cmr.role_id
        where cmr.member_id=actor.id and cmr.choir_id=p_choir_id
          and r.choir_id=p_choir_id
          and r.name in ('Partisyon Şefi','Partisyon Åefi','Partisyon Sefi')) as is_section_leader
    from actor
    where (
      (select count(*) from selection)=1
      and (select choir_id from selection)=p_choir_id
    ) or (
      (select count(*) from selection)=0
      and (select count(*) from public.choir_members m
        where m.auth_user_id=p_actor_id and m.is_active is true)=1
    )
  )
  select exists (
    select 1 from context c where case p_family
      when 'repertoire-file' then exists (
        select 1 from public.repertoire_files f
        where f.id=p_file_id and f.choir_id=p_choir_id
          and (c.is_chef or c.is_section_leader or exists (
            select 1 from public.song_assignments sa
            join public.repertoire song on song.id=sa.song_id
            where sa.song_id=f.song_id and sa.member_id=c.member_id
              and song.choir_id=p_choir_id and song.is_visible is true
          ))
      )
      when 'assignment-file' then exists (
        select 1 from public.assignment_submission_file_versions v
        left join public.choir_members target on target.id=v.member_id
          and target.choir_id=v.choir_id
        where v.id=p_file_id and v.choir_id=p_choir_id
          and (v.member_id=c.member_id or c.is_chef or
            (c.is_section_leader and c.voice_group is not null
              and target.is_active is true and target.voice_group=c.voice_group))
      )
      when 'assignment-review-file' then exists (
        select 1 from public.assignment_review_audio_versions v
        join public.choir_members target on target.id=v.member_id
          and target.choir_id=p_choir_id
        where v.id=p_file_id and v.choir_id=p_choir_id and (
          c.is_chef or (c.is_section_leader and c.voice_group is not null
            and target.voice_group=c.voice_group)
          or (target.id=c.member_id and (
            exists(select 1 from public.assignment_submissions s
              where s.id=v.submission_id and s.choir_id=p_choir_id
                and not s.is_reviewer_note_hidden
                and s.reviewer_audio_file_version_id=v.id)
            or exists(select 1 from public.assignment_submission_history h
              where h.member_id=target.id and h.choir_id=p_choir_id
                and h.reviewer_audio_file_version_id=v.id)
          ))
        )
      )
      when 'repertoire-comment-file' then exists (
        select 1 from public.repertoire_comment_audio_versions v
        join public.repertoire_song_comments cmt on cmt.id=v.comment_id
          and cmt.choir_id=p_choir_id and cmt.audio_file_version_id=v.id
        where v.id=p_file_id and v.choir_id=p_choir_id and (
          c.is_chef or (not cmt.is_hidden and
            (cmt.target_voice_group is null or cmt.target_voice_group=c.voice_group))
        )
      )
      when 'chat-media-file' then
        public.can_read_chat_media_060(p_actor_id,p_choir_id,p_file_id)
      else false
    end
  );
$fn$;

revoke all on function genova_090.can_read_private_file(uuid,uuid,uuid,text,uuid)
  from public,anon,authenticated,service_role;
grant execute on function genova_090.can_read_private_file(uuid,uuid,uuid,text,uuid)
  to service_role;

-- Exposed for PostgREST name resolution, but invoker-only and service-role-only.
create function public.private_file_ticket_authorized_090(
  p_actor_id uuid, p_session_id uuid, p_choir_id uuid, p_family text, p_file_id uuid
) returns boolean language sql stable security invoker set search_path = '' as $fn$
  select genova_090.can_read_private_file(
    p_actor_id,p_session_id,p_choir_id,p_family,p_file_id
  );
$fn$;
revoke all on function public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)
  from public,anon,authenticated,service_role;
grant execute on function public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)
  to service_role;

commit;
