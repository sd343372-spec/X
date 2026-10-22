export function FinalCTA() {
  return (
    <section id="get-started" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#0B0F17]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Architectural Wordmark Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#334155] bg-[#0E1420] px-3.5 py-1 text-xs text-[#94A3B8] mb-6">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
          <span>Open Architecture · Specification Phase</span>
        </div>

        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] text-[#F8FAFC]"
          style={{ textWrap: "balance" }}
        >
          Participate in the ComputeX Architecture
        </h2>
        
        <p
          className="mx-auto mt-5 max-w-[60ch] text-base sm:text-lg text-[#94A3B8] leading-relaxed"
          style={{ textWrap: "pretty" }}
        >
          Whether you require cost-transparent, hardware-matched GPU power for ML workloads or have compatible workstation hardware to share, discover how the ComputeX protocol unbundles cloud compute.
        </p>

        {/* Dual Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <a
            href="#for-renters"
            className="btn-action inline-flex w-full sm:w-auto items-center justify-center rounded bg-[#38BDF8] px-6 py-3.5 text-sm font-semibold text-[#090D14] hover:bg-[#0284C7] hover:text-white"
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
            className="btn-action inline-flex w-full sm:w-auto items-center justify-center rounded border border-[#334155] bg-[#0E1420] px-6 py-3.5 text-sm font-medium text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8]"
          >
            I Have a GPU to Share
          </a>
        </div>

        <div className="mt-8 text-xs text-[#64748B]">
          <span>Open engineering specification · No commercial sign-up required · Transparent protocol design</span>
        </div>

      </div>
    </section>
  );
}