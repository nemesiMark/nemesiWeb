# Nemesi — sito personale di Mark (web designer)

## Cos'è
Sito vetrina/portfolio di Nemesi Web, lo studio di web design di Mark. Dalla 2.0 (21/11/2026) è rifatto da zero: una pagina unica «scroll-film» in puro codice (skill `sito-film`, Corsia A), con il concept «Dritto e rovescio» (dettagli in `BRIEF.md`).
Un solo oggetto 3D porta tutti i lavori: la «lastra», nera laccata, a due strati, con il bordo verde come le facce del logo. La camera va solo avanti.
Dalla 3.0 il colore d'accento è il verde lime `#CDFD67` (prima era arancio): nel codice le variabili si chiamano ancora `--arancio*` e `COL.arancio`, ma contengono i verdi.

Barra (dalla 3.20): Portfolio ▾ (Siti, App, Giochi), Studio, Tool, Contattaci, lucchetto.
Dalla 3.24 Portfolio apre `portfolio.html` (pagina ferma con tutti i lavori, senza film) e Siti, App, Giochi portano alle sue sezioni (`portfolio.html#siti` ecc.).

Capitoli:
1. Apertura (dalla 3.4, come il video di riferimento `58d1f4b27220bfbdf84fdabf0155c8cd.mp4`, fuori da git): su nero il logo in 3D (`js/logo3d.js`) arriva a strisce verticali che piovono, il pieno sale dal basso con il bordo frastagliato, resta con una luce che passa; poi torna strisce che cadono e il nero scende a colonne sottili dal centro. Dietro, le file delle aste 3D (i pezzi della lastra in vista esplosa, sempre in movimento) cadono dall'alto e si accendono quando toccano; poi scende la barra. Scorrendo le aste compongono la lastra distesa, una riga di luce la salda e la lastra si alza. Il logo sta solo nella barra.
2. Siti: Rain Ink 01, Olimp 02 (dalla 3.28, cliccabile verso https://nemesimark.github.io/olimp/; prima c'era l'anteprima dell'area riservata).
2b. Strumenti, «Tool» nella barra (dalla 3.9): a metà del mezzo giro verso Word la lastra di taglio diventa l'asse verde e ne escono a ventaglio sette lastre nei colori delle marche (Claude, VS Code, GitHub, Figma, Cloudflare, Netlify, Supabase) che girano una alla volta davanti; la lastra davanti porta al sito ufficiale (`#strum-link`). Ingresso e chiusura speculari (3.12–3.13): la lastra di taglio diventa l'asse, lampo, fili di luce che si aprono in lastre; all'uscita il contrario, poi la lastra gira su Word. Da fermi le lastre girano da sole (`AUTO` in `poseGio`); quando si riprende a scorrere si riparte dalla lastra davanti (`gioMap`). Nella barra la voce è «Tool» (`#tool`).
3. App: Word 03, Excel 04 (ex Parola e Foglio: le immagini si chiamano ancora `parola` e `foglio`), con la lastra sdoppiata.
4. Giochi: Metal Gear 05, attraversamento in pixel, anelli, Radente 06.
4b. Studio (dalla 3.17, «Studio» nella barra, `#studio`): la lastra torna da Radente con la faccia vuota, avanza finché la faccia riempie lo schermo e si apre nella mappa animata (skill `mappa-uni`, `js/mappa.js`: dallo spazio a via dello Scalo 12, Bologna; Italia → Emilia-Romagna → Bologna, poi dritti al civico); poi si richiude.
5. Scrivimi: faccia vuota con «Manca solo il tuo progetto.», bottone Scrivimi ed email.

Per ora c'è solo questo (Siti, Strumenti, App, Giochi, Studio, Scrivimi): niente sezioni nuove senza richiesta.

Dove sono i lavori:
- Rain Ink: `~/Desktop/Sites/rainInk`
- Olimp: `~/Desktop/Sites/olimp`, online come `/olimp/`
- App e giochi: `~/Desktop/Apps`
- Tutti online su `nemesimark.github.io/<repo>/`

## Dove sta online
- Repository GitHub pubblico: https://github.com/nemesiMark/nemesiWeb (ramo `main`).
- Online con GitHub Pages: https://nemesimark.github.io/nemesiWeb/ (si aggiorna a ogni push su main).
- Fuori dal repository (in `.git/info/exclude`): `chat-*.txt`, `archivio/`, `graphify-out/`, `.DS_Store`, i video `58d1f4b27220bfbdf84fdabf0155c8cd.mp4` (riferimento dell'apertura) e `pixel-effects.mp4`.

## Come si prova in locale
```bash
cd ~/Desktop/Sites/nemesiWeb && python3 -m http.server 8765   # poi http://localhost:8765
```
Funziona anche con doppio clic su `index.html`. Da `file://` il browser non legge immagini (in WebGL) e caratteri locali, quindi arrivano incorporati da `js/lavori-dati.js` e `js/caratteri-dati.js`, caricati solo in quel caso.

Verifiche (skill sito-film, cartella `~/.claude/skills/sito-film/scripts`):
- `node copy-gate.js ~/Desktop/Sites/nemesiWeb/index.html`: deve uscire 0.
- `node verify.js shot "http://localhost:8765/?jump=<y>" out.png 1440 900` (e `390 844` per il telefono).
  - La fine del film è a `K.end` (18,4 dalla 3.17) × altezza dello schermo: 16560 a 1440×900.
  - La mappa va da `K.map0` (14,65) a `K.map1` (17,85): a 1440×900 da 13185 a 16065; aperta a tutto schermo nel tratto centrale.
  - La giostra degli strumenti va da `K.gio0` (4,724) a `K.gio1` (7,826): a 1440×900 da 4252 a 7043.
  - `?jump=99999` porta al fondo.
- `node verify.js jank http://localhost:8765/`: il massimo deve stare sotto i 50 ms (nella 2.1: 18,2 ms).
- Il server di prova va sempre in background, poi si chiude.

## Struttura
- `index.html`: CSS, markup e JS del film.
  - Il markup è anche la versione statica completa, usata con «riduci movimento» o senza WebGL.
  - Il JS contiene la timeline madre, il collegamento tra DOM e 3D, la navbar e il filo di avanzamento.
- `js/strumenti-icone.js`: dati degli strumenti (tracciati da simple-icons, colore della lastra `corpo`, colore del `logo`, didascalia), usati dal film e dalla pagina ferma (la pagina di prova `strumenti.html` è stata eliminata nella 3.14). Icone originali in `images/strumenti/`.
- `area-riservata.html` (dalla 3.20): area riservata copiata da Olimp (skill `area-ris`), attiva dalla 3.21 con il Worker https://nemesiweb-area-riservata.nemesi-mark.workers.dev. Foto dei 6 lavori (`data/immagini.json`, `data-slot`), 40 testi (`data/testi.json`, `data-testo`) e le voci del sottomenu Portfolio (`menu-t001…003`). Dettagli e attivazione nel `LEGGIMI.md`, sezione «Area riservata».
- `portfolio.html` (dalla 3.24): pagina ferma con i sei lavori (stesso markup e CSS della pagina statica di `index.html`, copiati), barra uguale, niente film. Il 02 è Olimp (dalla 3.25; dalla 3.28 anche nella home, con `data-slot="lavoro-olimp"` e `data-testo` t009/t010 come in `index.html`); i lavori stanno sulla lastra della home rifatta in CSS (misure e luci da `js/lastra.js`, unità `--u`, alone in `.alone` aggiunto dallo script; niente `perspective`, `isolation` o contenitori sugli antenati, altrimenti `plus-lighter` non somma la luce sul fondo). Se cambia un lavoro in `index.html` va cambiato anche qui.
- `scripts/genera_contenuti.py`: scrive in `index.html` (e, con `COPIE`, anche in `portfolio.html`) foto e testi dai JSON (`--check` per controllare). Testi e foto con `data-testo`/`data-slot` si cambiano nei JSON, non nell'HTML.
- `worker/` (Worker Cloudflare dell'area, non pubblicato sul sito), `.github/workflows/pubblica.yml` (dalla 3.21 pubblica a ogni push su main: Pages usa GitHub Actions), `js/vendor/sortable/`, `images/guida/` (schermate della guida), `images/caricate/`.
- `js/logo3d.js`: il logo in 3D dell'apertura (dalla 3.4), con il suo renderer (WebGL 2, altrimenti `play` restituisce null e il nero sfuma).
  - Geometria costruita dalla forma vettoriale: faccia nera piana con il triangolo incassato, nastro grigio come superficie rigata dalla piega (davanti) all'orlo (indietro), barra, spessori con il bordo verde, neon come pinne attaccate ai bordi. Sulle facce è proiettato il disegno SVG del logo (texture da `LOGO_FORMA.art`), quindi di fronte è identico al logo; dietro, l'alone largo (`LOGO_FORMA.glow` senza neon).
  - Filtro a schermo (`FS_Q`): pieno, strisce con frange (verde giallo a sinistra, menta a destra), sbavature ai fronti, sipario nero a colonne. Tempi in `IN0…EXIT`, tutti rallentati da `LENTO` (1,4, dalla 3.14-3.15; la timeline `intro` ha lo stesso `timeScale`).
  - `Logo3D.play(canvas, opzioni)` restituisce `first` (primo fotogramma: il nero è disegnato), `ready` (texture pronte), `held` (logo composto), `exit(fatto)`, `duration`, `stop()`. Si chiude da solo dopo l'uscita. Le opzioni `clock` e `pose` servono solo alle prove.
- `js/logo-forma.js`: `window.LOGO_FORMA`, forma del simbolo (contorni in pixel del disegno originale) e i due disegni SVG per le texture. Generato con il ricalco del logo (`archivio/logo-svg/`), non si modifica a mano.
- `js/lastra.js`: scena 3D in Three.js r147 classico, senza moduli. Contiene le aste dell'apertura, la lastra, materiali e shader, camera, anelli e pulviscolo.
- `js/lavori-dati.js`, `js/caratteri-dati.js`: copie base64 di `images/lavori/*.jpg` e `fonts/*.woff2`, usate solo da `file://`.
  - Vanno rigenerate se cambiano immagini o caratteri.
  - Basta un breve script Python: base64 dei file → oggetto `window.LAVORI_DATI` oppure regole `@font-face`.
- `images/lavori/<nome>.jpg`: texture 1600×900 q70, ricavate da `<nome>-d.jpg` (master 2000×1125) con `sips -s format jpeg -s formatOptions 70 -Z 1600`. Le `-m.jpg` non sono usate.
- `images/logo/`:
  - **In uso dalla 3.4 i loghi in SVG**, ricalcati fedelmente dall'originale (nero e verde): `nemesi-web.svg` (con il motto, pagina statica), `nemesi-web-barra.svg` (barra e area riservata), `nemesi-simbolo.svg` (solo il simbolo), `icona.svg` + `icona-16/32/180.png` (icone della scheda, dei segnalibri e dell'iPhone, link `?v=3.8`; **sempre con lo sfondo trasparente, mai un quadrato nero dietro**). Si rigenerano con `archivio/logo-svg/` (vedi il suo LEGGIMI.txt).
  - Dalla 3.0 alla 3.3 erano in uso le copie verdi in PNG: `nemesi-web-verde.png`, `nemesi-web-nav-verde.png`, `favicon-verde.png` e `favicon-verde-16/32/180.png` (ora non usate, restano). Gli originali arancio qui sotto restano intatti.
  - originali arancio, non usati: `nemesi-web-arancio.png` (con il motto) e `nemesi-web-nav.png` (barra);
  - `favicon.png`: **il logo** (originale 1536×1024, sfondo trasparente): è il riferimento del ricalco in SVG. Le vecchie icone quadrate `favicon-16.png`, `favicon-32.png`, `favicon-180.png` non sono più usate. Se cambia il logo, rigenerare gli SVG e le icone e aggiornare `?v=` nei link;
  - `favicon2.png`: la vecchia icona, non usata;
  - `nemesi-web-originale.png`: l'originale viola.
  - **Mai modificare i PNG del logo.**
- `fonts/`: Inter Tight (titoli, come la scritta RAIN INK), Geist, Geist Mono, in woff2 latin.
- `vendor/`: gsap 3.12.5, ScrollTrigger 3.12.5, lenis 1.1.13, `three/three.min.js` r147, `maplibre/` 5.6.0 (caricata solo dopo il consenso alla mappa).
- `js/mappa.js`: mappa animata dello studio (copiata da Rain Ink, cambiano solo dati e colori; non riscriverla).
- `BRIEF.md`: appunti di produzione (concept, logo, colori, caratteri, copy, divieti). NON è testo per il sito.
- `LEGGIMI.md`: versioni e cronologia delle modifiche.
- `archivio/` (fuori da git): `1.25/` è il sito prima del rifacimento, `index-1.4.html` una versione vecchia con le sezioni dopo il film, `logo-svg/` il ricalco del logo (genera gli SVG e `js/logo-forma.js`) e il laboratorio del logo 3D.

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
    - `end`: 11 (in `KX` diventa 18,4).
  - **Giostra degli strumenti** (dalla 3.9): `GW` (inizio `w0` 3,624 nel tempo di K, durata aggiunta `gd` 3,1) e `warp()` traducono il tempo nuovo in quello di K, che resta il copione di prima. In `KX` i tempi dopo `w0` sono spostati di `gd`. La giostra è in `poseGio()`; `S.giostra()` dà presenza, lastra davanti e punto per la didascalia.
  - In `index.html` i tempi scritti come `O + X(t)` slittano da soli dopo l'inizio della giostra e dopo la mappa.
  - **Mappa dello studio** (dalla 3.17): `MW` (inizio `K.fin1`, durata aggiunta `gd` 3,2) ferma il film sulla faccia vuota; `poseMappa()` fa avanzare la lastra, `S.mappa()` dà quanto è avanzata (`a`) e gli angoli della faccia (`q`); in `index.html` `placeMappa()` ritaglia la mappa fissa a tutto schermo sulla faccia (`clip-path`) e, a faccia aperta, chiama `window.nemesiMappaVista()` che fa partire la discesa. A mappa aperta la scena 3D non si disegna.
  - Mappa: consenso col riquadro «Mostra la mappa» (`window.nemesiCookie`, chiave `nemesi_cookie_v1`); verifiche con la skill `mappa-uni` (`programma.js js/mappa.js --computer 1440x900 --telefono 390x844`).
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
  - `avvio`: apertura in corso; non c'è con `?jump` né con un indirizzo `#capitolo`. Durante l'apertura il colore della barra del browser è nero.
- **Apertura** (fondo di `index.html`): `Logo3D.play` sul canvas `#logo3d` dentro `#pre`; al primo fotogramma `#pre` diventa trasparente (il nero lo disegna il logo). Quando il logo è composto e il sito è caricato (o chi guarda tocca, scorre o preme un tasto) parte `L.exit` e la timeline `intro`: `S.enter` (le file delle aste cadono, in `poseSticks` con `S.ent`), `S.ignite`, barra, angoli; Lenis riparte a 1,6 s.
  - Finché il nero copre tutto (`quieto`) la scena 3D disegna un fotogramma su tre; per tutta l'apertura (`inApertura`) non abbassa la risoluzione (`S.frame(t, quiet)`).

## Regole di lavoro
- Testi in italiano. Il copy non deve mai descrivere lo scorrimento o il meccanismo (copy-gate).
- Nel copy niente «non X, ma Y» e niente lineette nei testi brevi.
- Ogni modifica → nuova versione in `LEGGIMI.md`.
- Commit solo su richiesta; «g» = commit e push su `origin main`. Prima del commit: `python3 scripts/genera_contenuti.py --check` (deve passare) e niente file di prova `_*.html`.
- Rispettare `prefers-reduced-motion`: è già gestito con la pagina statica completa.

## In sospeso
- Area riservata: provare dal vero accesso, salvataggio su GitHub e cambio password; il Worker si aggiorna con `npx wrangler deploy` da `worker/` (Node in `~/.local/lib/node/bin`).
- Email `ciao@nemesi.studio`: dominio non verificato, da sostituire con quella vera.
- Mappa: manca una pagina privacy dove citare Esri (le foto satellitari si caricano solo dopo «Mostra la mappa»).
- Partita IVA (obbligatoria per un professionista in Italia): oggi c'è solo «© 2026 Nemesi Web» nel finale. Va aggiunta lì.
- Scegliere l'hosting (oggi GitHub Pages; Netlify o Vercel?) e il dominio.
