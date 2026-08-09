import type { SessionState, Language } from "@/types";

const SESSION_KEY = "gkv-compliance-session";

export function getDefaultSession(): SessionState {
  return {
    phase: "employee",
    language: null,
    patientName: "",
    krankenkasse: "AOK Rheinland-Pfalz/Saarland",
    versorgung: "Medizinische Kompressionsstrümpfe",
    acknowledgedSteps: [],
    explainedSteps: [],
    selectedChoices: {},
    startedAt: null,
    completedAt: null,
    signatureDataUrl: null,
  };
}

export function loadSession(): SessionState {
  if (typeof window === "undefined") return getDefaultSession();
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return getDefaultSession();
}

export function saveSession(session: SessionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}