"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Globe, Brain, Scale, CheckCircle2, ShieldAlert } from "lucide-react";

interface VerificationTimelineProps {
  onComplete: () => void;
  status: "idle" | "running" | "success" | "failure";
  verdictData?: {
    verdict?: string;
    reasoning?: string;
  };
}

export default function VerificationTimeline({ onComplete, status, verdictData }: VerificationTimelineProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (status !== "running") return;

    setActiveStep(0);

    const timer1 = setTimeout(() => setActiveStep(1), 5000); // 5s to read
    const timer2 = setTimeout(() => setActiveStep(2), 12000); // 7s to analyze
    const timer3 = setTimeout(() => setActiveStep(3), 20000); // 8s to render verdict

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [status]);

  if (status === "idle") return null;

  const steps = [
    {
      title: "Reading Public Profile",
      desc: "Impartial AI Node is fetching Web2 profile logs via gl.nondet.web.render...",
      icon: Globe,
      activeColor: "text-blue-400 text-glow-orange",
      doneColor: "text-emerald-400"
    },
    {
      title: "Analyzing Commitment Activity",
      desc: "AI is reviewing timestamps, aggregate metrics, and logging streaks against success criteria...",
      icon: Brain,
      activeColor: "text-purple-400 text-glow-orange",
      doneColor: "text-emerald-400"
    },
    {
      title: "Rendering Consensus Verdict",
      desc: "GenLayer Validators are confirming leader output via gl.vm.run_nondet_unsafe Equivalence consensus...",
      icon: Scale,
      activeColor: "text-orange-400 text-glow-orange",
      doneColor: "text-emerald-400"
    }
  ];

  return (
    <div className="glass-card rounded-2xl border border-white/5 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="font-bold text-zinc-100 flex items-center gap-2 text-lg">
            <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
            Autonomous AI Verification Active
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            GenLayer Intelligent Nodes are auditing Web2 profile data on-chain. This takes 15-30s.
          </p>
        </div>
        <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-xs font-semibold text-orange-400 uppercase tracking-widest leading-none">
          Auditing
        </span>
      </div>

      {/* Steps List */}
      <div className="relative pl-6 border-l border-white/5 space-y-8">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isDone = activeStep > idx;
          const isActive = activeStep === idx;
          const isPending = activeStep < idx;

          return (
            <div key={idx} className="relative flex items-start gap-4">
              {/* Dot Icon Indicator */}
              <div className={`absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full border bg-zinc-950 text-xs transition-all duration-300 ${
                isDone 
                  ? "border-emerald-500 text-emerald-400 text-glow-green" 
                  : isActive 
                  ? "border-orange-500 text-orange-400 text-glow-orange animate-pulse" 
                  : "border-zinc-800 text-zinc-600"
              }`}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>

              {/* Step Detail */}
              <div className={`flex items-start gap-3 transition-opacity duration-300 ${
                isPending ? "opacity-30" : "opacity-100"
              }`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 border border-white/5 ${
                  isActive ? step.activeColor : isDone ? step.doneColor : "text-zinc-600"
                }`}>
                  <StepIcon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${
                    isActive ? "text-zinc-100" : isDone ? "text-emerald-400" : "text-zinc-500"
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-zinc-500 leading-normal mt-0.5 max-w-lg">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Final step logic details */}
        {activeStep === 3 && (
          <div className="relative flex items-start gap-4 animate-bounce-slow">
            <div className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400">
              <Scale className="h-3.5 w-3.5 animate-pulse" />
            </div>
            
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 text-glow-orange">
                  Verdict Rendered!
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal mt-0.5 max-w-lg">
                  Consensus reached on-chain. Writing final state and updating contract...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
