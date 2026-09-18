import type { Lesson } from '../domain/schemas';

export interface ContentRepository {
  load(): Lesson;
}
