"use client";

import { useState } from "react";
import type { SessionState } from "@/types";
import { employeeLabels as L } from "@/lib/i18n";

interface Props {
  session: SessionState;
  onStart: (session: SessionState) => void;
}

export default function EmployeeScreen({ session, onStart }: Props) {
  const [patientName, setPatientName] = useState(session.patientName);
  const [krankenkasse, setKrankenkasse] = useState(session.krankenkasse);
  const [versorgung, setVersorgung] = useState(session.versorgung);

  const handleStart = () => {
    onStart({
      ...session,
      phase: "consultation",
      language: "de",
      patientName,
      krankenkasse,
      versorgung,
      startedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Seal */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-brass flex items-center justify-center">
            <span className="font-serif text-[1.7rem] text-brass leading-none pb-0.5">
              §
            </span>
          </div>
        </div>

        <div className="text-center mt-6">
          <h1 className="font-serif text-[2rem] leading-tight">{L.title}</h1>
          <p className="text-[11px] uppercase tracking-[0.22em] text-ink-faint mt-3">
            {L.subtitle}
          </p>
        </div>

        {/* Form — underline fields, document style */}
        <div className="mt-12 border-t border-line pt-10 space-y-8">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-1">
              {L.krankenkasse}
            </label>
            <div className="relative">
              <select
                value={krankenkasse}
                onChange={(e) => setKrankenkasse(e.target.value)}
                className="w-full appearance-none bg-transparent border-b border-line py-3 font-serif text-lg text-ink focus:border-accent focus:outline-none transition-colors"
              >
                <option>AOK Rheinland-Pfalz/Saarland</option>
                <option disabled>Techniker Krankenkasse</option>
                <option disabled>Barmer</option>
                <option disabled>AOK Bayern</option>
              </select>
              <span className="absolute end-1 bottom-4 text-ink-faint pointer-events-none text-sm">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-1">
              {L.versorgung}
            </label>
            <div className="relative">
              <select
                value={versorgung}
                onChange={(e) => setVersorgung(e.target.value)}
                className="w-full appearance-none bg-transparent border-b border-line py-3 font-serif text-lg text-ink focus:border-accent focus:outline-none transition-colors"
              >
                <option>Medizinische Kompressionsstrümpfe</option>
                <option disabled>Stützstrümpfe</option>
                <option disabled>Bandagen</option>
              </select>
              <span className="absolute end-1 bottom-4 text-ink-faint pointer-events-none text-sm">
                ▾
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-ink-faint mb-1">
              {L.patient}
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Erika Mustermann"
              className="w-full bg-transparent border-b border-line py-3 font-serif text-lg text-ink placeholder:text-ink-faint/60 focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleStart}
              disabled={!patientName.trim()}
              className="w-full bg-ink text-paper rounded-full py-4 text-lg font-medium hover:bg-accent-deep disabled:bg-ink-faint/30 disabled:text-paper/70 transition-all active:scale-[0.99]"
            >
              {L.beratungStarten}
            </button>
            <p className="text-center text-[11px] uppercase tracking-[0.16em] text-ink-faint mt-6">
              Regelwerk KOMP-001 · Version 1.0
            </p>
          </div>
        </div>

        <div className="mt-10 border-b border-line" />
      </div>
    </div>
  );
}