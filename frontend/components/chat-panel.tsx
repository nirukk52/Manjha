'use client';

import { useState, useEffect } from 'react';
import { Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { DirectAnswer } from './direct-answer';
import { ChartWidget } from './chart-widget';
import { MentalModelFlow } from './mental-model-flow';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useChatStream } from '@/hooks/use-chat-stream';
import { sendChatMessage, generateSessionId } from '@/lib/api-client';
import { Connector } from '@/lib/types';

/**
 * Gets or creates a persistent device ID for tracking user sessions
 * Uses cryptographically secure random UUID to prevent collisions
 */
function getDeviceId(): string {
  const STORAGE_KEY = 'manjha_device_id';
  
  if (typeof window === 'undefined') return 'server';
  
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    deviceId = `device_${crypto.randomUUID()}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Chat Panel Component
 * Full-page chat interface with connectors and expandable conversation
 */

interface ConversationItem {
  type: 'user' | 'assistant';
  content: string;
  output?: any;
  timestamp: Date;
}

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'answer' | 'chart' | 'mental-model'>('answer');
  const [selectedConnectors, setSelectedConnectors] = useState<string[]>([]);
  const [sessionId] = useState(() => generateSessionId());
  const [showZerodhaAuth, setShowZerodhaAuth] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [connectorStatus, setConnectorStatus] = useState<Record<string, 'connected' | 'not_connected'>>({});
  const [userId] = useState(() => getDeviceId()); // Get consistent userId
  
  const { content, state, startStream, reset } = useChatStream();
  const isLoading = state === 'connecting' || state === 'streaming';

  const hasMessages = conversation.length > 0;
  
  // FIX: Wrap streaming content in expected format for DirectAnswer
  // ChatInput does this - ChatPanel was missing it
  const currentOutput = state === 'streaming' || state === 'complete' 
    ? { answer: content }
    : conversation.length > 0 ? conversation[conversation.length - 1].output : null;

  // Check Zerodha connection status on page load
  useEffect(() => {
    const checkZerodhaStatus = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiBaseUrl}/zerodha/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId: userId }),
        });
        const status = await response.json();
        
        if (status.isConnected) {
          console.log('[Chat] Zerodha already connected:', status.userName);
          setConnectorStatus(prev => ({ ...prev, [Connector.ZERODHA]: 'connected' }));
        }
      } catch (error) {
        console.log('[Chat] Could not check Zerodha status');
      }
    };
    
    checkZerodhaStatus();
  }, [userId]);

  // Check if user just came back from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    
    if (connected === 'true') {
      console.log('[Chat] OAuth successful!');
      setConnectorStatus(prev => ({ ...prev, [Connector.ZERODHA]: 'connected' }));
      
      // Add Zerodha to selected connectors if not already there
      if (!selectedConnectors.includes(Connector.ZERODHA)) {
        setSelectedConnectors(prev => [...prev, Connector.ZERODHA]);
      }
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    
    if (error) {
      console.error('[Chat] OAuth failed:', error);
      alert('Failed to connect to Zerodha. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const currentInput = input.trim();

    // Add user message to conversation
    const userMessage: ConversationItem = {
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);
    setInput('');
    reset();

    try {
      // Send message to backend
      const response = await sendChatMessage({
        sessionId,
        content: currentInput,
        userId,
        deviceId: userId, // deviceId is the same as userId for now
        selectedConnectors: selectedConnectors.length > 0 ? selectedConnectors : undefined,
      });

      // Start streaming response
      startStream(response.streamUrl);
      
      // Add assistant message placeholder
      const assistantMessage: ConversationItem = {
        type: 'assistant',
        content: '', // Will be populated by stream
        timestamp: new Date()
      };
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ConversationItem = {
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setConversation(prev => [...prev, errorMessage]);
    }
  };

  // Update the last assistant message with streamed content
  if (content && conversation.length > 0 && conversation[conversation.length - 1].type === 'assistant') {
    const updatedConversation = [...conversation];
    updatedConversation[updatedConversation.length - 1].content = content;
    if (JSON.stringify(updatedConversation) !== JSON.stringify(conversation)) {
      setConversation(updatedConversation);
    }
  }

  const handleZerodhaConnect = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      
      // Get OAuth login URL from backend
      const response = await fetch(`${apiBaseUrl}/zerodha/oauth/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: userId }),
      });
      
      const result = await response.json();
      
      if (result.loginUrl) {
        console.log('[Chat] Opening Zerodha OAuth:', result.loginUrl);
        // Open OAuth popup - will redirect back to /chat?connected=true on success
        window.open(result.loginUrl, '_blank', 'width=600,height=700');
        setShowZerodhaAuth(false);
      } else {
        console.error('[Chat] No Zerodha login URL received');
        alert('Failed to get Zerodha login URL. Please try again.');
      }
    } catch (error) {
      console.error('[Chat] Error initiating Zerodha OAuth:', error);
      alert('Failed to connect to Zerodha. Please try again.');
    }
  };

  const handleConnectorClick = async (connector: string) => {
    // If clicking Zerodha and not connected, show auth popup
    if (connector === Connector.ZERODHA && connectorStatus[Connector.ZERODHA] !== 'connected') {
      setShowZerodhaAuth(true);
      return;
    }
    
    if (!selectedConnectors.includes(connector)) {
      setSelectedConnectors(prev => [...prev, connector]);
    }
  };

  const handleRemoveConnector = (connector: string) => {
    setSelectedConnectors(prev => prev.filter(c => c !== connector));
  };

  const quickQuestions = [
    "Create a trigger to check affected stocks after a new Trump tweet",
    "Build a strategy: buy tech dips when VIX spikes above 25",
    "Show me which setups have the highest win rate this quarter",
    "Alert me when I break my max loss rule or revenge trade",
    "What's the correlation between my trade timing and P&L?",
    "Create a discipline flow: no trades after 2 consecutive losses",
    "Analyze my emotional patterns vs winning trades",
    "Build a risk filter for earnings week volatility"
  ];

  return (
    <>
      {/* Zerodha Auth Popup */}
      {showZerodhaAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowZerodhaAuth(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 border-2 border-black shadow-[8px_8px_0px_0px_#000000]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Connect to Zerodha</h2>
            <p className="text-gray-600 mb-6">
              Connect your Zerodha account to access your holdings, balance, and trading data.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowZerodhaAuth(false)}
                className="flex-1 px-6 py-3 border-2 border-black rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleZerodhaConnect}
                className="flex-1 px-6 py-3 bg-[#387ED1] text-white border-2 border-black rounded-lg hover:bg-[#2d6bb5] shadow-[4px_4px_0px_0px_#000000]"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="min-h-screen bg-[#d4d4d8] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="chat-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#chat-grid)" />
        </svg>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="w-10 h-10 bg-[#18181b] border-3 border-black rounded-lg flex items-center justify-center font-black text-white text-xl">
            M
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-lg text-[#18181b] hover:text-[#52525b] transition-colors px-4 py-2 rounded-lg hover:bg-white/50 border-2 border-transparent hover:border-black"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-lg text-[#18181b] hover:text-[#52525b] transition-colors px-4 py-2 rounded-lg hover:bg-white/50 border-2 border-transparent hover:border-black"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="text-lg text-white bg-[#18181b] px-4 py-2 rounded-lg border-2 border-black"
            >
              Chat
            </Link>
            <Link
              href="/about"
              className="text-lg text-[#18181b] hover:text-[#52525b] transition-colors px-4 py-2 rounded-lg hover:bg-white/50 border-2 border-transparent hover:border-black"
            >
              About
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Interface - Centered */}
      <div className="relative z-10 flex flex-col items-center pt-12 pb-16 px-6 overflow-y-auto" style={{ minHeight: 'calc(100vh - 100px)' }}>
        {/* Chat Box Container - Fixed Width, Just Above Center */}
        <div className="w-full max-w-4xl mb-12">
          <div className="border border-[#a1a1aa] rounded-[32px] bg-[#fafafa] flex flex-col">
            {/* Expanded Conversation Container */}
            <AnimatePresence>
              {hasMessages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="flex flex-col overflow-hidden"
                >
                  {/* Question Pill at Top */}
                  <div className="px-6 pt-6 pb-4 bg-[#fafafa] rounded-t-[32px]">
                    <div className="px-6 py-3 rounded-full border-2 border-black bg-[#d4d4d8] inline-block shadow-[3px_3px_0px_0px_#000000]">
                      <p className="text-sm text-[#2d2d2d]">{conversation.filter(item => item.type === 'user').pop()?.content}</p>
                    </div>
                  </div>

                  {/* Answer Area - Full White Background */}
                  <div className="max-h-96 overflow-y-auto bg-white">
                    <div className="h-full">
                      {activeTab === 'answer' && <DirectAnswer output={currentOutput} isStreaming={state === 'streaming'} />}
                      {activeTab === 'chart' && <ChartWidget output={currentOutput} onPin={() => {}} />}
                      {activeTab === 'mental-model' && <MentalModelFlow output={currentOutput} onPin={() => {}} />}
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
                        data-send-button
                        className="rounded-lg bg-[#3f3f46] hover:bg-[#52525b] text-[#e5e5e5] h-12 px-6 border-2 border-black shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                      >
                        <Send className="size-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Initial Chat Input Box */}
            <AnimatePresence>
              {!hasMessages && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="px-4 pt-4 pb-6"
                >
                  {/* Quick Questions - Only show if no connectors selected */}
                  {!input && selectedConnectors.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mb-2 max-w-3xl mx-auto overflow-x-auto scrollbar-hide"
                    >
                      <div className="flex gap-2 pt-2 pb-3 min-w-max">
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
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 + i * 0.05 }}
                              onClick={() => setInput(q)}
                              className={`relative text-xs px-4 py-2 rounded-lg ${colorClass} text-[#e5e5e5] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_#000000] border-2 border-black shadow-[3px_3px_0px_0px_#000000] whitespace-nowrap flex-shrink-0 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none`}
                            >
                              {q}
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Selected Connectors Tags */}
                  {selectedConnectors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-2 flex flex-wrap gap-2 px-1"
                    >
                      {selectedConnectors.map((connector, i) => (
                        <motion.div
                          key={connector}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: i * 0.05 }}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3f3f46] text-[#e5e5e5] rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_#000000] text-sm"
                        >
                          <span className="font-mono">@{connector}</span>
                          <button
                            onClick={() => handleRemoveConnector(connector)}
                            className="hover:text-red-400 transition-colors"
                          >
                            ×
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Chat Input Bar */}
                  <div className="relative bg-[#18181b] rounded-2xl p-3 flex items-center gap-3 border-2 border-black shadow-[6px_6px_0px_0px_#000000] w-full max-w-3xl mx-auto shrink-0">
                    <div className="flex-1 flex items-center gap-2 bg-[#e5e5e5] rounded-lg px-4 py-3 border-2 border-black">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything about your trades, create strategies, triggers and get insights."
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Connectors Section - Below Chat Box as Vertical Columns */}
        <div className="w-full max-w-6xl">
          {/* Helper Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center pb-8"
          >
            <p className="text-xs text-[#71717a] italic">
              Drop anything into the chat — Manjha will smartly consider it in your analysis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-8"
          >
            {/* Connect Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-sm mb-4 text-[#18181b] pb-2 border-b-4 border-black uppercase tracking-wide">Connect Trading Platforms</h3>
              <div className="space-y-3">
                {[
                  { name: Connector.ROBINHOOD, color: 'bg-[#00C805]' },
                  { name: Connector.ZERODHA, color: 'bg-[#387ED1]' },
                  { name: Connector.INTERACTIVE_BROKERS, color: 'bg-[#DC2626]' },
                  { name: Connector.TD_AMERITRADE, color: 'bg-[#00A651]' },
                ].map((platform, i) => {
                  const isSelected = selectedConnectors.includes(platform.name);
                  const authStatus = connectorStatus[platform.name];
                  const isAuthenticated = authStatus === 'connected';
                  
                  // Determine status text and style
                  let statusText = 'Connect';
                  let statusClass = 'bg-black/20 border-white/30';
                  
                  if (isSelected && isAuthenticated) {
                    statusText = 'Connected';
                    statusClass = 'bg-green-500/90 border-green-300';
                  } else if (isSelected && !isAuthenticated) {
                    statusText = 'Not Authenticated';
                    statusClass = 'bg-yellow-500/90 border-yellow-300';
                  }
                  
                  return (
                    <motion.button
                      key={platform.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      onClick={() => handleConnectorClick(platform.name)}
                      className={`w-full px-5 py-3 ${platform.color} border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm text-white font-medium text-left flex items-center justify-between ${
                        isSelected ? 'ring-4 ring-white/50' : ''
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {platform.name}
                        {isAuthenticated && <CheckCircle2 className="w-4 h-4" />}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${statusClass}`}>
                        {statusText}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* News Sources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm mb-4 text-[#18181b] pb-2 border-b-4 border-black uppercase tracking-wide">News Sources</h3>
              <div className="space-y-3">
                {[
                  { name: 'Bloomberg', color: 'bg-[#C7D2FE]' },
                  { name: 'Reuters', color: 'bg-[#FED7AA]' },
                  { name: 'WSJ', color: 'bg-[#CBD5E1]' },
                  { name: 'Financial Times', color: 'bg-[#FBCFE8]' },
                  { name: 'CNBC', color: 'bg-[#BAE6FD]' },
                  { name: 'MarketWatch', color: 'bg-[#BBF7D0]' },
                ].map((source, i) => (
                  <motion.button
                    key={source.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    onClick={() => handleConnectorClick(source.name)}
                    className={`w-full px-5 py-3 ${source.color} border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm text-[#2d2d2d] font-medium text-left`}
                  >
                    {source.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Social Feeds */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <h3 className="text-sm mb-4 text-[#18181b] pb-2 border-b-4 border-black uppercase tracking-wide">Add Social Feeds</h3>
              <div className="space-y-3">
                {[
                  { name: Connector.TRUMP, label: 'Trump (Last 10 tweets)', color: 'bg-[#FECACA]' },
                  { name: Connector.ELON_MUSK, label: 'Elon Musk (Last 10 tweets)', color: 'bg-[#DDD6FE]' },
                  { name: Connector.CHAMATH, label: 'Chamath (Last 10 tweets)', color: 'bg-[#CCFBF1]' },
                  { name: Connector.CATHIE_WOOD, label: 'Cathie Wood (Last 10 tweets)', color: 'bg-[#FDE68A]' },
                ].map((account, i) => (
                  <motion.button
                    key={account.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    onClick={() => handleConnectorClick(account.name)}
                    className={`w-full px-5 py-3 ${account.color} border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm text-[#2d2d2d] font-medium text-left`}
                  >
                    {account.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Mental Models */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-sm mb-4 text-[#18181b] pb-2 border-b-4 border-black uppercase tracking-wide">Drop Mental Models</h3>
              <div className="space-y-3">
                {[
                  'Risk-Reward Framework',
                  'Position Sizing Model',
                  'Trend Following Strategy',
                  'Mean Reversion Rules',
                  'Breakout Pattern Logic',
                  'Stop Loss Discipline',
                ].map((model, i) => (
                  <motion.button
                    key={model}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 + i * 0.05 }}
                    onClick={() => handleConnectorClick(model)}
                    className="w-full px-5 py-3 bg-[#d4c4e1] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm text-[#2d2d2d] text-left"
                  >
                    {model}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Discipline Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <h3 className="text-sm mb-4 text-[#18181b] pb-2 border-b-4 border-black uppercase tracking-wide">Drop Discipline Rules</h3>
              <div className="space-y-3">
                {[
                  'No trades after 2 losses',
                  'Max 3% per trade',
                  'Only trade setups A & B',
                  'No weekend holds',
                  'Cut losses at -2%',
                  'Take profit at 3:1 R/R',
                ].map((rule, i) => (
                  <motion.button
                    key={rule}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.05 }}
                    onClick={() => handleConnectorClick(rule)}
                    className="w-full px-5 py-3 bg-[#e5c9c9] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm text-[#2d2d2d] text-left"
                  >
                    {rule}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Open Source Books */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-sm mb-4 text-[#18181b] pb-2 border-b-4 border-black uppercase tracking-wide">Drop Knowledge (Free Books)</h3>
              <div className="space-y-3">
                {[
                  'Reminiscences of a Stock Operator',
                  'Trading in the Zone',
                  'Market Wizards Series',
                  'Technical Analysis Explained',
                  'The Disciplined Trader',
                  'Way of the Turtle',
                ].map((book, i) => (
                  <motion.button
                    key={book}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + i * 0.05 }}
                    onClick={() => handleConnectorClick(book)}
                    className="w-full px-5 py-3 bg-[#d9b89c] border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000000] hover:shadow-[1px_1px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm text-[#2d2d2d] text-left"
                  >
                    {book}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}

