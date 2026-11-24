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

### 1.19 — 21/11/2026
- Nuova sezione dopo il film, «App e giochi»: quattro riquadri 16:10 in fila (due per fila sul telefono) con numero, nome e genere sotto: 03 Parola (testi), 04 Foglio (calcolo), 05 Metal Gear (gioco d'azione), 06 Radente (gioco di volo). Schermate in images/lavori (parola-d, foglio-d, metalgear-d, radente-d, 2000×1125).
- Ogni riquadro apre l'app o il gioco online (GitHub Pages) in una nuova scheda; al passaggio del mouse la stessa cornice al neon ambra dei pannelli del film. Entrano in fila con una leggera salita.
- Header: dopo il film prende un fondo notte semitrasparente sfocato con un filo sotto, così il contenuto che scorre non si sovrappone a logo e menu; resta sempre chiaro.
- Filo di avanzamento: le tacche dei capitoli si ricalcolano sulla fine del film (la pagina ora è più lunga).

### 1.20 — 21/11/2026
- Sito chiaro («Tavolo luminoso»): tutto su fondo carta fredda #F6F6F3 invece che notte. Restano uguali film, movimento, impianto e caratteri.
- Colori: testo e aste in grafite #1E1F22, testo secondario #6A6B6F, linee al 14% di grafite, fondo secondario #ECECE7; un solo accento vermiglio più scuro #C9370F (contrasto leggibile su fondo chiaro). Tolta l'ambra: i corsivi dei titoli ora sono vermigli.
- Scena 3D: fondo e foschia color carta, travi in grafite satinata, luci da studio chiaro con una luce vermiglia di taglio; tolti braci, macchie di foschia, bagliore dietro la scultura e bagliore in post (UnrealBloom, con i suoi due script). Alla fine le travi diventano color inchiostro, identiche alle aste HTML.
- Header, filo di avanzamento e righello in grafite; dopo il film l'header ha un fondo carta semitrasparente sfocato. Bottone «Scrivimi» grafite con testo chiaro.
- Pannelli dei lavori e riquadri di App e giochi: al passaggio del mouse una cornice vermiglia sottile al posto del neon ambra; i riquadri hanno un filo grigio intorno.
- Verifiche: copy-gate pulito, fluidità max 24,8 ms, schermate computer 1440×900 e telefono 390×844.

### 1.21 — 21/11/2026
- Nuovo logo «nemesi web»: simbolo ridisegnato in vettoriale (images/logo/nemesi-mark.svg, dall'originale images/logo/nemesi-web-originale.png) con nastro grafite e due pezzi viola sfumati, filo viola, scritta in Outfit 500 («nemesi» grafite, «web» viola sfumato). Anche icona della scheda. Il logo è sempre visibile (prima compariva solo dopo la scritta ad aste).
- Accento del sito dal vermiglio al viola del logo: #6D2FE8 (lilla #B66BFA per le sfumature, viola scuro #4A16B8 per i rilievi). Anche la luce di taglio della scena 3D è viola (#7B3FF2).
- Navbar come quella di Rain Ink, ma chiara: lastra sospesa con angoli arrotondati, bordo sottile e ombra morbida, luce viola che corre avanti e indietro sul bordo (9 s; ferma con «movimento ridotto»), più bassa scorrendo. Voci Siti, App, Giochi: al passaggio del mouse si sollevano e si ingrandiscono; la voce della sezione in cui sei è in rilievo con un trattino viola. «Scrivimi» è un bottone viola in rilievo con la busta, si abbassa al clic.
- Telefono: logo, panino (tre linee che diventano una X) e quadratino viola con la busta; il menu scende piegato in avanti con le voci in fila (30 ms l'una); si chiude toccando fuori, una voce o con Esc.
- Sezioni separate: «App» (03 Parola, 04 Foglio) e «Giochi» (05 Metal Gear, 06 Radente), due riquadri grandi per riga, ognuna con la sua intestazione. «Siti» porta alla fine del film (Rain Ink e Olimp).
- Verifiche: copy-gate pulito, fluidità max 19,8 ms, schermate computer e telefono, menu del telefono aperto senza errori.

### 1.22 — 21/11/2026
- Navbar più stretta: al massimo 720 px, centrata (prima larga quanto la pagina). Sul telefono resta come prima.
- Sfondo «grigio perla» #E4E4E8 al posto della carta quasi bianca (#F6F6F3), anche nella scena 3D; pannelli #EDEDF0; testo secondario un po' più scuro (#5C5D62) per restare leggibile sul grigio.
- Bastoncini più fluidi:
  - il film insegue lo scorrimento con dolcezza (scrub 0,6 s invece che agganciato al millimetro);
  - il volo delle aste dalla scritta alla griglia è più lungo (0,27 invece di 0,2 della timeline), con curva sinusoidale al posto di quella cubica (niente scatto a metà corsa) e partenze più ravvicinate (0,002);
  - nella scena 3D il progresso ammorbidito insegue lo scorrimento con una costante di ~280 ms (prima 120 ms).
- Tolta la frase «Ogni elemento deve guadagnarsi il posto.» con il suo CSS e la sua animazione; il titolo «Siti chiari, intuitivi, costruiti per durare.» arriva prima (0,46 invece di 0,53 della timeline).
- Verifiche: copy-gate pulito, fluidità max 19,4 ms, schermate computer e telefono.

### 1.23 — 21/11/2026
- Navbar a larghezza intermedia: al massimo 960 px (nella 1.22 erano 720).
- Fondo della navbar avorio caldo (#FDFAF5 → #F8F1E6, bordo e ombre calde); voce attiva e passaggio del mouse da bianco ad avorio #F4ECDF; anche il menu del telefono è avorio.
- Logo e accento in arancio al posto del viola: simbolo con pezzi arancio sfumati (#FFC27A → #F5892A → #C94A06), filo e «web» arancio. Accento #F07A1A per luci, filo a destra, trattino della voce attiva e luce di taglio della scena 3D; #C2540A per i corsivi dei titoli e #A34604 per i numeri piccoli (contrasto leggibile sul grigio); bottone «Scrivimi» arancio scuro (#E8731A → #BD4F08) con testo bianco.
- Riquadri dei lavori (Rain Ink, Olimp) e di App e Giochi: al passaggio del mouse (e con Tab) contorno al neon arancio, con filo chiaro #FFD2A1 e alone arancio fuori e dentro.
- Verifiche: copy-gate pulito, fluidità, schermate con il mouse sopra i riquadri.

### 1.24 — 21/11/2026
- Logo arancio identico all'originale viola: ricavato dall'immagine originale cambiando solo il viola in arancio (stesse forme, sfumature e bagliore), con il nero reso trasparente. File: images/logo/nemesi-web-arancio.png (completo, con «Web design • Digital solutions»), images/logo/nemesi-web-nav.png (per la navbar, senza motto), images/logo/favicon.png (icona della scheda). Tolto il simbolo vettoriale nemesi-mark.svg e il carattere Outfit.
- Navbar scura come Rain Ink: lastra grafite (#24252A → #121316) con rilievo e ombra profonda, voci grigio chiaro, voce attiva su grafite più chiaro con trattino arancio, luce arancio sul bordo, panino scuro; menu del telefono scuro.
- App e Giochi in stile film: ognuna è una scena fissata (2,4 altezze di schermo, scrub 0,6 s). Le linee della griglia a 6 colonne si tracciano, sale il titolo grande («App», «Giochi»); in App i riquadri si aprono dall'alto dentro una cella e poi si allargano affiancati, in Giochi entrano di lato come una pellicola (inclinati, poi si posano); alla fine compaiono numero, nome e genere. «App» e «Giochi» nel menu portano alla fine della loro scena.
- Titolo «Siti chiari, intuitivi, costruiti per durare.»: la maschera delle parole tagliava il corsivo a destra (tra «costruiti» e «per» sembrava mancare lo spazio); ora ha un margine per la sporgenza.
- Aste 3D più definite: si disegnano direttamente sul canvas (tolta la post-produzione EffectComposer, che spegneva l'antialias), antialias anche sul telefono, risoluzione fino a 2× sugli schermi Retina (prima 1,35×). Tolti i sei script della post-produzione.
- Corretto: nella 1.22 un commento aveva inghiottito `invalidateOnRefresh:true` del film.
- Verifiche: copy-gate pulito, fluidità max 19,9 ms, schermate delle scene su computer e telefono, nessun errore in console.

### 1.25 — 21/11/2026
- Bastoncini più scuri: travi 3D in grafite #232428 (prima #3A3B40) con luci un po' più basse; alla fine e nelle aste HTML colore #141518 (prima #1E1F22).
- Ancora più fluidi: il film e le scene di App e Giochi inseguono lo scorrimento in 1 s (prima 0,6 s), lo scorrimento morbido è più dolce (lerp di Lenis 0,07 invece di 0,09) e nella scena 3D il progresso ammorbidito ha una costante di ~400 ms (prima 280 ms).
- Verifiche: copy-gate pulito, fluidità max ~20 ms (tre misure).

### 2.0 — 21/11/2026 · «Dritto e rovescio», sito rifatto da zero
- Rifatto tutto da capo con la skill sito-film (Corsia A, solo codice). Il concept è stato scelto dopo lo sparring con un sub-agent: «Dritto e rovescio». Nemesi è l'opposto, e i lavori sono coppie di opposti: Siti «Pelle e carta», App «Lettere e numeri», Giochi «Piano e profondità». Appunti di produzione in BRIEF.md.
- Un solo oggetto per tutto il film, la «lastra»: nera laccata, a due strati, con il bordo arancio acceso come le facce laterali del logo e una luce che le corre intorno. La camera va solo avanti.
  - Apertura: il logo grande (PNG originale, mai modificato) sopra una riga di luce arancio, cioè la lastra vista di taglio. Il logo vola nella navbar e si posa esattamente sul logo della barra.
  - Siti: la lastra si alza e si accende su Rain Ink (01); mezzo giro e sul rovescio c'è Olimp (02).
  - App: mezzo giro su Parola (03), poi la lastra si sdoppia nello spessore e sulla faccia interna c'è Foglio (04).
  - Giochi: gli strati si richiudono e mezzo giro porta Metal Gear (05). La camera la attraversa mentre la faccia si sbriciola in pixel che bruciano d'arancio, poi vola tra anelli di luce fino allo schermo di Radente (06).
  - Scrivimi: la lastra torna da dietro la camera, gira e mostra una faccia vuota con «Manca solo il tuo progetto.», il bottone Scrivimi e l'email.
- Colori presi dal logo nero e arancio:
  - nero #08080A, grafite #17171B / #212126, bianco #F4F3F1, fumo #8E8E99;
  - arancio #F56F27 (luce #FFA54D, ombra #EA4006, brace #C92C02, oro #F9D377).
  - I titoli hanno una parte bianca e un corsivo arancio chiaro, come «nemesi» e «web».
- Caratteri: Bodoni Moda per i titoli (tondo e corsivo), Geist per i testi, Geist Mono per le etichette. Sono copie locali in fonts/, senza richieste a Google.
- Testi:
  - Siti: «Siti chiari, intuitivi, costruiti per durare.» (resta quello approvato).
  - App: «Scrivere e calcolare, dal browser al Mac.»
  - Giochi: «Mondi interi, dentro una pagina web.»
  - Finale: «Manca solo il tuo progetto.»
  - Didascalie dei sei lavori: numero, nome, una riga e l'azione (Visita il sito, Apri l'app, Gioca).
- Navbar scura come prima: lastra grafite con la luce arancio che corre, Siti / App / Giochi e Scrivimi; sul telefono panino e busta. Le voci portano ai capitoli del film. A destra c'è il filo di avanzamento con le tacche dei capitoli.
- Al passaggio del mouse (e con Tab) la lastra si accende di un alone al neon arancio. Il lavoro si apre con un clic, perché i link veri stanno sopra le facce 3D, deformati con la stessa prospettiva.
- Apertura al caricamento (circa 2 s): barra di caricamento, poi si accende la riga di luce, compare il logo e scende la navbar.
- Con «riduci movimento» o senza WebGL c'è una pagina statica completa: logo, riga di luce in CSS, i sei lavori con le immagini e Scrivimi.
- Aperto dal disco (doppio clic): immagini e caratteri arrivano incorporati da js/lavori-dati.js e js/caratteri-dati.js, caricati solo in quel caso.
- File:
  - nuovo js/lastra.js (scena 3D);
  - immagini dei lavori a 1600 px (images/lavori/<nome>.jpg);
  - tolti js/scena.js (la 1.25 è in archivio/1.25 e nella storia di git) e gli script di Three.js non più usati (post-produzione, RoomEnvironment, RoundedBoxGeometry).
- Verifiche:
  - copy-gate pulito;
  - fluidità max 19,7 ms (p95 18,5) su tutto il film;
  - schermate su computer 1440×900 e telefono 390×844;
  - pagina statica e apertura dal disco.

### 2.1 — 21/11/2026
- Apertura rifatta: niente più logo grande al centro. Il logo resta nella barra, visibile da subito, e nella pagina statica.
- Al suo posto ci sono le aste 3D, cioè i pezzi della lastra: 12 file di bastoncini neri laccati con i fianchi arancio.
  - Stanno in una vista esplosa, una fila sopra l'altra.
  - Si muovono di continuo con un'onda di torsione e una di rollio, e una luce scorre lungo ogni asta.
  - Scorrendo, una fila alla volta (dal fondo verso chi guarda) smette di girare, i pezzi si chiudono e la fila scende al suo posto sulla lastra distesa, con un lampo arancio all'arrivo.
  - Poi una riga di luce passa sulla lastra e la salda.
- Da lì in poi tutto resta come nella 2.0: la lastra si alza e lo schermo si apre dal basso verso l'alto con Rain Ink.
- All'inizio la camera guarda la lastra dall'alto e scende mentre la lastra si alza.
- Apertura al caricamento: le aste si accendono una dopo l'altra, poi scende la barra.
- Menu più fluido (Siti, App, Giochi, logo e filo a destra):
  - prima il film correva a tutta velocità fino alla tappa e i giri sembravano a scatti;
  - ora un salto lungo passa per un attimo di nero (0,34 s), riparte poco prima della tappa e ci arriva scorrendo piano (1,4 s);
  - i salti brevi restano uno scorrimento morbido.
- Il copione si allunga di 1,1 schermi, quelli dell'apertura: ora il film finisce a 12,1 schermi.
- Verifiche:
  - copy-gate pulito;
  - fluidità max 18,2 ms su tutto il film;
  - salto dal menu: la pagina salta quando il nero è pieno, e poi avanza per fotogramma 9 volte più piano di prima;
  - schermate su computer e telefono, apertura al caricamento, pagina statica.

### 2.2 — 22/11/2026
- Nuova icona della scheda: il logo è ora `images/logo/favicon.png` (originale 1536×1024, sfondo trasparente). La vecchia icona è `favicon2.png` e non è più usata.
- Prima Chrome riceveva direttamente l'originale, rettangolare e da 1,3 MB, e nella scheda lo mostrava male.
- Ora dall'originale (che resta intatto) si ricavano icone quadrate, ritagliate attorno al logo:
  - `favicon-32.png` e `favicon-16.png` per la scheda, con sfondo trasparente (si legge sia sulle schede chiare sia su quelle scure);
  - `favicon-180.png` per la schermata Home di iPhone e iPad, su fondo nero.
- Nei link c'è `?v=2.2` perché Chrome tiene a lungo in memoria le icone vecchie.

### 2.3 — 22/11/2026
- Sfondo meno scuro: da quasi nero #08080A a grafite scuro #17171C, nella pagina e nella scena 3D (fondo, nebbia, sfumatura ai bordi più leggera). Anche i grigi vicini salgono di pari passo.
- Aste dell'apertura: sullo sfondo più chiaro le barrette nere ora si staccano. In più il bordo della faccia nera che guarda la luce prende un filo di luce calda, nitido a un pixel, che si accende quando ci passa la luce che scorre.
- Bordo arancio della lastra: di fronte lo spigolo è più sottile di un pixel e si vedeva sgranato, a puntini. Ora c'è un filo disegnato sul bordo della faccia, largo sempre un pixel a qualunque distanza, che si unisce allo spigolo: la linea resta leggera ma continua.
- Caratteri:
  - titoli in Bodoni con taglio ottico fisso (`opsz` 24): con «auto» Chrome sceglieva il taglio da manifesto, con filetti così sottili che le lettere si spezzavano;
  - scritte piccole in maiuscolo (es. «DESIGN E SVILUPPO», «PORTFOLIO 2026», «VISITA IL SITO») più grandi e più spesse;
  - grigi dei testi più chiari: descrizioni, email, piede.
- Verifiche: copy-gate pulito, fluidità max 21,4 ms, schermate su computer (anche a densità doppia) e telefono.

### 2.4 — 22/11/2026
- Alone arancio attorno alla lastra (al passaggio del mouse): prima si fermava di colpo sul bordo di un riquadro; ora il piano è più grande e l'alone si spegne piano fino a zero.
- Barra di navigazione con il fondo nero (anche il menu a tendina del telefono).
- Titoli nel carattere della scritta RAIN INK: Inter Tight 800, al posto del Bodoni. La seconda riga resta arancio, dritta. Tolti i file del Bodoni; rigenerato `js/caratteri-dati.js`.

### 2.5 — 22/11/2026
- Barra: i tasti Siti, App, Giochi e Scrivimi hanno il fondo nero come la barra; al passaggio del mouse prendono un contorno arancio sfumato. Nero anche il tasto del menu sul telefono.
- Scrivimi diventa un tasto come gli altri (apre l'email); sul telefono sta nel menu.
- In fondo a destra, al posto di Scrivimi, il tasto arancio «Area riservata» con il lucchetto (sul telefono solo il lucchetto). Per ora porta a `area-riservata.html`, una pagina segnaposto con «Presto qui i tuoi progetti.» e «Torna al sito».

### 2.6 — 22/11/2026
- Barra: «Scrivimi» diventa «Contattaci» (anche nel filo a destra); il tasto dell'area riservata è solo il lucchetto, senza scritta.
- Alone al passaggio del mouse uguale su tutti i lavori: su Metal Gear (che sta sul retro della lastra, dopo i mezzi giri) l'alone esterno non si vedeva, perché il piano dell'alone era visibile solo da davanti. Ora si vede da entrambi i lati.
- Metal Gear: nuova anteprima presa dal gioco online dopo l'aggiornamento grafico (`metalgear-d.jpg` 2000×1125 e `metalgear.jpg` 1600×900), aggiornata anche in `js/lavori-dati.js`.

### 2.7 — 22/11/2026
- Radente: nuova anteprima presa dal gioco online dopo l'aggiornamento grafico (Radente 2.0, con il jet): `radente-d.jpg` 2000×1125 e `radente.jpg` 1600×900, aggiornata anche in `js/lavori-dati.js`.

### 2.8 — 22/11/2026
- Sfondo delle pagine grigio cemento `#9AA0A8` (prima grafite `#17171C`) in `index.html`, `area-riservata.html` e nella scena 3D (colore di fondo e nebbia in `js/lastra.js`); `theme-color` aggiornato.
- Testi sul cemento scuri: `--inchiostro` #15161A, secondari `--fumo-c` #383C44, arancio dei testi `--arancio-t` #A82E00 (l'arancio chiaro non si leggeva). Vignettatura ai bordi più leggera, filo di avanzamento scuro.
- Il finale sulla faccia nera della lastra resta con testi chiari. Barra, menu del telefono e bottoni restano neri.
- Area riservata: il logo sta su una piastra nera, perché la scritta «nemesi» è bianca.

### 2.9 — 22/11/2026
- Nuova apertura: il logo in 3D (`js/logo3d.js`, Three.js r147). È il nastro nero piegato con il dorso grigio e il filo arancio, con il triangolo e la barra arancio accesi.
- Effetto come nel video di riferimento: un filtro a schermo taglia il logo in strisce verticali sottili, sfalsate e tremolanti, con frange rosso/blu e un filo di arcobaleno. Il logo si compone dall'alto in circa 2 s, resta e gira piano, con qualche riga che ogni tanto scatta.
- Passaggio al sito: quando il sito ha caricato (e il logo è rimasto almeno fino a 2,9 s) il logo si sfalda in una pioggia di strisce che cadono. Il fondo si scioglie e dietro si accendono le aste dell'apertura, poi scende la barra. Chi scorre, tocca o preme un tasto salta il logo.
- Il logo prende il posto della vecchia barra di caricamento (`.pre`). Con `?jump`, «riduci movimento» o senza WebGL non c'è.
- Verifiche: sito pronto in circa 5,1 s (3,0 s saltando il logo), fluidità max 19,9–25,6 ms, controllo dei testi pulito, schermate computer e telefono.

### 3.0 — 22/11/2026
- Il colore d'accento passa dall'arancio al verde lime `#CDFD67`, preso dal bottone di riferimento, ovunque. Cambiano bottoni («Contattaci», «Scrivimi», area riservata), aloni e neon, la luce che corre sul bordo della barra, il bordo della lastra, le aste dell'apertura, gli anelli, la riga di luce, il pulviscolo, i riflessi dello studio 3D e il logo in 3D dell'apertura.
- Ogni arancio è diventato il verde con la stessa luminosità; i toni scuri sono un po' più cupi. Il testo dei bottoni è blu notte `#030B1F`, come nel riferimento. I testi d'accento sul cemento sono verde scuro `#2F5600`, per restare leggibili.
- Logo e icone della scheda: nuove copie verdi (`nemesi-web-verde.png`, `nemesi-web-nav-verde.png`, `favicon-verde*.png`, link `?v=3.0`). Gli originali arancio restano intatti in `images/logo/`.
- Verifiche: controllo dei testi pulito, fluidità max 22,7 ms, schermate di apertura, film, finale, area riservata e telefono.

### 3.1 — 22/11/2026
- Le parole d'accento dei titoli («costruiti per durare.», «dentro una pagina web.», «i tuoi progetti.» nell'area riservata) ora sono nel verde lime `#CDFD67` del bottone (prima verde scuro `#2F5600`). Un'ombra blu notte leggera le stacca dal grigio cemento.
- Le scritte piccole d'accento (numeri dei lavori, «Gioca», la parola evidenziata sopra i titoli) restano verde scuro, perché in lime a quella misura sul cemento non si leggerebbero.

### 3.2 — 22/11/2026
- App: Parola ora si chiama **Word** (03) e Foglio **Excel** (04), nelle didascalie, nelle etichette per i lettori di schermo e nella descrizione della pagina. Gli indirizzi restano `nemesimark.github.io/parola/` e `/foglio/`.
- Nuove anteprime `parola-d.jpg`/`parola.jpg` (Word, dal sito online) e `foglio-d.jpg`/`foglio.jpg` (Excel, dal sito online), aggiornate anche in `js/lavori-dati.js`.

### 3.3 — 22/11/2026
- Barra: la linea verde non corre più sul bordo, ora è fissa e accesa su tutto il contorno, con un alone leggero.
- Tasti Siti, App, Giochi, Contattaci in rilievo come quello del lucchetto: scuri, con luce sul bordo alto e spessore sotto; al passaggio del mouse si alzano con un filo verde, al clic si abbassano. In rilievo anche il tasto del menu sul telefono e le voci del menu aperto.
- Verifiche: controllo dei testi pulito, fluidità max 46,1 ms, schermate barra su computer (anche al passaggio del mouse) e telefono (anche con il menu aperto).

### 3.4 — 22/11/2026
- Logo in SVG, nero e verde, ricalcato sul logo originale: forme ridisegnate a vettori sopra il disegno originale, sfumature e luci misurate sull'originale. File: `nemesi-web.svg` (con il motto, pagina statica), `nemesi-web-barra.svg` (barra del sito e area riservata, stessa misura e posizione di prima), `nemesi-simbolo.svg` (solo il simbolo), `icona.svg` con `icona-16/32/180.png` (icone della scheda e dell'iPhone, `?v=3.4`). Il motto è in Jost (licenza OFL) convertito in tracciati. I PNG del logo restano intatti.
- Logo in 3D rifatto (`js/logo3d.js`, forma in `js/logo-forma.js`): costruito dalla forma vettoriale, con la faccia nera davanti, il nastro grigio che si piega all'indietro, il triangolo verde incassato, la barra, lo spessore con il bordo verde e il neon attaccato ai bordi. Sulle facce c'è il disegno del logo, quindi di fronte è identico all'originale; una banda di luce passa sul nastro e sui pannelli e il logo gira appena.
- Apertura come il video di riferimento, su nero: le strisce verticali piovono dall'alto con i colori del logo (frange verde giallo a sinistra e verde menta a destra), il pieno sale dal basso con il bordo frastagliato e le sbavature, poi il logo resta con la luce che passa.
- Dopo il logo: il pieno torna strisce dal basso e le strisce cadono, il nero scende a colonne sottili partendo dal centro e scopre il cemento; le file delle aste cadono dall'alto una dopo l'altra girando e si accendono con un lampo quando toccano; poi scende la barra. Si può scorrere 1,6 s dopo l'inizio dell'uscita.
- Durante il nero la scena 3D dietro disegna un fotogramma su tre e per tutta l'apertura non abbassa la risoluzione; sul telefono la barra del browser è nera durante l'apertura.
- Corretto: con un indirizzo `#capitolo` il velo dell'apertura restava sopra la pagina e la barra non compariva.
- Il ricalco del logo e il laboratorio del logo 3D sono in `archivio/logo-svg/` (fuori da git); il video di riferimento è escluso da git.
- Verifiche: controllo dei testi pulito, fluidità max 19,7 ms, sito pronto in 6,6 s (4,0 s toccando dopo 1 s), apertura registrata su computer 1440×900 e telefono 390×844, da file locale, con «riduci movimento», con `#siti` e area riservata.

### 3.5 — 22/11/2026
- Repository dei lavori rinominati come le cartelle: i link portano ai nuovi indirizzi `rainInk/` (prima `inkubo/`), `olimp/` (prima `trama/`), `word/` (prima `parola/`) ed `excel/` (prima `foglio/`). La cartella del sito ora si chiama `nemesiWeb`.

### 3.6 — 22/11/2026
- Tolti i file di riepilogo della chat (`riepilogo-*.txt`, mai finiti online): ora il passaggio tra chat lo fa la mod di handoff. Aggiornato `CLAUDE.md`.

### 3.7 — 22/11/2026
- Nuova pagina di prova `strumenti.html` (per ora a parte, non collegata dal sito): sei lastre 3D laccate con gli spessori verdi (Claude, VS Code, GitHub, Figma, Cloudflare, Supabase) in giostra intorno a un asse verde, su pavimento a griglia. Girano da sole una alla volta e seguono lo scorrimento; si fermano sempre con una lastra davanti, con didascalia e punti per sceglierla (anche frecce della tastiera).
- Icone da simple-icons (CC0) in `images/strumenti/`, tracciati in `js/strumenti-icone.js`. Con «riduci movimento» o senza WebGL: griglia ferma di lastre.
- Verifiche: controllo dei testi pulito, fluidità max 18,6 ms, schermate 1440×900 e 390×844.

### 3.8 — 22/11/2026
- Icona del sito di nuovo con lo sfondo trasparente (come dalla 2.2): dalla 3.4 `icona.svg` e `icona-16/32/180.png` avevano un quadrato nero arrotondato dietro il logo, che compariva nei segnalibri. Tolto il fondo anche nel generatore (`archivio/logo-svg/trace/build_svg2.py`), così non torna quando si rigenera il logo. Link delle icone a `?v=3.8`.

### 3.8 — 22/11/2026
- `strumenti.html`: lastre nei colori originali come le icone delle app, corpo intero (facce e spessori) del colore della marca: Claude arancio con logo bianco, VS Code blu con logo bianco, GitHub nero con logo bianco, Figma nero con il logo a cinque colori, Cloudflare bianco con la nuvola arancio, Supabase nero con il logo verde. Anche la griglia ferma usa questi colori.
- Più definizione: marchi disegnati su texture da 2048 px con filtro anisotropo, bordi arrotondati più lisci, disegno almeno a 1,5× anche sugli schermi normali; tolta la correzione di tono che sbiadiva i colori delle marche.
- Verifiche: controllo dei testi pulito, fluidità max 19,2 ms, schermate 1440×900 e 390×844.

### 3.9 — 22/11/2026
- Strumenti: aggiunto Netlify (petrolio con il logo turchese), ora sono sette lastre.
- Lavoro 02: al posto di Olimp c'è l'anteprima dell'area riservata di Rain Ink (`images/lavori/areariservata.jpg`, dalla schermata Portfolio della sua guida, senza il riquadro viola). Stesso effetto nel film, ma senza collegamento: si vede e non si clicca. Didascalia «02 Rain Ink · Area riservata, Foto e testi del sito, gestiti dal titolare». Rigenerato `js/lavori-dati.js`.
- Nuovo capitolo nel film, tra Siti e App: «Strumenti, Con cosa lavoro ogni giorno.». A metà del mezzo giro verso Word la lastra si ferma di taglio, si fa sottile e diventa l'asse verde; dal suo bordo escono a ventaglio sette lastre nere che si accendono nei colori delle marche e girano una alla volta davanti, con la didascalia sotto; poi rientrano e il mezzo giro riprende verso Word. La camera sale un poco per guardare la giostra dall'alto.
- Tecnica: in `js/lastra.js` il copione K è rimasto quello di prima; `GW` e `warp()` fermano il film per `GW.gd` (3,1) schermi. In `index.html` i tempi dopo l'inizio della giostra passano da `X()`. Il film ora finisce a 15,2 schermi. Tappa «Strumenti» sul filo di avanzamento. Nella pagina ferma (riduci movimento) gli strumenti sono un elenco con le icone.
- Verifiche: controllo dei testi pulito, fluidità max 20,4 ms, schermate 1440×900 e 390×844 di tutta la giostra, di Word, di Radente e del finale.

### 3.10 — 22/11/2026
- Lavoro 02 (area riservata di Rain Ink): al passaggio del mouse si illumina come gli altri lavori (contorno al neon), però resta senza collegamento e il puntatore non diventa la manina.

### 3.11 — 22/11/2026
- Giostra degli strumenti: l'asse verde ora parte dal piano dell'orbita e sale (più corto, non arriva al titolo), senza scendere sotto le lastre; la didascalia (casa, nome, riga) sta un poco più in basso. Così testo e asse non si sovrappongono più.

### 3.12 — 22/11/2026
- Giostra degli strumenti, nuova chiusura verso le App («risucchio e saldatura»): la giostra accelera e stringe il raggio, le lastre si assottigliano in fili di luce verde e finiscono dentro l'asse, che lampeggia; la lastra torna intera di taglio e finisce il mezzo giro su Word, mentre la barra di luce accende Word. Prima le lastre rientravano sparse e la lastra si riapriva di sbieco.
- La lastra davanti della giostra porta al sito ufficiale dello strumento (nuova scheda): velo trasparente deformato sulla sua faccia, con il contorno al neon al passaggio del mouse; raggiungibile anche con la tastiera. Indirizzi in `js/strumenti-icone.js` (`url`). Nella pagina ferma il nome di ogni strumento è un collegamento.
- Verifiche: controllo dei testi pulito, fluidità e schermate della chiusura fotogramma per fotogramma.

### 3.13 — 22/11/2026
- Giostra degli strumenti, ingresso uguale all'uscita (al contrario): la lastra di taglio si assottiglia nell'asse, lampo, dall'asse escono fili di luce verde che girano, rallentano, si allargano in lastre e si accendono nei colori delle marche.
- Giro da sole: se chi guarda resta fermo dentro la giostra, dopo un attimo (1,3 s) le lastre continuano a passare davanti una alla volta, ogni 3,2 s, e si fermano sempre con una lastra davanti; appena si scorre di nuovo, il giro riparte da dove sono arrivate. Ai capi della giostra il giro da sole si scioglie in quello dei fili.
- Verifiche: schermate dell'ingresso fotogramma per fotogramma; da fermi la lastra davanti passa 2 → 3 → 4 → 5 ogni 3,2 s; fluidità nella norma.

### 3.14 — 22/11/2026
- Apertura un poco più lenta e morbida: tutto il movimento del logo 3D (strisce, pieno, luce, uscita) e la caduta delle aste, la barra e gli angoli scorrono più piano del 18% (`LENTO` in `js/logo3d.js`, `intro.timeScale` in `index.html`), sempre insieme.
- Giostra: quando si riprende a scorrere dopo il giro da sole, si riparte dalla lastra che si ha davanti. Scendendo il giro va sempre avanti e arriva all'ultima lastra giusto per l'uscita; salendo torna indietro fino alla prima. Niente più giro all'indietro all'uscita (`gioMap`, ancora `xa`/`fa` in `AUTO`).
- Barra: nuova voce «Tool» tra Siti e App (indirizzo `#tool`, anche `#strumenti` funziona); nel filo laterale «Strumenti» diventa «Tool».
- Eliminata la pagina di prova `strumenti.html`.

### 3.15 — 22/11/2026
- Apertura ancora più lenta: `LENTO` 1,4 (prima 1,18), stesso `timeScale` per la timeline `intro`.
- Barra: tolta la linea verde sul contorno (con l'alone che sembrava pulsare); al suo posto una sfumatura verde ferma e morbida su tutti i lati (`box-shadow` di `.slab`).
- Giostra: tolta la lastra sottile che restava dentro l'asse verde a giostra aperta; sparisce nel lampo d'ingresso e torna nel lampo d'uscita.

### 3.16 — 22/11/2026
- Tasti della barra (Siti, Tool, App, Giochi, Contattaci e il lucchetto): al passaggio del mouse zoom più marcato (1,1) e alone verde sfumato su tutti i lati; tolta la linea di contorno verde. Anche il tasto scelto con la tastiera ha l'alone al posto della linea.

### 3.17 — 22/11/2026
- Nuovo capitolo «Studio» (voce nella barra tra Giochi e Contattaci, indirizzo `#studio`): dopo Radente la lastra torna con la faccia vuota, avanza verso chi guarda e la faccia si apre nella mappa a tutto schermo; poi si richiude, la lastra torna al suo posto e compare «Manca solo il tuo progetto.».
- La mappa è quella di «Dove siamo» di Rain Ink 6.26 (skill mappa-uni, `js/mappa.js`, MapLibre 5.6.0 in `vendor/maplibre/`): dalla Terra vista dallo spazio a via dello Scalo 12 in 14 s, con le soste Italia → Emilia-Romagna → Bologna → Porto-Saragozza, contorni al neon verde lime (`#F6FFE4`, `#CDFD67`, `#A6EF0B`) e segnaposto «Nemesi Web» che apre Google Maps. Parte quando la faccia si è aperta del tutto.
- Consenso: il sito non ha altri cookie, quindi niente barra; vale il riquadro «Mostra la mappa» (scelta ricordata in localStorage, chiave `nemesi_cookie_v1`).
- Copione: `MW` in `js/lastra.js` ferma il film a `K.fin1` per 3,2 schermi (`poseMappa`, `S.mappa()`), `X()` in `index.html` slitta anche dopo la mappa; la frase finale e il bottone Scrivimi arrivano dopo la mappa e non si cliccano prima che compaiano. `K.end` passa da 15,2 a 18,4.
- Pagina ferma («riduci movimento»): sezione Studio con la mappa nel riquadro alto 600 px, come in Rain Ink.

### 3.18 — 22/11/2026
- Studio: quando la mappa si apre (dalla faccia fino al tutto schermo) titolo e occhiello diventano chiari, con un'ombra leggera, così si leggono sopra le foto satellitari; «Bologna» nell'occhiello in verde lime.
- Giostra Tool: asse verde più basso (alto 1,5 invece di 2,2): parte sempre dall'orbita e finisce poco sopra le lastre, lontano dal titolo.

### 3.19 — 22/11/2026
- Mappa dello studio: tolta la sosta sul quartiere Porto-Saragozza. Ora Italia → Emilia-Romagna → Bologna (sosta di 3 s, come l'ultimo livello di Rain Ink) e poi si scende dritti al civico di via dello Scalo 12; la durata resta 14 s.

### 3.20 — 22/11/2026
- Barra riorganizzata: **Portfolio** (con il sottomenu Siti · App · Giochi), Studio, Tool, Contattaci e il lucchetto. Sul computer il sottomenu si apre sotto Portfolio al passaggio del mouse o con la tastiera (stessa lastra scura con la sfumatura verde, freccia che gira); sul telefono le tre voci stanno sempre in vista, rientrate sotto Portfolio. Dentro Siti, App o Giochi resta acceso anche Portfolio. Il filo laterale resta nell'ordine del film.
- **Area riservata** (skill area-ris, copia di quella di Olimp): vedi la sezione «Area riservata» qui sotto. Non ancora attivata.
- Le foto dei lavori sulla lastra 3D ora vengono dall'`<img data-slot>` della pagina (non più da nomi fissi), così una foto cambiata dall'area riservata cambia anche sulla lastra.
- Dentro un riquadro (anteprima dell'area riservata) la pagina resta ferma, come con «riduci movimento».

### 3.21 — 22/11/2026
- **Area riservata attivata**: Worker `nemesiweb-area-riservata` su Cloudflare (https://nemesiweb-area-riservata.nemesi-mark.workers.dev) con il suo KV `DATI` e i secret; indirizzo in `<meta name="ar-api">`; GitHub Pages ora pubblica con GitHub Actions (`pubblica.yml` parte a ogni push su main).

### 3.22 — 22/11/2026
- Area riservata, anteprima dei testi del menu (Siti, App, Giochi): il tratteggio verde ora sta dentro il pulsante, prima usciva fuori ed era tagliato dal sottomenu e coperto dalle voci vicine.

### 3.23 — 22/11/2026
- Giostra dei Tool: l'asta verde al centro c'è solo all'ingresso e all'uscita (la lastra di taglio che si stringe, il lampo, i fili di luce); mentre le lastre si aprono si spegne e a giostra aperta non si vede più.

### 3.24 — 23/11/2026
- **Pagina Portfolio** (`portfolio.html`): nella barra «Portfolio» ora apre una pagina nuova, ferma (senza film e senza animazioni di scorrimento), con tutti i lavori come nella pagina statica: Siti (Rain Ink 01, area riservata 02), App (Word 03, Excel 04), Giochi (Metal Gear 05, Radente 06), ognuno con la foto 16:9, il contorno verde al neon al passaggio, numero, nome, descrizione e «Visita il sito ↗ / Apri l'app ↗ / Gioca ↗». In testa il titolo «Siti, app e giochi, tutti qui.» e tre tasti per saltare alle sezioni; in fondo «Manca solo il tuo progetto.» con Scrivimi.
- Barra: Portfolio → `portfolio.html`; Siti, App, Giochi → `portfolio.html#siti`, `#app`, `#giochi` (anche dalla home). Nella pagina Portfolio il logo torna alla home e Studio e Tool portano al punto del film (`index.html#studio`, `index.html#tool`).
- `scripts/genera_contenuti.py`: con `COPIE` le foto e i testi dei lavori cambiati dall'area riservata vanno sia in `index.html` sia in `portfolio.html`. Titolo e tasti in testa alla pagina Portfolio non si cambiano dall'area.

### 3.25 — 23/11/2026
- Pagina Portfolio: al posto di «02 Rain Ink · Area riservata» c'è **02 Olimp**, cliccabile (https://nemesimark.github.io/olimp/, «Visita il sito ↗»), con l'anteprima della home di Olimp sulla terza foto della presentazione (l'album sul tavolo). Schermata nuova in `images/lavori/olimp.jpg` (1600×900) e `olimp-d.jpg` (2000×1125), presa dal sito online. Nella home resta l'area riservata di Rain Ink.
- Pagina Portfolio: ogni lavoro sta sulla **lastra della home**, rifatta in CSS con le misure e le luci di `js/lastra.js` (larghezza della lastra = 100 `--u`): cornice nera laccata, angoli, bordo verde più chiaro dal lato della luce con la luce calda che gli gira intorno in 15 s, lucido obliquo sul vetro, alone tenue dietro. Come nella home la lastra ondeggia piano e guarda il puntatore ovunque sia sulla pagina (stessi angoli e smorzamento). Al passaggio sulla lastra o su «Visita il sito ↗»: alone verde chiaro fuori dalla sagoma (`FS_NEON`), riflesso verde lungo il bordo dello schermo, bordo più acceso; gli aloni si sommano alla luce (`mix-blend-mode: plus-lighter`). Con «riduci movimento» la lastra sta ferma.

### 3.26 — 23/11/2026
- **Area riservata, misura della foto** (come Olimp 3.39): quando si carica una foto nuova di misura diversa da quella del posto, sotto la misura si sceglie **Adatta in automatico** (già scelto: ritaglio alla forma del posto con la parte scelta nell'anteprima e misura esatta, es. 1600 × 900, anche ingrandendo) oppure **Usa la mia foto così com'è** (stessi pixel, niente tagli né ridimensionamenti; si toglie solo l'EXIF; oltre i 4 MB del Worker si abbassa la qualità JPEG e se non basta un messaggio chiede di adattarla). Se la foto è già della misura giusta la scelta non compare. Avvisi gialli e guida «Foto: formati e misure» aggiornati. Worker non toccato.

### 3.27 — 23/11/2026
- Guida dell'area riservata: rifatta la schermata `fissa-scheda` (ora con «Misura giusta: …»), punti che lampeggiano ricalcolati con `riquadri.py`; nel passo delle foto una riga sulla scelta **Adatta in automatico / Usa la mia foto così com'è**.

### 3.28 — 23/11/2026
- Home, capitolo Siti: il lavoro 02 ora è **Olimp** (stessa anteprima della pagina Portfolio, `images/lavori/olimp.jpg`), cliccabile: apre https://nemesimark.github.io/olimp/ con «Visita il sito ↗». Didascalia «02 Olimp, Album fotografici su misura, dal 1969».
- Il posto della foto si chiama ora `lavoro-olimp` (prima `lavoro-areariservata`): si cambia dall'area riservata e vale per home e Portfolio (in `portfolio.html` aggiunti `data-slot` e `data-testo`). Testi `index-t009`/`index-t010` aggiornati; in `js/lavori-dati.js` la foto di Olimp al posto di quella dell'area riservata.

### 3.29 — 23/11/2026
- Dominio nuovo **nemesiweb.it** (GitHub Pages, dominio personalizzato). Il Worker dell'area riservata accettava solo `https://nemesimark.github.io`, quindi dal dominio nuovo l'accesso dava «Nessuna connessione, riprova». In `worker/wrangler.toml` `ORIGINS` ora comprende anche `nemesiweb.it` e `www.nemesiweb.it` (http e https); Worker ripubblicato con `npx wrangler deploy`.
- Da fare: in GitHub → Settings → Pages spuntare «Enforce HTTPS» appena il certificato è pronto.

### 3.30 — 23/11/2026
- Barra dei cookie semplice (`js/cookie.js`, in home e Portfolio): compare in basso dopo l'apertura finché non si sceglie; «Accetta» attiva la mappa dello studio dallo spazio, «Rifiuta» la lascia spenta (resta il riquadro «Mostra la mappa»). Stessa chiave della mappa (`nemesi_cookie_v1`); non compare nell'anteprima dell'area riservata.

### 3.31 — 23/11/2026
- Area riservata: nuova scheda **Portfolio** (tra Home e Menu) per `portfolio.html`, con Foto e Testi. Le sei foto e i testi dei lavori sono gli stessi della Home (cambiati in una pagina cambiano anche nell'altra; sulla scheda c'è scritto «uguale anche in Home»); in più i 7 testi solo di Portfolio (`portfolio-t001`…`t007`: occhiello, titolo in due parti, le tre scorciatoie Siti, App, Giochi).
- L'area legge le pagine vere (`PRESENTI`) e mostra in ogni scheda i testi e le foto che la pagina contiene davvero, anche se ripresi da un'altra; le anteprime si aprono sulla pagina della scheda aperta.
- Regola: **ogni pagina HTML nuova va aggiunta subito all'area riservata** (`PAGINE` e `ORDINE_PRIMA` in `area-riservata.html`, `data-testo`/`data-slot` nella pagina, voci in `data/*.json`), con foto, testi e video se la pagina ne ha.

### 3.32 — 23/11/2026
- Area riservata solo HTTPS: «Enforce HTTPS» è attivo su GitHub Pages (certificato approvato per nemesiweb.it e www.nemesiweb.it), tolte le origini `http://` da `ORIGINS` in `worker/wrangler.toml`.
- Il Worker rifiuta le richieste arrivate in http («Usa l'indirizzo sicuro (https)», 403) e quelle dal browser con un'origine non ammessa (403); da `ORIGINS` prende solo gli indirizzi `https://`. Ripubblicato e provato: http 403, https da nemesiweb.it e www ammesso, origine http o estranea 403.

### 3.33 — 23/11/2026
- Per farsi trovare da Google: `robots.txt` (tutto aperto tranne `area-riservata.html`, indica la sitemap) e `sitemap.xml` (home e portfolio su https://nemesiweb.it/).
- In `index.html` e `portfolio.html`: link `canonical` all'indirizzo su nemesiweb.it, meta Open Graph (titolo, descrizione, indirizzo, lingua) e `twitter:card`. Descrizione della home aggiornata con Olimp.
- Da fare: verifica del sito in Google Search Console (tag HTML), invio della sitemap, immagine per le anteprime (`og:image`).

### 3.34 — 23/11/2026
- Google: sito verificato in Search Console come proprietà di dominio, con il record TXT sul DNS di Aruba (nessun tag nell'`<head>`); `sitemap.xml` inviata.
- Immagine per le anteprime dei link (WhatsApp, social): `images/anteprima.jpg`, 1200 × 630. Fondo scuro, logo con il motto, «Siti, app e giochi per il web.», nemesiweb.it · Bologna, a destra la lastra nera con il bordo verde acceso che mostra Rain Ink. Sorgente in `archivio/og/og.html` (fuori da git), fotografata a 1200 × 630 con Chrome.
- In `index.html` e `portfolio.html`: `og:image` (con misure e testo alternativo), `twitter:card` ora `summary_large_image`, `twitter:image`.

### 3.35 — 23/11/2026
- Barra: Portfolio non apre più il sottomenu (Siti, App, Giochi) né ha la freccia; è un link semplice che porta a `portfolio.html`, sul computer e sul telefono. Tolti markup e CSS del sottomenu in `index.html` e `portfolio.html`.
- Area riservata: tolta la scheda **Menu** (e la sua parte della guida), perché il sottomenu non c'è più; tolti da `data/testi.json` i testi `menu-t001`…`menu-t003`.

### 3.36 — 23/11/2026
- Area riservata, scheda **Portfolio**: in Siti, App e Giochi i lavori stanno su due colonne come nella pagina, e in fondo a ogni capitolo c'è il riquadro **+** («Aggiungi un sito», «Aggiungi un'app», «Aggiungi un gioco»). Un lavoro nuovo ha foto (16:9, 1600 × 900), nome, descrizione e indirizzo (facoltativo; «www.sito.it» diventa «https://www.sito.it»). I lavori aggiunti si spostano, modificano ed eliminano come le foto delle gallerie di Olimp; i sei lavori della Home restano fissi in cima.
- `portfolio.html`: i lavori aggiunti compaiono sotto quelli del loro capitolo, sempre su due colonne (una sul telefono), con lo stesso aspetto della lastra; senza indirizzo la foto non è cliccabile. Si vedono solo qui, non nella Home.
- Numeri rifatti di fila in `portfolio.html` (un sito in più: Word diventa 04 e così via; nella Home i numeri restano 01–06). Le scorciatoie in cima mostrano i numeri di ogni capitolo (fino a tre tutti, «01 · 02 · 03», di più «01 … 05»).
- Dati in `data/gallerie.json` (`portfolio-siti`, `portfolio-app`, `portfolio-giochi`: `{foto, titolo, descrizione?, link?}`); `scripts/genera_contenuti.py` li scrive fra i segni `<!-- portfolio-…:inizio -->` e `:fine -->` e rinumera. Il Worker accetta e controlla `descrizione` e `link` (va ripubblicato con `npx wrangler deploy`).

### 3.37 — 23/11/2026
- Area riservata, scheda **Portfolio**: anche i sei lavori della Home si spostano, si modificano e si tolgono, come quelli aggiunti («Sposta o modifica»). «Modifica o elimina» apre la finestra della foto della Home (foto, nome, descrizione: cambiano anche nella Home) con in più **Togli dal Portfolio**: il lavoro sparisce solo da `portfolio.html` e resta nella Home. Un lavoro della Home tolto si rimette con il riquadro **Rimetti «…» (dalla Home)** in fondo al suo capitolo.
- Dati: in `data/gallerie.json` i lavori della Home sono `{"rif": "lavoro-rainink"}` nell'ordine scelto; `scripts/genera_contenuti.py` copia il loro `<li>` da `index.html`, quindi in `portfolio.html` tutti i lavori stanno fra i segni `<!-- portfolio-…:inizio/fine -->`. Il Worker accetta i `rif` (ripubblicato).

## Area riservata

Copiata da quella di Olimp con la skill `area-ris` (stesso impianto, aspetto e funzioni); cambiano nome, logo, caratteri del sito (Inter Tight, Geist), barra in alto nera come quella del sito e colore d'accento: il verde scuro del logo `#8ECE05` (più scuro `#79B003`), con il testo scuro `#0B1200` sopra (il bianco non avrebbe contrasto). Prefisso di localStorage `nemesiweb-`.

- **Accesso**: `area-riservata.html` (lucchetto in fondo alla barra, `noindex`), password controllata dal Worker, sessione di 30 giorni, «Esci», «Cambia password» (impronta PBKDF2 nel KV `DATI`), dopo 5 errori tutto bloccato per 15 minuti. Guida che si apre da sola al primo accesso, con le schede Foto | Testi (fino alla 3.34 anche Menu) e 6 schermate in `images/guida/` (i `data-punti` vengono da `riquadri.py` della skill). Riquadro «Spazio per le foto» su 1 GB.
- **Schede**: `Home` (la pagina del sito), `Portfolio` (dalla 3.31: le stesse foto e testi dei lavori più i 7 testi `portfolio-t001`…`t007` in cima alla pagina) (la scheda `Menu` per il sottomenu Portfolio è stata tolta nella 3.35). In Home: **Foto** = le 6 foto dei lavori (`data/immagini.json`, `data-slot` sulle `<img>`: `lavoro-rainink`, `lavoro-olimp`, `lavoro-word`, `lavoro-excel`, `lavoro-metalgear`, `lavoro-radente`), tutte 16:9 a 1600 × 900, con nome e descrizione del lavoro nella stessa finestra; anteprima identica al sito (computer e telefono) con la foto da trascinare e ingrandire. **Testi** = 40 testi (`data/testi.json`, `data-testo` `index-t001`…`index-t040`): angoli dell'apertura, occhielli e titoli dei capitoli (ogni titolo è due testi: la parte scura e la parte verde), nome e descrizione dei lavori, testi del riquadro della mappa, frase finale e pulsante Scrivimi (il clic non si cambia).
- **Non si cambiano da qui**: le lastre dei Tool (`js/strumenti-icone.js`), le voci principali della barra, l'email, i numeri dei lavori, «Visita il sito ↗» e simili, il piè di pagina, il logo, i testi per Google.
- **Attenzione**: i testi e le foto con `data-testo` / `data-slot` si cambiano in `data/testi.json` e `data/immagini.json` (o dall'area), non a mano nell'HTML: `python3 scripts/genera_contenuti.py` li riscrive nella pagina (`--check` per controllare). Per un testo nuovo: `data-testo` nell'elemento e una voce nel JSON.
- **File**: `area-riservata.html` (in testa `<meta name="ar-api">`, con l'indirizzo del Worker; nello script `PAGINE`, `FORME`), `worker/area-riservata-worker.js` e `worker/wrangler.toml` (Worker `nemesiweb-area-riservata`, REPO `nemesiMark/nemesiWeb`, KV `DATI` id `0e74b3797bac4e6bbf0f678b438d95d0`), `scripts/genera_contenuti.py`, `data/*.json` (`gallerie.json`: dalla 3.36 i lavori aggiunti al Portfolio), `.github/workflows/pubblica.yml` (pubblica a ogni push su main), `js/vendor/sortable/`, `images/caricate/` (foto caricate dal titolare).
- **Attivazione** (fatta il 22/11/2026, versione 3.21; Worker https://nemesiweb-area-riservata.nemesi-mark.workers.dev):
  1. GitHub: token fine-grained solo per `nemesiWeb`, «Contents: Read and write».
  2. Cloudflare: dalla cartella `worker/` `npx wrangler kv namespace create DATI` (id in `wrangler.toml`), `npx wrangler deploy`.
  3. `npx wrangler secret put ADMIN_PASSWORD`, `SESSION_SECRET`, `GITHUB_TOKEN` (valori scritti nel terminale, mai nei file).
  4. GitHub → Settings → Pages → Source «GitHub Actions» e in `pubblica.yml` rimettere `push: branches: [main]`.
  5. Indirizzo del Worker in `<meta name="ar-api">`, poi push.

### 3.38 — 23/11/2026
- Area riservata, schermata di accesso: sfondo nero con la pioggia di codice alla Matrix attorno al riquadro (katakana a mezza larghezza specchiati, cifre e simboli; testa quasi bianca e scia verde che si spegne, alcuni segni cambiano mentre scendono). Disegnata su canvas, circa 30 passi al secondo, ferma quando la scheda è nascosta o dopo l'accesso; con «movimento ridotto» resta un fotogramma fermo.

### 3.39 — 23/11/2026
- Olimp: nuova anteprima presa dal sito online dopo il cambio di stile (hero chiara con l'album «Elisa & Andrea» sul piedistallo), senza il banner dei cookie: `olimp-d.jpg` 2000×1125, `olimp.jpg` 1600×900 (Home e Portfolio) e `olimp-m.jpg` 900×1947 (telefono); aggiornata anche in `js/lavori-dati.js`.

### 3.40 — 23/11/2026
- Olimp: anteprima rifatta dal sito online dopo il nuovo cambio (Inter Tight in tutto il sito, titoli in grassetto): `olimp-d.jpg`, `olimp.jpg`, `olimp-m.jpg` e la copia in `js/lavori-dati.js`.

### 3.41 — 24/11/2026
- Apertura: al posto del logo 3D c'è un video di 9,2 s, il logo che gira sulla superficie liquida, sprofonda nel vortice con le scie verdi e sfuma nel grigio della pagina (`video/apertura.mp4` 1280×720, 2,6 MB; sul telefono `video/apertura-m.mp4` 960×540, 1,9 MB; senza audio). Ricavati da `Logo_spinning_on_liquid_surface_fc0a59fb_1080p.mp4` (10 s), che resta fuori dal repo con le prove precedenti: il video finiva su un grigio neutro `#7F7F7F` fermo da 8,67 s; in codifica la sfumatura finale è stata portata al grigio del sito (esce esatto `#9AA0A8`) e il grigio fermo è stato accorciato a mezzo secondo.
- Uscita (`js/apertura.js`): quando manca un secondo alla fine le aste cominciano a cadere dietro il video, così appena il video finisce sparisce in 0,45 s e sotto c'è già la pagina dello stesso grigio con le aste in arrivo; poi scende la barra. Toccare, scorrere o premere un tasto anticipa l'uscita; se il video è bloccato o non parte entro 3 s il nero sfuma direttamente.
- Il video si scarica dall'`<head>` solo quando c'è l'apertura (non con `?jump`, con un indirizzo `#capitolo` o con «riduci movimento»).
- `js/logo3d.js` e `js/logo-forma.js` restano nel repo ma la home non li carica più.

### 3.42 — 24/11/2026
- Apertura: il video gira solo alla prima visita (nella stessa scheda del browser) e quando si ricarica la pagina. Tornando alla home da un'altra pagina del sito (per esempio dal Portfolio) la pagina parte subito, senza video; il video in quel caso non si scarica nemmeno. Si ricorda con `sessionStorage` (`nemesiVisto`) e il tipo di navigazione (`reload`).

### 3.43 — 24/11/2026
- Apertura: nuovo video del logo Nemesi sul fluido (10 s, con un secondo di colore pieno alla fine già nel file), ricavato da `Nemesi_logo_spinning_on_fluid_045bc653_1080p.mp4` (fuori dal repo): `video/apertura.mp4` 1280×720, 4,5 MB; `video/apertura-m.mp4` 960×540, 2,9 MB; senza audio.
