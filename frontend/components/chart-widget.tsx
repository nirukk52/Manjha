'use client';

import { ScrollArea } from './ui/scroll-area';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pin } from 'lucide-react';

/**
 * Chart Widget Component
 * Displays various chart visualizations based on output data
 */

interface ChartWidgetProps {
  output: any;
  onPin?: () => void;
}

export function ChartWidget({ output, onPin }: ChartWidgetProps) {
  if (!output) {
    return (
      <div className="h-full flex items-center justify-center text-[#5a5a5a]">
        <div className="text-center">
          <p>Charts will appear here</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    // Default chart data structure
    const chartData = output.chartData || [
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 200 },
      { name: 'Mar', value: 150 }
    ];

    switch (output.chartType) {
      case 'Planned vs Impulsive Win Rate':
      case 'Win Rate by Sector':
        return (
          <div className="relative space-y-4 bg-white rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            {onPin && (
              <button
                onClick={onPin}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black hover:bg-[#b4d4e1] transition-colors shadow-[2px_2px_0px_0px_#000000]"
                title="Pin to dashboard"
              >
                <Pin className="h-4 w-4 text-[#2d2d2d]" />
              </button>
            )}
            <div>
              <h3 className="text-[#2d2d2d] font-black mb-2">{output.chartType}</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                <XAxis dataKey="name" stroke="#5a5a5a" style={{ fontFamily: 'Inter', fontWeight: 700 }} />
                <YAxis stroke="#5a5a5a" style={{ fontFamily: 'Inter', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700 }}
                  labelStyle={{ color: '#2d2d2d' }}
                />
                <Bar dataKey="winRate" fill="#b4d4e1" stroke="#000000" strokeWidth={2} radius={[8, 8, 0, 0]} />
                {chartData[0].lossRate !== undefined && (
                  <Bar dataKey="lossRate" fill="#e5c9c9" stroke="#000000" strokeWidth={2} radius={[8, 8, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'Losing Streak Analysis':
        return (
          <div className="relative space-y-4 bg-white rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            {onPin && (
              <button
                onClick={onPin}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black hover:bg-[#b4d4e1] transition-colors shadow-[2px_2px_0px_0px_#000000]"
                title="Pin to dashboard"
              >
                <Pin className="h-4 w-4 text-[#2d2d2d]" />
              </button>
            )}
            <div>
              <h3 className="text-[#2d2d2d] font-black mb-2">P&L Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                <XAxis dataKey="date" stroke="#5a5a5a" style={{ fontFamily: 'Inter', fontWeight: 700 }} />
                <YAxis stroke="#5a5a5a" style={{ fontFamily: 'Inter', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700 }}
                  labelStyle={{ color: '#2d2d2d' }}
                />
                <Line type="monotone" dataKey="pnl" stroke="#2d2d2d" strokeWidth={3} dot={{ fill: '#b4d4e1', r: 5, stroke: '#000000', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return (
          <div className="relative space-y-4 bg-white rounded-2xl p-5 border-2 border-black shadow-[6px_6px_0px_0px_#000000]">
            {onPin && (
              <button
                onClick={onPin}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#c4e1d4] border-2 border-black hover:bg-[#b4d4e1] transition-colors shadow-[2px_2px_0px_0px_#000000]"
                title="Pin to dashboard"
              >
                <Pin className="h-4 w-4 text-[#2d2d2d]" />
              </button>
            )}
            <div>
              <h3 className="text-[#2d2d2d] font-black mb-2">{output.chartType || 'Chart'}</h3>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                <XAxis dataKey="name" stroke="#5a5a5a" style={{ fontFamily: 'Inter', fontWeight: 700 }} />
                <YAxis stroke="#5a5a5a" style={{ fontFamily: 'Inter', fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: '8px', fontFamily: 'Inter', fontWeight: 700 }}
                  labelStyle={{ color: '#2d2d2d' }}
                />
                <Bar dataKey="value" fill="#b4d4e1" stroke="#000000" strokeWidth={2} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        {renderChart()}
      </div>
    </ScrollArea>
  );
}

