"use client";

import React, { useState } from "react";
import { Charity } from "@/lib/types";
import { Smile, Frown, Sparkles, AlertCircle } from "lucide-react";

interface CharityPickerProps {
  onSelect: (address: string) => void;
  selectedAddress: string;
}

const PRESET_CHARITIES: Charity[] = [
  {
    id: "earth-preservation",
    name: "Earth Preservation Fund",
    logo: "🌳",
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "Supports global reforestation efforts, wildlife protection, and urgent climate action initiatives.",
    type: "charity"
  },
  {
    id: "give-directly",
    name: "GiveDirectly Global",
    logo: "💸",
    address: "0x21C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "Sends unconditional cash transfers directly to families living in extreme poverty globally.",
    type: "charity"
  },
  {
    id: "doctors-without-borders",
    name: "Doctors Without Borders",
    logo: "❤️",
    address: "0x31C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "Provides life-saving medical humanitarian care in conflict zones and disaster areas.",
    type: "charity"
  },
  {
    id: "rival-sports",
    name: "Rival Sports Fan Club Fund",
    logo: "🐐",
    address: "0x81C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "Funds the official supporter merchandise, banners, and victory parades of your most hated rival sports team.",
    type: "anticharity"
  },
  {
    id: "carbon-heavy",
    name: "Carbon-Emissions Expansion Fund",
    logo: "🏭",
    address: "0x91C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "An ironic support fund that funds coal power promotion and gas-guzzling events. Maximize your pain on failure!",
    type: "anticharity"
  },
  {
    id: "irony-bureaucracy",
    name: "Bureaucracy & Inefficiency League",
    logo: "🗂️",
    address: "0xA1C7656EC7ab88b098defB751B7401B5f6d8976F",
    description: "Dedicated to lobbying for longer public queues, more complex tax forms, and slower municipal processing.",
    type: "anticharity"
  }
];

export default function CharityPicker({ onSelect, selectedAddress }: CharityPickerProps) {
  const [activeTab, setActiveTab] = useState("charity");

  const filteredPresets = PRESET_CHARITIES.filter((c) => c.type === activeTab);

  const handleSelectCharity = (charity: Charity) => {
    onSelect(charity.address);
  };

  return (
    <div className="space-y-4">
      {/* Selection Tab Header */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-900/80 p-1 border border-white/5">
        <button
          type="button"
          onClick={() => {
            setActiveTab("charity");
            const firstCharity = PRESET_CHARITIES.find((c) => c.type === "charity");
            if (firstCharity) handleSelectCharity(firstCharity);
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "charity"
              ? "bg-zinc-800 text-emerald-400 border border-white/5 shadow-inner"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Smile className="h-4 w-4" />
          <span>Donate to Charity 😇</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("anticharity");
            const firstAnti = PRESET_CHARITIES.find((c) => c.type === "anticharity");
            if (firstAnti) handleSelectCharity(firstAnti);
          }}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === "anticharity"
              ? "bg-zinc-800 text-red-400 border border-white/5 shadow-inner"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Frown className="h-4 w-4" />
          <span>Anti-Charity 😈</span>
        </button>
      </div>

      {/* Warning/Motivation Banner */}
      <div className={`flex items-start gap-3 rounded-xl p-3 border text-xs leading-relaxed ${
        activeTab === "anticharity"
          ? "bg-red-500/5 border-red-500/10 text-red-300"
          : "bg-emerald-500/5 border-emerald-500/10 text-emerald-300"
      }`}>
        <AlertCircle className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${activeTab === 'anticharity' ? 'text-red-400' : 'text-emerald-400'}`} />
        <p>
          {activeTab === "anticharity" ? (
            <strong>Extreme Psychological Pressure:</strong> "If you fail your commitment, your hard-earned funds will directly support an organization you absolutely oppose. Success is your only option."
          ) : (
            <strong>Motivated by Goodwill:</strong> "Staking on yourself means if you fail, you make a positive impact by supporting a vital global humanitarian cause."
          )}
        </p>
      </div>

      {/* Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredPresets.map((charity) => {
          const isSelected = selectedAddress.toLowerCase() === charity.address.toLowerCase();
          return (
            <div
              key={charity.id}
              onClick={() => handleSelectCharity(charity)}
              className={`glass-card relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? activeTab === "anticharity"
                    ? "border-red-500/40 bg-red-500/5 shadow-md shadow-red-500/5"
                    : "border-emerald-500/40 bg-emerald-500/5 shadow-md shadow-emerald-500/5"
                  : "border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-white/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-xl border border-white/5">
                    {charity.logo}
                  </span>
                  {isSelected && (
                    <span className={`h-2.5 w-2.5 rounded-full ${activeTab === 'anticharity' ? 'bg-red-500 active-glow' : 'bg-emerald-500 text-glow-green'}`} />
                  )}
                </div>
                <h4 className="text-xs font-bold text-zinc-200 line-clamp-1 mb-1">
                  {charity.name}
                </h4>
                <p className="text-[11px] text-zinc-500 leading-normal line-clamp-3">
                  {charity.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="font-mono text-[9px] text-zinc-500 block line-clamp-1 leading-none uppercase">
                  Addr: {charity.address}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
