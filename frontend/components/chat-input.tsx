'use client';

import { useState, useEffect } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { DirectAnswer } from './direct-answer';
import { ChartWidget } from './chart-widget';
import { MentalModelFlow } from './mental-model-flow';
import { PinnedItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage, generateSessionId } from '@/lib/api-client';
import { useChatStream } from '@/hooks/use-chat-stream';

/**
 * ChatInput Component
 * Floating chat interface that expands fullscreen with tabs and pinning functionality
 * Based on Figma Chat-Driven Trading Journal design
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
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'answer' | 'chart' | 'mental-model'>('answer');
  const [isExpanded, setIsExpanded] = useState(true);
  const [sessionId] = useState(() => generateSessionId());
  const [error, setError] = useState<string | null>(null);
  
  // Use the streaming hook
  const { content: streamingContent, state: streamState, error: streamError, startStream, reset: resetStream } = useChatStream();

  const hasMessages = conversation.length > 0;
  const isLoading = streamState === 'connecting' || streamState === 'streaming';
  
  // Current output - either the streamed content or the last conversation item
  const currentOutput = streamState === 'streaming' || streamState === 'complete' 
    ? { answer: streamingContent }
    : conversation.length > 0 ? conversation[conversation.length - 1].output : null;

  /**
   * Handle sending a message to the backend
   */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ConversationItem = {
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setError(null);

    const currentInput = input;
    setInput('');

    try {
      // Send message to backend
      const response = await sendChatMessage({
        sessionId,
        content: currentInput,
        userId: 'anonymous', // MVP: stub user ID
      });

      // Start streaming the response
      startStream(response.streamUrl);
      setIsExpanded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Failed to send message:', err);
    }
  };

  /**
   * Effect to handle stream completion - save to conversation history
   */
  useEffect(() => {
    if (streamState === 'complete' && streamingContent) {
      const assistantMessage: ConversationItem = {
        type: 'assistant',
        content: streamingContent,
        output: { answer: streamingContent },
        timestamp: new Date()
      };

      setConversation(prev => [...prev, assistantMessage]);
      onOutputGenerated({ answer: streamingContent });
    }
  }, [streamState, streamingContent, onOutputGenerated]);

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

  /**
   * Handle closing the chat - reset everything
   */
  const handleClose = () => {
    resetStream();
    setConversation([]);
    setInput('');
    setError(null);
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
    <div className={`fixed left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${
      hasMessages ? 'top-6 bottom-6 w-[calc(100vw-3rem)]' : 'bottom-6 w-full max-w-3xl px-6'
    }`}>
      <div className="border border-[#a1a1aa] rounded-[32px] bg-[#fafafa] flex flex-col h-full">
        {/* Expanded White Conversation Container - Only visible when there are messages */}
        <AnimatePresence>
          {hasMessages && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Close Button - Top Right */}
              <button
                onClick={handleClose}
                className="absolute top-6 right-6 z-10 bg-[#fca5a5] hover:bg-[#f87171] text-[#2d2d2d] rounded-lg p-2 border-2 border-black shadow-[3px_3px_0px_0px_#000000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
              >
                <X className="size-5" />
              </button>

              {/* Question Pill at Top */}
              <div className="px-6 pt-6 pb-4 bg-[#fafafa] rounded-t-[32px]">
                <div className="px-6 py-3 rounded-full border-2 border-black bg-[#d4d4d8] inline-block shadow-[3px_3px_0px_0px_#000000]">
                  <p className="text-sm text-[#2d2d2d]">{conversation.filter(item => item.type === 'user').pop()?.content}</p>
                </div>

                {/* Error Display */}
                {(error || streamError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 px-4 py-3 rounded-lg border-2 border-black bg-[#fca5a5] shadow-[3px_3px_0px_0px_#000000] flex items-start gap-3"
                  >
                    <AlertCircle className="size-5 text-[#2d2d2d] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#2d2d2d]">Connection Error</p>
                      <p className="text-xs text-[#2d2d2d]/80 mt-1">
                        {error || streamError?.message}
                      </p>
                      {streamError?.retryable && (
                        <button
                          onClick={() => {
                            setError(null);
                            const lastMessage = conversation.filter(item => item.type === 'user').pop();
                            if (lastMessage) {
                              handleSend();
                            }
                          }}
                          className="mt-2 text-xs text-[#2d2d2d] underline hover:no-underline"
                        >
                          Try Again
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Loading Indicator */}
                {(streamState === 'connecting' || (isLoading && streamState !== 'streaming')) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 px-4 py-2 rounded-lg border-2 border-black bg-[#d4c4e1]/30 shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <p className="text-xs text-[#2d2d2d]/70 flex items-center gap-2">
                      <span className="animate-pulse">●</span>
                      Connecting to agent...
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Answer Area - Full White Background */}
              <div className="flex-1 overflow-y-auto bg-white">
                <div className="h-full">
                  {activeTab === 'answer' && <DirectAnswer output={currentOutput} isStreaming={streamState === 'streaming'} />}
                  {activeTab === 'chart' && <ChartWidget output={currentOutput} onPin={handlePinChart} />}
                  {activeTab === 'mental-model' && <MentalModelFlow output={currentOutput} onPin={handlePinModel} />}
                </div>
              </div>

              {/* Tab Pills - On white background */}
              <div className="bg-white px-6 py-3 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('answer')}
                  className={`relative px-8 py-2.5 rounded-full transition-all text-sm border-2 border-black ${
                    activeTab === 'answer'
                      ? 'bg-[#d9b89c] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                      : 'bg-[#d4d4d8] text-[#2d2d2d] hover:bg-[#e5e5e5] shadow-[2px_2px_0px_0px_#000000]'
                  }`}
                >
                  Answer
                </button>
                <button
                  onClick={() => setActiveTab('chart')}
                  className={`relative px-8 py-2.5 rounded-full transition-all text-sm border-2 border-black ${
                    activeTab === 'chart'
                      ? 'bg-[#e5c9c9] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                      : 'bg-[#d4d4d8] text-[#2d2d2d] hover:bg-[#e5e5e5] shadow-[2px_2px_0px_0px_#000000]'
                  }`}
                >
                  Chart
                </button>
                <button
                  onClick={() => setActiveTab('mental-model')}
                  className={`relative px-8 py-2.5 rounded-full transition-all text-sm border-2 border-black ${
                    activeTab === 'mental-model'
                      ? 'bg-[#d4c4e1] text-[#2d2d2d] shadow-[4px_4px_0px_0px_#000000]'
                      : 'bg-[#d4d4d8] text-[#2d2d2d] hover:bg-[#e5e5e5] shadow-[2px_2px_0px_0px_#000000]'
                  }`}
                >
                  Model
                </button>
              </div>

              {/* Input Area - Below tabs on black background */}
              <div className="bg-[#18181b] px-6 pb-6 pt-3 rounded-b-[32px]">
                <div className="relative bg-[#27272a] rounded-2xl p-3 flex items-center gap-3 border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                  <div className="flex-1 flex items-center gap-2 bg-[#e5e5e5] rounded-lg px-4 py-3 border-2 border-black">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask a follow-up question..."
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
          )}
        </AnimatePresence>

        {/* Black Chat Input Box - Always at bottom, part of the container */}
        {!hasMessages && (
          <div className="p-4">
            {/* Quick Questions */}
            {!input && (
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
                      className={`relative text-xs px-4 py-2 rounded-lg ${colorClass} text-[#e5e5e5] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] border-2 border-black shadow-[3px_3px_0px_0px_#000000] whitespace-nowrap flex-shrink-0 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="relative bg-[#18181b] rounded-2xl p-3 flex items-center gap-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000] w-full max-w-3xl mx-auto shrink-0">
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
        )}
      </div>
    </div>
  );
}

