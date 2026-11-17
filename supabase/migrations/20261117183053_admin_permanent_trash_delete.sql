-- No rows are removed by this migration. Images are never deleted.
-- Keep RLS and caller privileges: this RPC is SECURITY INVOKER.
CREATE OR REPLACE FUNCTION public.permanently_delete_article(
 target_id uuid, expected_deleted_at timestamptz, confirmation_title text
) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $function$
DECLARE removed_id uuid;
BEGIN
 IF (SELECT auth.uid()) IS NULL OR NOT public.is_admin() THEN
  RAISE EXCEPTION 'Only administrators can permanently delete trashed articles' USING ERRCODE='42501';
 END IF;
 IF expected_deleted_at IS NULL OR confirmation_title IS NULL OR confirmation_title='' THEN
  RAISE EXCEPTION 'Trash version and exact title confirmation are required' USING ERRCODE='22023';
 END IF;
 DELETE FROM public.articles
 WHERE id=target_id AND deleted_at=expected_deleted_at AND title=confirmation_title
   AND status='draft' AND published_at IS NULL
 RETURNING id INTO removed_id;
 IF removed_id IS NULL THEN
  RAISE EXCEPTION 'Article changed, was restored, or is no longer in trash' USING ERRCODE='P0002';
 END IF;
 RETURN removed_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.permanently_delete_article(uuid,timestamptz,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.permanently_delete_article(uuid,timestamptz,text) TO authenticated;

-- Also guard direct table DELETE: administrators can only delete trashed drafts.
-- Preserve existing maintenance access without an end-user JWT.
CREATE OR REPLACE FUNCTION public.prevent_client_article_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $function$
BEGIN
 IF current_user IN ('anon','authenticated') OR (SELECT auth.uid()) IS NOT NULL THEN
  IF (SELECT auth.uid()) IS NULL OR NOT public.is_admin() THEN
   RAISE EXCEPTION 'Only administrators can permanently delete articles' USING ERRCODE='42501';
  END IF;
  IF OLD.deleted_at IS NULL OR OLD.status<>'draft' OR OLD.published_at IS NOT NULL THEN
   RAISE EXCEPTION 'Move this article to the trash before deleting it' USING ERRCODE='42501';
  END IF;
 END IF;
 RETURN OLD;
END;
$function$;
REVOKE ALL ON FUNCTION public.prevent_client_article_delete() FROM PUBLIC,anon,authenticated;
