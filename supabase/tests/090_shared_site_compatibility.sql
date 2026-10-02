-- Offline R1 restore only: no live writes, email or provider endpoint.
-- Verify exact production sibling table/request shapes with task-owned rows.
-- Directory zero is an observed PRODUCT FAIL, not a successful directory test.
begin;
do $test$
declare
  choir uuid := gen_random_uuid(); member uuid := gen_random_uuid();
  contact uuid := gen_random_uuid(); collab uuid := gen_random_uuid(); subscriber uuid := gen_random_uuid();
  visible integer;
begin
  insert into public.choirs(id,slug,name) values(choir,'090-site-'||choir,'090 Synthetic Public Choir');
  insert into public.choir_members(id,choir_id,first_name,last_name,voice_group,is_active,join_date)
  values(member,choir,'Synthetic','Public','Soprano',true,current_date);
  execute 'set local role anon';
  perform set_config('request.jwt.claims','{"role":"anon"}',true);
  select count(*) into visible from public.public_choir_members where id=member;
  if visible <> 0 then raise exception '090 shared site: anonymous tenant boundary unexpectedly opened'; end if;
  -- Exact sibling production insert shapes (no SELECT/RETURNING requested by clients).
  insert into public.contact_messages(id,name,email,subject,message)
  values(contact,'Synthetic','090-contact-'||contact||'@example.invalid',null,'R1 offline rehearsal');
  insert into public.collab_inquiries(id,name,email,message,inquiry_type)
  values(collab,'Synthetic','090-collab-'||collab||'@example.invalid','R1 offline rehearsal','invite');
  insert into public.subscribers(id,email,name,source)
  values(subscriber,'090-subscriber-'||subscriber||'@example.invalid',null,'contact');
  if exists(select 1 from public.contact_messages where id=contact)
    or exists(select 1 from public.collab_inquiries where id=collab)
    or exists(select 1 from public.subscribers where id=subscriber) then
    raise exception '090 shared site: anon could read private form submissions';
  end if;
  execute 'reset role';
  if not exists(select 1 from public.contact_messages where id=contact)
    or not exists(select 1 from public.collab_inquiries where id=collab)
    or not exists(select 1 from public.subscribers where id=subscriber) then
    raise exception '090 shared site: form insert disappeared';
  end if;
  raise notice '090 shared site: forms INSERT PASS / anonymous form SELECT denied PASS / public directory PRODUCT FAIL (0 synthetic visible members)';
end
$test$;
rollback;
