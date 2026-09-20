export type ContentKey = 'training' | 'campo_semantico';

const safeKey = /^[a-z0-9_]+$/;
const knownKeys = new Set<ContentKey>(['training', 'campo_semantico']);

export function contentKeyFromSearch(search: string): ContentKey {
  const params = new URLSearchParams(search);
  const entries = [...params.entries()];
  if (entries.length === 0) return 'training';
  if (entries.length !== 1) throw new Error(`Contenido no válido: ${search}`);
  const [key, value] = entries[0];
  if (value !== '' || !safeKey.test(key) || !knownKeys.has(key as ContentKey)) {
    throw new Error(`Contenido no válido: ${search}`);
  }
  return key as ContentKey;
}
