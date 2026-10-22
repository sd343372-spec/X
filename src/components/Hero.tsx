"use client";

import { useState } from "react";

type WorkloadKey = "lora" | "vllm" | "render";

interface WorkloadPreset {
  id: WorkloadKey;
  name: string;
  category: string;
  vramReq: number;
  cudaReq: string;
  pcieReq: string;
  targetNodeId: string;
  rationale: string;
  estimatedCost: string;
  sandboxModel: string;
}

const WORKLOAD_PRESETS: Record<WorkloadKey, WorkloadPreset> = {
  lora: {
    id: "lora",
    name: "LLaMA 3 8B LoRA Tuning",
    category: "LLM Fine-Tuning",
    vramReq: 24,
    cudaReq: ">= 12.2",
    pcieReq: "PCIe 4.0",
    targetNodeId: "alpha",
    rationale:
      "Matched Node Alpha: 24GB VRAM accommodates 8B model weights + LoRA rank matrices; CUDA 12.4 exceeds runtime constraint; PCIe 4.0 guarantees high tensor streaming bandwidth.",
    estimatedCost: "$0.46 / compute-hr",
    sandboxModel: "Ephemeral microVM sandbox · Scratch disk wiped on task complete",
  },
  vllm: {
    id: "vllm",
    name: "vLLM Inference Server",
    category: "High-Concurrency Serving",
    vramReq: 16,
    cudaReq: ">= 12.0",
    pcieReq: "PCIe 3.0+",
    targetNodeId: "beta",
    rationale:
      "Matched Node Beta: 16GB VRAM provides optimal KV-cache allocation for quantized models; Ada Lovelace architecture provides high FP8 tensor throughput.",
    estimatedCost: "$0.32 / compute-hr",
    sandboxModel: "Stateless container sandbox · Zero network egress into host LAN",
  },
  render: {
    id: "render",
    name: "Blender Cycles VFX Chunk",
    category: "Parallel 3D Raytracing",
    vramReq: 10,
    cudaReq: ">= 11.8",
    pcieReq: "PCIe 3.0+",
    targetNodeId: "gamma",
    rationale:
      "Matched Node Gamma: 10GB VRAM comfortably fits geometry assets and 4K tile textures; OptiX RT cores provide cost-efficient rendering per frame.",
    estimatedCost: "$0.18 / compute-hr",
    sandboxModel: "Read-only scene container · Rendered frames encrypted back to renter bucket",
  },
};

interface ProviderNode {
  id: string;
  name: string;
  gpu: string;
  vram: number;
  cuda: string;
  pcie: string;
  tier: string;
}

const PROVIDER_NODES: ProviderNode[] = [
  {
    id: "alpha",
    name: "Node Alpha",
    gpu: "RTX 4090",
    vram: 24,
    cuda: "CUDA 12.4",
    pcie: "PCIe 4.0",
    tier: "Ada Lovelace",
  },
  {
    id: "beta",
    name: "Node Beta",
    gpu: "RTX 4080",
    vram: 16,
    cuda: "CUDA 12.2",
    pcie: "PCIe 4.0",
    tier: "Ada Lovelace",
  },
  {
    id: "gamma",
    name: "Node Gamma",
    gpu: "RTX 3080",
    vram: 10,
    cuda: "CUDA 11.8",
    pcie: "PCIe 3.0",
    tier: "Ampere",
  },
  {
    id: "delta",
    name: "Node Delta",
    gpu: "RTX 3090",
    vram: 24,
    cuda: "CUDA 12.1",
    pcie: "PCIe 3.0",
    tier: "Ampere",
  },
];

export function Hero() {
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadKey>("lora");
  const activePreset = WORKLOAD_PRESETS[selectedWorkload];

  const getNodeStatus = (node: ProviderNode) => {
    if (node.id === activePreset.targetNodeId) {
      return {
        matched: true,
        label: "Allocated Target",
        color: "text-[#10B981] border-[#10B981]/40 bg-[#10B981]/10",
        badge: "MATCHED",
        reason: "Exact criteria satisfied",
      };
    }

    if (node.vram < activePreset.vramReq) {
      return {
        matched: false,
        label: "Incompatible",
        color: "text-[#EF4444] border-[#EF4444]/30 bg-[#EF4444]/10",
        badge: "VRAM LOW",
        reason: `${node.vram}GB < ${activePreset.vramReq}GB`,
      };
    }

    if (selectedWorkload === "lora" && node.pcie === "PCIe 3.0") {
      return {
        matched: false,
        label: "Sub-Optimal",
        color: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
        badge: "BUS SLOW",
        reason: "Requires PCIe 4.0",
      };
    }

    return {
      matched: false,
      label: "Eligible Standby",
      color: "text-[#94A3B8] border-[#334155] bg-[#121A2A]",
      badge: "STANDBY",
      reason: "Capacity verified",
    };
  };

  return (
    <section className="relative pt-24 pb-16 md:pt-36 md:pb-24 border-b border-[#1E293B] overflow-hidden">
      {/* Background architectural coordinate lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #1E293B 1px, transparent 1px),
            linear-gradient(to bottom, #1E293B 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 60% 40%, black 10%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Top Storytelling Row */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Direct Editorial Typography & Audience Pathways */}
          <div className="lg:col-span-5 flex flex-col justify-center pt-2">
            
            {/* Context Pill */}
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#334155] bg-[#0E1420] px-3 py-1 text-xs text-[#94A3B8] mb-5">
              <span className="h-2 w-2 rounded-full bg-[#38BDF8]" aria-hidden="true" />
              <span>Decentralized GPU Topology v0.1</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[-0.035em] text-[#F8FAFC] leading-[1.14]"
              style={{ textWrap: "balance" }}
            >
              Fragmented GPU capacity, coordinated into a reliable compute network.
            </h1>

            <p
              className="mt-5 max-w-[62ch] text-base sm:text-lg text-[#94A3B8] leading-relaxed"
              style={{ textWrap: "pretty" }}
            >
              ComputeX connects developers who need guaranteed GPU hardware with workstation owners who have idle capacity to share. Renters get hardware-matched execution sandboxes; providers retain full sovereignty over thermals, schedules, and power limits.
            </p>

            {/* Clear Primary & Secondary Calls to Action */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <a
                href="#for-renters"
                className="btn-action inline-flex items-center justify-center rounded bg-[#38BDF8] px-5 py-3 text-sm font-semibold text-[#090D14] hover:bg-[#0284C7] hover:text-white"
              >
                I Need GPU Compute
                <svg
                  className="ml-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a
                href="#for-providers"
                className="btn-action inline-flex items-center justify-center rounded border border-[#334155] bg-[#0E1420] px-5 py-3 text-sm font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8]"
              >
                I Have a GPU to Share
              </a>
            </div>

            {/* Architectural Status Note */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#64748B]">
              <span className="font-mono text-[#38BDF8]">SPECIFICATION</span>
              <span>·</span>
              <span>Open coordination protocol under active design</span>
            </div>
          </div>

          {/* Right Column: The Interactive Network Matching Demonstration */}
          <div className="lg:col-span-7 w-full">
            <div className="rounded-xl border border-[#1E293B] bg-[#0D131F] shadow-2xl overflow-hidden">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#090D14] px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
                  <span className="text-xs font-mono font-medium text-[#F8FAFC]">
                    NETWORK COORDINATION ROUTER
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#64748B] hidden sm:inline-block">
                  TOPOLOGY SIMULATOR
                </span>
              </div>

              {/* Workload Selector Tabs */}
              <div className="p-4 sm:p-5 border-b border-[#1E293B] bg-[#090D14]/60">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-medium text-[#94A3B8]">
                    Choose a workload to test hardware matching:
                  </span>
                  <span className="text-[11px] font-mono text-[#38BDF8]">
                    {activePreset.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="tablist">
                  {(Object.keys(WORKLOAD_PRESETS) as WorkloadKey[]).map((key) => {
                    const preset = WORKLOAD_PRESETS[key];
                    const isSelected = selectedWorkload === key;
                    return (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => setSelectedWorkload(key)}
                        className={`btn-action text-left p-2.5 sm:p-3 rounded-lg border transition-all ${
                          isSelected
                            ? "border-[#38BDF8] bg-[#121A2A] shadow-sm ring-1 ring-[#38BDF8]/40"
                            : "border-[#1E293B] bg-[#090D14] hover:border-[#334155] text-[#94A3B8]"
                        }`}
                      >
                        <span className={`block text-xs font-semibold truncate ${isSelected ? "text-[#F8FAFC]" : "text-[#94A3B8]"}`}>
                          {preset.name}
                        </span>
                        <div className="mt-1 flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-[#64748B]">
                          <span>{preset.vramReq}GB VRAM</span>
                          <span>·</span>
                          <span>{preset.cudaReq}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Network Topology Visualizer Canvas */}
              <div className="p-4 sm:p-6 bg-[#0B0F17]">
                
                {/* Visual Pipeline: Workload Spec -> Central Coordination Hub -> Available Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  
                  {/* Left Column (5 cols on md): Active Workload Requisition */}
                  <div className="md:col-span-5 rounded-lg border border-[#334155] bg-[#0E1420] p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#38BDF8]">
                        Workload Spec
                      </span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
                    </div>
                    <div className="font-semibold text-xs text-[#F8FAFC] leading-snug">
                      {activePreset.name}
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-[#1E293B] text-[11px] font-mono text-[#94A3B8]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">VRAM Floor:</span>
                        <span className="text-[#F8FAFC] font-semibold">{activePreset.vramReq} GB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">CUDA Target:</span>
                        <span className="text-[#F8FAFC] font-semibold">{activePreset.cudaReq}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748B]">Interconnect:</span>
                        <span className="text-[#F8FAFC] font-semibold">{activePreset.pcieReq}</span>
                      </div>
                    </div>
                  </div>

                  {/* Center Column (1 col): Router Signal Graphic */}
                  <div className="md:col-span-1 hidden md:flex flex-col items-center justify-center">
                    <div className="h-12 w-px bg-gradient-to-b from-[#38BDF8] via-[#10B981] to-[#38BDF8] opacity-60" />
                    <svg className="w-5 h-5 text-[#38BDF8] my-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                    <div className="h-12 w-px bg-gradient-to-b from-[#38BDF8] via-[#10B981] to-[#38BDF8] opacity-60" />
                  </div>

                  {/* Right Column (6 cols on md): Distributed Node Swarm */}
                  <div className="md:col-span-6 space-y-2">
                    <div className="text-[10px] font-mono text-[#64748B] flex items-center justify-between px-1">
                      <span>PROVIDER CANDIDATES</span>
                      <span>4 VERIFIED NODES</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {PROVIDER_NODES.map((node) => {
                        const status = getNodeStatus(node);
                        return (
                          <div
                            key={node.id}
                            className={`rounded-lg border p-2.5 transition-all flex items-center justify-between gap-2.5 ${
                              status.matched
                                ? "border-[#10B981] bg-[#10B981]/10 ring-1 ring-[#10B981]/40"
                                : "border-[#1E293B] bg-[#0E1420]/80 opacity-75"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  status.matched ? "bg-[#10B981] animate-ping" : "bg-[#475569]"
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="text-xs font-semibold text-[#F8FAFC]">
                                    {node.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#94A3B8] shrink-0">
                                    {node.gpu}
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#64748B] flex items-center gap-1.5 mt-0.5 truncate font-mono">
                                  <span>{node.vram}GB</span>
                                  <span>·</span>
                                  <span>{node.cuda}</span>
                                  <span>·</span>
                                  <span>{node.pcie}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span
                                className={`inline-block font-mono text-[9px] px-1.5 py-0.5 rounded border font-semibold ${status.color}`}
                              >
                                {status.badge}
                              </span>
                              <span className="block text-[9px] text-[#64748B] mt-0.5">
                                {status.reason}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Match Explanation & Resolution Output */}
                <div className="mt-5 rounded-lg border border-[#1E293B] bg-[#0E1420] p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="text-[#F8FAFC] font-semibold text-xs">
                          Coordination Decision Engine
                        </strong>
                        <span className="font-mono text-[#10B981] text-[11px] font-semibold">
                          ESTIMATE: {activePreset.estimatedCost}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[#94A3B8] leading-relaxed">
                        {activePreset.rationale}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-[#1E293B] flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-[#64748B]">
                        <span>Security: {activePreset.sandboxModel}</span>
                        <span className="font-mono text-[#38BDF8]">Deterministic Escrow Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Visualizer Footer Disclaimer */}
              <div className="flex flex-wrap items-center justify-between border-t border-[#1E293B] bg-[#090D14] px-4 py-2.5 text-[10px] sm:text-[11px] text-[#64748B]">
                <span>Conceptual demonstration of constraint-matching router</span>
                <span className="font-mono text-[#38BDF8]">ZERO FABRICATED TELEMETRY</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}