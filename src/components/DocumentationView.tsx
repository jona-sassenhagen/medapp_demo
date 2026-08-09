"use client";

import type { SessionState, ComplianceRule } from "@/types";
import { employeeLabels as L } from "@/lib/i18n";
import {
  downloadBeratungsdokumentation,
  LANGUAGE_NAMES,
  STEP_LABELS,
} from "@/lib/document";

interface Props {
  rule: ComplianceRule;
  session: SessionState;
  onNewConsultation: () => void;
}

function formatTime(isoString: string | null): string {
  if (!isoString) return "–";
  return new Date(isoString).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(isoString: string | null): string {
  if (!isoString) return new Date().toLocaleDateString("de-DE");
  return new Date(isoString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 py-2.5 border-b border-line text-sm">
      <dt className="text-ink-faint shrink-0">{label}</dt>
      <dd className="text-end font-medium text-ink">{value}</dd>
    </div>
  );
}

export default function DocumentationView({
  rule,
  session,
  onNewConsultation,
}: Props) {
  const lang = session.language || "de";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* The official sheet */}
        <div className="relative bg-sheet border border-line px-7 md:px-12 py-12 shadow-[0_1px_2px_rgb(27_34_45/0.05),0_12px_32px_-16px_rgb(27_34_45/0.15)]">
          {/* Stamp */}
          <div className="absolute top-9 end-9 rotate-[8deg] w-[5.5rem] h-[5.5rem] rounded-full border-2 border-accent/60 flex items-center justify-center pointer-events-none select-none">
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-[0.14em] text-accent/80 font-semibold leading-tight">
                Geprüft
              </p>
              <p className="text-[8px] uppercase tracking-[0.1em] text-accent/70 leading-tight mt-0.5">
                §127 SGB V
              </p>
            </div>
          </div>

          <p className="font-mono text-xs text-ink-faint">
            {rule.id} · Version {rule.version}
          </p>
          <h1 className="font-serif text-[1.9rem] leading-tight mt-2">
            {L.dokumentation}
          </h1>
          <p className="text-sm text-ink-soft mt-1">
            {formatDate(session.completedAt)}
          </p>

          {/* Official double rule */}
          <div className="mt-7 border-t-2 border-ink/80">
            <div className="mt-[3px] border-t border-line" />
          </div>

          <dl className="mt-6">
            <Row label="Versorgung" value={rule.title} />
            <Row label="Krankenkasse" value={session.krankenkasse} />
            <Row label="Patient" value={session.patientName} />
            <Row label="Patientensprache" value={LANGUAGE_NAMES[lang]} />
            <Row
              label="Dokumentationsgrundlage"
              value={`${rule.id}, v${rule.version}`}
            />
          </dl>

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              Patient informiert über
            </p>
            <ul className="mt-3 space-y-1.5">
              {rule.steps.map((s) => (
                <li key={s.id} className="text-sm text-ink flex gap-2.5">
                  <span className="text-accent">✓</span>
                  {STEP_LABELS[s.id] || s.id}
                </li>
              ))}
            </ul>
          </div>

          {session.explainedSteps.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Zusätzliche Erläuterungen aufgerufen
              </p>
              <ul className="mt-3 space-y-1.5">
                {rule.steps
                  .filter((s) => session.explainedSteps.includes(s.id))
                  .map((s) => (
                    <li key={s.id} className="text-sm text-ink flex gap-2.5">
                      <span className="text-accent">✓</span>
                      {STEP_LABELS[s.id] || s.id}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {rule.steps.some(
            (s) => s.type === "choice" && session.selectedChoices[s.id]
          ) && (
            <div className="mt-6">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Getroffene Auswahl
              </p>
              <ul className="mt-3 space-y-1.5">
                {rule.steps
                  .filter(
                    (s) => s.type === "choice" && session.selectedChoices[s.id]
                  )
                  .map((s) => (
                    <li key={s.id} className="text-sm text-ink">
                      <span className="text-ink-soft">
                        {STEP_LABELS[s.id] || s.id}:
                      </span>{" "}
                      <span className="font-medium">
                        {session.selectedChoices[s.id]}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <dl className="mt-8">
            <Row label="Beratung begonnen" value={formatTime(session.startedAt)} />
            <Row label="Abgeschlossen" value={formatTime(session.completedAt)} />
          </dl>

          {session.signatureDataUrl && (
            <div className="mt-10">
              <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
                Unterschrift Patient
              </p>
              <div className="mt-3 inline-block min-w-[240px] border-b-2 border-dotted border-ink/30 pb-2">
                <img
                  src={session.signatureDataUrl}
                  alt="Unterschrift"
                  className="h-16 object-contain"
                />
              </div>
              <p className="text-xs text-ink-faint mt-1.5">
                {session.patientName}
              </p>
            </div>
          )}
        </div>

        {/* Actions below the sheet */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <button
            onClick={onNewConsultation}
            className="px-5 py-3 text-sm text-ink-soft hover:text-ink underline decoration-dotted underline-offset-4 transition-colors"
          >
            Neue Beratung
          </button>
          <button
            onClick={() => downloadBeratungsdokumentation(rule, session)}
            className="bg-ink text-paper rounded-full px-8 py-3.5 font-medium hover:bg-accent-deep transition-all active:scale-[0.98]"
          >
            {L.pdfHerunterladen}
          </button>
        </div>
      </main>
    </div>
  );
}