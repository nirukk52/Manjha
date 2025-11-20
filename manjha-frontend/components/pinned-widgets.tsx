'use client';

import { BarChart2, GitBranch, PinOff } from 'lucide-react';
import { PinnedItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Pinned Widgets Component
 * Displays items pinned from chat responses in a floating sidebar
 */

interface PinnedWidgetsProps {
  items: PinnedItem[];
  onRemoveItem: (id: string) => void;
}

export function PinnedWidgets({ items, onRemoveItem }: PinnedWidgetsProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-30 w-80 max-h-[calc(100vh-120px)] pointer-events-auto">
      <div className="relative bg-white rounded-2xl p-4 space-y-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center justify-between mb-2 pb-3 border-b-2 border-black">
          <div>
            <h3 className="font-black text-[#2d2d2d]">Chat Pinned Items</h3>
            <p className="text-xs text-[#5a5a5a]">from chat responses</p>
          </div>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative bg-[#c4e1d4] rounded-xl p-3 group border-2 border-black shadow-[4px_4px_0px_0px_#000000]"
              >
                {/* Unpin button at top right */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute -top-2 -right-2 p-2 rounded-lg bg-[#e5c9c9] border-2 border-black hover:bg-[#dc2626] hover:text-white transition-all shadow-[2px_2px_0px_0px_#000000] z-10"
                  title="Unpin widget"
                >
                  <PinOff className="h-3 w-3" />
                </button>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'chart' ? (
                      <BarChart2 className="size-4 text-[#2d2d2d]" />
                    ) : (
                      <GitBranch className="size-4 text-[#2d2d2d]" />
                    )}
                    <h4 className="text-sm font-bold text-[#2d2d2d]">{item.title}</h4>
                  </div>
                </div>
                
                <p className="text-xs text-[#5a5a5a] mb-2">
                  {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Mini Preview */}
                <div className="bg-white rounded-lg p-3 h-32 flex items-center justify-center border-2 border-black">
                  {item.type === 'chart' ? (
                    <BarChart2 className="size-10 text-[#2d2d2d]/40" />
                  ) : (
                    <GitBranch className="size-10 text-[#2d2d2d]/40" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

