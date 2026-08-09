"use client";

import { useEffect, useState } from "react";
import type { ConsultationStep as Step, Language } from "@/types";
import { subscribeAudioState, type AudioSnapshot } from "@/lib/audio";
import Speak from "./Speak";

interface Props {
  step: Step;
  index: number;
  total: number;
  lang: Language;
  done: boolean;
  acknowledged: boolean;
  expanded: boolean;
  highlight?: boolean;
  selectedChoice?: string;
  t: Record<string, string>;
  onAcknowledge: () => void;
  onToggleExplain: () => void;
  onChoice: (choice: string) => void;
  onShowSource: () => void;
}

export default function ConsultationStep({
  step,
  index,
  total,
  lang,
  done,
  acknowledged,
  expanded,
  highlight,
  selectedChoice,
  t,
  onAcknowledge,
  onToggleExplain,
  onChoice,
  onShowSource,
}: Props) {
  const content = step.translations[lang];

  // Pulse the indicator while this step's main text OR its explanation
  // is the clip currently being read out.
  const [snap, setSnap] = useState<AudioSnapshot>({ state: "idle", currentId: null });
  useEffect(() => subscribeAudioState(setSnap), []);
  const speaking =
    snap.state === "playing" &&
    (snap.currentId === step.id || snap.currentId === `${step.id}-explanation`);

  return (
    <section
      id={`step-${step.id}`}
      className={`py-12 border-b border-line scroll-mt-28 transition-colors duration-500 ${
        highlight
          ? "bg-accent-soft/20 outline outline-2 outline-accent/50 outline-offset-4 rounded-xl"
          : ""
      }`}
    >
      <div className="flex gap-5">
        {/* Step number / seal */}
        <div
          className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center font-serif transition-all duration-500 ${
            done
              ? "bg-accent border-accent text-paper text-sm"
              : "border-line-strong text-ink-soft text-[11px]"
          }`}
        >
          {done ? "✓" : `${index + 1}/${total}`}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title — tap to read, with permanent speaker badge */}
          <Speak
            stepId={step.id}
            lang={lang}
            className="block cursor-pointer"
          >
            <div className="flex items-center gap-3 pt-0.5">
              <span
                className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-[11px] leading-none transition-colors ${
                  speaking
                    ? "border-accent text-accent bg-accent-soft animate-pulse"
                    : "border-ink-faint/70 hover:border-accent hover:text-accent"
                }`}
                aria-hidden
              >
                🔊
              </span>
              <h2 className="font-serif text-[1.35rem] leading-snug">
                {content.title}
              </h2>
            </div>
          </Speak>

          {/* Body — tap to read */}
          <Speak
            stepId={step.id}
            lang={lang}
            className="block mt-4 cursor-pointer"
          >
            <p
              className={`leading-[1.8] text-[1.02rem] transition-colors ${
                speaking ? "text-accent" : "text-ink-soft"
              }`}
            >
              {content.content}
            </p>
          </Speak>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3">
            <button
              onClick={onAcknowledge}
              disabled={acknowledged}
              className={`rounded-full px-6 py-2.5 text-sm font-medium transition-all active:scale-[0.98] ${
                acknowledged
                  ? "bg-accent-soft text-accent cursor-default"
                  : "bg-accent text-paper hover:bg-accent-deep"
              }`}
            >
              {acknowledged ? "✓ " + t.verstanden : t.verstanden}
            </button>

            <button
              onClick={onToggleExplain}
              className={`rounded-full px-5 py-2.5 text-sm transition-colors border ${
                expanded
                  ? "border-brass text-brass"
                  : "border-line text-ink-soft hover:border-ink-soft hover:text-ink"
              }`}
            >
              {t.mehrErklaeren}
            </button>

            <button
              onClick={onShowSource}
              className="px-2 py-2.5 text-[11px] uppercase tracking-[0.14em] text-ink-faint hover:text-brass transition-colors"
            >
              ⓘ {t.quelle}
            </button>
          </div>

          {/* Explanation — indented, left rule, no box */}
          {expanded && (
            <div className="mt-6 ps-5 border-s-2 border-brass/70">
              <p className="text-[11px] uppercase tracking-[0.16em] text-brass mb-2">
                {t.erklärung}
              </p>
              <Speak
                stepId={`${step.id}-explanation`}
                lang={lang}
                className="block cursor-pointer"
              >
                <p className="font-serif text-[1rem] leading-[1.8] text-ink-soft">
                  {content.explanation}
                </p>
              </Speak>
            </div>
          )}

          {/* Choices as elegant rows */}
          {step.type === "choice" && (
            <div className="mt-7 border-t border-line">
              {step.choices?.map((choice) => {
                const isSelected = selectedChoice === choice;
                return (
                  <button
                    key={choice}
                    onClick={() => onChoice(choice)}
                    className={`w-full flex items-center gap-4 py-4 border-b border-line text-start group transition-colors ${
                      isSelected
                        ? "text-accent"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-accent"
                          : "border-line-strong group-hover:border-ink-soft"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                      )}
                    </span>
                    <span className="font-serif text-[1.05rem]">
                      {choice}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}