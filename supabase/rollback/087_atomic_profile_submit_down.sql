-- 087 LOCAL REHEARSAL. Remove only new additions; data and older authority stay intact.
-- Never remove while any deployed web adapter depends on this RPC.
begin;
drop function public.submit_profile_change_request(uuid,jsonb,text);
drop function genova_087.normalize_changes(jsonb);
drop schema genova_087;
commit;
