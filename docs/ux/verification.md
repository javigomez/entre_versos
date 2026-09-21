# Verificación de UX-001

Fecha: 2026-09-11. Contrato aprobado; implementación automatizada en curso y verificación visual todavía pendiente.

## Reorganización 2026-09-11 (DDD)

Migración del árbol `src/` a `domain/`, `application/` e `infrastructure/expo/` (composition root, adaptadores, UI). Las pruebas se co-localizan con la producción cuando son unitarias puras; las suites de componentes, integración y navegador permanecen en `tests/`. Las verificaciones rápidas siguen verdes tras la reorganización: `npm test` ejecuta 4 pruebas Node + 46 Jest; `npm run typecheck`, `npm run lint` y `npm run export:web` también pasan. No se ha añadido ni quitado cobertura.

## Revisión del plan · estrategia de tests

La migración a Jest + jest-expo + React Native Testing Library ya está instalada. Las suites rápidas cubren el prefijo estable del motor, reducer con tokens, fórmulas de scroll, driver temporal, ChatMessage y recorridos R01/R07 con una frontera geométrica controlada. La suite de navegador sigue siendo opcional; la revisión visual no se sustituye por mocks.

## Resultado automatizado actual

Última ejecución local:

| Comando | Resultado observado |
| --- | --- |
| `npm test` | PASS: 5 pruebas Node y 30 pruebas Jest en 7 suites; Jest 1,035 s y Node 0,204 s. |
| `npm run typecheck` | PASS. |
| `npm run lint` | PASS, sin warnings. |
| `npm run export:web` | PASS; bundle web y 3 archivos exportados. Metro avisó que `NO_COLOR` queda anulado por `FORCE_COLOR`; no es un error de código. |

La configuración Jest desactiva Watchman porque el sandbox local no permite abrir su socket; la suite sigue ejecutándose en proceso y sin navegador. Estas pruebas no validan píxeles, pintura ni dispositivos reales.

Cobertura rápida añadida: prefijo estable del motor, IDs, reducer y callbacks antiguos, fórmulas de ancla/señal, driver temporal/interrupción, `ChatMessage` y recorridos de componente R01/R03/R07/R09, incluido reset durante movimiento con callback tardío. R03 se comprobó además de forma puntual en la exportación web local: intento incorrecto conservado, cuatro opciones recuperadas, acierto conservado y avance al segundo reto.

## Resultado automatizado histórico

`npm run test:ux`: 10 ejecuciones, 8 pasan y 2 fallan. Cinco pruebas sobre la pantalla real, cada una en Chromium y WebKit, viewport táctil 390 × 700.

| Caso | Chromium móvil | WebKit móvil | Alcance real |
| --- | --- | --- | --- |
| R01 | Falla | Falla | Respuesta tras Continuar no queda en el ancla acordada: desviaciones de 178,5 y 178 píxeles respecto a la referencia geométrica actual. |
| R02 | Pasa | Pasa | Selección correcta se muestra, hay feedback y siguiente reto sin recargar. |
| R03 / R09 | Pasa | Pasa | Error recupera cuatro opciones; tras acertar conserva ambos intentos sin las opciones antiguas. |
| R07 | Pasa | Pasa | Dos taps rápidos generan una respuesta y un intento guardado. |
| R08, parcial | Pasa | Pasa | Reducir movimiento no adelanta el siguiente turno del jugador. |

Las dos pruebas fallidas son fallos de comportamiento observados, no se han omitido ni marcado como esperados. Durante preparación se corrigió un selector de texto que no incluía las comillas visibles del maestro; ese fallo del test no se cuenta como regresión de producto.

`npm test`: seis pruebas de lógica pasan. `npm run typecheck` y `npm run lint`: pasan. Los informes generados de Playwright están excluidos del análisis de código.

## Cobertura visual todavía pendiente

- R01: medir estabilidad durante toda la escritura, además de la posición final.
- R04: transición desde distintas alturas y ambas filas de opciones, con feedback visual y trayectoria intermedia.
- R05: texto largo recortado abajo, señal de continuación y acceso manual al siguiente control.
- R06: interrupción por scroll manual durante escritura y desplazamiento.
- R08: Mostrar completo y conservación del ancla con movimiento reducido.
- R10: límite de seguimiento del mensaje inicial del maestro.
- Flujo completo desde inicio hasta selección, además del aislamiento del primer reto mediante un guardado válido.

Comprobación puntual disponible: navegador integrado de escritorio sobre la exportación local, revisión actual, con historial restaurado. Se verificó que Cancelar en la confirmación de reinicio no altera la sesión y que error→reintento→acierto conserva ambos intentos. No se midieron los 3 píxeles ni se validó suavidad/recorte en un viewport móvil real.

## Dispositivos reales

DuckDuckGo Android y Chrome iPhone: pendientes. El fallo de selección invisible comunicado en DuckDuckGo no se ha reproducido en los motores automatizados usados. Estos resultados no lo descartan ni identifican su causa. El fallo de posición sí se reproduce en ambos motores; no demuestra por sí solo que sea la causa del salto comunicado en iPhone.

Para la comprobación real: registrar modelo, versión de sistema y navegador, revisión del código, caso R01–R10, resultado y vídeo. Repetir con movimiento normal, reducido y una pantalla baja. No declarar UX-001 completamente protegido hasta completar la cobertura pendiente y corregir los casos rojos.

## Cambios de esta entrega

Infraestructura Jest, motor con prefijo estable, reducer de conversación, política y driver de scroll, componentes integrados y documentación de comandos. El guion no se ha cambiado. Los cambios previos del usuario permanecen en su sitio y no se ha confirmado el índice de Git.

## Restauración estable tras cambios editoriales · 2026-09-18

Esta entrega protege P01–P07 y P08 sin cambiar el guion, la geometría, los
controles ni los identificadores. `completed` conserva los logros validados y
el historial solo se muestra cuando puede reconciliarse con el catálogo
actual. Las respuestas posteriores a la restauración se evalúan con la
solución actual, se guardan y se restauran de nuevo.

La reproducción roja de interacción de la tarea de dominio fue
`npx jest --runInBand tests/components/TrainingSession.test.tsx -t 'mejorar q1'`.
Falló una prueba (cuatro omitidas): después de mejorar `q1`, se esperaba
`completed: ['q1']` y se recibió `completed: []`. La reproducción roja de
dominio con `npx jest --runInBand src/domain/session.test.ts` tuvo seis fallos
y cinco casos pasados: detectó la revocación del logro al cambiar solución u
opción, prefijos inválidos y la pérdida del estado finalizado.

La integración posterior cubre P01/P02 con `q1`, `q2` y `q3`: mantiene `q1`,
presenta `q2` con su texto y solución actuales y deja `q3` pendiente. P03 se
comprueba al descartar un historial incompatible sin fabricar mensajes de
respuesta. P04 mantiene el ciclo JSON del progreso y la validación existente
de guardados. P05 queda limitado a una secuencia estable de IDs. P06 conserva
la finalización y el reinicio explícito cubiertos por las suites de dominio y
flujo. P07 guarda un nuevo fallo después del saneamiento, lo restaura y después
guarda el acierto y una única finalización. P08 comprueba inicio sin guardado,
continuación con `completed: ['q1']` e historial vacío y la carga única de
contenido y progreso por montaje.

La comprobación de sensibilidad sustituyó temporalmente la inicialización del
replay con el prefijo de `completed` por un replay sin ese prefijo. El comando
dirigido falló en `expect(resumed).toEqual(wrong)`: el intento `q2/f` esperado
desapareció y se recibió `history: []` (una prueba fallida y cinco pasadas).
Tras restaurar producción, el mismo comando pasó con dos suites y seis pruebas.
La mutación no forma parte de la entrega.

| Comando | Resultado observado |
| --- | --- |
| `npx jest --runInBand tests/integration/content-and-restore.test.ts tests/components/TrainingScreen.test.tsx` | PASS tras restaurar producción: 2 suites, 6 pruebas, 0 fallos, 0,552 s. |
| `npm test` | PASS: 4 pruebas Node y 60 pruebas Jest en 14 suites; 0 fallos. Node 216,382 ms y Jest 1,264 s. |
| `npm run typecheck` | PASS, `tsc --noEmit`, salida 0. |
| `npm run lint` | PASS, `eslint .`, salida 0. |
| `npm run export:web` | PASS; Metro generó el bundle web y 3 archivos. El aviso repetido sobre `NO_COLOR` y `FORCE_COLOR` no impidió la exportación. |

La continuación y los intentos restaurados ejercitan UX-001.5 y UX-001.11,
además de R02, R03 y R09. R01, R04–R08 y R10 permanecen protegidos por sus
suites existentes; esta entrega no cambia geometría, animación ni scroll. No
se ejecutó la suite de navegador, conforme a la puerta acordada, ni se
validaron DuckDuckGo Android, Chrome iPhone u otros dispositivos reales.

Añadir, reordenar o retirar retos queda fuera de este alcance porque el cursor
sigue basado en `completed.length`. Tampoco se conservan versiones históricas
del contenido ni se autentican los logros almacenados localmente.

## Guardados antiguos tras el renombre a Lesson · 2026-09-18

Esta entrega verifica que el renombre del dominio a `Lesson`/`LessonProgress`
no rompe los guardados existentes y documenta el diccionario del dominio con
JSDoc. No cambia `training.yaml`, la clave de AsyncStorage
`batalla-de-gallos:progress:v1` ni las reglas de restauración: los guardados
con `sessionId` siguen leyéndose mediante `storedLessonProgressSchema` y las
escrituras nuevas serializan exclusivamente `lessonId`.

Pruebas legacy añadidas: «L04: restaura legacy y serializa exclusivamente
lessonId» (integración, con round trip canónico) y «L04 / R02 / R09: carga
progreso antiguo sin repetir el reto completado» (pantalla, sin opciones
antiguas del reto superado). La comprobación de sensibilidad sustituyó
temporalmente en `restoreProgress` la lectura compatible
`storedLessonProgressSchema.safeParse(raw)` por el esquema canónico
`lessonProgressSchema.safeParse(raw)`. El comando dirigido
`npx jest --runInBand tests/integration/content-and-restore.test.ts tests/components/TrainingScreen.test.tsx`
falló con 4 de 8 pruebas: las dos legacy nuevas y las dos preexistentes que
cargan `sessionId` volvieron al progreso inicial. En dominio, `restoreProgress`
devolvió `started: false` sin logros ni intentos; en la pantalla, la conversación
quedó en el estado inicial, con «Empezar», en lugar de mostrar las opciones del
reto pendiente. Tras restaurar producción, el mismo comando pasó: 2 suites,
8 pruebas, 0 fallos, 0,485 s. La mutación no forma parte de la entrega.

| Comando | Resultado observado |
| --- | --- |
| `npx jest --runInBand tests/integration/content-and-restore.test.ts tests/components/TrainingScreen.test.tsx` | PASS tras restaurar producción: 2 suites, 8 pruebas, 0 fallos, 0,485 s. |
| `npm test` | PASS: 4 pruebas Node y 71 pruebas Jest en 15 suites; 0 fallos. Node 256 ms y Jest 1,38 s. |
| `npm run typecheck` | PASS, `tsc --noEmit`, salida 0. |
| `npm run lint` | PASS, `eslint .`, salida 0. |
| `npm run export:web` | PASS; Metro generó el bundle web (301 módulos) y 3 archivos en `dist/`. El aviso conocido sobre `NO_COLOR` y `FORCE_COLOR`, ya registrado como menor diferido, no apareció en esta ejecución. |

Límites: no se ejecutó la suite de navegador ni comprobación visual, ni se
validaron DuckDuckGo Android, Chrome iPhone u otros dispositivos reales. Las
pruebas de esta entrega son de dominio, integración y componente con reloj y
geometría controlados; no miden pintura, suavidad ni dispositivos. UX-001 y
R01–R10 conservan sus expectativas: esta entrega no cambia conversación,
botones, animación, retos ni scroll.

## Cobertura canónica en navegador y etiqueta de cierre · 2026-09-18

Entrega posterior a la fusión de ambas ramas, autorizada expresamente por el
usuario. Cambia la etiqueta visible del cierre de «Sesión completada» a
«Lección completada» (`message-projector`), alineada con el vocabulario de
dominio; el texto del guion, la geometría, los controles y el resto de textos
visibles —incluido el diálogo de reinicio— permanecen intactos. La suite de
navegador ahora cubre también guardados canónicos: la nueva prueba
«R02 / R09 / L04: canonical lessonId save loads the next challenge and writes
lessonId only» siembra `lessonId` con `antonimos-001` superado, comprueba que
la conversación arranca en el segundo reto sin repetir el superado y que,
tras responder, el guardado solo contiene `lessonId` (sin `sessionId`). La
siembra legacy `sessionId` se conserva para mantener la cobertura de
compatibilidad en navegador real.

Rojo de la etiqueta (TDD): la aserción del comentario de cierre esperaba
«Lección completada» y recibió «Sesión completada» antes de tocar producción;
tras el cambio, la suite de proyección pasó con 4 pruebas. Sensibilidad de la
prueba de navegador: al sembrar temporalmente un `lessonId` ajeno
(«otra-leccion-sensibilidad»), la app descartó el guardado y la prueba falló
al no aparecer el reto pendiente; restaurada la siembra, pasó en Chromium y
WebKit. Durante la redacción se corrigió una errata propia del test (coma por
punto y coma en el feedback esperado) descubierta con la captura de fallo; la
aplicación se comportó correctamente desde la primera ejecución.

Sobre el aviso diferido de Metro `NO_COLOR`/`FORCE_COLOR`: se comprobó que
nada en el repositorio, los scripts de npm, la configuración de Playwright ni
el entorno de shell del usuario define esas variables; el aviso provenía del
entorno del agente anterior y no aparece en las ejecuciones locales. No hay
cambio de código asociado.

| Comando | Resultado observado |
| --- | --- |
| `npx jest --runInBand src/application/message-projector.test.ts` | RED esperado (etiqueta) y luego PASS: 1 suite, 4 pruebas, 0 fallos. |
| `npm run test:browser` | 12 ejecuciones en Chromium y WebKit: 10 pasan y fallan las 2 R01 preexistentes y documentadas (desviación de ancla, sin cambios). La prueba canónica nueva pasa en ambos motores (~2 s). |
| `npm test` | PASS: 4 pruebas Node, 71 Jest en 15 suites y 3 de `test:deploy`; 0 fallos. |
| `npm run typecheck` | PASS, `tsc --noEmit`, salida 0. |
| `npm run lint` | PASS, `eslint .`, salida 0. |
| `npm run export:web` | PASS; bundle web y 3 archivos en `dist/`, sin el aviso de color. |

Límites: la etiqueta nueva se verifica en proyección (Jest) y en la suite de
navegador solo indirectamente (el recorrido canónico no llega al cierre, de 18
retos). No se hizo comprobación visual manual ni se validaron DuckDuckGo
Android, Chrome iPhone u otros dispositivos reales. R01 sigue fallando en
ambos motores por la desviación de posición ya registrada; no se ha omitido
ni marcado como esperado.

## Image-choice · 2026-09-20

Implementación automatizada del primer incremento visual: unión discriminada `single-choice | image-choice`, elección libre de dos opciones, resolver estático de imágenes, demo YAML aislada y `ImageChoiceChallenge` integrado en la sesión existente.

| Comando | Resultado observado |
| --- | --- |
| `npm test` | PASS: 18 suites Jest, 75 pruebas; 4 pruebas Node y 3 de deploy, 0 fallos. |
| `npm run typecheck` | PASS. |
| `npx eslint src tests` | PASS: 0 errores, 0 warnings. |
| `npm run export:web` | PASS; bundle web y ambos JPG exportados (179 KiB y 214 KiB). |

Assets verificados como JPEG RGB, 941×1672, con `require` estático. V01–V06 no ejecutados visualmente; tampoco se validó DuckDuckGo Android ni Chrome iPhone. La suite de navegador sigue siendo opcional y los límites históricos R01 permanecen documentados.

## Viaje de palabras en el chat · 2026-09-21

El recorrido de `campo_semantico` conserva el prólogo tras perder la batalla,
las seis elecciones visuales y el cierre sobre el campo semántico. Cada imagen
seleccionada ahora usa la transición normal: asciende, queda como palabra en
una burbuja del jugador y deja la siguiente pareja debajo. El progreso sigue
guardándose por contenido, por lo que una ruta no altera otra lección. UX-001
J01–J06 describe este comportamiento.

J05 protege la tarjeta seleccionada: el control táctil exterior no tiene borde
y la tarjeta interior conserva el único borde amarillo, como en el reto de
emoji y texto.

J06 protege la variante visual experimental: cada tarjeta del viaje muestra
solo la fotografía. La palabra sigue siendo su etiqueta accesible y aparece en
la burbuja de conversación después de seleccionarla.

R11 protege el reinicio sin recarga y R12 exige que el texto del jugador se
escriba tras ocupar el ancla, en vez de aparecer completo al terminar el
desplazamiento.

R13 protege que una burbuja de jugador reserve el tamaño de su respuesta antes
de revelar el primer carácter, evitando el crecimiento visual desde la derecha.
R14 comprueba que maestro y jugador comparten `TYPEWRITER_TICK_MS`, ajustado en
esta entrega a 30 ms por tramo (tres caracteres), un 20 % más lento que el
valor anterior de 24 ms.

| Comando | Resultado observado |
| --- | --- |
| `npx jest --runInBand tests/components/ChatMessage.test.tsx` | PASS: 1 suite, 5 pruebas. Cubre R08, R13 y R14: finalización única, reserva de burbuja y cadencia compartida. |
| `npx jest --runInBand tests/components/ImageJourney.test.tsx tests/components/TrainingSession.test.tsx` | PASS: 2 suites, 13 pruebas. Cubre J01/J02/J05/J06 y confirma que la palabra elegida llega a la burbuja. |
| `npm test` | PASS: 4 pruebas Node, 24 suites Jest con 116 pruebas y 3 pruebas de despliegue; 0 fallos. |
| `npm run typecheck` | PASS: `tsc --noEmit`, salida 0. |
| `npm run lint` | PASS: `eslint .`, salida 0 y sin warnings. |
| `npm run export:web` | PASS: Metro exportó 82 assets, incluidas las 80 fotografías del viaje. El aviso conocido sobre `NO_COLOR` y `FORCE_COLOR` no impidió la exportación. |

Comprobación manual: exportación local en Chrome de escritorio, ruta
NIEVE → REFUGIO → VENTANA → HUELLAS → RÍO → NADAR. Cada palabra se añadió al
historial, abrió la siguiente pareja y llegó a revelación, recorrido, enseñanza
y finalización. En la misma exportación, Reiniciar volvió a mostrar
LEVANTARME sin recarga. Sigue pendiente la validación en DuckDuckGo Android o
Chrome iPhone; la comprobación de escritorio no demuestra pintura, suavidad ni
layout de un dispositivo real.
