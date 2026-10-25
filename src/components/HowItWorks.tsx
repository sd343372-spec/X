"use client";

import { useState } from "react";

type StageKey = "stage1" | "stage2" | "stage3";

interface ProtocolStage {
  id: StageKey;
  stepNumber: string;
  title: string;
  summary: string;
  renterAction: {
    title: string;
    description: string;
    codeSnippet?: string;
  };
  providerAction: {
    title: string;
    description: string;
    codeSnippet?: string;
  };
  kernelInvariant: string;
}

const STAGES: Record<StageKey, ProtocolStage> = {
  stage1: {
    id: "stage1",
    stepNumber: "01",
    title: "Manifest Specification & Node Discovery",
    summary:
      "Renters declare precise hardware constraints in code; providers run a local benchmark daemon to construct a cryptographically signed hardware manifest.",
    renterAction: {
      title: "Renter: Declare Execution Spec",
      description:
        "The developer compiles a job manifest specifying the base container image, target CUDA capability, minimum memory ceiling, and maximum runtime budget.",
      codeSnippet: "vram: 24GB · cuda: >=12.2 · runtime: 3h30m",
    },
    providerAction: {
      title: "Provider: Hardware Profiling",
      description:
        "The local desktop agent detects GPU microarchitecture, benchmarks PCIe throughput, and registers the node as available only when within idle windows.",
      codeSnippet: "node_manifest: RTX 4090 · 24GB · PCIe 4.0 · idle",
    },
    kernelInvariant:
      "Invariant: No job is dispatched without a cryptographic signature proving the host meets all hardware constraints.",
  },
  stage2: {
    id: "stage2",
    stepNumber: "02",
    title: "Constraint Matching & Escrow Locking",
    summary:
      "The coordination layer pairs the workload against eligible nodes and locks pre-funded compute-seconds in escrow. Zero funds leave until execution starts.",
    renterAction: {
      title: "Renter: Authorize Escrow Deposit",
      description:
        "The renter receives an itemized quote based on expected duration. Escrow funds are locked deterministically—unused compute-seconds are automatically returned.",
      codeSnippet: "quote: $0.46/hr · escrow_lock: $1.61 max",
    },
    providerAction: {
      title: "Provider: Confirm Capacity Offer",
      description:
        "The provider's agent verifies that the proposed duration fits within their active operating window and conforms to their local thermal ceiling.",
      codeSnippet: "thermal_limit: 72C · power_cap: 350W · accepted",
    },
    kernelInvariant:
      "Invariant: Escrow is calculated strictly per executed compute-second. No cloud markup or idle reservation retention.",
  },
  stage3: {
    id: "stage3",
    stepNumber: "03",
    title: "Sandboxed Execution & Artifact Retrieval",
    summary:
      "The workload launches in an unprivileged container sandbox. Telemetry and checkpoints stream directly to the renter; the host reclaims 100% capacity upon finish.",
    renterAction: {
      title: "Renter: Stream Checkpoints & Logs",
      description:
        "The container executes. Training loss, tensor metrics, and checkpoints sync directly to the renter's object storage without passing through centralized intermediaries.",
      codeSnippet: "sync: s3://research-bucket/lora-checkpoint-04.pt",
    },
    providerAction: {
      title: "Provider: Isolated Compute & Auto-Scrub",
      description:
        "Guest container runs in an isolated sandbox with zero host filesystem access. Upon task completion or human mouse movement, scratch disks are wiped cleanly.",
      codeSnippet: "sandbox: wiped · telemetry: signed · escrow: settled",
    },
    kernelInvariant:
      "Invariant: Zero host filesystem visibility. If the hardware owner interacts with their PC, the job halts immediately.",
  },
};

export function HowItWorks() {
  const [activeStage, setActiveStage] = useState<StageKey>("stage1");
  const stage = STAGES[activeStage];

  return (
    <section id="protocol" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#0B0F17]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            The Coordination Protocol
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            How demand and supply converge into verified, sandboxed execution across community nodes.
          </p>
        </div>

        {/* Interactive 3-Stage Progress Bar / Navigator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8" role="tablist">
          {(Object.keys(STAGES) as StageKey[]).map((key) => {
            const item = STAGES[key];
            const isSelected = activeStage === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveStage(key)}
                className={`btn-action text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-[#38BDF8] bg-[#121A2A] shadow-lg ring-1 ring-[#38BDF8]/40"
                    : "border-[#1E293B] bg-[#0E1420] hover:border-[#334155] text-[#94A3B8]"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? "text-[#38BDF8]" : "text-[#64748B]"
                    }`}
                  >
                    PHASE {item.stepNumber}
                  </span>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                  )}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    isSelected ? "text-[#F8FAFC]" : "text-[#94A3B8]"
                  }`}
                >
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Interconnect Blueprint */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D131F] p-6 sm:p-8 shadow-xl">
          
          {/* Stage Overview Banner */}
          <div className="pb-6 border-b border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block mb-1">
                Phase {stage.stepNumber} Operational Flow
              </span>
              <h3 className="text-xl font-semibold text-[#F8FAFC]">
                {stage.title}
              </h3>
            </div>
            <span className="self-start sm:self-auto inline-flex items-center gap-2 rounded border border-[#334155] bg-[#090D14] px-3 py-1.5 text-xs font-mono text-[#94A3B8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              PROTOCOL STATE: VERIFIED
            </span>
          </div>

          <p className="mt-4 text-sm sm:text-base text-[#94A3B8] leading-relaxed max-w-3xl">
            {stage.summary}
          </p>

          {/* Connected Dual-Track Visualizer */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            
            {/* Renter Track Card */}
            <div className="rounded-lg border border-[#1E293B] bg-[#090D14] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#38BDF8] font-semibold uppercase">
                  DEMAND STREAM
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">RENTER CLIENT</span>
              </div>
              <h4 className="text-base font-semibold text-[#F8FAFC]">
                {stage.renterAction.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {stage.renterAction.description}
              </p>
              {stage.renterAction.codeSnippet && (
                <div className="mt-3 rounded border border-[#1E293B] bg-[#121A2A] px-3 py-2 text-xs font-mono text-[#38BDF8] overflow-x-auto">
                  $ {stage.renterAction.codeSnippet}
                </div>
              )}
            </div>

            {/* Provider Track Card */}
            <div className="rounded-lg border border-[#1E293B] bg-[#090D14] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#10B981] font-semibold uppercase">
                  SUPPLY STREAM
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">HOST DAEMON</span>
              </div>
              <h4 className="text-base font-semibold text-[#F8FAFC]">
                {stage.providerAction.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                {stage.providerAction.description}
              </p>
              {stage.providerAction.codeSnippet && (
                <div className="mt-3 rounded border border-[#1E293B] bg-[#121A2A] px-3 py-2 text-xs font-mono text-[#10B981] overflow-x-auto">
                  $ {stage.providerAction.codeSnippet}
                </div>
              )}
            </div>

          </div>

          {/* Kernel Invariant Footer */}
          <div className="mt-6 rounded-lg border border-[#334155] bg-[#121A2A] p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#38BDF8] shrink-0 mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <div className="text-xs text-[#94A3B8] leading-relaxed">
              <strong className="text-[#F8FAFC] font-semibold">Security Invariant: </strong>
              {stage.kernelInvariant}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}