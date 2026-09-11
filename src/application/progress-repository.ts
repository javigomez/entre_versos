import type { Progress } from '../domain/progress';

export interface ProgressRepository {
  load(): Promise<unknown>;
  save(progress: Progress): Promise<void>;
}
