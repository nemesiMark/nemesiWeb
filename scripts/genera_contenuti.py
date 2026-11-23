#!/usr/bin/env python3
"""Nemesi Web: scrive in index.html le foto dei lavori e i testi che si cambiano dall'area riservata
(copiato da Olimp, skill area-ris).

- data/gallerie.json: i lavori aggiunti dall'area riservata al Portfolio (dalla 3.36), uno per
  capitolo: portfolio-siti, portfolio-app, portfolio-giochi, ognuno un elenco di
  {foto, titolo, descrizione?, link?, provvisoria?} oppure {rif: "lavoro-rainink"} per un lavoro della Home
  (dalla 3.37: si sposta o si toglie dal Portfolio, foto e testi restano della Home). In portfolio.html vanno fra
  <!-- portfolio-siti:inizio --> e <!-- portfolio-siti:fine -->, poi
  i numeri dei lavori e delle scorciatoie in cima si rifanno di fila (01, 02, 03…).
- data/immagini.json: le immagini fisse; ogni <img data-slot="id"> prende foto e testo
  alternativo (e data-fallback se la voce ha «provvisoria»).
- data/testi.json: i testi delle pagine; ogni elemento con data-testo="id" prende il suo testo.
  tipo «testo»: si riscrive tutto il contenuto dell'elemento, con queste regole:
      a capo = <br>, **parole** = grassetto, ==parole== = evidenziato, `parole` = codice,
      [parole](indirizzo) = testo cliccabile (non dentro un elemento che è già un link).
  tipo «semplice»: si cambia solo il testo dell'elemento e restano com'erano le parti fisse
      (icone, frecce, numeri, campi del modulo); niente regole, una sola riga.
  Se la voce ha «link» l'elemento è un <a> e il suo href diventa quell'indirizzo.

Uso:  python3 scripts/genera_contenuti.py           (scrive i file)
      python3 scripts/genera_contenuti.py --check   (esce con errore se i file non sono aggiornati)
"""
import html, json, os, re, sys

RADICE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# galleria → (pagina, id del capitolo, scritta del link). Le stesse gallerie sono in area-riservata.html (PAGINE).
GALLERIE = {
    "portfolio-siti": ("portfolio.html", "siti", "Visita il sito"),
    "portfolio-app": ("portfolio.html", "app", "Apri l'app"),
    "portfolio-giochi": ("portfolio.html", "giochi", "Gioca"),
}
LINK_LAVORO = re.compile(r"^https?://[^\s<>\"']+$")

# pagine che ripetono una parte di un'altra (dalla 3.24 portfolio.html ripete i lavori di index.html):
# ricevono le stesse foto e gli stessi testi, quelli che non hanno si saltano senza avviso
COPIE = {"index.html": ["portfolio.html"]}


def att(t): return html.escape(t, quote=True)
def txt(t): return html.escape(t, quote=False)
def esiste(foto): return os.path.exists(os.path.join(RADICE, foto.split("?")[0]))


def lavoro_home(pagine, rif):
    """il <li class="lavoro"> della Home con la foto data-slot="rif" (righe senza il rientro)"""
    s = pagine.leggi("index.html")
    k = s.find(f'data-slot="{rif}"')
    if k < 0:
        return None
    a = s.rfind('<li class="lavoro">', 0, k)
    b = s.index("</li>", k) + len("</li>")
    a0 = s.rfind("\n", 0, a) + 1
    rientro = s[a0:a]
    return [r[len(rientro):] if r.startswith(rientro) else r.lstrip() for r in s[a0:b].split("\n")]


def righe_galleria(pagine, nome, voci, rientro):
    """lavori del capitolo nell'ordine scelto: {"rif": id} = un lavoro della Home (copiato da index.html,
    foto e testi restano quelli della Home), gli altri = lavori aggiunti (il numero lo mette rinumera)"""
    scritta = GALLERIE[nome][2]
    righe = []
    for n, v in enumerate(voci, 1):
        if v.get("rif"):
            li = lavoro_home(pagine, str(v["rif"]))
            if li is None:
                print(f"avviso: {nome} n. {n}, nella Home non c'è il lavoro {v['rif']}", file=sys.stderr)
            else:
                righe += [rientro + r for r in li]
            continue
        foto = str(v.get("foto") or "").strip().lstrip("/")
        titolo = str(v.get("titolo") or "").strip()
        desc = str(v.get("descrizione") or "").strip()
        link = str(v.get("link") or "").strip()
        prov = str(v.get("provvisoria") or "").strip().lstrip("/")
        if not foto or not titolo:
            print(f"avviso: {nome} n. {n} saltato (manca la foto o il nome)", file=sys.stderr)
            continue
        if not esiste(foto) and not (prov and esiste(prov)):
            print(f"avviso: {nome} n. {n} saltato, la foto {foto} non esiste", file=sys.stderr)
            continue
        if link and not LINK_LAVORO.match(link):
            print(f"avviso: {nome} n. {n}, indirizzo non valido: {link}", file=sys.stderr)
            link = ""
        fb = f' data-fallback="{att(prov)}"' if prov else ""
        img = f'<img src="{att(foto)}"{fb} alt="" width="1600" height="900" loading="lazy" decoding="async">'
        etichetta = titolo + (f", {desc[:1].lower() + desc[1:]}" if desc else "")
        if link:
            schermo = (f'<a class="schermo" href="{att(link)}" target="_blank" rel="noopener" '
                       f'aria-label="{att(etichetta)}: {att(scritta[:1].lower() + scritta[1:])}">{img}</a>')
            azione = f'<a class="azione" href="{att(link)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">{txt(scritta)} ↗</a>'
        else:
            schermo = f'<div class="schermo" role="img" aria-label="{att(etichetta)}">{img}</div>'
            azione = ""
        d = f'<span class="desc">{txt(desc)}</span>' if desc else ""
        righe += [f'{rientro}<li class="lavoro aggiunto">',
                  f'{rientro}  {schermo}',
                  f'{rientro}  <p class="didascalia"><span class="d-in"><span class="num">00</span><span class="nome">{txt(titolo)}</span>{d}{azione}</span></p>',
                  f'{rientro}</li>']
    return righe


def gallerie(pagine):
    with open(os.path.join(RADICE, "data", "gallerie.json"), encoding="utf-8") as f:
        dati = json.load(f)
    for nome, voci in dati.items():
        if nome not in GALLERIE:
            print(f"avviso: galleria sconosciuta {nome}", file=sys.stderr)
            continue
        pagina = GALLERIE[nome][0]
        s = pagine.leggi(pagina)
        inizio, fine = f"<!-- {nome}:inizio -->", f"<!-- {nome}:fine -->"
        if inizio not in s or fine not in s:
            print(f"avviso: in {pagina} mancano i segni della galleria {nome}", file=sys.stderr)
            continue
        a, b = s.index(inizio), s.index(fine)
        rientro = s[s.rfind("\n", 0, a) + 1:a]
        a += len(inizio)
        corpo = righe_galleria(pagine, nome, voci, rientro)
        nuovo = s[:a] + ("\n" + "\n".join(corpo) if corpo else "") + "\n" + rientro + s[b:]
        pagine.scrivi(pagina, nuovo)
    rinumera(pagine)


def rinumera(pagine):
    """portfolio.html: i lavori si numerano di fila (01, 02…) nell'ordine della pagina e le scorciatoie
    in cima dicono quali numeri ha ogni capitolo (01 · 02 · 03, oppure 01 … 05 se sono più di tre)"""
    nome = "portfolio.html"
    if not os.path.exists(os.path.join(RADICE, nome)):
        return
    s = pagine.leggi(nome)
    n, capitoli = 0, []
    for cap in [g[1] for g in GALLERIE.values() if g[0] == nome]:
        a = s.find(f'<section class="capitolo" id="{cap}"')
        if a < 0:
            continue
        b = s.index("</section>", a)
        pezzo, primo = s[a:b], n + 1

        def numero(m):
            nonlocal n
            n += 1
            return f'<span class="num">{n:02d}</span>'
        pezzo = re.sub(r'<span class="num">\d+</span>', numero, pezzo)
        s = s[:a] + pezzo + s[b:]
        capitoli.append((cap, primo, n))
    for cap, da, a_ in capitoli:
        # fino a tre lavori tutti i numeri (01 · 02 · 03), di più il primo e l'ultimo (01 … 05): niente lineette
        quale = " · ".join(f"{k:02d}" for k in range(da, a_ + 1)) if a_ - da < 3 else f"{da:02d} … {a_:02d}"
        s = re.sub(rf'(<a href="#{cap}"[^>]*><span>)[^<]*(</span>)', lambda m: m.group(1) + quale + m.group(2), s, count=1)
    pagine.scrivi(nome, s)


def immagini(pagine):
    with open(os.path.join(RADICE, "data", "immagini.json"), encoding="utf-8") as f:
        voci = json.load(f)
    for v in voci:
        foto = str(v.get("foto") or "").strip().lstrip("/")
        prov = str(v.get("provvisoria") or "").strip().lstrip("/")
        if not foto or (not esiste(foto) and not (prov and esiste(prov))):
            print(f"avviso: immagine {v.get('id')} saltata, la foto {foto} non esiste", file=sys.stderr)
            continue
        for nome in pagine.di(v["pagina"]):
            s = pagine.leggi(nome)
            segno = f'<img data-slot="{v["id"]}" '
            a = s.find(segno)
            if a < 0:
                if not pagine.copia(nome):
                    print(f"avviso: in {nome} manca l'immagine {v['id']}", file=sys.stderr)
                continue
            immagine(pagine, nome, s, a, foto, prov, v)


def immagine(pagine, nome, s, a, foto, prov, v):
    b = s.index(">", a)
    tag = s[a:b]
    tag = re.sub(r' src="[^"]*"', f' src="{att(foto)}"', tag, count=1)
    tag = re.sub(r' alt="[^"]*"', f' alt="{att(str(v.get("alt") or "").strip())}"', tag, count=1)
    if prov:
        if " data-fallback=" in tag:
            tag = re.sub(r' data-fallback="[^"]*"', f' data-fallback="{att(prov)}"', tag, count=1)
        else:
            tag = tag.replace(' alt="', f' data-fallback="{att(prov)}" alt="', 1)
    else:
        tag = re.sub(r' data-fallback="[^"]*"', "", tag, count=1)
    pagine.scrivi(nome, s[:a] + tag + s[b:])


MENU = "menu"  # voci di immagini.json e testi.json che stanno nei sottomenu della navbar di tutte le pagine
LINK_VALIDO = re.compile(r"^(https?://[^\s<>\"']+|mailto:[^\s<>\"']+|tel:\+?[0-9 ()./-]+|#[A-Za-z0-9_-]*|(?!.*\.\.)[A-Za-z0-9][A-Za-z0-9._/-]*(#[A-Za-z0-9_-]*)?)$")
MARCHE = re.compile(r"\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*(.+?)\*\*|==(.+?)==|`(.+?)`", re.S)


def link_ok(u): return bool(LINK_VALIDO.match(u or ""))


def attributi_link(u):
    if u.startswith(("mailto:", "tel:", "#")):
        return ""
    return ' target="_blank" rel="noopener noreferrer"' if u.startswith("http") else ' target="_blank"'


def html_testo(t, link_ammessi=True):
    """testo con le regole (**grassetto**, [testo](link), a capo…) → HTML sicuro"""
    out, i = [], 0
    for m in MARCHE.finditer(t):
        out.append(txt(t[i:m.start()]).replace("\n", "<br>"))
        testo_link, url, gr, ev, cod = m.groups()
        if testo_link is not None:
            dentro = html_testo(testo_link, False)
            out.append(f'<a href="{att(url)}"{attributi_link(url)}>{dentro}</a>' if link_ammessi and link_ok(url) else txt(m.group(0)))
        elif gr is not None:
            out.append(f"<strong>{html_testo(gr, link_ammessi)}</strong>")
        elif ev is not None:
            out.append(f"<mark>{html_testo(ev, link_ammessi)}</mark>")
        else:
            out.append(f"<code>{txt(cod)}</code>")
        i = m.end()
    out.append(txt(t[i:]).replace("\n", "<br>"))
    return "".join(out)


VUOTI = {"br", "img", "input", "meta", "link", "hr", "source", "wbr", "path", "circle", "rect"}
ETICHETTA = re.compile(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(/?)>|<!--.*?-->", re.S)


def elemento(s, vid):
    """posizioni di <tag data-testo="vid" …>contenuto</tag>: (inizio, inizio contenuto, fine contenuto, nome)"""
    k = s.find(f' data-testo="{vid}"')
    if k < 0:
        return None
    a = s.rfind("<", 0, k)
    nome = re.match(r"<([a-zA-Z0-9]+)", s[a:]).group(1).lower()
    c = s.index(">", k) + 1
    prof = 1
    for m in ETICHETTA.finditer(s, c):
        if m.group(2) is None or m.group(2).lower() != nome or m.group(2).lower() in VUOTI or m.group(3):
            continue
        prof += -1 if m.group(1) else 1
        if prof == 0:
            return a, c, m.start(), nome
    return None


def solo_testo_diretto(contenuto, nuovo):
    """sostituisce l'unico pezzo di testo diretto (non dentro altri elementi) tenendo gli spazi attorno"""
    pezzi, prof, i = [], 0, 0
    for m in ETICHETTA.finditer(contenuto):
        if prof == 0 and contenuto[i:m.start()].strip():
            pezzi.append((i, m.start()))
        if m.group(2) and m.group(2).lower() not in VUOTI and not m.group(3):
            prof += -1 if m.group(1) else 1
        i = m.end()
    if prof == 0 and contenuto[i:].strip():
        pezzi.append((i, len(contenuto)))
    if len(pezzi) != 1:
        return None
    a, b = pezzi[0]
    vecchio = contenuto[a:b]
    prima = vecchio[:len(vecchio) - len(vecchio.lstrip())]
    dopo = vecchio[len(vecchio.rstrip()):]
    return contenuto[:a] + prima + txt(nuovo) + dopo + contenuto[b:]


def testi(pagine):
    with open(os.path.join(RADICE, "data", "testi.json"), encoding="utf-8") as f:
        voci = json.load(f)
    for v in voci:
        nome, vid = v["pagina"], v["id"]
        t = str(v.get("testo") or "").replace("\r\n", "\n").strip()
        if not t:
            print(f"avviso: testo {vid} vuoto, lasciato com'era", file=sys.stderr)
            continue
        for nome in pagine.di(v["pagina"]):
            testo(pagine, nome, v, vid, t)


def testo(pagine, nome, v, vid, t):
    s = pagine.leggi(nome)
    pos = elemento(s, vid)
    if not pos:
        if not pagine.copia(nome):
            print(f"avviso: in {nome} manca il testo {vid}", file=sys.stderr)
        return
    a, c, e, tag = pos
    if v.get("tipo") == "semplice":
        nuovo = solo_testo_diretto(s[c:e], " ".join(t.split()))
        if nuovo is None:
            print(f"avviso: testo {vid} non sostituibile", file=sys.stderr)
            return
    else:
        nuovo = html_testo(t, tag != "a")
    apertura = s[a:c]
    if "link" in v:
        u = str(v.get("link") or "").strip()
        if link_ok(u):
            apertura = re.sub(r' href="[^"]*"', f' href="{att(u)}"', apertura, count=1)
        else:
            print(f"avviso: link non valido per {vid}: {u}", file=sys.stderr)
    pagine.scrivi(nome, s[:a] + apertura + nuovo + s[e:])


class Pagine:
    def __init__(self):
        self.testi, self.originali = {}, {}

    def di(self, pagina):
        """le pagine a cui va una voce: "menu" (sottomenu della navbar) vale per tutte"""
        if pagina != MENU:
            return [pagina] + [c for c in COPIE.get(pagina, []) if os.path.exists(os.path.join(RADICE, c))]
        return [f for f in sorted(os.listdir(RADICE)) if f.endswith(".html") and f != "area-riservata.html"
                and not f.startswith(("_", "prova-", "zz-"))]

    def copia(self, nome):
        return any(nome in c for c in COPIE.values())

    def leggi(self, nome):
        if nome not in self.testi:
            with open(os.path.join(RADICE, nome), encoding="utf-8") as f:
                self.testi[nome] = self.originali[nome] = f.read()
        return self.testi[nome]

    def scrivi(self, nome, testo):
        self.testi[nome] = testo

    def salva(self, controlla):
        ok = True
        for nome, testo in self.testi.items():
            if testo == self.originali[nome]:
                continue
            if controlla:
                print(f"{nome} non è aggiornato: esegui python3 scripts/genera_contenuti.py", file=sys.stderr)
                ok = False
                continue
            with open(os.path.join(RADICE, nome), "w", encoding="utf-8") as f:
                f.write(testo)
            print(f"{nome} aggiornato")
        return ok


if __name__ == "__main__":
    pagine = Pagine()
    gallerie(pagine)
    immagini(pagine)
    testi(pagine)
    sys.exit(0 if pagine.salva("--check" in sys.argv) else 1)
