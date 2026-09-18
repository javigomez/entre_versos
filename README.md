# Entre versos

Demo de entrenamiento poético con Expo, React Native, TypeScript y React Native Web. Chat oscuro con escritura animada, dos retos táctiles y reintentos sin penalización. Sin backend.

## Arrancar en navegador

Desde esta carpeta, con Node.js 22.13+ (probado con Node 24):

```sh
npm run web
```

Las dependencias ya están instaladas. En una copia nueva, ejecutar antes `npm ci`. Expo muestra la dirección local (normalmente http://localhost:8081). La web mantiene una única columna de móvil, hasta 430 × 900 px; en pantallas pequeñas se ajusta al espacio disponible sin cambiar el diseño. Orientación nativa bloqueada en portrait.

## Estructura

- `src/infrastructure/expo/content/training.yaml`: guion de la conversación. Cada entrada es `master`, `student` o `single-choice`; los textos `|-` conservan los saltos de línea de los versos. Editarlo actualiza el contenido mediante Metro.
- `src/domain/`: esquema Zod, entidad `LessonProgress` y reglas puras de la lección (`submitChallengeAnswer`, `restoreProgress`, `initialProgress`, `challengesOf`). Sin dependencias de React, React Native ni AsyncStorage.
- `src/application/`: proyección de mensajes, reducer de conversación (`conversation-flow`) y puertos de contenido/persistencia. Coordina el dominio sin acoplarse a la plataforma.
- `src/infrastructure/expo/`: composition root, adaptadores de YAML y AsyncStorage, y toda la presentación React Native compartida por Android, iOS y web. Incluye la UI, los componentes de reto y el hook de viewport.
- `assets/audio/` y `assets/images/`: preparados para recursos futuros. Los retos admiten `audio: archivo.m4a`; esta demo no reproduce audio.

El diccionario del dominio está en el código: [schemas.ts](src/domain/schemas.ts) define el contenido, [lesson-progress.ts](src/domain/lesson-progress.ts) define el avance y [lesson.ts](src/domain/lesson.ts) documenta las operaciones. Sus comentarios JSDoc explican los conceptos y las pruebas muestran sus reglas. Los guardados antiguos con `sessionId` siguen siendo legibles; las escrituras nuevas utilizan `lessonId` en la misma clave de almacenamiento.

El YAML se transforma durante el empaquetado y se valida con Zod al cargar y en los tests. Para añadir conversación, agrega entradas `master` o `student`; para añadir retos, usa una entrada `single-choice` siguiendo el esquema de `training.yaml`. Cambiar el ID de la lección invalida el progreso anterior. No hay cuentas ni sincronización entre dispositivos.

## Comprobaciones

```sh
npm run typecheck
npm test
npm run lint
npm run export:web
```

Los tests Node comprueban contenido y persistencia; Jest comprueba motor, reducer, política/driver de scroll y componentes reales con reloj y geometría controlados. `dist/` contiene la exportación web. `npm run ios` y `npm run android` abren los entornos nativos si están configurados.

La animación respeta reducir movimiento y permite «Mostrar completo». El historial se puede recorrer sin que el chat fuerce el scroll al último mensaje; el botón ↓ vuelve al presente.

## Contrato de UX y regresión

El comportamiento de la conversación está acordado en [UX-001](docs/ux/UX-001-conversacion-y-scroll.md). Consultar el [estado de verificación](docs/ux/verification.md) para distinguir requisitos aprobados, pruebas existentes y comportamiento todavía pendiente de corregir. El [plan](docs/superpowers/plans/2026-09-11-ux-001.md) organiza la implementación.

Para diagnóstico opcional sobre Chromium y WebKit con pantalla móvil:

```sh
npx playwright install chromium webkit
npm run test:browser
```

El servidor de pruebas usa el puerto 8097. Cada caso tiene un contexto de navegador independiente; no modifica el progreso de tu navegador habitual. Los informes y trazas se guardan en `playwright-report/` y `test-results/` y no se versionan.

La puerta habitual es `npm test`, que combina las pruebas Node y Jest sin iniciar Expo ni navegador. Playwright y la revisión manual siguen siendo necesarios para pintura, suavidad y comportamiento en dispositivos reales; pasar Jest no sustituye esa evidencia.
