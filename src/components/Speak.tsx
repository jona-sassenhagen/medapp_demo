"use client";

import { useRef, useCallback, useEffect } from "react";
import type { Language } from "@/types";
import { registerAudio, playAudio } from "@/lib/audio";
import { publicPath } from "@/lib/paths";

interface Props {
  stepId: string;
  lang: Language;
  children?: React.ReactNode;
  className?: string;
}

export default function Speak({ stepId, lang, children, className }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioPath = publicPath(`/audio/${lang}/${stepId}.mp3`);

  // Always (re)create the audio element for the current language + step,
  // so switching languages never replays the previous language's audio.
  // Also register it so the global stop button can halt playback.
  useEffect(() => {
    const audio = new Audio(audioPath);
    audio.preload = "auto";
    audioRef.current = audio;
    const unregister = registerAudio(audio);
    return () => {
      audio.pause();
      audio.src = "";
      unregister();
    };
  }, [audioPath]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    playAudio(stepId, audio);
  }, [stepId]);

  return (
    <span
      onClick={play}
      className={
        className ??
        "cursor-pointer decoration-dotted decoration-transparent underline-offset-[5px] hover:decoration-ink-faint transition-colors"
      }
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          play();
        }
      }}
    >
      {children}
    </span>
  );
}