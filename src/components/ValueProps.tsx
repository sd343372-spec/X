export function ValueProps() {
  return (
    <section id="architecture" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#090D14]">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            Architectural Foundations
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            The structural contrast between monopolistic hyperscaler infrastructure and sovereign distributed coordination.
          </p>
        </div>

        {/* Structural Comparison: Centralized Hyperscalers vs ComputeX */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D131F] overflow-hidden mb-12 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#1E293B]">
            
            {/* Left: Traditional Hyperscalers */}
            <div className="p-6 sm:p-8 bg-[#090D14]/70">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#EF4444] font-medium">
                  Centralized Hyperscaler Model
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">
                  AWS · GCP · AZURE
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                Monopolistic Margins & Reserved Lock-In
              </h3>
              <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
                Traditional cloud giants charge 300%–500% hardware markups, force multi-year reserved commitments, and bill every second an instance sits idle.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-[#94A3B8]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span><strong>Idle Metering:</strong> You pay full price while waiting for jobs to compile or queues to process.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span><strong>Egress Taxes:</strong> High bandwidth fees punish researchers for retrieving checkpoints and model weights.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#EF4444] font-bold">✕</span>
                  <span><strong>Artificial Scarcity:</strong> Enterprise allocation queues throttle access to modern GPU architectures.</span>
                </li>
              </ul>
            </div>

            {/* Right: ComputeX Coordinated Architecture */}
            <div className="p-6 sm:p-8 bg-[#0D131F]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#10B981] font-medium">
                  ComputeX Protocol Model
                </span>
                <span className="text-[11px] font-mono text-[#38BDF8]">
                  SOVEREIGN COORDINATION
                </span>
              </div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">
                Direct Peer Matching & Deterministic Escrow
              </h3>
              <p className="mt-2 text-sm text-[#94A3B8] leading-relaxed">
                Compute value flows directly between renters and verified hardware hosts. ComputeX operates as an unbundled routing kernel with zero idle retention fees.
              </p>

              <ul className="mt-6 space-y-3 text-xs text-[#94A3B8]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Executed-Seconds Escrow:</strong> You pay strictly for active container execution. Unused time refunds instantly.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Direct Storage Sync:</strong> Artifacts stream directly to your S3/GCS bucket; ComputeX levies zero egress fees.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#10B981] font-bold">✓</span>
                  <span><strong>Sovereign Edge Supply:</strong> Millions of high-end consumer and workstation GPUs mobilized on demand.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* 4 Architectural Invariants (Horizontal Modular Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-lg border border-[#1E293B] bg-[#0E1420] p-5 hover:border-[#334155] transition-colors">
            <span className="text-[11px] font-mono text-[#38BDF8] block mb-2 font-semibold">
              01 // DISCOVERY
            </span>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">
              Granular Hardware Filtering
            </h4>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
              Renters target exact microarchitectures (Ada, Ampere), minimum memory ceilings (16GB, 24GB, 48GB), and driver versions.
            </p>
          </div>

          <div className="rounded-lg border border-[#1E293B] bg-[#0E1420] p-5 hover:border-[#334155] transition-colors">
            <span className="text-[11px] font-mono text-[#38BDF8] block mb-2 font-semibold">
              02 // ESCROW
            </span>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">
              Deterministic Cost Quotes
            </h4>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
              Job costs are estimated and pre-funded in escrow. If a node disconnects early, all unconsumed compute-seconds return automatically.
            </p>
          </div>

          <div className="rounded-lg border border-[#1E293B] bg-[#0E1420] p-5 hover:border-[#334155] transition-colors">
            <span className="text-[11px] font-mono text-[#10B981] block mb-2 font-semibold">
              03 // ISOLATION
            </span>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">
              Sandboxed Virtualization
            </h4>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
              Containers launch in unprivileged guest sandboxes without host filesystem or LAN access. Scratch space is wiped upon exit.
            </p>
          </div>

          <div className="rounded-lg border border-[#1E293B] bg-[#0E1420] p-5 hover:border-[#334155] transition-colors">
            <span className="text-[11px] font-mono text-[#F59E0B] block mb-2 font-semibold">
              04 // SOVEREIGNTY
            </span>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">
              Host Thermal Guardrails
            </h4>
            <p className="mt-2 text-xs text-[#94A3B8] leading-relaxed">
              Hardware owners set firmware-level thermal cutoffs (e.g. 72°C) and idle-detection schedules that yield instantly to personal use.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}