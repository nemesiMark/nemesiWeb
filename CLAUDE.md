# Nemesi — sito personale di Mark (web designer)

## Cos'è
Sito vetrina/portfolio di Nemesi, studio di web design di Mark. Pagina unica «scroll-film» in puro codice
(skill `sito-film`, Corsia A): l'apertura è una scena fissata in cui il wordmark NEMESI WEB, fatto solo di aste (tutte e 35 volano sulla griglia; le 14 di WEB si posano su linee già presenti e si spengono),
si smonta e diventa la griglia della pagina, poi il titolo, poi i riquadri dei lavori, che si chiudono
in due pannelli affiancati (indice dei lavori).
Lavori: Rain Ink Tattoo (01, ~/Desktop/Sites/inkubo) e Olimp (02, ~/Desktop/Sites/olimp) nel film; sotto il film le sezioni «App» (Parola 03, Foglio 04) e «Giochi» (Metal Gear 05, Radente 06), separate dalla 1.21 (cartelle in ~/Desktop/Apps, online su nemesimark.github.io/<repo>/). Rain Ink e Olimp con schermate dei siti online (dalla 1.14 niente didascalie: i pannelli stessi aprono i siti; alla fine il righello svanisce). Dopo il film ci sono le sezioni App e Giochi, ognuna una scena fissata in stile film (dalla 1.24); contatti e altre sezioni da ripensare. Il bottone «Scrivimi» apre l'email.

## Dove sta online
Repository GitHub pubblico: https://github.com/nemesiMark/nemesiWeb (ramo `main`). Online con GitHub Pages: https://nemesimark.github.io/nemesiWeb/ (si aggiorna a ogni push su main).
Fuori dal repository (in `.git/info/exclude`): `chat-*.txt`, `archivio/`, `graphify-out/`, `.DS_Store`.

## Come si prova in locale
```bash
cd ~/Desktop/site-nemesi && python3 -m http.server 8765   # poi http://localhost:8765
```
Funziona anche aprendo `index.html` con doppio clic.
Verifiche (skill sito-film, cartella `~/.claude/skills/sito-film/scripts`):
- `node copy-gate.js ~/Desktop/site-nemesi/index.html` → deve uscire 0
- `node verify.js shot "http://localhost:8765/?jump=<y>" out.png 1440 900` (e 390 844 per il telefono)
- `node verify.js jank http://localhost:8765/` → max < 50 ms
Server di prova sempre in background, poi chiuderlo.

## Struttura
- `index.html` — tutto: CSS, markup e JS (GSAP + ScrollTrigger + Lenis)
- `images/lavori/` — schermate dei siti: `-d.jpg` 2000×1125 (catturate a 1440×810: Rain Ink con la barra di navigazione, Olimp con la 3ª foto della hero) usate nel film; `-m.jpg` 900 px (oggi non usate)
- `js/scena.js` — scena 3D dell'apertura (dalla 1.24 senza post-produzione: antialias e risoluzione fino a 2×) (fondo grigio perla #E4E4E8 dalla 1.22, aste grafite #1E1F22, accento arancio #F07A1A del logo dalla 1.23) (Three.js r147 classico, file in `vendor/three/`: niente moduli, così funziona anche aprendo il file dal disco)
- `vendor/` — gsap 3.12.5, ScrollTrigger 3.12.5, lenis 1.1.13 (copie locali)
- `BRIEF.md` — appunti di produzione (concept, palette, divieti); NON è testo per il sito
- `LEGGIMI.md` — versioni e cronologia delle modifiche

Punti chiave nel JS: `letter()` disegna le lettere con le aste; `computeGeo()` calcola wordmark (A),
griglia (B), celle dei riquadri e pannelli finali (`panels`, disegnati da `drawTiles()`); la timeline `tl` dura 1 = progresso del pin.
Barra del browser nascosta: l'avanzamento lo mostra il filo `#rail` a destra (tacche dei capitoli da `CHS`, clic e trascinamento con Lenis).
Contratto di verifica: `?jump=<scrollY>` e `window.__ready` (fine del film a 1440×900 = 6120; `?jump=99999` = fondo pagina, sezione Giochi).
Timeline madre `master`: 0→`T3` (.34) scena 3D (il progresso della scena viene da `swap3d()`, calcolato dalla posizione), poi la vecchia `tl` compressa in T3→1. `window.__scene.state()` per le verifiche.
Apertura: `playIntro()` (timeline in `window.__intro`, per catturare i fotogrammi con `__intro.pause(); __intro.time(t)`);
la classe `html.intro`, messa da uno script nel `<head>`, nasconde la hero finché l'apertura non parte.

## Regole di lavoro
- Testi in italiano; il copy non deve mai descrivere lo scorrimento o il meccanismo (copy-gate).
- Ogni modifica → nuova versione in `LEGGIMI.md`.
- Commit solo su richiesta; «g» = commit e push su `origin main`.
- Rispettare `prefers-reduced-motion` (già gestito: niente film, copertina 01 statica).

## In sospeso (dati inventati da sostituire prima di pubblicare)
- Email `ciao@nemesi.studio` (dominio non verificato), link social generici, bio, «Disponibile da gennaio 2027».
- Partita IVA (obbligatoria per un professionista in Italia): oggi non c'è più un piè di pagina dove metterla.
- Navbar (dalla 1.24 scura come Rain Ink, larga al massimo 960 px): Siti (fine del film, gestito nel JS dei link), App, Giochi, bottone Scrivimi; su telefono panino + busta. Logo in `images/logo/` (dalla 1.24 PNG arancio ricavato dall'originale viola `nemesi-web-originale.png`).
- Ripensare le sezioni dopo il film (tolte nella 1.5, contatti tolti nella 1.7; la pagina 1.4 completa, con testi e codice delle sezioni, è in `archivio/index-1.4.html`, da non pubblicare).
- Scegliere l'hosting (Netlify/Vercel) e il dominio.
