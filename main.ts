// main.ts: hands this guide in. It is the program the grader runs twice (Node 22,
// standard library only, no network): it copies app/ and screenshots/ from beside
// this file into the output directory and writes /output/dossier.json with the
// vendored make.fun library, so the judge can read the guide's screenshots and text.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// vendor/makefun-frontend.ts is the kit's copy and must stay unchanged: the scorer
// rebuilds the dossier with its own copy and compares the two byte for byte.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(sourceName) {
  const source = join(repoRoot, sourceName);
  if (!existsSync(source)) return;
  cpSync(source, join(outputDir, sourceName), { recursive: true });
}

function writeDossier() {
  // The scorer's own caps: the dossier text is capped at 160 KiB, at most 4
  // screenshots of at most 256 KiB each, app/ at most 993 entries and 48 MiB.
  // buildDossier refuses an entry past those caps, so a failure here is a real
  // failure, not a warning to ignore.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

mkdirSync(outputDir, { recursive: true });
// Start clean so a stale file from an earlier run can never ride along, and so the
// two runs the grader does write byte-identical output.
rmSync(join(outputDir, 'app'), { recursive: true, force: true });
rmSync(join(outputDir, 'screenshots'), { recursive: true, force: true });
copyTree('app');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
copyTree('screenshots');
writeDossier();
