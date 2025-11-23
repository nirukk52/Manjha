'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface BalanceData {
  available: number;
  usedMargin: number;
  total: number;
  currency: string;
}

interface ZerodhaBalanceWidgetProps {
  userId: string;
}

export function ZerodhaBalanceWidget({ userId }: ZerodhaBalanceWidgetProps) {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
  }, [userId]);

  const fetchBalance = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/zerodha/connection/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      
      if (data.isConnected && data.balance) {
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/zerodha/balance/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      await fetchBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount == null || isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="relative bg-[#c4e1d4] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Portfolio Value</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-[#2d2d2d]/10 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-[#2d2d2d]/10 rounded"></div>
            <div className="h-10 bg-[#2d2d2d]/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="relative bg-[#c4e1d4] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <h3 className="uppercase tracking-wide font-black text-[#2d2d2d] mb-4">Portfolio Value</h3>
        <p className="text-sm text-[#2d2d2d]/60">Connect Zerodha to view balance</p>
      </div>
    );
  }

  return (
    <div className="relative bg-[#c4e1d4] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="uppercase tracking-wide font-black text-[#2d2d2d]">Portfolio Value</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg bg-[#2d2d2d] border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw className={`h-4 w-4 text-white ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 block mb-1">
            Total Balance
          </span>
          <span className="text-3xl font-black text-[#2d2d2d]">
            {formatCurrency(balance.total)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 block mb-1">
              Available
            </span>
            <span className="text-xl font-black text-[#16a34a]">
              {formatCurrency(balance.available)}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 block mb-1">
              Used Margin
            </span>
            <span className="text-xl font-black text-[#dc2626]">
              {formatCurrency(balance.usedMargin)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

