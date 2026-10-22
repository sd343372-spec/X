"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    id: "what-is-computex",
    question: "What is ComputeX and what core problem does it address?",
    answer:
      "ComputeX is an architectural protocol and coordination network designed to connect developers who need GPU compute with hardware owners who possess idle GPU capacity. Traditional cloud providers impose steep margins and long-term commitments, while millions of powerful workstation GPUs sit unused for over half the day. ComputeX coordinates this distributed capacity for real AI training, inference, and rendering workloads.",
  },
  {
    id: "who-can-provide-gpu",
    question: "Who can participate as a GPU provider?",
    answer:
      "Anyone with a modern NVIDIA GPU (RTX 30-series, 40-series, or workstation Ada/Ampere cards) with at least 10GB of VRAM and a stable internet connection. Providers run a lightweight desktop agent that benchmarks PCIe throughput and compute capability, allowing them to opt in whenever their system is idle.",
  },
  {
    id: "how-is-security-handled",
    question: "How does ComputeX protect the provider's host machine?",
    answer:
      "Workloads execute inside sandboxed container or microVM virtualization. Guest containers have no permission to browse local file directories, personal documents, browser credentials, or local area network devices. In addition, providers configure hardware guardrails (thermal cutoffs and power limits) directly in their local agent.",
  },
  {
    id: "what-if-host-shuts-down",
    question: "What happens if a provider shuts down their PC or reclaims their GPU?",
    answer:
      "Providers retain absolute sovereignty: if you move your mouse, game, or click 'Reclaim GPU', the job yields immediately. The ComputeX protocol supports periodic checkpoint syncing for stateful jobs. If a node drops offline, the workload coordinator detects the termination, saves the latest checkpoint, and reallocates the remaining steps to another matching online node.",
  },
  {
    id: "is-marketplace-live",
    question: "Is the platform live or accepting commercial workloads today?",
    answer:
      "No. ComputeX is currently in the conceptual prototype and architectural specification phase. We are actively developing the local node agent and coordination engine. We do not claim live marketplace inventory, real customer workloads, or guaranteed financial returns.",
  },
  {
    id: "how-is-pricing-calculated",
    question: "How is workload pricing determined?",
    answer:
      "Pricing is calculated deterministically per compute-second based on requested hardware specifications (VRAM ceiling, GPU model, memory bandwidth). Renters receive an upfront quote before dispatching, and unused funds in the escrow deposit are automatically refunded upon job completion.",
  },
] as const;

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 py-20 md:py-28 border-b border-[#1E293B] bg-[#090D14]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-14 text-center">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#F8FAFC]"
            style={{ textWrap: "balance" }}
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#94A3B8]" style={{ textWrap: "pretty" }}>
            Key questions regarding protocol architecture, provider sovereignty, and the engineering roadmap.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem
              key={item.id}
              id={item.id}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

function AccordionItem({
  id,
  question,
  answer,
}: {
  id: string;
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0D131F] overflow-hidden transition-colors duration-150">
      <button
        type="button"
        id={`faq-btn-${id}`}
        aria-controls={`faq-ans-${id}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left transition-colors duration-150 hover:bg-[#121A2A] focus-visible:outline-2 focus-visible:outline-[#38BDF8]"
      >
        <span className="text-sm sm:text-base font-medium text-[#F8FAFC] pr-4">
          {question}
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-[#64748B] transition-transform duration-200 ${
            open ? "rotate-180 text-[#38BDF8]" : ""
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          id={`faq-ans-${id}`}
          role="region"
          aria-labelledby={`faq-btn-${id}`}
          className="px-5 sm:px-6 pb-5 pt-1 border-t border-[#1E293B] bg-[#090D14]"
        >
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}