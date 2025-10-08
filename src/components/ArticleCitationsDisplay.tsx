import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from 'lucide-react';

interface Citation {
  id: string;
  citing_article_title: string;
  created_at: string;
}

interface ArticleCitationsDisplayProps {
  articleId: string;
}

export const ArticleCitationsDisplay = ({ articleId }: ArticleCitationsDisplayProps) => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitations();
  }, [articleId]);

  const fetchCitations = async () => {
    try {
      const { data, error } = await supabase
        .from('article_citations')
        .select('id, citing_article_title, created_at')
        .eq('cited_article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCitations(data || []);
    } catch (error) {
      console.error('Error fetching citations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (citations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5" />
          Citations ({citations.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This article has been cited in the following publications:
        </p>
        <div className="space-y-2">
          {citations.map((citation) => (
            <div
              key={citation.id}
              className="rounded-lg border bg-card p-3"
            >
              <p className="text-sm font-medium">{citation.citing_article_title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cited on {new Date(citation.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
