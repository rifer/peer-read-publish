-- Allow writers to view their own articles (including drafts)
CREATE POLICY "Writers can view their own articles"
ON public.articles
FOR SELECT
TO authenticated
USING (auth.uid() = submitter_id);