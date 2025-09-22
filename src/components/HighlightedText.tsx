import { useEffect, useState } from 'react';

interface Citation {
  id: string;
  selected_text: string;
  start_offset: number;
  end_offset: number;
  note: string;
}

interface HighlightedTextProps {
  content: string;
  citations: Citation[];
  highlightedCitationId?: string;
  onCitationClick?: (citation: Citation) => void;
}

export const HighlightedText = ({
  content,
  citations,
  highlightedCitationId,
  onCitationClick,
}: HighlightedTextProps) => {
  const [processedContent, setProcessedContent] = useState('');

  useEffect(() => {
    // First, process the markdown-like content into HTML
    let htmlContent = content;
    
    // Convert markdown headers to HTML
    htmlContent = htmlContent.replace(/^##\s+(.+)$/gm, '<h2 class="text-xl font-semibold text-foreground mt-6 mb-3">$1</h2>');
    
    // Convert bullet points to list items
    htmlContent = htmlContent.replace(/^-\s+(.+)$/gm, '<li class="text-foreground ml-4">$1</li>');
    
    // Convert paragraphs (non-empty lines that aren't headers or list items)
    htmlContent = htmlContent.split('\n').map(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';
      if (trimmedLine.startsWith('<h2') || trimmedLine.startsWith('<li')) return trimmedLine;
      return `<p class="text-foreground mb-4 leading-relaxed">${trimmedLine}</p>`;
    }).join('\n');

    if (!citations.length) {
      setProcessedContent(htmlContent);
      return;
    }

    // Now apply citations to the processed HTML
    // For simplicity, we'll work with the text content for offset calculations
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const textContent = tempDiv.textContent || '';

    // Sort citations by start offset to process them in order
    const sortedCitations = [...citations].sort((a, b) => a.start_offset - b.start_offset);
    
    let result = htmlContent;
    let offset = 0;

    sortedCitations.forEach((citation) => {
      // Find the citation text in the HTML content
      const citationTextIndex = textContent.indexOf(citation.selected_text, citation.start_offset);
      if (citationTextIndex === -1) return;

      const isHighlighted = highlightedCitationId === citation.id;
      const highlightClass = isHighlighted 
        ? 'bg-yellow-200 border-yellow-400 border-2 rounded px-1' 
        : 'bg-blue-100 hover:bg-blue-200 border-b-2 border-blue-300 cursor-pointer';
      
      // Create the highlighted span
      const highlightedSpan = `<span 
        class="${highlightClass} transition-colors duration-200" 
        data-citation-id="${citation.id}"
        title="${citation.note}"
      >${citation.selected_text}</span>`;
      
      // Replace the first occurrence of the citation text
      result = result.replace(citation.selected_text, highlightedSpan);
    });

    setProcessedContent(result);
  }, [content, citations, highlightedCitationId]);

  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const citationId = target.getAttribute('data-citation-id');
    
    if (citationId && onCitationClick) {
      const citation = citations.find(c => c.id === citationId);
      if (citation) {
        onCitationClick(citation);
      }
    }
  };

  return (
    <div 
      className="prose prose-gray max-w-none"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};