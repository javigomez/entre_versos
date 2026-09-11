import { expect, test } from '@jest/globals';
import { restoreProgress } from '../../src/domain/session';
import { createYamlContentRepository } from '../../src/infrastructure/expo/content/yaml-content-repository';
import type { Session, Challenge, ScriptItem } from '../../src/domain/schemas';

const repo = createYamlContentRepository();

function isChallenge(item: ScriptItem): item is Challenge {
  return item.type === 'single-choice';
}

test('el repositorio YAML carga el guion editorial con retos válidos', () => {
  const session: Session = repo.load();
  const challenges = session.script.filter(isChallenge);
  expect(challenges.length).toBeGreaterThanOrEqual(2);
  expect(challenges[0].options[0].emoji).toBe('🌊');
});

test('load() y restoreProgress() cierran el ciclo sobre el YAML real', () => {
  const session = repo.load();
  const challenges = session.script.filter(isChallenge);
  const history = challenges.map((c: Challenge) => ({ challengeId: c.id, optionId: c.correctOptionId }));
  const fullProgress = { sessionId: session.id, started: true, completed: challenges.map((c: Challenge) => c.id), history };
  expect(restoreProgress(session, JSON.parse(JSON.stringify(fullProgress)))).toEqual(fullProgress);
});
