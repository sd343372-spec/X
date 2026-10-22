"use client";

import { useState } from "react";

export function DeveloperSection() {
  const [activeTab, setActiveTab] = useState<"yaml" | "cli">("yaml");
  const [copied, setCopied] = useState(false);

  const yamlContent = `version: "computex/v1"
kind: Workload
metadata:
  name: "llama3-lora-tuning"
  team: "research-nlp"

hardware_requirements:
  gpu_architecture: "Ada Lovelace"
  min_vram: "24GB"
  cuda_compatibility: ">=12.2"
  pcie_min_gen: 4

runtime:
  container: "pytorch/pytorch:2.3.0-cuda12.1-cudnn8-runtime"
  entrypoint: "python train.py --config ./lora.yaml"
  max_duration: "3h30m"
  auto_checkpoint_interval: "15m"

escrow:
  max_rate_per_second: "0.000128 USD"
  refund_unused_budget: true
  signed_receipt: required`;

  const cliContent = `$ computex dispatch --manifest ./computex.yaml

[1/3] Parsing workload constraints...
      VRAM floor: 24GB | CUDA: >=12.2 | Interconnect: PCIe 4.0
[2/3] Querying online community node pool...
      Matched Node 0x8F (RTX 4090 · 24GB · PCIe 4.0 · Verified Online)
[3/3] Escrow pre-authorization:
      Rate: $0.46/hr | Bounded Max: $1.61 (3h30m)
      Escrow deposit locked. Launching guest container...

Container ID: cx-job-9042a launched in isolated microVM.
Streaming logs to stdout. Checkpoints sync -> s3://research-nlp/runs/9042a/`;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === "yaml" ? yamlContent : cliContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="for-renters" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#0B0F17]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block mb-2 font-medium">
            For Renters & Researchers
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            Declarative Ingress & Verifiable Execution
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            Specify compute requirements in code. ComputeX matches hardware, bounds pricing via escrow, and streams runtime checkpoints directly to your object storage.
          </p>
        </div>

        {/* 2-Column Layout: Feature Specifications Left + Interactive Artifact Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: 3 Architectural Guarantees */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="rounded-xl border border-[#1E293B] bg-[#0E1420] p-6 hover:border-[#334155] transition-colors">
              <span className="text-[11px] font-mono text-[#38BDF8] font-semibold block mb-1">
                HARDWARE-AWARE ROUTING
              </span>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Direct Architectural Targeting
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Filter directly by microarchitecture (Ada Lovelace, Ampere), minimum memory bandwidth, and CUDA versions. Jobs never get queued on incompatible or bottlenecked hosts.
              </p>
            </div>

            <div className="rounded-xl border border-[#1E293B] bg-[#0E1420] p-6 hover:border-[#334155] transition-colors">
              <span className="text-[11px] font-mono text-[#38BDF8] font-semibold block mb-1">
                DETERMINISTIC ESCROW
              </span>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Zero Idle Retention Fees
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Prices are quoted upfront based strictly on executed compute-seconds. Unused allocations refund automatically upon job exit or cancellation.
              </p>
            </div>

            <div className="rounded-xl border border-[#1E293B] bg-[#0E1420] p-6 hover:border-[#334155] transition-colors">
              <span className="text-[11px] font-mono text-[#10B981] font-semibold block mb-1">
                ARTIFACT RETRIEVAL
              </span>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Direct Checkpoint Streaming
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Intermediate weights and metrics sync directly to your private S3 or GCS bucket, eliminating data loss risk if an individual node disconnects.
              </p>
            </div>

          </div>

          {/* Right Column: Interactive Developer Artifact (YAML vs CLI) */}
          <div className="lg:col-span-7 rounded-xl border border-[#1E293B] bg-[#090D14] overflow-hidden shadow-2xl">
            
            {/* Header with Tab Switcher & Copy Action */}
            <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0D131F] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("yaml")}
                  className={`btn-action text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                    activeTab === "yaml"
                      ? "bg-[#1E293B] text-[#F8FAFC] font-semibold"
                      : "text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  computex.yaml
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("cli")}
                  className={`btn-action text-xs font-mono px-3 py-1.5 rounded transition-colors ${
                    activeTab === "cli"
                      ? "bg-[#1E293B] text-[#F8FAFC] font-semibold"
                      : "text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  CLI Dispatch
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="btn-action text-xs font-mono text-[#94A3B8] hover:text-[#38BDF8] flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#1E293B] hover:border-[#334155]"
                aria-label="Copy code snippet"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#10B981]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-[#10B981]">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Artifact Display */}
            <pre className="p-4 sm:p-6 font-mono text-xs sm:text-[13px] text-[#F8FAFC] leading-relaxed overflow-x-auto bg-[#090D14]">
              <code>{activeTab === "yaml" ? yamlContent : cliContent}</code>
            </pre>

            <div className="border-t border-[#1E293B] bg-[#0D131F] px-4 py-3 text-xs text-[#64748B] flex items-center justify-between">
              <span>Declarative schema v0.1 · Parsed by coordination kernel</span>
              <span className="font-mono text-[#38BDF8]">AUTOMATIC ESCROW BINDING</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}