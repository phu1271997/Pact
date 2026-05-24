"use client";

import React from "react";
import { Trophy, Award, Zap, Coins, Flame, Star } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  address: string;
  successRate: number;
  totalStaked: string; // GEN
  streak: number;
  badge: string;
  badgeColor: string;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x2c6b3252495b45f490f2305a415a77cf59755490",
    successRate: 96,
    totalStaked: "225",
    streak: 12,
    badge: "Diamond Discipline 💎",
    badgeColor: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-glow-green"
  },
  {
    rank: 2,
    address: "0x4fb83a1523f46f490f2305a415a77cf5975583b2",
    successRate: 91,
    totalStaked: "180",
    streak: 8,
    badge: "Gold Achiever 🌟",
    badgeColor: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
  },
  {
    rank: 3,
    address: "0x7bc483a1523f46f490f2305a415a77cf5975583f7",
    successRate: 88,
    totalStaked: "150",
    streak: 6,
    badge: "Gold Achiever 🌟",
    badgeColor: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
  },
  {
    rank: 4,
    address: "0x3def83a1523f46f490f2305a415a77cf5975583a1",
    successRate: 80,
    totalStaked: "110",
    streak: 4,
    badge: "Silver Staker 🥈",
    badgeColor: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
  },
  {
    rank: 5,
    address: "0x9a71f83a1523f46f490f2305a415a77cf59755831f",
    successRate: 75,
    totalStaked: "90",
    streak: 3,
    badge: "Silver Staker 🥈",
    badgeColor: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300"
  }
];

export default function Leaderboard() {
  const getAbbreviatedAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center md:text-left">
        <h1 className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-3xl font-black tracking-tight text-transparent flex items-center justify-center md:justify-start gap-2">
          <Trophy className="h-8 w-8 text-orange-500" />
          Discipline Leaderboard
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Top commitment achievers on the GenLayer network. Building reputation block by block.
        </p>
      </div>

      {/* Podium Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {MOCK_LEADERBOARD.slice(0, 3).map((user) => (
          <div
            key={user.rank}
            className={`glass-card relative flex flex-col items-center p-6 rounded-2xl border text-center transition-all ${
              user.rank === 1
                ? "border-yellow-500/20 bg-yellow-500/[0.02] shadow-md shadow-yellow-500/[0.02]"
                : user.rank === 2
                ? "border-zinc-400/15 bg-zinc-400/[0.01]"
                : "border-orange-500/15 bg-orange-500/[0.01]"
            }`}
          >
            <span className="text-4xl mb-3">{getRankEmoji(user.rank)}</span>
            <span className="font-mono text-sm font-bold text-zinc-200">
              {getAbbreviatedAddress(user.address)}
            </span>
            <span className={`mt-2 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${user.badgeColor}`}>
              {user.badge}
            </span>

            <div className="grid grid-cols-3 gap-4 w-full mt-6 pt-4 border-t border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                  Success
                </span>
                <span className="text-sm font-black text-emerald-400">{user.successRate}%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                  Staked
                </span>
                <span className="text-sm font-black text-zinc-200">{user.totalStaked} G</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                  Streak
                </span>
                <span className="text-sm font-black text-orange-400 flex items-center gap-0.5 justify-center">
                  <Flame className="h-3.5 w-3.5 fill-current shrink-0" />
                  {user.streak}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Rankings list table */}
      <div className="glass-card overflow-hidden rounded-2xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="p-4 pl-6">Rank</th>
                <th className="p-4">User Address</th>
                <th className="p-4">Success Rate</th>
                <th className="p-4">Staked Capital</th>
                <th className="p-4">Streak (Goals)</th>
                <th className="p-4 pr-6">Discipline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
              {MOCK_LEADERBOARD.map((user) => (
                <tr
                  key={user.rank}
                  className="hover:bg-zinc-900/10 transition-colors"
                >
                  <td className="p-4 pl-6 font-bold text-zinc-400">
                    <span className="text-sm">{getRankEmoji(user.rank)}</span>
                  </td>
                  <td className="p-4 font-mono font-semibold">
                    {getAbbreviatedAddress(user.address)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400">{user.successRate}%</span>
                      <div className="h-1.5 w-16 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${user.successRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-zinc-300 flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-zinc-500" />
                    {user.totalStaked} GEN
                  </td>
                  <td className="p-4 font-bold text-orange-400">
                    <span className="flex items-center gap-1">
                      <Flame className="h-4.5 w-4.5 fill-current" />
                      {user.streak} active
                    </span>
                  </td>
                  <td className="p-4 pr-6">
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${user.badgeColor}`}>
                      {user.badge.split(" ")[0]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
