"use client";

import { useCallback, useEffect, useState } from "react";
import type { Language, SessionState, ComplianceRule } from "@/types";
import rawComplianceData from "@/data/compliance.json";

const complianceData = rawComplianceData as unknown as ComplianceRule;
import { loadSession, saveSession } from "@/lib/session";
import LandingPage from "@/components/LandingPage";

export default function Home() {
  // SSR-safe: start identical to the server render, then hydrate from
  // localStorage in an effect. This prevents hydration mismatches.
  const [session, setSession] = useState<SessionState>(() => ({
    language: null,
    patientName: "",
    krankenkasse: "",
    versorgung: "",
    acknowledgedSteps: [],
    explainedSteps: [],
    selectedChoices: {},
    startedAt: null,
    completedAt: null,
    signatureDataUrl: null,
    phase: "employee",
  }));

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const handleLanguageChange = useCallback((lang: Language) => {
    setSession((prev) => {
      const next = { ...prev, language: lang };
      saveSession(next);
      return next;
    });
  }, []);

  return (
    <LandingPage session={session} rule={complianceData} onLanguageChange={handleLanguageChange} />
  );
}
