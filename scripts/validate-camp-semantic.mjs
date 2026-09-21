import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'yaml';

// El motor lingüístic és un projecte local independent, no una dependència de l'app.
const validatorRoot = process.argv[2];
if (!validatorRoot) throw new Error('Ús: node scripts/validate-camp-semantic.mjs /ruta/heptasilabs');
const { analitzarVers } = await import(pathToFileURL(resolve(validatorRoot, 'src/index.js')).href);
const lesson = parse(readFileSync(new URL('../src/infrastructure/expo/content/camp-semantic.yaml', import.meta.url), 'utf8'));
const journey = lesson.script.find(step => step.type === 'image-journey');
const endings = new Set(journey.nodes.flatMap(node => node.options).flatMap(option => option.ending ? [option.ending] : []));
const verses = new Set([
  ...lesson.script.filter(step => step.type === 'master' && step.text.includes('\n')).flatMap(step => step.text.split('\n')),
  ...[...endings].flatMap(ending => journey.revelation.replace('{VERBO}', ending).split('\n')),
]);
let failures = 0;
for (const verse of verses) {
  const result = analitzarVers(verse);
  const valid = result.ok && result.posicionsFinsTonica === 7 && result.metrica.veredicte === 'VALID';
  console.log(`${valid ? 'VALID' : 'ERROR'} | ${result.ok ? result.representacio : result.error.message}`);
  if (!valid) failures += 1;
}
console.log(`${verses.size - failures}/${verses.size} versos vàlids; ${endings.size} finals comprovats.`);
if (!verses.size || !endings.size || failures) process.exitCode = 1;
