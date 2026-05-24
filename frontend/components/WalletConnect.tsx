"use client";

import React from "react";
import { useGenLayer } from "@/lib/genlayer-client";
import { Link2, Zap, LogOut, Loader2 } from "lucide-react";

export default function WalletConnect() {
  const {
    isConnected,
    address,
    balance,
    isMockMode,
    loading,
    connectWallet,
    disconnectWallet,
    toggleMockMode,
  } = useGenLayer();

  const getAbbreviatedAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Mode Status Toggle */}
      <button
        onClick={() => toggleMockMode(!isMockMode)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border transition-all ${
          isMockMode
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20 active-glow"
            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        }`}
        title="Click to toggle between real Web3 and Mock Preview mode"
      >
        <Zap className="h-3 w-3 fill-current" />
        <span>{isMockMode ? "Preview Mode" : "MetaMask Mode"}</span>
      </button>

      {isConnected ? (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 p-1.5 pl-4 backdrop-blur-sm">
          <div className="flex flex-col items-start pr-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Balance
            </span>
            <span className="text-xs font-bold text-zinc-200">
              {balance} GEN
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1.5 border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-zinc-300">
              {address ? getAbbreviatedAddress(address) : ""}
            </span>
            <button
              onClick={disconnectWallet}
              className="text-zinc-500 hover:text-red-400 transition-colors ml-1"
              title="Disconnect Wallet"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] border border-orange-400/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4 transition-transform group-hover:rotate-45" />
          )}
          <span>{loading ? "Connecting..." : "Connect MetaMask"}</span>
        </button>
      )}
    </div>
  );
}
