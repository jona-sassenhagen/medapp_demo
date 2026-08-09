"use client";

import { useState, useCallback, useEffect } from "react";
import type { SessionState, Language, ComplianceRule } from "@/types";
import rawComplianceData from "@/data/compliance.json";

const complianceData = rawComplianceData as unknown as ComplianceRule;
import { loadSession, saveSession, clearSession, getDefaultSession } from "@/lib/session";
import EmployeeScreen from "@/components/EmployeeScreen";
import ConsultationScreen from "@/components/ConsultationScreen";
import DocumentationView from "@/components/DocumentationView";

const rule = complianceData;

export default function Home() {
  // SSR-safe: start identical to the server render, then hydrate from
  // localStorage in an effect. This prevents hydration mismatches.
  const [session, setSession] = useState<SessionState>(getDefaultSession);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  const updateSession = useCallback((updates: Partial<SessionState>) => {
    setSession((prev) => {
      const next = { ...prev, ...updates };
      saveSession(next);
      return next;
    });
  }, []);

  const handleStart = useCallback(
    (updated: SessionState) => {
      setSession(updated);
      saveSession(updated);
    },
    []
  );

  const handleSelectLanguage = useCallback(
    (lang: Language) => {
      updateSession({ language: lang, phase: "consultation" });
    },
    [updateSession]
  );

  const handleAcknowledge = useCallback(
    (stepId: string) => {
      if (!session.acknowledgedSteps.includes(stepId)) {
        updateSession({
          acknowledgedSteps: [...session.acknowledgedSteps, stepId],
        });
      }
    },
    [session.acknowledgedSteps, updateSession]
  );

  const handleExplain = useCallback(
    (stepId: string) => {
      if (!session.explainedSteps.includes(stepId)) {
        updateSession({
          explainedSteps: [...session.explainedSteps, stepId],
        });
      }
    },
    [session.explainedSteps, updateSession]
  );

  const handleChoice = useCallback(
    (stepId: string, choice: string) => {
      updateSession({
        selectedChoices: { ...session.selectedChoices, [stepId]: choice },
      });
    },
    [session.selectedChoices, updateSession]
  );

  const handleComplete = useCallback(
    (signatureDataUrl: string) => {
      updateSession({
        signatureDataUrl,
        completedAt: new Date().toISOString(),
        phase: "documentation",
      });
    },
    [updateSession]
  );

  const handleNewConsultation = useCallback(() => {
    clearSession();
    setSession(getDefaultSession());
  }, []);

  switch (session.phase) {
    case "employee":
      return <EmployeeScreen session={session} onStart={handleStart} />;
    case "consultation":
      return (
        <ConsultationScreen
          rule={rule}
          session={session}
          onAcknowledge={handleAcknowledge}
          onExplain={handleExplain}
          onChoice={handleChoice}
          onComplete={handleComplete}
          onRestart={handleNewConsultation}
          onLanguageChange={handleSelectLanguage}
        />
      );
    case "documentation":
      return (
        <DocumentationView
          rule={rule}
          session={session}
          onNewConsultation={handleNewConsultation}
        />
      );
    default:
      return <EmployeeScreen session={session} onStart={handleStart} />;
  }
}