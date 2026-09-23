# Contenido con imágenes

Para añadir un reto visual: crea un namespace editorial estable, guarda dos JPG en `training/<challenge-id>/images/`, añade las dos referencias al YAML y registra cada archivo con un `require` literal en `content-images.ts`. `contentKey` (`training`) identifica el namespace de assets; `lessonId` identifica el progreso y puede ser distinto. La validación se ejecuta después del esquema y antes de devolver la lección.

La versió catalana del viatge és `camp-semantic.yaml`, accessible amb
`?camp-semantic` o `?content=camp-semantic`. Reutilitza les imatges de
`campo_semantico`, amb progrés independent. La pregunta, l'acció i les etiquetes
del recorregut es defineixen a `presentation`; si s'omet, es conserva el
tancament castellà. La mètrica es pot comprovar amb
`node scripts/validate-camp-semantic.mjs /ruta/heptasilabs`.

Les alternatives `camp-semantic-v2.yaml` i `camp-semantic-v3.yaml` s'obren amb
`?camp-semantic-v2` i `?camp-semantic-v3`. Comparteixen fotografies, però tenen
progrés independent. `presentation.choiceHint` defineix la indicació sobre les
imatges. Per validar una alternativa, passa el seu nom de fitxer com a segon
argument de `validate-camp-semantic.mjs`.

`camp-semantic-v4.yaml`, accessible amb `?camp-semantic-v4` o
`?content=camp-semantic-v4`, continua després del viatge amb set reptes
`text-choice`: sis mostren quatre files curtes i l'últim presenta una decisió
binària. Aquest control no usa emojis, admet exactament dues o quatre opcions i
no fixa l'alçada ni trunca el text. L'ordre editorial és viatge → explicació
amb respostes explícites del jugador → pràctica → demostració final. La seva
mètrica es valida amb `node scripts/validate-camp-semantic.mjs /ruta/heptasilabs
camp-semantic-v4.yaml`.
