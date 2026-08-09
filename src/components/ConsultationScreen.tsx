"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Language, SessionState, ComplianceRule } from "@/types";
import { SUPPORTED_LANGUAGES } from "@/types";
import { patientLabels as L } from "@/lib/i18n";
import {
  subscribeAudioState,
  pauseCurrentAudio,
  resumeCurrentAudio,
  stopAllAudio,
  type AudioState,
} from "@/lib/audio";
import ComplianceSourceModal from "./ComplianceSourceModal";
import ConsultationStep from "./ConsultationStep";
import SignaturePad, { type SignaturePadHandle } from "./SignaturePad";

interface Props {
  rule: ComplianceRule;
  session: SessionState;
  onAcknowledge: (stepId: string) => void;
  onExplain: (stepId: string) => void;
  onChoice: (stepId: string, choice: string) => void;
  onComplete: (signatureDataUrl: string) => void;
  onRestart: () => void;
  onLanguageChange?: (lang: Language) => void;
}

const SCROLL_SHRINK_START = 8;
const SCROLL_SHRINK_END = 160;

export default function ConsultationScreen({
  rule,
  session,
  onAcknowledge,
  onExplain,
  onChoice,
  onComplete,
  onRestart,
  onLanguageChange,
}: Props) {
  const lang = session.language ?? "de";
  const t = L[lang];

  const [showSource, setShowSource] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [hasDrawn, setHasDrawn] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [everPlayed, setEverPlayed] = useState(false);
  const [highlightStep, setHighlightStep] = useState<string | null>(null);
  const sigPadRef = useRef<SignaturePadHandle>(null);
  const highlightTimer = useRef<number | null>(null);

  // Continuous shrink factor: 0 = full-size header, 1 = compact header.
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shrink = Math.min(
    Math.max(
      (scrollY - SCROLL_SHRINK_START) / (SCROLL_SHRINK_END - SCROLL_SHRINK_START),
      0
    ),
    1
  );
  // The textual content swaps (full vs compact) mid-way through the gesture;
  // sizing keeps interpolating around it for a smooth, flowing shrink.
  const scrolled = shrink > 0.5;
  const padY = Math.round(24 - 16 * shrink); // 24 -> 8
  const padX = Math.round(28 - 8 * shrink); // 28 -> 20
  const ctrlSize = Math.round(48 - 16 * shrink); // 48 -> 32
  const ctrlFont = 26.4 - 10.4 * shrink; // 26.4 -> 16
  const titleFont = 24 - 6 * shrink; // 24 -> 18

  const steps = rule.steps;

  // Keep the header control in sync with whatever clip is playing.
  // The control stays hidden until the patient has played their first clip.
  useEffect(
    () =>
      subscribeAudioState((s) => {
        setAudioState(s.state);
        if (s.state === "playing") setEverPlayed(true);
      }),
    []
  );

  const isStepAcknowledged = (stepId: string) =>
    session.acknowledgedSteps.includes(stepId);

  const stepDone = (s: (typeof steps)[number]) =>
    s.type === "choice"
      ? session.selectedChoices[s.id] !== undefined
      : isStepAcknowledged(s.id);

  const allAcknowledged = steps.every(stepDone);
  const completedCount = steps.filter(stepDone).length;
  const progress = (completedCount / steps.length) * 100;

  const toggleExpand = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  const handleDrawnChange = useCallback((hasContent: boolean) => {
    setHasDrawn(hasContent);
  }, []);

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  // Staff shortcut: acknowledge every remaining item at once
  // (and adopt the cost-free standard provision for the choice step).
  const handleAcceptAll = () => {
    steps.forEach((s) => {
      if (stepDone(s)) return;
      if (s.type === "choice") {
        onChoice(s.id, s.choices?.[0] ?? "");
      } else {
        onAcknowledge(s.id);
      }
    });
  };

  // Tapping the (dimmed) signature area before everything is confirmed
  // moves the user to the first step that still needs attention.
  const handleSignatureTap = () => {
    if (allAcknowledged) return;
    const idx = steps.findIndex((s) => !stepDone(s));
    if (idx === -1) return;
    const target = steps[idx].id;
    document
      .getElementById(`step-${target}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightStep(target);
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(
      () => setHighlightStep(null),
      1800
    );
  };

  useEffect(
    () => () => {
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    },
    []
  );

  const handleComplete = () => {
    if (allAcknowledged && hasDrawn && sigPadRef.current) {
      onComplete(sigPadRef.current.toDataURL("image/png"));
    }
  };

  const handleAudioControl = () => {
    if (audioState === "playing") pauseCurrentAudio();
    else if (audioState === "paused") resumeCurrentAudio();
    else stopAllAudio();
  };

  const audioLabel =
    audioState === "playing" ? t.pause : audioState === "paused" ? t.resume : t.stop;

  const activeStep = steps.find((s) => s.id === showSource);

  return (
    <div
      className="min-h-screen bg-paper text-ink"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Header — large at top, shrinks on scroll */}
      <header className="sticky top-0 z-20 bg-paper/95 backdrop-blur border-b border-line">
        <div className="h-[3px] bg-line/40">
          <div
            className="h-full bg-accent transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          dir="ltr"
          className="max-w-2xl mx-auto flex items-center justify-between gap-4"
          style={{
            paddingTop: padY,
            paddingBottom: padY,
            paddingLeft: padX,
            paddingRight: padX,
          }}
        >
          {/* Restart + title block */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onRestart}
              title={t.neueBeratung}
              aria-label={t.neueBeratung}
              className="w-7 h-7 shrink-0 rounded-full border border-line text-ink-faint hover:text-ink hover:border-ink-soft transition-colors flex items-center justify-center"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden
              >
                <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" strokeLinecap="round" />
                <path d="M13.5 1.5v3h-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Title block */}
            <div className="min-w-0">
              <div key={scrolled ? "compact" : "full"} className="animate-fade-in">
                {scrolled ? (
                  <>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-ink-faint truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {completedCount} / {steps.length} {t.bestaetigt}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="font-serif leading-tight truncate"
                      style={{ fontSize: titleFont }}
                    >
                      {t.title}
                    </p>
                    <p className="text-sm text-ink-faint mt-1 truncate">
                      {rule.title} · {session.patientName}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Controls: audio pause/play/stop + language flags */}
          <div className="flex items-center gap-2.5 shrink-0">
            {everPlayed && (
              <button
                onClick={handleAudioControl}
                title={audioLabel}
                aria-label={audioLabel}
                style={{ width: ctrlSize, height: ctrlSize }}
                className={`rounded-full flex items-center justify-center ${
                  audioState === "playing"
                    ? "bg-accent text-paper"
                    : "border border-line text-ink-soft hover:text-ink hover:border-ink-soft"
                }`}
              >
                {audioState === "playing" ? (
                  <svg width="12" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <rect x="2" y="2" width="4.5" height="12" rx="1.2" />
                    <rect x="9.5" y="2" width="4.5" height="12" rx="1.2" />
                  </svg>
                ) : audioState === "paused" ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                    <path d="M4 2l10 6-10 6z" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                    <rect x="1" y="1" width="8" height="8" rx="1" />
                  </svg>
                )}
              </button>
            )}

            {SUPPORTED_LANGUAGES.map((lc) => (
              <button
                key={lc.code}
                onClick={() => onLanguageChange?.(lc.code)}
                style={{ width: ctrlSize, height: ctrlSize, fontSize: ctrlFont }}
                className={`rounded-full flex items-center justify-center transition-transform ${
                  lc.code === lang
                    ? "bg-accent-soft ring-1 ring-accent scale-105"
                    : "opacity-40 hover:opacity-100"
                }`}
                title={lc.label}
              >
                {lc.flag}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Continuous document flow */}
      <main className="max-w-2xl mx-auto px-6 pb-24">
        {/* Document intro */}
        <div className="pt-12 pb-10 border-b border-line">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
            {session.krankenkasse}
          </p>
          <h1 className="font-serif text-[1.75rem] leading-snug mt-3">
            {rule.title}
          </h1>
          <p className="text-ink-soft mt-2">{session.patientName}</p>
          <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-sheet px-4 py-2 text-[13px] text-ink-soft">
            <span aria-hidden>🔊</span>
            {t.tapHint}
          </p>
        </div>

        {/* Steps */}
        {steps.map((step, i) => (
          <ConsultationStep
            key={step.id}
            step={step}
            index={i}
            total={steps.length}
            lang={lang}
            done={stepDone(step)}
            acknowledged={isStepAcknowledged(step.id)}
            expanded={expandedSteps.has(step.id)}
            selectedChoice={session.selectedChoices[step.id]}
            highlight={highlightStep === step.id}
            t={t}
            onAcknowledge={() => onAcknowledge(step.id)}
            onToggleExplain={() => {
              if (!session.explainedSteps.includes(step.id)) {
                onExplain(step.id);
              }
              toggleExpand(step.id);
            }}
            onChoice={(choice) => onChoice(step.id, choice)}
            onShowSource={() =>
              setShowSource(showSource === step.id ? null : step.id)
            }
          />
        ))}

        {/* Signature at the bottom of the flow */}
        <div className="pt-14">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint">
              {completedCount} / {steps.length} {t.bestaetigt}
            </p>
            {allAcknowledged ? (
              <p className="font-serif text-[1.6rem] leading-snug mt-4 text-accent">
                ✓ {t.allConfirmed}
              </p>
            ) : (
              <p className="font-serif text-[1.3rem] leading-snug mt-4 text-ink-soft">
                {t.confirmFirst}
              </p>
            )}
          </div>

          {/* Accept-all shortcut — only while something is still pending */}
          {!allAcknowledged && (
            <div className="mt-8 text-center">
              <button
                onClick={handleAcceptAll}
                className="rounded-full border border-ink/25 px-7 py-2.5 text-sm font-medium text-ink-soft hover:text-ink hover:border-ink transition-colors active:scale-[0.98]"
              >
                ✓ {t.acceptAll}
              </button>
            </div>
          )}

          {/* Signing sheet */}
          <div
            onClick={handleSignatureTap}
            className={`mt-10 bg-sheet border border-line px-7 py-8 shadow-[0_1px_2px_rgb(27_34_45/0.05),0_12px_32px_-16px_rgb(27_34_45/0.15)] transition-opacity duration-500 ${
              allAcknowledged ? "" : "opacity-50"
            }`}
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-ink-faint text-center">
              {t.signHere}
            </p>

            <SignaturePad
              ref={sigPadRef}
              disabled={!allAcknowledged}
              onChange={handleDrawnChange}
              className="mt-4"
            />

            <div className="flex justify-between text-[10px] uppercase tracking-[0.16em] text-ink-faint">
              <span>{t.unterschrift}</span>
              <span>{session.patientName}</span>
            </div>
          </div>

          {/* Complete */}
          <div className="mt-8 flex items-center justify-between pb-8">
            <button
              onClick={handleClear}
              disabled={!hasDrawn}
              className="px-4 py-3 text-sm text-ink-faint hover:text-ink underline decoration-dotted underline-offset-4 transition-colors disabled:opacity-40 disabled:hover:text-ink-faint"
            >
              {t.loeschen}
            </button>
            <button
              onClick={handleComplete}
              disabled={!allAcknowledged || !hasDrawn}
              className="bg-accent text-paper rounded-full px-9 py-3.5 font-medium hover:bg-accent-deep disabled:bg-ink-faint/25 transition-all active:scale-[0.98]"
            >
              {t.abschliessen}
            </button>
          </div>
        </div>
      </main>

      {/* Compliance source modal */}
      {activeStep && (
        <ComplianceSourceModal
          step={activeStep}
          lang={lang}
          onClose={() => setShowSource(null)}
        />
      )}
    </div>
  );
}