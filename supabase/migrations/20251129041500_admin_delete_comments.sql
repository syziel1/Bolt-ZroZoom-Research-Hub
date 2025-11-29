-- Allow admins to delete any comment
CREATE POLICY "comments_admin_delete" ON "public"."comments"
FOR DELETE
USING (public.is_admin(auth.uid()));
