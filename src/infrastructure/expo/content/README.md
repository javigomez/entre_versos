# Contenido con imágenes

Para añadir un reto visual: crea un namespace editorial estable, guarda dos JPG en `training/<challenge-id>/images/`, añade las dos referencias al YAML y registra cada archivo con un `require` literal en `content-images.ts`. `contentKey` (`training`) identifica el namespace de assets; `lessonId` identifica el progreso y puede ser distinto. La validación se ejecuta después del esquema y antes de devolver la lección.
