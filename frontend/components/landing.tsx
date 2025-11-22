'use client';

import { ArrowRight, BarChart3, Zap, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * Landing Page Component
 * Welcome page for Manjha trading journal with animated kites and hero section
 */

interface LandingProps {
  onEnter?: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <div className="min-h-screen bg-[#d4d4d8] relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="landing-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2d2d2d" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#landing-grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Floating Kites - Right Side */}
        <div className="absolute right-0 top-0 w-1/3 h-screen pointer-events-none opacity-30 hidden lg:block">
          {/* Kite 1 */}
          <motion.div
            className="absolute right-32 top-40"
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg width="60" height="400" viewBox="0 0 60 400" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Kite body */}
              <path d="M30 5L50 30L30 55L10 30L30 5Z" fill="#e5c9c9" stroke="#18181b" strokeWidth="2"/>
              {/* Wavy String */}
              <motion.path
                d="M30 55 Q35 120, 30 180 T30 300 Q28 350, 30 400"
                stroke="#18181b"
                strokeWidth="2"
                strokeDasharray="4 3"
                fill="none"
                animate={{
                  d: [
                    "M30 55 Q35 120, 30 180 T30 300 Q28 350, 30 400",
                    "M30 55 Q25 120, 30 180 T30 300 Q32 350, 30 400",
                    "M30 55 Q35 120, 30 180 T30 300 Q28 350, 30 400",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>

          {/* Kite 2 */}
          <motion.div
            className="absolute right-20 top-64"
            animate={{
              y: [0, -15, 0],
              x: [0, -8, 0],
              rotate: [0, -4, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            <svg width="50" height="350" viewBox="0 0 50 350" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 5L40 25L25 45L10 25L25 5Z" fill="#d9b89c" stroke="#18181b" strokeWidth="2"/>
              {/* Wavy String */}
              <motion.path
                d="M25 45 Q20 100, 25 150 T25 250 Q27 300, 25 350"
                stroke="#18181b"
                strokeWidth="2"
                strokeDasharray="4 3"
                fill="none"
                animate={{
                  d: [
                    "M25 45 Q20 100, 25 150 T25 250 Q27 300, 25 350",
                    "M25 45 Q30 100, 25 150 T25 250 Q23 300, 25 350",
                    "M25 45 Q20 100, 25 150 T25 250 Q27 300, 25 350",
                  ],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </svg>
          </motion.div>

          {/* Kite 3 */}
          <motion.div
            className="absolute right-48 top-96"
            animate={{
              y: [0, -18, 0],
              x: [0, 12, 0],
              rotate: [0, 6, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            <svg width="45" height="300" viewBox="0 0 45 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.5 5L37.5 23L22.5 41L7.5 23L22.5 5Z" fill="#d4c4e1" stroke="#18181b" strokeWidth="2"/>
              {/* Wavy String */}
              <motion.path
                d="M22.5 41 Q18 90, 22.5 140 T22.5 240 Q24 270, 22.5 300"
                stroke="#18181b"
                strokeWidth="2"
                strokeDasharray="4 3"
                fill="none"
                animate={{
                  d: [
                    "M22.5 41 Q18 90, 22.5 140 T22.5 240 Q24 270, 22.5 300",
                    "M22.5 41 Q27 90, 22.5 140 T22.5 240 Q21 270, 22.5 300",
                    "M22.5 41 Q18 90, 22.5 140 T22.5 240 Q24 270, 22.5 300",
                  ],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              />
            </svg>
          </motion.div>
        </div>

        {/* Top Navigation Bar */}
        <nav className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-end justify-between">
            {/* Logo */}
            <div className="w-10 h-10 bg-[#18181b] border-2 border-black rounded-lg flex items-center justify-center font-black text-white text-xl">
              M
            </div>
            
            {/* About Link */}
            <Link 
              href="/about" 
              className="text-lg text-[#18181b] hover:text-[#52525b] transition-colors px-4 py-2 rounded-lg hover:bg-white/50 border-2 border-black"
            >
              About
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-16">
          <div className="space-y-8">
            {/* Logo/Name */}
            <div className="space-y-2">
              <h1 className="text-7xl font-black tracking-tight">Manjha</h1>
              <p className="text-xl text-[#52525b] font-medium">Personal financial assistant and portfolio manager.</p>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h2 className="text-6xl font-black max-w-3xl leading-tight">
                Your portfolio gets a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 px-2">brain</span>
                  <span className="absolute inset-0 bg-[#d9b89c] -rotate-1 border-4 border-black"></span>
                </span>
                , a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 px-2">rulebook</span>
                  <span className="absolute inset-0 bg-[#e5c9c9] rotate-1 border-4 border-black"></span>
                </span>
                , and a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 px-2">diary</span>
                  <span className="absolute inset-0 bg-[#d4c4e1] -rotate-1 border-4 border-black"></span>
                </span>
              </h2>
              <p className="text-xl text-[#52525b] max-w-2xl leading-relaxed font-medium">
                Manjha creates a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#3f3f46] font-bold">mental model</span>
                  <span className="absolute inset-x-0 bottom-0 h-2 bg-[#d4c4e1]/50 -rotate-1"></span>
                </span>
                {' '}for himself, a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#3f3f46] font-bold">discipline engine</span>
                  <span className="absolute inset-x-0 bottom-0 h-2 bg-[#e5c9c9]/50 rotate-1"></span>
                </span>
                {' '}for you, and a{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#3f3f46] font-bold">journal</span>
                  <span className="absolute inset-x-0 bottom-0 h-2 bg-[#d9b89c]/50 -rotate-1"></span>
                </span>
                {' '}for your portfolio. From scattered trades to disciplined, documented strategy.
              </p>
              <p className="text-xl text-[#52525b] italic">A rope for your Kite account</p>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link href="/dashboard">
                <Button
                  className="group px-10 py-8 text-xl bg-[#18181b] hover:bg-[#27272a] text-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[4px] hover:translate-y-[4px] rounded-2xl"
                >
                  Open Dashboard
                  <ArrowRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Three Pillars */}
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mental Model */}
            <div className="bg-[#d9b89c] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-2xl p-8 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border-4 border-black rounded-xl mb-4">
                <Zap className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Mental Model</h3>
              <p className="text-[#2d2d2d]">
                Manjha analyzes patterns, learns your style, and builds a living mental model of your trading behavior.
              </p>
            </div>

            {/* Discipline Engine */}
            <div className="bg-[#e5c9c9] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-2xl p-8 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border-4 border-black rounded-xl mb-4">
                <BarChart3 className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Discipline Engine</h3>
              <p className="text-[#2d2d2d]">
                Get personalized rules, decision flows, and risk guardrails that adapt to your portfolio's reality.
              </p>
            </div>

            {/* Portfolio Journal */}
            <div className="bg-[#d4c4e1] border-4 border-black shadow-[6px_6px_0px_0px_#000000] rounded-2xl p-8 hover:shadow-[3px_3px_0px_0px_#000000] hover:translate-x-[3px] hover:translate-y-[3px] transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#18181b] border-4 border-black rounded-xl mb-4">
                <BookOpen className="size-8 text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3">Portfolio Journal</h3>
              <p className="text-[#2d2d2d]">
                Every trade, every decision, every lesson—logged, searchable, and ready to surface insights when you need them.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] rounded-2xl p-12">
            <h3 className="text-4xl font-black mb-4">
              Not just P&L, a memory for your money.
            </h3>
            <p className="text-xl text-[#5a5a5a] mb-8 max-w-2xl mx-auto">
              Stop trading blind. Start building discipline, clarity, and a portfolio that learns with you.
            </p>
            <Link href="/dashboard">
              <Button
                className="group px-10 py-8 text-xl bg-[#18181b] hover:bg-[#27272a] text-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#000000] transition-all hover:translate-x-[4px] hover:translate-y-[4px] rounded-2xl"
              >
                Get Started
                <ArrowRight className="ml-2 size-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

