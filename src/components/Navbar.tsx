"use client";

import { useState, useEffect, useCallback } from "react";

const NAV_LINKS = [
  { href: "#architecture", label: "Architecture" },
  { href: "#protocol", label: "Protocol" },
  { href: "#workloads", label: "Workloads" },
  { href: "#for-renters", label: "For Renters" },
  { href: "#for-providers", label: "For Providers" },
  { href: "#faq", label: "FAQ" },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open & listen for Escape
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setMobileOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "bg-[#090D14]/95 backdrop-blur-md border-b border-[#1E293B]"
          : "bg-[#090D14]/80 backdrop-blur-sm border-b border-[#1E293B]/70"
      }`}
    >
      <nav
        className="mx-auto flex max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5"
        aria-label="Primary navigation"
      >
        {/* Architectural Wordmark and Icon */}
        <div className="flex items-center">
          <a
            href="#"
            className="flex items-center gap-2.5 group focus-visible:rounded"
            aria-label="ComputeX home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded border border-[#334155] bg-[#0E1420] transition-colors duration-150 group-hover:border-[#38BDF8]">
              <svg
                width="18"
                height="18"
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
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#64748B] ml-1.5 border-l border-[#1E293B] pl-2">
              v0.1-spec
            </span>
          </a>
        </div>

        {/* Clean, well-spaced nav links */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#94A3B8] transition-colors duration-150 hover:text-[#F8FAFC] focus-visible:rounded"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA on the right */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="#architecture"
            className="btn-action inline-flex items-center justify-center rounded border border-[#334155] bg-[#0E1420] px-3.5 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#38BDF8] hover:text-[#38BDF8]"
          >
            Explore Blueprint
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="btn-action lg:hidden flex items-center justify-center w-9 h-9 rounded border border-[#1E293B] bg-[#0E1420] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#334155]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile drawer with standard touch targets */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden fixed inset-0 top-[57px] bg-[#090D14]/98 backdrop-blur-lg z-40 border-b border-[#1E293B] flex flex-col justify-between p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="flex items-center min-h-[48px] rounded px-3 text-base font-medium text-[#94A3B8] hover:bg-[#121A2A] hover:text-[#F8FAFC] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-6 border-t border-[#1E293B]">
            <a
              href="#architecture"
              onClick={closeMobile}
              className="btn-action flex items-center justify-center min-h-[48px] rounded bg-[#38BDF8] text-[#090D14] font-semibold text-sm"
            >
              Explore Architecture
            </a>
            <p className="mt-3 text-center text-xs text-[#64748B]">
              ComputeX architectural preview · Under active engineering
            </p>
          </div>
        </div>
      )}
    </header>
  );
}