import { challengesOf, initialProgress, submitChallengeAnswer } from '../../src/domain/lesson';
import { journeyMessages } from '../../src/application/journey-messages';
import { createContentRepository } from '../../src/infrastructure/expo/content/content-repository';
import { contentKeyFromSearch } from '../../src/infrastructure/expo/content/content-selection';
import { messagesFor } from '../../src/application/message-projector';

test.each(['camp-semantic', 'camp-semantic-v2', 'camp-semantic-v3'])('%s: 64 recorreguts catalans completen sis decisions amb les imatges registrades', key => {
  const lesson = createContentRepository(contentKeyFromSearch(`?${key}`)).load();
  const spanish = createContentRepository('campo_semantico').load();
  expect(lesson.id).not.toBe(spanish.id);
  const journey = challengesOf(lesson)[0];
  if (journey.type !== 'image-journey') throw new Error('Cal un viatge');
  expect(journey.presentation?.choiceHint).toBe('Tria una imatge per continuar el viatge');
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

test('camp-semantic-v4 encadena 64 recorreguts amb set reptes textuals concisos', () => {
  const lesson = createContentRepository('camp-semantic-v4').load();
  const challenges = challengesOf(lesson);
  expect(lesson.id).toBe('camp-semantic-viatge-v4');
  expect(challenges.map(challenge => challenge.type)).toEqual([
    'image-journey',
    'text-choice', 'text-choice', 'text-choice', 'text-choice',
    'text-choice', 'text-choice', 'text-choice',
  ]);
  expect(challenges.map(challenge => challenge.id)).toEqual([
    'viaje-palabras', 'porta-musica', 'porta-silenci', 'porta-llum', 'porta-foc',
    'sortida-musica', 'sortida-silenci', 'estrategia-musica',
  ]);
  expect(challenges.slice(1).map(challenge => 'options' in challenge ? challenge.options.length : 0))
    .toEqual([4, 4, 4, 4, 4, 4, 2]);
  expect(challenges.slice(1).flatMap(challenge => 'options' in challenge
    ? challenge.options.map(option => option.text.length) : []).every(length => length <= 44)).toBe(true);
  const prose = lesson.script.flatMap(step =>
    step.type === 'master' && step.kind === 'prose' ? [step.text] : []).join(' ');
  expect(prose).toContain('«infeliç»');
  expect(prose.toLocaleLowerCase('ca')).not.toContain('trista');
  expect(lesson.script).toEqual(expect.arrayContaining([
    expect.objectContaining({ type: 'student', action: "EXPLICA-M'HO" }),
    expect.objectContaining({ type: 'student', action: 'PRACTIQUEM' }),
    expect.objectContaining({ type: 'student', action: 'HO TINC' }),
  ]));
  const firstTextChoiceIndex = lesson.script.findIndex(step => step.type === 'text-choice');
  expect(lesson.script[firstTextChoiceIndex - 1]).toMatchObject({ type: 'student', action: 'PRACTIQUEM' });

  const journey = challenges[0];
  if (journey.type !== 'image-journey') throw new Error('Cal un viatge');
  const paths: string[][] = [];
  const visit = (nodeId: string, path: string[]) => {
    const node = journey.nodes.find(candidate => candidate.id === nodeId)!;
    for (const option of node.options) {
      const next = [...path, option.id];
      if (option.next) visit(option.next, next);
      else paths.push(next);
    }
  };
  visit(journey.startNodeId, []);
  expect(paths).toHaveLength(64);
  const correct = ['cantar', 'callar', 'brillar', 'cremar', 'cantar-facil', 'callar-facil', 'pont-cantar'];
  for (const path of paths) {
    let progress = { ...initialProgress(lesson), started: true };
    for (const optionId of [...path, ...correct]) progress = submitChallengeAnswer(lesson, progress, optionId);
    expect(progress.completed).toEqual(challenges.map(challenge => challenge.id));
    expect(messagesFor(lesson, progress).at(-1)?.id).toBe('completion');
  }
});
