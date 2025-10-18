import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, FileText, Link, ExternalLink, ArrowLeft } from 'lucide-react';

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

type CitationFormat = 'APA' | 'Harvard' | 'ISO 690';

export const CitationDialog = ({ article, open, onOpenChange }: CitationDialogProps) => {
  const [citingArticleTitle, setCitingArticleTitle] = useState('');
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('APA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCitationCard, setShowCitationCard] = useState(false);
  const { toast } = useToast();

  const formatCitation = () => {
    const year = article.published_date 
      ? new Date(article.published_date).getFullYear()
      : 'n.d.';
    const articleUrl = `${window.location.origin}/article/${article.id}`;
    const magazineName = 'Academic Review Platform';
    const accessDate = new Date();
    
    switch (citationFormat) {
      case 'APA':
        // APA format: Lastname, I. [Firstname]. (Year). Title. Journal, volume(issue), pages. URL
        const apaAuthors = Array.isArray(article.authors)
          ? article.authors.map((a: any) => {
              const name = typeof a === 'string' ? a : a.name;
              const parts = name.split(' ');
              const lastName = parts[parts.length - 1];
              const firstNames = parts.slice(0, -1);
              const initials = firstNames.map(n => n.charAt(0).toUpperCase()).join('. ');
              const fullFirstName = firstNames.join(' ');
              return `${lastName}, ${initials}. [${fullFirstName}]`;
            }).join(', ')
          : 'Unknown, A. [Author]';
        return `${apaAuthors}. (${year}). ${article.title}. ${magazineName}. ${articleUrl}`;
      
      case 'Harvard':
        // Harvard format: Lastname, I. (year) 'Title', Journal, vol.(no.), pp. pages. Disponible en: URL (Consultado: date).
        const harvardAuthors = Array.isArray(article.authors)
          ? article.authors.map((a: any) => {
              const name = typeof a === 'string' ? a : a.name;
              const parts = name.split(' ');
              const lastName = parts[parts.length - 1];
              const initials = parts.slice(0, -1).map(n => n.charAt(0).toUpperCase() + '.').join(' ');
              return `${lastName}, ${initials}`;
            }).join(' y ')
          : 'Unknown, A.';
        const day = accessDate.getDate();
        const monthES = accessDate.toLocaleDateString('es-ES', { month: 'long' });
        const accessYear = accessDate.getFullYear();
        return `${harvardAuthors} (${year}) '${article.title}', ${magazineName}. Disponible en: ${articleUrl} (Consultado: ${day} de ${monthES} de ${accessYear}).`;
      
      case 'ISO 690':
        // ISO 690 format: LASTNAME, Firstname. Title. En: Journal [en línea]. Year. [consulta: date]. Disponible en: URL
        const iso690Authors = Array.isArray(article.authors)
          ? article.authors.map((a: any) => {
              const name = typeof a === 'string' ? a : a.name;
              const parts = name.split(' ');
              const lastName = parts[parts.length - 1].toUpperCase();
              const firstName = parts.slice(0, -1).join(' ');
              return `${lastName}, ${firstName}`;
            }).join(', ')
          : 'UNKNOWN, Author';
        const isoDay = accessDate.getDate();
        const isoMonth = accessDate.toLocaleDateString('es-ES', { month: 'long' });
        const isoYear = accessDate.getFullYear();
        return `${iso690Authors}. ${article.title}. En: ${magazineName} [en línea]. ${year}. [consulta: ${isoDay} de ${isoMonth} de ${isoYear}]. Disponible en: ${articleUrl}`;
      
      default:
        return `${article.title}. ${articleUrl}`;
    }
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

  const copyLink = () => {
    const articleUrl = `${window.location.origin}/article/${article.id}`;
    navigator.clipboard.writeText(articleUrl);
    toast({
      title: 'Copied!',
      description: 'Article link copied to clipboard',
    });
  };

  const openWithZotero = () => {
    const authors = Array.isArray(article.authors) 
      ? article.authors.map((a: any) => typeof a === 'string' ? a : a.name)
      : ['Unknown Author'];
    const year = article.published_date ? new Date(article.published_date).getFullYear() : '';
    const articleUrl = `${window.location.origin}/article/${article.id}`;
    const magazineName = 'Academic Review Platform';
    
    // Create RIS format content
    let risContent = 'TY  - JOUR\n'; // Journal Article
    
    // Add authors
    authors.forEach(author => {
      risContent += `AU  - ${author}\n`;
    });
    
    // Add title
    risContent += `TI  - ${article.title}\n`;
    
    // Add journal name
    risContent += `JO  - ${magazineName}\n`;
    
    // Add year
    if (year) {
      risContent += `PY  - ${year}\n`;
    }
    
    // Add URL
    risContent += `UR  - ${articleUrl}\n`;
    
    // Add subject as keyword
    if (article.subject) {
      risContent += `KW  - ${article.subject}\n`;
    }
    
    // End of reference
    risContent += 'ER  - \n';
    
    // Create blob and download
    const blob = new Blob([risContent], { type: 'application/x-research-info-systems' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${article.title.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}.ris`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'RIS File Downloaded',
      description: 'Import the .ris file into Zotero',
    });
  };

  const openWithMendeley = () => {
    const articleUrl = `${window.location.origin}/article/${article.id}`;
    const mendeleyUrl = `mendeley://view?url=${encodeURIComponent(articleUrl)}`;
    
    window.location.href = mendeleyUrl;
    
    toast({
      title: 'Opening Mendeley',
      description: 'If Mendeley is installed, it should open now',
    });
  };

  const handleClose = () => {
    setCitingArticleTitle('');
    setCitationFormat('APA');
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

            <div className="space-y-2">
              <Label htmlFor="citation-format">Citation Format</Label>
              <Select value={citationFormat} onValueChange={(value) => setCitationFormat(value as CitationFormat)}>
                <SelectTrigger id="citation-format">
                  <SelectValue placeholder="Select citation format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="Harvard">Harvard</SelectItem>
                  <SelectItem value="ISO 690">ISO 690</SelectItem>
                </SelectContent>
              </Select>
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
              <p className="text-sm font-medium">Your Citation ({citationFormat}):</p>
              <p className="text-sm leading-relaxed break-words">{formatCitation()}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openWithZotero}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open with Zotero
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openWithMendeley}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open with Mendeley
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCitation}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="w-full"
              >
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>

            <div className="rounded-lg bg-secondary p-3">
              <p className="text-xs text-muted-foreground">
                This citation has been recorded and will appear in the article's citation summary.
              </p>
            </div>

            <DialogFooter className="flex-row justify-between">
              <Button
                variant="outline"
                onClick={() => setShowCitationCard(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
