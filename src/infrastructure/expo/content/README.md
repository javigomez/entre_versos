# Contenido con imágenes

Para añadir un reto visual: crea un namespace editorial estable, guarda dos JPG en `training/<challenge-id>/images/`, añade las dos referencias al YAML y registra cada archivo con un `require` literal en `content-images.ts`. `contentKey` (`training`) identifica el namespace de assets; `lessonId` identifica el progreso y puede ser distinto. La validación se ejecuta después del esquema y antes de devolver la lección.

La versió catalana del viatge és `camp-semantic.yaml`, accessible amb
`?camp-semantic` o `?content=camp-semantic`. Reutilitza les imatges de
`campo_semantico`, amb progrés independent. La pregunta, l'acció i les etiquetes
del recorregut es defineixen a `presentation`; si s'omet, es conserva el
tancament castellà. La mètrica es pot comprovar amb
`node scripts/validate-camp-semantic.mjs /ruta/heptasilabs`.
