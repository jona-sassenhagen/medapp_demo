import type { ComplianceRule, SessionState } from "@/types";

export const LANGUAGE_NAMES: Record<string, string> = {
  de: "Deutsch",
  en: "Englisch",
  pl: "Polnisch",
  uk: "Ukrainisch",
  tr: "Türkisch",
  ar: "Arabisch",
};

export const STEP_LABELS: Record<string, string> = {
  usage: "Anwendung",
  dressing: "An-/Ausziehen",
  care: "Pflege",
  problems: "Verhalten bei Problemen",
  "standard-vs-extra": "Standardversorgung / Mehrleistungen",
};

export async function downloadBeratungsdokumentation(
  rule: ComplianceRule,
  session: SessionState
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("BERATUNGSDOKUMENTATION", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const lang = session.language || "de";
  const lines: [string, string][] = [
    ["Versorgung:", rule.title],
    ["Krankenkasse:", session.krankenkasse],
    ["Patient:", session.patientName],
    ["Patientensprache:", LANGUAGE_NAMES[lang] || lang],
    ["Dokumentationsgrundlage:", `${rule.id}, Version ${rule.version}`],
    ["", ""],
    ["Patient informiert über:", ""],
    ...rule.steps.map((s): [string, string] => [
      `✓ ${STEP_LABELS[s.id] || s.id}`,
      "",
    ]),
    ["", ""],
    ["Zusätzliche Erläuterungen aufgerufen:", ""],
    ...rule.steps
      .filter((s) => session.explainedSteps.includes(s.id))
      .map((s): [string, string] => [`✓ ${STEP_LABELS[s.id] || s.id}`, ""]),
    ...rule.steps
      .filter((s) => s.type === "choice" && session.selectedChoices[s.id])
      .map((s): [string, string] => [
        "",
        `Auswahl: ${session.selectedChoices[s.id]}`,
      ]),
    ["", ""],
    ["Beratung begonnen:", formatTime(session.startedAt)],
    ["Abgeschlossen:", formatTime(session.completedAt)],
  ];

  for (const [label, value] of lines) {
    if (label && value) {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, y);
      const labelWidth = doc.getTextWidth(label);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + labelWidth + 2, y);
    } else if (label) {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, y);
    }
    y += 7;
  }

  y += 10;

  if (session.signatureDataUrl) {
    doc.setFont("helvetica", "bold");
    doc.text("Unterschrift Patient:", margin, y);
    y += 5;
    try {
      const img = new Image();
      img.src = session.signatureDataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          doc.addImage(canvas.toDataURL("image/png"), "PNG", margin, y, 100, 30);
          resolve();
        };
      });
    } catch {
      doc.text("(Signatur konnte nicht eingebettet werden)", margin, y);
    }
  }

  doc.save(`Beratungsdokumentation_${session.patientName.replace(/\s+/g, "_")}.pdf`);
}

function formatTime(isoString: string | null): string {
  if (!isoString) return "–";
  return new Date(isoString).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}