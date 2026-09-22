// src/domain/image-journey.test.ts
import { expect, test } from '@jest/globals';
import { journey, journeyLesson } from '../../tests/fixtures/journey';
import { imageJourneySchema, replayJourney, journeyOptions } from './image-journey';
import { lessonSchema } from './schemas';

test('J02/J04: seis elecciones, nunca cinco ni siete', () => {
  expect(imageJourneySchema.safeParse(journey).success).toBe(true);
  for (let mask = 0; mask < 64; mask++) {
    const ids = Array.from({ length: 6 }, (_, i) => `n${i + 1}-${mask & (1 << i) ? 'b' : 'a'}`);
    expect(replayJourney(journey, ids.slice(0, 5))?.ending).toBeNull();
    expect(replayJourney(journey, ids)?.words).toHaveLength(6);
    expect(replayJourney(journey, ids)?.ending).toMatch(/^(nadar|remar)$/);
    expect(journeyOptions(journey, ids)).toEqual([]);
    expect(replayJourney(journey, [...ids, 'n6-a'])).toBeNull();
  }
});
test('rechaza opciones de otro nodo, IDs desconocidos y ciclos', () => {
  expect(replayJourney(journey, ['n2-a'])).toBeNull();
  expect(replayJourney(journey, ['inventado'])).toBeNull();
  const cyclic = structuredClone(journey);
  cyclic.nodes[2].options[0].next = 'n1';
  expect(imageJourneySchema.safeParse(cyclic).success).toBe(false);
});
test('rechaza destino roto, opciones duplicadas y terminal adelantado', () => {
  const broken = structuredClone(journey);
  broken.nodes[1].options[0].next = 'ausente';
  expect(imageJourneySchema.safeParse(broken).success).toBe(false);
  const repeated = structuredClone(journey);
  repeated.nodes[1].options[0].id = 'n1-a';
  expect(imageJourneySchema.safeParse(repeated).success).toBe(false);
  const short = structuredClone(journey);
  delete short.nodes[4].options[0].next;
  short.nodes[4].options[0].ending = 'nadar';
  expect(imageJourneySchema.safeParse(short).success).toBe(false);
});

test('J01: lección con viaje único, pasos posteriores, etiquetas y respuesta inicial', () => {
  expect(lessonSchema.parse(journeyLesson)).toEqual(journeyLesson);
  expect(lessonSchema.safeParse({ ...journeyLesson, script: [...journeyLesson.script, { type: 'master', text: 'Más' }] }).success).toBe(true);
  const journey = journeyLesson.script.find(step => step.type === 'image-journey')!;
  expect(lessonSchema.safeParse({
    ...journeyLesson,
    script: [...journeyLesson.script, { ...journey, id: 'viaje-dos' }],
  }).success).toBe(false);
  expect(lessonSchema.safeParse({ ...journeyLesson, startAction: 'Otra acción' }).success).toBe(false);
});
