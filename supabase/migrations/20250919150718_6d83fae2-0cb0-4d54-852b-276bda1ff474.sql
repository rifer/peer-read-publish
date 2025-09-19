-- Create enum for article status
CREATE TYPE public.article_status AS ENUM ('draft', 'under_review', 'published', 'rejected');

-- Create enum for review recommendations  
CREATE TYPE public.review_recommendation AS ENUM ('accept', 'minor_revisions', 'major_revisions', 'reject');

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors JSONB NOT NULL DEFAULT '[]',
  abstract TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  published_date DATE,
  status article_status NOT NULL DEFAULT 'draft',
  submitter_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  recommendation review_recommendation,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, reviewer_id) -- Prevent duplicate reviews from same reviewer
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Articles policies
CREATE POLICY "Anyone can view published articles"
ON public.articles
FOR SELECT
USING (status = 'published');

CREATE POLICY "Writers can create articles"
ON public.articles  
FOR INSERT
WITH CHECK (auth.uid() = submitter_id AND has_role(auth.uid(), 'writer'));

CREATE POLICY "Authors can update their own articles"
ON public.articles
FOR UPDATE
USING (auth.uid() = submitter_id);

CREATE POLICY "Admins can manage all articles"
ON public.articles
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Reviews policies  
CREATE POLICY "Anyone can view reviews for published articles"
ON public.reviews
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.articles 
  WHERE articles.id = reviews.article_id 
  AND articles.status = 'published'
));

CREATE POLICY "Reviewers can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() = reviewer_id AND has_role(auth.uid(), 'reviewer'));

CREATE POLICY "Reviewers can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_subject ON public.articles(subject);
CREATE INDEX idx_reviews_article_id ON public.reviews(article_id);
CREATE INDEX idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews  
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample article data
INSERT INTO public.articles (id, title, authors, abstract, content, subject, published_date, status, submitter_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 
'Novel Approaches to Quantum Computing Error Correction',
'["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Alex Rodriguez"]',
'This paper presents innovative methods for quantum error correction using topological quantum codes. Our approach demonstrates a 40% improvement in error correction efficiency compared to traditional surface codes.',
'## Introduction

Quantum computing represents one of the most promising frontiers in computational science. However, quantum systems are inherently fragile and susceptible to various forms of noise and decoherence. This paper addresses the critical challenge of quantum error correction through novel topological approaches.

## Methodology  

Our research employs a combination of theoretical analysis and experimental validation using superconducting quantum processors. We developed a new class of topological quantum codes that leverage the geometric properties of quantum states to provide enhanced error correction capabilities.

## Results

The experimental results demonstrate significant improvements in error correction efficiency:
- 40% reduction in logical error rates
- 25% improvement in coherence times  
- Scalable architecture supporting up to 100 qubits

## Conclusion

Our findings suggest that topological quantum error correction could be a key enabler for practical quantum computing applications. Future work will focus on scaling these methods to larger quantum systems.',
'Quantum Physics',
'2024-01-15',
'published',
'00000000-0000-0000-0000-000000000000');

-- Insert sample reviews (using placeholder UUID for reviewer_id)
INSERT INTO public.reviews (article_id, reviewer_id, rating, content, recommendation) VALUES
('550e8400-e29b-41d4-a716-446655440000', '11111111-1111-1111-1111-111111111111', 5, 
'This is an excellent contribution to the field of quantum error correction. The theoretical framework is sound, and the experimental validation is comprehensive. The 40% improvement in error correction efficiency is particularly impressive and could have significant implications for practical quantum computing.',
'accept'),
('550e8400-e29b-41d4-a716-446655440000', '22222222-2222-2222-2222-222222222222', 4,
'The paper presents solid work with good experimental results. However, I suggest the authors provide more detailed analysis of the scalability limitations and compare their approach with recent developments in surface code implementations. The methodology section could benefit from additional clarity regarding the experimental setup.',
'minor_revisions');