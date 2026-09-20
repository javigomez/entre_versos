# UX-001 · Respuesta, conversación y scroll

Estado del comportamiento: acordado con el usuario el 11 de septiembre de 2026.
Estado de implementación y verificación: consultar `docs/ux/verification.md`.

Este documento es la fuente de verdad del comportamiento. El código actual, una captura o un test existente no lo sustituyen. Los cambios de comportamiento requieren autorización explícita del usuario, una revisión de este contrato y pruebas correspondientes. Ajustar una prueba para aceptar una regresión no es una solución.

## Alcance

Continuar, selección única, escritura de mensajes, desplazamiento e historial durante una sesión. La recuperación exacta tras recargar, la navegación «Volver» y el diseño general son requisitos separados. No cambiar el guion ni las respuestas correctas para conseguir que las pruebas pasen.

La restauración ante mejoras editoriales se especifica en el plan
2026-09-18-retos-superados-estables, P01–P07. Un logro persistido no se
revoca al cambiar la solución. El historial incompatible puede descartarse
al restaurar, sin inventar respuestas; durante la sesión siguen vigentes
UX-001.5 y UX-001.11 y los escenarios R02, R03 y R09.

## Reglas observables

| ID | Comportamiento obligatorio |
| --- | --- |
| UX-001.1 | Un tap válido da feedback visual de pulsación y bloquea activaciones duplicadas durante la transición. |
| UX-001.2 | El control pulsado, cualquiera que sea su posición vertical, asciende suavemente hasta el inicio del área de conversación, debajo de la cabecera y del margen superior. No se oculta bajo la botonera. |
| UX-001.3 | Después del desplazamiento, el control se transforma en una burbuja del jugador en esa posición. Continuar utiliza el texto del turno del jugador; selección única utiliza el texto de la opción elegida. La respuesta aparece sin recargar. |
| UX-001.4 | El maestro comienza a escribir debajo después de completarse la respuesta del jugador. No adelantar turnos del jugador que requieren Continuar. |
| UX-001.5 | `single-choice` conserva cuatro opciones, acierto/error y reintento. `image-choice` ofrece dos opciones libres: cualquier selección completa el reto y continúa el guion sin feedback de acierto/error ni reintento. |
| UX-001.6 | El ancla de toda la interacción es el inicio de la burbuja del jugador. El scroll automático nunca la sobrepasa durante los mensajes siguientes del maestro. Una nueva acción del jugador establece una nueva ancla. |
| UX-001.7 | Sin respuesta previa del jugador, el ancla es el inicio del mensaje del maestro. El scroll acompaña la escritura solo cuando esta necesita espacio y solo hasta alcanzar el ancla. |
| UX-001.8 | El contenido que no cabe se recorta en el borde inferior del área de conversación. No reducir tipografía, comprimir mensajes, truncar con puntos suspensivos ni forzar el scroll para mostrar el siguiente botón. El contenido íntegro y los controles se alcanzan mediante scroll manual. |
| UX-001.9 | Si hay contenido real debajo, mostrar una señal discreta de continuación, también cuando el corte coincide con un espacio entre mensajes. El espacio auxiliar utilizado para posicionar un turno no cuenta como contenido pendiente. |
| UX-001.10 | El desplazamiento manual toma el control: la escritura no recupera la posición ni persigue el final. La siguiente acción explícita del jugador puede iniciar una nueva transición. |
| UX-001.11 | El historial conserva mensajes e intentos en orden. No conserva botones Continuar antiguos ni parrillas antiguas de opciones. Las opciones actuales solo se muestran al final del turno correspondiente. |
| UX-001.12 | Mostrar completo finaliza únicamente el mensaje activo, exactamente una vez. Reducir movimiento mantiene el mismo orden, contenido y ancla, omitiendo desplazamientos y escritura animados. |

## Secuencia de referencia

1. El jugador pulsa Continuar.
2. El botón acusa la pulsación y asciende debajo de la cabecera.
3. Se convierte en «Si vas a hacerme entrenar, / empieza: quiero probar.»
4. Debajo se escribe «No empezarás peleando, / primero aprende el oficio; / yo te seguiré entrenando, / verso a verso, ejercicio.»
5. Aparece el siguiente Continuar. Si no cabe, queda por debajo del borde y hay que bajar manualmente.
6. Durante los pasos 3–5, el scroll automático no oculta el comienzo de la respuesta del jugador.

## Criterios de medición

La referencia geométrica es el borde superior del área desplazable más su margen interior superior, no el borde físico de la pantalla. Tolerancia de posición en comprobación visual: 3 píxeles CSS. Las pruebas unitarias verifican cálculos con medidas conocidas y las de componentes verifican órdenes y secuencia. Al comprobar visualmente, observar antes, durante y después de la escritura; una captura final no demuestra ausencia de saltos.

La transición normal debe tener desplazamiento intermedio observable cuando la distancia lo permite. Las duraciones concretas son detalles de implementación: no congelarlas como requisitos de producto. Con movimiento reducido se permite posicionamiento inmediato. Un gesto manual interrumpe el movimiento automático.

Cuando se habla de conservar toda la burbuja del jugador se presupone que cabe en el área visible. Si por texto ampliado no cabe, conservar su inicio y permitir lectura manual; no reducir la letra.

## Escenarios de regresión

| Caso | Preparación y acción | Resultado y reglas |
| --- | --- | --- |
| R01 | Sesión nueva, avanzar y pulsar Continuar | Una burbuja del jugador, maestro debajo y siguiente Continuar; .1–.4, .6 |
| R02 | Primer reto, elegir opción correcta | Burbuja visible sin recargar, un solo intento, feedback y siguiente reto; .1–.6 |
| R03 | Primer reto, elegir incorrecta y luego correcta | Dos intentos en el historial, cuatro opciones tras el error y ningún control antiguo; .5, .11 |
| R04 | Repetir desde controles cerca de arriba, centro y abajo, incluidas ambas filas de opciones | Ascenso del elemento elegido y posición final bajo cabecera; .2–.3 |
| R05 | Área visible baja y respuesta del maestro que excede su altura | Ancla estable, contenido recortado y control inferior alcanzable manualmente; .6–.9 |
| R06 | Desplazarse manualmente mientras el maestro escribe | Se conserva la posición elegida aunque siga creciendo el contenido; .10 |
| R07 | Doble tap rápido sobre una acción/opción | Una respuesta, un intento y ningún turno saltado; .1, .4 |
| R08 | Mostrar completo durante la escritura, repetir con movimiento reducido | Sin duplicados ni saltos de turnos, ancla preservada; .12 |
| R09 | Recorrer el historial tras varios intentos | Solo mensajes históricos; última parrilla activa como máximo; .11 |
| R10 | Mensaje inicial del maestro sin respuesta previa | Seguimiento limitado al inicio de ese mensaje; .7–.9 |

## Variantes image-choice

| Caso | Preparación y acción | Resultado |
| --- | --- | --- |
| I01 | Reto visual y selección izquierda o derecha | La opción elegida se transforma en una burbuja y el guion continúa. |
| I02 | Viewport estrecho o texto ampliado | Dos tarjetas conservan igual ancho y alto; la foto usa recorte centrado y scroll manual. |
| I03 | Foto lenta o fallida | Se conserva el marco, aparece «Imagen no disponible» y el botón sigue activo. |
| I04 | Restaurar una elección libre | El reto completado no reaparece; el historial conserva una sola entrada optionId. |

## Plataformas y evidencia

Usar pruebas unitarias y de componentes como protección habitual, con medidas y reloj controlados. Conservar Chromium/WebKit como diagnóstico opcional. Las pruebas sin navegador no verifican layout, pintura ni suavidad reales. Comprobar esos aspectos visualmente y, para los fallos específicos, en DuckDuckGo Android y Chrome iPhone, registrando dispositivo, sistema, versión de navegador, revisión del código y vídeo del flujo. Los dos fallos comunicados por el usuario siguen pendientes de reproducción específica hasta disponer de esa evidencia.

Una prueba pendiente no es una prueba pasada. Un test de una función identidad no protege el scroll real. No sustituir las aserciones geométricas ni de interacción por búsquedas de texto en el código fuente.
