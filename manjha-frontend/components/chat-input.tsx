'use client';

import { useState } from 'react';
import { Send, X, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { Button } from './ui/button';
import { generateResponse } from '@/utils/responseGenerator';
import { DirectAnswer } from './direct-answer';
import { ChartWidget } from './chart-widget';
import { MentalModelFlow } from './mental-model-flow';
import { PinnedItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ChatInput Component
 * Floating chat interface with expandable responses, tabs, and pinning functionality
 */

interface ChatInputProps {
  onOutputGenerated: (output: any) => void;
  onPinItem: (item: PinnedItem) => void;
}

interface ConversationItem {
  type: 'user' | 'assistant';
  content: string;
  output?: any;
  timestamp: Date;
}

export function ChatInput({ onOutputGenerated, onPinItem }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'answer' | 'chart' | 'mental-model'>('answer');
  const [isExpanded, setIsExpanded] = useState(true);

  const hasMessages = conversation.length > 0;
  const currentOutput = conversation.length > 0 ? conversation[conversation.length - 1].output : null;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationItem = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    const currentInput = input;
    setInput('');

    // Generate AI response
    setTimeout(() => {
      const response = generateResponse(currentInput);
      
      const assistantMessage: ConversationItem = {
        type: 'assistant',
        content: response.answer || 'Response generated',
        output: response,
        timestamp: new Date()
      };

      setConversation(prev => [...prev, assistantMessage]);
      onOutputGenerated(response);
      setIsLoading(false);
      setIsExpanded(true);
    }, 500);
  };

  const handlePinChart = () => {
    if (!currentOutput) return;
    onPinItem({
      id: Date.now().toString(),
      type: 'chart',
      title: currentOutput.chartType || 'Chart',
      chartType: currentOutput.chartType,
      data: currentOutput,
      timestamp: new Date()
    });
  };

  const handlePinModel = () => {
    if (!currentOutput) return;
    onPinItem({
      id: Date.now().toString(),
      type: 'mental-model',
      title: 'Mental Model',
      data: currentOutput.mentalModel,
      timestamp: new Date()
    });
  };

  const handleClose = () => {
    setConversation([]);
    setInput('');
  };

  const quickQuestions = [
    "Why is my P&L negative this month?",
    "What's my win rate by sector?",
    "Show my biggest losing streaks",
    "Am I overtrading on impulsive setups?",
    "Which time of day am I most profitable?",
    "How does my planned vs impulsive trade performance compare?",
    "What's my average hold time for winners vs losers?",
    "Show my risk-reward ratio trends"
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-6">
      <motion.div
        initial={false}
        animate={{
          height: hasMessages ? 'calc(100vh - 3rem)' : 'auto',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="border-2 border-[#a1a1aa] rounded-[32px] bg-[#fafafa] mt-4 flex flex-col overflow-hidden"
      >
        {/* Conversation Area - Only show when there are messages */}
        <AnimatePresence>
          {hasMessages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-[#b4d4e1]">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-[#2d2d2d] hover:text-[#18181b] transition-colors"
                >
                  {isExpanded ? <ChevronDown className="size-5" /> : <ChevronUp className="size-5" />}
                  <span className="text-sm font-black">
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
                    onClick={handleClose}
                    size="sm"
                    variant="ghost"
                    className="text-[#2d2d2d] hover:text-[#18181b]"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Content Area */}
              {isExpanded && (
                <div className="flex-1 flex flex-col overflow-hidden bg-white">
                  {/* User Message */}
                  <div className="p-6 bg-[#fafafa]">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-4 py-3 rounded-2xl border-2 border-black bg-[#3f3f46] text-white shadow-[3px_3px_0px_0px_#000000]">
                        <p className="text-sm">{conversation.filter(item => item.type === 'user').pop()?.content}</p>
                      </div>
                    </div>
                  </div>

                  {/* Response Content Box */}
                  <div className="flex-1 overflow-y-auto bg-white">
                    {activeTab === 'answer' && <DirectAnswer output={currentOutput} />}
                    {activeTab === 'chart' && <ChartWidget output={currentOutput} onPin={handlePinChart} />}
                    {activeTab === 'mental-model' && <MentalModelFlow output={currentOutput} onPin={handlePinModel} />}
                  </div>

                  {/* Tab Pills at Bottom */}
                  <div className="flex items-center justify-center gap-3 bg-[#fafafa] py-3">
                    <button
                      onClick={() => setActiveTab('answer')}
                      className={`relative px-8 py-3 rounded-full transition-all text-sm border-2 border-black font-black ${
                        activeTab === 'answer'
                          ? 'bg-[#d9b89c] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                          : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'
                      }`}
                    >
                      Answer
                    </button>
                    <button
                      onClick={() => setActiveTab('chart')}
                      className={`relative px-8 py-3 rounded-full transition-all text-sm border-2 border-black font-black ${
                        activeTab === 'chart'
                          ? 'bg-[#e5c9c9] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                          : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'
                      }`}
                    >
                      Chart
                    </button>
                    <button
                      onClick={() => setActiveTab('mental-model')}
                      className={`relative px-8 py-3 rounded-full transition-all text-sm border-2 border-black font-black ${
                        activeTab === 'mental-model'
                          ? 'bg-[#d4c4e1] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                          : 'bg-white text-[#5a5a5a] hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_#000000]'
                      }`}
                    >
                      Model
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Section - Always visible at bottom */}
        <div className="p-4">
          {/* Quick Questions */}
          {!input && !hasMessages && (
            <div className="mb-2 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 min-w-max px-1">
                {quickQuestions.map((q, i) => {
                  const colors = [
                    'bg-[#3f3f46]',
                    'bg-[#52525b]',
                    'bg-[#27272a]',
                    'bg-[#71717a]',
                    'bg-[#3f3f46]',
                    'bg-[#52525b]',
                    'bg-[#44403c]',
                    'bg-[#27272a]',
                  ];
                  const colorClass = colors[i % colors.length];
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className={`relative text-xs px-4 py-2 rounded-lg ${colorClass} text-[#e5e5e5] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] border-2 border-black shadow-[3px_3px_0px_0px_#000000] whitespace-nowrap flex-shrink-0 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none font-medium`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="relative bg-[#18181b] rounded-2xl p-3 flex items-center gap-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            <div className="flex-1 flex items-center gap-2 bg-[#e5e5e5] rounded-lg px-4 py-3 border-2 border-black">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Why is my P&L negative this month, and what should I fix?"
                className="flex-1 bg-transparent border-none outline-none text-[#2d2d2d] placeholder:text-[#5a5a5a] font-mono"
                disabled={isLoading}
              />
            </div>
            <Button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-[#e5e5e5] h-12 px-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <Send className="size-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

