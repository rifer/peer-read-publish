import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, FileText } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  authors: any[];
  published_date: string | null;
  subject: string;
}

interface CitationDialogProps {
  article: Article;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CitationDialog = ({ article, open, onOpenChange }: CitationDialogProps) => {
  const [citingArticleTitle, setCitingArticleTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCitationCard, setShowCitationCard] = useState(false);
  const { toast } = useToast();

  const formatCitation = () => {
    const authors = Array.isArray(article.authors) 
      ? article.authors.map((a: any) => a.name).join(', ')
      : 'Unknown Authors';
    const date = article.published_date 
      ? new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'n.d.';
    const articleUrl = `${window.location.origin}/article/${article.id}`;
    const magazineName = 'Academic Review Platform';
    
    return `${authors}. (${date}). "${article.title}". ${magazineName}. ${article.subject}. Available at: ${articleUrl}`;
  };

  const handleSubmit = async () => {
    if (!citingArticleTitle.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the title of your article',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('article_citations')
        .insert({
          cited_article_id: article.id,
          citing_article_title: citingArticleTitle.trim(),
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast({
        title: 'Citation Created',
        description: 'Your citation has been recorded successfully',
      });

      setShowCitationCard(true);
    } catch (error: any) {
      console.error('Error creating citation:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create citation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCitation = () => {
    navigator.clipboard.writeText(formatCitation());
    toast({
      title: 'Copied!',
      description: 'Citation copied to clipboard',
    });
  };

  const handleClose = () => {
    setCitingArticleTitle('');
    setShowCitationCard(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cite This Article
          </DialogTitle>
          <DialogDescription>
            Create a citation for this article in your publication
          </DialogDescription>
        </DialogHeader>

        {!showCitationCard ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="citing-title">Your Article Title</Label>
              <Input
                id="citing-title"
                placeholder="Enter the title of your article"
                value={citingArticleTitle}
                onChange={(e) => setCitingArticleTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="rounded-lg bg-secondary p-4 space-y-2">
              <p className="text-sm font-medium">Article being cited:</p>
              <p className="text-sm text-muted-foreground">{article.title}</p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Citation'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">Your Citation:</p>
              <p className="text-sm leading-relaxed">{formatCitation()}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCitation}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Citation
              </Button>
            </div>

            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">
                This citation has been recorded and will appear in the article's citation summary.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
