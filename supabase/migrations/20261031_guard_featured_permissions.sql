-- Pesse security hardening: internal trigger functions are not public RPC endpoints.
-- Review and deploy separately after staging validation. Does not change article data.
begin;
revoke execute on function public.guard_article_featured() from public, anon, authenticated;
commit;
