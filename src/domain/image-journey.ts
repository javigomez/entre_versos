import { z } from 'zod';
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const word = z.string().trim().min(1).refine(value => !/\s/.test(value), 'Una sola palabra');
const endingSchema = z.enum(['nadar', 'remar', 'volar', 'trepar']);
const optionSchema = z.object({
  id: slug, text: word,
  image: z.object({
    file: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$/),
    description: z.string().trim().min(1),
  }).strict(),
  next: slug.optional(), ending: endingSchema.optional(),
}).strict();
const nodeSchema = z.object({
  id: slug, layer: z.number().int().min(1).max(6),
  options: z.array(optionSchema).length(2),
}).strict();
export const imageJourneySchema = z.object({
  type: z.literal('image-journey'), id: slug, startNodeId: slug,
  nodes: z.array(nodeSchema).min(6),
  revelation: z.string().trim().min(1), teaching: z.string().trim().min(1),
}).strict().superRefine((journey, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: 'custom', message });
  const nodes = new Map(journey.nodes.map(node => [node.id, node]));
  if (nodes.size !== journey.nodes.length) fail('IDs de nodo duplicados');
  if (nodes.get(journey.startNodeId)?.layer !== 1) fail('La raíz debe estar en capa 1');
  const ids = new Set<string>();
  for (const node of journey.nodes) for (const option of node.options) {
    if (ids.has(option.id)) fail('IDs de opción duplicados');
    ids.add(option.id);
    if (node.layer < 6) {
      if (option.ending || !option.next || nodes.get(option.next)?.layer !== node.layer + 1)
        fail(`Salida inválida: ${node.id}/${option.id}`);
    } else if (option.next || !option.ending || option.text !== option.ending.toUpperCase()) {
      fail(`Terminal inválido: ${node.id}/${option.id}`);
    }
  }
  const visited = new Set<string>();
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    nodes.get(id)?.options.forEach(option => { if (option.next) visit(option.next); });
  };
  visit(journey.startNodeId);
  if (journey.nodes.some(node => !visited.has(node.id))) fail('Nodo inalcanzable');
  if ((journey.revelation.match(/\{VERBO\}/g) ?? []).length !== 1)
    fail('La revelación necesita exactamente un {VERBO}');
});
export type ImageJourneyChallenge = z.infer<typeof imageJourneySchema>;
export type JourneyNode = ImageJourneyChallenge['nodes'][number];
export type JourneyOption = JourneyNode['options'][number];
export type JourneyReplay = {
  nodeId: string | null; words: string[];
  ending: z.infer<typeof endingSchema> | null;
};
export function replayJourney(journey: ImageJourneyChallenge, optionIds: readonly string[]): JourneyReplay | null {
  if (optionIds.length > 6) return null;
  let nodeId: string | null = journey.startNodeId;
  let ending: JourneyReplay['ending'] = null;
  const words: string[] = [];
  for (const optionId of optionIds) {
    const node: JourneyNode | undefined = journey.nodes.find(item => item.id === nodeId);
    const option: JourneyOption | undefined = node?.options.find(item => item.id === optionId);
    if (!option || ending) return null;
    words.push(option.text);
    nodeId = option.next ?? null;
    ending = option.ending ?? null;
  }
  if ((ending !== null) !== (words.length === 6)) return null;
  return { nodeId, words, ending };
}
export function journeyOptions(journey: ImageJourneyChallenge, optionIds: readonly string[]): JourneyOption[] {
  const replay = replayJourney(journey, optionIds);
  if (!replay || replay.ending) return [];
  return journey.nodes.find(node => node.id === replay.nodeId)?.options ?? [];
}
