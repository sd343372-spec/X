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
        reason: item. isHostPaused
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
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
      {/* Dedicated Screen Reader Status Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Restrained Architectural Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border-subtle) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 85% 75% at 50% 45%, black 15%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* TIER 1: Asymmetric Editorial Header & Role Pathways */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end pb-10 md:pb-12 border-b border-[var(--border-subtle)]">
          {/* Left 7 Columns: Editorial Headline & Concise Narrative */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2.5 border-l-2 border-[var(--accent)] pl-3 py-0.5 text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--text-secondary)] mb-5">
              <span>Conceptual Protocol Specification · v0.1</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold tracking-[-0.035em] text-[var(--text-primary)] leading-[1.08]"
              style={{ textWrap: "balance" }}
            >
              Fragmented GPU capacity, coordinated into a reliable compute network.
            </h1>

            <p
              className="mt-4 max-w-[60ch] text-base sm:text-[1.0625rem] text-[var(--text-secondary)] leading-relaxed"
              style={{ textWrap: "pretty" }}
            >
              ComputeX is being designed to match developer workloads with compatible desktop GPUs shared by community providers. The coordination layer verifies hardware capabilities before routing, while providers retain local control over schedules and thermal limits.
            </p>
          </div>

          {/* Right 5 Columns: Preserved Role CTAs & Honest Project Framing */}
          <div className="lg:col-span-5 flex flex-col lg:items-end justify-end">
            <div className="w-full sm:w-auto lg:w-full max-w-md space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#for-renters"
                  className="btn-action flex-1 inline-flex items-center justify-center rounded bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--bg-primary)] hover:bg-[var(--accent-hover)] hover:text-white"
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
                  className="btn-action flex-1 inline-flex items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--bg-secondary)]/80 px-5 py-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  I Have a GPU to Share
                </a>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed border-l border-[var(--border-strong)] pl-3">
                <strong className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-normal">
                  Concept Presentation:{" "}
                </strong>
                All workloads, nodes, quotes, and guardrail triggers below are simulated examples illustrating the proposed coordination protocol.
              </p>
            </div>
          </div>
        </div>

        {/* TIER 2: Full-Width Open Spatial Routing Topology */}
        <div className="pt-8 md:pt-10">
          {/* Topology Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              />
              <span className="text-xs font-mono uppercase tracking-[0.1em] text-[var(--text-primary)] font-medium">
                Interactive Protocol Simulation
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {"// 01 Renter Demand → 02 Coordination Kernel → 03 Provider Hardware"}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {pausedTotalCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllGuardrails}
                  className="btn-action text-xs font-mono text-[var(--brand-amber)] hover:underline cursor-pointer"
                >
                  Reset All Host Guardrails ({pausedTotalCount} paused)
                </button>
              )}
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                Zero Fabricated Telemetry
              </span>
            </div>
          </div>

          {/* 3-Actor Spatial Grid: 3 cols Renter / 5 cols Central Kernel / 4 cols Provider Pool */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-start">
            {/* ACTOR 01: COMPUTE RENTER (Columns 1–3 on lg) */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--accent)] font-medium">
                  01 · Compute Renter
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
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
                      className={`btn-action w-full text-left py-3.5 px-3 transition-colors cursor-pointer relative ${
                        isSelected
                          ? "bg-[var(--bg-surface)]/80 text-[var(--text-primary)]"
                          : "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50"
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      <span
                        className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors ${
                          isSelected ? "bg-[var(--accent)]" : "bg-transparent"
                        }`}
                        aria-hidden="true"
                      />

                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs sm:text-sm font-semibold leading-snug">
                          {preset.name}
                        </span>
                        <span
                          className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            isSelected ? "bg-[var(--accent)]" : "bg-[var(--border-strong)]"
                          }`}
                          aria-hidden="true"
                        />
                      </div>

                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-[var(--text-muted)]">
                        <span className={isSelected ? "text-[var(--accent)]" : ""}>
                          {preset.vramReq}GB VRAM
                        </span>
                        <span>·</span>
                        <span>CUDA {preset.cudaLabel}</span>
                        <span>·</span>
                        <span>{preset.pcieLabel}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Demand Summary */}
              <div className="mt-4 text-xs text-[var(--text-secondary)] space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-muted)]">
                  <span>SIMULATED MANIFEST</span>
                  <span className="text-[var(--text-primary)]">{activePreset.category}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {activePreset.summary}
                </p>
              </div>
            </div>

            {/* ACTOR 02: COMPUTEX COORDINATION KERNEL (Central Focal Point — Columns 4–8 on lg) */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--text-primary)] font-semibold">
                  02 · ComputeX Coordination Kernel
                </span>
                <span className="text-[11px] font-mono text-[var(--accent)]">
                  Central Router Core
                </span>
              </div>

              {/* Dominant Central Kernel Frame */}
              <div
                className={`rounded-lg border-t-2 border-x border-b p-4 sm:p-5 transition-colors ${
                  routedNode
                    ? "border-t-[var(--accent)] border-x-[var(--border-strong)] border-b-[var(--border-strong)] bg-[var(--bg-secondary)]"
                    : "border-t-[var(--brand-amber)] border-x-[var(--brand-amber)]/40 border-b-[var(--brand-amber)]/40 bg-[var(--bg-secondary)]"
                }`}
              >
                {/* Kernel Status Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        routedNode ? "bg-[var(--accent)]" : "bg-[var(--brand-amber)]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold text-[var(--text-primary)]">
                      {routedNode
                        ? "Simulated Route Matched"
                        : "Dispatch Held · No Eligible Node"}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                      routedNode
                        ? "border-[var(--accent)]/40 bg-[var(--accent-muted)] text-[var(--accent)] font-semibold"
                        : "border-[var(--brand-amber)]/40 bg-[var(--brand-amber)]/10 text-[var(--brand-amber)] font-semibold"
                    }`}
                  >
                    {routedNode ? `→ ${routedNode.name.toUpperCase()}` : "ZERO MATCHES"}
                  </span>
                </div>

                {/* Self-Contained Spatial Routing Diagram (Explicit Renter -> Kernel -> 4 Nodes Flow) */}
                <div className="my-4 rounded border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">
                    <span>Renter Spec</span>
                    <span className="text-[var(--accent)]">Kernel Gate Filter</span>
                    <span>Provider Pool</span>
                  </div>

                  <svg
                    className="w-full h-40 select-none"
                    viewBox="0 0 360 176"
                    fill="none"
                    role="img"
                    aria-label={`Routing topology diagram from ${activePreset.name} through the ComputeX Kernel to four simulated provider nodes.`}
                  >
                    {/* Inbound Renter -> Kernel Trunk */}
                    <path
                      d="M 28 88 L 128 88"
                      stroke="#38BDF8"
                      strokeWidth="2"
                      className="cx-topology-trace"
                    />
                    <path
                      d="M 28 88 L 128 88"
                      stroke="#F8FAFC"
                      strokeWidth="2"
                      strokeOpacity="0.65"
                      className="cx-topology-trace-active"
                    />

                    {/* Renter Origin Node */}
                    <rect
                      x="8"
                      y="72"
                      width="24"
                      height="32"
                      rx="3"
                      fill="#121A2A"
                      stroke="#38BDF8"
                      strokeWidth="1.5"
                    />
                    <circle cx="20" cy="88" r="3.5" fill="#38BDF8" />

                    {/* Outbound Kernel -> 4 Provider Candidate Traces */}
                    {evaluatedNodes.map(({ node, routingStatus }) => {
                      const isRouted = routingStatus === "routed";
                      const isPaused = routingStatus === "paused";
                      const isStandby = routingStatus === "standby";

                      const traceColor = isRouted
                        ? "#38BDF8"
                        : isPaused
                        ? "#F59E0B"
                        : isStandby
                        ? "#475569"
                        : "#1E293B";

                      const pathD = `M 212 88 C 258 88, 262 ${node.svgY}, 318 ${node.svgY}`;

                      return (
                        <g key={node.id}>
                          <path
                            d={pathD}
                            stroke={traceColor}
                            strokeWidth={isRouted ? "2.25" : "1.25"}
                            strokeDasharray={
                              isRouted
                                ? undefined
                                : isPaused
                                ? "4 3"
                                : isStandby
                                ? "2 3"
                                : "1 4"
                            }
                            className="cx-topology-trace"
                          />
                          {isRouted && (
                            <path
                              d={pathD}
                              stroke="#F8FAFC"
                              strokeWidth="2"
                              strokeOpacity="0.8"
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
                                ? "#64748B"
                                : "#1E293B"
                            }
                            stroke={isRouted ? "#090D14" : "none"}
                            strokeWidth="1.5"
                          />
                          <text
                            x="333"
                            y={node.svgY + 3.5}
                            fill={
                              isRouted
                                ? "#F8FAFC"
                                : isPaused
                                ? "#F59E0B"
                                : "#64748B"
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
                      x="128"
                      y="44"
                      width="84"
                      height="88"
                      rx="4"
                      fill="#0D131F"
                      stroke={routedNode ? "#38BDF8" : "#F59E0B"}
                      strokeWidth="1.75"
                    />
                    <line
                      x1="140"
                      y1="66"
                      x2="200"
                      y2="66"
                      stroke="#1E293B"
                      strokeWidth="1"
                    />
                    <text
                      x="170"
                      y="59"
                      textAnchor="middle"
                      fill="#F8FAFC"
                      fontSize="8.5"
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.06em"
                    >
                      KERNEL
                    </text>
                    <text
                      x="170"
                      y="84"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="8"
                      fontFamily="var(--font-mono)"
                    >
                      {activePreset.vramReq}GB · {activePreset.pcieLabel}
                    </text>
                    <text
                      x="170"
                      y="100"
                      textAnchor="middle"
                      fill={routedNode ? "#10B981" : "#F59E0B"}
                      fontSize="8.5"
                      fontFamily="var(--font-mono)"
                    >
                      {routedNode ? "MATCH OK" : "HELD"}
                    </text>
                    <text
                      x="170"
                      y="118"
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="7.5"
                      fontFamily="var(--font-mono)"
                    >
                      {eligibleCandidates.length}/4 ELIGIBLE
                    </text>
                  </svg>
                </div>

                {/* Decision Narrative (Default Sparse Explanation) */}
                <div className="space-y-3">
                  {routedNode ? (
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-[var(--text-primary)] font-semibold">
                        Simulated Match:{" "}
                      </span>
                      Workload routed to{" "}
                      <span className="text-[var(--accent)] font-medium">
                        {routedNode.name} ({routedNode.gpu})
                      </span>
                      , which satisfies the {activePreset.vramReq}GB VRAM floor, CUDA{" "}
                      {activePreset.cudaLabel}, and {activePreset.pcieLabel} constraint with an active host idle window.
                    </div>
                  ) : (
                    <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-[var(--brand-amber)] font-semibold">
                        Routing Suspended:{" "}
                      </span>
                      {compatibleHardwareCount > 0 && pausedCompatibleCount > 0
                        ? "Hardware-compatible node(s) are currently paused by simulated host guardrails. The coordination kernel holds dispatch rather than routing to incompatible fallback hardware."
                        : "No simulated provider node meets the required VRAM, CUDA, and PCIe constraints for this workload."}
                    </div>
                  )}

                  {/* 4-Constraint Summary Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                    <div className="rounded bg-[var(--bg-primary)] px-2.5 py-1.5 border border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        VRAM FLOOR
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        &gt;= {activePreset.vramReq} GB
                      </span>
                    </div>
                    <div className="rounded bg-[var(--bg-primary)] px-2.5 py-1.5 border border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        CUDA TARGET
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {activePreset.cudaLabel}
                      </span>
                    </div>
                    <div className="rounded bg-[var(--bg-primary)] px-2.5 py-1.5 border border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        BUS SPEC
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {activePreset.pcieLabel}
                      </span>
                    </div>
                    <div className="rounded bg-[var(--bg-primary)] px-2.5 py-1.5 border border-[var(--border-subtle)]">
                      <span className="block text-[9px] text-[var(--text-muted)]">
                        ELIGIBLE POOL
                      </span>
                      <span
                        className={`font-medium ${
                          routedNode ? "text-[var(--brand-emerald)]" : "text-[var(--brand-amber)]"
                        }`}
                      >
                        {eligibleCandidates.length} of {PROVIDER_NODES.length} nodes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Optional Verification Gate Drawer */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    aria-expanded={showGateDetails}
                    onClick={() => setShowGateDetails((prev) => !prev)}
                    className="btn-action text-xs font-mono text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    {showGateDetails
                      ? "Hide protocol verification gates −"
                      : "Inspect protocol verification gates +"}
                  </button>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    SPEC_V0.1
                  </span>
                </div>

                {showGateDetails && (
                  <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] space-y-2 text-xs font-mono">
                    <div className="flex flex-wrap justify-between gap-1 text-[var(--text-secondary)]">
                      <span>Gate 1 · Hardware Capability Check:</span>
                      <span className="text-[var(--text-primary)]">
                        {compatibleHardwareCount} of {PROVIDER_NODES.length} nodes compatible
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-1 text-[var(--text-secondary)]">
                      <span>Gate 2 · Host Sovereignty Guardrails:</span>
                      <span className="text-[var(--text-primary)]">
                        {pausedTotalCount > 0
                          ? `${pausedTotalCount} node(s) paused by host`
                          : "All simulated hosts idle"}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-1 text-[var(--text-secondary)]">
                      <span>Gate 3 · Illustrative Rate Estimate:</span>
                      <span className="text-[var(--text-primary)]">
                        {activePreset.simulatedQuote}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] pt-1 leading-relaxed font-sans">
                      {activePreset.proposedSandbox}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ACTOR 03: PROVIDER HARDWARE POOL (Columns 9–12 on lg) */}
            <div className="lg:col-span-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--text-primary)] font-medium">
                  03 · Provider Hardware
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  Simulated Nodes (Toggle Guardrail)
                </span>
              </div>

              <div className="space-y-3">
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
                        className={`rounded border p-3.5 transition-colors ${
                          isRouted
                            ? "border-[var(--accent)] bg-[var(--bg-surface)]/90"
                            : isHostPaused
                            ? "border-[var(--brand-amber)]/50 bg-[var(--bg-secondary)]/85"
                            : isIncompatible
                            ? "border-[var(--border-subtle)] bg-[var(--bg-primary)]/90"
                            : "border-[var(--border-subtle)] bg-[var(--bg-secondary)]/55"
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
                                  ? "bg-[var(--accent)]/60"
                                  : "bg-[var(--text-dim)]"
                              }`}
                              aria-hidden="true"
                            />
                            <span
                              className={`text-sm font-semibold ${
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
                            {/* If a node is BOTH hardware-incompatible AND host-paused, show both badges distinctly */}
                            {isIncompatible && isHostPaused && (
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-[var(--brand-amber)]/40 bg-[var(--brand-amber)]/10 text-[var(--brand-amber)]">
                                HOST PAUSED
                              </span>
                            )}
                            <span
                              className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                                isRouted
                                  ? "border-[var(--brand-emerald)]/40 bg-[var(--brand-emerald)]/15 text-[var(--brand-emerald)] font-semibold"
                                  : routingStatus === "paused"
                                  ? "border-[var(--brand-amber)]/40 bg-[var(--brand-amber)]/15 text-[var(--brand-amber)] font-semibold"
                                  : isIncompatible
                                  ? "border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                                  : "border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-secondary)]"
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
                          <span className="text-[var(--text-muted)]">{node.tier}</span>
                        </div>

                        {/* Row 3: Evaluation Reason + Independent Host Guardrail Toggle */}
                        <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs text-[var(--text-muted)] leading-snug">
                            {reason}
                          </span>

                          <button
                            type="button"
                            aria-pressed={isHostPaused}
                            onClick={() => toggleNodeGuardrail(node.id)}
                            className={`btn-action px-2.5 py-1 rounded border text-[11px] font-mono cursor-pointer shrink-0 ${
                              isHostPaused
                                ? "border-[var(--brand-amber)] bg-[var(--brand-amber)]/15 text-[var(--brand-amber)] font-medium"
                                : "border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
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