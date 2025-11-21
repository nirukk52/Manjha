'use client';

import { ScrollArea } from './ui/scroll-area';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

/**
 * Direct Answer Component
 * Displays AI-generated text responses in the chat interface with streaming support
 * 
 * Why this exists: Shows real-time streaming responses from the backend agents
 * with smooth scrolling and formatted content.
 */

interface DirectAnswerProps {
  output: any;
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

  // Split content by paragraphs for formatting
  const paragraphs = output.answer.split('\n\n').filter((p: string) => p.trim());

  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="p-6 max-w-3xl">
        <div className="prose prose-lg">
          {paragraphs.map((paragraph: string, i: number) => {
            // Check for key insights
            if (paragraph.includes('Key insight') || paragraph.includes('Important')) {
              return (
                <div key={i} className="bg-[#d4c4e1]/30 border-2 border-[#d4c4e1] rounded-lg p-4 my-4">
                  <div className="flex gap-3">
                    <AlertCircle className="size-5 text-[#2d2d2d] flex-shrink-0 mt-0.5" />
                    <p className="text-[#2d2d2d]">{paragraph}</p>
                  </div>
                </div>
              );
            }

            return (
              <p key={i} className="text-[#2d2d2d]/80 mb-4">
                {paragraph}
              </p>
            );
          })}

          {/* Streaming indicator - show cursor while content is being generated */}
          {isStreaming && (
            <span className="inline-block w-2 h-5 bg-[#d4c4e1] animate-pulse ml-1" />
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

