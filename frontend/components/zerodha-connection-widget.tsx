'use client';

import { useState, useEffect } from 'react';
import { Wallet, Check, X, AlertCircle, Loader2 } from 'lucide-react';

interface ZerodhaConnectionWidgetProps {
  userId: string;
}

interface ConnectionStatus {
  status: 'NOT_CONNECTED' | 'ACTIVE' | 'EXPIRED' | 'ERROR';
  isConnected: boolean;
  zerodhaUserId?: string;
  balance?: {
    availableBalance: number;
    usedMargin: number;
    totalBalance: number;
    currency: string;
  };
  minutesUntilExpiry?: number;
}

export function ZerodhaConnectionWidget({ userId }: ZerodhaConnectionWidgetProps) {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    console.log('ZerodhaConnectionWidget mounted with userId:', userId);
    if (userId) {
      fetchConnectionStatus();
    }
  }, [userId]);

  const fetchConnectionStatus = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/zerodha/connection/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch Zerodha status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      console.log('Initiating OAuth with:', { userId, apiUrl, redirectUrl: window.location.href });
      
      const response = await fetch(`${apiUrl}/zerodha/oauth/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          redirectUrl: window.location.href,
        }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OAuth initiation failed:', errorText);
        alert(`Failed to connect: ${response.status}`);
        setConnecting(false);
        return;
      }
      
      const data = await response.json();
      console.log('OAuth data:', data);
      
      if (data.oauthUrl) {
        // Redirect to Zerodha login
        console.log('Redirecting to:', data.oauthUrl);
        window.location.href = data.oauthUrl;
      } else {
        console.error('No oauthUrl in response');
        alert('Failed to get OAuth URL');
        setConnecting(false);
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Zerodha account?')) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      await fetch(`${apiUrl}/zerodha/connection/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      await fetchConnectionStatus();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (loading) {
    return (
      <div className="relative bg-[#e5c9c9] rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[#2d2d2d]" />
        </div>
      </div>
    );
  }

  const isConnected = status?.isConnected;
  const isExpired = status?.status === 'EXPIRED';
  const showWarning = status?.minutesUntilExpiry && status.minutesUntilExpiry < 30;

  return (
    <div className={`relative rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000] ${
      isConnected ? 'bg-[#c4e1d4]' : isExpired ? 'bg-[#fce8e6]' : 'bg-[#e5c9c9]'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#2d2d2d]" />
          <h3 className="uppercase tracking-wide font-black text-[#2d2d2d]">Zerodha Account</h3>
        </div>
        {isConnected && (
          <div className="flex items-center gap-1 bg-[#47632d] px-2 py-1 rounded-lg border-2 border-black">
            <Check className="h-3 w-3 text-white" />
            <span className="text-xs font-black text-white uppercase">Connected</span>
          </div>
        )}
      </div>

      {!isConnected ? (
        <div className="space-y-3">
          <p className="text-sm text-[#2d2d2d]/70">
            Connect your Zerodha account to sync your portfolio automatically.
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Connect button clicked!');
              handleConnect();
            }}
            disabled={connecting}
            className="w-full bg-[#47632d] hover:bg-[#47632d]/90 text-white font-black py-3 px-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] active:shadow-none transition-all uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </span>
            ) : (
              'Connect Zerodha'
            )}
          </button>
          <p className="text-xs text-[#2d2d2d]/50 text-center">
            Secure OAuth • Your credentials stay with Zerodha
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {showWarning && (
            <div className="bg-[#fef3f2] border-2 border-[#dc2626] rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-[#dc2626] mb-0.5">Session Expiring Soon</p>
                <p className="text-xs text-[#2d2d2d]/70">
                  Reconnect in {status?.minutesUntilExpiry} minutes
                </p>
              </div>
            </div>
          )}

          {isExpired && (
            <div className="bg-[#fef3f2] border-2 border-[#dc2626] rounded-lg p-3 flex items-start gap-2">
              <X className="h-4 w-4 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-[#dc2626] mb-0.5">Session Expired</p>
                <p className="text-xs text-[#2d2d2d]/70">Please reconnect your account</p>
              </div>
            </div>
          )}

          {status?.zerodhaUserId && (
            <div>
              <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60 block mb-1">
                Account ID
              </span>
              <span className="text-sm font-black text-[#2d2d2d]">{status.zerodhaUserId}</span>
            </div>
          )}

          {status?.balance && (
            <div className="bg-white/60 border-2 border-black rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">
                  Available
                </span>
                <span className="text-lg font-black text-[#16a34a]">
                  ₹{status.balance.availableBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-wider font-black text-[#2d2d2d]/60">
                  Used Margin
                </span>
                <span className="text-sm font-black text-[#2d2d2d]">
                  ₹{status.balance.usedMargin.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={isExpired ? handleConnect : handleDisconnect}
            className={`w-full font-black py-2 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:shadow-none active:shadow-none transition-all text-sm uppercase tracking-wide ${
              isExpired 
                ? 'bg-[#47632d] text-white hover:bg-[#47632d]/90'
                : 'bg-white text-[#2d2d2d] hover:bg-gray-50'
            }`}
          >
            {isExpired ? 'Reconnect' : 'Disconnect'}
          </button>
        </div>
      )}
    </div>
  );
}

