-- Local isolated PG17 only. No original choir IDs; every synthetic row is rolled back.
begin;
do $test$
declare
  actor uuid := gen_random_uuid(); outsider uuid := gen_random_uuid(); single_inactive uuid := gen_random_uuid();
  choir_a uuid := gen_random_uuid(); choir_b uuid := gen_random_uuid();
  member_a uuid := gen_random_uuid(); member_b uuid := gen_random_uuid();
  chef_role uuid := gen_random_uuid(); song_a uuid := gen_random_uuid();
  song_b uuid := gen_random_uuid(); session_a uuid := gen_random_uuid();
  session_b uuid := gen_random_uuid(); refused boolean; affected integer;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at)
  values (actor,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    '078-'||actor||'@example.invalid','',now(),now(),now()),
    (outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    '078-'||outsider||'@example.invalid','',now(),now(),now()),
    (single_inactive,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    '078-'||single_inactive||'@example.invalid','',now(),now(),now());
  insert into public.choirs(id,slug,name) values
    (choir_a,'078-a-'||choir_a,'Independent choir A'),(choir_b,'078-b-'||choir_b,'Independent choir B');
  insert into public.choir_members(id,auth_user_id,choir_id,first_name,last_name,voice_group,is_active,join_date)
  values (member_a,actor,choir_a,'Synthetic','A','Soprano',true,current_date),
    (member_b,actor,choir_b,'Synthetic','B','Alto',true,current_date),
    (gen_random_uuid(),single_inactive,choir_a,'Single','Inactive','Tenor',false,current_date);
  insert into public.roles(id,choir_id,name) values(chef_role,choir_a,'Şef');
  insert into public.choir_member_roles(choir_id,member_id,role_id) values(choir_a,member_a,chef_role);
  insert into public.repertoire(id,choir_id,title) values(song_a,choir_a,'078 A'),(song_b,choir_b,'078 B');

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated','session_id',session_a)::text,true);
  if public.current_choir_id() is not null then raise exception '078: multi without choice opened a choir'; end if;
  if (select count(*) from public.list_my_choirs()) <> 2
    or exists(select 1 from public.list_my_choirs() where is_current is null) then
    raise exception '078: picker contract changed';
  end if;
  perform public.set_active_choir(choir_a);
  if public.current_choir_id() is distinct from choir_a
    or public.current_choir_member_id() is distinct from member_a
    or not public.current_member_has_role('Şef') then raise exception '078: active A authority lost'; end if;
  if (select count(*) from public.repertoire where id in(song_a,song_b)) <> 1 then
    raise exception '078: active A leaked B'; end if;
  refused := false;
  begin insert into public.repertoire(choir_id,title) values(choir_b,'078 forbidden B');
  exception when insufficient_privilege then refused := true; end;
  if not refused then raise exception '078: A wrote B'; end if;
  perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated','session_id',session_b)::text,true);
  if public.current_choir_id() is not null then raise exception '078: B session inherited A choice'; end if;
  perform public.set_active_choir(choir_b);

  execute 'reset role';
  update public.choir_members set is_active=false where id=member_a;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated','session_id',session_a)::text,true);
  -- This is the red-before-green assertion: old 005 retains A here.
  if public.current_choir_id() is not null then raise exception '078: inactive selected membership retains tenant authority'; end if;
  if public.current_choir_member_id() is not null or public.current_chat_member_id() is not null
    or public.get_current_member_id() is not null or public.get_my_member_id() is not null
    or public.current_member_voice_group() is not null or public.get_my_role() is not null
    or public.current_member_has_role('Şef') or public.is_chef() or public.is_leader() then
    raise exception '078: inactive membership retains identity/roles'; end if;
  if exists(select 1 from public.repertoire where id in(song_a,song_b))
    or exists(select 1 from public.choir_member_roles where member_id=member_a) then
    raise exception '078: inactive selection reads tenant rows'; end if;
  refused := false;
  begin insert into public.repertoire(choir_id,title) values(choir_a,'078 inactive write');
  exception when insufficient_privilege then refused := true; end;
  if not refused then raise exception '078: inactive selection wrote A'; end if;
  update public.repertoire set title='078 forbidden update' where id=song_a;
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception '078: inactive selection updated A'; end if;
  refused := false;
  begin perform public.set_active_choir(choir_a);
  exception when insufficient_privilege then refused := true; end;
  if not refused then raise exception '078: inactive membership selected A'; end if;
  refused := false;
  begin perform public.upsert_my_active_push_subscription('https://example.invalid/078','x','x',null);
  exception when invalid_authorization_specification then refused := true; end;
  if not refused then raise exception '078: inactive identity used push RPC'; end if;

  perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated','session_id',session_b)::text,true);
  if public.current_choir_id() is distinct from choir_b or public.current_choir_member_id() is distinct from member_b
    or public.current_member_has_role('Şef') then raise exception '078: B session affected/borrowed A role'; end if;
  -- A new session falls back only to the one eligible membership, never inactive A.
  perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated','session_id',gen_random_uuid())::text,true);
  if public.current_choir_id() is distinct from choir_b then raise exception '078: eligible single fallback failed'; end if;

  execute 'reset role';
  update public.choir_members set is_active=false where id=member_b;
  execute 'set local role authenticated';
  if public.current_choir_id() is not null then raise exception '078: all-inactive fallback opened tenant'; end if;
  perform set_config('request.jwt.claims',json_build_object('sub',outsider,'role','authenticated','session_id',gen_random_uuid())::text,true);
  refused := false;
  begin perform public.set_active_choir(choir_b);
  exception when insufficient_privilege then refused := true; end;
  if not refused or exists(select 1 from public.list_my_choirs()) then raise exception '078: outsider accessed choir'; end if;
  perform set_config('request.jwt.claims',json_build_object('sub',single_inactive,'role','authenticated','session_id',gen_random_uuid())::text,true);
  if public.current_choir_id() is not null or public.current_choir_member_id() is not null
    or exists(select 1 from public.repertoire where id=song_a) then raise exception '078: inactive single fallback opened A'; end if;
  refused := false;
  begin perform public.set_active_choir(choir_a);
  exception when insufficient_privilege then refused := true; end;
  if not refused then raise exception '078: inactive single selected A'; end if;

  execute 'reset role';
  update public.choir_members set is_active=true where id=member_a;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',json_build_object('sub',actor,'role','authenticated','session_id',session_a)::text,true);
  if public.current_choir_id() is distinct from choir_a or not public.is_chef() then
    raise exception '078: reactivation lost legitimate A identity'; end if;
end
$test$;
rollback;
