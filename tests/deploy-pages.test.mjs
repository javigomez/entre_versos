import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pagesTarget } from '../scripts/pages-target.mjs';

test('deduces the same project URL from HTTPS and SSH GitHub remotes', () => {
  for (const remote of [
    'https://github.com/poeta/versos.git',
    'git@github.com:poeta/versos.git',
    'ssh://git@github.com/poeta/versos.git',
    'https://github.com/poeta/versos',
  ]) {
    assert.deepEqual(pagesTarget(remote), {
      baseUrl: '/versos',
      url: 'https://poeta.github.io/versos/',
    });
  }
});

test('user Pages repositories are hosted at the root', () => {
  assert.deepEqual(pagesTarget('git@github.com:Poeta/poeta.github.io.git'), {
    baseUrl: '',
    url: 'https://poeta.github.io/',
  });
});

test('rejects absent or unsupported destinations before any publication', () => {
  for (const remote of ['', '/tmp/repo', 'https://gitlab.com/poeta/versos',
    'https://github.com/poeta/versos/tree/main', 'https://github.com/poeta/..',
    'https://github.com.evil.test/poeta/versos']) {
    assert.throws(() => pagesTarget(remote), /GitHub/);
  }
});
