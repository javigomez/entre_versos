import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, promisify } from 'node:util';
import ghPages from 'gh-pages';
import { pagesTarget } from './pages-target.mjs';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));

try {
  const { values } = parseArgs({
    options: { 'dry-run': { type: 'boolean' }, repo: { type: 'string' } },
  });
  let repo = values.repo;
  if (!repo) {
    try {
      repo = execFileSync('git', ['remote', 'get-url', '--push', 'origin'], {
        cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
    } catch {
      throw new Error('Falta el remoto origin. Añádelo con git remote add origin URL_DE_GITHUB, o usa --repo URL.');
    }
  }
  const target = pagesTarget(repo);
  console.log(`Preparando GitHub Pages: ${target.url}`);
  execFileSync(process.execPath, [require.resolve('expo/bin/cli'), 'export', '--platform', 'web'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, PAGES_BASE_URL: target.baseUrl },
  });
  const dist = resolve(root, 'dist');
  writeFileSync(resolve(dist, '.nojekyll'), '');
  if (values['dry-run']) {
    console.log('Exportación lista en dist/. Dry run: no se ha publicado nada.');
  } else {
    await promisify(ghPages.publish)(dist, {
      repo, branch: 'gh-pages', dotfiles: true, nojekyll: true,
      message: 'Publish web app',
    });
    console.log(`Archivos enviados a gh-pages. Cuando GitHub termine de desplegar: ${target.url}`);
    console.log('Primera publicación: Settings → Pages → Deploy from a branch → gh-pages / (root).');
  }
} catch (error) {
  console.error(`No se pudo preparar o publicar la web: ${error.message}`);
  process.exitCode = 1;
}
