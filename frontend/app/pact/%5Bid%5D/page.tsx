"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGenLayer } from "@/lib/genlayer-client";
import StakeProgressBar from "@/components/StakeProgressBar";
import VerificationTimeline from "@/components/VerificationTimeline";
import Link from "next/link";
import { Calendar, ShieldAlert, Sparkles, Scale, Heart, Globe, ArrowLeft, Clock, FileText, CheckCircle, Coins } from "lucide-react";

export default function PactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { pacts, verifyPact, claimPact, isMockMode, isConnected } = useGenLayer();

  const pactId = Number(params.id);
  const pact = pacts.find((p) => p.id === pactId);

  // States
  const [timeLeftStr, setTimeLeftStr] = useState<string>("");
  const [canVerify, setCanVerify] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "running" | "success" | "failure">("idle");
  const [claiming, setClaiming] = useState<boolean>(false);

  useEffect(() => {
    if (!pact) return;

    const calculateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = pact.deadline_timestamp - now;

      if (secondsLeft <= 0) {
        setCanVerify(true);
        setTimeLeftStr("Deadline Passed");
      } else {
        setCanVerify(false);
        const days = Math.floor(secondsLeft / 86400);
        const hours = Math.floor((secondsLeft % 86400) / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);

        if (days > 0) {
          setTimeLeftStr(`${days}d ${hours}h ${minutes}m remaining`);
        } else if (hours > 0) {
          setTimeLeftStr(`${hours}h ${minutes}m remaining`);
        } else {
          setTimeLeftStr(`${minutes}m remaining`);
        }
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 10000);
    return () => clearInterval(interval);
  }, [pact]);

  if (!pact) {
    return (
      <div className="glass-card rounded-2xl border border-white/5 p-12 text-center max-w-xl mx-auto my-12">
        <h2 className="text-xl font-bold text-zinc-300">Commitment Not Found</h2>
        <p className="text-xs text-zinc-500 mt-2">
          The requested pact ID does not exist or has not been deployed on-chain yet.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-white/5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const handleVerify = async () => {
    setVerificationStatus("running");
    try {
      const resultStr = await verifyPact(pact.id);
      const result = JSON.parse(resultStr);

      setTimeout(() => {
        if (result.verdict === "SUCCESS") {
          setVerificationStatus("success");
        } else if (result.verdict === "FAILURE") {
          setVerificationStatus("failure");
        } else {
          // Inconclusive -> goes back to active with grace extension
          setVerificationStatus("idle");
          alert("Verdict: INCONCLUSIVE. Contract extended by 24 hours for profile adjustment!");
        }
      }, 20000); // match timeline animation completion

    } catch (err) {
      console.error(err);
      setVerificationStatus("idle");
      alert("Verification transaction failed. Running in preview mode?");
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claimPact(pact.id);
      setClaiming(false);
      alert("Claim transaction successfully completed on-chain!");
    } catch (err) {
      console.error(err);
      setClaiming(false);
      alert("Claim failed. Ensure you are the owner for refunds!");
    }
  };

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

  const stakeInGen = (Number(pact.stake_amount) / 1e18).toFixed(0);

  // Status badges definitions
  const statusStyles = {
    active: "bg-orange-500/10 text-orange-400 border-orange-500/20 active-glow",
    verifying: "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse",
    succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-glow-green",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    claimed: "bg-zinc-800 text-zinc-500 border-zinc-700/50"
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Dashboard</span>
        </Link>
        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest leading-none">
          Pact Registry ID #{pact.id}
        </span>
      </div>

      {/* 2. Top Info Box */}
      <section className="glass-card rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800/80 text-3xl border border-white/5 shadow-inner shrink-0">
              {getCategoryIcon(pact.category)}
            </span>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none block mb-1">
                {pact.category} Commitment
              </span>
              <h1 className="text-2xl font-black text-zinc-100">{pact.title}</h1>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {pact.description}
              </p>
            </div>
          </div>

          <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider w-fit shrink-0 ${statusStyles[pact.status]}`}>
            {pact.status}
          </span>
        </div>

        {/* 3. Timeline & Staking statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timeline box */}
          <div className="flex items-start gap-3 rounded-xl bg-zinc-900/40 border border-white/5 p-4">
            <Clock className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none block">
                Verification Countdown
              </span>
              {pact.status === "active" ? (
                <div className="space-y-1">
                  <span className="text-sm font-bold text-zinc-200 block">{timeLeftStr}</span>
                  <span className="text-[10px] text-zinc-500 block">
                    AI verification becomes triggerable immediately once this countdown reaches zero.
                  </span>
                </div>
              ) : (
                <span className="text-sm font-bold text-zinc-500">Timeline Concluded</span>
              )}
            </div>
          </div>

          {/* Staked capital banner */}
          <div className="flex items-start gap-3 rounded-xl bg-zinc-900/40 border border-white/5 p-4">
            <Coins className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none block">
                Locked Stake Volume
              </span>
              <span className="text-lg font-black text-emerald-400 text-glow-green block">
                {stakeInGen} GEN
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Staked safely on GenLayer. Payout is determined by autonomous AI audit.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Trigger States */}
      {verificationStatus === "running" ? (
        <VerificationTimeline
          status={verificationStatus}
          onComplete={() => {}}
        />
      ) : (
        <>
          {/* Trigger Verification Button (Active state + deadline passed) */}
          {pact.status === "active" && (
            <div className="glass-card rounded-2xl border border-orange-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-widest text-zinc-300">
                  <Scale className="h-4.5 w-4.5 text-orange-500" />
                  AI Verification Dispatcher
                </h3>
                <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                  {canVerify
                    ? "The deadline has passed! Anyone can now trigger the autonomous AI Validator to scan your Web2 profile and render the verdict."
                    : "The deadline is not yet completed. The verification dispatcher becomes active once the countdown reaches zero."}
                </p>
              </div>

              <button
                onClick={handleVerify}
                disabled={!canVerify}
                className="rounded-full bg-gradient-to-r from-orange-500 to-red-600 border border-orange-400/20 px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100 shrink-0"
              >
                Trigger AI Verification ⚖️
              </button>
            </div>
          )}

          {/* Trigger Claim Payout buttons */}
          {(pact.status === "succeeded" || pact.status === "failed") && (
            <div className="glass-card rounded-2xl border border-emerald-500/10 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1.5 text-center md:text-left">
                <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-widest text-zinc-300">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                  Payout Claim Dispatcher
                </h3>
                <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                  {pact.status === "succeeded"
                    ? "Congratulations! The AI Validator has confirmed your success. You can now claim your 99% refund."
                    : "Unfortunately, the commitment failed. Anyone can trigger this payout dispatch to transfer the locked stake directly to the charity."}
                </p>
              </div>

              <button
                onClick={handleClaim}
                disabled={claiming}
                className={`rounded-full px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg border disabled:opacity-40 shrink-0 hover:scale-[1.03] active:scale-[0.98] transition-all ${
                  pact.status === "succeeded"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-600 border-emerald-400/20"
                    : "bg-zinc-800 border-zinc-700"
                }`}
              >
                {claiming ? "Claiming..." : pact.status === "succeeded" ? "Claim Refund 💸" : "Execute Donation 💔"}
              </button>
            </div>
          )}

          {/* Claimed/Finished Final Report Receipts */}
          {pact.status === "claimed" && (
            <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4">
              <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-sm uppercase tracking-widest text-zinc-400">
                <FileText className="h-4.5 w-4.5" />
                Audited Payout Receipt
              </h3>

              <div className="rounded-xl bg-zinc-900/60 p-4 border border-white/5 space-y-3">
                <div className="flex justify-between text-xs text-zinc-500 border-b border-white/5 pb-2">
                  <span>Verdict Decision</span>
                  <span className={`font-bold ${pact.ai_verdict === 'SUCCESS' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {pact.ai_verdict} (Confidence: {pact.ai_confidence}%)
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block leading-none">
                    AI reasoning & Explanation:
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans mt-1">
                    {pact.ai_reasoning}
                  </p>
                </div>
                <div className="flex justify-between text-xs text-zinc-500 border-t border-white/5 pt-2 mt-2">
                  <span>Stake Distribution</span>
                  <span className="font-bold text-zinc-300">
                    {pact.ai_verdict === "SUCCESS"
                      ? `Refunded ${((Number(pact.stake_amount) / 1e18) * 0.99).toFixed(1)} GEN to creator (1% fee kept)`
                      : `Donated ${(Number(pact.stake_amount) / 1e18).toFixed(0)} GEN to Charity Address`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. Breakdown details (criteria + beneficiary) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification criteria info card */}
        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4">
          <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
            <Globe className="h-4 w-4" />
            Verification Conditions
          </h3>
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Profile Address Audited</span>
              <a
                href={pact.verification_url}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-orange-400 hover:underline break-all"
              >
                {pact.verification_url}
              </a>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Consensus Criteria Evaluated</span>
              <p className="text-zinc-300 font-sans font-semibold">
                "{pact.success_criteria}"
              </p>
            </div>
          </div>
        </div>

        {/* Failure penalty info card */}
        <div className="glass-card rounded-2xl border border-white/5 p-6 space-y-4">
          <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
            <Heart className="h-4 w-4" />
            Failure Beneficiary
          </h3>
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Beneficiary Name</span>
              <span className="font-bold text-zinc-300 uppercase tracking-wide">
                {pact.beneficiary_on_failure.startsWith("0x81") ? "Rival Sports Team 🐐" : pact.beneficiary_on_failure.startsWith("0x91") ? "Carbon Emissions Fund 🏭" : "Bureaucracy & Inefficiency League 🗂️"}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Beneficiary Address</span>
              <span className="font-mono text-zinc-500 break-all uppercase">
                {pact.beneficiary_on_failure}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Staking Dynamics details */}
      <StakeProgressBar
        stakeWei={pact.stake_amount}
        startTs={pact.start_timestamp}
        deadlineTs={pact.deadline_timestamp}
        status={pact.status}
        beneficiaryName={pact.beneficiary_on_failure.startsWith("0x81") ? "Rival Sports Team" : pact.beneficiary_on_failure.startsWith("0x91") ? "Carbon Conglomerate" : "Bureaucracy League"}
      />
    </div>
  );
}
