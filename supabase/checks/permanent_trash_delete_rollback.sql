-- Run after the migration. Synthetic test records only; always ROLLBACK.
BEGIN;
-- Synthetic fixtures only; everything below is rolled back, including DDL.
SELECT set_config('pesse.test_admin',(SELECT user_id::text FROM public.editor_roles WHERE role='admin' LIMIT 1),true);
SELECT set_config('pesse.test_trashed',gen_random_uuid()::text,true),set_config('pesse.test_active',gen_random_uuid()::text,true);
INSERT INTO public.articles(id,slug,title) VALUES
 (current_setting('pesse.test_trashed')::uuid,'test-delete-'||current_setting('pesse.test_trashed'),'Pesse delete test'),
 (current_setting('pesse.test_active')::uuid,'test-delete-'||current_setting('pesse.test_active'),'Pesse active test');
-- Use the administrator transition so existing trash triggers remain enforced.
SELECT set_config('request.jwt.claim.sub',current_setting('pesse.test_admin'),true);
SELECT public.trash_article(current_setting('pesse.test_trashed')::uuid);
SELECT set_config('pesse.test_deleted_at',(SELECT deleted_at::text FROM public.articles WHERE id=current_setting('pesse.test_trashed')::uuid),true);
SET LOCAL ROLE authenticated;
DO $test$ BEGIN
 BEGIN
  PERFORM public.permanently_delete_article(current_setting('pesse.test_trashed')::uuid,current_setting('pesse.test_deleted_at')::timestamptz,'Wrong title');
  RAISE EXCEPTION 'TEST FAILURE: wrong title accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 BEGIN
  PERFORM public.permanently_delete_article(current_setting('pesse.test_trashed')::uuid,current_setting('pesse.test_deleted_at')::timestamptz+interval '1 second','Pesse delete test');
  RAISE EXCEPTION 'TEST FAILURE: stale trash version accepted';
 EXCEPTION WHEN no_data_found THEN NULL; END;
 BEGIN
  DELETE FROM public.articles WHERE id=current_setting('pesse.test_active')::uuid;
  RAISE EXCEPTION 'TEST FAILURE: active article deleted';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
-- Non-admin authenticated caller cannot use RPC even for a known trashed ID.
SELECT set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
DO $test$ BEGIN
 BEGIN
  PERFORM public.permanently_delete_article(current_setting('pesse.test_trashed')::uuid,current_setting('pesse.test_deleted_at')::timestamptz,'Pesse delete test');
  RAISE EXCEPTION 'TEST FAILURE: non-admin deleted article';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $test$ BEGIN
 BEGIN
  PERFORM public.permanently_delete_article(current_setting('pesse.test_trashed')::uuid,current_setting('pesse.test_deleted_at')::timestamptz,'Pesse delete test');
  RAISE EXCEPTION 'TEST FAILURE: anonymous RPC allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
RESET ROLE;
SELECT set_config('request.jwt.claim.sub',current_setting('pesse.test_admin'),true);
SET LOCAL ROLE authenticated;
DO $test$ DECLARE result uuid; BEGIN
 result:=public.permanently_delete_article(current_setting('pesse.test_trashed')::uuid,current_setting('pesse.test_deleted_at')::timestamptz,'Pesse delete test');
 IF result<>current_setting('pesse.test_trashed')::uuid THEN RAISE EXCEPTION 'TEST FAILURE: wrong deleted ID'; END IF;
 IF EXISTS(SELECT 1 FROM public.articles WHERE id=result) THEN RAISE EXCEPTION 'TEST FAILURE: row still exists'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.articles WHERE id=current_setting('pesse.test_active')::uuid) THEN RAISE EXCEPTION 'TEST FAILURE: active article lost'; END IF;
END $test$;
RESET ROLE;
ROLLBACK;
SELECT 'PASS: admin deletion, non-admin and anon denial, active protection, title and stale-version checks; all changes rolled back' AS result;
