# El rastro de las palabras — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear el contenido `?campo_semantico` desde una derrota verbal y una nota misteriosa hasta un viaje visual de seis elecciones que revela el campo semántico como recurso para desbloquear la improvisación.

**Architecture:** Añadir un reto compuesto `image-journey` al motor de lecciones existente, con un grafo acíclico de seis capas, historial reutilizado y proyección del cierre a partir de las elecciones reales. La conversación mantiene su UI y su contrato; el interior del viaje usa una vista inmersiva separada, coordinada por el mismo reducer. El YAML y sus imágenes locales son la fuente editorial; el dominio no importa Expo, React ni archivos de contenido.

**Tech Stack:** Expo `~57.0.21`, React Native `0.86.3`, React `19.2.3`, TypeScript, Zod `^4.6.1`, YAML/Metro, AsyncStorage, Jest y React Native Testing Library ya instalados.

**Spec:** [Especificación acompañante](../specs/2026-09-20-viaje-campo-semantico-design.md). Leerla completa. Fuente narrativa: [conversación compartida](https://chatgpt.com/share/6aafe32f-00e4-83eb-a0ff-0be7b71c5ce4). Este plan es para revisión, no una autorización de implementación ya concedida.

## Global Constraints

- Trabajar en `main` para esta entrega documental; no crear ramas ni worktrees.
- Conservar `training.yaml` y los cambios ajenos; nunca confirmar todo el índice.
- No añadir dependencias ni cambiar versiones: Expo `~57.0.21`, React Native `0.86.3`, React `19.2.3`, Zod `^4.6.1`.
- Leer https://docs.expo.dev/versions/v57.0.0/ antes de escribir código.
- Mantener UX-001 y R01–R10; documentar la excepción inmersiva únicamente para `image-journey`.
- Puerta habitual: `npm test`, `npm run typecheck`, `npm run lint`, `npm run export:web`.
- `npm run test:browser` es diagnóstico opcional, no puerta obligatoria.
- No afirmar validación en DuckDuckGo Android ni Chrome iPhone sin ejecutarla en dispositivos reales.
- No publicar ni desplegar como parte de la implementación del plan.

## Review Focus

1. Un doble tap, callback del nodo anterior o temporizador posterior al reset no debe consumir dos decisiones: tarea 4, pruebas J03/J08 con tokens.
2. ROCA en capa cinco, palabras repetidas y convergencias no deben crear callejones ni rutas cortas: tarea 1, enumeración de 64 rutas y reproducción de BARCA repetida.
3. Guardados truncados, de otra lección o con terminal sin seis elecciones no deben inventar el recorrido: tarea 2, restauración 0–6 y corrupción; tarea 6, namespaces aislados.
4. Imagen faltante/fallida y pantalla baja no deben impedir elegir ni distorsionar las dos tarjetas: tareas 5/7, fallo de Image y revisión visual con texto ampliado.
5. El cierre no debe usar un verbo fijo, revelar otra rama ni enseñar que asociar equivale a rimar: tarea 3, cuatro finales exactos, resumen derivado y orden cuarteta→ruta→concepto.

---

## 0. Cómo ejecutar este documento

El trabajo es una sola experiencia vertical, no tres productos independientes. Hacer las tareas 1–8 en orden: cada una tiene su entrega y revisión. El arte de la tarea 7 puede producirse después de fijar el catálogo; no cambiar nodos durante la generación. Los bloques de código son especificaciones de implementación. Añadir los imports indicados, no pegar un bloque parcial como si reemplazara un archivo completo. Los archivos existentes se editan conservando sus demás funciones y pruebas.

No ejecutar aún: el usuario ha pedido un plan. Al aprobar su ejecución, confirmar que comprende la excepción UX-J y el presupuesto de 80 imágenes. Esto no es pedir permiso para generar el presente documento.

### Preparación y commits, aplicables a cada tarea

- [ ] Leer `AGENTS.md`, `docs/ux/UX-001-conversacion-y-scroll.md`, `docs/ux/verification.md` y `docs/superpowers/plans/2026-09-11-ux-001.md`.
- [ ] Ejecutar `git branch --show-current`, `git status --short`, `git diff --cached --name-only`; registrar qué había antes de la tarea. Al preparar este plan `main` estaba limpia.
- [ ] Antes de código Expo, releer la documentación versionada enlazada. Para una duda concreta de librería usar `npx ctx7@latest library '<nombre>' '<pregunta completa>'`, luego `docs <id obtenido> '<pregunta completa>'`, fuera del sandbox, máximo tres consultas por pregunta. No cambiar dependencias para resolver una diferencia de docs.
- [ ] Antes de cada implementación, escribir su prueba, ejecutar el comando dirigido y registrar el fallo real. «No existe el módulo» es rojo inicial válido; después la prueba debe fallar también cuando se altera la regla que pretende proteger.
- [ ] Al terminar una tarea, revisar únicamente sus archivos y confirmar solo esos paths. Si existe trabajo ajeno dentro de un archivo, seleccionar únicamente hunks propios y revisar el diff del commit. No usar `git add .`, `git add -A`, `git commit -a` ni un commit sin revisar el índice.

Ejemplo de commit limitado, si no hay cambios ajenos en estos archivos:

```bash
git diff -- src/domain/image-journey.ts src/domain/image-journey.test.ts
git add src/domain/image-journey.ts src/domain/image-journey.test.ts
git diff --cached -- src/domain/image-journey.ts src/domain/image-journey.test.ts
git commit --only -m "feat: validate six-step image journeys" -- src/domain/image-journey.ts src/domain/image-journey.test.ts
```

Si un archivo contiene cambios ajenos, no aplicar el ejemplo con `--only` (incluiría su árbol de trabajo completo): usar selección de hunks y un commit con índice temporal propio, o dejar el commit pendiente y explicar el motivo. El contenido revisable importa más que forzar un commit.

## 1. Mapa de archivos y responsabilidades

| Archivo | Acción / responsabilidad |
| --- | --- |
| `src/domain/image-journey.ts` | Nuevo: esquema del grafo, validación, replay puro y selección actual. |
| `src/domain/image-journey.test.ts` | Nuevo: topología, 64 caminos, entradas inválidas. |
| `src/domain/schemas.ts` | Añadir la variante al discriminante y a `isChallenge`; etiquetas opcionales de narrador. |
| `src/domain/challenge.ts` | Restringir evaluador sin estado a variantes simples. |
| `src/domain/lesson.ts` | Responder y restaurar el viaje sin cambiar restauración lineal. |
| `src/domain/lesson.test.ts` | Añadir pruebas de progreso, reanudación y corrupción del viaje. |
| `src/application/journey-messages.ts` | Nuevo: cuarteta, recorrido y explicación derivados. |
| `src/application/message-projector.ts` | Proyectar viaje completado como un bloque estable; silenciar elecciones parciales. |
| `src/application/message-projector.test.ts` | Verificar prefijo y ausencia de burbujas parciales. |
| `src/application/conversation-flow.ts` | Fases/eventos inmersivos con tokens y salida al chat. |
| `src/application/conversation-flow.test.ts` | Taps duplicados, reset, restauración y cierre. |
| `src/infrastructure/expo/ui/ImageJourney.tsx` | Nuevo: pareja vertical, fallback, feedback de pulsación y fundido. |
| `src/infrastructure/expo/ui/TrainingSession.tsx` | Montar modo inmersivo; mantener hooks y chat existente. |
| `src/infrastructure/expo/ui/ChallengeView.tsx` | Excluir explícitamente viaje del renderer de retos simples. |
| `src/infrastructure/expo/content/campo_semantico.yaml` | Sustituir ejemplo por guion + grafo completo (apéndice A). |
| `src/infrastructure/expo/content/campo_semantico/viaje-palabras/images/*.jpg` | Nuevos: 80 originales individuales, catálogo apéndice B. |
| `src/infrastructure/expo/content/campo_semantico/viaje-palabras/images/images.md` | Nuevo: prompt base, prompts por archivo, procedencia, revisión y medidas reales. |
| `src/infrastructure/expo/content/campo-semantico-images.ts` | Nuevo: registro literal generado desde catálogo, sin requires dinámicos. |
| `src/infrastructure/expo/content/content-images.ts` | Recorrer todas las opciones de todos los nodos y componer registro. |
| `src/infrastructure/expo/content/yaml-content-repository.ts` | Pasar el namespace seleccionado al resolver. |
| `src/infrastructure/expo/storage/async-storage-progress-repository.ts` | Clave opcional y cola por clave, training compatible. |
| `src/infrastructure/expo/App.tsx` | Inyectar resolver y almacenamiento del contenido seleccionado. |
| `tests/fixtures/journey.ts` | Nuevo: fixture pequeña pero con seis capas para pruebas de dominio/UI. |
| `tests/components/ImageJourney.test.tsx` | Nuevo: interacciones de tarjeta, bloqueo, fallback, texto accesible. |
| `tests/components/TrainingSession.journey.test.tsx` | Nuevo: integración J01–J08 usando reloj y viewport controlados. |
| `tests/integration/campo-semantico.test.ts` | Nuevo: YAML real, 64 rutas, progreso y manifiesto. |
| `tests/integration/progress-namespaces.test.ts` | Nuevo: aislamiento y escrituras serializadas. |
| `tests/components/App.test.tsx` | Reemplazar expectativa del ejemplo por apertura real, mantener error de query. |
| `tests/integration/content-and-restore.test.ts` | Actualizar únicamente identidad/texto del ejemplo sustituido. |
| `docs/ux/UX-001-conversacion-y-scroll.md` | Añadir sección acotada UX-J, no reescribir R01–R10. |
| `docs/ux/verification.md`, `src/infrastructure/expo/content/README.md` | Documentar resultados reales y autoría de contenido. |

No modificar `training.yaml`, los dos JPG de la demo, `image-choice-demo.yaml`, la política/driver de scroll, `package.json` ni lockfile. Un fallo de tipado en una prueba que usa `Challenge.options` se resuelve estrechando a `SingleChoiceChallenge`, no añadiendo `options` falsos a un viaje.

## 2. Modelo editorial cerrado

### IDs y capas

`layer` identifica el tap pendiente (1…6), no la cantidad de palabras ya escogidas. Nodo raíz `l1-viaje`. Al elegir NIEVE se entra en `l2-nieve`, que ofrece REFUGIO/HIELO. Al elegir REFUGIO se entra en `l3-refugio`, etc. En capa seis las opciones tienen `ending` en vez de `next`. Una palabra repetida en otra capa tiene otro ID.

Cada opción tiene ID global `${node.id}-${slugDePalabra}` y archivo `${option.id}.jpg`. Ejemplo: `l5-huellas-rio` muestra RÍO y lleva a `l6-rio`. No usar la etiqueta como identificador ni quitar acentos al presentar al jugador.

| Nodo (tap pendiente) | Izquierda | Derecha |
| --- | --- | --- |
| l1-viaje | NIEVE → l2-nieve | PLAYA → l2-playa |
| l2-nieve | REFUGIO → l3-refugio | HIELO → l3-hielo |
| l2-playa | MAR → l3-mar | ARENA → l3-arena |
| l3-refugio | VENTANA → l4-ventana | FUEGO → l4-fuego |
| l3-hielo | LAGO → l4-lago | CUMBRE → l4-cumbre |
| l3-mar | BARCA → l4-barca | OLEAJE → l4-oleaje |
| l3-arena | DUNAS → l4-dunas | ACANTILADO → l4-acantilado |
| l4-ventana | HUELLAS → l5-huellas | BOSQUE → l5-bosque |
| l4-fuego | HUMO → l5-humo | CHISPAS → l5-chispas |
| l4-lago | ORILLA → l5-orilla | ISLA → l5-isla |
| l4-cumbre | CIELO → l5-cielo | ROCA → l5-roca |
| l4-barca | REMOS → l5-remos | HORIZONTE → l5-horizonte |
| l4-oleaje | ESPUMA → l5-espuma | CORRIENTE → l5-corriente |
| l4-dunas | VIENTO → l5-viento | ALTURA → l5-altura |
| l4-acantilado | VACÍO → l5-vacio | PARED → l5-pared |
| l5-huellas | RÍO → l6-rio | MONTAÑA → l6-montana |
| l5-bosque | RÍO → l6-rio | MONTAÑA → l6-montana |
| l5-humo | CIELO → l6-cielo | MONTAÑA → l6-montana |
| l5-chispas | CIELO → l6-cielo | MONTAÑA → l6-montana |
| l5-orilla | AGUA → l6-agua | BARCA → l6-barca |
| l5-isla | AGUA → l6-agua | ROCA → l6-roca |
| l5-cielo | AIRE → l6-aire | ROCA → l6-roca |
| l5-roca | ALTURA → l6-altura | PARED → l6-pared |
| l5-remos | BARCA → l6-barca | AGUA → l6-agua |
| l5-horizonte | AIRE → l6-aire | AGUA → l6-agua |
| l5-espuma | AGUA → l6-agua | BARCA → l6-barca |
| l5-corriente | AGUA → l6-agua | BARCA → l6-barca |
| l5-viento | AIRE → l6-aire | ALTURA → l6-altura |
| l5-altura | AIRE → l6-aire | PARED → l6-pared |
| l5-vacio | AIRE → l6-aire | PARED → l6-pared |
| l5-pared | ALTURA → l6-altura | ROCA → l6-roca |
| l6-rio | NADAR | REMAR |
| l6-montana | TREPAR | VOLAR |
| l6-cielo | VOLAR | TREPAR |
| l6-agua | NADAR | REMAR |
| l6-barca | REMAR | NADAR |
| l6-aire | VOLAR | TREPAR |
| l6-altura | VOLAR | TREPAR |
| l6-pared | TREPAR | VOLAR |
| l6-roca | TREPAR | VOLAR |

40 nodos de decisión, 80 opciones contextuales, 64 recorridos completos. La última fila es la reparación explícita de la omisión de la fuente. No recortar ramas ni convertir ROCA en terminal.

### Guion completo y ritmo

Los textos de apertura se adaptan a la interfaz; no son una transcripción literal de todas las alternativas propuestas en el chat. La cuarteta final sí conserva la última propuesta. No se certifica métrica con un analizador inexistente.

1. Voz, cuarteta: `Ya se ha marchado la gente,\nqueda el eco del rival;\nte levantas lentamente:\ntu silencio fue el final.`
2. Inicio `LEVANTARME` arranca la sesión y produce una burbuja `No me han dado ningún golpe. Me quedé sin palabras delante de todos.`. Para que el inicio sea una acción real, el reducer consume el primer `student` junto con START **solo si** la lección declara `startWithStudent: true` (ver tarea 4). No duplicar dos botones LEVANTARME.
3. Voz: `Ya no queda aquí tu gente,\nni el rival que te venció;\npero ves, sorprendentemente,\nun papel que alguien dejó.`
4. Acción `VER NOTA` → jugador: `Recojo el papel y leo: «Si quieres saber por qué has perdido, encuéntrame».`
5. Nota (mestre del reto): `No busques una respuesta correcta. Elige lo que te sugiera cada imagen y sigue el viaje.`
6. Acción `EMPEZAR EL VIAJE` → jugador: `Cierro los ojos. Esta vez voy a dejar que una palabra me lleve a otra.`
7. Pantalla de parejas, seis taps, sin texto de maestro. El `mestre` del reto se proyecta **antes** de la acción del punto 6; representarlo como un mestre normal del script y dar al viaje `mestre` vacío opcional/no proyectado, no repetirlo. El esquema definitivo de tarea 1 no tiene campo `mestre` en `image-journey`.
8. Negro breve; maestro: `Un viaje fue tu partida,\ncada elección, un lugar;\nuna palabra dio vida\na otra, hasta {VERBO}.`
9. Recorrido, como mensaje del jugador sin acción, con etiqueta `Tu recorrido`: `VIAJE → {seis palabras reales}`.
10. Maestro, explicación: `Eso es un campo semántico: palabras conectadas por su significado. Aquí lo hemos explorado como una cadena de asociaciones: una palabra te sugiere otra, aunque cambies de paisaje. No tienen que rimar.\n\nEn la batalla te quedaste en blanco. No te aferres a la palabra que te dan: úsala para encontrar la siguiente.`
11. Maestro, cierre de lección: `Ya has encontrado el camino. Soy quien dejó la nota. Si quieres volver al ring, puedo enseñarte a seguir encontrando palabras.`
12. Tarjeta final propia: título `El rastro de las palabras`, texto `Has recorrido seis elecciones y descubierto cómo seguir una asociación.`, acción `Volver a viajar` (reinicio explícito). No CTA a lección futura ni contador «1 retos superados».

---

### Task 1: Definir y validar el reto compuesto

**Files:** crear `src/domain/image-journey.ts`, `src/domain/image-journey.test.ts`, `tests/fixtures/journey.ts`; modificar `src/domain/schemas.ts` y `src/domain/challenge.ts`.

**Interfaces:** produce `ImageJourneyChallenge`, `JourneyNode`, `JourneyOption`, `JourneyReplay`, `imageJourneySchema`, `replayJourney(challenge, optionIds): JourneyReplay | null`, `journeyOptions(challenge, optionIds): JourneyOption[]`. Los IDs son strings; ninguna API recibe etiquetas. Consume solo Zod.

- [ ] **1. Escribir fixture mínima y pruebas rojas.** Fixture de seis capas, dos terminales alcanzables por cada rama, IDs únicos. Crear la fixture como abajo antes de producción; el archivo no importa infraestructura.

```ts
// tests/fixtures/journey.ts
import type { ImageJourneyChallenge } from '../../src/domain/image-journey';
import type { Lesson } from '../../src/domain/schemas';
export const journey: ImageJourneyChallenge = {
  type: 'image-journey', id: 'viaje-palabras', startNodeId: 'n1',
  nodes: Array.from({ length: 6 }, (_, i) => ({
    id: `n${i + 1}`, layer: i + 1,
    options: ['a', 'b'].map((side, sideIndex) => ({
      id: `n${i + 1}-${side}`,
      text: i === 5 ? ['NADAR', 'REMAR'][sideIndex] : `PASO${i + 1}${side.toUpperCase()}`,
      image: { file: `n${i + 1}-${side}.jpg`, description: `Camino ${side} de la etapa ${i + 1}` },
      ...(i === 5 ? { ending: sideIndex === 0 ? 'nadar' as const : 'remar' as const }
        : { next: `n${i + 2}` }),
    })),
  })),
  revelation: 'Un viaje fue tu partida,\ncada elección, un lugar;\nuna palabra dio vida\na otra, hasta {VERBO}.',
  teaching: 'Eso es un campo semántico. Una palabra te sugiere otra; no tienen que rimar.',
};
export const journeyLesson: Lesson = {
  id: 'journey-test-v1', startAction: 'LEVANTARME', startWithStudent: true,
  script: [
    { type: 'mestre', text: 'Has perdido la batalla.', label: 'Voz' },
    { type: 'student', action: 'LEVANTARME', text: 'Me quedé sin palabras.' },
    { type: 'mestre', text: 'Encuentras una nota.', label: 'Voz' },
    { type: 'student', action: 'VER NOTA', text: 'Leo la nota.' },
    { type: 'mestre', text: 'Elige sin buscar aciertos.', label: 'Nota' },
    { type: 'student', action: 'EMPEZAR EL VIAJE', text: 'Cierro los ojos.' },
    journey,
  ],
  completion: 'Puedo enseñarte a seguir encontrando palabras.',
};
```

```ts
// src/domain/image-journey.test.ts
import { expect, test } from '@jest/globals';
import { journey } from '../../tests/fixtures/journey';
import { imageJourneySchema, replayJourney, journeyOptions } from './image-journey';

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
```

- [ ] **2. Ejecutar rojo:** `npx jest --runInBand src/domain/image-journey.test.ts`. Debe fallar por módulo nuevo; registrar salida.
- [ ] **3. Implementar el módulo puro completo.** El refinamiento debe ejecutarse antes de cargar una lección; no validar recursivamente sin cota.

```ts
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
```

- [ ] **4. Incorporar el tipo al esquema de lección.** Importar `imageJourneySchema` y `ImageJourneyChallenge` en `schemas.ts`; incluirlo en `scriptItemSchema`; ampliar `Challenge` y `isChallenge`. Añadir `label: nonempty.optional()` al objeto mestre y `startWithStudent: z.boolean().optional()` a la lección. Refinar las lecciones con viaje: exactamente un viaje, último ítem del script, sin otros retos; `startWithStudent` requiere primer elemento mestre y segundo student cuya action coincide con startAction. Este incremento no pretende soportar múltiples viajes y pruebas de examen dentro de la misma lección.

```ts
// Dentro del superRefine de lessonSchema, después de las reglas existentes:
const journeys = lesson.script.filter(item => item.type === 'image-journey');
if (journeys.length && (journeys.length !== 1 || challenges.length !== 1 || lesson.script.at(-1)?.type !== 'image-journey'))
  ctx.addIssue({ code: 'custom', message: 'El viaje debe ser el único reto y cerrar el guion' });
if (lesson.startWithStudent) {
  const firstReply = lesson.script[1];
  if (lesson.script[0]?.type !== 'mestre' || firstReply?.type !== 'student' || firstReply.action !== lesson.startAction)
    ctx.addIssue({ code: 'custom', message: 'startWithStudent requiere respuesta inicial coincidente' });
}
```

Declaraciones finales en `schemas.ts` (conservar los otros exports):

```ts
export type Challenge = SingleChoiceChallenge | ImageChoiceChallenge | ImageJourneyChallenge;
export function isChallenge(step: LessonStep): step is Challenge {
  return step.type === 'single-choice' || step.type === 'image-choice' || step.type === 'image-journey';
}
```

En `challenge.ts`, cambiar únicamente el parámetro a `SingleChoiceChallenge | ImageChoiceChallenge`; el viaje se evalúa con historial en tarea 2. No añadir un resultado «completed» para cualquier opción de viaje. Las llamadas de `lesson.ts` deben estrechar el tipo antes de llamar al evaluador.

- [ ] **5. Verde y revisión:** ejecutar test nuevo y `npx jest --runInBand src/domain/schemas.test.ts src/domain/challenge.test.ts`; corregir únicamente discriminación en consumidores. `rg -n 'challenge\.options|challenge\.mestre|Challenge\[' src tests` identifica accesos que necesitan `type !== 'image-journey'`. El cierre de tipado del conjunto se completa en tareas 2–5; no esconder errores con `as any`.
- [ ] **6. Commit de esta tarea**, solo archivos enumerados, mensaje `feat: model six-step image journeys`.

### Task 2: Progreso, replay y restauración sin inventar elecciones

**Files:** `src/domain/lesson.ts`, `src/domain/lesson.test.ts`. `lesson-progress.ts` no necesita nuevos campos.

**Interfaces:** conserva `submitChallengeAnswer(lesson, progress, optionId): LessonProgress` y `restoreProgress(lesson, raw): LessonProgress`. Consume `replayJourney`. Produce seis entradas de historial y una sola entrada de `completed`, tras la sexta decisión.

- [ ] **1. Añadir pruebas rojas de recorrido y guardado.** Importar fixture y funciones existentes; no comparar snapshots masivos.

```ts
import { journeyLesson } from '../../tests/fixtures/journey';
// Añadir a lesson.test.ts con sus imports expect/test existentes.
test('J06: restaura cada profundidad 0–6 y completa solo al final', () => {
  let progress = { ...initialProgress(journeyLesson), started: true };
  for (let depth = 0; depth <= 6; depth++) {
    expect(restoreProgress(journeyLesson, JSON.parse(JSON.stringify(progress)))).toEqual(progress);
    expect(progress.completed).toEqual(depth === 6 ? ['viaje-palabras'] : []);
    expect(progress.history).toHaveLength(depth);
    if (depth < 6) progress = submitChallengeAnswer(journeyLesson, progress, `n${depth + 1}-a`);
  }
  expect(submitChallengeAnswer(journeyLesson, progress, 'n6-b')).toBe(progress);
});
test('J03: una opción vieja no consume una nueva decisión', () => {
  const fresh = { ...initialProgress(journeyLesson), started: true };
  const once = submitChallengeAnswer(journeyLesson, fresh, 'n1-a');
  expect(submitChallengeAnswer(journeyLesson, once, 'n1-a')).toBe(once);
  expect(submitChallengeAnswer(journeyLesson, once, 'n3-a')).toBe(once);
});
test('J06: no fabrica final a partir de completed sin historial', () => {
  const fresh = initialProgress(journeyLesson);
  expect(restoreProgress(journeyLesson, { ...fresh, started: true, completed: ['viaje-palabras'] })).toEqual(fresh);
  expect(restoreProgress(journeyLesson, {
    ...fresh, started: true, history: [{ challengeId: 'viaje-palabras', optionId: 'n3-a' }],
  })).toEqual(fresh);
  expect(restoreProgress(journeyLesson, { ...fresh, lessonId: 'otra' })).toEqual(fresh);
});
```

- [ ] **2. Rojo:** `npx jest --runInBand src/domain/lesson.test.ts`. Registrar fallo por completar antes de seis o acceso a options.
- [ ] **3. Añadir rama del viaje antes del evaluador simple.** En `submitChallengeAnswer`, después de verificar started y challenge:

```ts
if (challenge.type === 'image-journey') {
  const ids = progress.history.filter(entry => entry.challengeId === challenge.id).map(entry => entry.optionId);
  const next = replayJourney(challenge, [...ids, optionId]);
  if (!next) return progress;
  return {
    ...progress,
    completed: next.ending ? [...progress.completed, challenge.id] : progress.completed,
    history: [...progress.history, { challengeId: challenge.id, optionId }],
  };
}
```

- [ ] **4. Restaurar viaje mediante replay estricto separado.** En `restoreProgress`, después de parse y comprobación de lessonId, antes del algoritmo lineal existente:

```ts
const journey = challengesOf(lesson).find(item => item.type === 'image-journey');
if (journey?.type === 'image-journey') {
  if (!saved.started) return saved.completed.length || saved.history.length ? fresh : saved;
  if (saved.history.some(entry => entry.challengeId !== journey.id)) return fresh;
  const replay = replayJourney(journey, saved.history.map(entry => entry.optionId));
  if (!replay) return fresh;
  const expected = replay.ending ? [journey.id] : [];
  if (saved.completed.length !== expected.length || saved.completed.some((id, index) => id !== expected[index])) return fresh;
  return saved;
}
```

El algoritmo lineal posterior queda intacto: mantiene logros aunque cambie la respuesta correcta, soporta legacy `sessionId`, y permite historial saneado. El nuevo viaje usa ID versionado y exige historial porque necesita saber qué camino ocurrió. Cambios futuros de topología incrementarán el ID de lección; cambiar texto o JPEG conservando IDs no reinicia rutas. El resumen siempre usa las etiquetas editoriales actuales, porque se guardan IDs y no versiones históricas de texto.

- [ ] **5. Añadir corrupción específica:** terminal con cinco entradas; seis entradas sin completed; siete entradas; dos identidades sessionId/lessonId; una opción válida de la otra rama real. Todas deben volver a `initialProgress` para viaje. Añadir un caso legacy válido que siga pasando con training, no redefinir sus expectativas.
- [ ] **6. Verde:** `npx jest --runInBand src/domain/lesson.test.ts tests/integration/content-and-restore.test.ts`; ejecutar también `npm run test:engine` porque hay pruebas Node que consumen los tipos públicos.
- [ ] **7. Commit:** `feat: persist and replay branching journey choices`, limitado a los archivos de esta tarea.

### Task 3: Proyectar el cierre a partir del camino real

**Files:** nuevo `src/application/journey-messages.ts` y `src/application/journey-messages.test.ts`; modificar `src/application/message-projector.ts` y sus tests.

**Interfaces:** `journeyMessages(challenge: ImageJourneyChallenge, optionIds: readonly string[]): Message[]`; devuelve `[]` hasta un terminal válido, después exactamente revelación, ruta y explicación. IDs estables `${id}-revelation`, `${id}-route`, `${id}-teaching`.

- [ ] **1. Pruebas rojas.** Para los cuatro verbos usar fixture clonada y cambiar en el último nodo el ending y text de `n6-a` coherentemente; no probar solo una sustitución literal sin replay.

```ts
import { expect, test } from '@jest/globals';
import { journey } from '../../tests/fixtures/journey';
import { journeyMessages } from './journey-messages';
const ids = ['n1-a', 'n2-a', 'n3-a', 'n4-a', 'n5-a', 'n6-a'];
test.each(['nadar', 'remar', 'volar', 'trepar'] as const)('J05: cierre real %s', ending => {
  const content = structuredClone(journey);
  content.nodes[5].options[0].ending = ending;
  content.nodes[5].options[0].text = ending.toUpperCase();
  const messages = journeyMessages(content, ids);
  expect(messages.map(message => message.id)).toEqual(['viaje-palabras-revelation', 'viaje-palabras-route', 'viaje-palabras-teaching']);
  expect(messages[0].text).toBe(`Un viaje fue tu partida,\ncada elección, un lugar;\nuna palabra dio vida\na otra, hasta ${ending.toUpperCase()}.`);
  expect(messages[1].text).toBe(`VIAJE → PASO1A → PASO2A → PASO3A → PASO4A → PASO5A → ${ending.toUpperCase()}`);
  expect(messages[2].text).toContain('no tienen que rimar');
});
test('J02: no hay burbujas de decisiones incompletas ni camino inventado', () => {
  expect(journeyMessages(journey, ids.slice(0, 5))).toEqual([]);
  expect(journeyMessages(journey, ['n3-a'])).toEqual([]);
});
```

- [ ] **2. Rojo:** `npx jest --runInBand src/application/journey-messages.test.ts`.
- [ ] **3. Implementar módulo.** No reemplazar tokens en todos los mensajes ni guardar resultado renderizado en storage.

```ts
import { replayJourney, type ImageJourneyChallenge } from '../domain/image-journey';
import type { Message } from './messages';
export function journeyMessages(challenge: ImageJourneyChallenge, optionIds: readonly string[]): Message[] {
  const replay = replayJourney(challenge, optionIds);
  if (!replay?.ending) return [];
  return [
    { id: `${challenge.id}-revelation`, role: 'mestre', kind: 'verse', label: 'Maestro',
      text: challenge.revelation.replace('{VERBO}', replay.ending.toUpperCase()) },
    { id: `${challenge.id}-route`, role: 'player', label: 'Tu recorrido', text: ['VIAJE', ...replay.words].join(' → ') },
    { id: `${challenge.id}-teaching`, role: 'mestre', label: 'Maestro', text: challenge.teaching },
  ];
}
```

- [ ] **4. Integrar proyección antes del acceso `challenge.mestre`.** En bloque mestre copiar también `label: item.label`. En viaje, no añadir `-mestre`, respuestas ni feedback por entrada de history:

```ts
if (challenge.type === 'image-journey') {
  messages.push(...journeyMessages(challenge,
    progress.history.filter(entry => entry.challengeId === challenge.id).map(entry => entry.optionId)));
  challengeIndex += 1;
  if (challengeIndex > progress.completed.length) break;
  continue;
}
```

Mantener completion existente (será la invitación final del maestro). Las cuatro entradas del cierre completo son revelación, ruta, enseñanza y completion. Al no haber otras ramas en la lección, el prefijo antes del viaje no cambia.

- [ ] **5. Prueba del prefijo de proyección:** construir progreso a profundidad cinco y seis con `submitChallengeAnswer`; comprobar que `messagesFor` antes es prefijo exacto de después, que no hay textos `PASO1A` sueltos y que completion aparece una vez. Probar que antes de START solo aparece la apertura y que `label: Voz` se propaga.

```ts
const before = messagesFor(journeyLesson, partial);
const after = messagesFor(journeyLesson, finished);
expect(after.slice(0, before.length)).toEqual(before);
expect(after.slice(before.length).map(message => message.id)).toEqual([
  'viaje-palabras-revelation', 'viaje-palabras-route', 'viaje-palabras-teaching', 'completion',
]);
expect(after.filter(message => message.text === 'PASO1A')).toEqual([]);
```

`partial` se construye empezado y aplicando `n1-a`…`n5-a`; `finished = submitChallengeAnswer(journeyLesson, partial, 'n6-a')`. No crear fixtures que salten el dominio.

- [ ] **6. Verde:** `npx jest --runInBand src/application/journey-messages.test.ts src/application/message-projector.test.ts tests/unit/session-prefix.test.ts`.
- [ ] **7. Commit:** `feat: reveal semantic journey from actual choices`.

### Task 4: Coordinar inicio narrativo, modo inmersivo y salida sin duplicados

**Files:** `src/application/conversation-flow.ts`, `src/application/conversation-flow.test.ts`; preparar prueba roja de interacción `tests/components/TrainingSession.journey.test.tsx` para tarea 5.

**Interfaces:** ampliar `Phase` con `'waiting-journey' | 'journey-transition'`; ampliar `FlowEvent` con `{ type: 'JOURNEY_ANSWER'; optionId: string; nodeId: string; token: number }` y `{ type: 'JOURNEY_SETTLED'; token: number }`. `FlowState` no necesita guardar otro cursor. `phaseFor` distingue el reto pendiente por discriminante.

- [ ] **1. Reproducir fallo de interacción antes de cambiar flujo/UI:** montar `TrainingSession` con fixture y progreso empezado + `n1-a`, `restored=true`; esperar dos opciones del nodo n2 y ausencia de chat. La UI actual falla o no renderiza viaje. Registrar rojo y mantener esta prueba para tarea 5.

```tsx
test('J02/J06: reanuda viaje sin repetir la nota ni opciones anteriores', async () => {
  const progress = submitChallengeAnswer(journeyLesson,
    { ...initialProgress(journeyLesson), started: true }, 'n1-a');
  await render(<TrainingSession lesson={journeyLesson} initialProgress={progress}
    restored onProgressChange={() => {}} resolveImage={() => 1}
    viewportController={createControlledViewport().controller} />);
  expect(screen.getByRole('button', { name: 'PASO2A' })).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'PASO2B' })).toBeOnTheScreen();
  expect(screen.queryByText('Encuentras una nota.')).not.toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'PASO1A' })).not.toBeOnTheScreen();
});
```

- [ ] **2. Tests rojos del reducer.** Los casos siguientes usan createFlow con progreso empezado, restaurado y una primera elección para entrar directamente al modo visual. Añadir imports de replayJourney/journeyLesson/submitChallengeAnswer.

```ts
test('J03: doble evento y settle antiguo se ignoran', () => {
  const p = submitChallengeAnswer(journeyLesson, { ...initialProgress(journeyLesson), started: true }, 'n1-a');
  const state = createFlow(journeyLesson, p, true);
  expect(state.phase).toBe('waiting-journey');
  const event = { type: 'JOURNEY_ANSWER' as const, optionId: 'n2-a', nodeId: 'n2', token: state.token };
  const once = reduceFlow(journeyLesson, state, event);
  expect(once.phase).toBe('journey-transition');
  expect(once.progress.history).toHaveLength(2);
  expect(reduceFlow(journeyLesson, once, event)).toBe(once);
  const next = reduceFlow(journeyLesson, once, { type: 'JOURNEY_SETTLED', token: once.token });
  expect(next.phase).toBe('waiting-journey');
  expect(reduceFlow(journeyLesson, next, event)).toBe(next);
  const reset = reduceFlow(journeyLesson, once, { type: 'RESET' });
  expect(reduceFlow(journeyLesson, reset, { type: 'JOURNEY_SETTLED', token: once.token })).toBe(reset);
});
```

Añadir test de sexta elección: antes del settle no se escribe la revelación; después phase writing y `messages[revealed].id === 'viaje-palabras-revelation'`. Tras cuatro MESSAGE_DONE válidos, phase finished. Mensajes completos, tokens antiguos o mostrar completo repetido no deben saltar ninguna fase.

- [ ] **3. Rojo:** `npx jest --runInBand src/application/conversation-flow.test.ts tests/components/TrainingSession.journey.test.tsx`.
- [ ] **4. Modificar `phaseFor` después de finished:**

```ts
const pendingChallenge = challengesOf(lesson)[state.progress.completed.length];
return pendingChallenge?.type === 'image-journey' ? 'waiting-journey' : 'waiting-choice';
```

- [ ] **5. Añadir eventos al reducer.** Importar replayJourney. Procesar antes o dentro del switch existente:

```ts
case 'JOURNEY_ANSWER': {
  if (state.phase !== 'waiting-journey' || event.token !== state.token) return state;
  const challenge = challengesOf(lesson)[state.progress.completed.length];
  if (challenge?.type !== 'image-journey') return state;
  const replay = replayJourney(challenge,
    state.progress.history.filter(entry => entry.challengeId === challenge.id).map(entry => entry.optionId));
  if (!replay || replay.nodeId !== event.nodeId) return state;
  const progress = submitChallengeAnswer(lesson, state.progress, event.optionId);
  if (progress === state.progress) return state;
  return { ...state, progress, messages: messagesFor(lesson, progress),
    phase: 'journey-transition', token: state.token + 1, pending: null };
}
case 'JOURNEY_SETTLED': {
  if (state.phase !== 'journey-transition' || event.token !== state.token) return state;
  const next = { ...state, token: state.token + 1 };
  const phase = phaseFor(lesson, next);
  return { ...next, phase,
    anchorId: phase === 'writing' ? next.messages[next.revealed]?.id ?? next.anchorId : next.anchorId };
}
```

No avanzar `revealed` durante el viaje: no se han presentado nuevos mensajes. Guardar progreso en el tap aceptado, antes de animar; así una recarga durante negro no pierde la sexta elección.

- [ ] **6. START con respuesta inicial, limitado a startWithStudent.** Mantener la rama START de training intacta por defecto. Si `lesson.startWithStudent` es true, construir nextProgress/nextMessages, localizar el primer student en `state.revealed`, y entrar en pressing con `controlId: 'start'`. La UI proporcionará target del botón inicio. No persistir started hasta MOVE_DONE, igual que el resto de respuestas.

```ts
// En case START, después de crear progress y messages, antes del return normal:
if (lesson.startWithStudent) {
  const message = messages[state.revealed];
  if (message?.role !== 'player' || !message.action) return state;
  return { ...state, phase: 'pressing', token: state.token + 1,
    pending: { nextProgress: progress, nextMessages: messages,
      messageId: message.id, controlId: 'start' } };
}
```

- [ ] **7. Recarga antes del viaje.** En createFlow, calcular `replayIntro = restored && lesson.startWithStudent && progress.history.length === 0 && progress.completed.length === 0`. Para ese caso usar `initialProgress(lesson)` como progreso efectivo y revealed 0. No ocultar esta decisión: el plan la limita a la nueva lección y la prueba debe verificar que reaparece LEVANTARME tras escribir apertura. Para los demás casos, restauración actual. No fabricar burbujas de acciones que nunca se pulsaron.

```ts
const replayIntro = restored && lesson.startWithStudent && !progress.history.length && !progress.completed.length;
const effectiveProgress = replayIntro ? initialProgress(lesson) : progress;
const messages = messagesFor(lesson, effectiveProgress);
const revealed = restored && !replayIntro ? messages.length : 0;
// El resto de createFlow usa progress: effectiveProgress.
```

- [ ] **8. Verde dirigido de reducer.** Las pruebas UI rojas se resuelven en tarea 5; no marcarlas skip. Documentar la dependencia si se hace commit intermedio. `npx jest --runInBand src/application/conversation-flow.test.ts tests/unit/conversationFlow.test.ts`.
- [ ] **9. Commit:** `feat: coordinate immersive journey transitions`.

### Task 5: Dos fotografías inmersivas e integración con conversación

**Files:** crear `src/infrastructure/expo/ui/ImageJourney.tsx`, `tests/components/ImageJourney.test.tsx`; modificar `TrainingSession.tsx`, `ChallengeView.tsx`; completar `tests/components/TrainingSession.journey.test.tsx`.

**Interfaces:** `ImageJourney({ challengeId, node, locked, selectedOptionId, token, reducedMotion, resolveImage, onAnswer, onSettled })`; `onAnswer(optionId: string, nodeId: string, token: number): void`, `onSettled(token: number): void`. No recibe LessonProgress ni conoce AsyncStorage. `node` es la pareja que se está mostrando, incluso mientras se desvanece tras pulsar.

- [ ] **1. Tests rojos de componente.** Copiar setup/teardown de `TrainingSession.test.tsx`: fake timers, cleanup async, restaurar mocks. No ejecutar un `runAllTimers` infinito con intervalos del chat. El componente nuevo no debe crear intervalos.

```tsx
import { expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { ImageJourney } from '../../src/infrastructure/expo/ui/ImageJourney';
import { journey } from '../fixtures/journey';
beforeEach(() => { jest.useFakeTimers(); });
afterEach(async () => { await cleanup(); jest.clearAllTimers(); jest.useRealTimers(); });

test('J02/J07: dos opciones accesibles y la foto fallida sigue seleccionable', async () => {
  const onAnswer = jest.fn();
  await render(<ImageJourney challengeId={journey.id} node={journey.nodes[0]}
    locked={false} token={9} reducedMotion={false} resolveImage={() => 1}
    onAnswer={onAnswer} onSettled={() => {}} />);
  expect(screen.getAllByRole('button')).toHaveLength(2);
  await fireEvent(screen.getByTestId('journey-photo-n1-a'), 'error');
  expect(screen.getByText('Imagen no disponible')).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole('button', { name: 'PASO1A' }));
  expect(onAnswer).toHaveBeenCalledWith('n1-a', 'n1', 9);
});
test('J03/J08: bloqueado no responde y movimiento reducido finaliza una vez', async () => {
  const onAnswer = jest.fn(); const onSettled = jest.fn();
  await render(<ImageJourney challengeId={journey.id} node={journey.nodes[0]}
    locked selectedOptionId="n1-a" token={10} reducedMotion resolveImage={() => 1}
    onAnswer={onAnswer} onSettled={onSettled} />);
  expect(screen.getByRole('button', { name: 'PASO1B' })).toBeDisabled();
  await fireEvent.press(screen.getByRole('button', { name: 'PASO1B' }));
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(onAnswer).not.toHaveBeenCalled();
  expect(onSettled).toHaveBeenCalledTimes(1);
  expect(onSettled).toHaveBeenCalledWith(10);
});
```

- [ ] **2. Rojo:** `npx jest --runInBand tests/components/ImageJourney.test.tsx tests/components/TrainingSession.journey.test.tsx`.
- [ ] **3. Crear renderer separado.** Mantener 9:16 en el marco de la foto, no en toda la tarjeta con texto. Igual ancho mediante flex; sin height fijo que recorte la palabra con texto ampliado. Los dos hijos de una fila usan stretch. El scroll exterior resuelve pantallas bajas. La transición dura aproximadamente 280 ms como detalle implementativo; no convertir su valor en requisito UX.

```tsx
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { JourneyNode, JourneyOption } from '../../../domain/image-journey';
import type { ChallengeImageResolver } from '../content/content-images';
import { colors as c } from './theme';
type Props = {
  challengeId: string; node: JourneyNode; locked: boolean; selectedOptionId?: string;
  token: number; reducedMotion: boolean; resolveImage: ChallengeImageResolver;
  onAnswer: (optionId: string, nodeId: string, token: number) => void;
  onSettled: (token: number) => void;
};
export function ImageJourney(props: Props) {
  const { locked, token, reducedMotion, onSettled } = props;
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    opacity.setValue(1);
    if (!locked) return;
    if (reducedMotion) {
      const timer = setTimeout(() => onSettled(token), 0);
      return () => clearTimeout(timer);
    }
    const animation = Animated.sequence([
      Animated.delay(80),
      Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.delay(80),
    ]);
    animation.start(({ finished }) => { if (finished) onSettled(token); });
    return () => animation.stop();
  }, [locked, onSettled, opacity, reducedMotion, token]);
  return <View testID="image-journey" style={s.stage}>
    <Animated.View style={[s.body, { opacity }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.row}>{props.node.options.map(option =>
          <JourneyCard key={option.id} option={option} challengeId={props.challengeId}
            resolveImage={props.resolveImage} locked={locked}
            selected={props.selectedOptionId === option.id}
            onPress={() => props.onAnswer(option.id, props.node.id, token)} />
        )}</View>
      </ScrollView>
    </Animated.View>
  </View>;
}
function JourneyCard({ option, challengeId, resolveImage, locked, selected, onPress }: {
  option: JourneyOption; challengeId: string; resolveImage: ChallengeImageResolver;
  locked: boolean; selected: boolean; onPress: () => void;
}) {
  const [failed, setFailed] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={option.text}
    accessibilityHint={option.image.description} accessibilityState={{ disabled: locked, selected }}
    disabled={locked} onPress={onPress}
    style={({ pressed }) => [s.card, (pressed || selected) && s.selected]}>
    <View style={s.photo}>{failed
      ? <Text style={s.fallback}>Imagen no disponible</Text>
      : <Image testID={`journey-photo-${option.id}`}
          source={resolveImage(challengeId, option.image.file)}
          resizeMode="cover" style={s.image} accessible={false}
          onError={() => setFailed(true)} />}
    </View>
    <Text style={s.word}>{option.text}</Text>
  </Pressable>;
}
const s = StyleSheet.create({
  stage: { flex: 1, backgroundColor: '#000' }, body: { flex: 1 },
  scroll: { flexGrow: 1, padding: 12, justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  card: { flex: 1, minWidth: 0, borderWidth: 2, borderColor: c.border,
    borderRadius: 16, padding: 6, backgroundColor: c.panel, minHeight: 44 },
  selected: { borderColor: c.accent },
  photo: { width: '100%', aspectRatio: 9 / 16, overflow: 'hidden', borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg },
  image: { width: '100%', height: '100%' },
  fallback: { color: c.muted, fontSize: 14, textAlign: 'center', padding: 8 },
  word: { color: c.text, fontSize: 19, fontWeight: '700', textAlign: 'center', marginVertical: 10 },
});
```

No guardar `failed` por palabra global: la key única desmonta la tarjeta anterior. Una imagen ausente del registro es error editorial y lo detecta el repositorio, no el fallback de red/pintura.

- [ ] **4. Integrar en TrainingSession sin returns antes de hooks.** Importar `useCallback`, `ImageJourney` y `replayJourney`; calcular:

```ts
const journey = challenges.find(item => item.type === 'image-journey');
const immersive = state.phase === 'waiting-journey' || state.phase === 'journey-transition';
const journeyIds = journey ? state.progress.history
  .filter(entry => entry.challengeId === journey.id).map(entry => entry.optionId) : [];
const displayIds = state.phase === 'journey-transition' ? journeyIds.slice(0, -1) : journeyIds;
const displayReplay = journey?.type === 'image-journey' ? replayJourney(journey, displayIds) : null;
const displayNode = journey?.type === 'image-journey'
  ? journey.nodes.find(node => node.id === displayReplay?.nodeId) : undefined;
const settleJourney = useCallback((token: number) => {
  dispatch({ type: 'JOURNEY_SETTLED', token });
}, []);
```

El nodo visible durante transición se calcula desde el prefijo ANTERIOR; así se ve la selección que acaba de hacerse y nunca parpadea el nodo siguiente antes del negro. En la sexta elección `challenge` ya es undefined por completed, pero `journey` sigue encontrándose en el catálogo y permite terminar el fundido.

- [ ] **5. Rama de render.** Mantener View raíz y confirmación de reinicio. Conservar el bloque de chat existente montado pero oculto durante el viaje, y añadir ImageJourney como hermano. Ocultar su cabecera normal; mostrar en su lugar un botón discreto de reinicio. El historial y los controles del chat oculto no deben participar en accesibilidad ni recibir eventos. No esconder `storageNotice`: mantener el aviso debajo de la pareja sin impedir elegir.

Primero reemplazar la etiqueta de apertura `<View style={s.viewport}>` por:

```tsx
<View style={[s.viewport, immersive && s.hiddenChat]}
  pointerEvents={immersive ? 'none' : 'auto'}
  accessibilityElementsHidden={immersive}
  importantForAccessibility={immersive ? 'no-hide-descendants' : 'auto'}>
```

Sus hijos y etiqueta de cierre se conservan completos. Añadir `hiddenChat: { display: 'none' }` a StyleSheet. Envolver la cabecera normal en `!immersive && (...)`, con su JSX actual íntegro, y añadir antes de la confirmación de reinicio:

```tsx
{immersive && <Pressable accessibilityRole="button" accessibilityLabel="Reiniciar entrenamiento"
  onPress={() => setConfirmReset(value => !value)} style={s.journeyReset}>
  <Text style={s.resetIcon}>•••</Text>
</Pressable>}
```

Añadir `journeyReset: { alignSelf: 'flex-end', minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginRight: 12 }`. Después del bloque de chat y antes del cierre del View raíz:

```tsx
{immersive && journey?.type === 'image-journey' && displayNode &&
  <ImageJourney challengeId={journey.id} node={displayNode}
    locked={state.phase === 'journey-transition'}
    selectedOptionId={state.phase === 'journey-transition' ? journeyIds.at(-1) : undefined}
    token={state.token} reducedMotion={reducedMotion} resolveImage={resolveImage}
    onAnswer={(optionId, nodeId, token) => dispatch({ type: 'JOURNEY_ANSWER', optionId, nodeId, token })}
    onSettled={settleJourney} />}
{immersive && storageNotice && <Text style={s.notice}>Guardado no disponible · puedes seguir jugando</Text>}
```

El árbol final contiene una instancia del chat y otra del viaje solo cuando está activo. Probar que el chat oculto no es accesible por roles ni teclado. No ocultar la confirmación de reinicio dentro del View de chat.

- [ ] **6. Entrada/salida geométrica.** Al entrar en modo inmersivo llamar `controller.interrupt()` para cortar movimientos pendientes. Al salir llamar `controller.reset()` antes de establecer el ancla en `${journey.id}-revelation`. Usar un effect con ref de modo anterior; colocarlo antes del effect `setAnchor` y añadir `immersive` a sus dependencias para que el ancla se reinstale al volver. No llamar `dispose()` en cada cambio de modo (solo al desmontar). No llamar `moveControl` ni `placeReply` por una elección visual.

```ts
const wasImmersive = useRef(false);
useEffect(() => {
  if (immersive && !wasImmersive.current) controller.interrupt();
  if (!immersive && wasImmersive.current) controller.reset();
  wasImmersive.current = immersive;
}, [controller, immersive]);
// Reemplaza el effect setAnchor actual:
useEffect(() => {
  if (!immersive && state.anchorId) controller.setAnchor(state.anchorId);
}, [controller, immersive, state.anchorId]);
```

- [ ] **7. Botón START con target.** Renderizar inicio tanto en waiting-start como durante su transición; en onPress guardar `target.current = control` antes de START. La rama del botón student excluye `pendingControl === 'start'`. Al empezar la animación, activeMessage debe buscarse también en `state.pending?.nextMessages[state.revealed]` si es inicio; el texto de respuesta aparece solo tras MOVE_DONE. Conservar `id="start"`.

```tsx
{(state.phase === 'waiting-start' || (transition && pendingControl === 'start')) &&
  <Action id="start" label={lesson.startAction} disabled={transition}
    selected={transition && pendingControl === 'start'}
    onPress={control => { target.current = control; dispatch({ type: 'START' }); }} />}
```

- [ ] **8. Estrechar ChallengeView.** Su prop `challenge` pasa a `Exclude<Challenge, { type: 'image-journey' }>`; en TrainingSession comprobar `challenge.type !== 'image-journey'` antes de renderizarlo. No añadir una tercera rama gráfica ahí: el viaje usa su contenedor inmersivo.
- [ ] **9. Tarjeta final específica.** Cuando la lección contiene viaje, sustituir título/texto/action final por los definidos en el guion. Para training mantener exactamente textos y contador existentes.
- [ ] **10. Completar interacciones J01/J03/J05/J08.** Usar reloj/viewport controlados y helpers de abajo. Importar fixture y funciones del dominio. Los helpers se definen en el archivo de test, no se exportan desde producción.

```tsx
async function reveal() {
  const skip = screen.queryByRole('button', { name: 'Mostrar mensaje completo' });
  if (skip) await act(async () => { await fireEvent.press(skip); });
}
async function narrativeTap(label: string, viewport: ReturnType<typeof createControlledViewport>) {
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: label })); });
  await act(async () => { jest.advanceTimersByTime(80); });
  await act(async () => { viewport.finishMove(); });
  await act(async () => { viewport.finishPlacement(); });
  await reveal(); // respuesta del jugador
  await reveal(); // siguiente mensaje de voz/nota, si lo hay
}
```

Recorrido de prueba desde cero: render → reveal apertura → narrativeTap LEVANTARME → assert una burbuja y siguiente maestro → narrativeTap VER NOTA → assert nota → narrativeTap EMPEZAR EL VIAJE → assert image-journey y cero textos del chat → seis selecciones `PASO1A`…`PASO5A`, `NADAR`; después de cada una avanzar reloj 1000 ms dentro de act, comprobar history.length y ausencia de mensaje correcto/incorrecto. Después de la sexta, reveal cuarteta, reveal ruta, reveal explicación, reveal completion → assert texto final y ausencia de opciones.

Añadir doble fireEvent en el MISMO act sobre una referencia de botón n2: history solo crece uno. Capturar onSettled, reiniciar durante transición y ejecutar callback antiguo: no reaparece ruta. Con reducedMotion=true hacer las mismas seis elecciones (timer 0) y obtener mismos mensajes. Añadir fotos que fallen en ambas tarjetas: ambas deben responder.

- [ ] **11. Verde:** `npx jest --runInBand tests/components/ImageJourney.test.tsx tests/components/TrainingSession.journey.test.tsx tests/components/TrainingSession.test.tsx tests/components/ImageChoiceChallenge.test.tsx`; luego `npm run typecheck`. Las regresiones R01/R03/R07/R09 originales conservan aserciones.
- [ ] **12. Commit:** `feat: render immersive image journey and narrative return`.

### Task 6: Publicar el contenido en el registro local y aislar su guardado

**Files:** `campo_semantico.yaml`, `yaml-content-repository.ts`, `content-images.ts`, `App.tsx`, `async-storage-progress-repository.ts`, `tests/integration/progress-namespaces.test.ts`, `tests/integration/campo-semantico.test.ts`, las dos pruebas existentes del contenido alternativo.

**Interfaces:** no cambiar `ContentKey`, query ni `ContentRepository`. `createAsyncStorageProgressRepository(key?: string): ProgressRepository` mantiene argumento omitido compatible. `createChallengeImageResolver(key)` se inyecta tanto a validación como a TrainingScreen.

Esta tarea y tarea 7 constituyen el cierre de composición: el YAML puede probarse con un resolver fake antes de generar arte; la carga productiva real no estará verde hasta registrar todos los JPG. No dejar `() => 1`, URLs remotas o imágenes ficticias en producción para disimular ese límite.

- [ ] **1. Pruebas rojas del contenido real sin depender de assets.** Importar raw YAML y usar `lessonSchema.parse(raw)`. Enumerar las rutas por nodos con DFS acotado; no usar el algoritmo productivo para construir la expectativa de todas las aristas: comprobar además filas específicas de la tabla.

```ts
import { expect, test } from '@jest/globals';
import raw from '../../src/infrastructure/expo/content/campo_semantico.yaml';
import { lessonSchema } from '../../src/domain/schemas';
import { initialProgress, submitChallengeAnswer, restoreProgress } from '../../src/domain/lesson';
import { replayJourney, type ImageJourneyChallenge } from '../../src/domain/image-journey';
function routes(journey: ImageJourneyChallenge, nodeId = journey.startNodeId, prefix: string[] = []): string[][] {
  if (prefix.length >= 6) throw new Error('Grafo excede seis capas');
  const node = journey.nodes.find(item => item.id === nodeId)!;
  return node.options.flatMap(option => option.next
    ? routes(journey, option.next, [...prefix, option.id]) : [[...prefix, option.id]]);
}
test('J04/J06: las 64 rutas reales llegan a seis taps y restauran su final', () => {
  const lesson = lessonSchema.parse(raw);
  const journey = lesson.script.find(item => item.type === 'image-journey');
  if (!journey || journey.type !== 'image-journey') throw new Error('Falta viaje');
  const paths = routes(journey);
  expect(paths).toHaveLength(64);
  const endings = new Set<string>();
  for (const path of paths) {
    expect(path).toHaveLength(6);
    let progress = { ...initialProgress(lesson), started: true };
    for (const option of path) {
      progress = submitChallengeAnswer(lesson, progress, option);
      expect(restoreProgress(lesson, JSON.parse(JSON.stringify(progress)))).toEqual(progress);
    }
    const replay = replayJourney(journey, path)!;
    endings.add(replay.ending!);
    expect(progress.completed).toEqual(['viaje-palabras']);
  }
  expect([...endings].sort()).toEqual(['nadar', 'remar', 'trepar', 'volar']);
  expect(journey.nodes.find(node => node.id === 'l6-roca')?.options.map(option => option.text)).toEqual(['TREPAR', 'VOLAR']);
  const repeated = replayJourney(journey, [
    'l1-viaje-playa', 'l2-playa-mar', 'l3-mar-barca',
    'l4-barca-remos', 'l5-remos-barca', 'l6-barca-remar',
  ]);
  expect(repeated?.words).toEqual(['PLAYA', 'MAR', 'BARCA', 'REMOS', 'BARCA', 'REMAR']);
});
```

Añadir test específico NIEVE→REFUGIO→VENTANA→HUELLAS→RÍO→NADAR; otro PLAYA→ARENA→ACANTILADO→PARED→ROCA→TREPAR. Verificar cadenas exactas con `journeyMessages` y ausencia de la otra rama.

- [ ] **2. Rojo:** `npx jest --runInBand tests/integration/campo-semantico.test.ts`.
- [ ] **3. Copiar el YAML completo del apéndice A.** No generar contenido aleatorio en runtime; el YAML contiene todos los nodos. Usar `|-` para textos con saltos de línea. Mantener ID `campo-semantico-viaje-v1`, namespace `campo_semantico`, challenge `viaje-palabras` como tres conceptos distintos.
- [ ] **4. Recorrer imágenes de todas las ramas.** Modificar únicamente el cuerpo de `validateContentImages`:

```ts
for (const challenge of challengesOf(lesson)) {
  if (challenge.type === 'image-choice') {
    for (const option of challenge.options) resolveImage(challenge.id, option.image.file);
  } else if (challenge.type === 'image-journey') {
    for (const node of challenge.nodes)
      for (const option of node.options) resolveImage(challenge.id, option.image.file);
  }
}
```

Test de integración con resolver spy: debe recibir exactamente las 80 referencias, incluidas `l6-roca-volar.jpg` y una rama PLAYA cuando el primer camino explorado era NIEVE. Resolver al que falta una referencia debe lanzar con namespace/challenge/file.

- [ ] **5. Reparar propagación de namespace.** El código actual llama `createChallengeImageResolver()` sin key tanto en repo como UI. Eso buscaría campo_semantico en training. En `createYamlContentRepository` pasar `createChallengeImageResolver(key)`.

En `ContentApp`, mantener `contentKeyFromSearch` dentro de ErrorBoundary y añadir memoización estable por key. Importar `useMemo` y el resolver. Quitar el `const progress = ...` global, que usaría siempre la misma clave:

```tsx
function ContentApp() {
  const search = Platform.OS === 'web' ? globalThis.location?.search ?? '' : '';
  const key = contentKeyFromSearch(search);
  const content = useMemo(() => createYamlContentRepository(key), [key]);
  const progress = useMemo(() => createAsyncStorageProgressRepository(
    key === 'training' ? 'batalla-de-gallos:progress:v1' : 'batalla-de-gallos:progress:v1:campo_semantico'
  ), [key]);
  const resolveImage = useMemo(() => createChallengeImageResolver(key), [key]);
  return <TrainingScreen key={key} content={content} progress={progress} resolveImage={resolveImage} />;
}
```

No añadir navegación reactiva con history/popstate: el contrato actual selecciona al cargar la página.

- [ ] **6. Guardados aislados y en orden.** Sustituir cola global única por mapa compartido por key. La función conserva retorno y manejo de JSON actual:

```ts
const DEFAULT_KEY = 'batalla-de-gallos:progress:v1';
const queues = new Map<string, Promise<void>>();
export function createAsyncStorageProgressRepository(key = DEFAULT_KEY): ProgressRepository {
  return {
    async load() {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try { return JSON.parse(value); } catch { return null; }
    },
    save(progress: LessonProgress) {
      const next = (queues.get(key) ?? Promise.resolve()).catch(() => {})
        .then(() => AsyncStorage.setItem(key, JSON.stringify(progress)));
      queues.set(key, next);
      return next;
    },
  };
}
```

No borrar ni migrar storage al cargar. Reset guarda progreso inicial solo bajo la clave seleccionada. El catálogo cerrado solo tiene dos claves, por lo que el mapa es acotado en uso real.

- [ ] **7. Test de namespaces.** Usar mock de AsyncStorage del preset, limpiar con `await AsyncStorage.clear()` antes de cada caso. Importar fixture lineal y viaje para no inventar formatos.

```ts
test('J06: alternar contenidos y reiniciar viaje conserva training', async () => {
  const trainingRepo = createAsyncStorageProgressRepository();
  const journeyRepo = createAsyncStorageProgressRepository('batalla-de-gallos:progress:v1:campo_semantico');
  const trainingProgress = { ...initialProgress(conversation), started: true };
  const journeyProgress = submitChallengeAnswer(journeyLesson,
    { ...initialProgress(journeyLesson), started: true }, 'n1-a');
  await trainingRepo.save(trainingProgress);
  await journeyRepo.save(journeyProgress);
  expect(await trainingRepo.load()).toEqual(trainingProgress);
  expect(await journeyRepo.load()).toEqual(journeyProgress);
  await journeyRepo.save(initialProgress(journeyLesson));
  expect(await trainingRepo.load()).toEqual(trainingProgress);
});
```

Añadir dos saves sin await individual, `await Promise.all([repo.save(p1), repo.save(p2)])`, comprobar p2 al cargar. Simular primer setItem rechazado con mockRejectedValueOnce, esperar rechazo y siguiente save exitoso; la cola no debe quedar envenenada. Probar JSON inválido devuelve null y getItem rechazado muestra aviso de TrainingScreen, sin bloquear una partida nueva.

- [ ] **8. Actualizar expectativas editoriales del ejemplo**, y únicamente esas: en `App.test.tsx` esperar apertura nueva (puede esperar «Mostrar mensaje completo», pulsarlo y buscar cuarteta); en `content-and-restore.test.ts` ID nuevo y primer mestre exacto. Mantener pruebas query inválida, training por defecto, legacy y progreso P01–P08. No cambiar fixtures antiguas para evitar fallos del nuevo discriminante.
- [ ] **9. Verde dirigido:** dominio/integración raw YAML y namespaces deben pasar antes del arte. Los tests del repo/App con registro real pasan después de tarea 7. Commit `feat: register semantic journey content and isolate progress` cuando esa dependencia esté resuelta; no afirmar app utilizable sin assets.

### Task 7: Producir, registrar y revisar los assets del viaje

**Files:** directorio nuevo `campo_semantico/viaje-palabras/images/`, `campo-semantico-images.ts`, `content-images.ts`, `images.md`, `tests/integration/campo-semantico.test.ts`.

**Interfaces:** `export const campoSemanticoImages: Readonly<Record<string, ImageSourcePropType>>`; contiene 80 keys exactas del apéndice A. Se integra como `contentImageRegistry.campo_semantico['viaje-palabras']`. No reutilizar namespace training para los nuevos JPG.

- [ ] **1. Rojo del manifiesto:** `createYamlContentRepository('campo_semantico').load()` debe lanzar mientras falta cualquier asset; probarlo con registry incompleto inyectado y comprobar que el mensaje identifica la imagen. En la versión final, la misma carga real debe completar y la prueba de archivo ausente seguirá usando el registry incompleto.
- [ ] **2. Preparar prompts.** Leer skill `imagegen` en el momento de ejecutar esta tarea; anunciarla y usar su herramienta. No generar imágenes durante la preparación de este plan. El apéndice B proporciona prompt base y una descripción específica por cada archivo; concatenarlos, sin añadir texto dibujado. Añadir como referencia visual las imágenes previas ya aprobadas cuando exista una cadena continua. Generar una imagen independiente por referencia, no una lámina de 80 miniaturas.
- [ ] **3. Generar en lotes editoriales pequeños.** Orden por capas: l1 (2 fotos), l2 (4), l3 (8), l4 (16), l5 (32) y l6 (18): total 80. En l4–l6 revisar lotes de dos parejas cada vez. Usar el catálogo para no duplicar ni omitir archivos. Tras cada lote actualizar estado de cada filename en `images.md` y revisar antes del siguiente; no lanzar 80 trabajos sin revisión intermedia.
- [ ] **4. Normalizar formatos si el generador entrega PNG o otra relación.** Guardar verdaderos JPEG RGB a 900×1600; no renombrar extensión. La herramienta imagegen debe producir el encuadre vertical; una conversión técnica con un recorte menor es admisible solo si no elimina el concepto o el destino. Para cambios visuales sustanciales volver a imagegen. En `images.md` registrar dimensiones reales, formato, fecha, prompt y qué imagen se usó de referencia. Evitar fotografías descargadas con licencia/procedencia incierta.
- [ ] **5. Revisión por arista antes de aceptar una foto.** Para cada pareja comprobar concepto, orientación, ausencia de protagonista/texto y dos salidas sugeridas. Para cada arista comprobar avance físico desde todas las llegadas al nodo. CIELO/HUMO no deben convertirse en fotos abstractas sin suelo/camino; VIENTO se representa por vegetación/dunas movidas; VACÍO se mira desde terreno seguro. VOLAR es una zona de despegue reconocible con parapente desplegado y pendiente accesible, no instrucciones para saltar sin equipo.
- [ ] **6. Resolver convergencias con encuadre de transición.** No enfriar/calentar el clima bruscamente: NIEVE→LAGO→ORILLA→AGUA debe mostrar deshielo gradual hacia el valle; PLAYA→ACANTILADO→PARED→ROCA no aparece de repente en alta montaña nevada. Los nodos compartidos finales usan roca/agua templadas y encuadres cercanos que conservan continuidad sin exigir idénticos objetos. Si una foto compartida falla para una llegada, regenerar el encuadre; no quitar esa arista. El criterio no exige conservar exactamente todos los objetos.
- [ ] **7. Crear registro estático.** Este script de autoría produce código con requires literales a partir del YAML; se ejecuta una vez desde la raíz y después se revisa el archivo generado. No se ejecuta en runtime y no sustituye comprobación de ficheros.

```js
// Ejecutar con node --input-type=module, tras crear los 80 JPG.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';
const base = 'src/infrastructure/expo/content';
const lesson = parse(readFileSync(`${base}/campo_semantico.yaml`, 'utf8'));
const journey = lesson.script.find(item => item.type === 'image-journey');
const files = [...new Set(journey.nodes.flatMap(node => node.options.map(option => option.image.file)))].sort();
if (files.length !== 80) throw new Error(`Se esperaban 80 archivos, recibidos ${files.length}`);
for (const file of files)
  if (!existsSync(`${base}/campo_semantico/viaje-palabras/images/${file}`)) throw new Error(`Falta ${file}`);
const lines = files.map(file => `  '${file}': require('./campo_semantico/viaje-palabras/images/${file}'),`);
writeFileSync(`${base}/campo-semantico-images.ts`,
  `import type { ImageSourcePropType } from 'react-native';\n\nexport const campoSemanticoImages: Readonly<Record<string, ImageSourcePropType>> = {\n${lines.join('\n')}\n};\n`);
```

En `content-images.ts` importar el mapa y añadir `campo_semantico: { 'viaje-palabras': campoSemanticoImages }`; conservar training completo. Verificar que no existe ningún `require(variable)` ni template string en el resultado.

- [ ] **8. Validación técnica de assets.** Inspeccionar dimensiones/formato reales y la exportación web; la enumeración puede hacerse con herramienta de imágenes disponible en el entorno (`sips -g format -g pixelWidth -g pixelHeight <archivo>` en macOS). Todas deben ser jpeg, 900×1600. No usar una prueba de extensión `.jpg` como prueba de codificación. Objetivo editorial: alrededor de 120–250 KiB por foto; registrar tamaño total del bundle. Es objetivo, no permiso para degradar legibilidad ni recortar el grafo. La exportación incluirá todo el catálogo por diseño.
- [ ] **9. Verde con repositorio real:** `npx jest --runInBand tests/integration/campo-semantico.test.ts tests/integration/content-images.test.ts tests/integration/content-and-restore.test.ts tests/components/App.test.tsx`, `npm run export:web`.
- [ ] **10. Commit:** `feat: add contextual photographs for semantic journey`, solo registro, fotos, catálogo y pruebas. Revisar que las dos fotos antiguas de la demo no han sido sobreescritas.

### Task 8: Contrato UX, recorrido completo y entrega verificable

**Files:** `docs/ux/UX-001-conversacion-y-scroll.md`, `docs/ux/verification.md`, `src/infrastructure/expo/content/README.md`, tests nuevos de integración/componentes si se detectan vacíos.

**Interfaces:** UX-J01–J08 complementa UX-001; el guion se abre por query bare existente. No añade rutas, dependencias ni deployment.

- [ ] **1. Documentar excepción exacta al aprobar implementación.** Añadir al final del contrato:

```markdown
## Viaje inmersivo image-journey · UX-J

El interior de image-journey sustituye temporalmente la conversación por dos
fotografías verticales. Sus seis taps no ascienden ni se convierten en burbujas;
actualizan el recorrido y presentan la pareja siguiente. Esto es una excepción
acotada a UX-001.2/.3/.4/.6/.11 durante el viaje. La introducción y el cierre
mantienen las reglas de conversación. image-choice conserva I01–I04.

J01: introducción con acciones narrativas, sin adelantar respuestas.
J02: dos fotos y seis decisiones libres, sin feedback de evaluación.
J03: feedback de pulsación, bloqueo de duplicados y callbacks obsoletos ignorados.
J04: negro y salida solo después de la sexta elección.
J05: cuarteta, recorrido real y explicación, en ese orden, una sola vez.
J06: reanudar cada profundidad del viaje; reinicio explícito y progreso aislado.
J07: fotografías fallidas y texto ampliado mantienen decisiones accesibles.
J08: movimiento reducido conserva orden y contenido sin fundido.
```

La autorización de esta excepción procede de la petición de reproducir el viaje y de la aprobación de este plan, no de asumir que el código actual define UX. Registrar fecha efectiva de aprobación, no inventarla.

- [ ] **2. Matriz de cobertura y evidencia.** Añadir a verification.md una sección nueva con filas para cada comando realmente ejecutado; si falla, incluir fallo y límite, nunca copiar «PASS» de este plan. Dejar registros históricos, incluidos R01 visuales pendientes, intactos.

| Requisito | Prueba obligatoria | Límite |
| --- | --- | --- |
| C01–C03, J01 | apertura y tres acciones en TrainingSession.journey | texto/orden, no métrica certificada |
| C04–C06, J02/J04 | 64 rutas, 40 nodos, 80 referencias, ROCA terminal | validez lógica, no calidad fotográfica |
| C07–C08, J05 | cuatro finales y proyección exacta | no mide aprendizaje humano |
| C09, J03/J06 | replay 0–6, corrupción, doble tap/reset, namespaces | almacenamiento local, sin sincronización |
| C10 | revisión visual de 80 fotos y aristas | no sustituible por tests de schema |
| C11, J07/J08 | fallo de Image, disabled, reduced motion, layout manual | RN tests no miden píxeles reales |
| C12 | tests antiguos + URL y default | no validación de dispositivos reales |

- [ ] **3. Puerta final completa, en este orden:**

```bash
npm test
npm run typecheck
npm run lint
npm run export:web
```

No ejecutar export/deploy en paralelo con generación de imágenes. No actualizar expectativas antiguas de scroll para ponerlas verdes. Si hay un fallo preexistente, reproducir sobre base sin cambios en checkout separado solo si está autorizado; registrar evidencia y no atribuirlo por intuición.

- [ ] **4. QA visual del alcance nuevo.** Abrir exportación con `?campo_semantico` en servidor local disponible. Recorrer al menos las cuatro rutas siguientes, una pantalla estrecha 320px y otra baja, texto ampliado y movimiento reducido. Confirmar que no aparecen collages, texto recortado, parpadeos de la siguiente pareja, burbujas ocultas accesibles por teclado, ni control antiguo al volver al chat. No hace falta ejecutar Playwright como puerta; puede usarse navegador para esta revisión visual del material gráfico.

| Camino manual | Cierre esperado |
| --- | --- |
| NIEVE, REFUGIO, VENTANA, HUELLAS, RÍO, NADAR | hasta NADAR; siete conceptos contando VIAJE |
| PLAYA, MAR, BARCA, REMOS, BARCA, REMAR | BARCA aparece dos veces, hasta REMAR |
| NIEVE, HIELO, CUMBRE, CIELO, AIRE, VOLAR | hasta VOLAR |
| PLAYA, ARENA, ACANTILADO, PARED, ROCA, TREPAR | hasta TREPAR sin nodo vacío |

Recargar tras tercer tap y tras sexto; alternar con `?training`; volver y comprobar progreso. Reiniciar viaje y comprobar training intacto. Registrar navegador y versión reales usados; DuckDuckGo Android y Chrome iPhone siguen pendientes si no se han usado.

- [ ] **5. README de contenido.** Explicar diferencias entre image-choice (un tap con burbuja) e image-journey (seis taps y cierre); directorio de assets, IDs por capa, límites de cambiar topología, dos claves de progreso, cómo sustituir JPG conservando IDs y cómo verificar todas las rutas. Añadir enlace a este plan y a images.md.
- [ ] **6. Revisión final del diff:** `git diff --stat`, `git status --short`, comprobar que training.yaml y fotos demo no cambiaron y que no hay dist/ añadido. Revisar código con foco en cinco riesgos de Review Focus; seguir la skill de revisión que corresponda al método de ejecución escogido.
- [ ] **7. Commit de documentación/verificación:** `docs: record semantic journey UX and validation`, limitado a los archivos propios. Entregar resumen de qué se probó, limitaciones, enlace `?campo_semantico` sobre el host local realmente usado y los archivos modificados. No publicar la aplicación.

## Auto-revisión del plan y criterios para terminar

- La fuente final reemplaza el enfoque temprano de treinta preguntas: se han mantenido derrota, nota, seis taps, grafo, cuarteta, recorrido y enseñanza.
- ROCA capa cinco tiene salida explícita; IDs por capa evitan ciclos aparentes de BARCA/CIELO/ALTURA.
- El plan separa decisión tomada de animación; tokens y nodeId evitan duplicados y callbacks tardíos.
- El namespace llega a validación, renderer y almacenamiento; no hay lookup implícito en training.
- Se conserva el formato de progreso; viaje exige historial, las pruebas lineales mantienen sus reglas.
- El resumen no deduplica palabras ni elige un final fijo.
- Las 80 imágenes están enumeradas en apéndices; no se asume que una estimación antigua es un catálogo suficiente.
- La generación de arte y revisión visual son trabajo real de implementación, no realizadas al redactar este plan.
- Código, tests y guion deben estar verdes junto con assets reales antes de llamar a la entrega «implementada».


## Apéndice A — YAML completo, listo para copiar

Destino: `src/infrastructure/expo/content/campo_semantico.yaml`. Los objetos de opción en estilo flow son YAML válido; pueden expandirse sin alterar valores. No incluir este bloque como string dentro del YAML.

```yaml
id: campo-semantico-viaje-v1
startAction: LEVANTARME
startWithStudent: true
script:
  - type: mestre
    label: Voz
    text: |-
      Ya se ha marchado la gente,
      queda el eco del rival;
      te levantas lentamente:
      tu silencio fue el final.
  - type: student
    action: LEVANTARME
    text: No me han dado ningún golpe. Me quedé sin palabras delante de todos.
  - type: mestre
    label: Voz
    text: |-
      Ya no queda aquí tu gente,
      ni el rival que te venció;
      pero ves, sorprendentemente,
      un papel que alguien dejó.
  - type: student
    action: VER NOTA
    text: "Recojo el papel y leo: «Si quieres saber por qué has perdido, encuéntrame»."
  - type: mestre
    label: Nota
    text: No busques una respuesta correcta. Elige lo que te sugiera cada imagen y sigue el viaje.
  - type: student
    action: EMPEZAR EL VIAJE
    text: Cierro los ojos. Esta vez voy a dejar que una palabra me lleve a otra.
  - type: image-journey
    id: viaje-palabras
    startNodeId: l1-viaje
    revelation: |-
      Un viaje fue tu partida,
      cada elección, un lugar;
      una palabra dio vida
      a otra, hasta {VERBO}.
    teaching: |-
      Eso es un campo semántico: palabras conectadas por su significado. Aquí lo hemos explorado como una cadena de asociaciones: una palabra te sugiere otra, aunque cambies de paisaje. No tienen que rimar.

      En la batalla te quedaste en blanco. No te aferres a la palabra que te dan: úsala para encontrar la siguiente.
    nodes:
      - id: l1-viaje
        layer: 1
        options:
          - {"id": "l1-viaje-nieve", "text": "NIEVE", "image": {"file": "l1-viaje-nieve.jpg", "description": "Un sendero de nieve entra en un valle; al fondo se distinguen un refugio y una superficie helada junto a la ladera."}, "next": "l2-nieve"}
          - {"id": "l1-viaje-playa", "text": "PLAYA", "image": {"file": "l1-viaje-playa.jpg", "description": "Un sendero de dunas baja hasta una playa; delante se abren el mar y una franja de arena transitable."}, "next": "l2-playa"}
      - id: l2-nieve
        layer: 2
        options:
          - {"id": "l2-nieve-refugio", "text": "REFUGIO", "image": {"file": "l2-nieve-refugio.jpg", "description": "Se alcanza la puerta entreabierta de un refugio de madera; dentro se distinguen una ventana y el resplandor de una chimenea."}, "next": "l3-refugio"}
          - {"id": "l2-nieve-hielo", "text": "HIELO", "image": {"file": "l2-nieve-hielo.jpg", "description": "El camino llega a una superficie de hielo junto a la ribera, sin pisar hielo fino; más allá se reconocen un lago y una senda de ascenso a la cumbre."}, "next": "l3-hielo"}
      - id: l2-playa
        layer: 2
        options:
          - {"id": "l2-playa-mar", "text": "MAR", "image": {"file": "l2-playa-mar.jpg", "description": "Una senda costera llega a un entrante del mar; una barca amarrada y una zona de oleaje invitan a acercarse por la orilla."}, "next": "l3-mar"}
          - {"id": "l2-playa-arena", "text": "ARENA", "image": {"file": "l2-playa-arena.jpg", "description": "Se avanza por arena húmeda hacia una bifurcación natural entre dunas y un acantilado accesible por sendero."}, "next": "l3-arena"}
      - id: l3-refugio
        layer: 3
        options:
          - {"id": "l3-refugio-ventana", "text": "VENTANA", "image": {"file": "l3-refugio-ventana.jpg", "description": "Desde dentro del refugio se alcanza una ventana empañada; fuera se ve un sendero con huellas que se interna en el bosque."}, "next": "l4-ventana"}
          - {"id": "l3-refugio-fuego", "text": "FUEGO", "image": {"file": "l3-refugio-fuego.jpg", "description": "Desde la entrada del refugio se llega a una chimenea de piedra; se perciben humo y chispas, con salida abierta hacia el exterior y las montañas."}, "next": "l4-fuego"}
      - id: l3-hielo
        layer: 3
        options:
          - {"id": "l3-hielo-lago", "text": "LAGO", "image": {"file": "l3-hielo-lago.jpg", "description": "Desde la ribera helada se avanza a la parte del lago donde comienza el deshielo; hay una orilla accesible y una isla próxima unida por pasos de piedra."}, "next": "l4-lago"}
          - {"id": "l3-hielo-cumbre", "text": "CUMBRE", "image": {"file": "l3-hielo-cumbre.jpg", "description": "Un sendero ancho llega cerca de la cumbre; continúa hacia un horizonte de cielo abierto y un paso entre rocas."}, "next": "l4-cumbre"}
      - id: l3-mar
        layer: 3
        options:
          - {"id": "l3-mar-barca", "text": "BARCA", "image": {"file": "l3-mar-barca.jpg", "description": "Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas."}, "next": "l4-barca"}
          - {"id": "l3-mar-oleaje", "text": "OLEAJE", "image": {"file": "l3-mar-oleaje.jpg", "description": "Desde la senda costera se llega a una playa con olas moderadas; espuma y corriente suave se distinguen junto a una zona de agua protegida."}, "next": "l4-oleaje"}
      - id: l3-arena
        layer: 3
        options:
          - {"id": "l3-arena-dunas", "text": "DUNAS", "image": {"file": "l3-arena-dunas.jpg", "description": "Un sendero entre dunas asciende suavemente; hierbas movidas por el viento y una elevación del terreno orientan la marcha."}, "next": "l4-dunas"}
          - {"id": "l3-arena-acantilado", "text": "ACANTILADO", "image": {"file": "l3-arena-acantilado.jpg", "description": "Una senda ancha y segura alcanza un acantilado; un mirador al vacío y una pared de roca quedan más adelante, sin caída bajo los pies de cámara."}, "next": "l4-acantilado"}
      - id: l4-ventana
        layer: 4
        options:
          - {"id": "l4-ventana-huellas", "text": "HUELLAS", "image": {"file": "l4-ventana-huellas.jpg", "description": "Fuera del refugio, unas huellas recientes recorren el sendero de nieve hacia el valle; se sugiere un río descendente y una senda a la montaña."}, "next": "l5-huellas"}
          - {"id": "l4-ventana-bosque", "text": "BOSQUE", "image": {"file": "l4-ventana-bosque.jpg", "description": "Se entra en el bosque visto desde la ventana; un sendero atraviesa nieve que va desapareciendo y se bifurca hacia río y montaña."}, "next": "l5-bosque"}
      - id: l4-fuego
        layer: 4
        options:
          - {"id": "l4-fuego-humo", "text": "HUMO", "image": {"file": "l4-fuego-humo.jpg", "description": "La mirada sigue el humo al salir del refugio hacia un claro; se ven el cielo abierto y un camino de montaña, sin nube que ocupe todo el encuadre."}, "next": "l5-humo"}
          - {"id": "l4-fuego-chispas", "text": "CHISPAS", "image": {"file": "l4-fuego-chispas.jpg", "description": "Desde la chimenea se ven chispas pequeñas ascendiendo hacia una salida abierta; se conserva contexto del refugio, cielo y camino de montaña visible."}, "next": "l5-chispas"}
      - id: l4-lago
        layer: 4
        options:
          - {"id": "l4-lago-orilla", "text": "ORILLA", "image": {"file": "l4-lago-orilla.jpg", "description": "Se alcanza la orilla del lago con agua libre de hielo delante; una entrada gradual al agua y una barca amarrada sugieren continuación."}, "next": "l5-orilla"}
          - {"id": "l4-lago-isla", "text": "ISLA", "image": {"file": "l4-lago-isla.jpg", "description": "Se llega por un paso de piedras a una isla pequeña; desde tierra firme se ve una cala de agua tranquila y roca escalonada."}, "next": "l5-isla"}
      - id: l4-cumbre
        layer: 4
        options:
          - {"id": "l4-cumbre-cielo", "text": "CIELO", "image": {"file": "l4-cumbre-cielo.jpg", "description": "Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables."}, "next": "l5-cielo"}
          - {"id": "l4-cumbre-roca", "text": "ROCA", "image": {"file": "l4-cumbre-roca.jpg", "description": "El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante."}, "next": "l5-roca"}
      - id: l4-barca
        layer: 4
        options:
          - {"id": "l4-barca-remos", "text": "REMOS", "image": {"file": "l4-barca-remos.jpg", "description": "Se llega al embarcadero junto a unos remos de madera apoyados en la barca; el camino visual continúa hacia su interior y hacia agua tranquila."}, "next": "l5-remos"}
          - {"id": "l4-barca-horizonte", "text": "HORIZONTE", "image": {"file": "l4-barca-horizonte.jpg", "description": "Desde la barca junto a tierra se abre el horizonte; agua y una loma costera permiten seguir hacia agua abierta o aire de la altura."}, "next": "l5-horizonte"}
      - id: l4-oleaje
        layer: 4
        options:
          - {"id": "l4-oleaje-espuma", "text": "ESPUMA", "image": {"file": "l4-oleaje-espuma.jpg", "description": "Desde tierra firme se ven franjas de espuma en una cala que se calma hacia el fondo; allí hay agua accesible y una barca."}, "next": "l5-espuma"}
          - {"id": "l4-oleaje-corriente", "text": "CORRIENTE", "image": {"file": "l4-oleaje-corriente.jpg", "description": "Desde la ribera se sigue una corriente suave hacia una ensenada tranquila con acceso al agua y barca amarrada."}, "next": "l5-corriente"}
      - id: l4-dunas
        layer: 4
        options:
          - {"id": "l4-dunas-viento", "text": "VIENTO", "image": {"file": "l4-dunas-viento.jpg", "description": "Hierbas y arena fina hacen visible el viento en una duna; el sendero asciende a una loma abierta sin personas."}, "next": "l5-viento"}
          - {"id": "l4-dunas-altura", "text": "ALTURA", "image": {"file": "l4-dunas-altura.jpg", "description": "El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible."}, "next": "l5-altura"}
      - id: l4-acantilado
        layer: 4
        options:
          - {"id": "l4-acantilado-vacio", "text": "VACÍO", "image": {"file": "l4-acantilado-vacio.jpg", "description": "Desde un mirador amplio y seguro se percibe el espacio abierto del valle; el sendero continúa lateralmente hacia una loma de vuelo y una pared."}, "next": "l5-vacio"}
          - {"id": "l4-acantilado-pared", "text": "PARED", "image": {"file": "l4-acantilado-pared.jpg", "description": "Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca."}, "next": "l5-pared"}
      - id: l5-huellas
        layer: 5
        options:
          - {"id": "l5-huellas-rio", "text": "RÍO", "image": {"file": "l5-huellas-rio.jpg", "description": "El sendero llega al tramo tranquilo de un río ensanchado, con entrada gradual al agua y pequeña barca amarrada junto a la ribera."}, "next": "l6-rio"}
          - {"id": "l5-huellas-montana", "text": "MONTAÑA", "image": {"file": "l5-huellas-montana.jpg", "description": "El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante."}, "next": "l6-montana"}
      - id: l5-bosque
        layer: 5
        options:
          - {"id": "l5-bosque-rio", "text": "RÍO", "image": {"file": "l5-bosque-rio.jpg", "description": "El sendero llega al tramo tranquilo de un río ensanchado, con entrada gradual al agua y pequeña barca amarrada junto a la ribera."}, "next": "l6-rio"}
          - {"id": "l5-bosque-montana", "text": "MONTAÑA", "image": {"file": "l5-bosque-montana.jpg", "description": "El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante."}, "next": "l6-montana"}
      - id: l5-humo
        layer: 5
        options:
          - {"id": "l5-humo-cielo", "text": "CIELO", "image": {"file": "l5-humo-cielo.jpg", "description": "Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables."}, "next": "l6-cielo"}
          - {"id": "l5-humo-montana", "text": "MONTAÑA", "image": {"file": "l5-humo-montana.jpg", "description": "El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante."}, "next": "l6-montana"}
      - id: l5-chispas
        layer: 5
        options:
          - {"id": "l5-chispas-cielo", "text": "CIELO", "image": {"file": "l5-chispas-cielo.jpg", "description": "Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables."}, "next": "l6-cielo"}
          - {"id": "l5-chispas-montana", "text": "MONTAÑA", "image": {"file": "l5-chispas-montana.jpg", "description": "El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante."}, "next": "l6-montana"}
      - id: l5-orilla
        layer: 5
        options:
          - {"id": "l5-orilla-agua", "text": "AGUA", "image": {"file": "l5-orilla-agua.jpg", "description": "Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo."}, "next": "l6-agua"}
          - {"id": "l5-orilla-barca", "text": "BARCA", "image": {"file": "l5-orilla-barca.jpg", "description": "Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas."}, "next": "l6-barca"}
      - id: l5-isla
        layer: 5
        options:
          - {"id": "l5-isla-agua", "text": "AGUA", "image": {"file": "l5-isla-agua.jpg", "description": "Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo."}, "next": "l6-agua"}
          - {"id": "l5-isla-roca", "text": "ROCA", "image": {"file": "l5-isla-roca.jpg", "description": "El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante."}, "next": "l6-roca"}
      - id: l5-cielo
        layer: 5
        options:
          - {"id": "l5-cielo-aire", "text": "AIRE", "image": {"file": "l5-cielo-aire.jpg", "description": "Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles."}, "next": "l6-aire"}
          - {"id": "l5-cielo-roca", "text": "ROCA", "image": {"file": "l5-cielo-roca.jpg", "description": "El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante."}, "next": "l6-roca"}
      - id: l5-roca
        layer: 5
        options:
          - {"id": "l5-roca-altura", "text": "ALTURA", "image": {"file": "l5-roca-altura.jpg", "description": "El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible."}, "next": "l6-altura"}
          - {"id": "l5-roca-pared", "text": "PARED", "image": {"file": "l5-roca-pared.jpg", "description": "Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca."}, "next": "l6-pared"}
      - id: l5-remos
        layer: 5
        options:
          - {"id": "l5-remos-barca", "text": "BARCA", "image": {"file": "l5-remos-barca.jpg", "description": "Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas."}, "next": "l6-barca"}
          - {"id": "l5-remos-agua", "text": "AGUA", "image": {"file": "l5-remos-agua.jpg", "description": "Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo."}, "next": "l6-agua"}
      - id: l5-horizonte
        layer: 5
        options:
          - {"id": "l5-horizonte-aire", "text": "AIRE", "image": {"file": "l5-horizonte-aire.jpg", "description": "Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles."}, "next": "l6-aire"}
          - {"id": "l5-horizonte-agua", "text": "AGUA", "image": {"file": "l5-horizonte-agua.jpg", "description": "Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo."}, "next": "l6-agua"}
      - id: l5-espuma
        layer: 5
        options:
          - {"id": "l5-espuma-agua", "text": "AGUA", "image": {"file": "l5-espuma-agua.jpg", "description": "Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo."}, "next": "l6-agua"}
          - {"id": "l5-espuma-barca", "text": "BARCA", "image": {"file": "l5-espuma-barca.jpg", "description": "Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas."}, "next": "l6-barca"}
      - id: l5-corriente
        layer: 5
        options:
          - {"id": "l5-corriente-agua", "text": "AGUA", "image": {"file": "l5-corriente-agua.jpg", "description": "Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo."}, "next": "l6-agua"}
          - {"id": "l5-corriente-barca", "text": "BARCA", "image": {"file": "l5-corriente-barca.jpg", "description": "Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas."}, "next": "l6-barca"}
      - id: l5-viento
        layer: 5
        options:
          - {"id": "l5-viento-aire", "text": "AIRE", "image": {"file": "l5-viento-aire.jpg", "description": "Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles."}, "next": "l6-aire"}
          - {"id": "l5-viento-altura", "text": "ALTURA", "image": {"file": "l5-viento-altura.jpg", "description": "El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible."}, "next": "l6-altura"}
      - id: l5-altura
        layer: 5
        options:
          - {"id": "l5-altura-aire", "text": "AIRE", "image": {"file": "l5-altura-aire.jpg", "description": "Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles."}, "next": "l6-aire"}
          - {"id": "l5-altura-pared", "text": "PARED", "image": {"file": "l5-altura-pared.jpg", "description": "Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca."}, "next": "l6-pared"}
      - id: l5-vacio
        layer: 5
        options:
          - {"id": "l5-vacio-aire", "text": "AIRE", "image": {"file": "l5-vacio-aire.jpg", "description": "Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles."}, "next": "l6-aire"}
          - {"id": "l5-vacio-pared", "text": "PARED", "image": {"file": "l5-vacio-pared.jpg", "description": "Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca."}, "next": "l6-pared"}
      - id: l5-pared
        layer: 5
        options:
          - {"id": "l5-pared-altura", "text": "ALTURA", "image": {"file": "l5-pared-altura.jpg", "description": "El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible."}, "next": "l6-altura"}
          - {"id": "l5-pared-roca", "text": "ROCA", "image": {"file": "l5-pared-roca.jpg", "description": "El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante."}, "next": "l6-roca"}
      - id: l6-rio
        layer: 6
        options:
          - {"id": "l6-rio-nadar", "text": "NADAR", "image": {"file": "l6-rio-nadar.jpg", "description": "Desde la orilla, el agua tranquila ocupa el camino visual; la perspectiva invita a entrar gradualmente en una zona clara y protegida, sin cuerpo visible."}, "ending": "nadar"}
          - {"id": "l6-rio-remar", "text": "REMAR", "image": {"file": "l6-rio-remar.jpg", "description": "Desde el borde de un embarcadero se mira hacia el interior de una barca estable con dos remos y una salida de agua tranquila al fondo."}, "ending": "remar"}
      - id: l6-montana
        layer: 6
        options:
          - {"id": "l6-montana-trepar", "text": "TREPAR", "image": {"file": "l6-montana-trepar.jpg", "description": "Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso."}, "ending": "trepar"}
          - {"id": "l6-montana-volar", "text": "VOLAR", "image": {"file": "l6-montana-volar.jpg", "description": "Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto."}, "ending": "volar"}
      - id: l6-cielo
        layer: 6
        options:
          - {"id": "l6-cielo-volar", "text": "VOLAR", "image": {"file": "l6-cielo-volar.jpg", "description": "Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto."}, "ending": "volar"}
          - {"id": "l6-cielo-trepar", "text": "TREPAR", "image": {"file": "l6-cielo-trepar.jpg", "description": "Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso."}, "ending": "trepar"}
      - id: l6-agua
        layer: 6
        options:
          - {"id": "l6-agua-nadar", "text": "NADAR", "image": {"file": "l6-agua-nadar.jpg", "description": "Desde la orilla, el agua tranquila ocupa el camino visual; la perspectiva invita a entrar gradualmente en una zona clara y protegida, sin cuerpo visible."}, "ending": "nadar"}
          - {"id": "l6-agua-remar", "text": "REMAR", "image": {"file": "l6-agua-remar.jpg", "description": "Desde el borde de un embarcadero se mira hacia el interior de una barca estable con dos remos y una salida de agua tranquila al fondo."}, "ending": "remar"}
      - id: l6-barca
        layer: 6
        options:
          - {"id": "l6-barca-remar", "text": "REMAR", "image": {"file": "l6-barca-remar.jpg", "description": "Desde el borde de un embarcadero se mira hacia el interior de una barca estable con dos remos y una salida de agua tranquila al fondo."}, "ending": "remar"}
          - {"id": "l6-barca-nadar", "text": "NADAR", "image": {"file": "l6-barca-nadar.jpg", "description": "Desde la orilla, el agua tranquila ocupa el camino visual; la perspectiva invita a entrar gradualmente en una zona clara y protegida, sin cuerpo visible."}, "ending": "nadar"}
      - id: l6-aire
        layer: 6
        options:
          - {"id": "l6-aire-volar", "text": "VOLAR", "image": {"file": "l6-aire-volar.jpg", "description": "Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto."}, "ending": "volar"}
          - {"id": "l6-aire-trepar", "text": "TREPAR", "image": {"file": "l6-aire-trepar.jpg", "description": "Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso."}, "ending": "trepar"}
      - id: l6-altura
        layer: 6
        options:
          - {"id": "l6-altura-volar", "text": "VOLAR", "image": {"file": "l6-altura-volar.jpg", "description": "Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto."}, "ending": "volar"}
          - {"id": "l6-altura-trepar", "text": "TREPAR", "image": {"file": "l6-altura-trepar.jpg", "description": "Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso."}, "ending": "trepar"}
      - id: l6-pared
        layer: 6
        options:
          - {"id": "l6-pared-trepar", "text": "TREPAR", "image": {"file": "l6-pared-trepar.jpg", "description": "Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso."}, "ending": "trepar"}
          - {"id": "l6-pared-volar", "text": "VOLAR", "image": {"file": "l6-pared-volar.jpg", "description": "Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto."}, "ending": "volar"}
      - id: l6-roca
        layer: 6
        options:
          - {"id": "l6-roca-trepar", "text": "TREPAR", "image": {"file": "l6-roca-trepar.jpg", "description": "Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso."}, "ending": "trepar"}
          - {"id": "l6-roca-volar", "text": "VOLAR", "image": {"file": "l6-roca-volar.jpg", "description": "Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto."}, "ending": "volar"}
completion: Ya has encontrado el camino. Soy quien dejó la nota. Si quieres volver al ring, puedo enseñarte a seguir encontrando palabras.
```

## Apéndice B — Catálogo completo de fotografía y prompts

Carpeta de todos los archivos: `src/infrastructure/expo/content/campo_semantico/viaje-palabras/images/`.

**Prompt base obligatorio, concatenar a cada prompt específico:**

> Fotografía individual vertical 9:16, composición para 900×1600, fotorrealista y cinematográfica, apariencia de fotografía con smartphone moderno. Cámara subjetiva a altura de los ojos. Primer plano, plano medio y fondo con camino visual claro: estoy aquí y puedo avanzar hacia allí. Luz natural creíble, profundidad atmosférica, lugar físicamente explorable, atractivo y seguro, ligeramente misterioso. El concepto se reconoce enseguida dentro del paisaje; no es un objeto de catálogo. Esta foto es un fotograma de un recorrido: continuar físicamente desde el contexto anterior, acercarse a un elemento ya sugerido y dejar visibles o insinuados los siguientes destinos. Cambios de clima, temperatura y luz graduales. Sin protagonista, rostro, cuerpo, manos, pies, sombra ni reflejo del protagonista. Sin otras personas principales. Sin texto, letras, carteles legibles, logos, flechas, iconos, marcos, collage, cuadrículas ni pantalla dividida. Sin estética de videojuego 3D, ilustración ni pintura digital. Una sola fotografía, nunca un mapa de aventuras.

**Modo de construir cada solicitud:** prompt base + contexto del nodo + descripción del archivo + salidas que promete. La etiqueta mayúscula va únicamente en la UI; prohibido dibujarla dentro de la fotografía. En capa seis representar la acción desde su acceso, no mostrar el cuerpo del protagonista ejecutándola.

El siguiente catálogo tiene una entrada por cada referencia. Los contextos compartidos describen el punto de partida, no obligan a mostrar todos los objetos de la escena anterior. En convergencias revisar cada llegada. Usar referencias previas para mantener terreno, luz y atmósfera; si la fotografía contiene nieve y el siguiente concepto es agua transitable, avanzar hacia un valle con deshielo gradual, no hacia agua helada para nadar.

### l1-viaje · tap 1

Contexto anterior: El viaje mental comienza ahora: aún no se ha elegido ningún paisaje. Las dos imágenes son alternativas iniciales, no dos lugares consecutivos.

- **`l1-viaje-nieve.jpg` — NIEVE.** Un sendero de nieve entra en un valle; al fondo se distinguen un refugio y una superficie helada junto a la ladera. Debe prometer los destinos REFUGIO / HIELO.
- **`l1-viaje-playa.jpg` — PLAYA.** Un sendero de dunas baja hasta una playa; delante se abren el mar y una franja de arena transitable. Debe prometer los destinos MAR / ARENA.

### l2-nieve · tap 2

Contexto anterior: Un sendero de nieve entra en un valle; al fondo se distinguen un refugio y una superficie helada junto a la ladera.

- **`l2-nieve-refugio.jpg` — REFUGIO.** Se alcanza la puerta entreabierta de un refugio de madera; dentro se distinguen una ventana y el resplandor de una chimenea. Debe prometer los destinos VENTANA / FUEGO.
- **`l2-nieve-hielo.jpg` — HIELO.** El camino llega a una superficie de hielo junto a la ribera, sin pisar hielo fino; más allá se reconocen un lago y una senda de ascenso a la cumbre. Debe prometer los destinos LAGO / CUMBRE.

### l2-playa · tap 2

Contexto anterior: Un sendero de dunas baja hasta una playa; delante se abren el mar y una franja de arena transitable.

- **`l2-playa-mar.jpg` — MAR.** Una senda costera llega a un entrante del mar; una barca amarrada y una zona de oleaje invitan a acercarse por la orilla. Debe prometer los destinos BARCA / OLEAJE.
- **`l2-playa-arena.jpg` — ARENA.** Se avanza por arena húmeda hacia una bifurcación natural entre dunas y un acantilado accesible por sendero. Debe prometer los destinos DUNAS / ACANTILADO.

### l3-refugio · tap 3

Contexto anterior: Se alcanza la puerta entreabierta de un refugio de madera; dentro se distinguen una ventana y el resplandor de una chimenea.

- **`l3-refugio-ventana.jpg` — VENTANA.** Desde dentro del refugio se alcanza una ventana empañada; fuera se ve un sendero con huellas que se interna en el bosque. Debe prometer los destinos HUELLAS / BOSQUE.
- **`l3-refugio-fuego.jpg` — FUEGO.** Desde la entrada del refugio se llega a una chimenea de piedra; se perciben humo y chispas, con salida abierta hacia el exterior y las montañas. Debe prometer los destinos HUMO / CHISPAS.

### l3-hielo · tap 3

Contexto anterior: El camino llega a una superficie de hielo junto a la ribera, sin pisar hielo fino; más allá se reconocen un lago y una senda de ascenso a la cumbre.

- **`l3-hielo-lago.jpg` — LAGO.** Desde la ribera helada se avanza a la parte del lago donde comienza el deshielo; hay una orilla accesible y una isla próxima unida por pasos de piedra. Debe prometer los destinos ORILLA / ISLA.
- **`l3-hielo-cumbre.jpg` — CUMBRE.** Un sendero ancho llega cerca de la cumbre; continúa hacia un horizonte de cielo abierto y un paso entre rocas. Debe prometer los destinos CIELO / ROCA.

### l3-mar · tap 3

Contexto anterior: Una senda costera llega a un entrante del mar; una barca amarrada y una zona de oleaje invitan a acercarse por la orilla.

- **`l3-mar-barca.jpg` — BARCA.** Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas. Debe prometer los destinos REMOS / HORIZONTE.
- **`l3-mar-oleaje.jpg` — OLEAJE.** Desde la senda costera se llega a una playa con olas moderadas; espuma y corriente suave se distinguen junto a una zona de agua protegida. Debe prometer los destinos ESPUMA / CORRIENTE.

### l3-arena · tap 3

Contexto anterior: Se avanza por arena húmeda hacia una bifurcación natural entre dunas y un acantilado accesible por sendero.

- **`l3-arena-dunas.jpg` — DUNAS.** Un sendero entre dunas asciende suavemente; hierbas movidas por el viento y una elevación del terreno orientan la marcha. Debe prometer los destinos VIENTO / ALTURA.
- **`l3-arena-acantilado.jpg` — ACANTILADO.** Una senda ancha y segura alcanza un acantilado; un mirador al vacío y una pared de roca quedan más adelante, sin caída bajo los pies de cámara. Debe prometer los destinos VACÍO / PARED.

### l4-ventana · tap 4

Contexto anterior: Desde dentro del refugio se alcanza una ventana empañada; fuera se ve un sendero con huellas que se interna en el bosque.

- **`l4-ventana-huellas.jpg` — HUELLAS.** Fuera del refugio, unas huellas recientes recorren el sendero de nieve hacia el valle; se sugiere un río descendente y una senda a la montaña. Debe prometer los destinos RÍO / MONTAÑA.
- **`l4-ventana-bosque.jpg` — BOSQUE.** Se entra en el bosque visto desde la ventana; un sendero atraviesa nieve que va desapareciendo y se bifurca hacia río y montaña. Debe prometer los destinos RÍO / MONTAÑA.

### l4-fuego · tap 4

Contexto anterior: Desde la entrada del refugio se llega a una chimenea de piedra; se perciben humo y chispas, con salida abierta hacia el exterior y las montañas.

- **`l4-fuego-humo.jpg` — HUMO.** La mirada sigue el humo al salir del refugio hacia un claro; se ven el cielo abierto y un camino de montaña, sin nube que ocupe todo el encuadre. Debe prometer los destinos CIELO / MONTAÑA.
- **`l4-fuego-chispas.jpg` — CHISPAS.** Desde la chimenea se ven chispas pequeñas ascendiendo hacia una salida abierta; se conserva contexto del refugio, cielo y camino de montaña visible. Debe prometer los destinos CIELO / MONTAÑA.

### l4-lago · tap 4

Contexto anterior: Desde la ribera helada se avanza a la parte del lago donde comienza el deshielo; hay una orilla accesible y una isla próxima unida por pasos de piedra.

- **`l4-lago-orilla.jpg` — ORILLA.** Se alcanza la orilla del lago con agua libre de hielo delante; una entrada gradual al agua y una barca amarrada sugieren continuación. Debe prometer los destinos AGUA / BARCA.
- **`l4-lago-isla.jpg` — ISLA.** Se llega por un paso de piedras a una isla pequeña; desde tierra firme se ve una cala de agua tranquila y roca escalonada. Debe prometer los destinos AGUA / ROCA.

### l4-cumbre · tap 4

Contexto anterior: Un sendero ancho llega cerca de la cumbre; continúa hacia un horizonte de cielo abierto y un paso entre rocas.

- **`l4-cumbre-cielo.jpg` — CIELO.** Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables. Debe prometer los destinos AIRE / ROCA.
- **`l4-cumbre-roca.jpg` — ROCA.** El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante. Debe prometer los destinos ALTURA / PARED.

### l4-barca · tap 4

Contexto anterior: Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas.

- **`l4-barca-remos.jpg` — REMOS.** Se llega al embarcadero junto a unos remos de madera apoyados en la barca; el camino visual continúa hacia su interior y hacia agua tranquila. Debe prometer los destinos BARCA / AGUA.
- **`l4-barca-horizonte.jpg` — HORIZONTE.** Desde la barca junto a tierra se abre el horizonte; agua y una loma costera permiten seguir hacia agua abierta o aire de la altura. Debe prometer los destinos AIRE / AGUA.

### l4-oleaje · tap 4

Contexto anterior: Desde la senda costera se llega a una playa con olas moderadas; espuma y corriente suave se distinguen junto a una zona de agua protegida.

- **`l4-oleaje-espuma.jpg` — ESPUMA.** Desde tierra firme se ven franjas de espuma en una cala que se calma hacia el fondo; allí hay agua accesible y una barca. Debe prometer los destinos AGUA / BARCA.
- **`l4-oleaje-corriente.jpg` — CORRIENTE.** Desde la ribera se sigue una corriente suave hacia una ensenada tranquila con acceso al agua y barca amarrada. Debe prometer los destinos AGUA / BARCA.

### l4-dunas · tap 4

Contexto anterior: Un sendero entre dunas asciende suavemente; hierbas movidas por el viento y una elevación del terreno orientan la marcha.

- **`l4-dunas-viento.jpg` — VIENTO.** Hierbas y arena fina hacen visible el viento en una duna; el sendero asciende a una loma abierta sin personas. Debe prometer los destinos AIRE / ALTURA.
- **`l4-dunas-altura.jpg` — ALTURA.** El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible. Debe prometer los destinos AIRE / PARED.

### l4-acantilado · tap 4

Contexto anterior: Una senda ancha y segura alcanza un acantilado; un mirador al vacío y una pared de roca quedan más adelante, sin caída bajo los pies de cámara.

- **`l4-acantilado-vacio.jpg` — VACÍO.** Desde un mirador amplio y seguro se percibe el espacio abierto del valle; el sendero continúa lateralmente hacia una loma de vuelo y una pared. Debe prometer los destinos AIRE / PARED.
- **`l4-acantilado-pared.jpg` — PARED.** Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca. Debe prometer los destinos ALTURA / ROCA.

### l5-huellas · tap 5

Contexto anterior: Fuera del refugio, unas huellas recientes recorren el sendero de nieve hacia el valle; se sugiere un río descendente y una senda a la montaña.

- **`l5-huellas-rio.jpg` — RÍO.** El sendero llega al tramo tranquilo de un río ensanchado, con entrada gradual al agua y pequeña barca amarrada junto a la ribera. Debe prometer los destinos NADAR / REMAR.
- **`l5-huellas-montana.jpg` — MONTAÑA.** El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante. Debe prometer los destinos TREPAR / VOLAR.

### l5-bosque · tap 5

Contexto anterior: Se entra en el bosque visto desde la ventana; un sendero atraviesa nieve que va desapareciendo y se bifurca hacia río y montaña.

- **`l5-bosque-rio.jpg` — RÍO.** El sendero llega al tramo tranquilo de un río ensanchado, con entrada gradual al agua y pequeña barca amarrada junto a la ribera. Debe prometer los destinos NADAR / REMAR.
- **`l5-bosque-montana.jpg` — MONTAÑA.** El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante. Debe prometer los destinos TREPAR / VOLAR.

### l5-humo · tap 5

Contexto anterior: La mirada sigue el humo al salir del refugio hacia un claro; se ven el cielo abierto y un camino de montaña, sin nube que ocupe todo el encuadre.

- **`l5-humo-cielo.jpg` — CIELO.** Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-humo-montana.jpg` — MONTAÑA.** El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante. Debe prometer los destinos TREPAR / VOLAR.

### l5-chispas · tap 5

Contexto anterior: Desde la chimenea se ven chispas pequeñas ascendiendo hacia una salida abierta; se conserva contexto del refugio, cielo y camino de montaña visible.

- **`l5-chispas-cielo.jpg` — CIELO.** Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-chispas-montana.jpg` — MONTAÑA.** El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante. Debe prometer los destinos TREPAR / VOLAR.

### l5-orilla · tap 5

Contexto anterior: Se alcanza la orilla del lago con agua libre de hielo delante; una entrada gradual al agua y una barca amarrada sugieren continuación.

- **`l5-orilla-agua.jpg` — AGUA.** Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo. Debe prometer los destinos NADAR / REMAR.
- **`l5-orilla-barca.jpg` — BARCA.** Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas. Debe prometer los destinos REMAR / NADAR.

### l5-isla · tap 5

Contexto anterior: Se llega por un paso de piedras a una isla pequeña; desde tierra firme se ve una cala de agua tranquila y roca escalonada.

- **`l5-isla-agua.jpg` — AGUA.** Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo. Debe prometer los destinos NADAR / REMAR.
- **`l5-isla-roca.jpg` — ROCA.** El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante. Debe prometer los destinos TREPAR / VOLAR.

### l5-cielo · tap 5

Contexto anterior: Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables.

- **`l5-cielo-aire.jpg` — AIRE.** Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-cielo-roca.jpg` — ROCA.** El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante. Debe prometer los destinos TREPAR / VOLAR.

### l5-roca · tap 5

Contexto anterior: El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante.

- **`l5-roca-altura.jpg` — ALTURA.** El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-roca-pared.jpg` — PARED.** Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca. Debe prometer los destinos TREPAR / VOLAR.

### l5-remos · tap 5

Contexto anterior: Se llega al embarcadero junto a unos remos de madera apoyados en la barca; el camino visual continúa hacia su interior y hacia agua tranquila.

- **`l5-remos-barca.jpg` — BARCA.** Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas. Debe prometer los destinos REMAR / NADAR.
- **`l5-remos-agua.jpg` — AGUA.** Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo. Debe prometer los destinos NADAR / REMAR.

### l5-horizonte · tap 5

Contexto anterior: Desde la barca junto a tierra se abre el horizonte; agua y una loma costera permiten seguir hacia agua abierta o aire de la altura.

- **`l5-horizonte-aire.jpg` — AIRE.** Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-horizonte-agua.jpg` — AGUA.** Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo. Debe prometer los destinos NADAR / REMAR.

### l5-espuma · tap 5

Contexto anterior: Desde tierra firme se ven franjas de espuma en una cala que se calma hacia el fondo; allí hay agua accesible y una barca.

- **`l5-espuma-agua.jpg` — AGUA.** Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo. Debe prometer los destinos NADAR / REMAR.
- **`l5-espuma-barca.jpg` — BARCA.** Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas. Debe prometer los destinos REMAR / NADAR.

### l5-corriente · tap 5

Contexto anterior: Desde la ribera se sigue una corriente suave hacia una ensenada tranquila con acceso al agua y barca amarrada.

- **`l5-corriente-agua.jpg` — AGUA.** Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo. Debe prometer los destinos NADAR / REMAR.
- **`l5-corriente-barca.jpg` — BARCA.** Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas. Debe prometer los destinos REMAR / NADAR.

### l5-viento · tap 5

Contexto anterior: Hierbas y arena fina hacen visible el viento en una duna; el sendero asciende a una loma abierta sin personas.

- **`l5-viento-aire.jpg` — AIRE.** Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-viento-altura.jpg` — ALTURA.** El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible. Debe prometer los destinos VOLAR / TREPAR.

### l5-altura · tap 5

Contexto anterior: El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible.

- **`l5-altura-aire.jpg` — AIRE.** Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-altura-pared.jpg` — PARED.** Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca. Debe prometer los destinos TREPAR / VOLAR.

### l5-vacio · tap 5

Contexto anterior: Desde un mirador amplio y seguro se percibe el espacio abierto del valle; el sendero continúa lateralmente hacia una loma de vuelo y una pared.

- **`l5-vacio-aire.jpg` — AIRE.** Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-vacio-pared.jpg` — PARED.** Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca. Debe prometer los destinos TREPAR / VOLAR.

### l5-pared · tap 5

Contexto anterior: Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca.

- **`l5-pared-altura.jpg` — ALTURA.** El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible. Debe prometer los destinos VOLAR / TREPAR.
- **`l5-pared-roca.jpg` — ROCA.** El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante. Debe prometer los destinos TREPAR / VOLAR.

### l6-rio · tap 6

Contexto anterior: El sendero llega al tramo tranquilo de un río ensanchado, con entrada gradual al agua y pequeña barca amarrada junto a la ribera.

- **`l6-rio-nadar.jpg` — NADAR.** Desde la orilla, el agua tranquila ocupa el camino visual; la perspectiva invita a entrar gradualmente en una zona clara y protegida, sin cuerpo visible. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-rio-remar.jpg` — REMAR.** Desde el borde de un embarcadero se mira hacia el interior de una barca estable con dos remos y una salida de agua tranquila al fondo. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-montana · tap 6

Contexto anterior: El camino alcanza una ladera montañosa despejada, sin salto de clima; una roca accesible y una loma de despegue se ven adelante.

- **`l6-montana-trepar.jpg` — TREPAR.** Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-montana-volar.jpg` — VOLAR.** Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-cielo · tap 6

Contexto anterior: Se alcanza un claro elevado desde el que domina el cielo; el suelo y el sendero siguen visibles, con una loma abierta y rocas transitables.

- **`l6-cielo-volar.jpg` — VOLAR.** Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-cielo-trepar.jpg` — TREPAR.** Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-agua · tap 6

Contexto anterior: Desde una ribera estable se alcanza agua tranquila y templada, con entrada poco profunda y barca al alcance visual; sin hielo próximo.

- **`l6-agua-nadar.jpg` — NADAR.** Desde la orilla, el agua tranquila ocupa el camino visual; la perspectiva invita a entrar gradualmente en una zona clara y protegida, sin cuerpo visible. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-agua-remar.jpg` — REMAR.** Desde el borde de un embarcadero se mira hacia el interior de una barca estable con dos remos y una salida de agua tranquila al fondo. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-barca · tap 6

Contexto anterior: Se llega a una pequeña barca de madera amarrada en agua tranquila; remos apoyados y salida hacia agua abierta, sin personas.

- **`l6-barca-remar.jpg` — REMAR.** Desde el borde de un embarcadero se mira hacia el interior de una barca estable con dos remos y una salida de agua tranquila al fondo. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-barca-nadar.jpg` — NADAR.** Desde la orilla, el agua tranquila ocupa el camino visual; la perspectiva invita a entrar gradualmente en una zona clara y protegida, sin cuerpo visible. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-aire · tap 6

Contexto anterior: Se llega por sendero a una loma abierta; hierbas movidas y horizonte hacen visible el aire, con zona de parapente y rocas accesibles.

- **`l6-aire-volar.jpg` — VOLAR.** Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-aire-trepar.jpg` — TREPAR.** Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-altura · tap 6

Contexto anterior: El sendero alcanza una elevación con vista amplia, suelo seguro y paso natural hacia aire abierto y una pared de roca accesible.

- **`l6-altura-volar.jpg` — VOLAR.** Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-altura-trepar.jpg` — TREPAR.** Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-pared · tap 6

Contexto anterior: Se llega a una pared rocosa de poca altura, con apoyos amplios; un paso permite subir hacia una loma y otra formación de roca.

- **`l6-pared-trepar.jpg` — TREPAR.** Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-pared-volar.jpg` — VOLAR.** Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

### l6-roca · tap 6

Contexto anterior: El sendero alcanza una formación rocosa de altura moderada; hay un paso hacia una loma y una pared con apoyos amplios, sin precipicio amenazante.

- **`l6-roca-trepar.jpg` — TREPAR.** Desde el sendero se llega a una roca de poca altura con apoyos naturales grandes y continuación visible arriba; no aparecen manos ni equipo humano en uso. Cierra el recorrido en esta acción; no introducir nuevas decisiones.
- **`l6-roca-volar.jpg` — VOLAR.** Desde un sendero seguro se llega a una zona de despegue de parapente en una loma; vela y equipo preparados, sin personas ni manos, horizonte abierto. Cierra el recorrido en esta acción; no introducir nuevas decisiones.

## Evidencia de revisión documental · 2026-09-20

Comprobaciones ejecutadas durante la redacción, no resultados de implementación:

- Extraído el bloque YAML del apéndice A y parseado con `yaml` instalado: válido.
- Extraído el módulo TypeScript de tarea 1, transpilado con TypeScript instalado y ejecutado con Zod instalado contra ese YAML: esquema válido.
- Enumeradas 64 rutas; cada una tiene exactamente seis elecciones; todas finalizan en NADAR, REMAR, TREPAR o VOLAR.
- Ejecutado `replayJourney` del plan para las 64 rutas y sus prefijos; ninguno termina antes del sexto tap y todos rechazan una séptima entrada.
- Introducido un enlace de ROCA final a la raíz en una copia en memoria: el esquema lo rechaza. No se alteró código de la aplicación.
- Comprobadas 80 referencias de archivo y una entrada de prompt para cada una; 40 nodos de decisión.
- Revisadas interfaces de dominio, proyección, reducer y renderer; no hay marcadores de contenido pendiente.
- Rama comprobada: `main`. Solo se han creado este plan y su especificación. No se han creado assets, modificado código de producto, ejecutado la suite de la app, hecho commits ni desplegado.

Esta comprobación detecta inconsistencias del plan; no demuestra que los futuros componentes React Native funcionen ni que las fotografías cumplan continuidad espacial. La tarea 8 sigue siendo obligatoria cuando se implemente.

## Apéndice C — Pruebas de interacción adicionales listas para incorporar

Estos bloques completan los casos descritos en las tareas; insertarlos en los archivos indicados, reutilizando imports/helpers ya definidos. No crear una segunda suite idéntica. Las expectativas se apoyan en comportamiento observable y estado persistido.

### Tarea 2: guardados contradictorios

En `src/domain/lesson.test.ts`, con `journeyLesson` importada:

```ts
test('J06: rechaza longitudes, logros e identidades contradictorios', () => {
  const fresh = initialProgress(journeyLesson);
  let complete = { ...fresh, started: true };
  for (let i = 1; i <= 6; i++) complete = submitChallengeAnswer(journeyLesson, complete, `n${i}-a`);
  const invalid = [
    { ...complete, history: complete.history.slice(0, 5) },
    { ...complete, completed: [] },
    { ...complete, history: [...complete.history, complete.history[5]] },
    { ...complete, sessionId: complete.lessonId },
    { ...complete, history: [{ challengeId: 'otro-viaje', optionId: 'n1-a' }] },
    { ...complete, started: false },
  ];
  for (const saved of invalid) expect(restoreProgress(journeyLesson, saved)).toEqual(fresh);
});
```

### Tarea 4: el sexto tap y el cierre completo

En `src/application/conversation-flow.test.ts`:

```ts
test('J04/J05: no revela el cierre antes de terminar el fundido', () => {
  let progress = { ...initialProgress(journeyLesson), started: true };
  for (let i = 1; i <= 5; i++) progress = submitChallengeAnswer(journeyLesson, progress, `n${i}-a`);
  const before = createFlow(journeyLesson, progress, true);
  const transition = reduceFlow(journeyLesson, before, {
    type: 'JOURNEY_ANSWER', optionId: 'n6-a', nodeId: 'n6', token: before.token,
  });
  expect(transition.phase).toBe('journey-transition');
  expect(transition.revealed).toBe(before.revealed);
  expect(transition.progress.completed).toEqual(['viaje-palabras']);
  let state = reduceFlow(journeyLesson, transition, { type: 'JOURNEY_SETTLED', token: transition.token });
  for (const messageId of ['viaje-palabras-revelation', 'viaje-palabras-route', 'viaje-palabras-teaching', 'completion']) {
    expect(state.phase).toBe('writing');
    expect(state.messages[state.revealed].id).toBe(messageId);
    const event = { type: 'MESSAGE_DONE' as const, messageId, token: state.token };
    state = reduceFlow(journeyLesson, state, event);
    expect(reduceFlow(journeyLesson, state, event)).toBe(state);
  }
  expect(state.phase).toBe('finished');
  expect(state.messages.filter(message => message.id === 'completion')).toHaveLength(1);
});
test('J06: la introducción sin elecciones se vuelve a presentar al recargar', () => {
  const state = createFlow(journeyLesson, { ...initialProgress(journeyLesson), started: true }, true);
  expect(state.progress).toEqual(initialProgress(journeyLesson));
  expect(state.phase).toBe('writing');
  expect(state.revealed).toBe(0);
});
```

### Tarea 5: ruta completa y doble tap en pantalla real del componente

En `tests/components/TrainingSession.journey.test.tsx` usar los helpers `reveal` y `narrativeTap` definidos en tarea 5. Añadir `LessonProgress` desde `src/domain/lesson-progress`, `AccessibilityInfo` de react-native y `jest` de @jest/globals. Setup antes de cada test: fake timers y `jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false)`. Teardown: cleanup, restoreAllMocks, clearAllTimers, useRealTimers.

```tsx
test('J01/J02/J05: derrota, nota, seis fotos elegidas y aprendizaje', async () => {
  const viewport = createControlledViewport();
  let saved: LessonProgress = initialProgress(journeyLesson);
  await render(<TrainingSession lesson={journeyLesson} initialProgress={saved}
    restored={false} onProgressChange={value => { saved = value; }}
    resolveImage={() => 1} viewportController={viewport.controller} />);
  await reveal();
  await narrativeTap('LEVANTARME', viewport);
  expect(screen.getByText('Me quedé sin palabras.')).toBeOnTheScreen();
  expect(screen.getByText(/Encuentras una nota/)).toBeOnTheScreen();
  await narrativeTap('VER NOTA', viewport);
  await narrativeTap('EMPEZAR EL VIAJE', viewport);
  expect(screen.getByTestId('image-journey')).toBeOnTheScreen();
  expect(screen.queryByText('Me quedé sin palabras.')).not.toBeOnTheScreen();
  for (const [index, label] of ['PASO1A', 'PASO2A', 'PASO3A', 'PASO4A', 'PASO5A', 'NADAR'].entries()) {
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: label })); });
    expect(saved.history).toHaveLength(index + 1);
    await act(async () => { jest.advanceTimersByTime(1000); });
    if (index < 5) {
      expect(saved.completed).toEqual([]);
      expect(screen.queryByRole('button', { name: label })).not.toBeOnTheScreen();
      expect(screen.queryByText(/Eso es un campo semántico/)).not.toBeOnTheScreen();
    }
  }
  expect(saved.completed).toEqual(['viaje-palabras']);
  expect(screen.queryByTestId('image-journey')).not.toBeOnTheScreen();
  for (let i = 0; i < 4; i++) await reveal();
  expect(screen.getByText(/a otra, hasta NADAR/)).toBeOnTheScreen();
  expect(screen.getByText('VIAJE → PASO1A → PASO2A → PASO3A → PASO4A → PASO5A → NADAR')).toBeOnTheScreen();
  expect(screen.getByText(/no tienen que rimar/)).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Volver a viajar' })).toBeOnTheScreen();
  expect(viewport.moves).toHaveLength(3); // únicamente las tres acciones narrativas
});

test('J03: dos taps sobre la misma tarjeta guardan una sola elección', async () => {
  let saved = submitChallengeAnswer(journeyLesson,
    { ...initialProgress(journeyLesson), started: true }, 'n1-a');
  await render(<TrainingSession lesson={journeyLesson} initialProgress={saved}
    restored onProgressChange={value => { saved = value; }} resolveImage={() => 1}
    viewportController={createControlledViewport().controller} />);
  const button = screen.getByRole('button', { name: 'PASO2A' });
  await act(async () => { await fireEvent.press(button); await fireEvent.press(button); });
  expect(saved.history.map(entry => entry.optionId)).toEqual(['n1-a', 'n2-a']);
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(screen.getByRole('button', { name: 'PASO3A' })).toBeOnTheScreen();
});

test('J03: reiniciar durante el fundido invalida su finalización', async () => {
  let saved = submitChallengeAnswer(journeyLesson,
    { ...initialProgress(journeyLesson), started: true }, 'n1-a');
  await render(<TrainingSession lesson={journeyLesson} initialProgress={saved}
    restored onProgressChange={value => { saved = value; }} resolveImage={() => 1}
    viewportController={createControlledViewport().controller} />);
  await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'PASO2A' })); });
  await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar entrenamiento' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Reiniciar' }));
  await act(async () => { jest.advanceTimersByTime(1000); });
  expect(saved).toEqual(initialProgress(journeyLesson));
  expect(screen.queryByTestId('image-journey')).not.toBeOnTheScreen();
  expect(screen.queryByRole('button', { name: 'PASO3A' })).not.toBeOnTheScreen();
});
```

Con movimiento reducido: parametrizar el primer test con `test.each([false, true])`, añadir parámetro `reducedMotion` y ejecutar `jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(reducedMotion)` antes del render. El resto del recorrido y expectativas permanecen idénticos; el helper de reloj de 1000ms no implica que la animación deba durar ese tiempo. El negro no debe bloquear en ese modo.

### Tarea 6: orden de escritura y fallo recuperable

En `tests/integration/progress-namespaces.test.ts`, con AsyncStorage, jest, fixture y repositorio importados:

```ts
test('J06: escrituras rápidas conservan la más reciente', async () => {
  const repo = createAsyncStorageProgressRepository('batalla-de-gallos:progress:v1:campo_semantico');
  const first = submitChallengeAnswer(journeyLesson,
    { ...initialProgress(journeyLesson), started: true }, 'n1-a');
  const second = submitChallengeAnswer(journeyLesson, first, 'n2-a');
  await Promise.all([repo.save(first), repo.save(second)]);
  expect(await repo.load()).toEqual(second);
});
test('un fallo de escritura no impide guardar la elección posterior', async () => {
  const repo = createAsyncStorageProgressRepository('batalla-de-gallos:progress:v1:campo_semantico');
  const initial = initialProgress(journeyLesson);
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('sin espacio'));
  await expect(repo.save(initial)).rejects.toThrow('sin espacio');
  const next = submitChallengeAnswer(journeyLesson, { ...initial, started: true }, 'n1-a');
  await repo.save(next);
  expect(await repo.load()).toEqual(next);
});
```

En el teardown restaurar mocks para que el fallo no contamine otras suites. Usar `AsyncStorage.clear()` en setup y esperar todas las promesas de guardado antes de terminar cada prueba.
