# Nemesi — sito personale di Mark (web designer)

## Cos'è
Portfolio di Nemesi Web, lo studio di web design di Mark: una pagina unica «scroll-film» in puro codice (skill `sito-film`, Corsia A), concept «Dritto e rovescio» (`BRIEF.md`). Un solo oggetto 3D, la «lastra» nera con il bordo verde, porta tutti i lavori; la camera va solo avanti. Accento `#CDFD67` (nel codice le variabili si chiamano ancora `--arancio*` / `COL.arancio`).

Barra: Portfolio (link semplice a `portfolio.html`, pagina ferma con tutti i lavori), Studio, Tool, Contattaci, lucchetto.
Capitoli: 1 Apertura (logo 3D, aste che compongono la lastra) · 2 Siti (Rain Ink 01, Olimp 02) · 2b Strumenti `#tool` (giostra di sette lastre) · 3 App (Word 03, Excel 04) · 4 Giochi (Metal Gear 05, Radente 06) · 4b Studio `#studio` (mappa animata, skill `mappa-uni`) · 5 Scrivimi. Niente sezioni nuove senza richiesta.

**Prima di toccare il film, `portfolio.html` o il logo leggi `NOTE-TECNICHE.md`** (capitoli in dettaglio, file, copione `K`/`KX`, giostra, mappa, apertura, contratto di verifica).

Lavori: Rain Ink `~/Desktop/Sites/rainInk`, Olimp `~/Desktop/Sites/olimp`, app e giochi `~/Desktop/Apps`; online su `nemesimark.github.io/<repo>/`.

## Dove sta online
- Repo https://github.com/nemesiMark/nemesiWeb (`main`), GitHub Pages su **https://nemesiweb.it/** (solo HTTPS), pubblica a ogni push con GitHub Actions.
- Area riservata: Worker https://nemesiweb-area-riservata.nemesi-mark.workers.dev, accetta solo origini `https://` in `ORIGINS` (`worker/wrangler.toml`). Se cambia il dominio: aggiungerlo lì e `npx wrangler deploy` da `worker/`.
- Fuori dal repo (`.git/info/exclude`): `chat-*.txt`, `archivio/`, `graphify-out/`, `.DS_Store`, i video `.mp4` di riferimento.

## Come si prova in locale
```bash
cd ~/Desktop/Sites/nemesiWeb && python3 -m http.server 8765   # poi http://localhost:8765
```
Funziona anche da `file://` (immagini e caratteri incorporati in `js/lavori-dati.js` e `js/caratteri-dati.js`).

Verifiche (`~/.claude/skills/sito-film/scripts`), server sempre in background e poi chiuso:
- `node copy-gate.js ~/Desktop/Sites/nemesiWeb/index.html` → deve uscire 0.
- `node verify.js shot "http://localhost:8765/?jump=<y>" out.png 1440 900` (e `390 844`). A 1440×900: fondo 16560 (`?jump=99999`), mappa 13185–16065, giostra 4252–7043.
- `node verify.js jank http://localhost:8765/` → massimo sotto 50 ms.

## Struttura essenziale
- `index.html` (film; il markup è anche la versione statica), `portfolio.html` (copia della pagina statica: **se cambia un lavoro in `index.html` va cambiato anche qui**), `area-riservata.html` (skill `area-ris`).
- `data/testi.json`, `data/immagini.json` + `scripts/genera_contenuti.py`: testi e foto con `data-testo`/`data-slot` si cambiano nei JSON, non nell'HTML.
- `js/lastra.js` (scena 3D e copione), `js/logo3d.js` + `js/logo-forma.js` (logo dell'apertura), `js/mappa.js` (non riscriverla), `js/cookie.js`, `js/strumenti-icone.js`.
- `images/logo/`: **mai modificare i PNG del logo**; icone sempre con sfondo trasparente.
- `worker/`, `.github/workflows/pubblica.yml`, `vendor/`, `fonts/`, `BRIEF.md` (non è testo per il sito), `LEGGIMI.md` (versioni).

## Regole di lavoro
- Testi in italiano. Il copy non descrive mai lo scorrimento o il meccanismo (copy-gate); niente «non X, ma Y», niente lineette nei testi brevi.
- Ogni modifica → nuova versione in `LEGGIMI.md`.
- Commit solo su richiesta; «g» = commit e push su `origin main`. Prima: `python3 scripts/genera_contenuti.py --check` (deve passare) e niente file di prova `_*.html`.
- **Ogni pagina HTML nuova va resa modificabile nell'area riservata, subito**: scheda in `PAGINE` e `ORDINE_PRIMA` di `area-riservata.html`, `data-testo`/`data-slot`, voci in `data/testi.json` e `data/immagini.json` (pagina = nome del file), video se ne ha.
- Rispettare `prefers-reduced-motion` (già gestito con la pagina statica).

## In sospeso
- Google: Search Console verificata (TXT su Aruba), sitemap inviata e indicizzazione chiesta (23/11/2026): controllare che le due pagine risultino indicizzate.
- Area riservata: provare dal vero accesso, salvataggio su GitHub e cambio password (Node in `~/.local/lib/node/bin`).
- Email `ciao@nemesi.studio`: da sostituire con quella vera.
- Pagina privacy che citi Esri (foto satellitari della mappa).
- Partita IVA nel finale accanto a «© 2026 Nemesi Web».
