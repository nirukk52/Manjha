'use client';

import { ScrollArea } from './ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { MarkdownRenderer } from './markdown-renderer';

/**
 * Direct Answer Component
 * Displays AI-generated text responses in the chat interface with streaming support
 * 
 * Why this exists: Shows real-time streaming responses from the backend agents
 * with smooth scrolling and markdown-formatted content.
 */

interface DirectAnswerProps {
  output: { answer?: string } | null;
  isStreaming?: boolean;
}

export function DirectAnswer({ output, isStreaming = false }: DirectAnswerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as content streams in
  useEffect(() => {
    if (scrollRef.current && isStreaming) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output?.answer, isStreaming]);

  if (!output || !output.answer) {
    return (
      <div className="h-full flex items-center justify-center text-[#5a5a5a]">
        <div className="text-center">
          {isStreaming ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-8 animate-spin text-[#d4c4e1]" />
              <p className="text-sm">Analyzing your question...</p>
            </div>
          ) : (
            <p>Ask a question to see the analysis</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="p-6 max-w-3xl">
        <MarkdownRenderer content={output.answer} />
        
        {/* Streaming indicator */}
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-[#d4c4e1] animate-pulse ml-1" />
        )}
      </div>
    </ScrollArea>
  );
}

