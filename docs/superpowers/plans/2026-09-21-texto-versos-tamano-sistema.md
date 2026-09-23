# Texto de versos adaptado al tamaño del sistema Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que los versos respeten el tamaño de texto elegido en iPhone/Android y, dentro del ancho disponible, usen siempre el mayor tamaño que permita que cada verso completo quepa en una sola línea antes de envolverlo.

**Architecture:** Mantener el escalado accesible de React Native (`allowFontScaling`) como preferencia de partida y añadir un componente de tipografía de verso que mida las líneas reales del texto. Ese componente calculará un límite de tamaño por ancho y aplicará el mínimo necesario para todas las líneas, sin modificar el contenido ni los saltos de línea explícitos. Los mensajes que no sean versos conservarán su tipografía actual.

**Tech Stack:** Expo SDK 57, React Native 0.86, React Native Web, TypeScript, Jest + React Native Testing Library, Playwright para comprobación visual opcional.

**Spec:** `docs/ux/UX-001-conversacion-y-scroll.md` (UX-001.8, R05, R10, R13, R14) y esta petición del usuario: el texto debe responder al tamaño de “aA Text Size”/escala del sistema y ser lo más grande posible sin romper el ancho de un verso de 7+2.

## Global Constraints

- “UX-001 es el comportamiento acordado. No cambiarlo por criterio propio ni usar el estado actual como referencia si lo contradice.”
- “No reducir tipografía, comprimir mensajes, truncar con puntos suspensivos ni forzar el scroll para mostrar el siguiente botón”; el ajuste de este plan solo resuelve el ancho horizontal de cada verso.
- “La referencia geométrica es el borde superior del área desplazable más su margen interior superior”; no cambiar anclas ni política de scroll.
- “Asociar cambios y pruebas a IDs UX-001 y R01–R10”; este cambio añade cobertura específica para R05/R10/R13/R14 y no elimina aserciones existentes.
- “La puerta habitual” es `npm test`, `npm run typecheck`, `npm run lint` y `npm run export:web`; `npm run test:browser` queda opcional salvo comprobación visual solicitada.
- Usar la documentación exacta de Expo SDK 57 (`https://docs.expo.dev/versions/v57.0.0/`) y las APIs de React Native instaladas antes de implementar.
- No crear una preferencia paralela dentro de la app: el origen de verdad del tamaño es el ajuste de accesibilidad del sistema/navegador.

## Review Focus

- Escala normal: un verso explicitamente separado por `\n` conserva exactamente esos saltos y no cambia de peso visual de forma inesperada. (Task 2, prueba de render de `ChatMessage`.)
- Escala grande: cada línea de una cuarteta se mantiene en una línea mientras haya un tamaño que quepa; solo se reduce hasta el límite geométrico y nunca se trunca. (Task 1, pruebas de cálculo y Task 2, prueba de integración.)
- Línea más larga: el tamaño final lo determina la línea más ancha, no la primera línea ni el promedio. (Task 1, prueba con anchos desiguales.)
- Viewport estrecho o ancho todavía no medido: el componente usa una medida conservadora y se corrige cuando recibe el layout, sin desplazar ni reiniciar la escritura. (Task 2, prueba de medida inicial y actualización.)
- Accesibilidad y escritura progresiva: el texto reservado y el texto visible usan idéntica tipografía, y `Mostrar completo`/`onDone` siguen ocurriendo una sola vez. (Task 2, ampliar `ChatMessage.test.tsx`.)

---

### Task 1: Motor puro para elegir el mayor tamaño de verso

**Files:**
- Create: `src/infrastructure/expo/ui/verseTypography.ts`
- Test: `tests/unit/verseTypography.test.ts`

**Interfaces:**
- Consumes: líneas de verso, ancho disponible, tamaño preferido derivado del estilo actual, tamaño mínimo permitido y una función de medición inyectada.
- Produces: `findLargestVerseFontSize(input): number`, determinista y sin dependencias de React Native, para que `ChatMessage` pueda usarlo sin duplicar la política.

- [ ] **Step 1: Write the failing tests**

```ts
import { findLargestVerseFontSize } from '../../src/infrastructure/expo/ui/verseTypography';

test('uses the largest size that fits every line', () => {
  const size = findLargestVerseFontSize({
    lines: ['Ya no queda aquí tu gente,', 'ni el rival que te venció;'],
    availableWidth: 300,
    preferredSize: 25,
    minimumSize: 16,
    measureLine: (line, fontSize) => line.length * fontSize * 0.5,
  });

  expect(size).toBe(23);
});

test('the widest line controls the result', () => {
  const size = findLargestVerseFontSize({
    lines: ['corta', 'esta es la línea deliberadamente más larga'],
    availableWidth: 200,
    preferredSize: 25,
    minimumSize: 16,
    measureLine: (line, fontSize) => line.length * fontSize * 0.5,
  });

  expect(size).toBe(16);
});

test('never returns below the configured minimum', () => {
  const size = findLargestVerseFontSize({
    lines: ['una línea imposible de encajar'],
    availableWidth: 20,
    preferredSize: 25,
    minimumSize: 16,
    measureLine: () => 999,
  });

  expect(size).toBe(16);
});
```

Use integer CSS points and a bounded descending search so the result is stable across platforms.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest --runInBand tests/unit/verseTypography.test.ts`

Expected: FAIL because `verseTypography.ts` and `findLargestVerseFontSize` do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
export type VerseTypographyInput = {
  lines: string[];
  availableWidth: number;
  preferredSize: number;
  minimumSize: number;
  measureLine: (line: string, fontSize: number) => number;
};

export function findLargestVerseFontSize(input: VerseTypographyInput): number {
  const { lines, availableWidth, preferredSize, minimumSize, measureLine } = input;
  for (let size = Math.floor(preferredSize); size >= minimumSize; size -= 1) {
    if (lines.every(line => measureLine(line, size) <= availableWidth)) return size;
  }
  return minimumSize;
}
```

Keep whitespace-only lines valid, treat an empty `lines` array as fitting at `preferredSize`, and do not alter the source strings. The production adapter will provide real text measurements; this function owns only the monotonic selection rule.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest --runInBand tests/unit/verseTypography.test.ts`

Expected: PASS with exact results for the widest-line and minimum-size cases.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/verseTypography.test.ts src/infrastructure/expo/ui/verseTypography.ts
git commit -m "test: define adaptive verse typography policy"
```

### Task 2: Integrar tipografía adaptativa en `ChatMessage`

**Files:**
- Modify: `src/infrastructure/expo/ui/ChatMessage.tsx`
- Modify: `tests/components/ChatMessage.test.tsx`

**Interfaces:**
- Consumes: `findLargestVerseFontSize` from Task 1 and the existing `Message`/typewriter props.
- Produces: the same `ChatMessage` public props and the same visible message/order/callback behavior, with an internal adaptive style only for `message.kind === 'verse'`.

- [ ] **Step 1: Write the failing component tests**

Add tests that render an explicit four-line verse and assert all of the following:

```tsx
test('verse text uses the fitted size for the longest explicit line', async () => {
  const view = await render(
    <ChatMessage
      message={{ id: 'verse-1', role: 'mestre', kind: 'verse', text: 'línea corta\nla línea más larga del cuarteto\notra línea\núltima línea' }}
      animate={false}
      reducedMotion={false}
      token={1}
      onDone={jest.fn()}
    />,
  );

  const text = view.getByText('«línea corta\nla línea más larga del cuarteto\notra línea\núltima línea»');
  expect(text.props.allowFontScaling).toBe(true);
  expect(text.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
});

test('typing reserve and visible layer share the fitted verse style', async () => {
  const view = await render(
    <ChatMessage
      message={{ id: 'verse-2', role: 'player', kind: 'verse', text: 'siete sílabas aquí\ny otra línea más larga' }}
      animate
      reducedMotion={false}
      token={2}
      onDone={jest.fn()}
    />,
  );

  const reserve = view.getByTestId('typing-reserve');
  const content = view.getByTestId('typing-content');
  expect(reserve.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
  expect(content.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: '400' })]));
});
```

The test harness must invoke the component's layout/text-measure callback with a controlled width rather than asserting a device-specific pixel value. Preserve the existing tests for `onDone`, `Mostrar completo`, reduced motion, cursor and reserved player bubble.

- [ ] **Step 2: Run the focused tests to verify the new behavior fails**

Run: `npx jest --runInBand tests/components/ChatMessage.test.tsx`

Expected: the new font-weight/scaling assertions fail against the current `fontWeight: '600'` verse style, while the existing typing tests remain green.

- [ ] **Step 3: Implement the adaptive verse text**

In `ChatMessage.tsx`:

1. Keep the source text and `visibleText`/`completeText` construction unchanged, including `«»`, cursor and explicit newlines.
2. Split only the logical verse text on `\n` for measurement; do not normalize or reflow it.
3. Measure the available text width from the actual verse container after layout, subtracting horizontal padding and the existing `letterSpacing` contribution.
4. Start from the current 25-point preference, use `allowFontScaling={true}`, and select the largest integer size that fits every line. On native, the measurement must include the system `PixelRatio.getFontScale()` result; on web, let the browser's text-size behavior participate in the measured layout rather than disabling it with `text-size-adjust: none`.
5. Use regular weight (`fontWeight: '400'`) for verse text to maximize legibility per horizontal point. Keep the current non-verse `s.text` weight unchanged.
6. Apply one computed style object to the reserve and visible layers so the player bubble never changes width while typing. Recompute only on width/font-scale changes; do not reset `count`, `notified`, scroll tokens or `onDone`.
7. If width has not been measured, render with the preferred 25-point style and correct it after layout; never render an empty string, truncate a line or auto-scroll to compensate.

Use `maxFontSizeMultiplier` only as a safety ceiling if the platform's automatic scaling would otherwise exceed the fitted size; do not set `allowFontScaling={false}` globally. The resulting behavior is “system size up to the largest size that fits”, which is the requested priority order.

- [ ] **Step 4: Run focused tests and the standard gate**

Run:

```bash
npx jest --runInBand tests/components/ChatMessage.test.tsx tests/unit/verseTypography.test.ts
npm run typecheck
npm run lint
```

Expected: all focused tests pass; typecheck and lint exit 0. Existing R08/R13/R14 assertions must remain intact.

- [ ] **Step 5: Commit**

```bash
git add src/infrastructure/expo/ui/ChatMessage.tsx tests/components/ChatMessage.test.tsx
git commit -m "feat: fit verse text to system-scaled width"
```

### Task 3: Verificar exportación, regresiones UX y dispositivos reales

**Files:**
- Modify: `tests/ux/conversation.spec.ts` only if the existing selectors need a stable accessibility/test identifier; do not weaken existing assertions.
- Modify: `docs/ux/verification.md` with actual command/device results from this change.

**Interfaces:**
- Consumes: the completed `ChatMessage` behavior from Task 2 and the existing UX-001/R01–R14 scenarios.
- Produces: evidence that the change preserves conversation order, typewriter behavior, scroll anchor and accessibility scaling across web export and native browsers.

- [ ] **Step 1: Add a browser regression scenario for the widest verse**

Use the existing mobile viewport and conversation flow to set the largest supported browser text size, advance to the long verse, and assert the complete verse remains visible with its explicit newline structure. Do not assert a fixed pixel font size because the browser and OS are the source of the user preference; assert that the verse has four rendered lines and no unexpected wrapped fragment.

- [ ] **Step 2: Run the required project gate**

Run:

```bash
npm test
npm run typecheck
npm run lint
npm run export:web
```

Expected: all commands pass. Record any known pre-existing browser failures separately; do not relabel them as caused by this change without reproducing them on the changed branch.

- [ ] **Step 3: Perform the requested visual check on real devices**

Check at minimum:

1. iPhone Safari/installed web app: default text size, larger `aA Text Size`, and maximum practical `aA Text Size`.
2. Android Chrome or DuckDuckGo: default font scale, a larger system font scale, and the longest visible verse.

For each check, verify the four requirements together: system setting visibly increases text when width allows; the longest verse line stays unbroken when a fitting size exists; the text does not become bold; and scroll/typing/`Mostrar completo` retain the existing anchor behavior. Record OS, browser, viewport, setting, revision and result in `docs/ux/verification.md`. Do not claim a device validation that was not actually run.

- [ ] **Step 4: Review the diff and commit verification notes**

Run `git diff --check` and inspect the final diff for accidental changes to the script, content, controls or scroll policy. Then commit only the feature files and verification documentation:

```bash
git add tests/ux/conversation.spec.ts docs/ux/verification.md
git commit -m "test: verify adaptive verse text on mobile layouts"
```

## Self-review

- Spec coverage: system scaling is handled in Task 2; maximum fitting size and widest-line precedence are pinned in Task 1; typewriter/reserve behavior is covered in Task 2; export and device evidence are covered in Task 3.
- Placeholder scan: no production step is left as TBD/TODO or dependent on an unspecified file, function, selector or expected value.
- Type consistency: `findLargestVerseFontSize` has one typed input and numeric output; `ChatMessage` remains on its existing public prop contract.
- UX review focus: each listed failure mode has a named test owner and does not weaken existing UX-001 assertions.
