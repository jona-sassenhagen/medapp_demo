"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Language, SessionState, ComplianceRule } from "@/types";
import { SUPPORTED_LANGUAGES } from "@/types";
import { landingLabels as L, getDirection } from "@/lib/i18n";
import { saveSession } from "@/lib/session";

const WORKFLOW_STEPS = 5;

interface Props {
  session: SessionState;
  rule: ComplianceRule;
  onLanguageChange: (lang: Language) => void;
}

export default function LandingPage({ session, rule, onLanguageChange }: Props) {
  const lang = session.language ?? "de";
  const t = L[lang];
  const router = useRouter();

  const handleLanguage = (next: Language) => {
    // Remember the choice for the rest of the app without entering the flow.
    saveSession({ ...session, language: next });
    onLanguageChange(next);
    // Re-render with the new direction (rtl for Arabic).
    router.refresh();
  };

  return (
    <div
      dir={getDirection(lang)}
      lang={lang}
      className="min-h-screen bg-paper flex items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-xl">
        {/* Seal */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-brass flex items-center justify-center">
            <span className="font-serif text-[1.7rem] text-brass leading-none pb-0.5">
              §
            </span>
          </div>
        </div>

        <div className="text-center mt-6">
          <h1 className="font-serif text-[2rem] leading-tight">{t.title}</h1>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink-faint mt-3">
            {t.subtitle}
          </p>
        </div>

        {/* Language selector */}
        <div className="mt-8 flex justify-center">
          <div className="relative">
            <select
              value={lang}
              onChange={(e) => handleLanguage(e.target.value as Language)}
              aria-label="Sprache / Language"
              className="appearance-none bg-transparent border border-line rounded-full py-2 ps-4 pe-9 text-sm text-ink-soft hover:border-ink-soft focus:border-accent focus:outline-none transition-colors"
            >
              {SUPPORTED_LANGUAGES.map((lc) => (
                <option key={lc.code} value={lc.code}>
                  {lc.flag}  {lc.label}
                </option>
              ))}
            </select>
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none text-xs">
              ▾
            </span>
          </div>
        </div>

        {/* Existing workflows */}
        <section className="mt-12">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-4">
            {t.sectionWorkflows}
          </h2>
          <Link
            href="/workflow/run/"
            dir="ltr"
            className="group block bg-sheet border border-line rounded-lg p-6 hover:border-accent hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl text-ink group-hover:text-accent transition-colors">
                  {rule.title}
                </h3>
                <p className="text-sm text-ink-soft mt-1">
                  {rule.krankenkasse}
                </p>
              </div>
              <span className="mt-1 text-ink-faint group-hover:text-accent group-hover:translate-x-0.5 transition-all rtl:rotate-180" aria-hidden>
                →
              </span>
            </div>
            <div className="mt-5 pt-4 border-t border-line flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
              <span>
                {WORKFLOW_STEPS} {t.steps}
              </span>
              <span className="w-1 h-1 rounded-full bg-ink-faint/50" aria-hidden />
              <span>
                {t.version} {rule.version}
              </span>
            </div>
          </Link>
        </section>

        {/* New workflow (mocked) */}
        <section className="mt-10">
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-4">
            {t.sectionNew}
          </h2>
          <button
            type="button"
            aria-disabled="true"
            className="w-full text-start bg-paper-warm/60 border border-dashed border-line-strong rounded-lg p-6 opacity-70 cursor-not-allowed"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl text-ink-soft">
                  {t.createWorkflow}
                </h3>
                <p className="text-sm text-ink-soft mt-2">{t.photoHint}</p>
                <p className="text-sm text-ink-soft/70 mt-2">{t.comingSoon}</p>
              </div>
              <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-brass border border-brass/40 rounded-full px-2.5 py-1 mt-1">
                {t.comingSoonBadge}
              </span>
            </div>
          </button>
        </section>

        <div className="mt-12 border-b border-line" />
      </div>
    </div>
  );
}
