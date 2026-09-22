# Camp semàntic v4 — disseny funcional

Data: 2026-09-22. Estat: aprovat com a base per al pla d'implementació sol·licitat el 22 de setembre de 2026.

## Objectiu

Afegir `camp-semantic-v4` com una lliçó catalana independent que comença amb
el viatge visual existent i continua, dins la mateixa conversa, amb una
pràctica breu sobre com passar d'un mot amb poca amplitud de rima a un verb
relacionat acabat en `-AR`. El fitxer es redacta de nou; el YAML rebut serveix
com a material editorial, no com a contracte ni com a font que s'hagi de
copiar.

## Experiència del jugador

1. El pròleg manté la derrota verbal, la nota i les tres respostes explícites
   del jugador.
2. El viatge conserva sis eleccions d'imatge, 64 recorreguts i els quatre
   finals `NADAR`, `REMAR`, `GRIMPAR` i `VOLAR`.
3. Després de la sisena imatge es manté J07: revelació, pregunta per veure el
   recorregut, resposta explícita, recorregut i ensenyament inicial.
4. La lliçó continua amb una resposta explícita del jugador abans de començar
   els reptes textuals. No s'avança automàticament cap torn del jugador.
5. Quatre reptes de quatre opcions curtes practiquen l'associació directa:
   `MÚSICA → CANTAR`, `SILENCI → CALLAR`, `LLUM → BRILLAR` i `FOC → CREMAR`.
6. Dos reptes de quatre opcions distingeixen entre qualsevol mot relacionat i
   una sortida útil en `-AR`: `MÚSICA → CANTAR` i `SILENCI → CALLAR`.
7. Una decisió final de dues opcions contrasta posar `MÚSICA` al final amb
   posar-la dins del vers i tancar amb `CANTAR`. S'eliminen els dos distractors
   llargs i poc plausibles del material rebut.
8. Després de l'encert final, el mestre mostra la demostració heptasil·làbica
   completa i el jugador respon `HO TINC` abans del comiat.

## Contracte de contingut

S'afegeix `text-choice` com a variant diferenciada de `single-choice`.
Comparteix avaluació, historial, feedback, reintent i transició a burbuja, però
les opcions no tenen emoji i es mostren com files de text. Accepta exactament
dues o quatre opcions, amb IDs únics i una solució existent. Cada opció queda
limitada a 44 caràcters per evitar convertir el control en un paràgraf.

Els quatre botons continuen sent el contracte de `single-choice`. El nou
`text-choice` admet dues opcions només quan la decisió és realment binària.
Amb escala de text gran o viewport excepcionalment baix no es redueix ni es
trunca el text: preval UX-001.8 i queda disponible el scroll manual. En el
viewport mòbil de referència, els textos editorials de v4 han de cabre sense
scroll inicial.

Els passos `master` admeten `kind: verse | prose`. Per compatibilitat, l'absència
de `kind` conserva el comportament actual de vers. V4 marca cada bloc de forma
explícita perquè la prosa no rebi cometes ni ajust tipogràfic de vers.

## Progrés i restauració

`LessonProgress` no canvia. `completed` continua sent el prefix estable de
reptes superats i `history` conserva els intents. El motor admet com a màxim un
`image-journey`, en qualsevol posició de la seqüència de reptes.

La restauració valida el prefix de `completed`, reprodueix l'historial en ordre
i permet continuar amb el repte següent al viatge. Un viatge complet necessita
les sis eleccions compatibles perquè el recorregut no es pot reconstruir a
partir d'un simple ID completat. Si canvia editorialment un repte textual ja
superat, es conserva el seu assoliment i es pot descartar el seu historial;
l'historial vàlid del viatge es conserva perquè és necessari per projectar el
recorregut. No s'inventen opcions, paraules ni respostes.

## Criteri editorial i mètric

No s'afirma que `MÚSICA` sigui una categoria concreta sense un inventari català
de rimes. L'explicació general utilitza la classificació atribuïda a
Díaz-Pimienta: una «paraula infeliç» té menys de cinc rimes consonants. No es
fa servir l'etiqueta «paraula trista», reservada a mots sense rima coneguda.
La distinció editorial es basa en la classificació recollida al *Método
Pimienta* i en l'explicació pública de les paraules sense rima consonant:
https://aprendemosjuntos.bbva.com/especial/el-reto-de-las-20-palabras-improvisadas-alexis-diaz-pimienta/.

L'ensenyament del viatge explica només l'associació semàntica. La tècnica de
rima s'introdueix després, evitant repetir tres vegades la mateixa explicació.

Estrofa de transició:

```text
El viatge obre el camí,
ara aprendràs a rimar;
si et llancen un mot difícil,
tindràs per on escapar.
```

Demostració final:

```text
Amb música faig camí,
i em preparo per cantar;
si la rima fuig de mi,
busco un verb per rimar.
```

Tots vuit versos han estat comprovats amb el motor local `heptasilabs` i tenen
set posicions fins a la darrera tònica amb veredicte `VALID`. La implementació
ha de tornar a executar la validació sobre el YAML final, incloses les quatre
variants de la revelació.

## Límits

- No canviar ancles, scroll, escriptura progressiva ni fases de transició.
- No modificar el contingut ni el progrés de `camp-semantic`, v2 o v3.
- No afegir dependències ni un segon format de persistència.
- No prometre absència de scroll amb escala de text gran; conservar llegibilitat
  i scroll manual d'acord amb UX-001.8.
- No publicar ni desplegar com a part d'aquesta entrega.

## Acceptació

- `?camp-semantic-v4` carrega una lliçó amb ID i progrés independents.
- Els 64 recorreguts completen el viatge i arriben al primer `text-choice`.
- Errors i encerts dels reptes textuals compleixen R03, R07 i R09.
- Una recàrrega restaura profunditats 0–6 del viatge i qualsevol repte textual
  posterior sense saltar preguntes ni respostes.
- La pregunta estratègica té dues opcions breus; la resta en té quatre.
- El validador mètric finalitza amb codi 0 per a tots els versos de v4.
- Passen `npm test`, `npm run typecheck`, `npm run lint` i
  `npm run export:web`.
