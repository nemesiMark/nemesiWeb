# Nemesi — sito personale di Mark (web designer)

## Cos'è
Sito vetrina/portfolio di Nemesi, studio di web design di Mark. Pagina unica «scroll-film» in puro codice
(skill `sito-film`, Corsia A): l'apertura è una scena fissata in cui il wordmark NEMESI, fatto solo di aste,
si smonta e diventa la griglia della pagina, poi il titolo, poi i riquadri dei lavori, che si chiudono
in due pannelli affiancati (indice dei lavori).
Lavori: solo Rain Ink Tattoo (01, ~/Desktop/inkubo) e Olimp (02, ~/Desktop/olimp), con schermate dei siti online (le didascalie aprono i siti). Dalla 1.7 dopo il film non c'è più niente (tolto anche il blocco contatti): la pagina finisce con i due pannelli dei lavori; le sezioni dopo il film sono da ripensare. Il bottone «Scrivimi» apre l'email.

## Dove sta online
Per ora solo in locale (nessun hosting, nessun repository git).

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
- `js/scena.js` — scena 3D dell'apertura (Three.js r147 classico, file in `vendor/three/`: niente moduli, così funziona anche aprendo il file dal disco)
- `vendor/` — gsap 3.12.5, ScrollTrigger 3.12.5, lenis 1.1.13 (copie locali)
- `BRIEF.md` — appunti di produzione (concept, palette, divieti); NON è testo per il sito
- `LEGGIMI.md` — versioni e cronologia delle modifiche

Punti chiave nel JS: `letter()` disegna le lettere con le aste; `computeGeo()` calcola wordmark (A),
griglia (B), celle dei riquadri e pannelli finali (`panels`, disegnati da `drawTiles()`); la timeline `tl` dura 1 = progresso del pin.
Contratto di verifica: `?jump=<scrollY>` e `window.__ready`.
Timeline madre `master`: 0→`T3` (.34) scena 3D (il progresso della scena viene da `swap3d()`, calcolato dalla posizione), poi la vecchia `tl` compressa in T3→1. `window.__scene.state()` per le verifiche.
Apertura: `playIntro()` (timeline in `window.__intro`, per catturare i fotogrammi con `__intro.pause(); __intro.time(t)`);
la classe `html.intro`, messa da uno script nel `<head>`, nasconde la hero finché l'apertura non parte.

## Regole di lavoro
- Testi in italiano; il copy non deve mai descrivere lo scorrimento o il meccanismo (copy-gate).
- Ogni modifica → nuova versione in `LEGGIMI.md`.
- Commit solo su richiesta; «g» = commit e push (oggi la cartella non è un repository: va prima creato).
- Rispettare `prefers-reduced-motion` (già gestito: niente film, copertina 01 statica).

## In sospeso (dati inventati da sostituire prima di pubblicare)
- Email `ciao@nemesi.studio` (dominio non verificato), link social generici, bio, «Disponibile da gennaio 2027».
- Partita IVA (obbligatoria per un professionista in Italia): oggi non c'è più un piè di pagina dove metterla.
- Menu: oggi solo «Lavori» (fine del film, gestito nel JS dei link) e «Scrivimi»; su telefono solo logo + «Scrivimi».
- Ripensare le sezioni dopo il film (tolte nella 1.5, contatti tolti nella 1.7; la pagina 1.4 completa, con testi e codice delle sezioni, è in `archivio/index-1.4.html`, da non pubblicare).
- Scegliere l'hosting (Netlify/Vercel) e il dominio.
