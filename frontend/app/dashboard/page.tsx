"use client";

import React, { useState } from "react";
import { useGenLayer } from "@/lib/genlayer-client";
import PactCard from "@/components/PactCard";
import Link from "next/link";
import { Trophy, Coins, Target, Award, Compass, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { pacts, stats, isConnected, isMockMode, connectWallet } = useGenLayer();
  const [filter, setFilter] = useState<"all" | "active" | "history">("all");

  const activePacts = pacts.filter((p) => p.status === "active" || p.status === "verifying");
  const historyPacts = pacts.filter((p) => p.status === "succeeded" || p.status === "failed" || p.status === "claimed");

  const filteredPacts = pacts.filter((p) => {
    if (filter === "active") return p.status === "active" || p.status === "verifying";
    if (filter === "history") return p.status === "succeeded" || p.status === "failed" || p.status === "claimed";
    return true;
  });

  const getReputationBadge = (successRate: number, totalPacts: number) => {
    if (totalPacts === 0) return { name: "Novice Staker", style: "border-zinc-700/50 bg-zinc-800 text-zinc-400" };
    if (successRate >= 90 && totalPacts >= 5) return { name: "Diamond Discipline 💎", style: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-glow-green" };
    if (successRate >= 80 && totalPacts >= 3) return { name: "Gold Achiever 🌟", style: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" };
    if (successRate >= 60) return { name: "Silver Staker 🥈", style: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300" };
    return { name: "Bronze Novice 🥉", style: "border-orange-500/30 bg-orange-500/10 text-orange-400" };
  };

  const totalUserPacts = stats.success_count + stats.failure_count;
  const badge = getReputationBadge(stats.success_rate, totalUserPacts);

  const stakedInGen = (Number(stats.total_staked) / 1e18).toFixed(0);
  const wonInGen = (Number(stats.total_won) / 1e18).toFixed(1);
  const lostInGen = (Number(stats.total_lost) / 1e18).toFixed(1);

  return (
    <div className="space-y-10">
      {/* Reputation & Performance Stats Header */}
      <section className="glass-card rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-100">
              My Discipline Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Live reputation score and capital performance held by GenVM referees.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Reputation Level:
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${badge.style}`}>
              {badge.name}
            </span>
          </div>
        </div>

        {/* Numeric stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block leading-none mb-1">
                Success Rate
              </span>
              <span className="text-2xl font-black text-zinc-100">{stats.success_rate}%</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                {stats.success_count} wins / {stats.failure_count} losses
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Coins className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block leading-none mb-1">
                Staked Capital
              </span>
              <span className="text-2xl font-black text-emerald-400 text-glow-green">{stakedInGen} GEN</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Total aggregate stakings
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Award className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block leading-none mb-1">
                Refunds Claimed
              </span>
              <span className="text-2xl font-black text-zinc-100">{wonInGen} GEN</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                Capital saved (-1% fee)
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <Target className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block leading-none mb-1">
                Lost to Charity
              </span>
              <span className="text-2xl font-black text-red-400">{lostInGen} GEN</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">
                100% sent to causes on failure
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Commitments lists */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <h2 className="text-xl font-black tracking-tight text-zinc-100 flex items-center gap-2">
            <Compass className="h-5.5 w-5.5 text-orange-500" />
            My Staked Commitments ({pacts.length})
          </h2>

          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-950 p-1 border border-white/5 w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filter === "all" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filter === "active" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Active ({activePacts.length})
            </button>
            <button
              onClick={() => setFilter("history")}
              className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                filter === "history" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              History ({historyPacts.length})
            </button>
          </div>
        </div>

        {filteredPacts.length === 0 ? (
          <div className="glass-card rounded-2xl border border-white/5 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-zinc-800/80 border border-white/5 flex items-center justify-center text-xl">
              💡
            </div>
            <div>
              <h3 className="font-bold text-zinc-200">No Commitments in this Segment</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1 leading-normal">
                "The secret of getting ahead is getting started." Build a goal template to start staking discipline.
              </p>
            </div>
            <Link
              href="/create"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Create A Pact</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPacts.map((pact) => (
              <PactCard key={pact.id} pact={pact} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
