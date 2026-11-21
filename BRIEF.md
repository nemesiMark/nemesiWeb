# BRIEF — sito Nemesi (scroll-film, Corsia A puro codice)

Appunti di produzione: NON è copy per il sito.

## Concept scelto: «Il nome diventa la pagina» (La Misura + jolly dello sparring)
Vettore unico: **tutto diventa solo più ordinato/definito** (dal nome alla pagina finita).
- Cap. 1 Linea (hero): wordmark NEMESI enorme, costruito SOLO con aste rettangolari (21 barre).
- Cap. 2 Griglia: le aste verticali (9 + 3 diagonali raddrizzate) diventano le 12 linee di una
  griglia a 6 colonne con canali; i 9 bracci orizzontali diventano le linee di riga. Etichette mono di misura.
- Cap. 3 Testo: titolo si posa sulla griglia parola per parola.
- Cap. 4 Forma: 2 riquadri-progetto (Rain Ink, Olimp) riempiono le celle (schermate vere in images/lavori/).
- Cap. 5 Pagina: i due riquadri diventano due pannelli 16:10 affiancati (sul telefono impilati) sotto il titolo,
  con didascalie cliccabili (aprono i siti): il film si chiude sull'indice dei lavori; sotto, per ora, solo il piè di pagina con i contatti. Il logo piccolo nell'header è lo stesso wordmark.

## Apertura 3D (dalla 1.4)
Prima del capitolo «Nome»: le 21 aste come travi 3D scure e lucide nel buio (luce vermiglia/ambra, braci), che si ricompongono nella scritta e diventano color carta, combaciando al pixel con le aste HTML.
Tavolozza «Notte e vermiglio»: notte #0E0C0B, notte-2 #17130F, vermiglio #E8431C, ambra #F2A93B (nella 1.6 provata una versione più chiara, tolta nella 1.7), carta #EEEBE4. Dalla 1.20 tavolozza «Tavolo luminoso»: carta #F6F6F3, carta-2 #ECECE7, grafite #1E1F22, grafite-2 #6A6B6F, vermiglio #C9370F; niente ambra. Dalla 1.21 accento viola #6D2FE8; dalla 1.23 arancio #F07A1A (titoli #C2540A, testi piccoli #A34604), fondo grigio perla #E4E4E8, navbar avorio.

## Direzione artistica
- Carta #EEEBE4 · Inchiostro #111110 · Grigio #5E5C56 · Linee rgba(17,17,16,.14) · Accento vermiglio #E0401A (solo segnali).
- Display: Inter Tight 700 (corsivo per gli accenti) · Testo: Inter · Misure: JetBrains Mono — gli stessi caratteri di Rain Ink (dalla 1.9; 1.8 Instrument Serif/Sans; prima Bodoni Moda, Geist, Geist Mono).
- Motto: «Niente di troppo» (Nemesi punisce l'eccesso: legame col «senza fronzoli»).

## Divieti
- Il copy non descrive mai lo scroll o il meccanismo. `copy-gate.js` deve uscire 0.
- Niente glow, gradienti decorativi, emoji, badge. Solo transform/opacity/clip-path.
- Ordine ScrollTrigger: pin film → poi effetti ambientali.
- Contratto dev: `?jump=<y>` + `window.__ready`.

## Dati da sostituire (inventati)
Email ciao@nemesi.studio, link social, bio.
