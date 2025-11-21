'use client';

import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { X, BarChart2, GitBranch } from 'lucide-react';
import { PinnedItem } from '@/types';

/**
 * PinnedBoard Component
 * Alternative pinned items display format from Figma design
 * Shows pinned charts and models in a board-style layout
 */

interface PinnedBoardProps {
  items: PinnedItem[];
  onRemoveItem: (id: string) => void;
}

export function PinnedBoard({ items, onRemoveItem }: PinnedBoardProps) {
  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-foreground">Pinned Insights</h3>
        <p className="text-sm text-muted-foreground">{items.length} items saved</p>
      </div>

      {/* Pinned Items */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Pin charts and models</p>
              <p className="text-sm">from the output tabs</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-muted border border-border rounded-lg p-3 hover:bg-secondary/30 transition-colors group shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'chart' ? (
                      <BarChart2 className="size-4 text-accent" />
                    ) : (
                      <GitBranch className="size-4 text-primary" />
                    )}
                    <h4 className="text-sm text-foreground">{item.title}</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Mini Preview */}
                <div className="mt-3 bg-card rounded p-2 h-24 flex items-center justify-center text-muted-foreground border border-border">
                  {item.type === 'chart' ? (
                    <BarChart2 className="size-8" />
                  ) : (
                    <GitBranch className="size-8" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

