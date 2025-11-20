'use client';

import { Plus, ExternalLink, X, Twitter, Youtube, Rss, Link as LinkIcon, TrendingUp, Clock } from 'lucide-react';
import { useState } from 'react';

/**
 * Watching Section Component
 * Manages watched sources (Twitter, YouTube, RSS, URLs) for content tracking
 */

interface WatchedSource {
  id: string;
  type: 'twitter' | 'youtube' | 'rss' | 'url';
  name: string;
  handle?: string;
  url: string;
  addedDate: string;
  lastSync: string;
  updates: number;
}

export function WatchingSection() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [sources, setSources] = useState<WatchedSource[]>([
    {
      id: '1',
      type: 'twitter',
      name: 'WallStreetJesus',
      handle: '@wallstjesus',
      url: 'https://twitter.com/wallstjesus',
      addedDate: '2025-02-10',
      lastSync: '2 mins ago',
      updates: 14
    },
    {
      id: '2',
      type: 'youtube',
      name: 'The Chart Guys',
      handle: '@TheChartGuys',
      url: 'https://youtube.com/@thechartguys',
      addedDate: '2025-02-08',
      lastSync: '1 hour ago',
      updates: 3
    },
    {
      id: '3',
      type: 'rss',
      name: 'TradingView Blog',
      url: 'https://www.tradingview.com/blog/en/',
      addedDate: '2025-02-05',
      lastSync: '5 mins ago',
      updates: 8
    }
  ]);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'rss':
        return <Rss className="h-5 w-5" />;
      default:
        return <LinkIcon className="h-5 w-5" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'twitter':
        return { bg: '#e8f5ff', border: '#1DA1F2', icon: '#1DA1F2' };
      case 'youtube':
        return { bg: '#ffebe8', border: '#FF0000', icon: '#FF0000' };
      case 'rss':
        return { bg: '#fff3e8', border: '#FFA500', icon: '#FFA500' };
      default:
        return { bg: '#f0f0f0', border: '#666666', icon: '#666666' };
    }
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(source => source.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-[#c4e1d4] to-[#b4d4e1] rounded-2xl p-6 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-2">Watching</h3>
            <p className="text-sm text-[#2d2d2d]/70 leading-relaxed max-w-md">
              Track public social accounts and URLs. Content gets synced and fed into Manjha's knowledge graph.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#fce8e6] border-2 border-black flex items-center justify-center">
            <span className="text-xl">👀</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#f5f5f5] border-2 border-black rounded-xl py-3 px-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          <Plus className="h-5 w-5 text-[#2d2d2d]" />
          <span className="font-black uppercase tracking-tight text-[#2d2d2d]">Add Source</span>
        </button>
      </div>

      {/* Add Source Modal/Form */}
      {showAddModal && (
        <div className="relative bg-white rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black uppercase tracking-tight text-[#2d2d2d]">Add New Source</h4>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-2 rounded-lg bg-[#fce8e6] border-2 border-black hover:bg-[#fcd8d6] transition-colors"
            >
              <X className="h-4 w-4 text-[#2d2d2d]" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 mb-2">
                Paste URL or Handle
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="twitter.com/username, youtube.com/@channel, or any URL"
                className="w-full px-4 py-3 border-2 border-black rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#387ED1]/50 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center gap-2 p-3 bg-[#e8f5ff] border-2 border-[#1DA1F2] rounded-lg hover:bg-[#d8ebff] transition-colors">
                <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                <span className="text-xs font-black text-[#2d2d2d]">Twitter</span>
              </button>
              <button className="flex items-center gap-2 p-3 bg-[#ffebe8] border-2 border-[#FF0000] rounded-lg hover:bg-[#ffdbd8] transition-colors">
                <Youtube className="h-4 w-4 text-[#FF0000]" />
                <span className="text-xs font-black text-[#2d2d2d]">YouTube</span>
              </button>
              <button className="flex items-center gap-2 p-3 bg-[#fff3e8] border-2 border-[#FFA500] rounded-lg hover:bg-[#ffe3d8] transition-colors">
                <Rss className="h-4 w-4 text-[#FFA500]" />
                <span className="text-xs font-black text-[#2d2d2d]">RSS Feed</span>
              </button>
              <button className="flex items-center gap-2 p-3 bg-[#f0f0f0] border-2 border-[#666666] rounded-lg hover:bg-[#e0e0e0] transition-colors">
                <LinkIcon className="h-4 w-4 text-[#666666]" />
                <span className="text-xs font-black text-[#2d2d2d]">Any URL</span>
              </button>
            </div>

            <button className="w-full bg-[#387ED1] hover:bg-[#2563eb] border-2 border-black rounded-lg py-3 px-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all">
              <span className="font-black uppercase tracking-tight text-white">Start Watching</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Sources List */}
      <div className="relative bg-[#d4c4e1] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <h4 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">
          Active Sources ({sources.length})
        </h4>

        <div className="space-y-3">
          {sources.map((source) => {
            const colors = getColorForType(source.type);
            return (
              <div
                key={source.id}
                className="bg-white/80 border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_#000000] hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center"
                    style={{ backgroundColor: colors.bg, color: colors.icon }}
                  >
                    {getIconForType(source.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-black text-[#2d2d2d] leading-none mb-0.5">
                          {source.name}
                        </p>
                        {source.handle && (
                          <p className="text-xs font-black" style={{ color: colors.icon }}>
                            {source.handle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md bg-[#f0f0f0] border border-black/20 hover:bg-[#e0e0e0] transition-colors"
                        >
                          <ExternalLink className="h-3 w-3 text-[#2d2d2d]" />
                        </a>
                        <button
                          onClick={() => removeSource(source.id)}
                          className="p-1.5 rounded-md bg-[#fce8e6] border border-[#dc2626]/30 hover:bg-[#fcd8d6] transition-colors"
                        >
                          <X className="h-3 w-3 text-[#dc2626]" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="bg-[#c4e1d4]/30 border border-black/10 rounded px-2 py-1">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-[#16a34a]" />
                          <span className="text-xs font-black text-[#2d2d2d]">
                            {source.updates}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#2d2d2d]/60 font-black">Updates</p>
                      </div>
                      <div className="bg-[#d9e8f5]/30 border border-black/10 rounded px-2 py-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-[#387ED1]" />
                          <span className="text-xs font-black text-[#2d2d2d]">
                            {source.lastSync}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#2d2d2d]/60 font-black">Last sync</p>
                      </div>
                      <div className="bg-[#f5e6d3]/30 border border-black/10 rounded px-2 py-1">
                        <span className="text-xs font-black text-[#2d2d2d]">
                          {new Date(source.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <p className="text-[9px] text-[#2d2d2d]/60 font-black">Added</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></div>
                        <span className="text-[10px] uppercase tracking-wider font-black text-[#16a34a]">
                          Syncing
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

