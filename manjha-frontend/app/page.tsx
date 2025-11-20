'use client';

import { useState } from 'react';
import { Landing } from '@/components/landing';
import { ChatInput } from '@/components/chat-input';
import { WidgetDashboard } from '@/components/widget-dashboard';
import { DailyReportPage } from '@/components/daily-report-page';
import { PinnedWidgets } from '@/components/pinned-widgets';
import { PinnedItem } from '@/types';

/**
 * Manjha Trading Journal - Main Application Page
 * Chat-driven trading journal with mental models and portfolio analytics
 */

export default function Page() {
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'dailyReport'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handlePinItem = (item: PinnedItem) => {
    setPinnedItems(prev => [...prev, { ...item, id: Date.now().toString() }]);
  };

  const handleRemovePin = (id: string) => {
    setPinnedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleNewOutput = (output: any) => {
    // This is now handled internally in ChatInput
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCurrentView('dailyReport');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedDate(null);
  };

  if (!showDashboard) {
    return <Landing onEnter={() => setShowDashboard(true)} />;
  }

  // Show Daily Report Page
  if (currentView === 'dailyReport' && selectedDate) {
    return <DailyReportPage date={selectedDate} onBack={handleBackToDashboard} />;
  }

  // Show Main Dashboard
  return (
    <div className="relative h-screen w-full bg-[#d4d4d8] overflow-hidden">
      {/* Background Graph Grid */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Dashboard: Full screen scrollable background */}
      <div className="absolute inset-0 overflow-auto">
        <WidgetDashboard onDateClick={handleDateClick} />
      </div>

      {/* Floating Components */}
      {/* Chat Input - Floating at Bottom */}
      <ChatInput
        onOutputGenerated={handleNewOutput}
        onPinItem={handlePinItem}
      />

      {/* Chat Pinned Widgets Panel - Floating Right */}
      <div className="absolute top-0 right-0 bottom-0 z-30 pointer-events-none">
        <div className="pointer-events-auto">
          <PinnedWidgets 
            items={pinnedItems}
            onRemoveItem={handleRemovePin}
          />
        </div>
      </div>
    </div>
  );
}
