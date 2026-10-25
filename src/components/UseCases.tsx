"use client";

import { useState } from "react";

interface WorkloadProfile {
  id: string;
  domain: string;
  badge: string;
  useCase: string;
  vramRequirement: string;
  vramNum: number;
  maxVram: number;
  frameworks: string;
  executionModel: string;
  eligibleGpus: string[];
  whyDistributed: string;
}

const WORKLOAD_PROFILES: WorkloadProfile[] = [
  {
    id: "llm-tuning",
    domain: "Large Language Model Fine-Tuning",
    badge: "STATEFUL BATCH",
    useCase: "LoRA, QLoRA, and parameter-efficient tuning for 7B–14B models (LLaMA 3, Mistral, Qwen)",
    vramRequirement: "16 GB – 24 GB",
    vramNum: 24,
    maxVram: 48,
    frameworks: "PyTorch, Hugging Face PEFT, Axolotl, DeepSpeed",
    executionModel: "Stateful batch run with periodic remote checkpoint syncing",
    eligibleGpus: ["RTX 4090 (24GB)", "RTX 3090 (24GB)", "RTX 6000 Ada (48GB)"],
    whyDistributed:
      "Fine-tuning jobs are discrete batches. Renters run 3–6 hour training runs at spot pricing without paying for 24/7 reserved instances.",
  },
  {
    id: "inference",
    domain: "High-Concurrency Model Serving",
    badge: "STATELESS STREAMING",
    useCase: "Quantized model inference, high-throughput vector embedding generation, document parsing",
    vramRequirement: "12 GB – 24 GB",
    vramNum: 16,
    maxVram: 48,
    frameworks: "vLLM, Hugging Face TGI, Ollama, TensorRT-LLM",
    executionModel: "Stateless queue processing with direct response streaming",
    eligibleGpus: ["RTX 4080 (16GB)", "RTX 4090 (24GB)", "RTX 3080 12GB+"],
    whyDistributed:
      "Burst inference demands can scale out horizontally across distributed worker pools during peak demand hours.",
  },
  {
    id: "vfx-render",
    domain: "Parallel 3D VFX & Animation",
    badge: "FRAME CHUNKING",
    useCase: "Cycles raytracing, OptiX accelerated renders, multi-frame architectural walkthroughs",
    vramRequirement: "10 GB – 24 GB",
    vramNum: 12,
    maxVram: 48,
    frameworks: "Blender CLI, Cycles Render Engine, NVIDIA OptiX",
    executionModel: "Frame chunk distribution across multiple independent nodes in parallel",
    eligibleGpus: ["RTX 4070 Ti (12GB)", "RTX 4080 (16GB)", "RTX 4090 (24GB)"],
    whyDistributed:
      "Embarrassingly parallel: a 500-frame sequence can dispatch simultaneously across 20 distinct community nodes in minutes.",
  },
  {
    id: "scientific-sweeps",
    domain: "Scientific & Hyperparameter Sweeps",
    badge: "DISTRIBUTED GRID",
    useCase: "Monte Carlo simulations, genetic algorithm optimization, molecular docking matrix scans",
    vramRequirement: "8 GB – 16 GB",
    vramNum: 8,
    maxVram: 48,
    frameworks: "Ray, Optuna, custom CUDA/C++ bindings",
    executionModel: "Independent trial dispatch to heterogeneous edge pools",
    eligibleGpus: ["Any CUDA 12.0+ compatible GPU with >= 8GB VRAM"],
    whyDistributed:
      "Parameter sweeps require hundreds of lightweight runs; community nodes offer massive aggregate parallelism at negligible cost.",
  },
];

export function UseCases() {
  const [selectedId, setSelectedId] = useState<string>("llm-tuning");
  const activeProfile = WORKLOAD_PROFILES.find((p) => p.id === selectedId) || WORKLOAD_PROFILES[0];

  return (
    <section id="workloads" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#090D14]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            Target Workload Compatibility
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            The computational profiles ComputeX is architected to coordinate across community hardware nodes.
          </p>
        </div>

        {/* Interactive Selector Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Workload Class Buttons (4 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {WORKLOAD_PROFILES.map((profile) => {
              const isSelected = profile.id === selectedId;
              return (
                <button
                  key={profile.id}
                  onClick={() => setSelectedId(profile.id)}
                  className={`btn-action w-full text-left p-4 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#38BDF8] bg-[#121A2A] shadow-md ring-1 ring-[#38BDF8]/40"
                      : "border-[#1E293B] bg-[#0E1420] hover:border-[#334155] text-[#94A3B8]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <span className={`text-sm font-semibold leading-snug ${isSelected ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                      {profile.domain}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#334155] text-[#64748B] shrink-0 whitespace-nowrap">
                      {profile.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] line-clamp-1">
                    {profile.useCase}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: In-Depth Workload Specification Panel (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-[#1E293B] bg-[#0D131F] p-6 sm:p-8 shadow-xl">
            
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#1E293B] gap-2">
              <div>
                <span className="text-xs font-mono text-[#38BDF8] uppercase tracking-wider block mb-1">
                  Active Specification
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-[#F8FAFC]">
                  {activeProfile.domain}
                </h3>
              </div>
              <span className="font-mono text-xs text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1 rounded">
                VRAM: {activeProfile.vramRequirement}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              
              {/* Task Scope */}
              <div>
                <span className="text-xs font-mono uppercase text-[#64748B] block mb-1">
                  Scope & Application
                </span>
                <p className="text-sm text-[#F8FAFC] leading-relaxed">
                  {activeProfile.useCase}
                </p>
              </div>

              {/* Execution Profile & Frameworks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg border border-[#1E293B] bg-[#090D14] p-3.5">
                  <span className="text-[11px] font-mono text-[#38BDF8] block mb-1 uppercase">
                    Execution Model
                  </span>
                  <span className="text-[#94A3B8] leading-relaxed block">
                    {activeProfile.executionModel}
                  </span>
                </div>

                <div className="rounded-lg border border-[#1E293B] bg-[#090D14] p-3.5">
                  <span className="text-[11px] font-mono text-[#38BDF8] block mb-1 uppercase">
                    Framework Stacks
                  </span>
                  <span className="text-[#94A3B8] leading-relaxed block font-mono text-[11px]">
                    {activeProfile.frameworks}
                  </span>
                </div>
              </div>

              {/* Hardware Targets */}
              <div>
                <span className="text-xs font-mono uppercase text-[#64748B] block mb-2">
                  Eligible Hardware Targets
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeProfile.eligibleGpus.map((gpu) => (
                    <span
                      key={gpu}
                      className="font-mono text-xs px-2.5 py-1 rounded border border-[#334155] bg-[#121A2A] text-[#F8FAFC]"
                    >
                      {gpu}
                    </span>
                  ))}
                </div>
              </div>

              {/* Why Distributed Coordination Works */}
              <div className="rounded-lg border border-[#1E293B] bg-[#090D14] p-4 text-xs text-[#94A3B8] leading-relaxed">
                <strong className="text-[#F8FAFC] font-semibold block mb-1">
                  Why Community Nodes Fit This Workload:
                </strong>
                {activeProfile.whyDistributed}
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B] font-mono">
              <span>UNPRIVILEGED GUEST CONTAINER</span>
              <span className="text-[#38BDF8]">SECURE SCRUB UPON EXIT</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}