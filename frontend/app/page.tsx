"use client";

import React from "react";
import Link from "next/link";
import { useGenLayer } from "@/lib/genlayer-client";
import PactCard from "@/components/PactCard";
import { Sparkles, Trophy, ShieldCheck, Flame, ArrowRight, Zap, Target } from "lucide-react";

export default function Home() {
  const { pacts } = useGenLayer();

  // Social Proof Ticker Items
  const tickerItems = [
    { text: "🔥 0x4f...a8 staked 50 GEN on 'Run 100km this month'", type: "stake" },
    { text: "✅ 0x2c...3b achieved their goal! +49.5 GEN returned", type: "win" },
    { text: "💀 0x9a...1f failed 'Learn Spanish daily' — 100 GEN donated to Anti-Charity", type: "loss" },
    { text: "🔥 0x7b...c4 staked 25 GEN on 'Commit code every day'", type: "stake" },
    { text: "✅ 0x3d...ef achieved their goal! +24.75 GEN returned", type: "win" },
  ];

  const activePacts = pacts.filter((p) => p.status === "active");

  return (
    <div className="space-y-16">
      {/* 1. Live Global Activity Ticker */}
      <div className="relative w-full overflow-hidden border-y border-white/5 bg-zinc-950/40 py-3.5 backdrop-blur-sm -mx-6 px-6">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap gap-12 text-xs font-semibold tracking-wide uppercase">
          {/* Double up items to ensure smooth scrolling */}
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span
              key={idx}
              className={`flex items-center gap-2 ${
                item.type === "win"
                  ? "text-emerald-400 text-glow-green"
                  : item.type === "loss"
                  ? "text-red-400"
                  : "text-zinc-400"
              }`}
            >
              <Zap className="h-3 w-3 fill-current shrink-0" />
              {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6 pt-10">
        <div className="flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-orange-400 animate-bounce-slow">
          <Flame className="h-3.5 w-3.5 fill-current" />
          <span>Commitment Staking is Live</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight sm:text-7xl leading-[1.1] font-sans">
          Bet On Yourself.
          <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent block mt-2">
            Let AI Hold You Accountable.
          </span>
        </h1>

        <p className="max-w-2xl text-base text-zinc-400 sm:text-lg leading-relaxed">
          Pact is a decentralized commitment platform where you stake real money on personal goals. 
          <strong> AI Validators autonomously verify goal completion</strong> by reading public Web2 profiles.
          Succeed and refund your stake. Fail and donate it to charity (or your most hated anti-charity).
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <Link
            href="/create"
            className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 px-8 py-4 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Create Your First Pact</span>
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-zinc-900 border border-white/5 hover:border-white/15 px-8 py-4 text-sm font-bold uppercase tracking-wider text-zinc-300 hover:text-white transition-all"
          >
            My Dashboard
          </Link>
        </div>
      </section>

      {/* 3. Features Highlight Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Trophy className="h-5 w-5" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-200">
            Intelligent Accountability
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No human referee needed. The contract uses GenLayer's AI Validators to autonomously read the web, evaluate logs, and judge fairly.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Flame className="h-5 w-5" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-200">
            Anti-Charity Stake Locking
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Choose to direct your failed stakes to an organization you despise. Creates the ultimate psychological friction to guarantee consistency.
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-200">
            Trustless & Decentralized
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Built as a GenLayer Intelligent Contract. Code executes deterministically, holding stakes in absolute cryptographic isolation until evaluated.
          </p>
        </div>
      </section>

      {/* 4. Active Commitments preview Feed */}
      <section className="space-y-6 pt-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-100 flex items-center gap-2">
              <Target className="h-6 w-6 text-orange-500" />
              Active Public Commitments
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Real commitments active globally. Watch users bet on their discipline.
            </p>
          </div>
          <Link
            href="/create"
            className="text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5"
          >
            <span>Bet on yourself</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {activePacts.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/5 p-12 text-center">
            <p className="text-zinc-500 text-sm italic">
              "The journey of 100km begins with a single step." No active commitments found. Be the first!
            </p>
            <Link
              href="/create"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-800 border border-white/5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white"
            >
              Start A Pact
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activePacts.map((pact) => (
              <PactCard key={pact.id} pact={pact} />
            ))}
          </div>
        )}
      </section>

      {/* CSS animation inline for marquee scroll */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
