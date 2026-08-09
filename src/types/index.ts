export type Language = "de" | "en" | "pl" | "uk" | "tr" | "ar";

export interface ComplianceSource {
  rule: string;
  contract: string;
  productGroup: string;
  requirement: string;
  source: string;
  validSince: string;
}

export interface StepContent {
  title: string;
  content: string;
  explanation: string;
}

export interface ConsultationStep {
  id: string;
  mandatory: boolean;
  type: "information" | "choice";
  choices?: string[];
  translations: Record<Language, StepContent>;
  source: ComplianceSource;
}

export interface ComplianceRule {
  id: string;
  version: string;
  title: string;
  krankenkasse: string;
  steps: ConsultationStep[];
}

export interface SessionState {
  phase: "employee" | "language" | "consultation" | "signature" | "documentation";
  language: Language | null;
  patientName: string;
  krankenkasse: string;
  versorgung: string;
  acknowledgedSteps: string[];
  explainedSteps: string[];
  selectedChoices: Record<string, string>;
  startedAt: string | null;
  completedAt: string | null;
  signatureDataUrl: string | null;
}

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "pl", label: "Polski", flag: "🇵🇱", dir: "ltr" },
  { code: "uk", label: "Українська", flag: "🇺🇦", dir: "ltr" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
];