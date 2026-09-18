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
