import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote, X } from 'lucide-react';

interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  contextBefore: string;
  contextAfter: string;
}

interface TextSelectionTooltipProps {
  selection: TextSelection;
  onAddCitation: (note: string) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export const TextSelectionTooltip = ({
  selection,
  onAddCitation,
  onCancel,
  isVisible,
}: TextSelectionTooltipProps) => {
  const [note, setNote] = useState('');

  if (!isVisible) return null;

  const handleSubmit = () => {
    if (note.trim()) {
      onAddCitation(note.trim());
      setNote('');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <Card 
        className="max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        data-tooltip="true"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Quote className="h-4 w-4" />
              <span>Add Citation</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Selected Text:
            </label>
            <div className="bg-secondary p-2 rounded text-xs italic">
              "{selection.text}"
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Your Note:
            </label>
            <Textarea
              placeholder="Add your comment about this selection..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] text-sm"
              autoFocus
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={!note.trim()}
              size="sm"
              className="flex-1"
            >
              Add Citation
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};