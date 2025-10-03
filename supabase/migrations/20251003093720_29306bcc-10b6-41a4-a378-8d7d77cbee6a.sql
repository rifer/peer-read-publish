-- Assign demo articles to the first available user
UPDATE public.articles 
SET submitter_id = '02664671-c090-4b0d-b0c8-df2252068de5'
WHERE submitter_id = '00000000-0000-0000-0000-000000000000';

-- Now add the foreign key constraint
ALTER TABLE public.articles
ADD CONSTRAINT articles_submitter_id_fkey 
FOREIGN KEY (submitter_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;