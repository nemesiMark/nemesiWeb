# Nemesi — sito personale di Mark (web designer)

## Cos'è
Portfolio di Nemesi Web, lo studio di web design di Mark: dalla 3.57 è **una pagina sola che non scorre, i «mondi»** (`index.html` + `mondi/mondi.js`, Three.js r147). Dopo il video dell'apertura (logo che sfonda il muro, finale nel verde, «taglio di luce», `js/apertura.js`) c'è il mondo centrale Nemesi (cemento crepato di verde, due anelli al neon) collegato da linee al neon ai mondi: Bio (dalla 3.66, pianeta bioluminescente blu notte e viola: la biografia di Mark con foto, testo, percorso in quattro tappe e invito a Contatti), Portfolio (gigante con anelli, i sei lavori), Studio (la Terra con Bologna, sede e Google Maps), Tool (dalla 3.68 pianeta di ossidiana a faccette con i giunti accesi di verde; intorno le icone 3D degli strumenti del vecchio sito, dalla 3.60 senza Figma, dalla 3.68 con l'orbita intera e l'arco acceso nel colore del marchio), Contatti (dalla 3.67 pianeta di ghiaccio crepato con le crepe accese e piccoli geyser; dalla 3.61 modulo con nome, email e messaggio, non ancora collegato) e, dalla 3.58, l'Area riservata (pianeta di lava: porta a `area-riservata.html`). Sopra ogni mondo il suo nome in 3D (fatto in Blender, dalla 3.59 in marmo bianco); ogni tanto una linea si accende da Nemesi e illumina il suo mondo. Clic su un mondo, sul nome o sulla barra → la camera vola fino al mondo e si apre il pannello della sezione; «Indietro», Esc o il logo riportano al centro. Il blocco gira piano e si gira con la «manina». Accento `#CDFD67` (nel codice le variabili si chiamano ancora `--arancio*`). Niente sezioni nuove senza richiesta.

Il vecchio sito «film» a scorrimento (fino alla 3.54, con `portfolio.html`) è archiviato **solo in locale** in `~/Documents/work/Sites/nemesiWeb-film` (niente git, non è online; nel repo resta la storia fino al commit `46d3836`).

**Prima di toccare i mondi, l'apertura o il logo leggi `NOTE-TECNICHE.md`** (file, costanti, sistema rigido, salti, texture, contratto di verifica).

Lavori: Rain Ink `~/Documents/work/Sites/rainInk`, Olimp `~/Documents/work/Sites/olimp`, app e giochi `~/Documents/work/Apps`; online su `nemesimark.github.io/<repo>/`.

## Dove sta online
- Repo https://github.com/nemesiMark/nemesiWeb (`main`), GitHub Pages su **https://nemesiweb.it/** (solo HTTPS), pubblica a ogni push con GitHub Actions (non pubblica `scripts/`, `data/`, `worker/`, `mondi/blender/` e i file `.md`).
- Area riservata: Worker https://nemesiweb-area-riservata.nemesi-mark.workers.dev, accetta solo origini `https://` in `ORIGINS` (`worker/wrangler.toml`). Se cambia il dominio: aggiungerlo lì e `npx wrangler deploy` da `worker/`.
- Fuori dal repo (`.git/info/exclude`): `chat-*.txt`, `archivio/`, `graphify-out/`, `.DS_Store`, i video `.mp4` di riferimento, `video/nemesi-apertura/` (5,6 GB: scena Blender e fumo già calcolato per rifare il render dell'apertura con `archivio/apertura-blender/rendi2.py`), `mondi/tex/png/` (uscita di Blender, 45 MB) e `mondi/sorgenti/` (mappe NASA grandi).

## Come si prova in locale
```bash
cd ~/Documents/work/Sites/nemesiWeb && python3 -m http.server 8765   # poi http://localhost:8765
```
Serve il server: da `file://` le texture dei mondi non si caricano.

Verifiche (server sempre in background e poi chiuso; Node in `~/.local/lib/node/bin`, puppeteer-core in `~/.claude/skills/sito-film/scripts/node_modules`):
- `node ~/.claude/skills/sito-film/scripts/copy-gate.js index.html` → deve uscire 0.
- Schermate con Chrome a 1440×900 e 390×844: `?subito` (niente video né entrata) o `?salta`, `#bio|portfolio|studio|tool|contatti`; aspettare `window.__ready`; `window.__mondi` (`vai`, `prova`, `giostra`, `stato`, `misure`, `icone`). Nessun errore in console, 60 fotogrammi al secondo.
- Senza WebGL e dentro un riquadro (anteprima dell'area riservata) la pagina è ferma: sezioni una sotto l'altra.

## Struttura essenziale
- `index.html` (barra, etichette dei mondi, quattro pannelli, CSS), `mondi/mondi.js` (scena, viaggi, manina), `mondi/tex/` (texture; `m/` a metà lato), `mondi/nomi.bin` (nomi in 3D), `mondi/blender/` (script per rifare texture e nomi), `area-riservata.html` (skill `area-ris`).
- `data/testi.json` (49 testi), `data/immagini.json` (foto della Bio e dei sei lavori) + `scripts/genera_contenuti.py`: testi e foto con `data-testo`/`data-slot` si cambiano nei JSON, non nell'HTML. `data/gallerie.json` è vuoto (le gallerie erano di `portfolio.html`). I nomi dei mondi non sono testi dell'area: sono in 3D.
- `js/apertura.js` + `video/apertura.mp4` / `apertura-m.mp4`, `js/strumenti-icone.js`, `js/caratteri-dati.js` (caratteri per `file://`), `vendor/gsap.min.js`, `vendor/three/three.min.js`.
- `images/logo/`: **mai modificare i PNG del logo**; icone sempre con sfondo trasparente. `images/lavori/` (foto dei lavori 1600×900), `images/anteprima.jpg` (anteprima dei link, `?v=7`).
- `worker/`, `.github/workflows/pubblica.yml`, `fonts/`, `LEGGIMI.md` (versioni).

## Regole di lavoro
- Testi in italiano. Il copy non descrive mai il meccanismo della pagina (copy-gate); niente «non X, ma Y», niente lineette nei testi brevi.
- Ogni modifica → nuova versione in `LEGGIMI.md`.
- Commit solo su richiesta; «g» = commit e push su `origin main`. Prima: `python3 scripts/genera_contenuti.py --check` (deve passare) e niente file di prova `_*.html`.
- **Ogni pagina HTML nuova va resa modificabile nell'area riservata, subito**: scheda in `PAGINE` e `ORDINE_PRIMA` di `area-riservata.html`, `data-testo`/`data-slot`, voci in `data/testi.json` e `data/immagini.json` (pagina = nome del file), video se ne ha.
- Rispettare `prefers-reduced-motion` (niente video né salti, solo stacchi).

## In sospeso
- Bio (3.66): testi e foto sono provvisori (la foto è una sagoma), Mark li cambia dall'area riservata (pianeta, posizione e pannello gli piacciono).
- Il viaggio della 3.58 a Mark piace (3.59: solo più fluido). Deve ancora dire se vanno bene velocità della giostra e luce dello sfondo (3.56), il pianeta di lava (3.58) e, dalla 3.59, i nomi più piccoli in marmo bianco e l'accensione senza onde.
- Google: la home è cambiata (3.57) e `portfolio.html` non c'è più; sitemap con la sola home. Controllare in Search Console che la home risulti indicizzata ed eventualmente chiedere di nuovo l'indicizzazione.
- Area riservata: provare dal vero accesso, salvataggio su GitHub e cambio password.
- Modulo dei contatti (3.61): da collegare a un servizio d'invio quando Mark lo chiede; ora il pulsante non fa nulla.
- Partita IVA accanto a «© 2026 Nemesi Web» (pannello Contatti).
