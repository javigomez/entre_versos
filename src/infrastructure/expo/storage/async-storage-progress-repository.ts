import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Progress } from '../../../domain/progress';
import type { ProgressRepository } from '../../../application/progress-repository';

const KEY = 'batalla-de-gallos:progress:v1';

let pending: Promise<void> = Promise.resolve();

export function createAsyncStorageProgressRepository(): ProgressRepository {
  return {
    async load() {
      const value = await AsyncStorage.getItem(KEY);
      if (!value) return null;
      try { return JSON.parse(value); } catch { return null; }
    },
    save(progress: Progress) {
      pending = pending.catch(() => {}).then(() => AsyncStorage.setItem(KEY, JSON.stringify(progress)));
      return pending;
    },
  };
}
