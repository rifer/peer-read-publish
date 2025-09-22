-- Create table for text selections and citations
CREATE TABLE public.review_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  selected_text TEXT NOT NULL,
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  context_before TEXT,
  context_after TEXT,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.review_citations ENABLE ROW LEVEL SECURITY;

-- Citations policies - inherit from reviews
CREATE POLICY "Anyone can view citations for published article reviews"
ON public.review_citations
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.reviews 
  JOIN public.articles ON articles.id = reviews.article_id
  WHERE reviews.id = review_citations.review_id 
  AND articles.status = 'published'
));

CREATE POLICY "Reviewers can manage their own citations"
ON public.review_citations
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.reviews 
  WHERE reviews.id = review_citations.review_id 
  AND reviews.reviewer_id = auth.uid()
));

CREATE POLICY "Admins can manage all citations"
ON public.review_citations
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_review_citations_review_id ON public.review_citations(review_id);
CREATE INDEX idx_review_citations_offsets ON public.review_citations(start_offset, end_offset);

-- Create trigger for updated_at
CREATE TRIGGER update_review_citations_updated_at
  BEFORE UPDATE ON public.review_citations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();