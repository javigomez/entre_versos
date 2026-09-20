# Contenido por URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que la versión web seleccione de forma segura un YAML de contenido mediante una clave bare en la query string, usando `training.yaml` por defecto y mostrando un error controlado para claves no permitidas.

**Architecture:** El bundle tendrá un registro estático de claves conocidas (`training` y `campo_semantico`) cuyos valores son imports directos de YAML. Un selector puro traducirá `location.search` a una clave válida: una query vacía usa `training`, una única clave bare conocida selecciona su YAML y cualquier otra forma se rechaza. `App.tsx` leerá la query solo en web y construirá el repositorio dentro del subárbol protegido por `ErrorBoundary`, sin rutas, globbing ni imports dinámicos derivados de la URL.

**Tech Stack:** Expo SDK 57, React Native/Web, TypeScript, Jest, React Native Testing Library, YAML transform de Metro y Zod.

**Spec:** Diseño aprobado en la conversación del 20 de septiembre de 2026: `training.yaml` por defecto; `?training` y `?campo_semantico` como claves bare; sin extensiones ni rutas elegibles por el usuario; error controlado para nombres inexistentes o inválidos; contenido alternativo `campo_semantico.yaml` para validar el flujo.

## Global Constraints

- Leer la documentación exacta de Expo SDK `v57.0.0` antes de escribir código de Expo.
- No cambiar conversación, botones, animación, retos ni scroll; conservar UX-001 y R01–R10.
- No construir rutas de archivos ni ejecutar imports dinámicos con valores de la URL.
- La selección válida se limita al registro explícito de contenidos empaquetados.
- La ausencia de query y la query `?training` deben cargar el contenido de `training.yaml`.
- Una extensión (`?training.yaml`), ruta, espacio, acento, valor no vacío o clave no registrada debe producir un error, no una carga alternativa.
- Mantener cambios ajenos y no hacer commits de todo el índice de Git.
- La puerta habitual de verificación es `npm test`, `npm run typecheck`, `npm run lint` y `npm run export:web`; `npm run test:browser` es opcional y solo diagnóstico.

## Review Focus

- Query ausente: debe conservar el comportamiento actual y cargar `training.yaml`; se fija en `content-selection.test.ts` y la prueba de integración del repositorio.
- Query bare conocida: `?campo_semantico` debe devolver el YAML alternativo, no el contenido por defecto; se fija en la prueba de selección y en la prueba de repositorio.
- Extensión o ruta (`?training.yaml`, `?../training`): debe fallar sin intentar acceder al sistema de archivos; se fija en la tabla de entradas rechazadas del selector.
- Query con caracteres no safe o forma no bare (`?campo%20semantico`, `?training=otro`, varias claves): debe fallar de forma determinista; se fija en la misma tabla de entradas rechazadas.
- Error durante la carga: una clave desconocida o un YAML inválido debe llegar a `ErrorBoundary` y mostrar el mensaje de error de la aplicación; se fija en la prueba de `App`/composición.

---

### Task 1: Crear el selector puro y su contrato de seguridad

**Files:**
- Create: `src/infrastructure/expo/content/content-selection.ts`
- Test: `tests/unit/content-selection.test.ts`

**Interfaces:**
- Produces `export type ContentKey = 'training' | 'campo_semantico'`.
- Produces `export function contentKeyFromSearch(search: string): ContentKey`.
- `contentKeyFromSearch` devuelve `'training'` para `''` o `'?'`.
- Acepta exactamente una clave bare con valor vacío, por ejemplo `'?training'` o `'?campo_semantico'`.
- Lanza `Error` con un mensaje estable que incluya la query rechazada para extensiones, rutas, claves no registradas, valores no vacíos, múltiples parámetros o caracteres fuera de `[a-z0-9_]`.

- [ ] **Step 1: Write the failing test**

  Crear una tabla Jest como esta, comprobando también que los errores no se convierten silenciosamente en `training`:

  ```ts
  import { expect, test } from '@jest/globals';
  import { contentKeyFromSearch } from '../../src/infrastructure/expo/content/content-selection';

  test.each([
    ['', 'training'],
    ['?', 'training'],
    ['?training', 'training'],
    ['?campo_semantico', 'campo_semantico'],
  ])('selecciona %s como %s', (search, expected) => {
    expect(contentKeyFromSearch(search)).toBe(expected);
  });

  test.each(['?training.yaml', '?../training', '?campo%20semantico', '?training=otro', '?training&campo_semantico', '?desconocido'])
    ('rechaza la query no segura %s', search => {
      expect(() => contentKeyFromSearch(search)).toThrow(/contenido/i);
    });
  ```

- [ ] **Step 2: Run test to verify it fails**

  Run: `npx jest --runInBand tests/unit/content-selection.test.ts`

  Expected: FAIL porque todavía no existe el módulo ni la función.

- [ ] **Step 3: Write minimal implementation**

  Implementar un parser sin acceso a disco:

  ```ts
  const safeKey = /^[a-z0-9_]+$/;
  const knownKeys = new Set<ContentKey>(['training', 'campo_semantico']);

  export function contentKeyFromSearch(search: string): ContentKey {
    const params = new URLSearchParams(search);
    const entries = [...params.entries()];
    if (entries.length === 0) return 'training';
    if (entries.length !== 1) throw new Error(`Contenido no válido: ${search}`);
    const [key, value] = entries[0];
    if (value !== '' || !safeKey.test(key) || !knownKeys.has(key as ContentKey)) {
      throw new Error(`Contenido no válido: ${search}`);
    }
    return key as ContentKey;
  }
  ```

  Mantener `knownKeys` como conjunto cerrado y sincronizado con el registro del siguiente task; no aceptar nombres derivados de archivos del disco.

- [ ] **Step 4: Run test to verify it passes**

  Run: `npx jest --runInBand tests/unit/content-selection.test.ts`

  Expected: PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add tests/unit/content-selection.test.ts src/infrastructure/expo/content/content-selection.ts
  git commit -m "test: define safe content query selection"
  ```

### Task 2: Registrar YAMLs estáticos y añadir contenido alternativo

**Files:**
- Create: `src/infrastructure/expo/content/campo_semantico.yaml`
- Modify: `src/infrastructure/expo/content/yaml-content-repository.ts`
- Modify: `tests/integration/content-and-restore.test.ts`

**Interfaces:**
- `createYamlContentRepository(key: ContentKey = 'training'): ContentRepository` sigue permitiendo las llamadas existentes sin argumento.
- El repositorio solo obtiene el contenido desde un mapa literal de imports estáticos:
  `training -> import './training.yaml'` y `campo_semantico -> import './campo_semantico.yaml'`.
- Cada YAML se valida con `lessonSchema.parse` al cargar.

- [ ] **Step 1: Write the failing test**

  Añadir a `tests/integration/content-and-restore.test.ts` una prueba que diferencie ambos contenidos por su `id` y una prueba de clave inexistente:

  ```ts
  test('carga training por defecto y permite el YAML alternativo registrado', () => {
    expect(createYamlContentRepository().load().id).toBe('training');
    expect(createYamlContentRepository('campo_semantico').load().id).toBe('campo-semantico');
  });

  test('no permite una clave que no pertenece al registro', () => {
    expect(() => createYamlContentRepository('no-registrado' as never)).toThrow();
  });
  ```

  Crear `campo_semantico.yaml` con un guion mínimo válido y claramente distinto, por ejemplo `id: campo-semantico`, un `startAction`, una intervención `master`, un reto `single-choice` con exactamente cuatro opciones, `correctOptionId` válido y `completion`.

- [ ] **Step 2: Run test to verify it fails**

  Run: `npx jest --runInBand tests/integration/content-and-restore.test.ts`

  Expected: FAIL porque el repositorio aún no recibe una clave ni existe el YAML alternativo.

- [ ] **Step 3: Write minimal implementation**

  Cambiar el repositorio para importar ambos YAMLs de forma estática y elegir solo mediante el tipo `ContentKey`:

  ```ts
  import campoSemanticoRaw from './campo_semantico.yaml';
  import trainingRaw from './training.yaml';
  import type { ContentKey } from './content-selection';

  const rawByKey = {
    training: trainingRaw,
    campo_semantico: campoSemanticoRaw,
  } as const;

  export function createYamlContentRepository(key: ContentKey = 'training'): ContentRepository {
    return { load: () => lessonSchema.parse(rawByKey[key]) };
  }
  ```

  No añadir `fs`, `require` dinámico, glob de archivos ni concatenación de nombres. Mantener el mapa de claves del selector y `rawByKey` con las mismas dos claves.

- [ ] **Step 4: Run test to verify it passes**

  Run: `npx jest --runInBand tests/integration/content-and-restore.test.ts`

  Expected: PASS, incluyendo las pruebas existentes de restauración.

- [ ] **Step 5: Commit**

  ```bash
  git add src/infrastructure/expo/content/campo_semantico.yaml src/infrastructure/expo/content/yaml-content-repository.ts tests/integration/content-and-restore.test.ts
  git commit -m "feat: register alternative YAML content"
  ```

### Task 3: Integrar la query web y el error controlado en App

**Files:**
- Modify: `src/infrastructure/expo/App.tsx`
- Create or modify: `tests/components/App.test.tsx`

**Interfaces:**
- En web, `App` lee `globalThis.location?.search`; en Android/iOS usa la clave por defecto `training` sin depender de `location`.
- La selección se ejecuta dentro del descendiente protegido por `ErrorBoundary`, para que una query rechazada o un fallo de validación del YAML renderice el mensaje existente en lugar de dejar una excepción sin controlar.
- `TrainingScreen` continúa recibiendo un `ContentRepository` y el repositorio de progreso actual; no cambia el flujo UX.

- [ ] **Step 1: Write the failing test**

  Mockear `globalThis.location` en `tests/components/App.test.tsx`, renderizar `App` y comprobar que una query alternativa termina mostrando una señal distintiva del YAML alternativo. Añadir también el caso inválido:

  ```tsx
  test('App selecciona el contenido indicado por la query web', async () => {
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { search: '?campo_semantico' } });
    const view = await render(<App />);
    expect(view.getByText('Contenido alternativo')).toBeTruthy();
  });

  test('App muestra el error controlado para una query no registrada', async () => {
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { search: '?no-existe' } });
    const view = await render(<App />);
    expect(view.getByText(/No se ha podido abrir el entrenamiento/i)).toBeTruthy();
  });
  ```

  Hacer que el YAML alternativo incluya `Contenido alternativo` en su primer mensaje para que la prueba no dependa del texto de `training.yaml`. Restaurar `globalThis.location` después de cada caso.

- [ ] **Step 2: Run test to verify it fails**

  Run: `npx jest --runInBand tests/components/App.test.tsx`

  Expected: FAIL porque `App` aún siempre usa el repositorio por defecto y no consulta la URL.

- [ ] **Step 3: Write minimal implementation**

  Extraer la composición protegida a un componente interno para que la creación del repositorio quede dentro de `ErrorBoundary`:

  ```tsx
  function ContentApp() {
    const search = Platform.OS === 'web' ? globalThis.location?.search ?? '' : '';
    const content = createYamlContentRepository(contentKeyFromSearch(search));
    return <TrainingScreen content={content} progress={progress} />;
  }

  export default function App() {
    return <SafeAreaProvider><View style={styles.stage}><View style={styles.phone}>
      <StatusBar style="light" />
      <ErrorBoundary><ContentApp /></ErrorBoundary>
    </View></View></SafeAreaProvider>;
  }
  ```

  Importar `contentKeyFromSearch` y eliminar la instancia global de `content` para que la query se evalúe al montar la aplicación y los errores sean capturados por el boundary. Mantener exactamente el texto de error existente, salvo que el test necesite seleccionar un nodo estable.

- [ ] **Step 4: Run focused verification**

  Run: `npx jest --runInBand tests/components/App.test.tsx tests/integration/content-and-restore.test.ts tests/unit/content-selection.test.ts`

  Expected: PASS.

- [ ] **Step 5: Commit**

  ```bash
  git add src/infrastructure/expo/App.tsx tests/components/App.test.tsx
  git commit -m "feat: select web content from URL query"
  ```

### Task 4: Ejecutar la puerta completa de regresión y revisar la exportación

**Files:**
- Modify: `docs/ux/verification.md` only if the commands or limits need recording; do not alter UX expectations.

**Interfaces:**
- La aplicación terminada conserva las interfaces de `ContentRepository`, `TrainingScreen` y progreso.
- La exportación web incluye ambos YAMLs en el bundle y funciona bajo el `baseUrl` de GitHub Pages.

- [ ] **Step 1: Run the complete automated gate**

  Run, in order:

  ```bash
  npm test
  npm run typecheck
  npm run lint
  npm run export:web
  ```

  Expected: all commands exit with status 0. `npm test` debe conservar las pruebas UX existentes y las nuevas; no se deben tocar aserciones para ocultar regresiones.

- [ ] **Step 2: Inspect the generated web bundle inputs**

  Run: `rg -n "campo_semantico|training" dist _expo 2>/dev/null || true`

  Expected: la exportación contiene referencias al registro y ambos contenidos; no debe aparecer una operación de lectura de una ruta recibida desde `location.search`.

- [ ] **Step 3: Run the optional browser diagnostic when available**

  Run: `npm run test:browser`

  Expected: registrar el resultado real, incluyendo cualquier fallo R01 preexistente documentado en `docs/ux/verification.md`; no declarar validación de DuckDuckGo Android o Chrome iPhone sin ejecutarla en esos dispositivos.

- [ ] **Step 4: Review the final diff and status**

  Run: `git diff --check` and `git status --short`.

  Expected: no whitespace errors; solo aparecen los archivos de esta funcionalidad y cualquier cambio previo del usuario permanece intacto.

