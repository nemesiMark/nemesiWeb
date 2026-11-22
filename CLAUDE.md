# Nemesi — sito personale di Mark (web designer)

## Cos'è
Sito vetrina/portfolio di Nemesi Web, lo studio di web design di Mark. Dalla 2.0 (21/11/2026) è rifatto da zero: una pagina unica «scroll-film» in puro codice (skill `sito-film`, Corsia A), con il concept «Dritto e rovescio» (dettagli in `BRIEF.md`).
Un solo oggetto 3D porta tutti i lavori: la «lastra», nera laccata, a due strati, con il bordo verde come le facce del logo. La camera va solo avanti.
Dalla 3.0 il colore d'accento è il verde lime `#CDFD67` (prima era arancio): nel codice le variabili si chiamano ancora `--arancio*` e `COL.arancio`, ma contengono i verdi.

Capitoli:
1. Apertura: prima il logo in 3D (`js/logo3d.js`), che si compone a strisce come in un segnale disturbato e poi piove via; poi le aste 3D (i pezzi della lastra in vista esplosa, sempre in movimento). Scorrendo compongono la lastra distesa, una riga di luce la salda e la lastra si alza. Il logo sta solo nella barra.
2. Siti: Rain Ink 01, Olimp 02.
3. App: Word 03, Excel 04 (ex Parola e Foglio; repository e immagini si chiamano ancora `parola` e `foglio`), con la lastra sdoppiata.
4. Giochi: Metal Gear 05, attraversamento in pixel, anelli, Radente 06.
5. Scrivimi: faccia vuota con «Manca solo il tuo progetto.», bottone Scrivimi ed email.

Per ora c'è solo questo (Siti, App, Giochi, Scrivimi): niente sezioni nuove senza richiesta.

Dove sono i lavori:
- Rain Ink: `~/Desktop/Sites/inkubo`
- Olimp: `~/Desktop/Sites/olimp`, online come `/trama/`
- App e giochi: `~/Desktop/Apps`
- Tutti online su `nemesimark.github.io/<repo>/`

## Dove sta online
- Repository GitHub pubblico: https://github.com/nemesiMark/nemesiWeb (ramo `main`).
- Online con GitHub Pages: https://nemesimark.github.io/nemesiWeb/ (si aggiorna a ogni push su main).
- Fuori dal repository (in `.git/info/exclude`): `chat-*.txt`, `riepilogo-*.txt`, `archivio/`, `graphify-out/`, `.DS_Store`.

## Come si prova in locale
```bash
cd ~/Desktop/Sites/site-nemesi && python3 -m http.server 8765   # poi http://localhost:8765
```
Funziona anche con doppio clic su `index.html`. Da `file://` il browser non legge immagini (in WebGL) e caratteri locali, quindi arrivano incorporati da `js/lavori-dati.js` e `js/caratteri-dati.js`, caricati solo in quel caso.

Verifiche (skill sito-film, cartella `~/.claude/skills/sito-film/scripts`):
- `node copy-gate.js ~/Desktop/Sites/site-nemesi/index.html`: deve uscire 0.
- `node verify.js shot "http://localhost:8765/?jump=<y>" out.png 1440 900` (e `390 844` per il telefono).
  - La fine del film è a `K.end` (12,1) × altezza dello schermo: 10890 a 1440×900.
  - `?jump=99999` porta al fondo.
- `node verify.js jank http://localhost:8765/`: il massimo deve stare sotto i 50 ms (nella 2.1: 18,2 ms).
- Il server di prova va sempre in background, poi si chiude.

## Struttura
- `index.html`: CSS, markup e JS del film.
  - Il markup è anche la versione statica completa, usata con «riduci movimento» o senza WebGL.
  - Il JS contiene la timeline madre, il collegamento tra DOM e 3D, la navbar e il filo di avanzamento.
- `area-riservata.html`: pagina segnaposto del tasto «Area riservata» della barra (dalla 2.5); l'area vera è ancora da fare.
- `js/logo3d.js`: il logo in 3D dell'apertura, con il suo renderer e il filtro a strisce. `Logo3D.play(canvas)` restituisce `held` (il logo è composto), `exit(fatto)` e `stop()`. Si chiude da solo dopo l'uscita.
- `js/lastra.js`: scena 3D in Three.js r147 classico, senza moduli. Contiene le aste dell'apertura, la lastra, materiali e shader, camera, anelli e pulviscolo.
- `js/lavori-dati.js`, `js/caratteri-dati.js`: copie base64 di `images/lavori/*.jpg` e `fonts/*.woff2`, usate solo da `file://`.
  - Vanno rigenerate se cambiano immagini o caratteri.
  - Basta un breve script Python: base64 dei file → oggetto `window.LAVORI_DATI` oppure regole `@font-face`.
- `images/lavori/<nome>.jpg`: texture 1600×900 q70, ricavate da `<nome>-d.jpg` (master 2000×1125) con `sips -s format jpeg -s formatOptions 70 -Z 1600`. Le `-m.jpg` non sono usate.
- `images/logo/`:
  - **In uso dalla 3.0 le copie verdi**: `nemesi-web-verde.png`, `nemesi-web-nav-verde.png`, `favicon-verde.png` e `favicon-verde-16/32/180.png`, ricavate dagli originali spostando la tinta degli arancio sul verde (breve script Python con PIL). Gli originali arancio qui sotto restano intatti.
  - `nemesi-web-arancio.png`: con il motto, nell'apertura della pagina statica (nel film resta solo per i lettori di schermo);
  - `nemesi-web-nav.png`: navbar;
  - `favicon.png`: **il logo** (originale 1536×1024, sfondo trasparente). Da qui si ricavano le icone quadrate `favicon-16.png`, `favicon-32.png` (scheda) e `favicon-180.png` (iPhone, fondo nero), ritagliate attorno al logo con un breve script Python (PIL). Se cambia il logo, rigenerarle e aggiornare `?v=` nei link;
  - `favicon2.png`: la vecchia icona, non usata;
  - `nemesi-web-originale.png`: l'originale viola.
  - **Mai modificare i PNG del logo.**
- `fonts/`: Inter Tight (titoli, come la scritta RAIN INK), Geist, Geist Mono, in woff2 latin.
- `vendor/`: gsap 3.12.5, ScrollTrigger 3.12.5, lenis 1.1.13, `three/three.min.js` r147.
- `BRIEF.md`: appunti di produzione (concept, logo, colori, caratteri, copy, divieti). NON è testo per il sito.
- `LEGGIMI.md`: versioni e cronologia delle modifiche.
- `archivio/` (fuori da git): `1.25/` è il sito prima del rifacimento, `index-1.4.html` una versione vecchia con le sezioni dopo il film.

## Punti chiave nel JS
- **Copione** in `js/lastra.js`, in unità «altezze di schermo»:
  - `KH` è l'apertura: `c0`–`c1` le aste scendono, `s0`–`s1` la riga di luce salda la lastra.
  - `K` è il resto del film, spostato in avanti di `HO` (1,1). Dentro `pose()` si lavora con `p = P - HO`.
  - Alla pagina arriva `KX` (tempi assoluti, più `o` = HO): in `index.html` i tempi sono scritti come `O + tempo del film`.
  - Tappe di `K`:
    - `rise`: la lastra si alza;
    - `flip1`, `flip2`, `flip3`: i mezzi giri;
    - `split`/`join`: sdoppiamento e chiusura;
    - `cross0`/`cross1`: attraversamento;
    - `rad`: Radente;
    - `fin0`/`fin1`: finale;
    - `end`: 11 (in `KX` diventa 12,1).
- **Timeline `master`** in `index.html` (dove `K` è già `KX`): dura `K.end` (12,1) ed è legata con scrub 1 allo spazio vuoto `#film` (alto `K.end`·vh + vh). La scena 3D legge lo stesso progresso.
- **`ridisegna()`**: dopo ogni refresh di ScrollTrigger esegue `master.progress(1).progress(pr)`. Senza, i `fromTo` perdono gli stati iniziali.
- **Collegamento tra DOM e 3D**:
  - `S.hits()` restituisce i quattro angoli in pixel delle facce visibili.
  - `place()` deforma i link `.schermo` (800×450) con un'omografia (`matrix3d`) e mette le didascalie sotto la faccia.
  - `S.emptyFace()` serve per il finale.
- **Aste dell'apertura**: `sticks` e `poseSticks()` in `js/lastra.js`. La lastra vera compare dietro la riga di luce grazie a `uCut` nei materiali; le aste spariscono con `uCutN`/`uCutD`.
- **Menu**: `vai(p)` in `index.html`. Un salto lungo passa per il velo `#taglio` (nero), poi `salta()` e uno scorrimento lento di `GLIDE` schermi; i salti brevi usano solo Lenis.
- **Contratto di verifica**: `?jump=<scrollY>`, `window.__ready`, `window.__go(y)` (salto immediato), `window.__S.state()`, `window.__intro`.
- **Classi su `<html>`**:
  - `js`;
  - `film`: c'è WebGL e non è attivo «riduci movimento»;
  - `avvio`: apertura in corso; non c'è con `?jump`.

## Regole di lavoro
- Testi in italiano. Il copy non deve mai descrivere lo scorrimento o il meccanismo (copy-gate).
- Nel copy niente «non X, ma Y» e niente lineette nei testi brevi.
- Ogni modifica → nuova versione in `LEGGIMI.md`.
- Commit solo su richiesta; «g» = commit e push su `origin main`.
- Rispettare `prefers-reduced-motion`: è già gestito con la pagina statica completa.

## In sospeso
- Area riservata vera (oggi il tasto porta alla pagina segnaposto `area-riservata.html`).
- Email `ciao@nemesi.studio`: dominio non verificato, da sostituire con quella vera.
- Partita IVA (obbligatoria per un professionista in Italia): oggi c'è solo «© 2026 Nemesi Web» nel finale. Va aggiunta lì.
- Scegliere l'hosting (oggi GitHub Pages; Netlify o Vercel?) e il dominio.
