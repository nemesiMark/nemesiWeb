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
