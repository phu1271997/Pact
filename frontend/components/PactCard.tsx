"use client";

import React, { useState, useEffect } from "react";
import { Pact } from "@/lib/types";
import Link from "next/link";
import { Calendar, Shield, Sparkles, TrendingUp, Trophy } from "lucide-react";

interface PactCardProps {
  pact: Pact;
}

export default function PactCard({ pact }: PactCardProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "fitness": return "🏃";
      case "coding": return "💻";
      case "writing": return "✍️";
      case "learning": return "🌍";
      case "creative": return "🎬";
      case "reading": return "📚";
      default: return "🎯";
    }
  };

  useEffect(() => {
    const calculateTimeMetrics = () => {
      const now = Math.floor(Date.now() / 1000);
      const totalDuration = pact.deadline_timestamp - pact.start_timestamp;
      const elapsed = now - pact.start_timestamp;

      // Calculate progress percentage
      if (pact.status !== "active") {
        setProgressPercent(100);
        return;
      }

      const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      setProgressPercent(pct);

      // Calculate time left string
      const secondsLeft = pact.deadline_timestamp - now;
      if (secondsLeft <= 0) {
        setTimeLeftStr("Ready for verification ⚖️");
      } else {
        const days = Math.floor(secondsLeft / 86400);
        const hours = Math.floor((secondsLeft % 86400) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);

        if (days > 0) {
          setTimeLeftStr(`${days}d ${hours}h left`);
        } else if (hours > 0) {
          setTimeLeftStr(`${hours}h ${minutes}m left`);
        } else {
          setTimeLeftStr(`${minutes}m left`);
        }
      }
    };

    calculateTimeMetrics();
    const interval = setInterval(calculateTimeMetrics, 60000);
    return () => clearInterval(interval);
  }, [pact]);

  const stakeInGen = (Number(pact.stake_amount) / 1e18).toFixed(0);

  // Status Styling Dictionary
  const statusStyles = {
    active: "bg-orange-500/10 text-orange-400 border-orange-500/20 active-glow",
    verifying: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-glow-green",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    claimed: "bg-zinc-800 text-zinc-500 border-zinc-700/50"
  };

  return (
    <Link href={`/pact/${pact.id}`} className="block">
      <div className="glass-card glass-card-hover group relative flex flex-col justify-between rounded-2xl border p-6 min-h-[280px]">
        {/* Top Header Card */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/80 text-2xl border border-white/5 shadow-inner">
              {getCategoryIcon(pact.category)}
            </span>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none block mb-0.5">
                {pact.category}
              </span>
              <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                {pact.title}
              </h3>
            </div>
          </div>

          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${statusStyles[pact.status]}`}>
            {pact.status}
          </span>
        </div>

        {/* Description Body */}
        <p className="text-zinc-400 text-xs mt-4 line-clamp-2 leading-relaxed">
          {pact.description}
        </p>

        {/* Middle Stats - Stake display */}
        <div className="my-6 grid grid-cols-2 gap-4 border-y border-white/5 py-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Stake Amount
            </span>
            <span className={`text-xl font-black bg-gradient-to-r ${pact.status === 'succeeded' ? 'from-emerald-400 to-cyan-500' : pact.status === 'failed' ? 'from-zinc-500 to-red-500' : 'from-orange-400 to-red-500'} bg-clip-text text-transparent`}>
              {stakeInGen} GEN
            </span>
          </div>
          <div className="flex flex-col justify-end">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
              Time Remaining
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              {pact.status === "active" ? timeLeftStr : "Finished"}
            </span>
          </div>
        </div>

        {/* Bottom Progress details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <span>Commitment Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pact.status === "succeeded"
                  ? "bg-gradient-to-r from-emerald-400 to-cyan-500 text-glow-green"
                  : pact.status === "failed"
                  ? "bg-red-600/50"
                  : "bg-gradient-to-r from-orange-500 to-red-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
