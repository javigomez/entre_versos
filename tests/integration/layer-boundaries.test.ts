import { expect, test } from '@jest/globals';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';

const sourceRoot = resolve(__dirname, '../../src');
const domainRoot = join(sourceRoot, 'domain');
const applicationRoot = join(sourceRoot, 'application');

function sourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return ['.ts', '.tsx'].includes(extname(entry.name)) && !entry.name.endsWith('.test.ts') ? [path] : [];
  });
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g)]
    .map(match => match[1]);
}

function isInside(path: string, root: string): boolean {
  const pathFromRoot = relative(root, path);
  return pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..');
}

test('domain solo depende de zod y de sí mismo', () => {
  const violations = sourceFiles(domainRoot).flatMap(file => importsOf(file).flatMap(specifier => {
    const allowed = specifier === 'zod' || (specifier.startsWith('.') && isInside(resolve(dirname(file), specifier), domainRoot));
    return allowed ? [] : [`${relative(sourceRoot, file)} -> ${specifier}`];
  }));
  expect(violations).toEqual([]);
});

test('application solo depende de domain y de sí misma', () => {
  const violations = sourceFiles(applicationRoot).flatMap(file => importsOf(file).flatMap(specifier => {
    if (!specifier.startsWith('.')) return [`${relative(sourceRoot, file)} -> ${specifier}`];
    const target = resolve(dirname(file), specifier);
    return isInside(target, applicationRoot) || isInside(target, domainRoot)
      ? []
      : [`${relative(sourceRoot, file)} -> ${specifier}`];
  }));
  expect(violations).toEqual([]);
});
