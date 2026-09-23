# Repte de dues imatges — pla d’implementació

> **Per a qui l’implementi:** fer servir `superpowers:executing-plans` per executar les tasques en ordre, amb les caselles com a seguiment. Aquest document és una proposta per revisar; no autoritza començar la implementació. No s’ha escrit codi de producte ni s’han generat JPG en aquesta entrega.

**Objectiu:** incorporar al domini un repte de dues opcions visuals i integrar-lo en la conversa existent: dos botons verticals, d’igual alçada, fotografia JPG i una paraula, amb retall centrat i l’estètica dels reptes actuals.

**Arquitectura:** ampliar `Challenge` amb una unió discriminada que conservi `single-choice` i afegeixi `image-choice`. El domini guarda referències lògiques d’imatge, infraestructura les resol a recursos empaquetats i la UI escull el component segons el tipus. Mantenir `LessonProgress`, la persistència i el protocol de transició existents.

**Tecnologies observades:** Expo ~57.0.21, React Native 0.86.3, React 19.2.3, React Native Web ^0.21.2, Zod ^4.6.1, YAML ^2.9.0, TypeScript ~6.0.3, Jest 29.7, jest-expo 57.0.5 i React Native Testing Library 14.0.1. No es proposen dependències noves.

**Especificació:** apartats 1–7 d’aquest mateix document. La implementació ha de llegir-los abans de les tasques.

**Font narrativa:** conversa «context del joc», ID `6aad49f0-cc34-83eb-ab33-98fd0c4f1fef`, especialment el simulacre NIEVE → REFUGIO → VENTANA → HUELLAS → RÍO, el grafo de sis taps i els requisits finals de fotografia vertical. Les propostes de l’assistent d’aquella conversa són context de disseny, no un contracte tècnic existent.

## 1. Abast i decisions de producte

### 1.1 Requisits explícits

- Exactament dues opcions, primera a l’esquerra i segona a la dreta, en ordre de contingut.
- Cada opció és un únic botó amb fotografia vertical a sobre i una paraula a sota.
- Igual amplada i igual alçada per a tots dos botons, també amb text ampliat.
- Fons, color de selecció, vora, tipografia i arrodoniment coherents amb els reptes existents.
- Imatge dins dels marges del botó. Omple el seu marc sense deformar-se: retall centrat lateral o superior/inferior segons la proporció d’origen.
- JPG locals organitzats a `src/infrastructure/expo/content/<lesson-key>/<challenge-id>/images/`.
- Clau de contingut per defecte: `training`. ID del repte segur per a carpetes.
- Exemple de repte complet i pla de proves concret.
- Aquesta entrega és només documentació. Els fragments YAML descriuen contingut futur, no fitxers executables creats avui.

### 1.2 Decisió confirmada per l’usuari

L’usuari ha confirmat explícitament: **«Elecció lliure: totes dues opcions permeten avançar.»** El nou tipus aplica aquesta regla, coherent amb les associacions sense errors de la conversa. `single-choice` continua avaluant encert/error. `image-choice` registra qualsevol de les dues opcions vàlides i completa el repte una sola vegada, sense `correctOptionId`, `success` ni `retry`.

No confondre «repte completat» amb «resposta correcta». Els IDs persistits a `completed` passen a significar reptes completats segons la seva regla. Per als antics, aquesta regla continua sent encertar.

Una variant futura amb avaluació requerirà una política explícita i proves pròpies. No convertir cap d’aquestes dues opcions en incorrecta ni inventar una solució fictícia.

### 1.3 Abast d’aquesta primera entrega

Inclou el nou tipus, un sol exemple jugable, compatibilitat amb els antics, resolució de recursos locals, transició existent i proves. L’elecció es converteix en una bombolla amb la paraula triada; després continua el guió. No es genera feedback d’encert/error per aquest tipus.

No inclou el graf complet, sis taps consecutius a pantalla completa, bifurcació del guió, interpolació de la quarteta final, canvis del guió principal ni producció de les vint-i-escaig imatges. Són un segon increment: afegir fotografies a un botó no resol aquestes funcionalitats.

Aquesta delimitació és deliberada: la conversa proposava amagar les bombolles durant el viatge, però UX-001 exigeix transformar el control en resposta del jugador. Aquí es conserva UX-001; un mode immersiu requerirà un contracte específic aprovat.

## 2. Restriccions globals

- Llegir `AGENTS.md`, `docs/ux/UX-001-conversacion-y-scroll.md`, `docs/ux/verification.md` i `docs/superpowers/plans/2026-09-11-ux-001.md` abans de tocar implementació.
- Consultar exactament https://docs.expo.dev/versions/v57.0.0/ abans d’escriure codi Expo. Fer servir Context7 per dubtes d’API, d’acord amb AGENTS.
- No modificar textos, ordre, IDs ni solucions de `training.yaml` per fer passar proves o introduir-hi la demostració.
- No convertir els reptes antics a un format nou només per uniformitat. Han de carregar sense migració editorial.
- No introduir Expo, React, `ImageSourcePropType`, `require`, rutes absolutes o lectures de disc al domini o a application.
- No persistir imatges, objectes de Metro, coordenades, càrrega de fotos ni estat d’animació.
- Conservar la clau d’AsyncStorage i el lector legacy `sessionId`; les escriptures segueixen utilitzant `lessonId`.
- No debilitar assercions UX ni donar per resolts els fallos geomètrics preexistents.
- Porta habitual: `npm test`, `npm run typecheck`, `npm run lint`, `npm run export:web`. Navegador només per diagnòstic opcional o comprovació visual sol·licitada.
- Preservar treball aliè. A la inspecció inicial hi havia `docs/superpowers/plans/2026-09-20-contenido-por-url.md` sense seguiment; no editar-lo ni afegir-lo a un commit d’aquesta feina.

## 3. Estat real i alternativa escollida

### 3.1 Punts d’acoblament trobats

| Fitxer actual | Supòsit que cal revisar |
| --- | --- |
| `src/domain/schemas.ts` | `Challenge` és només `single-choice`; quatre opcions amb emoji; tots els reptes exigeixen solució i feedback. |
| `src/domain/lesson.ts` | `challengesOf` només filtra `single-choice`; avançar compara sempre amb `correctOptionId`; restaurar reprodueix aquestes mateixes regles. |
| `src/application/message-projector.ts` | Cada repte produeix mestre, resposta i feedback d’encert/error. |
| `src/application/conversation-flow.ts` | `phaseFor` compta literalment només els `single-choice`; podria donar per finalitzada una lecció amb imatges pendents. |
| `src/infrastructure/expo/ui/TrainingSession.tsx` | Sempre renderitza `SingleChoiceChallenge`; ja coordina `ControlTarget`, bloqueig i persistència. |
| `src/infrastructure/expo/ui/SingleChoiceChallenge.tsx` | Rep el tipus general `Challenge`, accedeix sempre a `emoji` i dibuixa botons de 142 d’alçada. |
| `src/infrastructure/expo/ui/viewport/useConversationViewport.ts` | Mesura el botó i munta `renderPreview()` dins d’un overlay amb dimensions ja mesurades. |
| `src/infrastructure/expo/content/yaml-content-repository.ts` | Import estàtic únic de `training.yaml`; `load()` valida i retorna `Lesson`. |
| `tests/integration/content-and-restore.test.ts` | Alguns helpers assumeixen que tot `Challenge` té emoji i resposta correcta. |

`training.yaml` té `lesson.id: primera-batalla-v1`, no `training`. **Clau editorial de carpeta i identitat de progrés no són la mateixa dada.** El pla de contingut per URL existeix com a document, però els seus mòduls no existeixen en l’estat inspeccionat.

### 3.2 Alternatives considerades

1. **Afegir camps opcionals a `single-choice`.** Canvi inicial petit, però permet opcions amb emoji i imatge alhora, cap dels dos, nombre arbitrari i solució opcional difícil d’interpretar. Descartat.
2. **Unió discriminada de reptes. Recomanada.** Regles explícites per tipus, YAML antic intacte i component independent. Comparteix el motor d’avanç i el protocol de resposta.
3. **Motor de grafs i política de presentació genèrica ara.** Necessari per al viatge complet, però no per validar el nou repte. Amplia massa el canvi i la migració de progrés. Posposat amb límits explícits a l’apartat 11.

## 4. Contracte de domini i d’aplicació

### 4.1 Tipus i camps

Mantenir `single-choice` amb els camps actuals i les mateixes validacions. Exportar-ne el tipus específic `SingleChoiceChallenge` des de `schemas.ts`; a la UI, importar-lo amb àlies `SingleChoiceChallengeContent` per evitar col·lisió amb el component.

Afegir `ImageChoiceChallenge`, discriminat per `type: image-choice`:

| Camp | Contracte |
| --- | --- |
| `id` | Obligatori; slug amb expressió `^[a-z0-9]+(?:-[a-z0-9]+)*$`; estable encara que canviï la pregunta. |
| `mestre` | Text no buit, com als reptes actuals; introdueix aquest repte dins de la conversa. |
| `prompt` | Text no buit. |
| `options` | Exactament dos elements, ordenats, amb IDs diferents. |
| `options[].id` | Slug amb la mateixa regla; únic dins del repte. |
| `options[].text` | Una paraula no buida, normalitzada amb trim i sense espais interns; admet accents, apòstrofs i guions. No usar una regex ASCII per al text visible. |
| `options[].image` | Referència lògica amb `file` i `description`, tots dos obligatoris. |
| `image.file` | Nom base `^[a-z0-9]+(?:-[a-z0-9]+)*\.jpg$`; sense carpeta, URL, barra, backslash ni segments `..`. |
| `image.description` | Descripció accessible no buida; no és el nom del fitxer ni text visible a la targeta. |

Rebutjar en el nou tipus `correctOptionId`, `success`, `retry` i `emoji`, en lloc d’ignorar-los: detecta errors d’autoria. Esquema estricte per als objectes nous; no endurir globalment el YAML antic en aquesta entrega. Es permet que les dues opcions referenciïn el mateix JPG: la unicitat obligatòria és d’opcions, no de fotos.

`Challenge` passa a ser `SingleChoiceChallenge | ImageChoiceChallenge`. `LessonStep` conserva mestre, alumne i aquestes dues variants. Construir la unió de passos amb branques explícites, evitant una unió discriminada opaca dins d’una altra sense comprovar-la amb la versió instal·lada de Zod.

Exportar `isChallenge(step: LessonStep): step is Challenge` des de `schemas.ts`; no fer que schemas importi lesson, per evitar cicles. `lessonSchema` valida com a mínim un repte de qualsevol variant i IDs únics entre totes dues. No imposar la nova regla de slug retroactivament als reptes antics.

### 4.2 Regla de resolució única

Crear `src/domain/challenge.ts` per avaluar una selecció amb contracte:

- `evaluateChallengeAnswer(challenge: Challenge, optionId: string): 'invalid' | 'retry' | 'completed'`.
- Opció inexistent: `invalid`, en qualsevol variant.
- `single-choice`: `completed` quan coincideix amb la solució; `retry` altrament.
- `image-choice`: qualsevol opció existent retorna `completed`.
- No muta el repte, no genera missatges i no accedeix a infraestructura.

`submitChallengeAnswer` conserva la signatura actual. Manté les proteccions de sessió no iniciada i repte absent. Usa l’avaluador; `invalid` retorna la mateixa referència de progrés, `retry` afegeix només historial i `completed` afegeix historial i ID del repte.

`challengesOf` utilitza `isChallenge`. Tots els recomptes de finalització passen per `challengesOf`, especialment `phaseFor`. No substituir cada literal per una condició duplicada diferent.

### 4.3 Projecció i flux

`messagesFor` continua produint `Message[]` i IDs estables:

1. Tots dos tipus poden presentar `${challenge.id}-mestre` amb el text `mestre`.
2. Cada selecció vàlida produeix `answer-${index}` amb `option.text`.
3. Només `single-choice` produeix `feedback-${index}` amb encert/error.
4. `image-choice` continua amb el següent pas del guió quan acaba la bombolla; no fabrica feedback buit, «Correcto», «Has elegido» ni un Continuar extra.
5. Conservar els índexs globals de l’historial encara que una resposta no tingui feedback; els buits en numeració no són un error.
6. Finalització quan s’han completat tots els reptes, inclosos els d’imatge; etiqueta «Lección completada» una sola vegada.

No cal canviar `Message`, `FlowEvent`, `PendingReply` ni afegir fases al reducer. Es manté `ANSWER → pressing → moving → placing → writing`. Aquesta continuïtat és el motiu de conservar la bombolla del jugador en el primer increment.

### 4.4 Progrés i compatibilitat

Conservar el format `lessonId`, `started`, `completed`, `history[{challengeId, optionId}]`. Una elecció lliure és també una entrada d’historial; no guardar-hi el fitxer o la paraula perquè ja són al contingut.

`restoreProgress` segueix conservant logros vàlids i sanejant historial incompatible, ara amb l’avaluador comú. Canviar la imatge o el seu text descriptiu no revoca un repte completat. Retirar una opció pot invalidar l’historial, però no un prefix vàlid de `completed`. No canviar les garanties legacy.

El cursor continua basat en `completed.length`; això només serveix per un guió lineal. No inserir l’exemple abans dels reptes existents, perquè alteraria els prefixos de progressos guardats. Una lliçó de demo amb identitat pròpia evita aquest problema.

## 5. Contingut i recursos JPG

### 5.1 Estructura proposada

```text
src/infrastructure/expo/content/
  training.yaml                         # sense moure'l ni editar-lo
  image-choice-demo.yaml                # demo, lesson.id propi
  content-images.ts                     # registre de recursos i resolució
  validate-content-images.ts            # validació referencial del contingut
  README.md                             # instruccions per a editors
  training/
    viaje-inicial/
      images/
        nieve.jpg
        playa.jpg
      images.md                         # prompts, descripció, origen i drets
```

`<lesson-key>` és la clau editorial del contingut, per defecte `training`; no és el títol visible ni una transformació automàtica de `lesson.id`. El demo utilitza expressament el namespace `training`, tot i que el seu `lessonId` és diferent. Quan existeixi un catàleg de lliçons, el catàleg assignarà cada YAML al seu namespace; no afegir una dependència de carpetes al domini.

No moure `training.yaml` a una carpeta ni migrar els assets generals de l’aplicació. Els JPG d’aquest repte només pertanyen a aquesta carpeta. Per a una nova lecció, l’editor crea un nou namespace estable. Per als namespaces nous: `^[a-z0-9]+(?:[-_][a-z0-9]+)*$`, compatible amb `campo_semantico` del pla separat. No generar slugs en runtime a partir de títols traduïts.

### 5.2 Registre i resolució

`content-images.ts` viu a infraestructura i declara entrades literals per cada JPG. Cada entrada associa `(contentKey, challengeId, file)` a un `require` estàtic amb ruta literal al fitxer. No fer `require` amb interpolació, imports dinàmics des del YAML, `fetch` d’una ruta de `src` ni `fs` al dispositiu.

Definir `ContentImageRegistry` com a mapa immutable de namespace → ID de repte → nom de fitxer → `ImageSourcePropType`. Exportar la factoria d’infraestructura `createContentImageResolver(registry: ContentImageRegistry)`, que retorna una funció `(contentKey: string, challengeId: string, file: string) => ImageSourcePropType`; permet F02/F03 sense un registre productiu contaminat. Exportar `resolveContentImage(contentKey: string, challengeId: string, file: string): ImageSourcePropType` com a instància d’aquesta factoria amb el registre real. Fer consulta exacta amb claus pròpies, sense fallback a una altra lecció o repte. Si no existeix, llançar un error amb els tres identificadors. Consultar el registre no ha de construir una ruta arbitrària.

Exportar a infraestructura el tipus `ChallengeImageResolver`, amb signatura `(challengeId: string, file: string) => ImageSourcePropType`. `createChallengeImageResolver(contentKey: string = 'training')` retorna una funció vinculada al namespace. La UI no concatena rutes.

`validateContentImages(lesson: Lesson, resolveImage: ChallengeImageResolver): void` recorre només reptes d’imatge i comprova totes les referències, inclosa la segona opció. S’executa després de `lessonSchema.parse` i abans de retornar la lliçó. Una lliçó antiga sense imatges passa sense consultar assets.

Mantenir `ContentRepository.load(): Lesson`. Fer servir una factoria addicional `createValidatedYamlContentRepository(raw: unknown, resolveImage: ChallengeImageResolver): ContentRepository` dins de `yaml-content-repository.ts`. `createYamlContentRepository()` continua delegant amb el YAML actual i el resolver de `training`. La demo pot utilitzar la factoria addicional sense canviar la ruta d’entrada de producció.

`TrainingScreen` i `TrainingSession` reben opcionalment `resolveImage: ChallengeImageResolver`; el valor per defecte, definit a nivell de mòdul i estable, resol `training`. `TrainingScreen` el passa a `TrainingSession`. El component de repte només consumeix aquesta funció. Una composició amb altra lliçó ha d’injectar **el mateix resolver** al repositori i a la pantalla.

Errors estructurals o recursos sense registrar arriben al boundary existent. La càrrega ha de continuar dins del subarbre protegit; no executar `load()` abans del boundary. No convertir un error de contingut en un retorn silenciós a training.

### 5.3 Imatges que no es poden dibuixar

Distingir validació de contingut de fallada de render:

- Referència sense entrada al registre: error de contingut abans d’iniciar la lliçó.
- Ruta literal a un fitxer absent: error de compilació/exportació.
- Fitxer empaquetat que no es descodifica: el component conserva la caixa, mostra «Imagen no disponible» dins de la zona de foto i conserva la paraula i el botó actiu. No bloquejar la lliçó ni provocar bucle de reintents de càrrega.

L’estat d’error es comparteix amb la vista de preview. Identificar l’opció per repte i ID per no heretar un error d’una foto anterior. Reservar geometria des del primer render: `onLoad` i `onError` no han de canviar alçada ni ancla.

### 5.4 Especificació editorial dels dos JPG

Objectiu: 720 × 1280 píxels, orientació ja aplicada als píxels, RGB, JPEG real, extensió `.jpg`. Pressupost recomanat màxim de 300 KiB per fitxer; si cal més per qualitat, documentar-ho. No exigir dependències de compressió noves. Verificar mida i descodificació dels dos fitxers reals; el nom `.jpg` no demostra el format.

Composició vertical 9:16, mirada subjectiva, fotografia realista, sense protagonista, mans, peus, ombra, reflex, textos, collage ni marcs. El centre ha de conservar el subjecte i la direcció d’avanç. No cremar la paraula sobre la fotografia: el text és del botó.

No hi ha JPG adjunts recuperables en el resultat consultat de la conversa. Durant la futura implementació cal produir o aportar aquests dos assets abans de declarar la demo completa. Les proves unitàries poden simular fonts; una demo final amb rectangles o mocks no satisfà aquest apartat.

## 6. Disseny visual i transició

### 6.1 Geometria acordada per a la proposta

- Conservar els 25 punts de marge horitzontal de la conversa.
- Fila sense wrap, gap de 12, dues columnes de la mateixa amplada. No reutilitzar `width: 48%` juntament amb gap perquè pot excedir l’amplada útil en pantalles estretes.
- Amplada de cada targeta: la meitat de l’amplada interior de la fila després de restar el gap. Aplicar flex equivalent amb base 0 i capacitat de reduir amplada.
- Botó: padding de 10, vora d’1, radi de 22, fons `#303133`; selecció/pulsació `#353c2e` amb vora `c.accent`. Text `c.text`, mida 21, pes 700 i alineació central, com l’actual.
- Marc de foto: tota l’amplada interior, relació **9:16** (amplada/alçada), overflow ocult i radi de 12. La imatge ocupa el marc amb `resizeMode: cover`, centrat i sense deformació.
- Separació foto/paraula: 8. Text fora de la foto. No imposar 142 d’alçada a aquest tipus.
- Les dues targetes s’estiren a l’alçada de la més alta; zona de foto sempre igual perquè l’amplada és igual. La paraula pot ocupar més d’una línia amb text ampliat; no truncar ni reduir la font. La fila creix i es llegeix amb scroll manual.
- En un viewport de 320 d’amplada: amplada útil aproximada de 270; targeta de 129, interior de foto de 107 descomptant padding i vores; altura de foto aproximada de 190.2. Aquesta és una comprovació orientativa de la fórmula, no un snapshot obligatori de píxels natius.
- No reduir les fotos per forçar que tot càpiga en una pantalla baixa; mantenir UX-001.8.

### 6.2 Components

Crear `ChallengeView.tsx` com a selector exhaustiu de variants. Les props comunes són `challenge`, `onAnswer`, `disabled`, `selectedOptionId` i `resolveImage`. Per `single-choice`, passar un tipus ja acotat al component existent. Per `image-choice`, renderitzar `ImageChoiceChallenge`.

Crear `ImageChoiceChallenge.tsx`: prompt i instrucció curta «Elige un camino», dues opcions i cap peu que parli d’encerts o reintents. No canviar el text del component antic.

Crear `ImageChoiceOption.tsx`: únic `Pressable` amb referència al botó complet, càrrega/fallada de foto i `ControlTarget`. Compartir una vista visual interna entre botó i preview. No crear un segon botó accessible dins de l’overlay.

La preview ha d’omplir el rectangle mesurat del control amb amplada/alçada del 100%, sense repetir `flex: 1` o l’amplada de mitja fila en un pare que ja té l’amplada d’una targeta. Aquest error faria que el botó es reduís a la meitat durant la transició. La foto, text, fallback, padding i estat seleccionat han de coincidir amb el botó real.

La targeta completa activa la mateixa opció. La imatge no té gest ni focus propi. Nom accessible del botó: paraula de l’opció; descripció com a ajuda accessible. Marcar `disabled` i `selected` com als controls actuals; evitar que lector de pantalla anunciï la imatge com una segona resposta.

Reutilitzar colors ja existents i les xifres anteriors. No cal refactoritzar tots els botons ni crear un sistema genèric de temes per aquest canvi.

### 6.3 UX-001 i documentació normativa

Durant la implementació, afegir a UX-001 una precisió de variants: `single-choice` conserva quatre opcions i reintent; `image-choice` té dues opcions lliures i continua després de la resposta sense feedback d’encert/error. No substituir ni relaxar R03: segueix protegint els quatre botons antics.

Afegir escenaris I01–I04 al contracte: I01 selecció esquerra/dreta, I02 geometria i retall, I03 foto lenta/fallida, I04 restauració d’elecció lliure. Associar-los també als R existents segons la matriu de proves. No activar el mode immersiu sense el seu canvi explícit de contracte.

## 7. Repte de prova complet

Contingut futur de `image-choice-demo.yaml`; aquesta definició dins del pla és el repte de prova generat:

```yaml
id: image-choice-demo-v1
startAction: Empezar el viaje
script:
  - type: mestre
    text: Una palabra puede abrir más de un camino.
  - type: image-choice
    id: viaje-inicial
    mestre: Mira los dos paisajes y déjate llevar.
    prompt: ¿Dónde empieza tu viaje?
    options:
      - id: nieve
        text: NIEVE
        image:
          file: nieve.jpg
          description: Un sendero nevado avanza entre pinos hacia un refugio lejano.
      - id: playa
        text: PLAYA
        image:
          file: playa.jpg
          description: Un sendero entre dunas desciende hacia una playa de agua turquesa.
  - type: mestre
    text: Has elegido un punto de partida. Una palabra puede llevarte a otra.
completion: Ya has dado el primer paso.
```

El demo no afirma haber completat el viatge de sis decisions. En totes dues opcions, `completed` passa a `['viaje-inicial']`; l’historial conté exactament la selecció feta. No hi ha solució ni retry. El català és l’idioma del pla; el castellà es manté per al contingut de prova, coherent amb el guió i la conversa.

**Prompt de NIEVE:** fotografia vertical 9:16, 720 × 1280 com a objectiu d’exportació. Mirada a l’alçada dels ulls sobre un sender de neu entre pins. El camí entra des de la part inferior central i condueix cap a un petit refugi distant. Llum natural freda, atmosfera tranquil·la i aventurera, textura realista i profunditat. El refugi i el camí es mantenen a la zona central. Sense protagonista, parts del cos, ombres o reflexos del protagonista, text ni gràfics.

**Prompt de PLAYA:** fotografia vertical 9:16, 720 × 1280 com a objectiu d’exportació. Mirada a l’alçada dels ulls des d’un sender entre dunes que baixa cap a una platja i el mar turquesa. Línia d’avanç des de la part inferior central fins a l’aigua, llum càlida natural, profunditat i sensació de caminar cap al mar. Subjecte central recognoscible després de retall. Sense persones principals, cos, mans, peus, ombra o reflex del protagonista, text ni gràfics.

La persona que generi els JPG ha d’inspeccionar orientació i contingut real; demanar «vertical» no prova que el resultat ho sigui.

## 8. Pla de proves: 61 casos automatitzats nous

Els números són casos lògics nous, no el total actual de la suite. Cada fila equival a un `test`; els escenaris combinats es mantenen en una seqüència d’interacció quan així s’indica. Si es parametritzen, documentar l’augment del recompte. No comptar fixtures, typecheck o inspeccions manuals com a tests Jest.

### A. Esquemes: 12 casos (`src/domain/schemas.test.ts`)

| ID | Entrada i asserció |
| --- | --- |
| S01 | Parsejar el demo exacte de l’apartat 7: acceptat i ordre NIEVE/PLAYA conservat. |
| S02 | Repte d’imatges amb una opció: rebutjat a `options`. |
| S03 | Repte amb tres opcions: rebutjat a `options`. |
| S04 | Dues opcions amb el mateix ID: rebutjat. |
| S05 | Mateix ID de repte entre tipus antic i nou: lliçó rebutjada. |
| S06 | `image.file` absent i després `description` buida: tots dos rebutjats amb ubicació del camp. |
| S07 | Taula de noms de foto: `../foto.jpg`, `/foto.jpg`, `a/b.jpg`, URL, backslash, `foto.png`, `foto.JPG`: rebutjats; `nieve-01.jpg`: acceptat. |
| S08 | Slugs de repte i opció amb espais, accents, slash o punts: rebutjats; slugs amb guió: acceptats. |
| S09 | `text` buit o de dues paraules: rebutjat; `RÍO` i paraula amb apòstrof: acceptats. |
| S10 | Camp de solució, feedback o emoji en el tipus nou: rebutjat, no silenciosament eliminat. |
| S11 | Lliçó amb només repte d’imatges: vàlida; sense cap repte: invàlida. |
| S12 | Variant antiga amb quatre opcions: vàlida; amb dues: invàlida; emoji continua obligatori. |

### B. Domini i restauració: 12 casos (`src/domain/lesson.test.ts`)

| ID | Acció i asserció |
| --- | --- |
| D01 | `challengesOf` sobre guió antic → imatge → antic: retorna els tres en ordre. |
| D02 | Avaluador d’imatges: opció esquerra retorna `completed`, inexistent retorna `invalid`. |
| D03 | Respondre NIEVE: un completat i un registre `{challengeId: viaje-inicial, optionId: nieve}`. |
| D04 | Respondre PLAYA des de progrés inicial separat: mateix completat, historial amb `playa`. |
| D05 | ID desconegut: mateix objecte de progrés, cap intent. |
| D06 | Respondre abans d’iniciar: mateix objecte. |
| D07 | Respondre després de finalitzar: mateix objecte. |
| D08 | Error antic → aciert antic → imatge → antic: cursor i historial correctes en cada pas. |
| D09 | Serialitzar JSON i restaurar una selecció d’imatge: progrés idèntic. |
| D10 | Mateix round trip amb `sessionId` legacy: normalitza a `lessonId`, mai escriu `sessionId`. |
| D11 | Editar fitxer/descripció d’imatge mantenint IDs: no perd completat ni historial. |
| D12 | Retirar una opció triada d’un repte ja completat: preserva prefix de completats i saneja historial incompatible sense inventar selecció. |

### C. Aplicació: 8 casos

`src/application/message-projector.test.ts`: A01–A04. `src/application/conversation-flow.test.ts`: A05–A08.

| ID | Acció i asserció |
| --- | --- |
| A01 | Elecció lliure projecta una resposta amb la paraula triada i cap feedback d’encert/error. |
| A02 | Guió mixt: missatges existents continuen com a prefix estable després de seleccionar una imatge. |
| A03 | Historial amb resposta lliure seguida de resposta avaluada: IDs globals correctes i únics, sense feedback buit. |
| A04 | Últim repte d’imatges completat: un únic missatge de finalització amb etiqueta actual. |
| A05 | Lliçó només d’imatges començada: `waiting-choice`, mai `finished` abans de respondre. |
| A06 | ANSWER espera PRESS_DONE/MOVE_DONE/PLACED; progrés es confirma a MOVE_DONE com abans, i escriptura no s’avança. |
| A07 | Dues respostes en la mateixa fase pressing: només la primera crea pending. |
| A08 | RESET durant selecció i callbacks amb token antic: no recuperen l’elecció esborrada. |

### D. Infraestructura i composició: 9 casos

`tests/integration/content-images.test.ts`: F01–F06. `tests/components/TrainingScreen.test.tsx`: F07–F08. `tests/components/ImageChoiceDemo.test.tsx`: F09.

| ID | Acció i asserció |
| --- | --- |
| F01 | Resolver default `training`: troba ambdues imatges del demo. |
| F02 | Mateix nom `nieve.jpg` en dos namespaces simulats: resol recursos diferents sense contaminació. |
| F03 | Mateix nom en dos reptes del mateix namespace simulat: resol recursos diferents. |
| F04 | Referència absent, inclosa la de la segona opció: validació falla abans d’entregar la lliçó. |
| F05 | Repositori antic sense imatges: contingut equivalent, cap resolució de foto. |
| F06 | YAML demo real → validació → elecció → JSON → restauració: torna al progrés correcte amb la mateixa paraula projectada. |
| F07 | TrainingScreen rep resolver diferent: el passa a la sessió i mostra els recursos injectats, sense utilitzar training. |
| F08 | `load()` llança error de recursos sota el boundary real d’App: missatge d’error existent, sense pantalla blanca. Aquest cas pot residir a `tests/components/App.test.tsx` si facilita muntar el boundary real. |
| F09 | Muntar el demo i seleccionar una opció: el seu repositori en memòria desa/recupera el progrés; AsyncStorage no rep lectures ni escriptures i el guardat principal preexistent continua intacte. |

Per F02/F03 el registre de prova s’injecta a una factoria interna de resolver que consumeix un mapa immutable; producció usa el mapa estàtic real. No afegir assets artificials al catàleg productiu per satisfer tests. Les proves de límits de capes existents s’han d’executar, sense contar-les com a noves.

### E. Components visuals: 10 casos (`tests/components/ImageChoiceChallenge.test.tsx`)

| ID | Acció i asserció |
| --- | --- |
| C01 | Dos botons accessibles en ordre NIEVE/PLAYA, cadascun amb foto i paraula; cap emoji. |
| C02 | Press esquerra: callback amb `nieve` i ControlTarget amb ref del botó esquerre. |
| C03 | Press dreta: callback amb `playa` i ref diferent del botó dret. |
| C04 | Disabled: dues opcions desactivades i zero callbacks encara que s’invoqui press. |
| C05 | Selected: només l’opció triada informa `selected` i aplica estil de selecció. |
| C06 | `renderPreview()` del target: mateixa foto i text, vista no interactiva que omple el contenidor mesurat. |
| C07 | `onLoad` tardà: marc amb proporció/amplada reservades des del principi, cap canvi de geometria declarada. |
| C08 | `onError`: fallback visible, paraula conservada, botó activable i preview amb el mateix fallback. |
| C09 | Canvi a altre repte amb IDs d’opció repetits: font correcta i estat d’error anterior eliminat. |
| C10 | Contracte accessible: només dos punts d’activació, noms iguals a les paraules, ajudes descriptives i imatges sense focus propi. |

C06/C07 comproven estructura i props, no píxels. La igualtat d’alçades, retall i absència de salts reals requereixen també V01–V04.

### F. Interacció de sessió: 10 casos (`tests/components/TrainingSession.test.tsx`)

| ID | Acció i asserció | UX |
| --- | --- | --- |
| U01 | Selecció esquerra: selected/disabled → move → place → bombolla NIEVE → següent missatge. | I01; R02, R04; .1–.4 |
| U02 | Selecció dreta en altra posició mesurada: target dret i resposta PLAYA sense repetir esquerra. | I01; R02, R04; .2–.3 |
| U03 | Doble press esquerra/dreta dins del mateix act abans de repintar: una transició i un guardat. | R07; .1 |
| U04 | Guió mixt antic → imatge → antic, amb error al segon antic: opcions i reintents correctes, sense controls històrics. | R03, R09; .5, .11 |
| U05 | Mida visible baixa i targeta alta amb bindings reals i mesures controlades: no scroll forçat a mostrar següent control; senyal de contingut real. | I02; R05; .6–.9 |
| U06 | Gesto manual durant moviment d’imatge amb controlador real: interrupció, selecció conservada i cap recaptura de scroll en créixer el mestre. | R06; .10 |
| U07 | Moviment reduït i Mostrar completo: mateix ordre i un sol avanç per missatge. | R08; .12 |
| U08 | Restaurar elecció desada: no torna la parella completada; només missatges i següent repte. | I04; R09; .11 |
| U09 | RESET durant moving i alliberar callback tardà: resta al principi sense tornar a guardar el repte. | R07, R08 |
| U10 | Seqüència amb una foto fallida: triar-la, completar i guardar una sola vegada; cap bloqueig ni missatge d’error de lliçó. | I03; R02 |

Fer servir el helper `createControlledViewport` existent per U01–U04, U07–U10. Per U05/U06 exercitar el hook/bindings reals amb mesures i esdeveniments; un `interrupt()` buit en un mock no verifica l’aturada del scroll. No mockejar tota TrainingSession ni tot el component nou.

### Recompte i controls existents

12 esquemes + 12 domini + 8 aplicació + 9 infraestructura/composició + 10 components + 10 interacció = **61 casos nous**.

Conservar totes les proves existents. R01 i R10 continuen amb les proves antigues; R02–R09 tenen extensió de tipus segons la taula. Typecheck ha de descobrir tots els accessos a `.emoji`, `.correctOptionId`, `.success` i `.retry` sobre la nova unió: acotar-los pel discriminant, no ocultar-los amb casts.

### Comprovacions visuals: 6 escenaris addicionals, no Jest

| ID | Preparació | Resultat que cal observar |
| --- | --- | --- |
| V01 | Viewports 320×568, 390×844 i 430×900; fonts normals | Una fila, igual alçada/amplada, marges i gap íntegres, fotos verticals sense desbordament horitzontal. |
| V02 | Fonts ampliades aproximadament al 200%, etiqueta llarga d’una paraula | Text complet, dues targetes d’igual alçada, lectura per scroll i cap reducció artificial de font. |
| V03 | Font de prova apaïsada i una de molt alta amb centre marcat | `cover` retalla laterals en un cas i dalt/baix en l’altre; centre queda al centre. No posar aquests assets al catàleg productiu. |
| V04 | Càrrega lenta/fallada simulada abans i durant la selecció | Cap canvi d’alçada ni salt de contingut, fallback estable. |
| V05 | Seleccionar esquerra i dreta a diverses posicions; repetir amb moviment reduït | Preview sense canvi de mida, transformació contínua, ancla dins tolerància de 3 píxels CSS quan es mesuri. |
| V06 | Exportació web servida sota el baseUrl configurat, primera visita i recàrrega | Tots dos JPG es carreguen des d’URLs generades; cap dependència del servidor de desenvolupament ni ruta absoluta `/src`. |

V01–V06 són guió de verificació visual per a l’execució, no proves executades avui. Registrar plataforma i resultats. Chromium/WebKit no equivalen a DuckDuckGo Android ni Chrome iPhone reals. Els dos dispositius reals continuen sent pendents si no estan disponibles.

## 9. Tasques d’implementació, en ordre

### Tasca 1 — Fixar el contracte i reproduir el buit funcional

**Fitxers:** `docs/ux/UX-001-conversacion-y-scroll.md`, `tests/fixtures/image-choice.ts`, `tests/components/TrainingSession.test.tsx`, `src/domain/schemas.test.ts`.

**Entrada:** disseny revisat, política d’elecció lliure i UX existent. **Sortida:** fixture de demo i reproducció d’interacció U01, més S01/S02, inicialment vermells.

- [ ] Llegir la decisió ja confirmada d’elecció lliure; no tornar a demanar aquesta preferència. La implementació només comença quan l’usuari encarregui executar el pla.
- [ ] Registrar estat de Git i executar la porta habitual per obtenir baseline real. Separar errors previs dels nous.
- [ ] Afegir el fixture exactament equivalent a l’apartat 7. Per al primer vermell d’interacció, admetre un cast temporal i local del fixture desconegut; retirar-lo a la tasca 2.
- [ ] Muntar sessió iniciada amb el fixture i resolver simulat; fer avançar el primer missatge; cercar NIEVE com a botó i intentar seleccionar-lo.
- [ ] Executar `npx jest --runInBand tests/components/TrainingSession.test.tsx -t U01`. El vermell esperat és que la UI no ofereix el repte correctament; no acceptar com a reproducció un error de sintaxi del test.
- [ ] Escriure S01/S02 i executar `npx jest --runInBand src/domain/schemas.test.ts`; registrar el rebuig del nou tipus com a vermell esperat.
- [ ] Documentar I01–I04 i l’aclariment de variants de UX-001.5 sense canviar R03 antic. Encara no implementar components.

### Tasca 2 — Unió de reptes, avaluació i restauració

**Fitxers:** modificar `src/domain/schemas.ts`, `src/domain/lesson.ts`, JSDoc de `src/domain/lesson-progress.ts`; crear `src/domain/challenge.ts`; proves S01–S12 i D01–D12.

**Entrada:** YAML i fixture. **Sortida:** tipus discriminats, `isChallenge`, `evaluateChallengeAnswer`, signatures antigues de lesson intactes.

- [ ] Completar els 12 casos S i observar els vermells corresponents.
- [ ] Separar esquema antic, esquema nou i unió; exportar tipus específics i guard. Construir LessonStep amb les quatre branques explícites.
- [ ] Acotar el fixture amb el tipus real i retirar el cast temporal.
- [ ] Escriure D01–D12; executar `npx jest --runInBand src/domain/schemas.test.ts src/domain/lesson.test.ts` abans de canviar l’avaluació.
- [ ] Implementar la regla descrita a 4.2 i utilitzar-la a submit. Conservar guards, immutabilitat i retorn de mateixa referència per invalidació.
- [ ] Actualitzar el filtre i revisar restauració per garantir que reprodueix les mateixes regles. No reescriure el format de progrés.
- [ ] Actualitzar JSDoc: completat segons variant; no implica sempre encert.
- [ ] Reexecutar proves de domini i `npm run typecheck`. Els errors de consumidors que encara falten s’han d’identificar explícitament i resoldre a la tasca següent; no presentar aquest estat intermedi com a entrega verda.

### Tasca 3 — Projecció, recompte i consumidors

**Fitxers:** `src/application/message-projector.ts`, `src/application/conversation-flow.ts`, els dos fitxers de test corresponents, `tests/integration/content-and-restore.test.ts`, tipus de props de `SingleChoiceChallenge.tsx`.

**Entrada:** unió i avaluador. **Sortida:** motor lineal compatible amb ambdues variants, A01–A08 verds.

- [ ] Escriure A01–A08 amb oracles de la taula; observar especialment A05 vermell pel recompte antic.
- [ ] Fer servir `challengesOf` a phaseFor; eliminar el recompte literal de `single-choice`.
- [ ] Acotar la projecció de feedback pel discriminant; conservar resposta, IDs globals i prefix de missatges.
- [ ] Cercar tots els usos de `single-choice`, `Challenge`, `correctOptionId` i `emoji` a `src` i `tests`; revisar cada ús, sense substitució massiva.
- [ ] Canviar props del component antic al tipus específic. Als tests que intencionadament només processen contingut antic, posar un guard explícit; als helpers genèrics, tractar totes dues variants.
- [ ] Executar `npx jest --runInBand src/application tests/integration/content-and-restore.test.ts` i `npm run typecheck`. No introduir `any` per silenciar errors de la unió.

### Tasca 4 — JPG, registre i repositori validat

**Fitxers:** crear els elements nous de contingut de 5.1 (dos JPG, images.md, README, registre i validador), `image-choice-demo.yaml`, `tests/integration/content-images.test.ts`; modificar `yaml-content-repository.ts`.

**Entrada:** namespace `training`, ID `viaje-inicial`, dos prompts. **Sortida:** resolver estàtic i repositori validat disponibles per producció i proves.

- [ ] Produir o incorporar els dos JPG segons 5.4 i 7; inspeccionar-los. Registrar dimensió, pes, origen i drets a images.md.
- [ ] Crear el YAML demo literal de l’apartat 7; no modificar training.yaml.
- [ ] Escriure F01–F06 i observar fallada abans del registre.
- [ ] Crear registre amb requires literals, resolver exacte, factoria vinculada al namespace i validador referencial. La factoria interna injectable per F02/F03 ha de compartir el mateix algorisme que el resolver real.
- [ ] Afegir `createValidatedYamlContentRepository` sense alterar el contracte del port ContentRepository; conservar la factoria actual sense arguments.
- [ ] Escriure README amb seqüència editorial: carpeta → dos JPG → YAML → registre → validació → exportació. Explicar diferència entre contentKey i lessonId.
- [ ] Executar `npx jest --runInBand tests/integration/content-images.test.ts tests/integration/layer-boundaries.test.ts` i `npm run export:web`. Un mock de JPG no substitueix l’exportació real.

### Tasca 5 — Botons d’imatge i preview

**Fitxers:** crear `ui/ChallengeView.tsx`, `ui/ImageChoiceChallenge.tsx`, `ui/ImageChoiceOption.tsx`, `tests/components/ImageChoiceChallenge.test.tsx` sota les carpetes indicades; modificar només l’acotació de props del component antic si no s’ha fet.

**Entrada:** tipus específics i resolver d’infraestructura. **Sortida:** parella de botons i ControlTarget compatible, C01–C10 verds.

- [ ] Escriure C01–C10; esperar vermell per component absent i després per comportament absent, no mantenir tests que només importen.
- [ ] Implementar fila i geometria 6.1. Reservar marc abans de carregar la foto.
- [ ] Implementar botó únic, accessibilitat i bloqueig; obtenir ref del Pressable complet.
- [ ] Fer servir la mateixa vista visual en botó i preview, amb geometria pròpia del context. Compartir fallback amb preview.
- [ ] Crear selector exhaustiu; no fer fallback silenciós d’un tipus desconegut a single-choice.
- [ ] Executar `npx jest --runInBand tests/components/ImageChoiceChallenge.test.tsx` i `npm run typecheck`.

### Tasca 6 — Connexió a la sessió i regressions d’interacció

**Fitxers:** `TrainingScreen.tsx`, `TrainingSession.tsx`, tests de tots dos, possible test d’App per F08; no canviar el controlador de scroll tret que una prova nova mostri un defecte necessari per aquest repte.

**Entrada:** ChallengeView i resolver. **Sortida:** demo completament jugable sota la conversa existent, F07/F08 i U01–U10 verds.

- [ ] Afegir prop opcional de resolver amb default estable i passar-la pantalla → sessió → ChallengeView.
- [ ] Substituir el render incondicional del component antic per ChallengeView sense canviar condicions de fases.
- [ ] Reexecutar el vermell U01 de la tasca 1 i verificar que ara completa moviment, col·locació i resposta.
- [ ] Completar F07/F08 i U02–U10 amb el controlador adequat; observar vermells abans de corregir cada connexió.
- [ ] Verificar que `onProgressChange` es crida una vegada per selecció acceptada, no per càrrega d’imatge ni caràcter escrit.
- [ ] Executar `npx jest --runInBand tests/components/TrainingSession.test.tsx tests/components/TrainingScreen.test.tsx tests/components/ImageChoiceChallenge.test.tsx tests/integration/content-images.test.ts` i el test d’App si s’ha creat.
- [ ] Executar la suite existent de viewport per confirmar que no s’han alterat ancla, senyal ni interrupció.

### Tasca 7 — Demo, verificació i entrega

**Fitxers:** crear `src/infrastructure/expo/ui/ImageChoiceDemo.tsx`, `tests/components/ImageChoiceDemo.test.tsx` i `docs/ux/image-choice-verification.md`; actualitzar `docs/ux/verification.md` amb enllaç i resultats reals, sense esborrar evidència anterior.

**Entrada:** feature integrada i assets reals. **Sortida:** demo importable i informe amb resultats i límits.

- [ ] Escriure F09 i executar `npx jest --runInBand tests/components/ImageChoiceDemo.test.tsx` per observar el vermell inicial; després de crear el demo, repetir i comprovar el verd.
- [ ] Crear ImageChoiceDemo que compongui TrainingScreen, el repositori validat del YAML demo, el resolver `training` i un repositori de progrés en memòria. L’últim desa/carrega només en aquesta instància; no escriu a AsyncStorage ni toca el progrés principal.
- [ ] Per veure-la si encara no hi ha selector de contingut, utilitzar una entrada Expo temporal local que registri el demo dins de SafeAreaProvider i el mateix marc de 430 que App. Restaurar l’entrada abans d’entregar; no publicar un bypass de prova ni substituir training per defecte. Documentar a l’informe com s’ha muntat.
- [ ] Si el pla de contingut per URL ja està implementat en executar aquesta tasca, registrar el demo com a contingut explícit amb namespace training i conservar l’aïllament de progrés. No pressupossar els noms dels mòduls: comprovar la implementació real i no modificar retroactivament el pla aliè.
- [ ] Executar, en aquest ordre: `npm test`, `npm run typecheck`, `npm run lint`, `npm run export:web`. Registrar nombre real de casos i sortida de cada ordre.
- [ ] Inspeccionar assets exportats: ambdós JPG presents i referenciats pel bundle de la demo quan s’exporta la seva entrada; no esperar que Metro empaqueti un mòdul que no forma part del graf d’imports. Verificar també l’exportació normal de producció després de restaurar l’entrada.
- [ ] Fer V01–V06 quan hi hagi comprovació visual disponible/sol·licitada. Si no s’executen, etiquetar-les «no executada» i no declarar validada la geometria real.
- [ ] Si s’executa el diagnòstic opcional `npm run test:browser`, registrar errors R01 previs separadament. No convertir-los en skips ni passar a verd canviant toleràncies.
- [ ] Revisar `git diff --check`, estat, diff i contingut dels fitxers nous. Confirmar que no s’ha modificat el guió principal ni el treball previ.
- [ ] Si es fan commits durant l’execució, seleccionar només fitxers/hunks propis; no usar `git add .` ni confirmar tot l’índex.

## 10. Criteris de tancament i punts de revisió

La implementació estarà preparada per entregar quan:

1. El YAML antic segueixi carregant sense cap canvi; els reptes antics segueixin tenint quatre opcions i la mateixa avaluació.
2. El nou YAML validi dues opcions amb imatge i rebutgi contingut ambigu.
3. Totes dues seleccions completin el repte de prova i persisteixin una única entrada correcta d’historial.
4. El final de lliçó compti tots els tipus i la restauració conservi compatibilitat legacy.
5. No hi hagi dependències d’imatge/Expo fora d’infraestructura.
6. La demo utilitzi dos JPG reals organitzats segons la proposta.
7. Les 61 proves noves i la porta habitual passin, amb recompte real documentat i sense assercions debilitades.
8. La validació visual estigui identificada com a executada o pendent per plataforma, sense confondre estils declarats amb píxels reals.

Cinc riscos a revisar expressament i les seves proves propietàries:

- Concloure prematurament una lliçó només d’imatges: A05, tasca 3.
- Confondre `training` amb `primera-batalla-v1`: F01/F07, tasques 4/6.
- Reduir la preview a mitja amplada una altra vegada: C06 + V05, tasca 5.
- Perdre l’ancla quan carrega o falla un JPG: C07/C08 + U05 + V04, tasques 5/6.
- Contaminar el progrés real durant la demo: F09, composició en memòria i inspecció de l’emmagatzematge a la tasca 7; no usar el repositori d’AsyncStorage dins d’ImageChoiceDemo.

## 11. Com encaixarà posteriorment el viatge complet

Aquest tipus prepara les opcions visuals, però **no implementa un graf**. Per fer el viatge de la conversa caldrà un pla separat amb:

- Un repte agregat de viatge amb nodes interns identificats per etapa i concepte; la mateixa paraula pot existir en etapes diferents.
- Dues arestes per node no terminal, validació de destins, absència de cicles indeguts i exactament sis decisions fins al final.
- Historial intern de node/opció i cursor de node, perquè `completed.length` no identifica una branca.
- Regla de completar el repte agregat només al terminal, no després de cada foto.
- Mode de presentació immersiu que no projecti bombolles entre les sis eleccions, amb contracte UX propi.
- Recapitulació del camí real i interpolació del verb final, separades de la regla d’avanç.
- Reutilització de `ImageChoiceOption` i del sistema de recursos. Les fotos del graf pertanyeran a la carpeta del repte agregat, amb noms contextuals si una paraula necessita diverses escenes.

El graf de la conversa no s’ha de copiar com si ja estigués validat: a la cinquena decisió hi apareix ROCA com a destí, però la taula final de sisè tap no en defineix sortida. A més, conceptes com BARCA i ALTURA es repeteixen en etapes diferents. Caldrà tancar totes les transicions i comptar nodes/assets reals; «20–25 imatges» era una estimació, no un inventari verificat.

No afegir `nextId`, plantilles dinàmiques o camps de graf buits als reptes d’aquesta primera entrega. La unió discriminada deixa lloc per afegir aquell agregat sense debilitar els tipus actuals.

## 12. Fonts tècniques i estat de verificació del pla

- [Expo SDK 57, referència versionada](https://docs.expo.dev/versions/v57.0.0/): consultada per verificar la correspondència del SDK amb React Native 0.86.
- [React Native, imatges estàtiques](https://reactnative.dev/docs/images): registre amb referències literals i empaquetament de recursos. Consulta complementària de Context7 a `/react/react-native-website`.
- [React Native, component Image](https://reactnative.dev/docs/image): propietats de render, càrrega i fallada; confirmar la versió 0.86 en implementar si canvia la versió seleccionada pel web.
- [React Native, estils d’imatge](https://github.com/react/react-native-website/blob/main/docs/image-style-props.md): `cover` i dimensions del marc, consultats a través de Context7.

El pla s’ha basat en lectura del codi i dels contractes; no s’han executat tests de producte ni generat/exportat l’aplicació en aquesta entrega documental. Els resultats històrics de verification.md no són resultats nous. Abans d’executar, tornar a comprovar el working tree, perquè el pla de contingut per URL pot haver avançat en paral·lel.
