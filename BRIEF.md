# BRIEF — Nemesi Web 2.0 «Dritto e rovescio»

Appunti di produzione (NON testo per il sito). Rifatto da zero il 21/11/2026 con la skill sito-film, Corsia A (solo codice).

## Concept scelto: «Dritto e rovescio»
Una nemesi è il tuo opposto, e i lavori sono già coppie di opposti:
- Siti: Rain Ink (inchiostro sulla **pelle**) e Olimp (fotografia su **carta**)
- App: Parola (**lettere**) e Foglio (**numeri**)
- Giochi: Metal Gear (il **piano**, 2D) e Radente (la **profondità**, 3D)

Un solo oggetto per tutto il film: **la lastra**. È sottile e nera, laccata, con il bordo arancio acceso come le facce laterali del marchio. Ha due strati incollati.
1. **Apertura** (dalla 2.1): nel nero ci sono le aste, cioè la lastra in vista esplosa.
   - Sono 12 file di pezzi una sopra l'altra, che girano e rollano di continuo.
   - Scorrendo, una fila alla volta si ferma e scende al suo posto: si compone la lastra distesa.
   - Una riga di luce la attraversa e la salda.
   - Il logo resta solo nella barra: Mark non vuole il logo grande al centro.
2. La lastra si alza verso la camera e lo schermo si apre dal basso verso l'alto: Rain Ink (01). A Mark piace molto questo passaggio: va tenuto così.
3. La lastra gira su se stessa e sul rovescio c'è Olimp (02).
4. **App**: un altro mezzo giro, poi la lastra si sdoppia nello spessore: i due strati si separano come pagine, Parola (03) davanti e Foglio (04) sulla faccia interna.
5. **Giochi**: gli strati si richiudono e mezzo giro porta Metal Gear (05) sulla faccia. La camera la attraversa: la faccia si sbriciola in pixel. Di là c'è la profondità, con anelli di luce (i cerchi di Radente) fino allo schermo di Radente (06).
6. **Scrivimi**: la lastra torna da dietro la camera, la supera, gira un'ultima volta e mostra una faccia vuota. Lì sopra c'è la frase finale con il pulsante: la metà che manca è il progetto del visitatore.

**Vettore unico**: la camera va solo avanti. La lastra fa i suoi movimenti fisici: alzarsi, girare, sdoppiarsi, farsi attraversare, tornare.

**Sparring** (sub-agent fresco). Ha bocciato i miei tre concept:
- «Il Nastro»: un cavo decorativo tra tre fermate identiche;
- «Le Pieghe»: tre trucchi diversi travestiti da un oggetto;
- «Sala di proiezione»: generica.

Ha proposto il jolly, adottato. Del Nastro tengo la camera che va sempre avanti e i lavori fermi e frontali. Rischio segnalato: la lastra non deve sembrare una carta da gioco. Per questo ha:
- spessore vero con il bordo acceso;
- lacca con riflessi che si muovono;
- vetro sulla faccia;
- movimenti con inerzia.

## Logo
- Mai toccare i PNG: `images/logo/nemesi-web-arancio.png` (con il motto) nell'apertura della pagina statica, `images/logo/nemesi-web-nav.png` nella barra.
- Nella 2.0 il logo grande dell'apertura volava nella barra (regola `nav_px = 0,21833 × arancio_px + (0,52 ; −6,1)`). Dalla 2.1 il logo sta solo nella barra; quello grande rimane soltanto nella pagina statica.
- Il marchio non si rifà in 3D: la lastra ne riprende solo la materia, cioè faccia scura e bordo arancio.

## Colori (misurati sul PNG composto su nero)
- Fondo pagina grafite scuro `#17171C` (dalla 2.3; prima nero `#08080A`), grafite `#24242A` / `#2D2D33`
- Bianco «nemesi» `#F4F3F1`; fumo (testo secondario, preso dalla faccia del nastro `#767783` e schiarito) `#A4A4AE` (dalla 2.3; prima `#8E8E99`)
- Arancio «web»:
  - luce `#FFA54D`
  - centro `#F56F27`
  - ombra `#EA4006`
  - brace `#C92C02`
  - oro dei riflessi `#F9D377`
- Regola dei titoli, come il logo («nemesi» bianco + «web» arancio): prima parte bianca, parte in corsivo arancio chiaro.

## Caratteri (copie locali in `fonts/`, nessuna richiesta a Google)
- Titoli: **Inter Tight** 800, lo stesso carattere della scritta RAIN INK (dalla 2.4; prima Bodoni Moda). Seconda riga in arancio, dritta.
- Testo e interfaccia: **Geist**. Etichette e numeri: **Geist Mono** (maiuscolo spaziato).

## Movimento
- Lenis (lerp .07) + ScrollTrigger con scrub 1 su un'unica timeline madre in unità «vh»; la scena 3D legge la stessa timeline.
- Rotazioni power3.inOut con un filo di assestamento; parole dei titoli che salgono da maschere; didascalie che entrano dal basso.
- La lastra non si ferma mai del tutto: deriva lentissima e riflessi che respirano.

## Testi (copy)
- Apertura: logo (H1; nel film è nascosto alla vista e resta per i lettori di schermo), angoli «Design e sviluppo» · «Portfolio 2026».
- Siti, coppia «Pelle e carta»: «Siti chiari, intuitivi, *costruiti per durare.*» (approvato da Mark nella 1.18)
- App, coppia «Lettere e numeri»: «Scrivere e calcolare, *dal browser al Mac.*»
- Giochi, coppia «Piano e profondità»: «Mondi interi, *dentro una pagina web.*»
- Finale: «Manca solo *il tuo progetto.*» + pulsante Scrivimi + email.
- Vietato: descrivere lo scorrimento o il meccanismo; «non X, ma Y»; elenchi di negazioni; lineette nei testi brevi; promesse non dimostrabili.

## Divieti
- Nessuna sezione nuova: solo Siti, App, Giochi, Scrivimi.
- Niente copia del marchio in 3D, niente testo che spiega il film.
- Con «riduci movimento» o senza WebGL: pagina statica completa (logo, riga di luce in CSS, lavori con immagini, Scrivimi).
