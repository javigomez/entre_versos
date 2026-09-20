import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LessonProgress } from '../../../domain/lesson-progress';
import type { ProgressRepository } from '../../../application/progress-repository';

const KEY_PREFIX = 'batalla-de-gallos:progress:v1';

const pendingByKey = new Map<string, Promise<void>>();

export function createAsyncStorageProgressRepository(contentKey = 'training'): ProgressRepository {
  const key = `${KEY_PREFIX}:${contentKey}`;
  return {
    async load() {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try { return JSON.parse(value); } catch { return null; }
    },
    save(progress: LessonProgress) {
      const pending = (pendingByKey.get(key) ?? Promise.resolve())
        .catch(() => {})
        .then(() => AsyncStorage.setItem(key, JSON.stringify(progress)));
      pendingByKey.set(key, pending);
      return pending;
    },
  };
}
