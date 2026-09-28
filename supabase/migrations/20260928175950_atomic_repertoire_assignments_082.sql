-- 082: one authenticated, invoker-rights assignment transaction per song/part.
begin;
do $preflight$
begin
  if to_regnamespace('genova_078') is null
    or to_regprocedure('public.current_choir_id()') is null
    or to_regprocedure('public.current_choir_member_id()') is null
    or to_regprocedure('public.current_member_has_role(text)') is null
    or to_regclass('public.song_assignments') is null
    or to_regprocedure('public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])') is not null then
    raise exception '082 refused: missing active-tenant prerequisite or function already exists';
  end if;
end
$preflight$;

create function public.replace_repertoire_assignments(
  p_song_id uuid, p_part_name text, p_member_ids uuid[], p_expected_member_ids uuid[]
) returns table(song_title text, added_member_ids uuid[])
language plpgsql volatile security invoker set search_path = ''
as $function$
declare
  v_choir uuid := public.current_choir_id();
  v_actor uuid := public.current_choir_member_id();
  v_part text := nullif(btrim(p_part_name), '');
  v_title text;
  v_current uuid[];
  v_expected uuid[];
  v_desired uuid[];
  v_added uuid[];
  v_count bigint;
begin
  if (select auth.uid()) is null or v_choir is null or v_actor is null
    or not public.current_member_has_role('Şef') then
    raise exception 'Chef membership required' using errcode='42501';
  end if;
  if p_song_id is null or p_member_ids is null or p_expected_member_ids is null
    or cardinality(p_member_ids) > 500 or cardinality(p_expected_member_ids) > 500
    or array_position(p_member_ids, null) is not null
    or array_position(p_expected_member_ids, null) is not null
    or (p_part_name is not null and (v_part is null or length(v_part) > 128)) then
    raise exception 'Invalid assignment input' using errcode='22023';
  end if;
  v_desired := array(select distinct x from unnest(p_member_ids) as x order by x);
  v_expected := array(select distinct x from unnest(p_expected_member_ids) as x order by x);
  if cardinality(v_desired) <> cardinality(p_member_ids)
    or cardinality(v_expected) <> cardinality(p_expected_member_ids) then
    raise exception 'Duplicate assignment input' using errcode='22023';
  end if;

  -- A song row exists even when the assignment set is empty. Locking it serializes
  -- concurrent saves of every part without relying on advisory-lock cooperation.
  select r.title into v_title from public.repertoire r
    where r.id=p_song_id and r.choir_id=v_choir for update;
  if not found then raise exception 'Song not found' using errcode='P0002'; end if;

  select count(*) into v_count from public.choir_members m
    where m.id=any(v_desired) and m.choir_id=v_choir and m.is_active is true;
  if v_count <> cardinality(v_desired) then
    raise exception 'Invalid or inactive target member' using errcode='22023';
  end if;
  if exists(select 1 from public.choir_member_roles mr
    join public.roles role on role.id=mr.role_id and role.choir_id=mr.choir_id
    where mr.choir_id=v_choir and mr.member_id=any(v_desired)
      and role.name in ('Şef','Sef','Åef','Partisyon Şefi','Partisyon Sefi','Partisyon Åefi')) then
    raise exception 'Chef or section-leader target refused' using errcode='22023';
  end if;

  select array(select sa.member_id from public.song_assignments sa
    where sa.choir_id=v_choir and sa.song_id=p_song_id
      and sa.part_name is not distinct from v_part order by sa.member_id) into v_current;
  -- A retry after a committed save is harmless, with no duplicate push target.
  if v_current = v_desired then
    return query select v_title, array[]::uuid[];
    return;
  end if;
  if v_current <> v_expected then
    raise exception 'Assignment set changed' using errcode='40001';
  end if;
  -- UNIQUE(song_id,member_id) means an assignment to another part must be
  -- removed there first; never silently move it via UPSERT.
  if exists(select 1 from public.song_assignments sa
    where sa.choir_id=v_choir and sa.song_id=p_song_id
      and sa.member_id=any(v_desired) and sa.part_name is distinct from v_part) then
    raise exception 'Member belongs to another part' using errcode='23505';
  end if;

  v_added := array(select x from unnest(v_desired) as x
    where not (x=any(v_current)) order by x);
  delete from public.song_assignments sa
    where sa.choir_id=v_choir and sa.song_id=p_song_id
      and sa.part_name is not distinct from v_part
      and not (sa.member_id=any(v_desired));
  insert into public.song_assignments(song_id,member_id,part_name,choir_id,assigned_by)
    select p_song_id,x,v_part,v_choir,v_actor from unnest(v_added) as x;
  return query select v_title, v_added;
end;
$function$;

-- Supabase creator defaults may grant explicit anon/service EXECUTE as well as PUBLIC.
revoke all on function public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])
  from public, anon, authenticated, service_role;
grant execute on function public.replace_repertoire_assignments(uuid,text,uuid[],uuid[])
  to authenticated;
comment on function public.replace_repertoire_assignments(uuid,text,uuid[],uuid[]) is
  'Authenticated active chef replaces one song/part set atomically with stale-set refusal; invoker RLS and per-song row lock.';
commit;
