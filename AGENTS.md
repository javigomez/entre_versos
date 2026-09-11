# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Contratos de UX y regresión

Antes de modificar conversación, botones, animación, retos o scroll, leer `docs/ux/UX-001-conversacion-y-scroll.md` y `docs/ux/verification.md`.

- UX-001 es el comportamiento acordado. No cambiarlo por criterio propio ni usar el estado actual como referencia si lo contradice.
- Para cambiar comportamiento esperado, obtener autorización explícita del usuario y actualizar requisito y escenario asociado en la misma entrega.
- Asociar cambios y pruebas a IDs UX-001 y R01–R10. Reproducir el fallo con una prueba de interacción antes de corregirlo.
- No borrar, saltar, debilitar aserciones ni actualizar expectativas para ocultar una regresión.
- Estrategia acordada: `npm test`, `npm run typecheck`, `npm run lint` y `npm run export:web` son la puerta habitual. `npm run test:browser` queda solo para diagnóstico opcional o comprobación visual solicitada. Seguir `docs/superpowers/plans/2026-09-11-ux-001.md` y registrar resultados y límites reales.
- Emulación Chromium/WebKit no demuestra funcionamiento en DuckDuckGo Android ni Chrome iPhone reales. No afirmar esas validaciones sin ejecutarlas.
- Mantener el guion y los cambios ajenos. No hacer commits de todo el índice: hay trabajo previo preparado por el usuario.
