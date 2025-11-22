'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Zap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#d4d4d8] relative overflow-hidden font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="about-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <Link href="/" className="group flex items-center gap-3">
             <div className="w-10 h-10 bg-[#18181b] border-2 border-black rounded-lg flex items-center justify-center font-black text-white text-xl group-hover:-rotate-3 transition-transform">
              M
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Manjha</span>
          </Link>
          <div className="flex gap-4">
             <Link href="/dashboard">
              <Button className="bg-[#18181b] text-white border-2 border-black hover:bg-[#27272a] shadow-[4px_4px_0px_0px_#000000] hover:shadow-[2px_2px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </nav>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto px-6 py-12 space-y-24"
        >
          {/* Hero Section */}
          <section className="space-y-8 text-center max-w-3xl mx-auto">
            <motion.h1 
              variants={item}
              className="text-5xl md:text-7xl font-black tracking-tight text-[#18181b] leading-tight"
            >
              The AI Coach for Your <span className="text-[#d9b89c] inline-block px-2 bg-[#18181b] -rotate-1 transform">Portfolio</span>
            </motion.h1>
            <motion.p 
              variants={item}
              className="text-xl md:text-2xl text-[#52525b] font-medium leading-relaxed"
            >
              Manjha is an AI-powered trading journal that turns your chaotic trade history into disciplined, actionable insights through conversation.
            </motion.p>
          </section>

          {/* Problem / Solution Grid */}
          <section>
            <motion.div variants={item} className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#e5c9c9] border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000000]">
                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                  <span className="text-3xl">🛑</span> The Problem
                </h3>
                <ul className="space-y-4 text-lg font-medium text-[#2d2d2d]">
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 bg-black rounded-full shrink-0" />
                    Spreadsheets are boring and hard to maintain.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 bg-black rounded-full shrink-0" />
                    You repeat the same mistakes (cutting winners, revenge trading).
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 bg-black rounded-full shrink-0" />
                    Traditional journals give data, not advice.
                  </li>
                </ul>
              </div>
              <div className="bg-[#d4c4e1] border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000000]">
                <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
                  <span className="text-3xl">✅</span> The Manjha Way
                </h3>
                <ul className="space-y-4 text-lg font-medium text-[#2d2d2d]">
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 bg-black rounded-full shrink-0" />
                    Just ask: "Why am I losing on Fridays?"
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 bg-black rounded-full shrink-0" />
                    AI builds a "Mental Model" of your bad habits.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1.5 w-2 h-2 bg-black rounded-full shrink-0" />
                    Visual proof with every answer (charts & heatmaps).
                  </li>
                </ul>
              </div>
            </motion.div>
          </section>

          {/* Real Use Cases */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black">Real Use Cases</h2>
              <p className="text-xl text-[#52525b] font-medium">How traders use Manjha daily</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Instant Analysis",
                  bg: "bg-white",
                  desc: "Ask \"Show me my best performing strategy\" and get an instant breakdown of your win-rate per strategy."
                },
                {
                  icon: BarChart3,
                  title: "Knowledge Graph",
                  bg: "bg-[#d9b89c]",
                  desc: "Manjha remembers your context. It knows you struggle with 'overtrading' and reminds you of your rules."
                },
                {
                  icon: BarChart3,
                  title: "Visual Widgets",
                  bg: "bg-[#e5c9c9]",
                  desc: "Every chat response comes with a generated chart or heatmap. Pin them to your board for later."
                }
              ].map((card, i) => (
                <motion.div 
                  key={i}
                  variants={item}
                  className={`${card.bg} border-4 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#000000] transition-all`}
                >
                  <div className="w-12 h-12 bg-[#18181b] rounded-lg flex items-center justify-center mb-4 border-2 border-black text-white">
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  <p className="text-[#52525b] font-medium">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Utilities / Features */}
          <section className="bg-[#18181b] text-white -mx-6 md:-mx-24 px-6 md:px-24 py-20 transform -rotate-1 my-12 border-y-4 border-black">
             <div className="max-w-5xl mx-auto transform rotate-1 space-y-12">
                <div className="text-center">
                  <h2 className="text-4xl font-black mb-4 text-[#d4c4e1]">Power User Utilities</h2>
                  <p className="text-xl text-gray-400">Built for serious growth</p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {[
                     { title: "Direct Answer", icon: Zap, desc: "Plain English explanations for complex P&L queries." },
                     { title: "Smart Charts", icon: BarChart3, desc: "Auto-generated visuals that prove the insight." },
                     { title: "Mental Models", icon: Zap, desc: "Flowcharts for your discipline & rules." },
                     { title: "Sync Accounts", icon: ArrowRight, desc: "Connect Robinhood, Zerodha, and more." }
                   ].map((feat, i) => (
                     <div key={i} className="text-center space-y-4">
                        <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center mx-auto border-2 border-[#52525b]">
                          <feat.icon className="w-8 h-8 text-[#d9b89c]" />
                        </div>
                        <h4 className="text-lg font-bold">{feat.title}</h4>
                        <p className="text-sm text-gray-400">{feat.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          </section>

          {/* Comparison Table */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black mb-8 text-center">Why Switch?</h2>
            <div className="bg-white border-4 border-black rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000000]">
              <div className="grid grid-cols-3 bg-[#f4f4f5] border-b-4 border-black font-black p-4 text-center">
                <div>Feature</div>
                <div>Traditional</div>
                <div className="text-[#18181b]">Manjha</div>
              </div>
              <div className="grid grid-cols-3 p-4 border-b border-gray-200 hover:bg-gray-50 items-center">
                <div className="font-bold pl-4">Analysis</div>
                <div className="text-center text-gray-500">Manual Dashboards</div>
                <div className="text-center font-bold bg-[#d4c4e1]/30 py-1 rounded-md border border-[#d4c4e1]">AI Conversation</div>
              </div>
              <div className="grid grid-cols-3 p-4 border-b border-gray-200 hover:bg-gray-50 items-center">
                <div className="font-bold pl-4">Memory</div>
                <div className="text-center text-gray-500">Static Logs</div>
                <div className="text-center font-bold bg-[#e5c9c9]/30 py-1 rounded-md border border-[#e5c9c9]">Knowledge Graph</div>
              </div>
              <div className="grid grid-cols-3 p-4 hover:bg-gray-50 items-center">
                <div className="font-bold pl-4">Visuals</div>
                <div className="text-center text-gray-500">Fixed Charts</div>
                <div className="text-center font-bold bg-[#d9b89c]/30 py-1 rounded-md border border-[#d9b89c]">On-Demand Widgets</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center pb-20">
            <h2 className="text-4xl font-black mb-8">Ready to evolve?</h2>
             <Link href="/dashboard">
              <Button className="group text-xl px-12 py-8 bg-[#18181b] text-white border-4 border-black rounded-2xl hover:bg-[#27272a] shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[4px] hover:translate-y-[4px] transition-all">
                Start Your Journal
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </section>

        </motion.div>
      </div>
    </div>
  );
}
