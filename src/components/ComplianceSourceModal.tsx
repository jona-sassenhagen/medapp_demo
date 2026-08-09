"use client";

import type { ConsultationStep, Language } from "@/types";
import { employeeLabels as L } from "@/lib/i18n";

interface Props {
  step: ConsultationStep;
  lang: Language;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p className="text-sm text-ink mt-1 leading-relaxed">{value}</p>
    </div>
  );
}

export default function ComplianceSourceModal({ step, onClose }: Props) {
  const { source } = step;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/45 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-sheet border border-line w-full max-w-md shadow-[0_24px_64px_-16px_rgb(27_34_45/0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-5">
          <p className="font-mono text-xs text-brass">{source.rule}</p>
          <h3 className="font-serif text-[1.45rem] leading-tight mt-1.5">
            {L.warumWirdGezeigt}
          </h3>
        </div>

        {/* Official double rule */}
        <div className="mx-8 border-t-2 border-ink/80">
          <div className="mt-[2px] border-t border-line" />
        </div>

        <div className="px-8 py-6 space-y-4">
          <Field label="Vertrag" value={source.contract} />
          <Field label="Produktgruppe" value={source.productGroup} />
          <Field label="Anforderung" value={source.requirement} />
          <Field label="Quelle" value={source.source} />
          <div className="flex items-end justify-between gap-4">
            <Field label="Gültig seit" value={source.validSince} />
            <span className="shrink-0 inline-flex items-center gap-1.5 text-accent text-[11px] uppercase tracking-[0.12em] font-semibold pb-0.5">
              ✓ Fachlich geprüft
            </span>
          </div>
        </div>

        <div className="px-8 py-4 border-t border-line flex items-center justify-between gap-4">
          <p className="text-xs text-ink-faint italic">{L.demoHinweis}</p>
          <button
            onClick={onClose}
            className="shrink-0 text-sm font-medium text-ink hover:text-accent transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}