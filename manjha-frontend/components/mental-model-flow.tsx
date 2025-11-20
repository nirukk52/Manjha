'use client';

import { ScrollArea } from './ui/scroll-area';
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * Mental Model Flow Component
 * Displays decision flows and mental models from AI responses
 */

interface MentalModelFlowProps {
  output: any;
  onPin?: () => void;
}

export function MentalModelFlow({ output, onPin }: MentalModelFlowProps) {
  if (!output || !output.mentalModel) {
    return (
      <div className="h-full flex items-center justify-center text-[#5a5a5a]">
        <div className="text-center">
          <p>Mental models and decision flows will appear here</p>
        </div>
      </div>
    );
  }

  const model = output.mentalModel;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Flow visualization based on nodes and edges */}
        {model.nodes && model.edges && (
          <div className="space-y-4 mb-8">
            {model.nodes.map((node: any, i: number) => {
              const incomingEdges = model.edges.filter((e: any) => e.to === node.id);
              const outgoingEdges = model.edges.filter((e: any) => e.from === node.id);
              
              return (
                <div key={node.id}>
                  <div className="bg-[#f5e6d3] border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_#000000]">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#2d2d2d] border-2 border-black flex items-center justify-center text-white font-black">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[#2d2d2d] font-black mb-1">{node.label}</h4>
                        <p className="text-sm text-[#5a5a5a] capitalize">{node.type}</p>
                      </div>
                    </div>
                  </div>
                  
                  {i < model.nodes.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight className="size-5 text-[#5a5a5a] rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        <div className="bg-[#c4e1d4] border-2 border-black rounded-lg p-6 shadow-[3px_3px_0px_0px_#000000]">
          <h4 className="text-[#2d2d2d] font-black mb-4">Key Insights</h4>
          <div className="space-y-2">
            {model.nodes && model.nodes.map((node: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="size-4 text-[#5fb369] mt-0.5 flex-shrink-0" />
                <span className="text-[#2d2d2d]">{node.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

