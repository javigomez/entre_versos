# Camp semàntic · adaptació i mètrica

Validació del 21 de setembre de 2026. Font adaptada: `campo-semantico-journey.ts`,
el viatge que es mostra al web, segons la confirmació de l'usuari. El fitxer
`campo_semantico.yaml` conté un exemple antic sense versos.

Contingut: `src/infrastructure/expo/content/camp-semantic.yaml`.
Accés: `?camp-semantic` o `?content=camp-semantic`.

Les dues estrofes inicials i la revelació final s'han recreat en català amb
rima alterna. Es conserven les sis decisions, les 80 imatges i els 64 camins.
Els IDs tècnics de nodes, opcions i imatges es mantenen per reutilitzar els
assets; les paraules visibles són catalanes. «Trepar» passa a «grimpar».
La clau de contingut i l'ID de lliçó catalans separen el progrés del castellà.
Els diàlegs, la nota, l'ensenyament i el comiat són prosa, com a l'original.
Els controls generals de l'aplicació conserven el seu idioma actual.

## Comprovació reproduïble

S'ha executat el motor local de `/Users/javigomez/Documents/projects/heptasilabs`,
amb les opcions per defecte: català central, registre oral espontani i lectura
que prioritza l'heptasíl·lab. No s'han modificat les regles del motor.

```sh
node scripts/validate-camp-semantic.mjs /Users/javigomez/Documents/projects/heptasilabs
```

El script llegeix el YAML, comprova les estrofes inicials i substitueix
`{VERBO}` per cadascun dels finals presents al graf. Exigeix recompte 7 i
veredicte `VALID`; un vers invàlid fa fallar el procés. El signe `‿` indica
la unió de vocals entre mots; les majúscules marquen la darrera tònica.

```text
VALID | Ja se n'ha a-nat la GENT, (7)
VALID | so-na l'e-co del ri-VAL; (7)
VALID | t'ai-xe-ques ben len-ta-MENT: (7)
VALID | el si-len-ci‿és el fi-NAL. (7)
VALID | Ja no que-da‿a-quí la GENT, (7)
VALID | ni qui t'ha dei-xat ven-ÇUT; (7)
VALID | veus un full que mou el VENT, (7)
VALID | d'un mes-tre des-co-ne-GUT. (7)
VALID | El vi-at-ge t'ha gui-AT, (7)
VALID | ca-da mot et fa‿a-van-ÇAR; (7)
VALID | un nou món s'ha des-per-TAT, (7)
VALID | fins que‿has a-près a na-DAR. (7)
VALID | fins que‿has a-près a re-MAR. (7)
VALID | fins que‿has a-près a grim-PAR. (7)
VALID | fins que‿has a-près a vo-LAR. (7)
15/15 versos vàlids; 4 finals comprovats.
```

Són dotze versos per partida i quinze versos diferents comptant les quatre
variants del vers final. El recompte correspon a les lectures indicades pel
motor; no és una comprovació de totes les pronunciacions dialectals.

## Alternatives v2 i v3 · 2026-09-22

La v2 fa servir frases curtes i directes; la v3 explica el bloqueig amb un to
més proper i tranquil. Totes dues adapten també els diàlegs en prosa.
Les imatges i els 64 recorreguts són els mateixos, amb claus de contingut i
IDs de lliçó diferents per poder comparar-les sense barrejar el progrés.

Accés: `?camp-semantic-v2` i `?camp-semantic-v3`. La frase de selecció és
contingut editorial (`presentation.choiceHint`) a les tres versions catalanes.

### Versió 2

`node scripts/validate-camp-semantic.mjs /ruta/heptasilabs camp-semantic-v2.yaml`

```text
camp-semantic-v2.yaml
VALID | La ba-ta-lla s'ha‿a-ca-BAT. (7)
VALID | T'has que-dat sen-se res-POS-ta. (7)
VALID | El ri-val ja t'ha gua-NYAT. (7)
VALID | Po-sar-te dret tam-bé COS-ta. (7)
VALID | Ja no hi que-da nin-GÚ. (7)
VALID | El pa-per es-tà ple-GAT. (7)
VALID | U-na no-ta. Va per TU. (7)
VALID | No saps qui te l'ha dei-XAT. (7)
VALID | Has tri-at sen-se pen-SAR, (7)
VALID | tot se-guint les te-ves GA-nes; (7)
VALID | i‿has a-ca-bat per na-DAR, (7)
VALID | en-lla-çant no-ves pa-RAU-les. (7)
VALID | i‿has a-ca-bat per re-MAR, (7)
VALID | i‿has a-ca-bat per grim-PAR, (7)
VALID | i‿has a-ca-bat per vo-LAR, (7)
15/15 versos vàlids; 4 finals comprovats.
```

### Versió 3

`node scripts/validate-camp-semantic.mjs /ruta/heptasilabs camp-semantic-v3.yaml`

```text
camp-semantic-v3.yaml
VALID | A-vui no t'ha sor-tit RES. (7)
VALID | El ri-val no s'a-tu-RA-va. (7)
VALID | No sa-bi-es dir res MÉS. (7)
VALID | Tot el pú-blic se'l mi-RA-va. (7)
VALID | Veus la no-ta‿al teu cos-TAT. (7)
VALID | No saps qui te l'ha dei-XA-da. (7)
VALID | Al-gú te l'ha pre-pa-RAT (7)
VALID | men-tre‿el pú-blic ja mar-XA-va. (7)
VALID | No sa-bi-es què tri-AR, (7)
VALID | i‿has a-nat tro-bant sor-TI-des; (7)
VALID | a-ra‿et ve de gust na-DAR, (7)
VALID | les pa-rau-les van se-GUI-des. (7)
VALID | a-ra‿et ve de gust re-MAR, (7)
VALID | a-ra‿et ve de gust grim-PAR, (7)
VALID | a-ra‿et ve de gust vo-LAR, (7)
15/15 versos vàlids; 4 finals comprovats.
```
