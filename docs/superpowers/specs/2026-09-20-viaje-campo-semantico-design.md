# El rastro de las palabras — especificación para revisión

Fecha: 2026-09-20. Estado: propuesta de implementación derivada de la conversación del usuario; no implementada. Plan asociado: `../plans/2026-09-20-viaje-campo-semantico.md`.

## Fuente y precedencia

Fuente leída en navegador: [context del joc](https://chatgpt.com/share/6aafe32f-00e4-83eb-a0ff-0be7b71c5ce4). Se revisaron los mensajes sobre derrota, adaptación a botones, enseñanza, viaje visual, grafo cerrado, cuarteta final y requisitos de imagen. Las propuestas iniciales de dojo urbano, direcciones cardinales y treinta ejercicios quedan sustituidas por la petición posterior: derrota → nota → viaje mental de seis decisiones → recorrido propio → enseñanza → invitación del maestro. No añadir retos de antónimos, métricas, metáforas, audio, voz, puntuaciones ni otra lección.

La conversación no es una especificación técnica cerrada. Las decisiones añadidas aquí se identifican como tales: tipo `image-journey`, IDs por capa, salida de ROCA, presupuesto gráfico, aislamiento de guardados, y textos puente. No atribuir esos detalles al usuario ni presentar esta especificación como ya aprobada.

## Resultado que debe experimentar el jugador

C01. Empieza después de perder una batalla verbal. El daño es al orgullo; no representar una agresión física. Una voz todavía anónima describe la escena en castellano y verso.

C02. Las acciones son LEVANTARME, VER NOTA y EMPEZAR EL VIAJE. Los botones narrativos se convierten en una respuesta/reflexión del jugador conforme a UX-001. La nota contiene «Si quieres saber por qué has perdido, encuéntrame». La nota propone elegir sin buscar una respuesta correcta.

C03. El viaje es mental: puede empezar en NIEVE o PLAYA; no se requiere justificar un transporte desde el ring a esas escenas. A partir de esa primera elección, las imágenes deben sentirse como avance físico gradual dentro del mundo escogido.

C04. Exactamente seis taps válidos: seis palabras elegidas. VIAJE es el concepto raíz, no una séptima elección. Hay dos opciones visuales en cada decisión, ambas válidas. No hay cuartetas, burbujas, «Continuar», acierto/error, contadores escolares ni preguntas entre los taps. El sexto tap escoge un verbo.

C05. Cada elección cambia las opciones siguientes. El recorrido no es una secuencia fija disfrazada. No hay ciclos ni atajos. Las 64 combinaciones binarias alcanzan un terminal en la sexta decisión.

C06. Solo cuatro terminales: NADAR, REMAR, VOLAR, TREPAR. Las conexiones finales de ROCA serán TREPAR/VOLAR: corrección propuesta porque la conversación llega a ROCA en capa cinco pero omite su fila en capa seis.

C07. Tras el sexto tap, breve negro y retorno a conversación. Primero aparece la cuarteta «Un viaje fue tu partida, / cada elección, un lugar; / una palabra dio vida / a otra, hasta {VERBO}.». Después se muestra VIAJE y las seis palabras reales en orden. Por último se nombra CAMPO SEMÁNTICO y se conecta con el bloqueo en la batalla. El maestro ofrece entrenar. No fingir que ya existe una siguiente lección.

C08. Sentido pedagógico: aquí se usa «campo semántico» en el sentido amplio de asociaciones para improvisar empleado en la conversación. No afirmar que todas las palabras del recorrido son sinónimos ni que comparten necesariamente una categoría escolar estricta. La explicación distingue la relación entre significados de la búsqueda de rimas.

C09. Una ruta válida debe restaurarse exactamente: mismas palabras, misma próxima pareja, sin duplicados. La evidencia de un terminal es el historial completo de seis elecciones, no solo `completed`. Un guardado incompatible del viaje no fabrica asociaciones ni finales. El contenido lineal conserva íntegramente su contrato de restauración previo.

C10. Los assets son JPG locales, fotografías individuales verticales 9:16, subjetivas a altura de ojos, sin protagonista, manos, pies, sombra/reflejo del protagonista, texto, flechas ni interfaces incrustadas. Deben comunicar «estoy aquí y puedo avanzar hacia allí». Atmósfera realista, segura, misteriosa y agradable. Nada de láminas con varias escenas ni recortar un collage para simular fotografías originales.

C11. En cada tarjeta, marco estable, imagen centrada con cover, palabra legible y nombre accesible. Foto lenta/fallida no bloquea: se mantiene el marco y el botón, con «Imagen no disponible». Las dos tarjetas conservan el mismo ancho/alto y no encogen el texto para caber. En pantallas bajas se permite scroll manual.

C12. No alterar `training.yaml`, `image-choice-demo.yaml`, las rutas existentes ni el comportamiento del reto `image-choice`. El nuevo contenido sustituye el ejemplo de `campo_semantico.yaml` y se abre con `?campo_semantico`. Sin query, `?training` y nativo siguen usando training.

## Restricciones globales (copiar al plan)

- Trabajar en `main` para esta entrega documental; no crear ramas ni worktrees.
- Conservar `training.yaml` y los cambios ajenos; nunca confirmar todo el índice.
- No añadir dependencias ni cambiar versiones: Expo `~57.0.21`, React Native `0.86.3`, React `19.2.3`, Zod `^4.6.1`.
- Leer https://docs.expo.dev/versions/v57.0.0/ antes de escribir código.
- Mantener UX-001 y R01–R10; documentar la excepción inmersiva únicamente para `image-journey`.
- Puerta habitual: `npm test`, `npm run typecheck`, `npm run lint`, `npm run export:web`.
- `npm run test:browser` es diagnóstico opcional, no puerta obligatoria.
- No afirmar validación en DuckDuckGo Android ni Chrome iPhone sin ejecutarla en dispositivos reales.
- No publicar ni desplegar como parte de la implementación del plan.

## Decisiones de diseño para revisión

1. Un solo reto compuesto `image-journey`, dentro de `Lesson.script`; el motor lineal trata el viaje como un reto que se completa solo después del sexto tap. El dominio del grafo vive separado de los esquemas lineales.
2. Reutilizar `LessonProgress.history`: seis entradas con el mismo `challengeId` y distintos `optionId` globalmente únicos. No guardar etiquetas, resultados ni cursor derivados. El ID de opción incluye capa/nodo y destino para rechazar callbacks viejos.
3. El viaje usa fases explícitas del reducer y una vista distinta. No enviar sus taps por la animación de control→burbuja del chat. Antes/después se mantiene esa animación sin cambios.
4. Introducción de tres acciones útiles, seis decisiones visuales y cierre breve: no inflar a treinta interacciones una propuesta posterior que busca fluidez. La cuarteta y el recorrido son automáticos tras el último tap.
5. La conversación habla de «20–25 imágenes», pero el grafo final necesita 40 parejas contextualizadas: 80 referencias de imagen. Presupuesto conservador: 80 JPG originales. Puede compartirse un archivo solo tras revisión visual de todas las llegadas afectadas; no se reduce el grafo para cuadrar una estimación antigua.
6. Mantener el grafo por capas aunque se repitan palabras: `l3-barca` y `l5-barca` son nodos distintos. El recorrido puede repetir BARCA: no deduplicar palabras.
7. Guardado alternativo bajo `batalla-de-gallos:progress:v1:campo_semantico`; training conserva `batalla-de-gallos:progress:v1`. El ejemplo anterior de campo semántico no se migra a una ruta inventada; usar ID de lección nuevo `campo-semantico-viaje-v1`.
8. Antes de la primera elección, una recarga vuelve a presentar la introducción, porque las acciones narrativas no están persistidas en el motor actual. Desde la primera elección restaura el nodo exacto; después de seis, presenta el cierre completo. Esta limitación se prueba y se comunica; no rediseñar toda la persistencia de diálogos para esta lección.
9. La cuarteta final se conserva de la fuente. Su métrica no se ha certificado con un analizador: no prometer octosílabos perfectos. Las frases nuevas se rotulan en el plan como adaptación editorial.

## Excepción propuesta al contrato de conversación

El usuario pide explícitamente reproducir el viaje de la conversación, cuyo modo inmersivo dice «sin maestro» y «sin Has elegido». El plan propone añadir UX-J01–J08, acotadas al interior de `image-journey`; no sobrescribir UX-001.2/.3 para los controles normales. La aprobación del plan debe incluir esta delimitación antes de implementar.

- J01: la introducción conserva UX-001.1–.12 y R01/R07/R08/R10.
- J02: seis parejas, dos opciones válidas, pantalla inmersiva y ninguna burbuja intermedia.
- J03: pulsación visible y bloqueo de doble tap; callback anterior ignorado tras cambiar de nodo o reiniciar.
- J04: terminal en exactamente seis decisiones; transición negra sin decisiones adicionales.
- J05: cuarteta, recorrido real y explicación, en ese orden; cierre único.
- J06: restauración en cada profundidad 0–6 y reinicio explícito.
- J07: imagen fallida, texto ampliado, pantalla baja y lectura accesible.
- J08: movimiento reducido elimina el fundido, conserva orden y seis elecciones.

## Fuentes técnicas consultadas

- [Expo SDK v57](https://docs.expo.dev/versions/v57.0.0/), consultado 2026-09-20.
- Context7: `library 'React Native'` y `docs /react/react-native-website`, consultados 2026-09-20. [Imágenes locales](https://reactnative.dev/docs/images), [Pressable](https://reactnative.dev/docs/pressable), [accesibilidad](https://reactnative.dev/docs/accessibility). Context7 no proporcionó una versión 0.86 específica: usar solo las APIs comprobadas y patrones ya presentes en el repositorio, sin inferir soporte de APIs nuevas.
