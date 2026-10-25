"use client";

import { useState } from "react";

export function ProviderSection() {
  const [thermalLimit, setThermalLimit] = useState(72);
  const [idleOnly, setIdleOnly] = useState(true);
  const [instantReclaim, setInstantReclaim] = useState(true);
  const [scheduleMode, setScheduleMode] = useState<"any-idle" | "overnight">("any-idle");

  const getThermalProfile = (temp: number) => {
    if (temp <= 68) return { label: "Conservative & Whisper Quiet", color: "text-[#10B981]" };
    if (temp <= 76) return { label: "Balanced Acoustic & Thermal Target", color: "text-[#38BDF8]" };
    return { label: "High-Throughput Performance Cap", color: "text-[#F59E0B]" };
  };

  const thermalProfile = getThermalProfile(thermalLimit);

  return (
    <section id="for-providers" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#090D14]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider block mb-2 font-medium">
            For GPU Providers & Hardware Owners
          </span>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            Share GPU Capacity on Your Exact Terms
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            The ComputeX desktop agent is architected around absolute host sovereignty. You decide when compute runs, how hot your hardware gets, and when to revoke access.
          </p>
        </div>

        {/* 2-Column Layout: Desktop Agent Interface Left + Technical Narrative Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Authentic Desktop Agent Control Schematic */}
          <div className="lg:col-span-6 rounded-xl border border-[#1E293B] bg-[#0D131F] overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#090D14] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
                <span className="font-mono text-xs text-[#F8FAFC]">
                  ComputeX Node Daemon // Host Controls
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                PROTOTYPE CONCEPT
              </span>
            </div>

            {/* Hardware Telemetry Status Strip */}
            <div className="grid grid-cols-3 divide-x divide-[#1E293B] border-b border-[#1E293B] bg-[#090D14]/80 text-center py-2.5 text-[10px] font-mono">
              <div>
                <span className="text-[#64748B] block text-[9px]">CURRENT TEMP</span>
                <span className="text-[#10B981] font-semibold">41°C (Ambient)</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[9px]">FAN PROFILE</span>
                <span className="text-[#38BDF8] font-semibold">0 RPM (Silent)</span>
              </div>
              <div>
                <span className="text-[#64748B] block text-[9px]">HOST STATE</span>
                <span className="text-[#F8FAFC] font-semibold">Idle Sovereign</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              
              {/* Control 1: Thermal Cutoff Guardrail */}
              <div className="rounded-lg border border-[#1E293B] bg-[#121A2A] p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-[#F8FAFC]">Maximum Thermal Threshold</span>
                  <span className="font-mono text-[#10B981] font-semibold text-sm">{thermalLimit}°C</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="85"
                  value={thermalLimit}
                  onChange={(e) => setThermalLimit(Number(e.target.value))}
                  className="w-full accent-[#10B981] bg-[#090D14] h-2 rounded cursor-pointer"
                  aria-label="Maximum thermal threshold"
                />
                <div className="mt-2 flex flex-wrap items-start justify-between gap-x-2 gap-y-1 text-[11px]">
                  <span className={`font-mono ${thermalProfile.color}`}>{thermalProfile.label}</span>
                  <span className="text-[#64748B] shrink-0">Range: 60°C – 85°C</span>
                </div>
                <p className="mt-2 text-[11px] text-[#94A3B8] leading-normal">
                  If GPU temperature exceeds {thermalLimit}°C, the agent instantly throttles or halts guest jobs to protect hardware longevity.
                </p>
              </div>

              {/* Control 2: Operating Schedule */}
              <div className="rounded-lg border border-[#1E293B] bg-[#121A2A] p-4">
                <span className="font-medium text-xs text-[#F8FAFC] block mb-2">
                  Operating Window Schedule
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleMode("any-idle")}
                    className={`btn-action text-xs p-2.5 rounded border text-left transition-colors ${
                      scheduleMode === "any-idle"
                        ? "border-[#10B981] bg-[#10B981]/10 text-[#F8FAFC] font-semibold"
                        : "border-[#1E293B] bg-[#090D14] text-[#94A3B8]"
                    }`}
                  >
                    <span>Anytime Idle</span>
                    <span className="block text-[10px] text-[#64748B] font-mono mt-0.5">Yield on input</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleMode("overnight")}
                    className={`btn-action text-xs p-2.5 rounded border text-left transition-colors ${
                      scheduleMode === "overnight"
                        ? "border-[#10B981] bg-[#10B981]/10 text-[#F8FAFC] font-semibold"
                        : "border-[#1E293B] bg-[#090D14] text-[#94A3B8]"
                    }`}
                  >
                    <span>Overnight Only</span>
                    <span className="block text-[10px] text-[#64748B] font-mono mt-0.5">11:00 PM – 7:00 AM</span>
                  </button>
                </div>
              </div>

              {/* Control 3: Idle Detection Toggle */}
              <div className="rounded-lg border border-[#1E293B] bg-[#121A2A] p-4 flex items-start justify-between gap-4">
                <div>
                  <span className="font-medium text-xs text-[#F8FAFC] block">
                    Automatic User Activity Yield
                  </span>
                  <p className="mt-1 text-[11px] text-[#94A3B8] leading-normal">
                    Guest compute suspends within &lt;500ms when mouse movement, keyboard input, or local 3D application is detected.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={idleOnly}
                  onClick={() => setIdleOnly(!idleOnly)}
                  className={`btn-action shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    idleOnly ? "bg-[#10B981]" : "bg-[#334155]"
                  }`}
                  aria-label="Toggle automatic idle detection"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      idleOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Control 4: Instant Revocation Guarantee */}
              <div className="rounded-lg border border-[#1E293B] bg-[#121A2A] p-4 flex items-start justify-between gap-4">
                <div>
                  <span className="font-medium text-xs text-[#F8FAFC] block">
                    Instant Workload Eviction
                  </span>
                  <p className="mt-1 text-[11px] text-[#94A3B8] leading-normal">
                    Reclaim 100% of your VRAM and compute with one click at any time without financial penalties.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={instantReclaim}
                  onClick={() => setInstantReclaim(!instantReclaim)}
                  className={`btn-action shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    instantReclaim ? "bg-[#10B981]" : "bg-[#334155]"
                  }`}
                  aria-label="Toggle instant workload eviction"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      instantReclaim ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

            </div>

            <div className="border-t border-[#1E293B] bg-[#090D14] px-4 py-3 text-xs text-[#64748B] flex flex-wrap items-center justify-between gap-2">
              <span>Host sovereignty is hardcoded into the local daemon.</span>
              <span className="font-mono text-[#10B981] shrink-0">LOCAL FIRMWARE ENFORCEMENT</span>
            </div>
          </div>

          {/* Right Column: Architectural Guarantees for Providers */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="rounded-xl border border-[#1E293B] bg-[#0E1420] p-6 hover:border-[#334155] transition-colors">
              <span className="text-[11px] font-mono text-[#10B981] font-semibold block mb-1">
                ISOLATION INVARIANT
              </span>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Zero Filesystem & Local Network Access
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Guest containers execute in dedicated sandboxes. Renters cannot inspect your personal documents, browser credentials, or local area network devices. When a job completes, scratch storage is scrubbed immediately.
              </p>
            </div>

            <div className="rounded-xl border border-[#1E293B] bg-[#0E1420] p-6 hover:border-[#334155] transition-colors">
              <span className="text-[11px] font-mono text-[#10B981] font-semibold block mb-1">
                SOVEREIGN FREEDOM
              </span>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                No Uptime Obligations or Slash Penalties
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Participate only when convenient. You are never penalized for turning off your computer, rebooting, or launching a heavy local gaming session. The protocol automatically migrates interrupted tasks to other eligible nodes.
              </p>
            </div>

            <div className="rounded-xl border border-[#1E293B] bg-[#0E1420] p-6 hover:border-[#334155] transition-colors">
              <span className="text-[11px] font-mono text-[#10B981] font-semibold block mb-1">
                DIRECT COMPENSATION
              </span>
              <h3 className="text-base font-semibold text-[#F8FAFC]">
                Cryptographically Signed Accounting
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
                Every verified workload generates an itemized runtime receipt: executed compute-seconds, thermal telemetry records, and credit settlements calculated deterministically without opaque platform cuts.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}