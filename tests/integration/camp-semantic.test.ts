import { challengesOf, initialProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { journeyMessages } from '../../src/application/journey-messages';
import { createContentRepository } from '../../src/infrastructure/expo/content/content-repository';
import { contentKeyFromSearch } from '../../src/infrastructure/expo/content/content-selection';

test('camp-semantic: 64 recorreguts catalans completen sis decisions amb les imatges registrades', () => {
  const lesson = createContentRepository(contentKeyFromSearch('?camp-semantic')).load();
  const spanish = createContentRepository('campo_semantico').load();
  expect(lesson.id).not.toBe(spanish.id);
  const journey = challengesOf(lesson)[0];
  if (journey.type !== 'image-journey') throw new Error('Cal un viatge');
  const nodes = journey.nodes;
  const paths: string[][] = [];
  function visit(nodeId: string, path: string[]) {
    const node = nodes.find(candidate => candidate.id === nodeId)!;
    for (const option of node.options) {
      const next = [...path, option.id];
      if (option.next) visit(option.next, next);
      else paths.push(next);
    }
  }
  visit(journey.startNodeId, []);
  expect(paths).toHaveLength(64);
  const endings = new Set<string>();
  for (const path of paths) {
    expect(path).toHaveLength(6);
    let progress = { ...initialProgress(lesson), started: true };
    for (const [index, optionId] of path.entries()) {
      progress = submitChallengeAnswer(lesson, progress, optionId);
      expect(progress.completed).toHaveLength(index === 5 ? 1 : 0);
    }
    const messages = journeyMessages(journey, path);
    endings.add(messages[5].text);
    expect(messages[6].text).toContain(messages[5].text.toLowerCase());
    expect(messages[7].text).toBe('Vols veure el camí que has fet?');
    expect(messages[8].action).toBe('VEURE EL MEU RECORREGUT');
    expect(messages[9].text).toMatch(/^Viatge → (Neu|Platja) → /);
  }
  expect([...endings].sort()).toEqual(['Grimpar', 'Nadar', 'Remar', 'Volar']);
});
