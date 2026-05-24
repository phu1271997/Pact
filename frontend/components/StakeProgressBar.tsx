"use client";

import React from "react";
import { Coins, Heart, Percent, ShieldAlert } from "lucide-react";

interface StakeProgressBarProps {
  stakeWei: string;
  startTs: number;
  deadlineTs: number;
  status: string;
  beneficiaryName: string;
}

export default function StakeProgressBar({
  stakeWei,
  startTs,
  deadlineTs,
  status,
  beneficiaryName
}: StakeProgressBarProps) {
  const stakeGen = Number(stakeWei) / 1e18;
  const platformFee = stakeGen * 0.01;
  const refundAmount = stakeGen - platformFee;

  const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getPercentageElapsed = () => {
    const now = Math.floor(Date.now() / 1000);
    const total = deadlineTs - startTs;
    const elapsed = now - startTs;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const elapsedPct = getPercentageElapsed();

  return (
    <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-6">
      <div>
        <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-widest text-zinc-400">
          <Coins className="h-4.5 w-4.5 text-orange-500" />
          Locked Capital Dynamics
        </h3>
        <p className="text-[11px] text-zinc-500 mt-1">
          Financial breakdowns managed autonomously by GenLayer smart contract.
        </p>
      </div>

      {/* Grid of outcomes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Outcome 1: Refund */}
        <div className="rounded-xl bg-zinc-900/60 p-4 border border-emerald-500/10 flex flex-col justify-between">
          <div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
              <Coins className="h-4.5 w-4.5" />
            </span>
            <h4 className="text-xs font-bold text-zinc-300">Refund on Success</h4>
            <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
              If you achieve your goal, your stake is returned minus a 1% platform fee.
            </p>
          </div>
          <span className="text-xl font-black text-emerald-400 text-glow-green mt-4 block">
            {refundAmount.toFixed(2)} GEN
          </span>
        </div>

        {/* Outcome 2: Fee */}
        <div className="rounded-xl bg-zinc-900/60 p-4 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 border border-white/5 text-zinc-400 mb-2">
              <Percent className="h-4.5 w-4.5" />
            </span>
            <h4 className="text-xs font-bold text-zinc-300">Platform Fee</h4>
            <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
              A 1% developer fee is retained exclusively on successful goals.
            </p>
          </div>
          <span className="text-xl font-black text-zinc-400 mt-4 block">
            {platformFee.toFixed(2)} GEN
          </span>
        </div>

        {/* Outcome 3: Loss */}
        <div className="rounded-xl bg-zinc-900/60 p-4 border border-red-500/10 flex flex-col justify-between">
          <div>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 mb-2">
              <Heart className="h-4.5 w-4.5" />
            </span>
            <h4 className="text-xs font-bold text-zinc-300">Penalty on Failure</h4>
            <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
              If you fail, 100% of your stake is sent directly to your chosen beneficiary:
            </p>
            <span className="mt-1.5 block rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase tracking-widest w-fit">
              {beneficiaryName}
            </span>
          </div>
          <span className="text-xl font-black text-red-400 mt-4 block">
            {stakeGen.toFixed(2)} GEN
          </span>
        </div>
      </div>

      {/* Date Timeline bar */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex justify-between items-center text-xs text-zinc-400 font-bold">
          <span className="flex flex-col">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Start Date</span>
            {formatDate(startTs)}
          </span>
          <span className="flex flex-col text-right">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">Deadline</span>
            {formatDate(deadlineTs)}
          </span>
        </div>

        {status === "active" && (
          <div className="relative">
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-1000"
                style={{ width: `${elapsedPct}%` }}
              />
            </div>
            {elapsedPct > 0 && elapsedPct < 100 && (
              <span
                className="absolute top-3 text-[9px] font-bold uppercase tracking-wider text-zinc-500 -translate-x-1/2"
                style={{ left: `${elapsedPct}%` }}
              >
                Today ({Math.round(elapsedPct)}%)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
