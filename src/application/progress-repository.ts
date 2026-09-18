import type { LessonProgress } from '../domain/lesson-progress';

export interface ProgressRepository {
  load(): Promise<unknown>;
  save(progress: LessonProgress): Promise<void>;
}
