-- 082 LOCAL CLONE ONLY. Synthetic A/B choirs and identities; never apply hosted.
insert into public.choirs(id,slug,name) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','fixture-082-a','Fixture 082 A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','fixture-082-b','Fixture 082 B');
insert into auth.users(id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222'),
 ('33333333-3333-4333-8333-333333333333');
insert into public.choir_members(id,choir_id,first_name,last_name,join_date,auth_user_id,voice_group,is_active) values
 ('a0000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture','Chef',current_date,'11111111-1111-4111-8111-111111111111','Şef',true),
 ('a0000000-0000-4000-8000-000000000002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture','One',current_date,null,'Alto',true),
 ('a0000000-0000-4000-8000-000000000003','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture','Two',current_date,null,'Alto',true),
 ('a0000000-0000-4000-8000-000000000004','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture','Inactive',current_date,null,'Alto',false),
 ('a0000000-0000-4000-8000-000000000005','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture','Leader',current_date,'33333333-3333-4333-8333-333333333333','Alto',true),
 ('b0000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Fixture','B chef',current_date,'22222222-2222-4222-8222-222222222222','Şef',true),
 ('b0000000-0000-4000-8000-000000000002','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Fixture','B target',current_date,null,'Bass',true);
insert into public.roles(id,choir_id,name) values
 ('a1000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Şef'),
 ('a1000000-0000-4000-8000-000000000002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Partisyon Şefi'),
 ('b1000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Şef');
insert into public.choir_member_roles(choir_id,member_id,role_id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a0000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a0000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000002'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','b0000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000001');
insert into public.repertoire(id,choir_id,title) values
 ('a2000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Fixture song A'),
 ('b2000000-0000-4000-8000-000000000001','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Fixture song B');
insert into public.song_assignments(song_id,member_id,choir_id,part_name,assigned_by) values
 ('a2000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000002','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Alto','a0000000-0000-4000-8000-000000000001');
