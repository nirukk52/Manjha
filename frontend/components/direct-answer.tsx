'use client';

import { ScrollArea } from './ui/scroll-area';
import { AlertCircle } from 'lucide-react';

/**
 * Direct Answer Component
 * Displays AI-generated text responses in the chat interface
 */

interface DirectAnswerProps {
  output: any;
}

export function DirectAnswer({ output }: DirectAnswerProps) {
  if (!output) {
    return (
      <div className="h-full flex items-center justify-center text-[#5a5a5a]">
        <div className="text-center">
          <p>Ask a question to see the analysis</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-3xl">
        <div className="prose prose-lg">
          {output.answer.split('\n\n').map((paragraph: string, i: number) => {
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
        </div>
      </div>
    </ScrollArea>
  );
}

