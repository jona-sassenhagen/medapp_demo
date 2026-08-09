# GKV Compliance-Assistent — Medapp Demo

A tablet-first demo of a **multilingual GKV compliance assistant** for German Hilfsmittel providers (Sanitätshäuser). It turns the legally required patient consultation into a guided, multilingual, audit-ready workflow.

Live demo: <https://jona-sassenhagen.github.io/medapp_demo/>

> **Compliance note:** The rule content in this demo (`src/data/compliance.json`) is a *fictionalized example* to demonstrate how a versioned, validated compliance ruleset would drive the product. It is **not** legal advice and the cited sources are illustrative, not verified.

---

## What it does

1. **Employee screen** — pick Krankenkasse, Versorgung and patient name, then start the consultation.
2. **Patient consultation** — a continuous, document-style page in **6 languages** (DE, EN, PL, UK, TR, AR, with Arabic RTL):
   - Tap any text to hear it read aloud in the patient's language (pre-generated MP3s).
   - A live pause/resume/stop control and a pulsing speaker badge show what is currently being read.
   - Each mandatory item can be acknowledged (`Verstanden`), expanded (`Mehr erklären`) or traced back to its legal source (`ⓘ Quelle`).
   - A choice step records **Standardversorgung vs. Mehrleistung** — the point where the demo shows it's more than a translated instruction manual.
   - An **„Alle bestätigen"** shortcut for staff.
3. **Signature** — the patient signs on the dotted line right at the end of the flow.
4. **Dokumentation** — an automatic German audit record (which texts were shown in which version, language, explanations requested, choices, timestamps, signature) with PDF export.

---

## Architecture

```
Next.js (App Router, static export)
   ├── consultation UI          src/components/*
   ├── i18n                     src/lib/i18n.ts (labels), compliance.json (content)
   ├── signature canvas         src/components/SignaturePad.tsx (signature_pad)
   ├── audio controller         src/lib/audio.ts (one clip at a time, pause/stop)
   ├── audio assets             public/audio/<lang>/<step>.mp3 (pre-generated)
   │
   ▼
JSON compliance specification    src/data/compliance.json
   │
   ▼
German documentation generator  src/lib/document.ts (jsPDF)
```

Deliberately boring: no database. The demo ruleset lives in the repo; the session lives in `localStorage`.

| File | Purpose |
| --- | --- |
| `src/data/compliance.json` | The versioned ruleset (`KOMP-001`) with per-step translations and legal sources |
| `src/components/ConsultationScreen.tsx` | Orchestrates the flow (progress, header, signature) |
| `src/components/ConsultationStep.tsx` | Renders one step (speakable text, actions, choices) |
| `src/components/SignaturePad.tsx` | Retina-crisp signature canvas widget |
| `src/lib/audio.ts` | Central audio controller — single playback, pause/resume/stop, speaking indicator |
| `src/lib/document.ts` | Shared doc labels + PDF generator |
| `src/lib/paths.ts` | Deployment base-path helper (GitHub Pages subpath) |
| `scripts/generate-audio.js` | (Re)generates all MP3s via macOS `say` + `ffmpeg` |

---

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev
```

Open <http://localhost:3000> → enter a patient name → *Beratung starten*.

### Production build / Pages export

```bash
npm run build            # static export into out/ (root path)
# or, mirroring the live deployment:
NEXT_PUBLIC_BASE_PATH=/medapp_demo npm run build
```

`NEXT_PUBLIC_BASE_PATH` sets the GitHub Pages subpath. Locally it stays unset and the app runs at `/`.

---

## Audio generation

Narration is pre-generated per language with the installed macOS voices and stored as MP3s, so playback is instant and reliable on any client.

```bash
node scripts/generate-audio.js
```

Voice mapping (edit `scripts/generate-audio.js` to change):

| Language | Voice |
| --- | --- |
| de | Petra (Premium) |
| en | Evan (Enhanced) |
| pl | Zosia |
| uk | Lesya (Enhanced) |
| tr | Yelda |
| ar | Majed |

Requires `ffmpeg` (`brew install ffmpeg`) for AIFF → MP3 conversion.

---

## Deployment (GitHub Pages)

The app is hosted as a GitHub Pages project site at `https://jona-sassenhagen.github.io/medapp_demo/`.

- `.github/workflows/deploy.yml` builds the static export (with `NEXT_PUBLIC_BASE_PATH=/medapp_demo`) and deploys it via `actions/deploy-pages`.
- Pages is configured on the `medapp_demo` repo with source **GitHub Actions**.
- Push to `main` → automatic rebuild & deploy (~1 min).

---

## License

Proprietary demo. Fonts are loaded from Google Fonts (Fraunces, Inter) via `next/font`.