# Task 1 report: conservar logros al restaurar

## Alcance realizado

- `restoreProgress` valida que `completed` sea un prefijo del recorrido actual y lo conserva como autoridad.
- El historial se reproduce solo para comprobar si puede mostrarse; si es incompatible se descarta sin revocar logros persistidos ni inventar respuestas.
- Se añadieron casos de dominio P01, P04 y P06 y la reproducción de interacción P01 / R02 / R09.
- UX-001 enlaza la restauración editorial con P01–P07 sin cambiar las reglas de la sesión.

## RED

Comando:

```text
npx jest --runInBand tests/components/TrainingSession.test.tsx -t 'mejorar q1'
```

Resultado observado: `FAIL`, 1 prueba fallida y 4 omitidas. La aserción esperaba `restored.completed` igual a `['q1']` y recibió `[]`.

Comando:

```text
npx jest --runInBand src/domain/session.test.ts
```

Resultado observado: `FAIL`, 6 fallidas y 5 pasadas. Fallaron los cambios de solución y opción de P01, los tres prefijos inválidos de P04 y la sesión finalizada de P06. El caso de cambio de texto pasó porque el historial seguía siendo reproducible con los mismos IDs y solución.

## GREEN

Comando dirigido:

```text
npx jest --runInBand src/domain/session.test.ts tests/components/TrainingSession.test.tsx src/application/message-projector.test.ts tests/unit/session-prefix.test.ts tests/unit/conversationFlow.test.ts
```

Resultado observado: `PASS`, 5 suites, 29 pruebas, 0 fallos, 1.017 s.

Verificación completa fresca:

```text
npm test
```

Resultado observado: `PASS`. Motor Node: 4 pruebas pasadas, 0 fallos, 266.946792 ms. Jest: 14 suites y 57 pruebas pasadas, 0 snapshots y 0 fallos, 1.361 s.

## Auto-revisión

- La firma pública de `restoreProgress` y las interfaces existentes no cambiaron; no se exportaron helpers.
- `completed` inválido, repetido o fuera de orden restaura progreso inicial; un guardado no iniciado con actividad también se descarta.
- Con historial incompatible y logros válidos se conserva `started` y `completed`, eliminando el historial completo. Con cero logros se vuelve al progreso inicial.
- Un historial que empieza después de logros ya saneados puede reproducirse desde ese punto.
- El replay nunca concede ni revoca logros guardados; las respuestas nuevas siguen evaluándose con el contenido actual.
- No se modificaron YAML, componentes de producción, almacenamiento, guion ni aserciones existentes.
- No se hizo comprobación visual ni en dispositivos reales; esta tarea verifica dominio e interacción con Jest, conforme a su alcance.
