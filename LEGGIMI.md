# Nemesi — sito

## Versioni

### 1.0 — 20/11/2026
- Prima versione: pagina unica scroll-film in puro codice.
- Apertura: wordmark NEMESI fatto di 21 aste → griglia a 6 colonne con misure → titolo → 4 riquadri lavori → il lavoro 01 a tutto schermo.
- Sezioni: Lavori (4, inventati), Servizi (4), motto «Niente di troppo», Metodo (4 fasi, corsa orizzontale), Studio, Contatti.
- Caratteri: Bodoni Moda, Geist, Geist Mono. Colori: carta #EEEBE4, inchiostro #111110, vermiglio #E0401A.
- Verifiche: copy-gate pulito, fluidità max 19 ms, schermate computer 1440×900 e telefono 390×844, movimento ridotto.

### 1.1 — 20/11/2026
- Lavori: solo Rain Ink Tattoo (01) e Olimp (02), con testi veri e link ai siti online; tolti i quattro lavori inventati.
- Copertine = schermate dei siti online (cartella images/lavori, versione computer e telefono); nel film due riquadri invece di quattro.

### 1.2 — 20/11/2026
- Apertura animata della hero (circa 1,7 s, una volta al caricamento): si disegna il righello, poi le 21 aste di NEMESI si tracciano lettera per lettera, poi le due righe del titolo salgono dalla maschera, infine colonna laterale e menu.
- Chi scorre, tocca o preme un tasto durante l'apertura la completa subito; niente apertura con «movimento ridotto» o con `?jump`.
- Corretto: il testo della hero catturava l'opacità iniziale nascosta (ora `fromTo`).

### 1.3 — 20/11/2026
- Fine del film: Olimp non sparisce più. I due riquadri si allargano in due pannelli uguali (16:10) sotto il titolo, con didascalia cliccabile (numero, nome, settore) che porta alla scheda; header sempre chiaro.
- Lavori: ogni progetto è una scheda completa (titolo grande, schermata computer + schermata telefono, descrizione, sei funzioni realizzate, pulsante «Visita il sito»). Sul telefono si vede solo la schermata del computer.

### 1.4 — 20/11/2026
- Apertura in 3D (Three.js r147, js/scena.js): le 21 aste di NEMESI sono travi lucide scure sospese nel buio, con luce vermiglia e ambra, braci, foschia e bagliore. Scorrendo la ripresa gira e le aste si ricompongono nella scritta, che diventa color carta e passa la mano alle aste HTML (stessi pixel). Poi il film prosegue come prima (griglia, titolo, lavori), tutto su fondo notte.
- Testi della hero più piccoli, in basso a sinistra; angoli di inquadratura e due etichette in alto.
- Più colore («Notte e vermiglio»): film, Servizi e Contatti su fondo notte; motto su campo vermiglio; numeri, fasi del Metodo, elenchi e dettagli in vermiglio; accenti dei titoli in ambra.
- Apertura al caricamento: la scena emerge dal buio, poi titolo, menu e righello.

### 1.5 — 20/11/2026
- Anteprime dei lavori rifatte (1440×810): Rain Ink con la sua barra di navigazione e la frase sotto la scritta RAIN INK; Olimp con la terza foto della hero (album sul tavolo). Immagini centrate nei pannelli.
- Tolto tutto quello che c'era dopo il film (schede dei lavori, Servizi, motto, Metodo, Studio) con il relativo CSS e JS: da ripensare. Resta solo il piè di pagina con i contatti (`<footer id="contatti">`).
- Menu: solo «Lavori» (porta alla fine del film, l'indice dei due lavori) e «Scrivimi». Le didascalie dei pannelli aprono i siti online in una nuova scheda.
- Verifiche: copy-gate pulito, fluidità max 18,9 ms, schermate computer e telefono.

### 1.6 — 20/11/2026
- Colori un po' più chiari (variante «A» scelta dal confronto): notte da #0E0C0B a #1F1A16, notte-2 da #17130F a #2A231D, vermiglio da #E8431C a #EE5028, ambra da #F2A93B a #F5B655; sfumature dietro i testi e fondo delle copertine intonati.
- Scena 3D intonata: sfondo e foschia #1F1A16, travi #3A302A (prima #2B231F), luce d'ambiente #4a382e.

### 1.7 — 20/11/2026
- Tornati i colori di prima (quelli della 1.5): la versione più chiara della 1.6 è tolta, sia nella pagina sia nella scena 3D.
- Tolta la sezione dei contatti («Hai un progetto? Scrivimi.», email, info, riga © e «Torna su») con il suo CSS e JS: ora la pagina finisce con i due pannelli dei lavori.
- Il bottone «Scrivimi» in alto apre l'email (mailto:ciao@nemesi.studio) invece di portare alla sezione.

### 1.8 — 20/11/2026
- Nuovi caratteri (proposta 2 tra tre messe a confronto): Instrument Serif per titoli e accenti in corsivo, Instrument Sans per i testi, JetBrains Mono per etichette e misure (prima Bodoni Moda, Geist, Geist Mono).
- Titoli più grandi per compensare il serif stretto: hero clamp(40px, 5.4vw, 88px), titolo dei lavori clamp(44px, 7vw, 112px); spaziatura dei titoli -0,02em.

### 1.9 — 20/11/2026
- Caratteri presi da Rain Ink Tattoo: Inter Tight (titoli in grassetto 700, corsivo per gli accenti in ambra e vermiglio; nomi dei lavori 600) e Inter per i testi. Restano JetBrains Mono per etichette e misure.
- Titoli riproporzionati per il carattere più pesante: hero clamp(34px, 4.4vw, 70px), frase sulla griglia clamp(32px, 4.2vw, 66px), titolo dei lavori clamp(36px, 5.6vw, 90px); spaziatura -0,03em.

### 1.10 — 21/11/2026
- Hero più essenziale: tolte la scritta «Disponibile da gennaio 2027» in alto a destra e la frase sotto il titolo («Siti, identità per il web e negozi online…»), con il loro CSS e la loro animazione d'apertura.

### 1.11 — 21/11/2026
- Hero: nascosto il titolo «Web design su misura. Niente di troppo.» (commentato nel codice, CSS e animazione restano per poterlo rimettere).

### 1.12 — 21/11/2026
- La scritta ad aste ora è «NEMESI WEB» (nuove lettere W, come una M capovolta, e B squadrata): su computer una riga sola (lettere più basse per starci), su telefono NEMESI sopra e WEB sotto. Anche la scena 3D ha le aste in più (35 invece di 21) e anche il logo in alto è NEMESI WEB.
- Nel passaggio alla griglia si muove tutta la scritta: le 21 aste di NEMESI diventano le linee come prima, le 14 di WEB volano anche loro sulle linee (verticali dalla 3ª colonna in poi, orizzontali sulle righe 1–3 e 5–7) e lì si spengono per non raddoppiarle. Aste più ravvicinate nella partenza (0,003 invece di 0,005) perché il movimento finisca in tempo.
- Titolo della scheda ed etichette: «Nemesi Web».

### 1.13 — 21/11/2026
- Barra di avanzamento ridisegnata: tolta la barra di scorrimento del browser; al suo posto, a destra, un filo sottile con tacche fitte (come il righello in basso). Il tratto percorso si riempie di vermiglio, con una tacca vermiglia che scende; sei tacche più lunghe segnano i capitoli del film (01–06), la corrente in vermiglio con il numero accanto. Al passaggio del mouse compaiono tutti i numeri e un punto sulla tacca.
- Si clicca (scorrimento morbido fino a quel punto) e si trascina come una barra normale; sul telefono più sottile e senza numeri. Compare con l'apertura.

### 1.14 — 21/11/2026
- Fine del film: tolte le didascalie sotto i pannelli (numero, nome, settore, freccia) e il righello in basso, che svanisce quando i lavori si allargano. I due pannelli scendono fino al margine e sono più grandi.
- I due pannelli sono cliccabili: aprono Rain Ink Tattoo e Olimp in una nuova scheda (il nome resta per i lettori di schermo). Al passaggio del mouse la schermata si ingrandisce appena.

### 1.15 — 21/11/2026
- Passaggio dai blocchetti 3D alla scritta NEMESI WEB molto più fluido:
  - il progresso della scena ora è ammorbidito (insegue lo scorrimento con un ritardo di circa 0,12 s), così i passi della rotella non danno più scatti;
  - curva più dolce (sinusoidale invece che cubica: velocità massima dimezzata), aste più ravvicinate tra loro (ritardi 0,12 + 0,04 invece di 0,16 + 0,06) e movimento di ciascuna più lungo;
  - le aste arrivano tutte entro l'82% della scena e la ripresa entro il 90%: al passaggio alle aste HTML è tutto fermo, niente salti; quando la scena si ferma si allinea esattamente.
- Risoluzione della scena 3D sul computer un po' più bassa (1,35 invece di 1,5 pixel per punto) per avere più fotogrammi al secondo sugli schermi Retina.

### 1.16 — 21/11/2026
- Pannelli dei lavori: al passaggio del mouse una cornice al neon ambra evidenzia il pannello scelto (filo chiaro #FFE3A6 di 1,5 px, staccato 6 px dal bordo, con alone ambra fuori e dentro), entrando con una leggera dissolvenza; la stessa cornice compare navigando con la tastiera (Tab).

### 1.17 — 21/11/2026
- Filo di avanzamento: i numeri dei capitoli (01–06) ora stanno a destra del filo invece che a sinistra, così «01» non si sovrappone più all'angolo in alto a destra della hero.

### 1.18 — 21/11/2026
- Titolo dei lavori: «Siti chiari, intuitivi, costruiti per durare.» (prima «veloci»).
