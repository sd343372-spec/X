const FOOTER_GROUPS = [
  {
    title: "Architecture",
    links: [
      { label: "Foundations", href: "#architecture" },
      { label: "Coordination Protocol", href: "#protocol" },
      { label: "Workload Profiles", href: "#workloads" },
      { label: "Security Ledger", href: "#architecture" },
    ],
  },
  {
    title: "Participants",
    links: [
      { label: "For Renters", href: "#for-renters" },
      { label: "For GPU Providers", href: "#for-providers" },
      { label: "Desktop Node Agent", status: "In Development" },
      { label: "Hardware Guardrails", href: "#for-providers" },
    ],
  },
  {
    title: "Specifications",
    links: [
      { label: "Job Manifest YAML", status: "Draft" },
      { label: "Node Daemon Protocol", status: "In Progress" },
      { label: "Escrow Engine", status: "Draft" },
      { label: "FAQ", href: "#faq" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#070A10] border-t border-[#1E293B] pt-16 pb-12">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#1E293B]">
          
          {/* Brand & Manifesto Column (5 cols) */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-[#334155] bg-[#0E1420]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#38BDF8]"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="8" y="8" width="8" height="8" rx="1" />
                  <line x1="1" y1="9" x2="4" y2="9" />
                  <line x1="1" y1="15" x2="4" y2="15" />
                  <line x1="20" y1="9" x2="23" y2="9" />
                  <line x1="20" y1="15" x2="23" y2="15" />
                  <line x1="9" y1="1" x2="9" y2="4" />
                  <line x1="15" y1="1" x2="15" y2="4" />
                  <line x1="9" y1="20" x2="9" y2="23" />
                  <line x1="15" y1="20" x2="15" y2="23" />
                </svg>
              </div>
              <span className="text-base font-semibold tracking-tight text-[#F8FAFC]">
                Compute<span className="text-[#38BDF8]">X</span>
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm text-[#94A3B8] leading-relaxed">
              Decentralized GPU compute infrastructure engineered to connect machine learning developers with sovereign workstation hosts.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded border border-[#1E293B] bg-[#0E1420] px-3 py-1.5 text-xs text-[#64748B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" aria-hidden="true" />
              <span>Early Prototype · Architecture v0.1</span>
            </div>
          </div>

          {/* Links Columns (7 cols) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#F8FAFC] mb-4">
                  {group.title}
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      {"href" in link ? (
                        <a
                          href={link.href}
                          className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <span className="text-[#64748B] flex items-center gap-1.5 cursor-default">
                          {link.label}
                          <span className="font-mono text-[9px] uppercase text-[#64748B]/70">
                            ({link.status})
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Big Wordmark Return (Architectural Sign-off) */}
        <div className="pt-10 pb-6 overflow-hidden select-none" aria-hidden="true">
          <div className="text-[12vw] font-bold tracking-tighter text-[#121A2A]/40 leading-none whitespace-nowrap text-center">
            COMPUTEX
          </div>
        </div>

        {/* Bottom Legal & Attribution Bar */}
        <div className="pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>
            © {new Date().getFullYear()} ComputeX Protocol. Architectural specification under active engineering. Not a live marketplace.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#64748B]">Sovereign Node Protocol</span>
            <span>·</span>
            <span className="text-[#64748B]">Apache 2.0 Spec License</span>
          </div>
        </div>

      </div>
    </footer>
  );
}