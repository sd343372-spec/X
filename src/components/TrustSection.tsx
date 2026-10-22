const PROTOCOL_BOUNDARIES = [
  {
    principle: "Sandboxed Container Boundaries",
    status: "Design Target",
    badgeColor: "text-[#38BDF8] border-[#38BDF8]/30 bg-[#38BDF8]/10",
    detail:
      "All guest jobs are architected to execute inside unprivileged, isolated microVM or container virtualization layers. Workloads cannot access host hostnames, storage volumes, or local subnet devices.",
  },
  {
    principle: "Affirmative Node Consent",
    status: "Core Invariant",
    badgeColor: "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10",
    detail:
      "Compute capacity is never utilized without explicit permission configured in the provider's desktop agent. Automatic idle schedules yield instantly to user activity.",
  },
  {
    principle: "Execution Telemetry & Signed Receipts",
    status: "Under Engineering",
    badgeColor: "text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10",
    detail:
      "The coordination layer records clock durations, allocated VRAM ceilings, and exit codes into a signed runtime receipt delivered to both renter and provider upon completion.",
  },
  {
    principle: "Local Thermal & Power Caps",
    status: "Host-Enforced",
    badgeColor: "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10",
    detail:
      "Temperature ceilings (e.g. 70°C – 80°C) and power limits are enforced by the local node daemon directly against GPU driver registers, independent of guest instructions.",
  },
] as const;

export function TrustSection() {
  return (
    <section className="py-20 md:py-28 border-b border-[#1E293B] bg-[#0B0F17]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            Security & Protocol Transparency
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            The operational tenets and design targets governing how ComputeX isolates tenant workloads from provider systems.
          </p>
        </div>

        {/* Structured Architectural Ledger */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D131F] overflow-hidden divide-y divide-[#1E293B] shadow-xl">
          {PROTOCOL_BOUNDARIES.map((item) => (
            <div
              key={item.principle}
              className="p-6 sm:p-7 hover:bg-[#121A2A] transition-colors duration-150 flex flex-col md:flex-row md:items-baseline justify-between gap-4"
            >
              <div className="md:w-1/3">
                <span className="font-semibold text-base text-[#F8FAFC] block">
                  {item.principle}
                </span>
                <span className={`inline-block mt-2 text-[11px] font-mono px-2 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.status}
                </span>
              </div>
              <div className="md:w-2/3">
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Development Disclosure */}
        <div className="mt-8 rounded-xl border border-[#1E293B] bg-[#090D14] p-5 text-xs text-[#94A3B8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8] shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-[#F8FAFC]">Product Status:</strong> ComputeX is currently in the architectural specification and prototype phase. These specifications describe design objectives and protocol targets, not active production infrastructure.
            </p>
          </div>
          <span className="font-mono text-[#38BDF8] shrink-0 text-[11px] border-l border-[#1E293B] pl-3">
            PROTOCOL REVISION 0.1
          </span>
        </div>

      </div>
    </section>
  );
}