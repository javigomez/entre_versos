import type { Session } from '../domain/schemas';

export interface ContentRepository {
  load(): Session;
}
