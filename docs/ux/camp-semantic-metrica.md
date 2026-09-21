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
