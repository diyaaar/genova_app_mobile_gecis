-- 090 forward repair: retained Auth rows may outlive their session lifetime.
-- Apply only after the exact30Sep090actor migration. No client/provider activation.
begin;
set local lock_timeout='2s';
set local statement_timeout='5s';

do $preflight$
declare
  private_rpc regprocedure := to_regprocedure('genova_090.can_read_private_file(uuid,uuid,uuid,text,uuid)');
  public_rpc regprocedure := to_regprocedure('public.private_file_ticket_authorized_090(uuid,uuid,uuid,text,uuid)');
begin
  if private_rpc is null or public_rpc is null then
    raise exception '090 expiry requires the prior actor authority';
  end if;
  if not exists(select 1 from pg_attribute where attrelid=to_regclass('auth.sessions')
      and attname='not_after' and atttypid='timestamptz'::regtype and not attisdropped) then
    raise exception '090 expiry requires Auth not_after timestamp';
  end if;
  if not exists(select 1 from pg_proc where oid=private_rpc
      and md5(prosrc)='8bcd05928d70787965dfebe0b38b543d'
      and pg_get_userbyid(proowner)='postgres' and prosecdef and provolatile='s'
      and proconfig=array['search_path=""']::text[]) then
    raise exception '090 expiry refused unexpected baseline definition/owner/config';
  end if;
  if not exists(select 1 from pg_proc where oid=public_rpc
      and md5(prosrc)='8bf50a8fe2641e1ae9355b1461ffe66e'
      and pg_get_userbyid(proowner)='postgres' and not prosecdef and provolatile='s'
      and proconfig=array['search_path=""']::text[])
    or has_function_privilege('anon',private_rpc,'EXECUTE')
    or has_function_privilege('authenticated',private_rpc,'EXECUTE')
    or has_function_privilege('anon',public_rpc,'EXECUTE')
    or has_function_privilege('authenticated',public_rpc,'EXECUTE')
    or not has_function_privilege('service_role',private_rpc,'EXECUTE')
    or not has_function_privilege('service_role',public_rpc,'EXECUTE') then
    raise exception '090 expiry refused unexpected authority privileges';
  end if;
  if exists(select 1 from pg_proc p cross join lateral
      aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      where p.oid in(private_rpc,public_rpc) and (
        a.grantee not in(p.proowner,'service_role'::regrole)
        or a.grantor<>p.proowner or a.is_grantable or a.privilege_type<>'EXECUTE')) then
    raise exception '090 expiry refused extra authority grants';
  end if;
end
$preflight$;

-- One statement snapshot and request-start time; a long transaction must not
-- keep accepting a session that has expired since transaction start.
-- CREATE OR REPLACE preserves signature, owner and existing exact ACL.
create or replace function genova_090.can_read_private_file(
  p_actor_id uuid, p_session_id uuid, p_choir_id uuid, p_family text, p_file_id uuid
) returns boolean language sql stable security definer set search_path = '' as $fn$
  with actor as materialized (
    select m.id, m.voice_group
    from auth.sessions s
    join public.choir_members m on m.auth_user_id=s.user_id
    where s.id=p_session_id and s.user_id=p_actor_id
      and (s.not_after is null or s.not_after > statement_timestamp())
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

commit;
