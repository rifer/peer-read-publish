import { useState, useCallback, useRef, useEffect } from 'react';

interface TextSelection {
  text: string;
  startOffset: number;
  endOffset: number;
  contextBefore: string;
  contextAfter: string;
}

interface UseTextSelectionOptions {
  onSelectionMade?: (selection: TextSelection) => void;
  enableSelection?: boolean;
}

export const useTextSelection = (options: UseTextSelectionOptions = {}) => {
  const { onSelectionMade, enableSelection = true } = options;
  const [currentSelection, setCurrentSelection] = useState<TextSelection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelection = useCallback(() => {
    if (!enableSelection || !containerRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setCurrentSelection(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (!selectedText || !containerRef.current.contains(range.commonAncestorContainer)) {
      setCurrentSelection(null);
      return;
    }

    // Get the full text content to calculate offsets
    const fullText = containerRef.current.textContent || '';
    
    // Create a range for the entire container to calculate offset
    const containerRange = document.createRange();
    containerRange.selectNodeContents(containerRef.current);
    
    // Calculate start offset
    const startRange = containerRange.cloneRange();
    startRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = startRange.toString().length;
    
    // Calculate end offset
    const endOffset = startOffset + selectedText.length;

    // Get context (50 characters before and after)
    const contextBefore = fullText.substring(Math.max(0, startOffset - 50), startOffset);
    const contextAfter = fullText.substring(endOffset, Math.min(fullText.length, endOffset + 50));

    const selectionData: TextSelection = {
      text: selectedText,
      startOffset,
      endOffset,
      contextBefore,
      contextAfter,
    };

    setCurrentSelection(selectionData);
    onSelectionMade?.(selectionData);
  }, [enableSelection, onSelectionMade]);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setCurrentSelection(null);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableSelection) return;

    container.addEventListener('mouseup', handleSelection);
    container.addEventListener('touchend', handleSelection);
    
    // Clear selection when clicking outside (but not when tooltip is visible)
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTooltip = target instanceof Element && target.closest('[data-tooltip]');
      if (!container.contains(target) && !isInsideTooltip) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      container.removeEventListener('mouseup', handleSelection);
      container.removeEventListener('touchend', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleSelection, clearSelection, enableSelection]);

  return {
    containerRef,
    currentSelection,
    clearSelection,
  };
};