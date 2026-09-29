-- Only new RPC; no reversal of committed user data. Roll web back before production use.
begin;
drop function public.review_profile_change_request(uuid,text,text);
commit;
