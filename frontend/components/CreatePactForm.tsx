"use client";

import React, { useState, useEffect } from "react";
import { TEMPLATES, PactTemplate } from "@/lib/pact-templates";
import { useGenLayer } from "@/lib/genlayer-client";
import CharityPicker from "./CharityPicker";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, ShieldAlert, Coins, Calendar, Link2, Info } from "lucide-react";

export default function CreatePactForm() {
  const router = useRouter();
  const { createPact, isMockMode, isConnected } = useGenLayer();

  // Step state
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("code-streak");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [verificationUrl, setVerificationUrl] = useState<string>("");
  const [successCriteria, setSuccessCriteria] = useState<string>("");
  const [durationDays, setDurationDays] = useState<number>(30);
  const [stakeAmount, setStakeAmount] = useState<string>("10");
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>("0x81C7656EC7ab88b098defB751B7401B5f6d8976F"); // Rival Team default

  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [createdPactId, setCreatedPactId] = useState<number | null>(null);

  // Prefill fields when template changes
  const applyTemplate = (tpl: PactTemplate) => {
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.title);
    setCategory(tpl.category);
    setVerificationUrl(tpl.placeholder_url);

    // Build default description & success criteria
    if (tpl.id === "code-streak") {
      setDescription("Maintain a consistent coding habit by committing public code to my GitHub every single day.");
      setSuccessCriteria(`At least 1 public commit per day for ${durationDays} days starting from today.`);
    } else if (tpl.id === "run-streak") {
      setDescription("Track and log running activities on Strava to reach the total target volume this month.");
      setSuccessCriteria(`Strava profile activity logs must show a total aggregate running distance >= 100km between starting and deadline timestamps.`);
    } else if (tpl.id === "writing-streak") {
      setDescription("Write and publish tech blogs consistently on Medium to share insights with the community.");
      setSuccessCriteria("Medium profile must show at least 4 published blog posts during the commitment timeframe.");
    } else if (tpl.id === "language-learning") {
      setDescription("Commit to daily language learning on Duolingo to build Spanish conversational fluency.");
      setSuccessCriteria(`Maintain a Duolingo learning streak of ${durationDays} consecutive days.`);
    } else if (tpl.id === "youtube-creator") {
      setDescription("Log public videos to YouTube channel to build consistency in creating quality tech content.");
      setSuccessCriteria("YouTube channel profile must show at least 3 uploaded public videos during this commitment.");
    } else if (tpl.id === "reading-challenge") {
      setDescription("Dedicate focused time to read high-impact books and log them as completed on Goodreads.");
      setSuccessCriteria("Goodreads profile must show at least 2 books marked as 'read' during the timeline.");
    } else {
      setDescription("Personal commitment goal.");
      setSuccessCriteria("Goal completed.");
    }
  };

  // Populate first template on mount
  useEffect(() => {
    const defaultTpl = TEMPLATES.find((t) => t.id === "code-streak");
    if (defaultTpl) applyTemplate(defaultTpl);
  }, []);

  // Update success criteria if duration changes
  const handleDurationChange = (days: number) => {
    setDurationDays(days);
    const activeTpl = TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (activeTpl) {
      if (activeTpl.id === "code-streak") {
        setSuccessCriteria(`At least 1 public commit per day for ${days} days starting from today.`);
      } else if (activeTpl.id === "language-learning") {
        setSuccessCriteria(`Maintain a Duolingo learning streak of ${days} consecutive days.`);
      }
    }
  };

  const handleDeployPact = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pactId = await createPact(
        title,
        description,
        category,
        verificationUrl,
        successCriteria,
        durationDays,
        beneficiaryAddress,
        stakeAmount
      );

      setCreatedPactId(pactId);
      setSuccess(true);
      setLoading(false);

      // Redirect after 3s
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);

    } catch (err) {
      console.error(err);
      alert("Transaction failed or was rejected. Running in Preview mode?");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
          Create A New Commitment
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
          Put your money where your mouth is. Choose a goal, stake native GEN tokens, and let the AI Validator keep you honest.
        </p>
      </div>

      {success ? (
        <div className="glass-card flex flex-col items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-12 text-center animate-bounce-slow">
          <CheckCircle2 className="h-16 w-16 text-emerald-400 text-glow-green mb-4" />
          <h2 className="text-2xl font-bold text-zinc-100">Commitment Locked On-Chain!</h2>
          <p className="text-sm text-zinc-400 mt-2 max-w-md">
            Your stake of <strong className="text-emerald-400 font-bold">{stakeAmount} GEN</strong> has been safely locked in the Intelligent Contract.
            {isMockMode && " Running in Preview Mode: Redirecting to dashboard..."}
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest leading-none">
              Pact ID
            </span>
            <span className="font-mono text-lg font-black text-emerald-400">
              #{createdPactId || 4}
            </span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDeployPact} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Step 1: Select Template Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Step 1: Pick a Goal Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className={`glass-card flex flex-col items-center gap-2 rounded-xl border p-4 transition-all duration-300 ${
                        selectedTemplateId === tpl.id
                          ? "border-orange-500/40 bg-orange-500/5"
                          : "border-white/5 bg-zinc-900/20 hover:bg-zinc-900/40"
                      }`}
                    >
                      <span className="text-2xl">{tpl.icon}</span>
                      <span className="text-[10px] font-bold text-zinc-300 line-clamp-1 leading-none uppercase">
                        {tpl.title.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Goal configurations */}
              <div className="glass-card rounded-2xl border p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Goal Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/30"
                      placeholder="e.g. Commit code every day"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm text-zinc-400 focus:outline-none uppercase font-bold"
                      readOnly
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    Goal Description
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/30 resize-none leading-relaxed"
                    placeholder="Provide a motivating detailed description of your goal..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                      <Link2 className="h-3 w-3 text-zinc-500" />
                      Public Profile URL
                    </label>
                    <input
                      type="url"
                      required
                      value={verificationUrl}
                      onChange={(e) => setVerificationUrl(e.target.value)}
                      className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/30 font-mono"
                      placeholder="https://github.com/your_username"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-zinc-500" />
                      AI Success Criteria (Plain English)
                    </label>
                    <input
                      type="text"
                      required
                      value={successCriteria}
                      onChange={(e) => setSuccessCriteria(e.target.value)}
                      className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/30"
                      placeholder="e.g. Scanned Strava logs must show total 100km..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-zinc-500" />
                      Staked Capital (GEN)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm font-black text-orange-400 focus:outline-none focus:border-orange-500/30"
                      placeholder="10"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={durationDays}
                      onChange={(e) => handleDurationChange(Number(e.target.value))}
                      className="rounded-lg bg-zinc-900 border border-white/5 p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/30"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 rounded-full bg-zinc-800 border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-100 hover:bg-zinc-700 hover:text-white transition-all hover:scale-[1.02]"
                >
                  <span>Select Beneficiary</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 2 Header */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Step 3: Select Failure Beneficiary Address
                </label>
                <CharityPicker
                  onSelect={setBeneficiaryAddress}
                  selectedAddress={beneficiaryAddress}
                />
              </div>

              {/* Staking Summary Review layout */}
              <div className="glass-card rounded-2xl border border-orange-500/10 bg-orange-500/2.5 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-orange-400 flex items-center gap-2">
                  <ShieldAlert className="h-4.5 w-4.5" />
                  Staking Commitment Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                      Risk Staked
                    </span>
                    <span className="text-lg font-black text-zinc-100">
                      {stakeAmount} GEN
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                      Timeframe
                    </span>
                    <span className="text-xs font-bold text-zinc-300">
                      {durationDays} Days
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                      Ref / Criteria
                    </span>
                    <span className="text-xs font-bold text-zinc-300 truncate" title={successCriteria}>
                      {successCriteria}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">
                      Platform Fee
                    </span>
                    <span className="text-xs font-bold text-zinc-300">
                      1% on SUCCESS
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full bg-zinc-900 border border-white/5 hover:border-white/15 px-6 py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-200 transition-all"
                >
                  Back to Config
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] border border-orange-400/20 disabled:opacity-50"
                >
                  <Sparkles className="h-4.5 w-4.5 text-yellow-300 animate-pulse" />
                  <span>
                    {loading
                      ? "Locking stake on GenLayer..."
                      : `Stake ${stakeAmount} GEN & Start`}
                  </span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
