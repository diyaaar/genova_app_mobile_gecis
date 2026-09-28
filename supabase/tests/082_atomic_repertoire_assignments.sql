-- LOCAL PG17 ONLY. Requires 082 migration + committed synthetic fixture.
begin;
set role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111"}';

do $test$
declare
  song constant uuid := 'a2000000-0000-4000-8000-000000000001';
  one constant uuid := 'a0000000-0000-4000-8000-000000000002';
  two constant uuid := 'a0000000-0000-4000-8000-000000000003';
  result record;
  actual uuid[];
begin
  select * into result from public.replace_repertoire_assignments(song,'Alto',array[one,two],array[one]);
  if result.song_title <> 'Fixture song A' or result.added_member_ids <> array[two] then
    raise exception '082: initial addition response wrong'; end if;
  select * into result from public.replace_repertoire_assignments(song,'Alto',array[one,two],array[one]);
  if result.added_member_ids <> array[]::uuid[] then raise exception '082: retry duplicated push'; end if;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[]::uuid[],array[one]);
    raise exception '082: stale save unexpectedly accepted' using errcode='X8201';
  exception when sqlstate '40001' then null; end;
  actual := array(select sa.member_id from public.song_assignments sa
    where sa.song_id=song and sa.part_name='Alto' order by sa.member_id);
  if actual <> array[one,two] then raise exception '082: stale save changed rows'; end if;
  perform public.replace_repertoire_assignments(song,'Alto',array[one],array[one,two]);
  perform public.replace_repertoire_assignments(song,'Alto',array[]::uuid[],array[one]);
  actual := array(select sa.member_id from public.song_assignments sa
    where sa.song_id=song and sa.part_name='Alto' order by sa.member_id);
  if cardinality(actual) <> 0 then raise exception '082: intentional empty set failed'; end if;
  perform public.replace_repertoire_assignments(song,'Alto',array[one],array[]::uuid[]);
end;
$test$;

-- Inject a DB-side insert failure after the function has deleted the old row.
set role postgres;
create function pg_temp.fail_082_insert() returns trigger language plpgsql as $failure$
begin raise exception '082 synthetic forced insert failure' using errcode='X8202'; end;
$failure$;
create trigger fail_082_insert before insert on public.song_assignments
  for each row execute function pg_temp.fail_082_insert();
set role authenticated;
do $test$
declare
  song constant uuid := 'a2000000-0000-4000-8000-000000000001';
  one constant uuid := 'a0000000-0000-4000-8000-000000000002';
  two constant uuid := 'a0000000-0000-4000-8000-000000000003';
  actual uuid[];
begin
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[two],array[one]);
    raise exception '082: forced failure unexpectedly accepted' using errcode='X8203';
  exception when sqlstate 'X8202' then null; end;
  actual := array(select sa.member_id from public.song_assignments sa
    where sa.song_id=song and sa.part_name='Alto' order by sa.member_id);
  if actual <> array[one] then raise exception '082: prior assignment lost after insert failure'; end if;
end;
$test$;
set role postgres;
drop trigger fail_082_insert on public.song_assignments;
set role authenticated;

do $test$
declare
  song constant uuid := 'a2000000-0000-4000-8000-000000000001';
  other_song constant uuid := 'b2000000-0000-4000-8000-000000000001';
  one constant uuid := 'a0000000-0000-4000-8000-000000000002';
  two constant uuid := 'a0000000-0000-4000-8000-000000000003';
  inactive constant uuid := 'a0000000-0000-4000-8000-000000000004';
  leader constant uuid := 'a0000000-0000-4000-8000-000000000005';
  chef constant uuid := 'a0000000-0000-4000-8000-000000000001';
  btarget constant uuid := 'b0000000-0000-4000-8000-000000000002';
  actual uuid[];
begin
  -- Cross-part insert succeeds only when the member is unassigned there.
  perform public.replace_repertoire_assignments(song,'Bass',array[two],array[]::uuid[]);
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[one,two],array[one]);
    raise exception '082: cross-part move unexpectedly accepted' using errcode='X8204';
  exception when sqlstate '23505' then null; end;
  actual := array(select sa.member_id from public.song_assignments sa
    where sa.song_id=song and sa.part_name='Alto' order by sa.member_id);
  if actual <> array[one] then raise exception '082: cross-part collision changed Alto'; end if;
  actual := array(select sa.member_id from public.song_assignments sa
    where sa.song_id=song and sa.part_name='Bass' order by sa.member_id);
  if actual <> array[two] then raise exception '082: cross-part collision changed Bass'; end if;
  perform public.replace_repertoire_assignments(song,'Bass',array[]::uuid[],array[two]);

  begin
    perform public.replace_repertoire_assignments(other_song,'Alto',array[one],array[]::uuid[]);
    raise exception '082: cross-tenant song accepted' using errcode='X8205';
  exception when sqlstate 'P0002' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[btarget],array[one]);
    raise exception '082: cross-tenant target accepted' using errcode='X8206';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[inactive],array[one]);
    raise exception '082: inactive target accepted' using errcode='X8207';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[leader],array[one]);
    raise exception '082: section chef target accepted' using errcode='X8208';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[chef],array[one]);
    raise exception '082: chef target accepted' using errcode='X8209';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[one,one],array[one]);
    raise exception '082: duplicate target accepted' using errcode='X8210';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[one],null);
    raise exception '082: missing expected set accepted' using errcode='X8211';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[one],array[one,one]);
    raise exception '082: duplicate expected set accepted' using errcode='X8212';
  exception when sqlstate '22023' then null; end;
  begin
    perform public.replace_repertoire_assignments(song,'Alto',array[one],array[null::uuid]);
    raise exception '082: null expected member accepted' using errcode='X8213';
  exception when sqlstate '22023' then null; end;
end;
$test$;

-- A leader and an unrelated choir's chef cannot write this A scope.
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
set local request.jwt.claims = '{"sub":"33333333-3333-4333-8333-333333333333"}';
do $test$ begin
  begin
    perform public.replace_repertoire_assignments('a2000000-0000-4000-8000-000000000001',
      'Alto',array[]::uuid[],array[]::uuid[]);
    raise exception '082: leader write accepted' using errcode='X8214';
  exception when sqlstate '42501' then null; end;
end $test$;
set local request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';
set local request.jwt.claims = '{"sub":"22222222-2222-4222-8222-222222222222"}';
do $test$ begin
  -- The unrelated choir may still manage its own song.
  perform public.replace_repertoire_assignments('b2000000-0000-4000-8000-000000000001',
    'Bass',array['b0000000-0000-4000-8000-000000000002'::uuid],array[]::uuid[]);
  begin
    perform public.replace_repertoire_assignments('a2000000-0000-4000-8000-000000000001',
      'Alto',array[]::uuid[],array[]::uuid[]);
    raise exception '082: B chef wrote A song' using errcode='X8215';
  exception when sqlstate 'P0002' then null; end;
end $test$;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';
set local request.jwt.claims = '{"sub":"11111111-1111-4111-8111-111111111111"}';
set role postgres;
update public.choir_members set is_active=false where id='a0000000-0000-4000-8000-000000000001';
set role authenticated;
do $test$ begin
  begin
    perform public.replace_repertoire_assignments('a2000000-0000-4000-8000-000000000001',
      'Alto',array[]::uuid[],array[]::uuid[]);
    raise exception '082: inactive chef accepted' using errcode='X8216';
  exception when sqlstate '42501' then null; end;
end $test$;
rollback;
