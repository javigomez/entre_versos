export type ContentKey = 'training' | 'campo_semantico' | 'camp-semantic';

const safeKey = /^[a-z0-9_-]+$/;
const knownKeys = new Set<ContentKey>(['training', 'campo_semantico', 'camp-semantic']);

export function contentKeyFromSearch(search: string): ContentKey {
  if (search === '' || search === '?') return 'training';
  const rawKey = search.slice(1);
  const key = rawKey.startsWith('content=') ? rawKey.slice('content='.length) : rawKey;
  if (!search.startsWith('?') || !safeKey.test(key) || !knownKeys.has(key as ContentKey)) {
    throw new Error(`Contenido no válido: ${search}`);
  }
  return key as ContentKey;
}
