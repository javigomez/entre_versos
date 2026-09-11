# Migración de `src/` a capas DDD — Plan y registro de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Read the whole plan before editing. Do not dispatch agents unless the user authorizes delegation.

**Goal:** Reorganizar el código actual en `domain/`, `application/` e `infrastructure/expo/` sin cambiar el comportamiento, el guion ni los contratos de UX-001.

**Architecture:** `domain/` contiene modelos y reglas puras; `application/` contiene la proyección de mensajes, el reducer de conversación y los puertos; `infrastructure/expo/` contiene el composition root, adaptadores de YAML/AsyncStorage y toda la presentación React Native compartida por Android, iOS y web. No se crearán targets `web`, `ios` o `android` separados mientras Expo comparta la misma implementación.

**Tech Stack:** Expo 57.0.21, React Native 0.86.3, React 19.2.3, TypeScript estricto, Node `node:test`, Jest 29.7, React Native Testing Library 14.0.1, Zod 4.6.1, AsyncStorage 2.2.0 y yaml 2.9.0.

**Spec:** `docs/ux/UX-001-conversacion-y-scroll.md`, `docs/ux/verification.md` y `AGENTS.md`.

**Estado:** La migración fue implementada en `main` mediante los commits `8b1f5e1`, `629eeb5`, `a678ffe` y `4a52951`. Las casillas siguientes conservan el procedimiento previsto como registro histórico; la evidencia real y las correcciones posteriores se documentan en `docs/ux/verification.md` y en commits posteriores. No interpretar una casilla sin marcar como trabajo de migración pendiente.

## Global Constraints

- Leer la documentación versionada de Expo 57 antes de modificar código: `https://docs.expo.dev/versions/v57.0.0/`.
- No cambiar `src/content/session.yaml`, las respuestas correctas, el texto visible ni el diseño.
- No modificar el comportamiento acordado en UX-001 ni las expectativas de R01–R10.
- Conservar la máquina de estados con tokens, la escritura cancelable, la selección idempotente, el scroll controlado, movimiento reducido, restauración y guardado serializado.
- No borrar, omitir ni debilitar pruebas para hacer pasar la migración.
- La puerta habitual sigue siendo `npm test`, `npm run typecheck`, `npm run lint` y `npm run export:web`. `npm run test:browser` continúa siendo opcional.
- No afirmar validación en DuckDuckGo Android ni Chrome iPhone sin ejecutarla en dispositivos reales.
- Conservar los cambios preparados y no preparados del usuario. No usar `git reset`, `git checkout --`, `git clean`, `git add .` ni `git commit -a`.
- `domain/` solo puede importar `zod` y archivos de `domain/`.
- `application/` solo puede importar `domain/` y archivos de `application/`; no puede importar React, React Native, Expo, AsyncStorage, YAML ni `infrastructure/`.
- `infrastructure/expo/` puede importar las otras capas y dependencias de plataforma. Es la única capa con E/S y APIs de React Native.
- Los tests unitarios puros se co-localizan con producción. Las pruebas de componentes, integración y e2e permanecen en `tests/`.

---

## 1. Estado real antes de migrar

La implementación vigente no es la pantalla monolítica contra la que se redactó la primera versión del plan. El flujo activo es:

```text
index.ts
  App.tsx
    TrainingScreen.tsx              carga y guarda Progress
      TrainingSession.tsx           integra reducer, animación y viewport
        conversationFlow.ts         reducer puro y tokens de transición
        useConversationViewport.ts  frontera React Native de medición/scroll
          scrollPolicy.ts           fórmulas puras de geometría
          scrollDriver.ts           animación temporal cancelable
        Action.tsx
        ChatMessage.tsx
        SingleChoiceChallenge.tsx
```

Todos esos archivos están activos. No eliminar ninguno como supuesto resto de la UI anterior.

La estrategia de pruebas vigente también forma parte de la estructura:

```text
tests/session.test.ts                     Node: schemas, motor, YAML y restore
tests/unit/session-prefix.test.ts         Jest: prefijo estable del historial
tests/unit/conversationFlow.test.ts       Jest: reducer y callbacks antiguos
tests/unit/scrollPolicy.test.ts           Jest: geometría
tests/unit/scrollDriver.test.ts           Jest: animación/interrupción
tests/components/ChatMessage.test.tsx     RNTL: escritura y cancelación
tests/components/TrainingSession.test.tsx RNTL: R01/R03/R07/R09
tests/components/smoke.test.tsx           RNTL: infraestructura Expo/Jest
tests/helpers/controlledViewport.ts       doble de frontera geométrica
tests/fixtures/conversation.ts            guion determinista
tests/ux/conversation.spec.ts             Playwright opcional
```

`npm test` debe continuar ejecutando `test:engine` y `test:ux`; no sustituirlo por un único glob de `node:test`.

## 2. Estructura objetivo

```text
src/
  domain/
    schemas.ts
    progress.ts
    session.ts
    schemas.test.ts
    session.test.ts
  application/
    content-repository.ts
    progress-repository.ts
    messages.ts
    message-projector.ts
    conversation-flow.ts
    message-projector.test.ts
    conversation-flow.test.ts
  infrastructure/
    expo/
      index.ts
      App.tsx
      content/
        training.yaml
        yaml.d.ts
        yaml-content-repository.ts
      storage/
        async-storage-progress-repository.ts
      ui/
        TrainingScreen.tsx
        TrainingSession.tsx
        Action.tsx
        ChatMessage.tsx
        SingleChoiceChallenge.tsx
        theme.ts
        viewport/
          useConversationViewport.ts
          scrollPolicy.ts
          scrollDriver.ts

tests/
  components/
    ChatMessage.test.tsx
    TrainingSession.test.tsx
    smoke.test.tsx
  fixtures/conversation.ts
  helpers/controlledViewport.ts
  integration/content-and-restore.test.ts
  unit/
    scrollPolicy.test.ts
    scrollDriver.test.ts
  ux/conversation.spec.ts
```

### Mapa origen → destino

| Origen actual | Destino | Responsabilidad |
| --- | --- | --- |
| `src/types/content.ts` | `src/domain/schemas.ts` | Esquemas y tipos de sesión/reto. |
| `src/engine/session.ts` | `src/domain/{progress,session}.ts` + `src/application/{messages,message-projector}.ts` | Separar estado/reglas de la proyección visible. |
| `src/screens/conversationFlow.ts` | `src/application/conversation-flow.ts` | Reducer puro de la conversación. |
| `src/content/session.yaml` | `src/infrastructure/expo/content/training.yaml` | Contenido empaquetado por el adaptador Expo. |
| `src/content/index.ts` | `src/infrastructure/expo/content/yaml-content-repository.ts` | Parseo y validación del YAML. |
| `src/types/yaml.d.ts` | `src/infrastructure/expo/content/yaml.d.ts` | Declaración del import YAML. |
| `src/storage/progress.ts` | `src/infrastructure/expo/storage/async-storage-progress-repository.ts` | Persistencia serializada. |
| `src/screens/TrainingScreen.tsx` | `src/infrastructure/expo/ui/TrainingScreen.tsx` | Carga, error de almacenamiento y montaje de sesión. |
| `src/screens/TrainingSession.tsx` | `src/infrastructure/expo/ui/TrainingSession.tsx` | Integración de reducer, controles, accesibilidad y viewport. |
| `src/screens/useConversationViewport.ts` | `src/infrastructure/expo/ui/viewport/useConversationViewport.ts` | Adaptador React Native de medición/scroll. |
| `src/screens/scrollPolicy.ts` | `src/infrastructure/expo/ui/viewport/scrollPolicy.ts` | Política geométrica pura próxima al adaptador que la usa. |
| `src/screens/scrollDriver.ts` | `src/infrastructure/expo/ui/viewport/scrollDriver.ts` | Driver temporal cancelable. |
| `src/components/*`, `src/challenges/*` | `src/infrastructure/expo/ui/*` | Componentes React Native y tema. |
| `App.tsx`, `index.ts` | `src/infrastructure/expo/App.tsx`, `src/infrastructure/expo/index.ts` | Componente raíz y registro Expo separados. |

El entry point será `src/infrastructure/expo/index.ts`; importa `App` y llama a `registerRootComponent(App)`. `package.json.main` apuntará a ese archivo. No introducir el side effect de registro dentro de `App.tsx`.

## 3. Tareas

### Tarea 1 — Crear el dominio con pruebas co-localizadas

**Files:**
- Create: `src/domain/schemas.ts`
- Create: `src/domain/progress.ts`
- Create: `src/domain/session.ts`
- Create: `src/domain/schemas.test.ts`
- Create: `src/domain/session.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `Session`, `Challenge`, `progressSchema`, `Progress`, `challengesOf`, `initialProgress`, `answer`, `restoreProgress` con las firmas actuales.
- Preserva: forma JSON de `Progress` y clave de sesión.

- [ ] Copiar primero los tests puros de schema, `answer`, `restoreProgress` y `challengesOf` a los archivos co-localizados, usando fixtures TypeScript; no leer YAML en un test de dominio.
- [ ] Ampliar `test:engine` para ejecutar temporalmente tests antiguos y nuevos durante la migración.
- [ ] Ejecutar los tests nuevos y comprobar que fallan únicamente porque los módulos nuevos todavía no existen.
- [ ] Crear los tres archivos de dominio partiendo del código actual, sin modificar firmas ni comportamiento.
- [ ] Ejecutar `npm run test:engine`, `npm run test:unit -- --runTestsByPath tests/unit/session-prefix.test.ts` y `npm run typecheck`.
- [ ] Verificar con ESLint o búsqueda estructural que `src/domain/**` no importe plataforma, aplicación ni infraestructura.

### Tarea 2 — Separar proyección y reducer en aplicación

**Files:**
- Create: `src/application/messages.ts`
- Create: `src/application/message-projector.ts`
- Create: `src/application/conversation-flow.ts`
- Create: `src/application/content-repository.ts`
- Create: `src/application/progress-repository.ts`
- Create: `src/application/message-projector.test.ts`
- Create: `src/application/conversation-flow.test.ts`

**Interfaces:**
- `ContentRepository.load(): Session`.
- `ProgressRepository.load(): Promise<unknown>` y `save(progress: Progress): Promise<void>`.
- `messagesFor(session: Session, progress: Progress): Message[]`.
- `createFlow` y `reduceFlow` mantienen exactamente las firmas y eventos actuales, incluidos `token`, `anchorId` y `pending`.

- [ ] Copiar primero la cobertura de `tests/unit/session-prefix.test.ts` y `tests/unit/conversationFlow.test.ts` a sus destinos, actualizando solo imports.
- [ ] Ejecutar ambos tests nuevos y observar el fallo por módulos ausentes.
- [ ] Extraer `Message` y `messagesFor` sin cambiar IDs, orden, prefijo estable, feedback ni completion.
- [ ] Mover el reducer vigente completo; no sustituirlo por el antiguo `trainingFlow` ni crear `useTrainingSession`.
- [ ] Añadir los dos puertos sin implementar E/S.
- [ ] Ejecutar los tests de aplicación, `npm run test:engine` y `npm run typecheck`.
- [ ] Verificar que `application/**` no importe React, React Native, Expo, AsyncStorage, YAML ni infraestructura.

### Tarea 3 — Crear adaptadores de contenido y persistencia

**Files:**
- Create: `src/infrastructure/expo/content/yaml-content-repository.ts`
- Move: `src/content/session.yaml` → `src/infrastructure/expo/content/training.yaml`
- Move: `src/types/yaml.d.ts` → `src/infrastructure/expo/content/yaml.d.ts`
- Create: `src/infrastructure/expo/storage/async-storage-progress-repository.ts`
- Create: `tests/integration/content-and-restore.test.ts`

**Interfaces:**
- `createYamlContentRepository(): ContentRepository`.
- `createAsyncStorageProgressRepository(): ProgressRepository`.
- Conserva la clave `batalla-de-gallos:progress:v1`, `JSON.parse` tolerante a errores y la cola `pending` actual.

- [ ] Mover a integración el test que lee el YAML real y añadir una comprobación de `load()` + `restoreProgress()`.
- [ ] Ejecutarlo y observar el fallo por adaptadores ausentes.
- [ ] Implementar el repositorio YAML con `sessionSchema.parse(raw)`; desde `content/` el dominio se importa con `../../../domain/schemas`.
- [ ] Implementar el repositorio AsyncStorage preservando exactamente la serialización actual.
- [ ] Mover el YAML sin modificar su contenido y comprobar el hash antes/después.
- [ ] Ejecutar `npm run test:engine`, la integración y `npm run typecheck`.

### Tarea 4 — Mover la presentación activa completa

**Files:**
- Move: `src/screens/TrainingScreen.tsx` → `src/infrastructure/expo/ui/TrainingScreen.tsx`
- Move: `src/screens/TrainingSession.tsx` → `src/infrastructure/expo/ui/TrainingSession.tsx`
- Move: `src/components/{Action,ChatMessage,theme}.*` → `src/infrastructure/expo/ui/`
- Move: `src/challenges/SingleChoiceChallenge.tsx` → `src/infrastructure/expo/ui/SingleChoiceChallenge.tsx`
- Move: `src/screens/{useConversationViewport,scrollPolicy,scrollDriver}.ts` → `src/infrastructure/expo/ui/viewport/`
- Modify: `tests/components/*`, `tests/unit/{scrollPolicy,scrollDriver}.test.ts`, `tests/helpers/controlledViewport.ts`

**Interfaces:**
- `TrainingScreen` recibe repositorios creados por el composition root o factories ya instanciadas; no recrea reglas de dominio.
- `TrainingSessionProps`, `ViewportController`, `ControlTarget` y el protocolo de callbacks con tokens permanecen iguales.

- [ ] Actualizar primero imports de tests para los destinos finales y confirmar el fallo por archivos aún no movidos.
- [ ] Mover todos los archivos con `git mv`, preservando JSX, estilos y efectos; ajustar únicamente imports y la inyección de repositorios.
- [ ] Mantener `conversationFlow` fuera de UI e importarlo desde `application/conversation-flow`.
- [ ] No fusionar `TrainingScreen` y `TrainingSession`: la primera carga/persiste y la segunda integra la interacción.
- [ ] No mover `scrollPolicy` a dominio: sus conceptos pertenecen al viewport de presentación.
- [ ] Ejecutar `npm run test:unit`, `npm run test:components`, `npm run typecheck` y `npm run lint`.

### Tarea 5 — Mover el composition root y el entry point

**Files:**
- Move: `App.tsx` → `src/infrastructure/expo/App.tsx`
- Move: `index.ts` → `src/infrastructure/expo/index.ts`
- Modify: `package.json`

**Interfaces:**
- `index.ts` importa `App` y ejecuta una única llamada `registerRootComponent(App)`.
- `App.tsx` conserva `ErrorBoundary`, `SafeAreaProvider`, `StatusBar` y el marco web actual.

- [ ] Consultar la documentación exacta de Expo 57 para entry points personalizados.
- [ ] Mover ambos archivos y ajustar imports relativos.
- [ ] Cambiar `package.json.main` a `src/infrastructure/expo/index.ts`.
- [ ] Ejecutar `npm run typecheck` y `npm run export:web`; typecheck por sí solo no valida Metro.

### Tarea 6 — Retirar duplicados antiguos y cerrar la cobertura

**Files:**
- Delete: archivos originales solo después de que todos sus consumidores apunten a los destinos.
- Modify: `jest.config.cjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/ux/verification.md`

- [ ] Hacer que Jest incluya tests co-localizados de `domain/` y `application/` además de `tests/unit` y `tests/components`.
- [ ] Mantener `npm test` como `npm run test:engine && npm run test:ux` o una composición equivalente que ejecute Node y Jest.
- [ ] Confirmar con `rg` que ninguna ruta antigua tenga consumidores antes de retirarla.
- [ ] Eliminar únicamente duplicados antiguos; no borrar fixtures, helpers, pruebas de componentes ni Playwright.
- [ ] Eliminar carpetas vacías solo después de verificar su contenido explícitamente.
- [ ] Actualizar el árbol del README y registrar resultados reales en `docs/ux/verification.md` sin afirmar cobertura de dispositivos reales.

### Tarea 7 — Verificación global y reglas de capas

**Files:**
- Modify: `eslint.config.js` si las fronteras todavía no están automatizadas.

- [ ] Añadir reglas `no-restricted-imports` por capa o una prueba de arquitectura; no depender únicamente de patrones `grep` sensibles a comillas/rutas.
- [ ] Ejecutar `npm test` y registrar el número real de suites y pruebas.
- [ ] Ejecutar `npm run typecheck`.
- [ ] Ejecutar `npm run lint` y comprobar que no aparecen warnings nuevos.
- [ ] Ejecutar `npm run export:web`.
- [ ] Revisar `git diff --check` y `git status --short`.
- [ ] Comparar el contenido del YAML y la forma persistida de `Progress` con el punto de partida.
- [ ] Asociar la verificación a UX-001 y R01–R10; documentar las limitaciones visuales existentes.

## 4. Riesgos y mitigaciones

- **Perder la UI vigente:** el plan anterior omitía `TrainingSession`, reducer y viewport. Ahora se mueven como unidades activas y sus tests se actualizan antes.
- **Perder suites Jest:** `npm test` conserva Node + Jest; no se reemplaza por un glob exclusivo de Node.
- **Acoplar aplicación a React Native:** hooks, accesibilidad, animación y viewport permanecen en infraestructura Expo; aplicación queda pura.
- **Nombrar como web un UI universal:** el target se llama `expo`, ya que hoy Android, iOS y web comparten componentes.
- **Confundir unidad con integración:** dominio usa fixtures TypeScript; la lectura del YAML real queda en `tests/integration`.
- **Romper el entry point:** `index.ts` conserva el side effect de `registerRootComponent`; `export:web` valida Metro.
- **Ocultar una regresión de UX-001:** no se cambian expectativas, no se omiten pruebas y se mantienen documentados los casos visuales pendientes/fallidos.

## 5. Auto-revisión del plan

- Todos los archivos activos del árbol actual tienen destino explícito.
- No aparece el retirado `trainingFlow.ts` ni se propone recrearlo.
- No se extrae el antiguo hook monolítico `useTrainingSession`.
- `conversationFlow` conserva reducer, tokens y callbacks idempotentes.
- La política, driver y hook de viewport permanecen juntos.
- Las suites Node, unitarias Jest, componentes RNTL y e2e Playwright conservan una ruta de ejecución.
- Las rutas relativas propuestas corresponden a la profundidad del árbol objetivo.
- Este documento conserva el diseño y la secuencia histórica de una migración ya ejecutada; no es una lista de trabajo futuro.
