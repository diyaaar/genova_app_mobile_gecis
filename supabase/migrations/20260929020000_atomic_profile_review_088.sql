-- 088: caller-authorized decision + member changes in one transaction.
begin;
do $preflight$
begin
  if to_regprocedure('genova_087.normalize_changes(jsonb)') is null
    or to_regnamespace('genova_078') is null
    or to_regprocedure('public.review_profile_change_request(uuid,text,text)') is not null then
    raise exception '088 refused: authority/submit prerequisite missing or already applied';
  end if;
end $preflight$;

create function public.review_profile_change_request(p_request_id uuid, p_action text, p_reject_reason text default null)
returns jsonb language plpgsql volatile security definer set search_path = '' as $function$
declare
  v_user uuid := auth.uid();
  v_session uuid := genova_005.current_session_id();
  v_choir uuid;
  v_choice uuid;
  v_actor_id uuid;
  v_target_id uuid;
  v_actor public.choir_members%rowtype;
  v_target public.choir_members%rowtype;
  v_row public.choir_members%rowtype;
  v_patch public.choir_members%rowtype;
  v_request public.profile_change_requests%rowtype;
  v_pending public.profile_change_requests%rowtype;
  v_role record;
  v_is_chef boolean := false;
  v_changes jsonb;
  v_previous jsonb;
  v_current jsonb;
  v_keys text[];
  v_reason text := genova_087.normalize_changes(jsonb_build_object('about_text',p_reject_reason))->>'about_text';
  v_field text;
  v_reference uuid;
  v_decided_at timestamptz;
begin
  if v_user is null or v_session is null then
    raise exception 'Geçerli kullanıcı oturumu bulunamadı.' using errcode='28000';
  end if;
  if p_request_id is null or p_action is null or p_action not in ('approve','reject') then
    raise exception 'Geçersiz karar.' using errcode='22023';
  end if;
  if p_action='reject' and (select coalesce(sum(case when ascii(ch)>65535 then 2 else 1 end),0)
    from regexp_split_to_table(v_reason,'') ch)>1200 then
    raise exception 'Red sebebi çok uzun.' using errcode='22023';
  end if;
  v_choir := public.current_choir_id();
  if v_choir is null then raise exception 'Aktif koro üyeliği bulunamadı.' using errcode='42501'; end if;
  insert into genova_005.active_choir_sessions(session_id,auth_user_id,choir_id,selected_at)
    values(v_session,v_user,v_choir,now()) on conflict(session_id) do nothing;
  select choice.choir_id into v_choice from genova_005.active_choir_sessions choice
    where choice.session_id=v_session and choice.auth_user_id=v_user for share;
  if not found then raise exception 'Geçerli kullanıcı oturumu bulunamadı.' using errcode='28000'; end if;
  if v_choice is distinct from v_choir then
    raise exception 'Koro seçimi değişti.' using errcode='PT409';
  end if;
  select m.id into v_actor_id from public.choir_members m where m.auth_user_id=v_user and m.choir_id=v_choir;
  if not found then raise exception 'Aktif koro üyeliği bulunamadı.' using errcode='42501'; end if;
  -- This unlocked identity is only a lock-order hint, never authority. Recheck below.
  select r.member_id into v_target_id from public.profile_change_requests r
    where r.id=p_request_id and r.choir_id=v_choir;
  if not found then raise exception 'Talep bulunamadı.' using errcode='PT404'; end if;
  -- Same session->member->request order as 087; sort members for cross-reviewers.
  for v_row in select m.* from public.choir_members m where m.choir_id=v_choir
    and m.id in (v_actor_id,v_target_id) order by m.id for no key update loop
    if v_row.id=v_actor_id then v_actor:=v_row; end if;
    if v_row.id=v_target_id then v_target:=v_row; end if;
  end loop;
  if v_actor.id is null or v_actor.auth_user_id is distinct from v_user or v_actor.is_active is not true then
    raise exception 'Aktif koro üyeliği bulunamadı.' using errcode='42501';
  end if;
  -- Lock assignment and definition; removal/rename must wait until decision commit.
  -- Evaluate returned locked rows, not an earlier cached role helper result.
  for v_role in select r.name from public.choir_member_roles mr join public.roles r on r.id=mr.role_id
    where mr.member_id=v_actor.id and mr.choir_id=v_choir and r.choir_id=v_choir
    order by mr.id,r.id for share of mr,r loop
    if lower(regexp_replace(translate(normalize(
      genova_087.normalize_changes(jsonb_build_object('about_text',v_role.name))->>'about_text',NFKD),
      'ıİ','iI'),U&'[\0300-\036f]','','g'))='sef' or v_role.name='Åef' then v_is_chef:=true; end if;
  end loop;
  if not v_is_chef then raise exception 'Şef yetkisi gerekli.' using errcode='42501'; end if;
  if v_target.id is null then raise exception 'Talep sahibi bulunamadı.' using errcode='PT404'; end if;
  -- Lock pending drafts deterministically; reread target after any waiting writer.
  perform 1 from public.profile_change_requests r where r.choir_id=v_choir and r.member_id=v_target.id
    and r.status='pending' order by r.created_at,r.id for update;
  select r.* into v_request from public.profile_change_requests r where r.id=p_request_id
    and r.choir_id=v_choir for update;
  if not found then raise exception 'Talep bulunamadı.' using errcode='PT404'; end if;
  if v_request.member_id is distinct from v_target.id or v_request.status<>'pending' then
    raise exception 'Talep değişti veya sonuçlandırılmış.' using errcode='PT409';
  end if;
  v_changes:=genova_087.normalize_changes(v_request.changes_json);
  select array_agg(key order by key) into v_keys from jsonb_object_keys(v_changes) key;
  if p_action='approve' and (v_changes='{}'::jsonb or v_target.is_active is not true) then
    raise exception 'Geçerli alan ve aktif talep sahibi gerekli.' using errcode='22023';
  end if;
  for v_pending in select r.* from public.profile_change_requests r where r.choir_id=v_choir
    and r.member_id=v_target.id and r.status='pending' and r.created_at<v_request.created_at loop
    if genova_087.normalize_changes(v_pending.changes_json) ?| v_keys then
      raise exception 'Önce aynı alanı değiştiren eski talebi sonuçlandırın.' using errcode='PT409';
    end if;
  end loop;
  v_current:=genova_087.normalize_changes(to_jsonb(v_target));
  select coalesce(jsonb_object_agg(key,coalesce(v_current->key,'null'::jsonb)),'{}'::jsonb)
    into v_previous from unnest(v_keys) key;
  if p_action='approve' then
    foreach v_field in array array['school_id','department_id','favorite_song_id'] loop
      if v_changes->>v_field is null then continue; end if;
      if (v_changes->>v_field) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        raise exception 'Geçersiz profil seçimi.' using errcode='22023';
      end if;
      v_reference:=(v_changes->>v_field)::uuid;
      if v_field='school_id' then
        perform 1 from public.schools where id=v_reference and choir_id=v_choir for share;
      elsif v_field='department_id' then
        perform 1 from public.departments where id=v_reference and choir_id=v_choir for share;
      else
        perform 1 from public.repertoire where id=v_reference and choir_id=v_choir for share;
      end if;
      if not found then raise exception 'Seçim bu koroya ait değil.' using errcode='22023'; end if;
    end loop;
    v_patch:=jsonb_populate_record(v_target,v_changes);
    update public.choir_members set email=v_patch.email,phone=v_patch.phone,birth_date=v_patch.birth_date,
      school_id=v_patch.school_id,department_id=v_patch.department_id,favorite_song_id=v_patch.favorite_song_id,
      about_text=v_patch.about_text,linkedin_url=v_patch.linkedin_url,instagram_url=v_patch.instagram_url,
      youtube_url=v_patch.youtube_url,spotify_url=v_patch.spotify_url,tiktok_url=v_patch.tiktok_url,
      x_url=v_patch.x_url,photo_url=v_patch.photo_url where id=v_target.id and choir_id=v_choir;
    if not found then raise exception 'Üye kaydı güncellenemedi.' using errcode='40001'; end if;
  end if;
  v_decided_at:=clock_timestamp();
  update public.profile_change_requests set status=case when p_action='approve' then 'approved' else 'rejected' end,
    previous_values_json=v_previous,reviewed_by=v_actor.id,reviewed_at=v_decided_at,
    reject_reason=case when p_action='reject' then v_reason else null end
    where id=v_request.id and choir_id=v_choir returning * into v_request;
  if not found then raise exception 'Talep sonuçlandırılamadı.' using errcode='40001'; end if;
  return jsonb_build_object('id',v_request.id,'status',v_request.status,'rejectReason',v_request.reject_reason,
    'reviewedAt',v_request.reviewed_at,'reviewedBy',v_request.reviewed_by,'memberId',v_target.id,
    'reviewerName',nullif(btrim(v_actor.first_name||' '||v_actor.last_name),''));
end $function$;
revoke all on function public.review_profile_change_request(uuid,text,text) from public, anon, authenticated, service_role;
grant execute on function public.review_profile_change_request(uuid,text,text) to authenticated;
comment on function public.review_profile_change_request(uuid,text,text) is
  'JWT session, active actor and choir-aware chef locks; request-ID tenant anchor, pending overlap ordering, review-time snapshot and member/decision atomicity. Returns committed push target, no payload authority.';
commit;
