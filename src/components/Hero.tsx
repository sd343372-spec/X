"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type WorkloadKey = "lora" | "vllm" | "render";
type NodeId = "alpha" | "beta" | "gamma" | "delta";

interface WorkloadPreset {
  id: WorkloadKey;
  name: string;
  category: string;
  vramReq: number;
  cudaMin: number;
  cudaLabel: string;
  pcieMin: number;
  pcieLabel: string;
  preferredNodeId: NodeId;
  simulatedQuote: string;
  proposedSandbox: string;
  summary: string;
}

const WORKLOAD_ORDER: WorkloadKey[] = ["lora", "vllm", "render"];

const WORKLOAD_PRESETS: Record<WorkloadKey, WorkloadPreset> = {
  lora: {
    id: "lora",
    name: "LLaMA 3 8B LoRA Tuning",
    category: "LLM Fine-Tuning",
    vramReq: 24,
    cudaMin: 12.2,
    cudaLabel: ">= 12.2",
    pcieMin: 4.0,
    pcieLabel: "PCIe 4.0",
    preferredNodeId: "alpha",
    simulatedQuote: "$0.46 / compute-hr (simulated example)",
    proposedSandbox:
      "Proposed spec: isolated container runtime · temporary scratch storage cleared on completion",
    summary:
      "Simulated demand requiring 24GB VRAM for 8B weights + adapter matrices, CUDA 12.2+, and PCIe 4.0 bandwidth.",
  },
  vllm: {
    id: "vllm",
    name: "vLLM Inference Server",
    category: "Batch / Serving",
    vramReq: 16,
    cudaMin: 12.0,
    cudaLabel: ">= 12.0",
    pcieMin: 3.0,
    pcieLabel: "PCIe 3.0+",
    preferredNodeId: "beta",
    simulatedQuote: "$0.32 / compute-hr (simulated example)",
    proposedSandbox:
      "Proposed spec: stateless container execution · restricted host network access",
    summary:
      "Simulated demand requiring 16GB+ VRAM for quantized KV-cache allocation and CUDA 12.0+ compatibility.",
  },
  render: {
    id: "render",
    name: "Blender Cycles VFX Chunk",
    category: "3D Raytracing",
    vramReq: 10,
    cudaMin: 11.8,
    cudaLabel: ">= 11.8",
    pcieMin: 3.0,
    pcieLabel: "PCIe 3.0+",
    preferredNodeId: "gamma",
    simulatedQuote: "$0.18 / compute-hr (simulated example)",
    proposedSandbox:
      "Proposed spec: scoped scene container · output artifacts returned to renter",
    summary:
      "Simulated demand fitting within 10GB+ VRAM and CUDA 11.8+ across compatible desktop GPUs.",
  },
};

interface ProviderNode {
  id: NodeId;
  name: string;
  gpu: string;
  vram: number;
  cudaVersion: number;
  cudaLabel: string;
  pcieGen: number;
  pcieLabel: string;
  tier: string;
  svgY: number;
}

const PROVIDER_NODES: ProviderNode[] = [
  {
    id: "alpha",
    name: "Node Alpha",
    gpu: "RTX 4090",
    vram: 24,
    cudaVersion: 12.4,
    cudaLabel: "CUDA 12.4",
    pcieGen: 4.0,
    pcieLabel: "PCIe 4.0",
    tier: "Ada Lovelace",
    svgY: 28,
  },
  {
    id: "beta",
    name: "Node Beta",
    gpu: "RTX 4080",
    vram: 16,
    cudaVersion: 12.2,
    cudaLabel: "CUDA 12.2",
    pcieGen: 4.0,
    pcieLabel: "PCIe 4.0",
    tier: "Ada Lovelace",
    svgY: 68,
  },
  {
    id: "gamma",
    name: "Node Gamma",
    gpu: "RTX 3080",
    vram: 10,
    cudaVersion: 11.8,
    cudaLabel: "CUDA 11.8",
    pcieGen: 3.0,
    pcieLabel: "PCIe 3.0",
    tier: "Ampere",
    svgY: 108,
  },
  {
    id: "delta",
    name: "Node Delta",
    gpu: "RTX 3090",
    vram: 24,
    cudaVersion: 12.1,
    cudaLabel: "CUDA 12.1",
    pcieGen: 3.0,
    pcieLabel: "PCIe 3.0",
    tier: "Ampere",
    svgY: 148,
  },
];

type NodeRoutingStatus = "routed" | "standby" | "paused" | "incompatible";

interface EvaluatedNode {
  node: ProviderNode;
  vramOk: boolean;
  cudaOk: boolean;
  pcieOk: boolean;
  hardwareCompatible: boolean;
  isHostPaused: boolean;
  routingStatus: NodeRoutingStatus;
  statusBadge: string;
  reason: string;
}

export function Hero() {
  const [selectedWorkload, setSelectedWorkload] = useState<WorkloadKey>("lora");
  const [pausedNodes, setPausedNodes] = useState<Record<NodeId, boolean>>({
    alpha: false,
    beta: false,
    gamma: false,
    delta: false,
  });
  const [showGateDetails, setShowGateDetails] = useState<boolean>(false);

  const workloadButtonRefs = useRef<Record<WorkloadKey, HTMLButtonElement | null>>({
    lora: null,
    vllm: null,
    render: null,
  });

  const activePreset = WORKLOAD_PRESETS[selectedWorkload];

  const handleWorkloadKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    let nextIndex: number | null = null;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % WORKLOAD_ORDER.length;
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + WORKLOAD_ORDER.length) % WORKLOAD_ORDER.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = WORKLOAD_ORDER.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const nextKey = WORKLOAD_ORDER[nextIndex];
      setSelectedWorkload(nextKey);
      workloadButtonRefs.current[nextKey]?.focus();
    }
  };

  const toggleNodeGuardrail = (id: NodeId) => {
    setPausedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const resetAllGuardrails = () => {
    setPausedNodes({
      alpha: false,
      beta: false,
      gamma: false,
      delta: false,
    });
  };

  // Step 1: Evaluate hardware compatibility and independent host guardrail state
  const rawEvaluations = PROVIDER_NODES.map((node) => {
    const vramOk = node.vram >= activePreset.vramReq;
    const cudaOk = node.cudaVersion >= activePreset.cudaMin;
    const pcieOk = node.pcieGen >= activePreset.pcieMin;
    const hardwareCompatible = vramOk && cudaOk && pcieOk;
    const isHostPaused = Boolean(pausedNodes[node.id]);

    const failedChecks: string[] = [];
    if (!vramOk) failedChecks.push(`VRAM ${node.vram}GB < ${activePreset.vramReq}GB`);
    if (!cudaOk) failedChecks.push(`CUDA ${node.cudaVersion} < ${activePreset.cudaMin}`);
    if (!pcieOk) failedChecks.push(`PCIe ${node.pcieGen}.0 < ${activePreset.pcieMin}.0`);

    return {
      node,
      vramOk,
      cudaOk,
      pcieOk,
      hardwareCompatible,
      isHostPaused,
      failedReasonText: failedChecks.join(" · "),
    };
  });

  // Step 2: Select deterministic target strictly from hardware-compatible AND unpaused nodes
  const eligibleCandidates = rawEvaluations
    .filter((item) => item.hardwareCompatible && !item.isHostPaused)
    .sort((a, b) => {
      if (a.node.id === activePreset.preferredNodeId) return -1;
      if (b.node.id === activePreset.preferredNodeId) return 1;
      if (a.node.vram !== b.node.vram) return a.node.vram - b.node.vram;
      return b.node.pcieGen - a.node.pcieGen;
    });

  const routedNode = eligibleCandidates[0]?.node ?? null;

  // Step 3: Derive distinct per-node statuses (preserving both compatibility and host pause visibility)
  const evaluatedNodes: EvaluatedNode[] = rawEvaluations.map((item) => {
    if (!item.hardwareCompatible) {
      return {
        ...item,
        routingStatus: "incompatible",
        statusBadge: "INCOMPATIBLE",
        reason: item.isHostPaused
          ? `${item.failedReasonText} (Host also paused)`
          : item.failedReasonText,
      };
    }

    if (item.isHostPaused) {
      return {
        ...item,
        routingStatus: "paused",
        statusBadge: "GUARDRAIL PAUSED",
        reason: "Hardware compatible · Suspended by simulated host guardrail",
      };
    }

    if (routedNode && item.node.id === routedNode.id) {
      return {
        ...item,
        routingStatus: "routed",
        statusBadge: "ROUTED TARGET",
        reason:
          item.node.id === activePreset.preferredNodeId
            ? "Simulated primary match · All constraints satisfied"
            : "Rerouted to eligible standby node",
      };
    }

    return {
      ...item,
      routingStatus: "standby",
      statusBadge: "ELIGIBLE STANDBY",
      reason: "Meets VRAM, CUDA, and PCIe requirements · Standing by",
    };
  });

  const compatibleHardwareCount = evaluatedNodes.filter((n) => n.hardwareCompatible).length;
  const pausedCompatibleCount = evaluatedNodes.filter(
    (n) => n.hardwareCompatible && n.isHostPaused
  ).length;
  const pausedTotalCount = Object.values(pausedNodes).filter(Boolean).length;

  // Concise screen-reader announcement string (prevents re-reading the entire DOM tree)
  const liveAnnouncement = routedNode
    ? `Simulated workload ${activePreset.name}: routed to ${routedNode.name} (${routedNode.gpu}). ${eligibleCandidates.length} of ${PROVIDER_NODES.length} simulated nodes currently eligible. ${pausedTotalCount} node guardrails paused.`
    : `Simulated workload ${activePreset.name}: dispatch held, no eligible node available. ${pausedTotalCount} node guardrails paused.`;

  return (
    <section className="cx-hero-lighting relative pt-28 pb-20 md:pt-36 md:pb-28 border-b border-[var(--border-subtle)] overflow-hidden">
      {/* Dedicated Screen Reader Status Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        {/* TIER 1: Asymmetric Editorial Header & Role Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end pb-12 md:pb-16 border-b border-[var(--border-subtle)]">
          {/* Left 7 Columns: Editorial Headline & Concise Narrative */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)]/90 px-3.5 py-1 text-[11px] font-medium tracking-[0.02em] text-[var(--text-secondary)] mb-6">
              <span
                className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              />
              <span>Conceptual Protocol Specification</span>
              <span className="text-[var(--text-dim)]">·</span>
              <span className="font-mono text-[10px] text-[var(--text-primary)]">v0.1</span>
            </div>

            <h1
              className="text-[2.25rem] sm:text-[2.85rem] lg:text-[3.35rem] font-semibold tracking-[-0.04em] text-[var(--text-primary)] leading-[1.05]"
              style={{ textWrap: "balance" }}
            >
              Fragmented GPU capacity, coordinated into a reliable compute network.
            </h1>

            <p
              className="mt-5 max-w-[58ch] text-base sm:text-[1.0625rem] text-[var(--text-secondary)] leading-[1.65] font-normal"
              style={{ textWrap: "pretty" }}
            >
              ComputeX is being designed to match developer workloads with compatible desktop GPUs shared by community providers. The coordination layer verifies hardware capabilities before routing, while providers retain local control over schedules and thermal limits.
            </p>
          </div>

          {/* Right 5 Columns: Preserved Role CTAs & Honest Project Framing */}
          <div className="lg:col-span-5 flex flex-col lg:items-end justify-end">
            <div className="w-full sm:w-auto lg:w-full max-w-md space-y-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#for-renters"
                  className="btn-action flex-1 inline-flex items-center justify-center rounded-lg bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg-primary)] shadow-sm hover:bg-[var(--accent)] hover:text-[#0A0A0C]"
                >
                  I Need GPU Compute
                  <svg
                    className="ml-2 h-4 w-4 shrink-0"
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
                  className="btn-action flex-1 inline-flex items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--bg-secondary)] px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                >
                  I Have a GPU to Share
                </a>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed pl-3.5 border-l border-[var(--border-strong)]">
                <strong className="font-medium text-[var(--text-secondary)]">
                  Concept Presentation:{" "}
                </strong>
                All workloads, nodes, quotes, and guardrail triggers below are simulated examples illustrating the proposed coordination protocol.
              </p>
            </div>
          </div>
        </div>

        {/* TIER 2: Full-Width Open Spatial Routing Topology */}
        <div className="pt-10 md:pt-12">
          {/* Quiet Stage Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                Interactive Protocol Simulation
              </span>
              <span className="hidden sm:block text-xs font-mono text-[var(--text-muted)]">
                {"// 01 Renter Demand → 02 Coordination Kernel → 03 Provider Hardware"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {pausedTotalCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllGuardrails}
                  className="btn-action text-xs font-medium text-[var(--brand-amber)] hover:underline cursor-pointer"
                >
                  Reset All Host Guardrails ({pausedTotalCount} paused)
                </button>
              )}
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[var(--text-muted)]">
                Zero Fabricated Telemetry
              </span>
            </div>
          </div>

          {/* 3-Actor Spatial Grid: stacks on mobile, 12-col on lg */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-7 items-start">
            {/* ACTOR 01: COMPUTE RENTER (Columns 1–3 on lg) */}
            <div className="lg:col-span-3">
              <div className="flex items-baseline justify-between pb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                  <span className="font-mono text-[var(--accent)] mr-1.5">01</span>
                  Compute Renter
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Select Workload
                </span>
              </div>

              <div
                className="divide-y divide-[var(--border-subtle)] border-b border-[var(--border-subtle)]"
                role="group"
                aria-label="Simulated renter workload presets"
              >
                {WORKLOAD_ORDER.map((key, idx) => {
                  const preset = WORKLOAD_PRESETS[key];
                  const isSelected = selectedWorkload === key;

                  return (
                    <button
                      key={key}
                      ref={(el) => {
                        workloadButtonRefs.current[key] = el;
                      }}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedWorkload(key)}
                      onKeyDown={(e) => handleWorkloadKeyDown(e, idx)}
                      className={`btn-action w-full text-left py-4 px-3.5 transition-colors cursor-pointer relative ${
                        isSelected
                          ? "bg-[var(--bg-surface)] text-[var(--text-primary)]"
                          : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      <span
                        className={`absolute left-0 top-2.5 bottom-2.5 w-[2px] rounded-full transition-colors ${
                          isSelected ? "bg-[var(--accent)]" : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs sm:text-[13px] font-semibold tracking-[-0.01em] leading-snug">
                          {preset.name}
                        </span>
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
                            isSelected ? "bg-[var(--accent)]" : "bg-[var(--text-dim)]"
                          }`}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-[var(--text-muted)]">
                        <span className={isSelected ? "text-[var(--text-primary)]" : ""}>
                          {preset.vramReq}GB VRAM
                        </span>
                        <span className="text-[var(--text-dim)]">·</span>
                        <span>CUDA {preset.cudaLabel}</span>
                        <span className="text-[var(--text-dim)]">·</span>
                        <span>{preset.pcieLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Demand Summary */}
              <div className="mt-4 pt-1 text-xs text-[var(--text-secondary)] space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    SIMULATED MANIFEST
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {activePreset.category}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {activePreset.summary}
                </p>
              </div>
            </div>

            {/* ACTOR 02: COMPUTEX COORDINATION KERNEL (Central Focal Point — Columns 4–8 on lg) */}
            <div className="lg:col-span-5">
              <div className="flex items-baseline justify-between pb-3 mb-3.5 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                  <span className="font-mono text-[var(--accent)] mr-1.5">02</span>
                  ComputeX Coordination Kernel
                </span>
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                  Central Router Core
                </span>
              </div>

              {/* Dominant Central Kernel Frame (Machined Graphite Chassis) */}
              <div
                className={`cx-kernel-chassis rounded-xl border p-5 transition-colors ${
                  routedNode
                    ? "border-[var(--border-strong)]"
                    : "border-[var(--brand-amber)]/40"
                }`}
              >
                {/* Kernel Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        routedNode ? "bg-[var(--brand-emerald)]" : "bg-[var(--brand-amber)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                      {routedNode
                        ? "Simulated Route Matched"
                        : "Dispatch Held · No Eligible Node"}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[11px] px-2.5 py-0.5 rounded-md border ${
                      routedNode
                        ? "border-[var(--accent-border)] bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                        : "border-[var(--brand-amber)]/40 bg-[var(--brand-amber)]/10 text-[var(--brand-amber)] font-medium"
                    }`}
                  >
                    {routedNode ? `→ ${routedNode.name.toUpperCase()}` : "ZERO MATCHES"}
                  </span>
                </div>

                {/* Self-Contained Spatial Routing Viewport */}
                <div className="cx-kernel-viewport my-4 rounded-lg border border-[var(--border-subtle)] p-3.5 overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
                    <span>Renter Spec</span>
                    <span className="text-[var(--text-secondary)]">Kernel Gate Filter</span>
                    <span>Provider Pool</span>
                  </div>

                  <svg
                    className="w-full h-40 select-none"
                    viewBox="0 0 360 176"
                    fill="none"
                    role="img"
                    aria-label={`Routing topology diagram from ${activePreset.name} through the ComputeX Kernel to four simulated provider nodes.`}
                  >
                    {/* Subtle Structural Zone Guides */}
                    <line
                      x1="78"
                      y1="14"
                      x2="78"
                      y2="162"
                      stroke="rgba(255,255,255,0.04)"
                      strokeDasharray="2 4"
                    />
                    <line
                      x1="262"
                      y1="14"
                      x2="262"
                      y2="162"
                      stroke="rgba(255,255,255,0.04)"
                      strokeDasharray="2 4"
                    />

                    {/* Inbound Renter -> Kernel Trunk */}
                    <path
                      d="M 32 88 L 126 88"
                      stroke="#36B5FF"
                      strokeWidth="1.75"
                      className="cx-topology-trace"
                    />
                    <path
                      d="M 32 88 L 126 88"
                      stroke="#F5F5F7"
                      strokeWidth="1.75"
                      strokeOpacity="0.7"
                      className="cx-topology-trace-active"
                    />

                    {/* Renter Origin Terminal */}
                    <rect
                      x="10"
                      y="73"
                      width="22"
                      height="30"
                      rx="4"
                      fill="#16171B"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth="1.25"
                    />
                    <circle cx="21" cy="88" r="3" fill="#36B5FF" />

                    {/* Outbound Kernel -> 4 Provider Candidate Traces */}
                    {evaluatedNodes.map(({ node, routingStatus }) => {
                      const isRouted = routingStatus === "routed";
                      const isPaused = routingStatus === "paused";
                      const isStandby = routingStatus === "standby";

                      const traceColor = isRouted
                        ? "#36B5FF"
                        : isPaused
                        ? "#F59E0B"
                        : isStandby
                        ? "rgba(255,255,255,0.22)"
                        : "rgba(255,255,255,0.07)";

                      const pathD = `M 214 88 C 258 88, 264 ${node.svgY}, 318 ${node.svgY}`;

                      return (
                        <g key={node.id}>
                          <path
                            d={pathD}
                            stroke={traceColor}
                            strokeWidth={isRouted ? "2" : "1.2"}
                            strokeDasharray={
                              isRouted
                                ? undefined
                                : isPaused
                                ? "4 3"
                                : isStandby
                                ? "2 3"
                                : undefined
                            }
                            className="cx-topology-trace"
                          />
                          {isRouted && (
                            <path
                              d={pathD}
                              stroke="#F5F5F7"
                              strokeWidth="1.75"
                              strokeOpacity="0.85"
                              className="cx-topology-trace-active"
                            />
                          )}
                          {/* Provider Node Terminal */}
                          <circle
                            cx="322"
                            cy={node.svgY}
                            r={isRouted ? "4.5" : "3"}
                            fill={
                              isRouted
                                ? "#10B981"
                                : isPaused
                                ? "#F59E0B"
                                : isStandby
                                ? "#71717A"
                                : "#27272A"
                            }
                            stroke={isRouted ? "#0A0A0C" : "none"}
                            strokeWidth="1.5"
                          />
                          <text
                            x="334"
                            y={node.svgY + 3.5}
                            fill={
                              isRouted
                                ? "#F5F5F7"
                                : isPaused
                                ? "#F59E0B"
                                : "#71717A"
                            }
                            fontSize="9"
                            fontFamily="var(--font-mono)"
                          >
                            {node.id.slice(0, 1).toUpperCase()}
                          </text>
                        </g>
                      );
                    })}

                    {/* Central Coordination Kernel Core Schematic */}
                    <rect
                      x="126"
                      y="42"
                      width="88"
                      height="92"
                      rx="6"
                      fill="#141519"
                      stroke={routedNode ? "rgba(255,255,255,0.24)" : "#F59E0B"}
                      strokeWidth="1.25"
                    />
                    <line
                      x1="138"
                      y1="65"
                      x2="202"
                      y2="65"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x="170"
                      y="57"
                      textAnchor="middle"
                      fill="#F5F5F7"
                      fontSize="8.5"
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.08em"
                    >
                      KERNEL
                    </text>
                    <text
                      x="170"
                      y="84"
                      textAnchor="middle"
                      fill="#A1A1AA"
                      fontSize="8"
                      fontFamily="var(--font-mono)"
                    >
                      {activePreset.vramReq}GB · {activePreset.pcieLabel}
                    </text>
                    <text
                      x="170"
                      y="101"
                      textAnchor="middle"
                      fill={routedNode ? "#10B981" : "#F59E0B"}
                      fontSize="8.5"
                      fontFamily="var(--font-mono)"
                    >
                      {routedNode ? "MATCH OK" : "HELD"}
                    </text>
                    <text
                      x="170"
                      y="119"
                      textAnchor="middle"
                      fill="#71717A"
                      fontSize="7.5"
                      fontFamily="var(--font-mono)"
                    >
                      {eligibleCandidates.length}/4 ELIGIBLE
                    </text>
                  </svg>
                </div>

                {/* Decision Narrative (Default Sparse Explanation) */}
                <div className="space-y-4">
                  {routedNode ? (
                    <div className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-[var(--text-primary)] font-semibold">
                        Simulated Match:{" "}
                      </span>
                      Workload routed to{" "}
                      <span className="text-[var(--text-primary)] font-medium underline decoration-[var(--accent)]/60 underline-offset-4">
                        {routedNode.name} ({routedNode.gpu})
                      </span>
                      , which satisfies the {activePreset.vramReq}GB VRAM floor, CUDA{" "}
                      {activePreset.cudaLabel}, and {activePreset.pcieLabel} constraint with an active host idle window.
                    </div>
                  ) : (
                    <div className="text-xs sm:text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-[var(--brand-amber)] font-semibold">
                        Routing Suspended:{" "}
                      </span>
                      {compatibleHardwareCount > 0 && pausedCompatibleCount > 0
                        ? "Hardware-compatible node(s) are currently paused by simulated host guardrails. The coordination kernel holds dispatch rather than routing to incompatible fallback hardware."
                        : "No simulated provider node meets the required VRAM, CUDA, and PCIe constraints for this workload."}
                    </div>
                  )}

                  {/* Unified Hairline Constraint Ledger (Replaces 4 Separate Mini-Boxes) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 font-mono text-[11px] overflow-hidden">
                    <div className="px-3 py-2 border-b sm:border-b-0 border-r border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        VRAM FLOOR
                      </span>
                      <span className="mt-0.5 block text-[var(--text-primary)] font-medium">
                        &gt;= {activePreset.vramReq} GB
                      </span>
                    </div>
                    <div className="px-3 py-2 border-b sm:border-b-0 sm:border-r border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        CUDA TARGET
                      </span>
                      <span className="mt-0.5 block text-[var(--text-primary)] font-medium">
                        {activePreset.cudaLabel}
                      </span>
                    </div>
                    <div className="px-3 py-2 border-r border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        BUS SPEC
                      </span>
                      <span className="mt-0.5 block text-[var(--text-primary)] font-medium">
                        {activePreset.pcieLabel}
                      </span>
                    </div>
                    <div className="px-3 py-2">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        ELIGIBLE POOL
                      </span>
                      <span
                        className={`mt-0.5 block font-medium ${
                          routedNode ? "text-[var(--brand-emerald)]" : "text-[var(--brand-amber)]"
                        }`}
                      >
                        {eligibleCandidates.length} of {PROVIDER_NODES.length} nodes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Verification Gate Drawer */}
                <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-expanded={showGateDetails}
                    onClick={() => setShowGateDetails((prev) => !prev)}
                    className="btn-action text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {showGateDetails
                      ? "Hide protocol verification gates −"
                      : "Inspect protocol verification gates +"}
                  </button>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    SPEC_V0.1
                  </span>
                </div>

                {showGateDetails && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2 text-xs">
                    <div className="flex flex-wrap justify-between gap-1 text-[var(--text-secondary)]">
                      <span>Gate 1 · Hardware Capability Check:</span>
                      <span className="font-mono text-[var(--text-primary)]">
                        {compatibleHardwareCount} of {PROVIDER_NODES.length} nodes compatible
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-1 text-[var(--text-secondary)]">
                      <span>Gate 2 · Host Sovereignty Guardrails:</span>
                      <span className="font-mono text-[var(--text-primary)]">
                        {pausedTotalCount > 0
                          ? `${pausedTotalCount} node(s) paused by host`
                          : "All simulated hosts idle"}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-1 text-[var(--text-secondary)]">
                      <span>Gate 3 · Illustrative Rate Estimate:</span>
                      <span className="font-mono text-[var(--text-primary)]">
                        {activePreset.simulatedQuote}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] pt-1 leading-relaxed">
                      {activePreset.proposedSandbox}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTOR 03: PROVIDER HARDWARE POOL (Columns 9–12 on lg) */}
            <div className="lg:col-span-4">
              <div className="flex items-baseline justify-between pb-3 mb-3.5 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
                  <span className="font-mono text-[var(--accent)] mr-1.5">03</span>
                  Provider Hardware
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Simulated Nodes (Toggle Guardrail)
                </span>
              </div>

              <div className="space-y-2.5">
                {evaluatedNodes.map(
                  ({
                    node,
                    hardwareCompatible,
                    isHostPaused,
                    routingStatus,
                    statusBadge,
                    reason,
                  }) => {
                    const isRouted = routingStatus === "routed";
                    const isIncompatible = routingStatus === "incompatible";

                    return (
                      <div
                        key={node.id}
                        className={`rounded-lg border p-3.5 transition-colors ${
                          isRouted
                            ? "cx-node-routed border-[var(--border-strong)]"
                            : isHostPaused
                            ? "border-[var(--brand-amber)]/35 bg-[var(--bg-secondary)]/80"
                            : isIncompatible
                            ? "border-[var(--border-subtle)] bg-transparent opacity-65"
                            : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]/45"
                        }`}
                      >
                        {/* Row 1: Node Identity + Distinct Eligibility/Routing Status Badge */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                isRouted
                                  ? "bg-[var(--brand-emerald)]"
                                  : isHostPaused
                                  ? "bg-[var(--brand-amber)]"
                                  : hardwareCompatible
                                  ? "bg-[var(--text-secondary)]"
                                  : "bg-[var(--text-dim)]"
                              }`}
                              aria-hidden="true"
                            />
                            <span
                              className={`text-sm font-semibold tracking-[-0.01em] ${
                                isIncompatible && !isHostPaused
                                  ? "text-[var(--text-secondary)]"
                                  : "text-[var(--text-primary)]"
                              }`}
                            >
                              {node.name}
                            </span>
                            <span className="text-xs font-mono text-[var(--text-secondary)]">
                              · {node.gpu}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            {isIncompatible && isHostPaused && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-[var(--brand-amber)]/40 bg-[var(--brand-amber)]/10 text-[var(--brand-amber)]">
                                HOST PAUSED
                              </span>
                            )}
                            <span
                              className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                                isRouted
                                  ? "border-[var(--brand-emerald)]/40 bg-[var(--brand-emerald)]/12 text-[var(--brand-emerald)] font-medium"
                                  : routingStatus === "paused"
                                  ? "border-[var(--brand-amber)]/40 bg-[var(--brand-amber)]/12 text-[var(--brand-amber)] font-medium"
                                  : isIncompatible
                                  ? "border-[var(--border-subtle)] text-[var(--text-muted)]"
                                  : "border-[var(--border-strong)] text-[var(--text-secondary)]"
                              }`}
                            >
                              {statusBadge}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Simulated Hardware Capabilities */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-[var(--text-secondary)]">
                          <span>{node.vram}GB VRAM</span>
                          <span className="text-[var(--text-dim)]">·</span>
                          <span>{node.cudaLabel}</span>
                          <span className="text-[var(--text-dim)]">·</span>
                          <span>{node.pcieLabel}</span>
                          <span className="text-[var(--text-dim)]">·</span>
                          <span className="font-sans text-[var(--text-muted)]">{node.tier}</span>
                        </div>

                        {/* Row 3: Evaluation Reason + Independent Host Guardrail Toggle */}
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2">
                          <span className="text-xs text-[var(--text-muted)] leading-snug">
                            {reason}
                          </span>

                          <button
                            type="button"
                            aria-pressed={isHostPaused}
                            onClick={() => toggleNodeGuardrail(node.id)}
                            className={`btn-action px-2.5 py-1 rounded-md border text-[11px] font-medium cursor-pointer shrink-0 ${
                              isHostPaused
                                ? "border-[var(--brand-amber)]/60 bg-[var(--brand-amber)]/15 text-[var(--brand-amber)]"
                                : "border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {isHostPaused
                              ? "Host Guardrail: Paused (Resume)"
                              : "Simulate Host Busy"}
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}