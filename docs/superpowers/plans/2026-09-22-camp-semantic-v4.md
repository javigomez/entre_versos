# Camp semàntic v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afegir un `camp-semantic-v4` funcional que encadeni el viatge d'imatges amb reptes textuals breus, restauri correctament tota la seqüència i validi tots els versos amb `heptasilabs`.

**Architecture:** Mantenir `LessonProgress` i el flux conversacional existents, generalitzant la validació i la reconciliació de l'historial perquè un únic `image-journey` pugui ocupar qualsevol posició entre reptes. Afegir `text-choice` com una variant de domini i presentació separada, amb la mateixa semàntica de resposta que `single-choice` però amb dues o quatre files de text sense emoji. Crear el YAML v4 des de zero, reutilitzant només el graf d'imatges ja verificat de v3 i reescrivint la capa pedagògica.

**Tech Stack:** Expo SDK 57.0.0, React Native 0.86.3, React 19.2.3, TypeScript 6.0, Zod 4.6.1, Jest, React Native Testing Library, YAML 2.9 i el motor local `heptasilabs`.

**Spec:** `docs/superpowers/specs/2026-09-22-camp-semantic-v4-design.md`

## Global Constraints

- Llegir `docs/ux/UX-001-conversacion-y-scroll.md`, `docs/ux/verification.md` i la documentació exacta d'Expo SDK 57 a `https://docs.expo.dev/versions/v57.0.0/` abans d'escriure codi.
- Aplicar TDD estricte: prova que falla pel comportament absent, implementació mínima i suite verda abans de refactoritzar.
- Conservar UX-001.1–.16; en particular, no tocar ancles, política de scroll, doble tap, escriptura progressiva ni `Mostrar completo`.
- Actualitzar UX-001 i els seus escenaris en la mateixa entrega perquè `text-choice` introdueix explícitament controls de dues o quatre opcions.
- `single-choice` continua tenint exactament quatre opcions amb emoji; no debilitar aquest contracte.
- `text-choice` té exactament dues o quatre opcions, sense emoji, amb un màxim de 44 caràcters visibles per opció.
- Amb text ampliat o viewport baix preval UX-001.8: no reduir, comprimir ni truncar; permetre scroll manual.
- No modificar `camp-semantic.yaml`, `camp-semantic-v2.yaml`, `camp-semantic-v3.yaml` ni els seus IDs de lliçó.
- No copiar `/Users/javigomez/Downloads/camp-semantic-v4.yaml`; crear el nou fitxer des de zero i reutilitzar només decisions editorials revisades.
- No afegir dependències ni canviar versions.
- Preservar els canvis aliens i el pla no versionat `docs/superpowers/plans/2026-09-21-texto-versos-tamano-sistema.md`; no fer `git add .`.
- Porta habitual: `npm test`, `npm run typecheck`, `npm run lint` i `npm run export:web`.
- `npm run test:browser` és diagnòstic opcional; no atribuir resultats a DuckDuckGo Android ni Chrome iPhone sense dispositius reals.
- No publicar ni desplegar.

## Review Focus

- Historial mixt: sis seleccions del viatge seguides d'errors i encerts textuals han de restaurar exactament el repte pendent; Task 2 ho fixa amb una seqüència literal.
- Assoliment estable: un canvi de solució textual no pot revocar un repte superat ni esborrar el recorregut necessari del viatge; Task 2 comprova aquest fallback.
- Ordre conversacional: completar el viatge no pot mostrar automàticament la resposta `EXPLICA-M'HO` ni el primer repte; Task 3 cobreix J07 i UX-001.16.
- Opcions llargues i accessibilitat: les files poden créixer, no tenen alçada fixa i no trunquen; Task 4 ho verifica sobre el component real.
- Contingut complet: qualsevol dels 64 recorreguts ha d'arribar als set reptes textuals i a la finalització; Task 5 recorre totes les rutes amb valors esperats literals.

---

### Task 1: Contractes de domini per a seqüències mixtes i `text-choice`

**Files:**
- Modify: `docs/ux/UX-001-conversacion-y-scroll.md`
- Modify: `src/domain/schemas.ts`
- Modify: `src/domain/challenge.ts`
- Modify: `src/domain/schemas.test.ts`
- Modify: `src/domain/challenge.test.ts`

**Interfaces:**
- Consumes: `imageJourneySchema`, `Lesson`, `Challenge` i el contracte actual de `single-choice`.
- Produces: `TextChoiceChallenge`, `textChoiceChallengeSchema`, `ScoredChallenge`, `isScoredChallenge(step)` i `evaluateChallengeAnswer(challenge, optionId)` compatible amb `single-choice`, `text-choice` i `image-choice`.

- [ ] **Step 1: Documentar el canvi de UX autoritzat**

Afegir a UX-001.5, sense substituir el text existent:

```markdown
`text-choice` conserva acierto/error y reintento, muestra dos o cuatro opciones
textuales en filas sin emoji y usa dos únicamente para una oposición binaria.
Las filas crecen con el texto; en viewport bajo o texto ampliado se aplica
UX-001.8 y el acceso restante es manual.
```

Afegir aquests escenaris després d'R14:

```markdown
| R15 | Reto `text-choice` de cuatro opciones, error y acierto | La opción se convierte en burbuja, el error repone las cuatro filas y el acierto avanza; .1–.6, .11, .14–.16 |
| R16 | Reto `text-choice` binario con texto ampliado | Se conservan dos filas legibles, sin emoji, truncado ni compresión; si no caben, el acceso es por scroll manual; .8–.10 |
| R17 | Viaje completado seguido de acción y reto textual | J07 termina antes de mostrar la acción; su respuesta se escribe antes del reto y ninguna respuesta aparece automáticamente; .3–.4, .11, .14–.16 |
```

- [ ] **Step 2: Escriure les proves de schema que han de fallar**

Afegir a `src/domain/schemas.test.ts` una fixture literal i tres casos:

```ts
const textChoice = {
  type: 'text-choice', id: 'estrategia-musica',
  mestre: 'Et llancen MÚSICA.', prompt: 'Què fas?',
  options: [
    { id: 'forcar', text: 'La poso al final i en forço la rima' },
    { id: 'pont', text: 'La poso dins i tanco amb CANTAR' },
  ],
  correctOptionId: 'pont', success: 'Exacte.', retry: 'Canvia la posició.',
} as const;

test('R15/R16: text-choice admet dues o quatre opcions textuals sense emoji', () => {
  expect(textChoiceChallengeSchema.parse(textChoice).options).toHaveLength(2);
  expect(textChoiceChallengeSchema.parse({
    ...textChoice,
    options: [...textChoice.options,
      { id: 'tema', text: 'Canvio de tema' },
      { id: 'repetir', text: 'Repeteixo MÚSICA' }],
  }).options).toHaveLength(4);
});

test.each([1, 3, 5])('rebutja text-choice amb %s opcions', count => {
  const options = Array.from({ length: count }, (_, index) => ({ id: `o-${index}`, text: `Opció ${index}` }));
  expect(() => textChoiceChallengeSchema.parse({ ...textChoice, options, correctOptionId: 'o-0' })).toThrow();
});

test('rebutja opcions textuals que convertirien el botó en un paràgraf', () => {
  const long = 'A'.repeat(45);
  expect(() => textChoiceChallengeSchema.parse({
    ...textChoice,
    options: [{ id: 'llarga', text: long }, textChoice.options[1]],
  })).toThrow();
});
```

Afegir també un cas que construeixi una lliçó amb `image-journey` seguit del
`textChoice` i exigeixi `lessonSchema.safeParse(...).success === true`, més un
cas amb dos viatges que continuï fallant.

```ts
test('admet un únic viatge abans de reptes textuals', () => {
  const journey = journeyLesson.script.find(step => step.type === 'image-journey')!;
  const lesson = { ...journeyLesson, script: [...journeyLesson.script, textChoice] };
  const secondJourney = { ...journey, id: 'viaje-dos' };
  expect(lessonSchema.safeParse(lesson).success).toBe(true);
  expect(lessonSchema.safeParse({ ...lesson, script: [...lesson.script, secondJourney] }).success).toBe(false);
});
```

- [ ] **Step 3: Executar les proves i observar el vermell correcte**

Run: `npx jest --runInBand src/domain/schemas.test.ts src/domain/challenge.test.ts`

Expected: FAIL perquè `textChoiceChallengeSchema` no existeix i l'esquema encara rebutja un viatge amb un altre repte.

- [ ] **Step 4: Implementar els esquemes mínims**

Afegir a `src/domain/schemas.ts`:

```ts
const textOptionSchema = z.object({
  id: slug,
  text: z.string().trim().min(1).max(44),
}).strict();

export const textChoiceChallengeSchema = z.object({
  type: z.literal('text-choice'),
  id: slug,
  mestre: nonempty,
  prompt: nonempty,
  options: z.array(textOptionSchema).refine(
    options => options.length === 2 || options.length === 4,
    'El reto textual necesita dos o cuatro opciones',
  ),
  correctOptionId: slug,
  success: nonempty,
  retry: nonempty,
}).strict().superRefine((challenge, ctx) => {
  if (new Set(challenge.options.map(option => option.id)).size !== challenge.options.length)
    ctx.addIssue({ code: 'custom', message: 'Las opciones deben tener IDs únicos', path: ['options'] });
  if (!challenge.options.some(option => option.id === challenge.correctOptionId))
    ctx.addIssue({ code: 'custom', message: 'La respuesta correcta debe existir', path: ['correctOptionId'] });
});
```

Incloure l'esquema a `scriptItemSchema`, exportar:

```ts
export type TextChoiceChallenge = z.infer<typeof textChoiceChallengeSchema>;
export type ScoredChallenge = SingleChoiceChallenge | TextChoiceChallenge;
export type Challenge = ScoredChallenge | ImageChoiceChallenge | ImageJourneyChallenge;

export function isScoredChallenge(challenge: Challenge): challenge is ScoredChallenge {
  return challenge.type === 'single-choice' || challenge.type === 'text-choice';
}
```

Ampliar `isChallenge` amb `text-choice`. Substituir la regla que exigeix que el
viatge sigui l'únic repte i l'últim per aquesta validació:

```ts
const journeys = lesson.script.filter(item => item.type === 'image-journey');
if (journeys.length > 1)
  ctx.addIssue({ code: 'custom', message: 'La lección admite como máximo un viaje', path: ['script'] });
```

Afegir `kind: z.enum(['verse', 'prose']).optional()` als passos `mestre` sense
fer `.strict()`, de manera que el contingut anterior continuï sent vàlid.

- [ ] **Step 5: Generalitzar l'avaluació i provar-la**

Canviar `src/domain/challenge.ts` perquè consumeixi `ScoredChallenge`:

```ts
import type { ImageChoiceChallenge, ScoredChallenge } from './schemas';

export function evaluateChallengeAnswer(
  challenge: ScoredChallenge | ImageChoiceChallenge,
  optionId: string,
): ChallengeAnswerResult {
  if (!challenge.options.some(option => option.id === optionId)) return 'invalid';
  return challenge.type === 'image-choice' || challenge.correctOptionId === optionId
    ? 'completed'
    : 'retry';
}
```

Afegir a `src/domain/challenge.test.ts` un `text-choice` de dues opcions i
comprovar literals `invalid`, `retry` i `completed`.

- [ ] **Step 6: Executar les proves de domini**

Run: `npx jest --runInBand src/domain/schemas.test.ts src/domain/challenge.test.ts src/domain/lesson.test.ts`

Expected: PASS sense canviar les assercions existents de quatre opcions de `single-choice`.

- [ ] **Step 7: Commit acotat**

```bash
git add docs/ux/UX-001-conversacion-y-scroll.md src/domain/schemas.ts src/domain/challenge.ts src/domain/schemas.test.ts src/domain/challenge.test.ts
git commit -m "feat: define textual choice challenges"
```

### Task 2: Restauració genèrica d'un viatge seguit de reptes

**Files:**
- Create: `tests/fixtures/mixedJourney.ts`
- Modify: `src/domain/lesson.ts`
- Modify: `src/domain/lesson.test.ts`
- Modify: `tests/integration/content-and-restore.test.ts`

**Interfaces:**
- Consumes: `Lesson`, `LessonProgress`, `challengesOf`, `replayJourney` i `submitChallengeAnswer`.
- Produces: `restoreProgress(lesson, raw)` capaç de reconciliar `[image-journey, text-choice, ...]` sense modificar el format persistit.

- [ ] **Step 1: Crear una fixture mixta mínima**

Crear `tests/fixtures/mixedJourney.ts` exportant `mixedJourneyLesson: Lesson` a
partir de `journeyLesson`, amb el viatge com a primer repte, després:

```ts
{ type: 'mestre', kind: 'prose', label: 'Mestre', text: 'Ara practiquem.' },
{ type: 'student', action: 'EXPLICA-M\'HO', text: 'Vull aprendre el truc.' },
{
  type: 'text-choice', id: 'porta-musica',
  mestre: 'MÚSICA necessita una porta.', prompt: 'MÚSICA → ?',
  options: [
    { id: 'cantar', text: 'CANTAR' },
    { id: 'pintar', text: 'PINTAR' },
    { id: 'nedar', text: 'NEDAR' },
    { id: 'tancar', text: 'TANCAR' },
  ],
  correctOptionId: 'cantar', success: 'CANTAR.', retry: 'Busca el significat.',
},
```

i `completion: 'Lliçó completada.'`. No alterar `journeyLesson` compartida.

- [ ] **Step 2: Escriure primer les proves de restauració mixta**

Afegir a `src/domain/lesson.test.ts`:

```ts
test('R17: restaura el viatge complet i el repte textual posterior', () => {
  let progress = { ...initialProgress(mixedJourneyLesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'])
    progress = submitChallengeAnswer(mixedJourneyLesson, progress, id);
  const wrong = submitChallengeAnswer(mixedJourneyLesson, progress, 'pintar');
  expect(wrong.completed).toEqual(['viaje-palabras']);
  expect(restoreProgress(mixedJourneyLesson, structuredClone(wrong))).toEqual(wrong);
  const correct = submitChallengeAnswer(mixedJourneyLesson, wrong, 'cantar');
  expect(restoreProgress(mixedJourneyLesson, structuredClone(correct))).toEqual(correct);
});

test('J06/R17: un viatge complet necessita les sis eleccions encara que hi hagi reptes posteriors', () => {
  const raw = {
    ...initialProgress(mixedJourneyLesson), started: true,
    completed: ['viaje-palabras'], history: [],
  };
  expect(restoreProgress(mixedJourneyLesson, raw)).toEqual(initialProgress(mixedJourneyLesson));
});

test('P01/R17: conserva el recorregut si canvia la solució d’un repte textual superat', () => {
  let saved = { ...initialProgress(mixedJourneyLesson), started: true };
  for (const id of ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a', 'cantar'])
    saved = submitChallengeAnswer(mixedJourneyLesson, saved, id);
  const updated = {
    ...mixedJourneyLesson,
    script: mixedJourneyLesson.script.map(step => step.type === 'text-choice'
      ? { ...step, correctOptionId: 'pintar' }
      : step),
  } satisfies Lesson;
  const restored = restoreProgress(updated, structuredClone(saved));
  expect(restored.completed).toEqual(['viaje-palabras', 'porta-musica']);
  expect(restored.history.map(entry => entry.challengeId)).toEqual(Array(6).fill('viaje-palabras'));
});
```

- [ ] **Step 3: Executar el vermell**

Run: `npx jest --runInBand src/domain/lesson.test.ts tests/integration/content-and-restore.test.ts`

Expected: FAIL perquè la branca especial actual rebutja qualsevol entrada d'historial que no pertanyi al viatge.

- [ ] **Step 4: Substituir la branca especial per una reconciliació genèrica**

Mantenir `submitChallengeAnswer` sense bifurcacions noves. A `restoreProgress`,
després de validar identitat, `started` i prefix de `completed`, calcular:

```ts
const completedChallenges = challenges.slice(0, saved.completed.length);
const completedJourney = completedChallenges.find(challenge => challenge.type === 'image-journey');
const journeyHistory = completedJourney?.type === 'image-journey'
  ? saved.history.filter(entry => entry.challengeId === completedJourney.id)
  : [];

if (completedJourney?.type === 'image-journey') {
  const replay = replayJourney(completedJourney, journeyHistory.map(entry => entry.optionId));
  if (!replay?.ending || journeyHistory.length !== 6) return fresh;
}

const baseline: LessonProgress = {
  ...saved,
  history: completedJourney ? journeyHistory : [],
};
```

Després reproduir tot `saved.history` amb el bucle genèric existent, començant
pel prefix anterior al primer `challengeId`. Exigir que cada entrada pertanyi
al repte actiu, que `submitChallengeAnswer` produeixi un estat nou i que el
prefix final de `completed` coincideixi literalment amb `saved.completed`.
Quan la reproducció falli:

```ts
const incompatible = () => saved.completed.length ? baseline : fresh;
```

Així un canvi editorial textual conserva assoliments i el recorregut, mentre
un recorregut impossible torna a `fresh`. No conservar entrades textuals que
amb la solució actual produirien feedback fals.

- [ ] **Step 5: Afegir la integració de serialització real**

A `tests/integration/content-and-restore.test.ts`, serialitzar amb
`JSON.stringify`, restaurar el progrés mixt després del sisè tap, després d'un
error i després de l'encert. Assertar `lessonId`, els IDs exactes de
`completed`, les vuit entrades d'historial i que no apareix `sessionId`.

```ts
const encoded = JSON.parse(JSON.stringify(correct));
const restored = restoreProgress(mixedJourneyLesson, encoded);
expect(restored.lessonId).toBe('mixed-journey-test-v1');
expect(restored.completed).toEqual(['viaje-palabras', 'porta-musica']);
expect(restored.history).toHaveLength(8);
expect(JSON.parse(JSON.stringify(restored))).not.toHaveProperty('sessionId');
```

- [ ] **Step 6: Executar domini i integració**

Run: `npx jest --runInBand src/domain/lesson.test.ts tests/integration/content-and-restore.test.ts`

Expected: PASS, inclosos P01–P07 i J06 existents.

- [ ] **Step 7: Commit acotat**

```bash
git add tests/fixtures/mixedJourney.ts src/domain/lesson.ts src/domain/lesson.test.ts tests/integration/content-and-restore.test.ts
git commit -m "feat: restore challenges after image journeys"
```

### Task 3: Projecció i flux conversacional després del viatge

**Files:**
- Modify: `src/application/message-projector.ts`
- Modify: `src/application/message-projector.test.ts`
- Modify: `src/application/conversation-flow.test.ts`
- Modify: `tests/components/TrainingSession.test.tsx`

**Interfaces:**
- Consumes: `isScoredChallenge`, `mixedJourneyLesson`, `messagesFor`, `createFlow` i `reduceFlow`.
- Produces: missatges de `text-choice` amb feedback i un flux que espera l'acció del jugador entre J07 i el primer repte.

- [ ] **Step 1: Escriure la prova de projecció que falla**

Afegir a `src/application/message-projector.test.ts` una prova que completa el
viatge de `mixedJourneyLesson` i comprova l'ordre literal dels IDs. El projector
pot construir els missatges futurs; el reducer és qui n'impedeix la revelació
abans de l'acció del jugador:

```ts
const messages = messagesFor(mixedJourneyLesson, afterJourney);
expect(messages.slice(-8).map(message => message.id)).toEqual([
  'viaje-palabras-revelation',
  'viaje-palabras-route-question',
  'viaje-palabras-route-action',
  'viaje-palabras-route',
  'viaje-palabras-teaching',
  'mestre-7',
  'student-8',
  'porta-musica-mestre',
]);
expect(messages.at(-2)).toMatchObject({
  role: 'player', action: 'EXPLICA-M\'HO', text: 'Vull aprendre el truc.',
});
```

Després d'afegir la resposta narrativa revelada, comprovar que el següent
missatge del mestre és `MÚSICA necessita una porta.`; després d'un error,
comprovar l'ordre `PINTAR` → `Busca el significat.` i que el repte continua
pendent.

- [ ] **Step 2: Escriure la prova de reducer UX-001.16 que falla**

A `src/application/conversation-flow.test.ts`, portar el flux fins al final de
J07 i assertar:

```ts
expect(state.phase).toBe('waiting-student');
expect(state.messages[state.revealed]).toMatchObject({
  role: 'player', action: 'EXPLICA-M\'HO', text: 'Vull aprendre el truc.',
});
```

Enviar `ACTIVATE_STUDENT`, `PRESS_DONE`, `MOVE_DONE` i `PLACED` amb el token
vigent; només després de `MESSAGE_DONE` ha d'arribar `waiting-choice` per a
`porta-musica`.

- [ ] **Step 3: Executar el vermell**

Run: `npx jest --runInBand src/application/message-projector.test.ts src/application/conversation-flow.test.ts`

Expected: FAIL perquè `text-choice` encara no es projecta com a repte puntuat.

- [ ] **Step 4: Generalitzar el projector sense tocar les fases**

A `message-projector.ts`, conservar la branca pròpia de `image-journey` i fer
servir `isScoredChallenge(challenge)` per generar feedback:

```ts
if (isScoredChallenge(challenge)) {
  const correct = option.id === challenge.correctOptionId;
  messages.push({
    id: `feedback-${index}`,
    role: 'mestre',
    text: correct ? challenge.success : challenge.retry,
    kind: correct ? 'success' : undefined,
  });
}
```

Projectar passos `mestre` amb:

```ts
kind: item.kind === 'prose' ? undefined : 'verse'
```

No afegir fases a `conversation-flow.ts`: `phaseFor` ja deriva
`waiting-student` dels missatges i `waiting-choice` del nombre de reptes.

- [ ] **Step 5: Afegir la prova de component R17**

A `TrainingSession.test.tsx`, restaurar la fixture just després de completar el
viatge. Acabar els missatges de J07 amb `Mostrar mensaje completo`, prémer
`VER MI RECORRIDO`, completar la seva transició i comprovar que
`EXPLICA-M'HO` apareix abans de qualsevol botó `CANTAR`. Després completar la
transició d'`EXPLICA-M'HO` i comprovar que apareixen exactament quatre opcions.

- [ ] **Step 6: Executar projecció, reducer i component**

Run: `npx jest --runInBand src/application/message-projector.test.ts src/application/conversation-flow.test.ts tests/components/TrainingSession.test.tsx`

Expected: PASS per R17 i per tots els casos R01/R03/R07/R09/J07 existents.

- [ ] **Step 7: Commit acotat**

```bash
git add src/application/message-projector.ts src/application/message-projector.test.ts src/application/conversation-flow.test.ts tests/components/TrainingSession.test.tsx
git commit -m "feat: continue conversation after image journey"
```

### Task 4: Files de resposta textual accessibles

**Files:**
- Create: `src/infrastructure/expo/ui/TextChoiceChallenge.tsx`
- Modify: `src/infrastructure/expo/ui/ChallengeView.tsx`
- Create: `tests/components/TextChoiceChallenge.test.tsx`
- Modify: `tests/components/TrainingSession.test.tsx`

**Interfaces:**
- Consumes: `TextChoiceChallenge`, `ControlTarget` i `onAnswer(id, target)`.
- Produces: `TextChoiceChallengeView` amb dues o quatre files, preview de transició i el mateix bloqueig de doble tap que la resta de controls.

- [ ] **Step 1: Escriure les proves del component real**

Crear `tests/components/TextChoiceChallenge.test.tsx` amb una fixture de quatre
opcions, importar `StyleSheet` de `react-native` i provar:

```tsx
test('R15: mostra quatre files sense emoji i envia una sola resposta', async () => {
  const onAnswer = jest.fn();
  await render(<TextChoiceChallengeView challenge={challenge} onAnswer={onAnswer} />);
  expect(screen.getAllByRole('button')).toHaveLength(4);
  expect(screen.queryByText('🌊')).not.toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'CANTAR' }));
  expect(onAnswer).toHaveBeenCalledTimes(1);
  expect(onAnswer).toHaveBeenCalledWith('cantar', expect.objectContaining({ id: 'cantar' }));
});

test('R16: la fila no fixa alçada ni trunca una opció de 44 caràcters', async () => {
  const text = 'MÚSICA dins; CANTAR tanca el vers amb força';
  await render(<TextChoiceChallengeView
    challenge={{ ...binaryChallenge, options: [
      { id: 'pont', text }, { id: 'final', text: 'MÚSICA al final' },
    ] }} onAnswer={jest.fn()} />);
  const label = screen.getByText(text);
  expect(label.props.numberOfLines).toBeUndefined();
  expect(label.props.ellipsizeMode).toBeUndefined();
  const button = screen.getByRole('button', { name: text });
  const style = StyleSheet.flatten(button.props.style({ pressed: false }));
  expect(style.height).toBeUndefined();
  expect(style.minHeight).toBe(52);
});
```

Afegir casos per `disabled`, `selectedOptionId` i preview, comprovant estat
accessible i no cridant `onAnswer` quan està bloquejat.

```tsx
const view = await render(<TextChoiceChallengeView challenge={challenge}
  onAnswer={onAnswer} disabled selectedOptionId="cantar" />);
const selected = view.getByRole('button', { name: 'CANTAR' });
expect(selected).toBeDisabled();
expect(selected.props.accessibilityState).toEqual({ disabled: true, selected: true });
await fireEvent.press(selected);
expect(onAnswer).not.toHaveBeenCalled();
```

- [ ] **Step 2: Executar el vermell**

Run: `npx jest --runInBand tests/components/TextChoiceChallenge.test.tsx`

Expected: FAIL perquè el component no existeix.

- [ ] **Step 3: Implementar el component mínim**

Crear `TextChoiceChallenge.tsx` seguint el patró de `SingleChoiceChallenge`,
però amb aquest contracte visual:

```tsx
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TextChoiceChallenge as TextChoiceContent } from '../../../domain/schemas';
import type { ControlTarget } from './viewport/useConversationViewport';
import { colors as c } from './theme';

type Props = {
  challenge: TextChoiceContent;
  onAnswer: (id: string, target: ControlTarget) => void;
  disabled?: boolean;
  selectedOptionId?: string;
};

export function TextChoiceChallengeView({
  challenge, onAnswer, disabled = false, selectedOptionId,
}: Props) {
  return <View style={styles.container} testID="text-choice">
    <Text style={styles.prompt}>{challenge.prompt}</Text>
    <View style={styles.options}>{challenge.options.map(option =>
      <TextOption key={option.id} option={option} disabled={disabled}
        selected={selectedOptionId === option.id} onAnswer={onAnswer} />
    )}</View>
  </View>;
}

function TextOption({ option, disabled, selected, onAnswer }: {
  option: TextChoiceContent['options'][number];
  disabled: boolean;
  selected: boolean;
  onAnswer: Props['onAnswer'];
}) {
  const ref = useRef<View | null>(null);
  const preview = () => <View style={[styles.option, selected && styles.selected]}>
    <Text style={styles.optionText}>{option.text}</Text>
  </View>;
  const target: ControlTarget = { id: option.id, ref, renderPreview: preview };
  return <Pressable ref={ref} accessibilityRole="button"
    accessibilityLabel={option.text} accessibilityState={{ disabled, selected }}
    disabled={disabled} onPress={() => { if (!disabled) onAnswer(option.id, target); }}
    style={({ pressed }) => [styles.option, (pressed || selected) && styles.selected]}>
    <Text style={styles.optionText}>{option.text}</Text>
  </Pressable>;
}
```

Estils exactes de base, sense `height`, `numberOfLines` ni `ellipsizeMode`:

```ts
const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  prompt: { color: c.text, fontSize: 21, fontWeight: '600', lineHeight: 29, marginTop: 6, marginBottom: 16 },
  options: { gap: 10 },
  option: { width: '100%', minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: '#303133', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  selected: { backgroundColor: '#353c2e', borderColor: c.accent },
  optionText: { color: c.text, fontSize: 18, lineHeight: 24, fontWeight: '700', textAlign: 'left' },
});
```

- [ ] **Step 4: Connectar `ChallengeView` exhaustivament**

Afegir `TextChoiceContent` al tipus de `challenge` i una branca explícita:

```tsx
if (challenge.type === 'single-choice')
  return <SingleChoiceChallenge challenge={challenge} onAnswer={onAnswer}
    disabled={disabled} selectedOptionId={selectedOptionId} />;
if (challenge.type === 'text-choice')
  return <TextChoiceChallengeView challenge={challenge} onAnswer={onAnswer}
    disabled={disabled} selectedOptionId={selectedOptionId} />;
return <ImageChoiceChallenge challenge={challenge} onAnswer={onAnswer}
  resolveImage={resolveImage} disabled={disabled} selectedOptionId={selectedOptionId} />;
```

No modificar `TrainingSession`: ja passa qualsevol repte que no sigui
`image-journey` a `ChallengeView`.

- [ ] **Step 5: Provar error, reintent i doble tap dins la sessió**

Afegir a `TrainingSession.test.tsx` un cas R15 amb la fixture mixta restaurada
al primer `text-choice`: prémer `PINTAR` dues vegades, completar una única
transició, comprovar una única burbuja `PINTAR`, feedback, quatre files de nou,
prémer `CANTAR` i comprovar que les opcions antigues desapareixen.

- [ ] **Step 6: Executar els tests de UI**

Run: `npx jest --runInBand tests/components/TextChoiceChallenge.test.tsx tests/components/TrainingSession.test.tsx`

Expected: PASS, sense regressions a `SingleChoiceChallenge` ni `ImageJourney`.

- [ ] **Step 7: Commit acotat**

```bash
git add src/infrastructure/expo/ui/TextChoiceChallenge.tsx src/infrastructure/expo/ui/ChallengeView.tsx tests/components/TextChoiceChallenge.test.tsx tests/components/TrainingSession.test.tsx
git commit -m "feat: render textual choices as rows"
```

### Task 5: Crear i validar `camp-semantic-v4.yaml`

**Files:**
- Create: `src/infrastructure/expo/content/camp-semantic-v4.yaml`
- Modify: `src/infrastructure/expo/content/content-selection.ts`
- Modify: `src/infrastructure/expo/content/content-repository.ts`
- Modify: `src/infrastructure/expo/content/content-images.ts`
- Modify: `scripts/validate-camp-semantic.mjs`
- Modify: `tests/unit/content-selection.test.ts`
- Modify: `tests/integration/camp-semantic.test.ts`

**Interfaces:**
- Consumes: els 40 nodes i 80 referències d'imatge verificats de `camp-semantic-v3.yaml`, el nou `text-choice` i `heptasilabs/src/index.js`.
- Produces: `ContentKey` `camp-semantic-v4`, lliçó `camp-semantic-viatge-v4` i validació mètrica executable.

- [ ] **Step 1: Escriure primer els tests de registre i contingut**

Ampliar `content-selection.test.ts` amb `?camp-semantic-v4` i
`?content=camp-semantic-v4`.

A `camp-semantic.test.ts`, mantenir els casos v1–v3 i afegir un test separat:

```ts
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
  expect(challenges.slice(1).map(challenge => challenge.options.length)).toEqual([4, 4, 4, 4, 4, 4, 2]);
  expect(challenges.slice(1).flatMap(challenge => challenge.options.map(option => option.text.length))
    .every(length => length <= 44)).toBe(true);
});
```

Per a cadascun dels 64 camins, començar amb progrés iniciat, enviar les sis
opcions del camí i després aquests IDs correctes literals:

```ts
const correct = ['cantar', 'callar', 'brillar', 'cremar', 'cantar-facil', 'callar-facil', 'pont-cantar'];
```

Assertar que `completed` acaba amb els vuit IDs en ordre i que
`messagesFor(...).at(-1)?.id === 'completion'` després de revelar l'última
resposta narrativa.

- [ ] **Step 2: Executar el vermell**

Run: `npx jest --runInBand tests/unit/content-selection.test.ts tests/integration/camp-semantic.test.ts`

Expected: FAIL perquè la clau i el YAML v4 no existeixen.

- [ ] **Step 3: Crear el YAML des de zero**

Crear `camp-semantic-v4.yaml` amb:

```yaml
id: camp-semantic-viatge-v4
startAction: AIXECAR-ME
startWithStudent: true
```

Redactar els passos inicials amb `kind: verse` per a les dues quartetes
heptasil·làbiques de v2 i `kind: prose` per a nota i respostes. Incorporar un
`image-journey` amb ID `viaje-palabras`, la presentació catalana existent i el
graf `nodes` complet de v3, que ja correspon als 80 JPG registrats. No llegir
ni copiar el bloc `nodes` del YAML de Downloads.

La `teaching` del viatge ha de quedar limitada a:

```text
Has començat amb una imatge i has anat trobant un camí. Les paraules es poden
relacionar pel significat: platja, sorra i mar, per exemple, comparteixen un
mateix entorn. Aquestes relacions formen camps semàntics i et donen una paraula
nova quan et quedes en blanc.
```

Després de J07, afegir la resposta `EXPLICA-M'HO`, l'estrofa de transició de
l'especificació amb `kind: verse`, i una explicació en prosa que digui:

```text
Díaz-Pimienta classifica com a «infeliç» una paraula amb menys de cinc rimes
consonants. No cal forçar-la al final del vers: la pots posar a dins i saltar,
pel significat, cap a una paraula que et deixi una rima més ampla.
```

Afegir exactament aquests set reptes; cada fila indica
`id | mestre | prompt | opcions | solució`:

```text
porta-musica | Troba una porta pel significat. | MÚSICA → ? | cantar:CANTAR, pintar:PINTAR, nedar:NEDAR, tancar:TANCAR | cantar
porta-silenci | Mantén el mateix criteri. | SILENCI → ? | callar:CALLAR, remar:REMAR, pentinar:PENTINAR, saltar:SALTAR | callar
porta-llum | Busca l'acció més directa. | LLUM → ? | brillar:BRILLAR, remar:REMAR, cuinar:CUINAR, grimpar:GRIMPAR | brillar
porta-foc | Una última associació directa. | FOC → ? | cremar:CREMAR, nedar:NEDAR, pentinar:PENTINAR, remar:REMAR | cremar
sortida-musica | Ara totes pertanyen al mateix camp. | Quina et prepara una rima en -AR? | cantar-facil:CANTAR, ritme:RITME, acord:ACORD, solfeig:SOLFEIG | cantar-facil
sortida-silenci | Tria significat i una terminació ampla. | Quina et dona una sortida directa en -AR? | callar-facil:CALLAR, pausa:PAUSA, calma:CALMA, mut:MUT | callar-facil
estrategia-musica | Última prova: et llancen MÚSICA. | Quina estratègia et manté rimant? | final-musica:MÚSICA al final i en forço la rima, pont-cantar:MÚSICA dins; CANTAR tanca el vers | pont-cantar
```

Usar aquests feedbacks exactes:

```text
porta-musica success: CANTAR. Has saltat a una acció del mateix món.
porta-musica retry: Busca un verb en -AR relacionat directament amb MÚSICA.
porta-silenci success: CALLAR. El significat et dona una sortida nova.
porta-silenci retry: Busca l'acció que expressa directament SILENCI.
porta-llum success: BRILLAR. Primer has seguit el significat.
porta-llum retry: Quina acció associes de manera directa amb LLUM?
porta-foc success: CREMAR. Camp semàntic primer; rima fàcil després.
porta-foc retry: Quina acció pertany clarament al món del FOC?
sortida-musica success: CANTAR. Totes hi tenen relació, però aquesta ja obre la rima en -AR.
sortida-musica retry: Ara busca significat i també la terminació -AR.
sortida-silenci success: CALLAR. És la porta relacionada que et deixa rimar en -AR.
sortida-silenci retry: Tria l'opció relacionada que acaba en -AR.
estrategia-musica success: Exacte. MÚSICA queda dins del vers i CANTAR n'obre la rima.
estrategia-musica retry: No forcis MÚSICA al final; canvia-la de posició.
```

La pregunta final té només:

```yaml
options:
  - id: final-musica
    text: MÚSICA al final i en forço la rima
  - id: pont-cantar
    text: MÚSICA dins; CANTAR tanca el vers
correctOptionId: pont-cantar
```

Després de l'encert, afegir la demostració de quatre versos de l'especificació,
la resposta `HO TINC` i un `completion` que convidi a tornar a la batalla sense
prometre una lliçó inexistent.

- [ ] **Step 4: Registrar la clau i el repositori**

Afegir `'camp-semantic-v4'` a `ContentKey`, `knownKeys`, l'import YAML i
`rawByKey`. A `createChallengeImageResolver`, incloure v4 entre les claus que
reutilitzen el registre `campo_semantico`. No canviar el valor per defecte
`training`.

- [ ] **Step 5: Fer que el validador comprovi versos declarats**

Canviar `validate-camp-semantic.mjs` perquè validi:

```js
const verses = new Set([
  ...lesson.script
    .filter(step => step.type === 'mestre' &&
      (step.kind === 'verse' || (step.kind === undefined && step.text.includes('\n'))))
    .flatMap(step => step.text.split('\n')),
  ...[...endings].flatMap(ending => journey.revelation.replace('{VERBO}', ending).split('\n')),
]);
```

Conservar l'exigència conjunta `result.ok`, `posicionsFinsTonica === 7` i
`metrica.veredicte === 'VALID'`. Executar:

```bash
node scripts/validate-camp-semantic.mjs /Users/javigomez/Documents/projects/heptasilabs camp-semantic-v4.yaml
```

Expected: exit 0; totes les línies impreses com `VALID`, quatre finals
comprovats i cap bloc de prosa analitzat com a vers.

- [ ] **Step 6: Executar integració de contingut**

Run: `npx jest --runInBand tests/unit/content-selection.test.ts tests/integration/camp-semantic.test.ts tests/integration/content-images.test.ts`

Expected: PASS per v1–v4, 64 recorreguts v4 i cap asset nou sense registrar.

- [ ] **Step 7: Commit acotat**

```bash
git add src/infrastructure/expo/content/camp-semantic-v4.yaml src/infrastructure/expo/content/content-selection.ts src/infrastructure/expo/content/content-repository.ts src/infrastructure/expo/content/content-images.ts scripts/validate-camp-semantic.mjs tests/unit/content-selection.test.ts tests/integration/camp-semantic.test.ts
git commit -m "feat: add camp semantic v4 lesson"
```

### Task 6: Verificació funcional, documentació i porta completa

**Files:**
- Modify: `src/infrastructure/expo/content/README.md`
- Modify: `docs/ux/camp-semantic-metrica.md`
- Modify: `docs/ux/verification.md`
- Modify: `tests/components/App.test.tsx`

**Interfaces:**
- Consumes: `?camp-semantic-v4`, resultats frescos de mètrica, suites i exportació.
- Produces: evidència reproduïble i documentació honesta dels límits visuals.

- [ ] **Step 1: Escriure la prova de la ruta web**

Afegir a `App.test.tsx` un cas que fixa `Platform.OS = 'web'`, usa
`location.search = '?camp-semantic-v4'`, completa el primer missatge i comprova
que apareix `AIXECAR-ME`. El canvi de registre que trencaria aquesta prova és
retirar v4 de `rawByKey` o `knownKeys`.

```tsx
test('App obre camp-semantic-v4 des de la query web', async () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  Object.defineProperty(globalThis, 'location', {
    configurable: true, value: { search: '?camp-semantic-v4' },
  });
  await render(<App />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Mostrar mensaje completo' }));
  expect(await screen.findByRole('button', { name: 'AIXECAR-ME' })).toBeTruthy();
});
```

- [ ] **Step 2: Executar la prova de ruta**

Run: `npx jest --runInBand tests/components/App.test.tsx`

Expected: PASS; si encara falla, corregir només el registre o el contingut que
impedeix carregar la lliçó.

- [ ] **Step 3: Executar la verificació mètrica final**

Run: `node scripts/validate-camp-semantic.mjs /Users/javigomez/Documents/projects/heptasilabs camp-semantic-v4.yaml`

Expected: exit 0, cap `ERROR` ni `DUBTOS`.

- [ ] **Step 4: Executar la porta habitual completa**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run export:web
```

Expected: quatre codis de sortida 0. Registrar pel seu nom qualsevol prova
fallida, encara que sembli aliena al canvi; no presentar la porta com a verda
si algun comandament falla.

- [ ] **Step 5: Fer una comprovació web diagnòstica del viewport de referència**

Obrir l'exportació a 390 × 700 i recórrer un camí complet, un error textual,
un encert i la pregunta binària. Comprovar visualment que les quatre opcions
curtes inicials són visibles sense scroll en entrar al repte, que la pregunta
binària mostra dues files i que text ampliat conserva el contingut encara que
necessiti scroll manual. Aquesta comprovació no substitueix ni afirma proves
en dispositius reals.

- [ ] **Step 6: Actualitzar documentació amb resultats observats**

A `content/README.md`, documentar `?camp-semantic-v4`, el repte textual de
dues/quatre opcions i l'ordre viatge → pràctica. A
`camp-semantic-metrica.md`, copiar la sortida real del Step 3. A
`verification.md`, registrar resultats i durades reals dels quatre comandaments,
els casos R15–R17 coberts i aquests límits: comprovació de 390 × 700 si s'ha
executat, DuckDuckGo Android i Chrome iPhone pendents si no s'han provat.

- [ ] **Step 7: Revisar el diff i confirmar només fitxers de v4**

Run:

```bash
git status --short
git diff --check
git diff --stat
```

Expected: cap error de whitespace; el pla aliè de tipografia continua sense
modificar i no hi ha canvis a v1–v3.

- [ ] **Step 8: Commit documental acotat**

```bash
git add src/infrastructure/expo/content/README.md docs/ux/camp-semantic-metrica.md docs/ux/verification.md tests/components/App.test.tsx
git commit -m "docs: record camp semantic v4 verification"
```

## Self-review

- Cobertura de l'especificació: Tasks 1–2 cobreixen model i restauració;
  Tasks 3–4 cobreixen conversa i controls; Task 5 cobreix el contingut reescrit
  i la mètrica; Task 6 cobreix ruta, porta i evidència.
- Consistència de tipus: `text-choice`, `TextChoiceChallenge`,
  `textChoiceChallengeSchema`, `ScoredChallenge` i `isScoredChallenge` mantenen
  els mateixos noms a totes les tasques.
- Preservació de UX: R15–R17 amplien el contracte sense substituir R01–R14 ni
  J01–J07.
- Risc principal cobert: el fallback de restauració conserva només les sis
  entrades verificades del viatge quan un historial textual queda obsolet.
- Abast editorial: set reptes, no els dotze del YAML rebut; quatre associacions,
  dues seleccions de sortida i una decisió binària.
