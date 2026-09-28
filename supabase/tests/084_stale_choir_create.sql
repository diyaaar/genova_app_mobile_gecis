-- LOCAL PG17 CLONE ONLY. Repertoire default-vs-explicit-tenant race; all data rolls back.
begin;
do $test$
declare
  user_shared uuid := gen_random_uuid();
  session_shared uuid := gen_random_uuid();
  choir_a uuid := gen_random_uuid();
  choir_b uuid := gen_random_uuid();
  member_a uuid := gen_random_uuid();
  member_b uuid := gen_random_uuid();
  role_a uuid := gen_random_uuid();
  role_b uuid := gen_random_uuid();
  song_a uuid := gen_random_uuid();
  old_form_song uuid := gen_random_uuid();
  guarded_song uuid := gen_random_uuid();
  song_b uuid := gen_random_uuid();
begin
  perform set_config('request.jwt.claims','',true);
  perform set_config('request.jwt.claim.sub','',true);
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at)
    values(user_shared,'00000000-0000-0000-0000-000000000000','authenticated',
      'authenticated','shared-084-'||user_shared||'@example.invalid','',now(),now(),now());
  insert into public.choirs(id,name,slug) values
    (choir_a,'084 Unrelated Alpha','fixture-084-a-'||choir_a),
    (choir_b,'084 Unrelated Beta','fixture-084-b-'||choir_b);
  insert into public.choir_members(id,auth_user_id,choir_id,first_name,last_name,
    voice_group,join_date,is_active) values
    (member_a,user_shared,choir_a,'Shared','Alpha','Alto',current_date,true),
    (member_b,user_shared,choir_b,'Shared','Beta','Alto',current_date,true);
  insert into public.roles(id,choir_id,name) values(role_a,choir_a,'Şef'),(role_b,choir_b,'Şef');
  insert into public.choir_member_roles(choir_id,member_id,role_id) values
    (choir_a,member_a,role_a),(choir_b,member_b,role_b);
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',json_build_object('sub',user_shared,
    'role','authenticated','session_id',session_shared)::text,true);
  perform set_config('request.jwt.claim.sub',user_shared::text,true);
  perform public.set_active_choir(choir_a);
  insert into public.repertoire(id,choir_id,title)
    values(song_a,choir_a,'084 Alpha song '||song_a);
  if not exists(select 1 from public.repertoire where id=song_a and choir_id=choir_a)
    then raise exception '084: same-choir explicit create failed'; end if;

  -- Simulate another tab selecting B after the first form has captured A.
  perform public.set_active_choir(choir_b);
  insert into public.repertoire(id,title) values(old_form_song,'084 old unscoped form '||old_form_song);
  if not exists(select 1 from public.repertoire where id=old_form_song and choir_id=choir_b)
    then raise exception '084: unscoped default wrong-choir baseline was not reproduced'; end if;

  -- The fixed client always includes A. Even a switch immediately after its RPC check cannot retarget it.
  begin
    insert into public.repertoire(id,choir_id,title)
      values(guarded_song,choir_a,'084 guarded stale A form '||guarded_song);
    raise exception '084: explicit stale A insert accepted in B' using errcode='X8401';
  exception when insufficient_privilege then null; end;
  if exists(select 1 from public.repertoire where id=guarded_song)
    then raise exception '084: refused stale request left a B row'; end if;
  insert into public.repertoire(id,choir_id,title)
    values(song_b,choir_b,'084 Beta song '||song_b);
  if not exists(select 1 from public.repertoire where id=song_b and choir_id=choir_b)
    or exists(select 1 from public.repertoire where id=song_a) then
    raise exception '084: Beta same-choir create or Alpha isolation failed'; end if;

  execute 'set local role postgres';
  update public.choir_members set is_active=false where id=member_b;
  execute 'set local role authenticated';
  if public.current_choir_id() is not null
    then raise exception '084: revoked B silently fell back to A'; end if;
  begin
    insert into public.repertoire(choir_id,title)
      values(choir_a,'084 revoked stale request '||gen_random_uuid());
    raise exception '084: revoked context created in surviving A' using errcode='X8402';
  exception when insufficient_privilege then null; end;
  execute 'set local role postgres';
end $test$;
rollback;
