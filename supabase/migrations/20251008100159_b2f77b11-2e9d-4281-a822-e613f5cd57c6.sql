-- Create article_citations table
CREATE TABLE public.article_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cited_article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  citing_article_title TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.article_citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view citations for published articles"
  ON public.article_citations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_citations.cited_article_id
      AND articles.status = 'published'
    )
  );

CREATE POLICY "Anyone can create citations"
  ON public.article_citations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own citations"
  ON public.article_citations
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all citations"
  ON public.article_citations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_article_citations_updated_at
  BEFORE UPDATE ON public.article_citations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better query performance
CREATE INDEX idx_article_citations_cited_article_id ON public.article_citations(cited_article_id);
CREATE INDEX idx_article_citations_user_id ON public.article_citations(user_id);