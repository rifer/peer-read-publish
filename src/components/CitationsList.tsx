import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Trash2 } from 'lucide-react';

interface Citation {
  id: string;
  selected_text: string;
  note: string;
  start_offset: number;
  end_offset: number;
}

interface CitationsListProps {
  citations: Citation[];
  onDeleteCitation?: (citationId: string) => void;
  onHighlightCitation?: (citation: Citation) => void;
  canEdit?: boolean;
}

export const CitationsList = ({
  citations,
  onDeleteCitation,
  onHighlightCitation,
  canEdit = false,
}: CitationsListProps) => {
  if (citations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground flex items-center space-x-2">
        <Quote className="h-4 w-4" />
        <span>Citations ({citations.length})</span>
      </h4>
      
      {citations.map((citation, index) => (
        <Card key={citation.id} className="border-l-4 border-l-primary">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div 
                className="bg-secondary p-2 rounded text-xs italic cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => onHighlightCitation?.(citation)}
                title="Click to highlight in article"
              >
                "{citation.selected_text}"
              </div>
              
              <div className="text-sm text-foreground">
                <span className="font-medium text-xs text-muted-foreground">
                  Note {index + 1}:
                </span>
                <p className="mt-1">{citation.note}</p>
              </div>
              
              {canEdit && onDeleteCitation && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCitation(citation.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};