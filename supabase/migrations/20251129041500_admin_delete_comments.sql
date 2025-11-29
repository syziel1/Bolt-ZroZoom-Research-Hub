-- Allow admins to delete any comment
CREATE POLICY "Comments - admin delete" ON "public"."comments"
    FOR DELETE
    USING (public.is_admin(auth.uid()));
