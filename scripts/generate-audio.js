// Script to generate audio files using macOS `say` command + ffmpeg
// Reads content from compliance.json and generates MP3s for each language + step

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const compliance = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "src", "data", "compliance.json"), "utf-8")
);

const voices = {
  de: "Petra (Premium)",
  pl: "Zosia",
  uk: "Lesya (Enhanced)",
  tr: "Yelda",
  ar: "Majed",
};

const outputDir = path.join(__dirname, "..", "public", "audio");

for (const step of compliance.steps) {
  for (const [lang, content] of Object.entries(step.translations)) {
    const langDir = path.join(outputDir, lang);
    if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

    // Main content
    const mainMp3 = path.join(langDir, `${step.id}.mp3`);
    if (!fs.existsSync(mainMp3)) {
      const aiffFile = `/tmp/gkv_${step.id}_${lang}.aiff`;
      console.log(`Generating ${mainMp3}...`);
      try {
        execSync(
          `say -v "${voices[lang]}" -o "${aiffFile}" "${content.content}"`,
          { timeout: 30000 }
        );
        execSync(
          `ffmpeg -y -i "${aiffFile}" -acodec mp3 -b:a 64k "${mainMp3}" 2>/dev/null`,
          { timeout: 30000 }
        );
        fs.unlinkSync(aiffFile);
      } catch (e) {
        console.error(`Failed to generate ${mainMp3}: ${e.message}`);
      }
    }

    // Explanation content
    const explMp3 = path.join(langDir, `${step.id}-explanation.mp3`);
    if (!fs.existsSync(explMp3)) {
      const aiffFile = `/tmp/gkv_${step.id}_explanation_${lang}.aiff`;
      console.log(`Generating ${explMp3}...`);
      try {
        execSync(
          `say -v "${voices[lang]}" -o "${aiffFile}" "${content.explanation}"`,
          { timeout: 30000 }
        );
        execSync(
          `ffmpeg -y -i "${aiffFile}" -acodec mp3 -b:a 64k "${explMp3}" 2>/dev/null`,
          { timeout: 30000 }
        );
        fs.unlinkSync(aiffFile);
      } catch (e) {
        console.error(`Failed to generate ${explMp3}: ${e.message}`);
      }
    }
  }
}

console.log("Audio generation complete!");