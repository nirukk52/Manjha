'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { Button } from './ui/button';
import { DirectAnswer } from './direct-answer';
import { ChartWidget } from './chart-widget';
import { MentalModelFlow } from './mental-model-flow';
import { PinnedItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BottomSheet Component
 * Expandable bottom sheet for displaying AI responses
 * Alternative to fullscreen chat view from Figma design
 */

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  output: any;
  onPinItem: (item: PinnedItem) => void;
}

export function BottomSheet({ isOpen, onClose, output, onPinItem }: BottomSheetProps) {
  const [activeTab, setActiveTab] = useState<'answer' | 'chart' | 'mental-model'>('answer');
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePinChart = () => {
    if (!output) return;
    onPinItem({
      id: Date.now().toString(),
      type: 'chart',
      title: output.chartType || 'Chart',
      chartType: output.chartType,
      data: output,
      timestamp: new Date()
    });
  };

  const handlePinModel = () => {
    if (!output) return;
    onPinItem({
      id: Date.now().toString(),
      type: 'mental-model',
      title: 'Mental Model',
      data: output.mentalModel,
      timestamp: new Date()
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isExpanded ? 0 : 'calc(100% - 180px)' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-28 left-0 right-0"
        >
          <div className="max-w-6xl mx-auto px-6 flex flex-col gap-4">
            {/* Main Content Pane */}
            <div className="relative bg-white rounded-t-3xl overflow-hidden border-2 border-black border-b-2 shadow-[6px_6px_0px_0px_#000000]">
              {/* Header with Drag Handle */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#b4d4e1]">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
                >
                  {isExpanded ? <ChevronDown className="size-5" /> : <ChevronUp className="size-5" />}
                  <span className="text-sm">
                    {isExpanded ? 'Collapse' : 'Expand'} response
                  </span>
                </button>
                
                <div className="flex items-center gap-2">
                  {activeTab === 'chart' && (
                    <Button
                      onClick={handlePinChart}
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                    >
                      <Pin className="size-4 mr-1" />
                      Pin Chart
                    </Button>
                  )}
                  {activeTab === 'mental-model' && (
                    <Button
                      onClick={handlePinModel}
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                    >
                      <Pin className="size-4 mr-1" />
                      Pin Model
                    </Button>
                  )}
                  <Button
                    onClick={onClose}
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Content Area */}
              <div className="h-[60vh] overflow-hidden">
                {activeTab === 'answer' && <DirectAnswer output={output} />}
                {activeTab === 'chart' && <ChartWidget output={output} onPin={handlePinChart} />}
                {activeTab === 'mental-model' && <MentalModelFlow output={output} onPin={handlePinModel} />}
              </div>
            </div>

            {/* Separated Tab Pills */}
            <div className="flex items-center justify-center gap-3 pb-2">
              <button
                onClick={() => setActiveTab('answer')}
                className={`relative px-8 py-3 rounded-full transition-all text-sm border-2 border-black ${
                  activeTab === 'answer'
                    ? 'bg-[#d9b89c] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                    : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                Answer
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`relative px-8 py-3 rounded-full transition-all text-sm border-2 border-black ${
                  activeTab === 'chart'
                    ? 'bg-[#e5c9c9] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                    : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                Chart
              </button>
              <button
                onClick={() => setActiveTab('mental-model')}
                className={`relative px-8 py-3 rounded-full transition-all text-sm border-2 border-black ${
                  activeTab === 'mental-model'
                    ? 'bg-[#d4c4e1] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                    : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'
                }`}
              >
                Model
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

