-- 087: authenticated profile submission, authority and merge in one transaction.
begin;
do $preflight$
begin
  if to_regnamespace('genova_078') is null or to_regnamespace('genova_087') is not null
    or to_regclass('public.profile_change_requests') is null
    or to_regprocedure('public.submit_profile_change_request(uuid,jsonb,text)') is not null then
    raise exception '087 refused: active authority prerequisite missing or already applied';
  end if;
end $preflight$;
create schema genova_087;
revoke all on schema genova_087 from public, anon, authenticated, service_role;

-- Mirrors PROFILE_CHANGE_KEYS and JS trim/null semantics. Private: cannot write data.
create function genova_087.normalize_changes(p_raw jsonb) returns jsonb
language sql immutable set search_path = '' as $function$
  select coalesce(jsonb_object_agg(key, case when value='null'::jsonb then value else
    to_jsonb(nullif(btrim(value #>> '{}', E' \t\n\r\f' || chr(11) || chr(160) || chr(5760)
      || chr(8192) || chr(8193) || chr(8194) || chr(8195) || chr(8196) || chr(8197)
      || chr(8198) || chr(8199) || chr(8200) || chr(8201) || chr(8202) || chr(8232)
      || chr(8233) || chr(8239) || chr(8287) || chr(12288) || chr(65279)), '')) end), '{}'::jsonb)
  from jsonb_each(case when jsonb_typeof(p_raw)='object' then p_raw else '{}'::jsonb end)
  where key=any(array['email','phone','birth_date','school_id','department_id','favorite_song_id',
    'about_text','linkedin_url','instagram_url','youtube_url','spotify_url','tiktok_url','x_url','photo_url'])
    and jsonb_typeof(value) in ('string','null');
$function$;
revoke all on function genova_087.normalize_changes(jsonb) from public, anon, authenticated, service_role;

create function public.submit_profile_change_request(p_expected_choir_id uuid, p_changes jsonb, p_note text default null)
returns jsonb language plpgsql volatile security definer set search_path = '' as $function$
declare
  v_user uuid := auth.uid();
  v_session uuid := genova_005.current_session_id();
  v_choir uuid;
  v_member public.choir_members%rowtype;
  v_submitted jsonb := genova_087.normalize_changes(p_changes);
  v_current jsonb;
  v_changes jsonb;
  v_previous jsonb;
  v_keys text[];
  v_matches uuid[] := array[]::uuid[];
  v_request record;
  v_id uuid;
  v_note text;
  v_field text;
  v_reference uuid;
begin
  v_note := genova_087.normalize_changes(jsonb_build_object('about_text',p_note))->>'about_text';
  if v_user is null or v_session is null then
    raise exception 'Geçerli kullanıcı oturumu bulunamadı.' using errcode='28000';
  end if;
  if p_expected_choir_id is null or v_submitted='{}'::jsonb or length(v_note)>1200 then
    raise exception 'Geçersiz profil değişikliği.' using errcode='22023';
  end if;
  -- JS form limit counts UTF-16 units, not PostgreSQL code points (astral = two).
  if (select coalesce(sum(case when ascii(ch)>65535 then 2 else 1 end),0)
    from regexp_split_to_table(v_note,'') ch)>1200 then
    raise exception 'Not çok uzun.' using errcode='22023';
  end if;
  v_choir := public.current_choir_id();
  if v_choir is null then
    raise exception 'Aktif koro üyeliği bulunamadı.' using errcode='42501';
  end if;
  -- Materialize only an already-authorized singleton fallback, never supplied preference.
  -- Conflict waits for a simultaneous first choice; the following lock reads its outcome.
  insert into genova_005.active_choir_sessions(session_id,auth_user_id,choir_id,selected_at)
    values(v_session,v_user,v_choir,now()) on conflict(session_id) do nothing;
  select choice.choir_id into v_choir from genova_005.active_choir_sessions choice
    where choice.session_id=v_session and choice.auth_user_id=v_user for share;
  if not found then raise exception 'Geçerli kullanıcı oturumu bulunamadı.' using errcode='28000'; end if;
  if v_choir <> p_expected_choir_id then
    raise exception 'Koro seçimi değişti. Sayfayı yenileyip tekrar deneyin.' using errcode='PT409';
  end if;
  -- Session then member is the lock order. This holds authority through commit and
  -- serializes submissions from distinct Auth sessions belonging to the same member.
  -- NO KEY UPDATE also remains compatible with FK KEY SHARE from first-choice inserts.
  select m.* into v_member from public.choir_members m
    where m.auth_user_id=v_user and m.choir_id=v_choir for no key update;
  if not found or v_member.is_active is not true then
    raise exception 'Aktif koro üyeliği bulunamadı.' using errcode='42501';
  end if;
  v_current := genova_087.normalize_changes(to_jsonb(v_member));
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into v_changes
    from jsonb_each(v_submitted) where value is distinct from coalesce(v_current->key,'null'::jsonb);
  if v_changes='{}'::jsonb then return jsonb_build_object('mode','unchanged'); end if;
  select array_agg(key order by key) into v_keys from jsonb_object_keys(v_changes) key;
  select jsonb_object_agg(key,coalesce(v_current->key,'null'::jsonb)) into v_previous
    from unnest(v_keys) key;
  foreach v_field in array array['school_id','department_id','favorite_song_id'] loop
    if v_changes->>v_field is null then continue; end if;
    if (v_changes->>v_field) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Geçersiz profil seçimi.' using errcode='22023';
    end if;
    v_reference := (v_changes->>v_field)::uuid;
    if v_field='school_id' then
      perform 1 from public.schools where id=v_reference and choir_id=v_choir for share;
    elsif v_field='department_id' then
      perform 1 from public.departments where id=v_reference and choir_id=v_choir for share;
    else
      perform 1 from public.repertoire where id=v_reference and choir_id=v_choir for share;
    end if;
    if not found then raise exception 'Seçim bu koroya ait değil.' using errcode='22023'; end if;
  end loop;
  for v_request in select r.id,r.changes_json from public.profile_change_requests r
    where r.choir_id=v_choir and r.member_id=v_member.id and r.status='pending'
    order by r.created_at,r.id for update loop
    if (select array_agg(key order by key) from jsonb_object_keys(
      genova_087.normalize_changes(v_request.changes_json)) key)=v_keys then
      v_matches := array_append(v_matches,v_request.id);
    end if;
  end loop;
  if cardinality(v_matches)>0 then
    v_id := v_matches[1];
    update public.profile_change_requests set changes_json=v_changes, previous_values_json=v_previous,
      note=v_note,reviewed_by=null,reviewed_at=null,reject_reason=null
      where id=v_id and choir_id=v_choir and member_id=v_member.id and status='pending';
    delete from public.profile_change_requests where id=any(v_matches[2:cardinality(v_matches)])
      and choir_id=v_choir and member_id=v_member.id and status='pending';
    return jsonb_build_object('id',v_id,'mode','updated');
  end if;
  insert into public.profile_change_requests(choir_id,member_id,changes_json,previous_values_json,note,status)
    values(v_choir,v_member.id,v_changes,v_previous,v_note,'pending') returning id into v_id;
  return jsonb_build_object('id',v_id,'mode','created');
end $function$;
revoke all on function public.submit_profile_change_request(uuid,jsonb,text)
  from public, anon, authenticated, service_role;
grant execute on function public.submit_profile_change_request(uuid,jsonb,text) to authenticated;
comment on function public.submit_profile_change_request(uuid,jsonb,text) is
  'Caller JWT session/member authority locked through commit; own references, snapshots and same-key pending merge/cleanup are atomic. No supplied member identity or service-role execution.';
commit;
