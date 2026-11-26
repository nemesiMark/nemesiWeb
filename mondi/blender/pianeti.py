# Mondi (pagina di prova) — texture dei pianeti e del cielo, cotte in Blender (Cycles) da materiali procedurali.
# Uso:
#   /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python pianeti.py -- \
#       quali=nemesi,gigante,ossidiana,lava,bio,nuvole,cielo,anelli res=2048 out=../tex/png
# Ogni pianeta esce in PNG (poi convertiti in JPG da prepara.sh):
#   <nome>-colore.png (sRGB), <nome>-normale.png (normale in spazio oggetto Blender), <nome>-luce.png (emissione, grigio)
import bpy, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import *  # noqa

A = argomenti()
QUALI = A.get('quali', 'nemesi').split(',')
RES = int(A.get('res', '2048'))
OUT = os.path.abspath(A.get('out', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tex', 'png')))
CAMPIONI = int(A.get('campioni', '4'))
os.makedirs(OUT, exist_ok=True)
W, H = RES, RES // 2

svuota()
cycles(CAMPIONI, gpu=A.get('gpu', '1') == '1')
SEG_W, SEG_H = (512, 256) if RES >= 2048 else (256, 128)


def nuovo(nome):
    ob = sfera_three(nome, SEG_W, SEG_H)
    mat = bpy.data.materials.new(nome)
    ob.data.materials.append(mat)
    return ob, Nodi(mat)


def deformata(N, p, scala, forza, dett=3.0):
    """p spostato da un rumore vettoriale: bordi e venature meno regolari."""
    r = N.rumore(p, scala, dett=dett, rug=0.5)
    return N.v('ADD', p, N.v('SCALE', N.v('SUBTRACT', r.outputs['Color'], (0.5, 0.5, 0.5)), scala=forza))


# ───────────────────────── Nemesi: il mondo centrale, roccia scura con venature di luce verde ─────────────────────────
def nemesi():
    ob, N = nuovo('nemesi')
    p = N.p
    q = deformata(N, p, 1.25, 0.55)
    q2 = deformata(N, q, 3.6, 0.14)
    hM = N.rumore(q, 1.7, dett=7, rug=0.56).outputs['Fac']
    # tre ordini di fratture (distanza dal bordo delle celle di Voronoi), ognuna accesa solo in certe zone
    v1 = N.voronoi(q, 2.3, 'DISTANCE_TO_EDGE').outputs['Distance']
    v2 = N.voronoi(q2, 6.2, 'DISTANCE_TO_EDGE').outputs['Distance']
    v3 = N.voronoi(deformata(N, q2, 9.0, 0.05), 15.0, 'DISTANCE_TO_EDGE').outputs['Distance']
    g1 = N.smooth(0.40, 0.60, N.rumore(p, 2.1, dett=3).outputs['Fac'])
    g2 = N.smooth(0.47, 0.66, N.rumore(N.v('ADD', p, (7.1, 3.3, 1.7)), 3.2, dett=3).outputs['Fac'])
    g3 = N.smooth(0.55, 0.70, N.rumore(N.v('ADD', p, (2.2, 9.4, 5.1)), 5.0, dett=3).outputs['Fac'])
    c1 = N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.020, v1))
    c2 = N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.034, v2))
    c3 = N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.050, v3))
    e1 = N.m('MULTIPLY', c1, g1)
    e2 = N.m('MULTIPLY', N.m('MULTIPLY', c2, g2), 0.78)
    e3 = N.m('MULTIPLY', N.m('MULTIPLY', c3, g3), 0.5)
    E = N.m('MAXIMUM', e1, N.m('MAXIMUM', e2, e3))
    vari = N.m('ADD', 0.45, N.m('MULTIPLY', 0.55, N.rumore(p, 18.0, dett=2).outputs['Fac']))
    E = N.m('MULTIPLY', E, vari, clamp=True)
    # alone bruciato intorno alle fratture grandi
    alone = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.11, v1)), g1)
    alone2 = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.10, v2)), g2)
    alone = N.m('MAXIMUM', alone, N.m('MULTIPLY', alone2, 0.7))
    fine = N.rumore(p, 34.0, dett=3).outputs['Fac']
    tono = N.m('ADD', N.m('MULTIPLY', hM, 0.8), N.m('MULTIPLY', fine, 0.2))
    col = N.rampa(tono, [(0.28, '#26282C'), (0.42, '#35383D'), (0.55, '#45494F'), (0.68, '#555A60'), (0.82, '#666B72')])
    macchie = N.smooth(0.45, 0.75, N.rumore(N.v('ADD', p, (1.0, 5.0, 2.0)), 5.0, dett=6, rug=0.6).outputs['Fac'])
    col = N.mix(N.m('MULTIPLY', macchie, 0.35), col, hex_lin('#2B2D31'))
    col = N.mix(N.m('MULTIPLY', alone, 0.70), col, hex_lin('#0E0F10'))
    col = N.mix(N.m('MULTIPLY', alone, 0.22), col, hex_lin('#33461A'))
    alt = N.m('ADD', N.m('MULTIPLY', hM, 0.55), N.m('MULTIPLY', N.rumore(p, 11.0, dett=5).outputs['Fac'], 0.20))
    alt = N.m('SUBTRACT', alt, N.m('MULTIPLY', N.m('MAXIMUM', c1, N.m('MULTIPLY', c2, 0.7)), 0.16))
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'nemesi-colore.png'), srgb=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(E))
    salva_png(px, os.path.join(OUT, 'nemesi-luce.png'), grigio=True)
    px = cuoci(ob, N, 'NORMAL', W, H, N.rilievo(alt, forza=0.55, distanza=0.06))
    salva_png(px, os.path.join(OUT, 'nemesi-normale.png'))


# ───────────────────────── Portfolio: gigante gassoso a fasce, color sabbia (gli anelli a parte) ─────────────────────────
def gigante():
    ob, N = nuovo('gigante')
    p = N.p
    x, y, z = N.xyz(p)
    t1 = N.rumore(p, 2.0, dett=6, rug=0.55, dist=0.5).outputs['Fac']
    t2 = N.rumore(N.v('MULTIPLY', p, (3.0, 3.0, 9.0)), 1.6, dett=7, rug=0.6, dist=1.2).outputs['Fac']
    st = N.rumore(N.v('MULTIPLY', p, (2.6, 2.6, 19.0)), 1.0, dett=6, rug=0.6).outputs['Fac']
    c = N.m('ADD', z, N.m('MULTIPLY', N.m('SUBTRACT', t1, 0.5), 0.10))
    c = N.m('ADD', c, N.m('MULTIPLY', N.m('SUBTRACT', t2, 0.5), 0.06))
    c = N.m('ADD', c, N.m('MULTIPLY', N.m('SUBTRACT', st, 0.5), 0.05))
    fac = N.mappa(c, -1.0, 1.0)
    col = N.rampa(fac, [
        (0.00, '#4A5257'), (0.07, '#646967'), (0.13, '#8E8371'), (0.19, '#C9BEA5'), (0.24, '#9A8669'),
        (0.29, '#E4DAC3'), (0.35, '#A88E6B'), (0.40, '#7E6A55'), (0.44, '#D8CBAF'), (0.49, '#F0E8D5'),
        (0.53, '#C2AA88'), (0.57, '#866F57'), (0.61, '#B49C7C'), (0.66, '#DCD1B9'), (0.72, '#A8977B'),
        (0.79, '#CEC4AE'), (0.86, '#8B877D'), (0.93, '#6C7170'), (1.00, '#4C5559')])
    fine = N.rumore(N.v('MULTIPLY', p, (6.0, 6.0, 72.0)), 1.0, dett=3).outputs['Fac']
    g = N.m('ADD', 0.88, N.m('MULTIPLY', fine, 0.24))
    col = N.mix(1.0, col, N.vettore(g, g, g), 'MULTIPLY')
    # la grande tempesta ovale
    lat, lon = math.radians(-21), math.radians(35)
    s = (math.cos(lat) * math.cos(lon), math.cos(lat) * math.sin(lon), math.sin(lat))
    d = N.v('LENGTH', N.v('MULTIPLY', N.v('SUBTRACT', deformata(N, p, 9.0, 0.025), s), (1.0, 1.0, 2.1)))
    occhio = N.m('SUBTRACT', 1.0, N.smooth(0.07, 0.15, d))
    bordo = N.m('MULTIPLY', N.smooth(0.12, 0.155, d), N.m('SUBTRACT', 1.0, N.smooth(0.155, 0.2, d)))
    col = N.mix(N.m('MULTIPLY', occhio, 0.85), col, hex_lin('#B4835C'))
    col = N.mix(N.m('MULTIPLY', bordo, 0.5), col, hex_lin('#EFE6D2'))
    for i in range(9):
        lat, lon = math.radians(38 + (i % 2) * 1.2), math.radians(-150 + i * 34)
        s2 = (math.cos(lat) * math.cos(lon), math.cos(lat) * math.sin(lon), math.sin(lat))
        d2 = N.v('LENGTH', N.v('MULTIPLY', N.v('SUBTRACT', p, s2), (1.0, 1.0, 1.7)))
        col = N.mix(N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.012, 0.03, d2)), 0.85), col, hex_lin('#F3EEE2'))
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'gigante-colore.png'), srgb=True)


# ───────────────────────── Tool fino alla 3.67: luna di roccia con crateri e piccole luci verdi (le officine); non si usa più ─────────────────────────
def luna():
    ob, N = nuovo('luna')
    p = N.p
    q = deformata(N, p, 3.0, 0.06)
    alt = N.m('MULTIPLY', N.rumore(p, 40.0, dett=4).outputs['Fac'], 0.03)
    mari = N.smooth(0.50, 0.60, N.rumore(p, 1.3, dett=5).outputs['Fac'])
    alt = N.m('SUBTRACT', alt, N.m('MULTIPLY', mari, 0.05))
    for scala, prob, prof in ((2.2, 0.55, 0.50), (5.0, 0.50, 0.30), (11.0, 0.45, 0.16), (24.0, 0.40, 0.07), (50.0, 0.35, 0.03)):
        vo = N.voronoi(q, scala, 'F1')
        d = vo.outputs['Distance']
        rr, gg, bb = N.xyz(vo.outputs['Color'])
        rc = N.m('ADD', 0.22, N.m('MULTIPLY', rr, 0.2))
        xx = N.m('DIVIDE', d, rc)
        dentro = N.m('LESS_THAN', xx, 1.0)
        conca = N.m('MULTIPLY', N.m('SUBTRACT', N.m('MULTIPLY', xx, xx), 1.0), dentro)
        t = N.m('MULTIPLY', N.m('SUBTRACT', xx, 1.0), 4.5)
        orlo = N.m('MULTIPLY', N.m('EXPONENT', N.m('MULTIPLY', -1.0, N.m('MULTIPLY', t, t))), 0.35)
        c = N.m('MULTIPLY', N.m('ADD', conca, orlo), N.m('GREATER_THAN', gg, 1.0 - prob))
        c = N.m('MULTIPLY', c, N.m('MULTIPLY', rc, prof * 2.2))
        alt = N.m('ADD', alt, c)
    tono = N.rumore(p, 7.0, dett=6).outputs['Fac']
    col = N.rampa(tono, [(0.30, '#67625B'), (0.50, '#7F7A72'), (0.70, '#99948B')])
    col = N.mix(N.m('MULTIPLY', mari, 0.85), col, hex_lin('#4A4743'))
    # officine: punti di luce sparsi, a gruppi
    vo = N.voronoi(p, 7.0, 'F1')
    _, _, b3 = N.xyz(vo.outputs['Color'])
    pt = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.05, vo.outputs['Distance'])), N.m('GREATER_THAN', b3, 0.70))
    vo2 = N.voronoi(p, 26.0, 'F1')
    _, _, b4 = N.xyz(vo2.outputs['Color'])
    pt2 = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.09, vo2.outputs['Distance'])), N.m('GREATER_THAN', b4, 0.9))
    gruppi = N.smooth(0.52, 0.62, N.rumore(N.v('ADD', p, (3.0, 1.0, 7.0)), 2.4, dett=2).outputs['Fac'])
    E = N.m('MAXIMUM', pt, N.m('MULTIPLY', pt2, gruppi))
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'luna-colore.png'), srgb=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(E))
    salva_png(px, os.path.join(OUT, 'luna-luce.png'), grigio=True)
    px = cuoci(ob, N, 'NORMAL', W, H, N.rilievo(alt, forza=0.7, distanza=0.05))
    salva_png(px, os.path.join(OUT, 'luna-normale.png'))


# ───────────────────────── Tool (dalla 3.68): ossidiana, vetro nero tagliato a faccette, giunti accesi di verde da dentro ─────────────────────────
# Escono ossidiana-colore (sRGB), ossidiana-luce (grigio: i giunti) e ossidiana-normale: la normale di ogni faccetta, già in spazio oggetto
# di Blender (si scrive direttamente, non si cuoce con il rilievo: le faccette devono restare piatte e i bordi netti).
def ossidiana():
    ob, N = nuovo('ossidiana')
    p = N.p
    pn = N.v('NORMALIZE', p)
    v1 = N.voronoi(p, 4.2, 'F1', casuale=1.0)
    e1 = N.voronoi(p, 4.2, 'DISTANCE_TO_EDGE', casuale=1.0).outputs['Distance']
    v2 = N.voronoi(p, 10.0, 'F1', casuale=1.0)
    e2 = N.voronoi(p, 10.0, 'DISTANCE_TO_EDGE', casuale=1.0).outputs['Distance']
    zona2 = N.smooth(0.48, 0.56, N.rumore(N.v('ADD', p, (5.0, 3.0, 1.0)), 1.4, dett=2).outputs['Fac'])
    # faccette: la normale della sfera inclinata a caso, una volta per cella (le piccole solo in certe zone)
    c1 = N.v('SUBTRACT', v1.outputs['Color'], (0.5, 0.5, 0.5))
    c2 = N.v('SUBTRACT', v2.outputs['Color'], (0.5, 0.5, 0.5))
    n = N.v('ADD', pn, N.v('SCALE', c1, scala=0.62))
    n = N.v('ADD', n, N.v('SCALE', N.v('MULTIPLY', c2, N.vettore(zona2, zona2, zona2)), scala=0.4))
    n = N.v('NORMALIZE', n)
    normale = N.v('ADD', N.v('SCALE', n, scala=0.5), (0.5, 0.5, 0.5))
    # giunti sottili, accesi solo a tratti
    g1 = N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.009, e1))
    g2 = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.008, e2)), N.m('MULTIPLY', zona2, 0.45))
    vari = N.m('POWER', N.smooth(0.3, 0.75, N.rumore(p, 2.6, dett=2).outputs['Fac']), 1.6)
    vari = N.m('ADD', 0.12, N.m('MULTIPLY', vari, 0.88))
    E = N.m('MULTIPLY', N.m('MAXIMUM', g1, g2), vari, clamp=True)
    # colore: nero, ogni faccetta appena diversa, un velo verde profondo in alcune
    r1, _, b1 = N.xyz(v1.outputs['Color'])
    col = N.rampa(r1, [(0.0, '#07080A'), (0.6, '#0D0F12'), (1.0, '#14171B')])
    col = N.mix(N.m('MULTIPLY', N.m('GREATER_THAN', b1, 0.72), 0.7), col, hex_lin('#0C1A12'))
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'ossidiana-colore.png'), srgb=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(E))
    salva_png(px, os.path.join(OUT, 'ossidiana-luce.png'), grigio=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(normale))
    salva_png(px, os.path.join(OUT, 'ossidiana-normale.png'))


# ───────────────────────── Contatti: gigante di ghiaccio, fasce tenui color acqua ─────────────────────────
def ghiaccio():
    ob, N = nuovo('ghiaccio')
    p = N.p
    x, y, z = N.xyz(p)
    t1 = N.rumore(p, 1.8, dett=3).outputs['Fac']
    st = N.rumore(N.v('MULTIPLY', p, (2.0, 2.0, 15.0)), 1.0, dett=5, rug=0.55).outputs['Fac']
    c = N.m('ADD', z, N.m('MULTIPLY', N.m('SUBTRACT', t1, 0.5), 0.06))
    c = N.m('ADD', c, N.m('MULTIPLY', N.m('SUBTRACT', st, 0.5), 0.035))
    fac = N.mappa(c, -1.0, 1.0)
    col = N.rampa(fac, [
        (0.00, '#2B5566'), (0.12, '#3B7386'), (0.25, '#5A9DAE'), (0.38, '#76B6C2'), (0.47, '#8AC8D0'),
        (0.53, '#99D1D7'), (0.62, '#7CBDC8'), (0.75, '#5B9BAD'), (0.88, '#3C778B'), (1.00, '#2A5366')])
    fine = N.rumore(N.v('MULTIPLY', p, (5.0, 5.0, 55.0)), 1.0, dett=3).outputs['Fac']
    g = N.m('ADD', 0.94, N.m('MULTIPLY', fine, 0.12))
    col = N.mix(1.0, col, N.vettore(g, g, g), 'MULTIPLY')
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'ghiaccio-colore.png'), srgb=True)


# ───────────────────────── vulcani del pianeta di lava (dalla 3.69) ─────────────────────────
# Sei vulcani: cono con i solchi sui fianchi, cratere con il lago di lava, colate che scendono dall'orlo, si allargano a ventaglio
# in fondo e qualche volta si dividono. u, v: punto sulla texture (v dall'alto, come nell'immagine); R raggio del cono e Rc del
# cratere (radianti sulla sfera); H altezza nel rilievo. Colate: (direzione in gradi intorno al cratere, lunghezza, larghezza)
# oppure, per un ramo, anche (indice della colata madre, distanza dal cratere dove si stacca, quanto se ne allontana).
# In pagina (VULCANI in mondi.js, stampati alla fine) le bocche eruttano e la lava fresca corre giù per le colate: le colate di un
# vulcano non devono arrivare a metà strada da un altro (la pagina riconosce il vulcano dal più vicino; il controllo è qui sotto).
VULCANI = [
    dict(u=0.045, v=0.40, R=0.19, Rc=0.050, H=1.5, colate=[(200, 0.46, 0.050), (235, 0.40, 0.042), (168, 0.36, 0.036),
                                                           (200, 0.40, 0.032, (0, 0.18, 0.34)), (20, 0.22, 0.030)]),
    dict(u=0.205, v=0.63, R=0.15, Rc=0.040, H=1.1, colate=[(280, 0.36, 0.040), (248, 0.30, 0.032), (60, 0.20, 0.028)]),
    dict(u=0.365, v=0.76, R=0.155, Rc=0.042, H=1.2, colate=[(90, 0.38, 0.040), (128, 0.30, 0.034), (90, 0.32, 0.028, (0, 0.16, -0.36))]),
    dict(u=0.555, v=0.31, R=0.185, Rc=0.048, H=1.5, colate=[(300, 0.46, 0.050), (338, 0.40, 0.042), (265, 0.34, 0.036),
                                                           (300, 0.40, 0.032, (0, 0.2, 0.34)), (130, 0.24, 0.030)]),
    dict(u=0.715, v=0.60, R=0.15, Rc=0.040, H=1.1, colate=[(150, 0.36, 0.040), (198, 0.30, 0.034), (320, 0.20, 0.028)]),
    dict(u=0.875, v=0.36, R=0.18, Rc=0.046, H=1.4, colate=[(40, 0.44, 0.050), (80, 0.38, 0.042), (5, 0.34, 0.036),
                                                           (40, 0.38, 0.030, (0, 0.18, -0.32)), (220, 0.22, 0.030)]),
]


HMAX = max(V['H'] for V in VULCANI)   # la texture lava-alto va da 0 a HMAX


def punto_uv(u, v):
    """Punto della sfera (Blender) dal punto (u, v) della texture, v dall'alto: stesse UV di THREE.SphereGeometry."""
    ph, th = u * 2 * math.pi, v * math.pi
    x3, y3, z3 = -math.cos(ph) * math.sin(th), math.cos(th), math.sin(ph) * math.sin(th)
    return np.array([x3, -z3, y3])


def base_locale(c):
    """Centro, est e nord intorno a un punto della sfera (Blender, z in alto)."""
    c = c / np.linalg.norm(c)
    e1 = np.cross(np.array([0.0, 0.0, 1.0]), c); e1 /= np.linalg.norm(e1)
    e2 = np.cross(c, e1)
    return tuple(c), tuple(e1), tuple(e2)


def vulcani(N, p):
    """Prese dei sei vulcani: alt (rilievo in più), cono (dove spegnere crepe e laghi), cratere, colate (maschera), canale (il
    filo più caldo al centro delle colate), lontano (0 al cratere, 1 in fondo alle colate più lunghe: la lava si raffredda)."""
    tot = {}

    def unisci(k, x, op='MAXIMUM'):
        tot[k] = x if k not in tot else N.m(op, tot[k], x)

    centri = [punto_uv(V['u'], V['v']) for V in VULCANI]
    for i, V in enumerate(VULCANI):
        for j in range(i):
            d = math.acos(min(1.0, float(np.dot(centri[i], centri[j]))))
            lung = max(F[1] for F in VULCANI[i]['colate'] + VULCANI[j]['colate'])
            assert lung < d * 0.5, ('colate troppo lunghe fra i vulcani', i, j, round(d, 3))
    for i, V in enumerate(VULCANI):
        c, e1, e2 = base_locale(centri[i])
        R, Rc, H = V['R'], V['Rc'], V['H']
        dz = N.m('MAXIMUM', N.m('MINIMUM', N.v('DOT_PRODUCT', p, c), 1.0), -1.0)
        r = N.m('ARCCOSINE', dz)
        phi = N.m('ARCTAN2', N.v('DOT_PRODUCT', p, e2), N.v('DOT_PRODUCT', p, e1))
        # cono dai fianchi concavi, cratere a scodella con l'orlo appena rialzato, solchi radiali
        s = N.mappa(r, 0.0, R, 1.0, 0.0)
        h = N.m('MULTIPLY', N.m('POWER', s, 1.15), H)   # fianchi quasi dritti: un cono vero
        fondo = N.m('SUBTRACT', 1.0, N.smooth(Rc * 0.5, Rc, r))
        orlo = N.m('MULTIPLY', N.smooth(Rc * 0.55, Rc, r), N.m('SUBTRACT', 1.0, N.smooth(Rc, Rc * 1.8, r)))
        h = N.m('SUBTRACT', h, N.m('MULTIPLY', fondo, H * 0.55))
        h = N.m('ADD', h, N.m('MULTIPLY', orlo, H * 0.1))
        giro = N.vettore(N.m('MULTIPLY', N.m('COSINE', phi), 2.2), N.m('MULTIPLY', N.m('SINE', phi), 2.2), N.m('MULTIPLY', r, 2.0))
        sol = N.rumore(N.v('ADD', giro, (i * 3.1, i * 1.7, i * 2.3)), 4.5, dett=3).outputs['Fac']
        h = N.m('ADD', h, N.m('MULTIPLY', N.m('SUBTRACT', sol, 0.5), N.m('MULTIPLY', s, H * 0.4)))
        unisci('alt', h, 'ADD')
        unisci('cono', N.m('SUBTRACT', 1.0, N.smooth(R * 0.7, R * 1.25, r)))
        unisci('cratere', N.m('SUBTRACT', 1.0, N.smooth(Rc * 0.45, Rc * 0.8, r)))
        unisci('caldo', N.m('SUBTRACT', 1.0, N.smooth(Rc * 0.8, Rc * 2.6, r)))
        sotto = N.m('SUBTRACT', 1.0, N.smooth(R * 0.75, R * 1.05, r))
        unisci('solchi', N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.36, 0.5, sol)), sotto))   # solchi scuri
        unisci('creste', N.m('MULTIPLY', N.smooth(0.55, 0.68, sol), sotto))                       # creste di cenere chiara
        unisci('piede', N.m('MULTIPLY', N.smooth(R * 0.78, R * 0.98, r), N.m('SUBTRACT', 1.0, N.smooth(R * 0.98, R * 1.3, r))))
        # colate: distanza dalla linea di mezzo (in radianti sulla sfera), che serpeggia con un rumore lento; bordi irregolari
        bordo = N.m('ADD', N.m('SUBTRACT', N.rumore(N.v('ADD', p, (i * 5.3, 2.1, 0.7)), 13.0, dett=2).outputs['Fac'], 0.5),
                    N.m('MULTIPLY', N.m('SUBTRACT', N.rumore(N.v('ADD', p, (1.9, i * 4.4, 3.3)), 45.0, dett=2).outputs['Fac'], 0.5), 0.35))
        lmax = max(F[1] for F in V['colate'])
        crudi = []
        for k, F in enumerate(V['colate']):
            ang, L, w = F[:3]
            mea = N.m('SUBTRACT', N.rumore(N.v('ADD', p, (i * 7.7 + k * 2.3, k * 4.1, i * 1.3)), 4.0, dett=2).outputs['Fac'], 0.5)
            mea = N.m('MULTIPLY', mea, N.m('MULTIPLY', N.smooth(0.0, 0.25, r), 0.3))
            if len(F) > 3:
                madre, da, dev = F[3]
                d = N.m('ADD', crudi[madre], N.m('MULTIPLY', N.m('MAXIMUM', N.m('SUBTRACT', r, da), 0.0), dev))
                d = N.m('ADD', d, N.m('MULTIPLY', mea, 0.5))
                inizio = N.smooth(da - 0.01, da + 0.03, r)
            else:
                dphi = N.m('WRAP', N.m('SUBTRACT', phi, math.radians(ang)), math.pi, -math.pi)
                d = N.m('ADD', N.m('MULTIPLY', r, dphi), mea)
                inizio = N.smooth(Rc * 0.55, Rc * 0.9, r)
            crudi.append(d)
            larg = N.m('MULTIPLY', N.m('ADD', 0.35, N.m('MULTIPLY', N.smooth(Rc, max(R, L * 0.5), r), 0.65)),
                       N.m('ADD', 1.0, N.m('MULTIPLY', N.smooth(L * 0.55, L, r), 1.3)))
            larg = N.m('MULTIPLY', larg, w)
            ad = N.m('ABSOLUTE', N.m('ADD', d, N.m('MULTIPLY', bordo, w * 1.1)))
            m = N.m('SUBTRACT', 1.0, N.smooth(N.m('MULTIPLY', larg, 0.86), larg, ad))
            punta = N.m('SUBTRACT', 1.0, N.smooth(L - w * 1.2, L + w * 0.5, N.m('ADD', r, N.m('MULTIPLY', bordo, w * 2.5))))
            m = N.m('MULTIPLY', N.m('MULTIPLY', m, punta), inizio)
            can = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, N.m('MULTIPLY', larg, 0.38), N.m('ABSOLUTE', d))), m)
            unisci('colate', m)
            unisci('canale', can)
        unisci('lontano', N.m('MULTIPLY', N.mappa(r, Rc, lmax), N.m('SUBTRACT', 1.0, N.smooth(lmax * 1.1, lmax * 1.3, r))), 'ADD')
    return tot


def stampa_vulcani():
    """VULCANI per mondi.js: bocca nello spazio di Three (sfera di raggio 1), raggio del cratere, del cono, colata più lunga,
    altezza del cono rispetto al più alto."""
    righe = []
    for V in VULCANI:
        b = punto_uv(V['u'], V['v'])
        x3, y3, z3 = b[0], b[2], -b[1]
        righe.append('[%.4f, %.4f, %.4f, %.3f, %.3f, %.3f, %.3f]' % (x3, y3, z3, V['Rc'], V['R'], max(F[1] for F in V['colate']), V['H'] / HMAX))
    print('VULCANI = [' + ', '.join(righe) + '];')


# ───────────────────────── Area riservata: pianeta di lava (dalla 3.58), crosta di basalto a placche, fratture e laghi accesi ─────────────────────────
def lava():
    ob, N = nuovo('lava')
    p = N.p
    q = deformata(N, p, 1.5, 0.5)
    q2 = deformata(N, q, 4.6, 0.12)
    hM = N.rumore(q, 2.2, dett=7, rug=0.55).outputs['Fac']
    # placche di crosta: tre ordini di fratture (distanza dal bordo delle celle), le piccole solo in certe zone
    v1 = N.voronoi(q, 2.8, 'DISTANCE_TO_EDGE').outputs['Distance']
    v2 = N.voronoi(q2, 7.5, 'DISTANCE_TO_EDGE').outputs['Distance']
    v3 = N.voronoi(deformata(N, q2, 12.0, 0.04), 19.0, 'DISTANCE_TO_EDGE').outputs['Distance']
    z2 = N.smooth(0.42, 0.60, N.rumore(N.v('ADD', p, (4.1, 7.3, 2.9)), 2.6, dett=3).outputs['Fac'])
    z3 = N.smooth(0.50, 0.66, N.rumore(N.v('ADD', p, (8.2, 1.9, 6.4)), 4.2, dett=3).outputs['Fac'])
    c1 = N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.030, v1))
    c2 = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.040, v2)), N.m('MULTIPLY', z2, 0.8))
    c3 = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.050, v3)), N.m('MULTIPLY', z3, 0.5))
    crepe = N.m('MAXIMUM', c1, N.m('MAXIMUM', c2, c3))
    vari = N.m('ADD', 0.55, N.m('MULTIPLY', 0.45, N.rumore(p, 14.0, dett=2).outputs['Fac']))
    crepe = N.m('MULTIPLY', crepe, vari, clamp=True)
    # laghi di lava: dove il rumore grande supera la soglia; ai bordi croste che galleggiano, al centro tutto acceso
    nl = N.rumore(deformata(N, p, 1.8, 0.35), 1.25, dett=6, rug=0.55).outputs['Fac']
    lago = N.smooth(0.585, 0.63, nl)
    cuore = N.smooth(0.625, 0.68, nl)
    vs = N.voronoi(q2, 15.0, 'DISTANCE_TO_EDGE').outputs['Distance']
    zattere = N.smooth(0.03, 0.09, vs)
    lagoE = N.m('MAXIMUM', N.m('MULTIPLY', lago, N.m('SUBTRACT', 1.0, N.m('MULTIPLY', zattere, 0.5))), cuore)
    lagoE = N.m('MULTIPLY', lagoE, N.m('ADD', 0.6, N.m('MULTIPLY', 0.4, N.rumore(q2, 9.0, dett=3).outputs['Fac'])), clamp=True)
    # punti caldi sparsi con un piccolo alone
    vo = N.voronoi(p, 6.0, 'F1')
    _, _, b3 = N.xyz(vo.outputs['Color'])
    vulc = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.07, vo.outputs['Distance'])), N.m('GREATER_THAN', b3, 0.82))
    # vulcani (dalla 3.69): sui coni niente fratture né laghi, al loro posto crateri e colate; sulle colate la crosta raffreddata
    # è rotta da giunti accesi, il filo di mezzo è il più caldo e la lava si spegne man mano che si allontana dal cratere
    VU = vulcani(N, p)
    spegni = N.m('SUBTRACT', 1.0, N.m('MULTIPLY', VU['cono'], 0.92))
    crepe = N.m('MULTIPLY', crepe, spegni)
    lagoE = N.m('MULTIPLY', lagoE, spegni)
    lago = N.m('MULTIPLY', lago, spegni)
    vulc = N.m('MULTIPLY', vulc, spegni)
    giunti = N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.05, N.voronoi(deformata(N, p, 20.0, 0.03), 34.0, 'DISTANCE_TO_EDGE').outputs['Distance']))
    Ecol = N.m('MULTIPLY', VU['colate'], N.m('ADD', 0.38, N.m('MULTIPLY', N.m('MAXIMUM', VU['canale'], N.m('MULTIPLY', giunti, 0.6)), 0.62)))
    Ecol = N.m('MULTIPLY', Ecol, N.m('SUBTRACT', 1.0, N.m('MULTIPLY', VU['lontano'], 0.5)))
    Ecr = N.m('MAXIMUM', N.m('MULTIPLY', VU['cratere'], N.m('ADD', 0.8, N.m('MULTIPLY', giunti, 0.2))), N.m('MULTIPLY', VU['caldo'], 0.32))
    E = N.m('MAXIMUM', N.m('MAXIMUM', crepe, N.m('MAXIMUM', lagoE, vulc)), N.m('MAXIMUM', Ecol, Ecr))
    # colore: basalto quasi nero, cenere più chiara a chiazze, crosta bruciata vicino alle fratture, lava rosso scuro
    fine = N.rumore(p, 30.0, dett=3).outputs['Fac']
    tono = N.m('ADD', N.m('MULTIPLY', hM, 0.75), N.m('MULTIPLY', fine, 0.25))
    col = N.rampa(tono, [(0.30, '#120E0C'), (0.45, '#1D1714'), (0.58, '#29211C'), (0.72, '#352B24')])
    cenere = N.smooth(0.52, 0.72, N.rumore(N.v('ADD', p, (2.0, 6.0, 3.0)), 3.4, dett=6, rug=0.6).outputs['Fac'])
    col = N.mix(N.m('MULTIPLY', cenere, 0.45), col, hex_lin('#4A4440'))
    alone = N.m('MAXIMUM', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.10, v1)), N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.09, v2)), z2))
    alone = N.m('MULTIPLY', alone, spegni)
    col = N.mix(N.m('MULTIPLY', alone, 0.75), col, hex_lin('#2A110A'))
    col = N.mix(VU['cono'], col, hex_lin('#3A312B'))                                     # fianchi dei vulcani: basalto e cenere
    col = N.mix(N.m('MULTIPLY', VU['creste'], 0.85), col, hex_lin('#8A7866'))            # creste di cenere chiara
    col = N.mix(N.m('MULTIPLY', VU['solchi'], 0.9), col, hex_lin('#0C0908'))             # solchi quasi neri
    col = N.mix(N.m('MULTIPLY', N.smooth(0.55, 0.9, N.m('MULTIPLY', VU['alt'], 1.0 / HMAX)), 0.5), col, hex_lin('#9A8878'))   # cima più chiara
    col = N.mix(N.m('MULTIPLY', VU['piede'], 0.7), col, hex_lin('#0A0807'))              # piede in ombra
    col = N.mix(N.m('MULTIPLY', VU['caldo'], 0.8), col, hex_lin('#3A1408'))          # roccia bruciata intorno al cratere
    col = N.mix(VU['colate'], col, hex_lin('#160B07'))                               # colate: crosta scura
    col = N.mix(N.m('MAXIMUM', N.m('MAXIMUM', lago, crepe), N.m('MAXIMUM', VU['canale'], VU['cratere'])), col, hex_lin('#6A1E08'))
    # rilievo: placche in alto, fratture e laghi in basso
    alt = N.m('ADD', N.m('MULTIPLY', hM, 0.5), N.m('MULTIPLY', N.rumore(p, 16.0, dett=5).outputs['Fac'], 0.2))
    alt = N.m('SUBTRACT', alt, N.m('MULTIPLY', N.m('MULTIPLY', N.m('MAXIMUM', c1, N.m('MULTIPLY', c2, 0.8)), spegni), 0.2))
    alt = N.m('SUBTRACT', alt, N.m('MULTIPLY', lago, 0.18))
    alt = N.m('ADD', alt, VU['alt'])                                                   # coni e crateri
    alt = N.m('ADD', alt, N.m('MULTIPLY', N.m('SUBTRACT', VU['colate'], VU['canale']), 0.03))   # colate: argini rialzati, canale più basso
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'lava-colore.png'), srgb=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(E))
    salva_png(px, os.path.join(OUT, 'lava-luce.png'), grigio=True)
    px = cuoci(ob, N, 'NORMAL', W, H, N.rilievo(alt, forza=0.65, distanza=0.05))
    salva_png(px, os.path.join(OUT, 'lava-normale.png'))
    # rilievo vero dei coni (dalla 3.69): in pagina sposta la superficie, così i vulcani sporgono anche dal profilo del pianeta
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(N.m('MULTIPLY', VU['alt'], 1.0 / HMAX, clamp=True)))
    salva_png(px, os.path.join(OUT, 'lava-alto.png'), grigio=True)
    # maschera delle colate (dalla 3.69): in pagina ci corre la lava fresca quando il vulcano erutta
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(VU['colate']))
    salva_png(px, os.path.join(OUT, 'lava-colate.png'), grigio=True)
    stampa_vulcani()


# ───────────────────────── Bio (dalla 3.66): pianeta vivo e bioluminescente ─────────────────────────
# Scuro, blu notte e viola: oceani profondi e terre coperte da una foresta scura, appena accennate. Sulla parte in ombra
# si accendono una rete di venature (come radici o miceli), macchie di luce sparse e una luce leggera lungo le coste.
# Escono bio-colore (sRGB), bio-luce (grigio: venature e macchie), bio-normale e bio-fase: R = fase della pulsazione
# (rumore lento: in pagina la luce pulsa a onde che attraversano il pianeta), G = mare (riflesso del sole sull'acqua).
def bio():
    ob, N = nuovo('bio')
    p = N.p
    q = deformata(N, p, 1.4, 0.45)
    q2 = deformata(N, q, 4.2, 0.16)
    # terre e mari: poco meno di metà terra, coste frastagliate
    nl = N.rumore(deformata(N, p, 1.7, 0.4), 1.35, dett=7, rug=0.56).outputs['Fac']
    terra = N.smooth(0.495, 0.525, nl)
    mare = N.m('SUBTRACT', 1.0, terra)
    prof = N.mappa(nl, 0.30, 0.50)                      # profondità del mare: 0 al largo, 1 sotto costa
    costa = N.m('MULTIPLY', N.smooth(0.455, 0.495, nl), mare)
    # venature: bordi di celle su uno spazio molto deformato (curve morbide, come radici), due ordini, accese solo in certe zone
    v1 = N.voronoi(deformata(N, q2, 3.0, 0.22), 3.2, 'DISTANCE_TO_EDGE').outputs['Distance']
    v2 = N.voronoi(deformata(N, q2, 7.0, 0.10), 8.5, 'DISTANCE_TO_EDGE').outputs['Distance']
    z1 = N.smooth(0.38, 0.58, N.rumore(N.v('ADD', p, (3.1, 8.2, 5.7)), 1.9, dett=3).outputs['Fac'])
    z2 = N.smooth(0.46, 0.64, N.rumore(N.v('ADD', p, (9.4, 2.6, 7.3)), 3.4, dett=3).outputs['Fac'])
    vena1 = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.026, v1)), z1)
    vena2 = N.m('MULTIPLY', N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.038, v2)), z2), 0.7)
    vene = N.m('MULTIPLY', N.m('MAXIMUM', vena1, vena2), N.m('ADD', 0.25, N.m('MULTIPLY', terra, 0.75)))   # in mare restano deboli
    vene = N.m('MULTIPLY', vene, N.m('ADD', 0.55, N.m('MULTIPLY', 0.45, N.rumore(p, 16.0, dett=2).outputs['Fac'])), clamp=True)
    vene = N.m('MULTIPLY', vene, 0.78)
    # macchie di luce: punti piccoli a gruppi e qualche chiazza più larga e morbida (fioriture)
    vo = N.voronoi(p, 26.0, 'F1')
    _, _, b1 = N.xyz(vo.outputs['Color'])
    gruppi = N.smooth(0.50, 0.62, N.rumore(N.v('ADD', p, (5.0, 1.0, 3.0)), 2.6, dett=2).outputs['Fac'])
    punti = N.m('MULTIPLY', N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.15, vo.outputs['Distance'])), N.m('GREATER_THAN', b1, 0.62)), gruppi)
    vo2 = N.voronoi(q, 7.5, 'F1')
    _, g2, _ = N.xyz(vo2.outputs['Color'])
    chiazze = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.2, vo2.outputs['Distance'])), N.m('GREATER_THAN', g2, 0.8))
    chiazze = N.m('MULTIPLY', N.m('POWER', chiazze, 1.6), 0.62)
    # luce leggera lungo le coste (plancton), solo in certi tratti
    zc = N.smooth(0.45, 0.62, N.rumore(N.v('ADD', p, (2.4, 6.6, 1.2)), 3.0, dett=3).outputs['Fac'])
    costaE = N.m('MULTIPLY', N.m('MULTIPLY', costa, zc), 0.42)
    E = N.m('MAXIMUM', vene, N.m('MAXIMUM', punti, N.m('MAXIMUM', chiazze, costaE)))
    # colore: mari blu notte (più chiari sotto costa), terre di foresta scura fra il verde petrolio e il viola
    tono = N.m('ADD', N.m('MULTIPLY', N.rumore(q, 4.5, dett=6, rug=0.58).outputs['Fac'], 0.8), N.m('MULTIPLY', N.rumore(p, 28.0, dett=3).outputs['Fac'], 0.2))
    colT = N.rampa(tono, [(0.30, '#0E1D21'), (0.44, '#142629'), (0.56, '#1E2136'), (0.70, '#2A2244'), (0.82, '#33294F')])
    colM = N.rampa(prof, [(0.0, '#060A1C'), (0.6, '#0A1433'), (0.92, '#0F2650'), (1.0, '#143A60')])
    col = N.mix(terra, colM, colT)
    # vicino alle venature la foresta tende al viola
    alone = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.12, v1)), N.m('MULTIPLY', z1, terra))
    col = N.mix(N.m('MULTIPLY', alone, 0.55), col, hex_lin('#3A2A60'))
    # rilievo: solo sulle terre, i mari restano lisci
    alt = N.m('MULTIPLY', N.m('ADD', N.m('MULTIPLY', N.rumore(q, 6.0, dett=6).outputs['Fac'], 0.6), N.m('MULTIPLY', N.rumore(p, 22.0, dett=4).outputs['Fac'], 0.25)), terra)
    alt = N.m('ADD', alt, N.m('MULTIPLY', terra, 0.08))
    fase = N.mappa(N.rumore(N.v('ADD', p, (7.7, 3.3, 9.9)), 1.15, dett=2).outputs['Fac'], 0.32, 0.68)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(col))
    salva_png(px, os.path.join(OUT, 'bio-colore.png'), srgb=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(E))
    salva_png(px, os.path.join(OUT, 'bio-luce.png'), grigio=True)
    pf = cuoci(ob, N, 'EMIT', W, H, N.emissione(fase))
    pm = cuoci(ob, N, 'EMIT', W, H, N.emissione(mare))
    fm = np.zeros((H, W, 3), np.float32)
    fm[..., 0] = pf[..., 0]
    fm[..., 1] = pm[..., 0]
    salva_png(fm, os.path.join(OUT, 'bio-fase.png'))
    px = cuoci(ob, N, 'NORMAL', W, H, N.rilievo(alt, forza=0.5, distanza=0.05))
    salva_png(px, os.path.join(OUT, 'bio-normale.png'))


# ───────────────────────── Terra: nuvole procedurali (le mappe di giorno e di notte sono della NASA) ─────────────────────────
def nuvole():
    ob, N = nuovo('nuvole')
    p = N.p
    x, y, z = N.xyz(p)
    q = deformata(N, p, 1.4, 0.75, dett=4)
    q = deformata(N, q, 4.0, 0.12)
    n1 = N.rumore(q, 3.0, dett=10, rug=0.6).outputs['Fac']
    n2 = N.rumore(N.v('MULTIPLY', q, (1.0, 1.0, 3.2)), 2.4, dett=8, rug=0.58).outputs['Fac']
    n = N.m('ADD', N.m('MULTIPLY', n1, 0.8), N.m('MULTIPLY', n2, 0.2))
    az = N.m('ABSOLUTE', z)
    cov = N.m('ADD', 0.46, N.m('MULTIPLY', 0.07, N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.14, az))))
    sub = N.m('MULTIPLY', N.smooth(0.20, 0.36, az), N.m('SUBTRACT', 1.0, N.smooth(0.46, 0.62, az)))
    cov = N.m('SUBTRACT', cov, N.m('MULTIPLY', sub, 0.14))
    cov = N.m('ADD', cov, N.m('MULTIPLY', N.smooth(0.62, 0.80, az), 0.08))
    cov = N.m('SUBTRACT', cov, N.m('MULTIPLY', N.smooth(0.90, 0.99, az), 0.10))
    soglia = N.m('SUBTRACT', 1.0, cov)
    nv = N.smooth(N.m('SUBTRACT', soglia, 0.07), N.m('ADD', soglia, 0.13), n)
    nv = N.m('POWER', nv, 1.35)
    vel = N.m('ADD', 0.7, N.m('MULTIPLY', N.rumore(p, 24.0, dett=4).outputs['Fac'], 0.3))
    nv = N.m('MULTIPLY', nv, vel, clamp=True)
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(nv))
    salva_png(px, os.path.join(OUT, 'terra-nuvole.png'), grigio=True)


# ───────────────────────── Cielo: Via Lattea, nebulose e polvere di stelle (le stelle vere sono in pagina) ─────────────────────────
def cielo():
    ob, N = nuovo('cielo')
    p = N.p
    nm = (0.28, 0.52, 0.81)
    l = math.sqrt(sum(a * a for a in nm))
    nm = tuple(a / l for a in nm)
    s = N.v('DOT_PRODUCT', p, nm)
    banda = N.m('EXPONENT', N.m('DIVIDE', N.m('MULTIPLY', -1.0, N.m('MULTIPLY', s, s)), 0.030))
    stretta = N.m('EXPONENT', N.m('DIVIDE', N.m('MULTIPLY', -1.0, N.m('MULTIPLY', s, s)), 0.006))
    # centro galattico: direzione nel piano della banda
    cg = (0.62, 0.48, -0.52)
    l = math.sqrt(sum(a * a for a in cg))
    cg = tuple(a / l for a in cg)
    nucleo = N.smooth(0.55, 1.0, N.v('DOT_PRODUCT', p, cg))
    q = deformata(N, p, 2.0, 0.35)
    grumi = N.rumore(q, 4.5, dett=10, rug=0.62).outputs['Fac']
    polv = N.smooth(0.42, 0.66, N.rumore(deformata(N, p, 3.0, 0.25), 9.0, dett=8, rug=0.62, tipo='RIDGED_MULTIFRACTAL').outputs['Fac'])
    nubi = N.rumore(deformata(N, p, 5.0, 0.1), 13.0, dett=8, rug=0.65).outputs['Fac']
    grumi = N.m('MULTIPLY', N.m('POWER', grumi, 2.2), N.m('ADD', 0.6, N.m('MULTIPLY', nubi, 0.9)))
    lum = N.m('MULTIPLY', banda, N.m('ADD', 0.12, N.m('MULTIPLY', grumi, 2.4)))
    lum = N.m('ADD', lum, N.m('MULTIPLY', N.m('MULTIPLY', nucleo, banda), 0.9))
    lum = N.m('MULTIPLY', lum, N.m('SUBTRACT', 1.0, N.m('MULTIPLY', polv, N.m('MULTIPLY', banda, 0.9))))
    lum = N.m('MULTIPLY', lum, 0.11)
    colMW = N.mix(nucleo, hex_lin('#9FB2C8'), hex_lin('#E2CFAE'))
    mw = N.mix(1.0, colMW, N.vettore(lum, lum, lum), 'MULTIPLY')
    # nebulose larghe, verde petrolio e un poco di viola, molto tenui
    n1 = N.smooth(0.52, 0.80, N.rumore(deformata(N, p, 1.5, 0.5), 1.4, dett=7, rug=0.6).outputs['Fac'])
    n2 = N.smooth(0.55, 0.82, N.rumore(deformata(N, N.v('ADD', p, (4.0, 2.0, 9.0)), 1.7, 0.45), 1.6, dett=7, rug=0.6).outputs['Fac'])
    neb1 = N.mix(1.0, hex_lin('#1E4A43'), N.vettore(N.m('MULTIPLY', n1, 0.16), N.m('MULTIPLY', n1, 0.16), N.m('MULTIPLY', n1, 0.16)), 'MULTIPLY')
    neb2 = N.mix(1.0, hex_lin('#2C2142'), N.vettore(N.m('MULTIPLY', n2, 0.12), N.m('MULTIPLY', n2, 0.12), N.m('MULTIPLY', n2, 0.12)), 'MULTIPLY')
    # polvere di stelle fittissima, più densa nella banda
    vo = N.voronoi(p, 140.0, 'F1')
    rr, gg, bb = N.xyz(vo.outputs['Color'])
    st = N.m('MULTIPLY', N.m('SUBTRACT', 1.0, N.smooth(0.0, 0.16, vo.outputs['Distance'])), N.m('GREATER_THAN', gg, N.m('SUBTRACT', 0.72, N.m('MULTIPLY', banda, 0.3))))
    st = N.m('MULTIPLY', st, N.m('MULTIPLY', rr, 0.10))
    stv = N.vettore(st, st, st)
    tot = N.mix(1.0, mw, neb1, 'ADD')
    tot = N.mix(1.0, tot, neb2, 'ADD')
    tot = N.mix(1.0, tot, stv, 'ADD')
    tot = N.mix(1.0, tot, hex_lin('#020306'), 'ADD')
    px = cuoci(ob, N, 'EMIT', W, H, N.emissione(tot))
    salva_png(px, os.path.join(OUT, 'cielo.png'), srgb=True)


# ───────────────────────── anelli del Portfolio: profilo radiale (colore e densità) ─────────────────────────
def anelli():
    rng = np.random.default_rng(7)
    n = 1024
    r = np.linspace(0, 1, n)
    dens = np.zeros(n)
    for k in range(1, 70):
        f = rng.uniform(3, 220)
        dens += rng.uniform(0.2, 1.0) / math.sqrt(k) * np.sin(r * f + rng.uniform(0, 6.28))
    dens = (dens - dens.min()) / (dens.max() - dens.min())
    dens = 0.25 + 0.75 * dens
    prof = np.clip((r - 0.02) / 0.12, 0, 1) * np.clip((0.995 - r) / 0.05, 0, 1)
    prof *= 0.55 + 0.45 * np.clip((r - 0.25) / 0.2, 0, 1)
    gap = lambda c, w, k: 1 - k * np.exp(-((r - c) / w) ** 2)
    dens *= prof * gap(0.585, 0.022, 0.96) * gap(0.88, 0.006, 0.9) * gap(0.36, 0.03, 0.55) * gap(0.72, 0.01, 0.5)
    lum = 0.55 + 0.45 * np.clip(dens, 0, 1)
    caldo = np.array([0.86, 0.80, 0.70])
    freddo = np.array([0.62, 0.64, 0.66])
    t = np.clip((r - 0.2) / 0.7, 0, 1)[:, None]
    col = (caldo * (1 - t) + freddo * t) * lum[:, None]
    img = np.zeros((4, n, 3), np.float32)
    img[:] = col[None]
    a = np.clip(dens, 0, 1).astype(np.float32)
    # PNG: RGB colore (già sRGB), alfa nella riga a parte: si salva in un'unica striscia RGBA
    out = np.zeros((4, n, 4), np.float32)
    out[..., :3] = img
    out[..., 3] = a[None]
    im = bpy.data.images.new('anelli', n, 4, alpha=True, float_buffer=False)
    im.colorspace_settings.name = 'Non-Color'
    im.alpha_mode = 'STRAIGHT'
    im.pixels.foreach_set(out.ravel())
    im.filepath_raw = os.path.join(OUT, 'anelli.png')
    im.file_format = 'PNG'
    im.save()
    print('salvato anelli.png')


FUNZ = {'nemesi': nemesi, 'gigante': gigante, 'luna': luna, 'ossidiana': ossidiana, 'ghiaccio': ghiaccio, 'lava': lava, 'bio': bio, 'nuvole': nuvole, 'cielo': cielo, 'anelli': anelli}
import time
for q in QUALI:
    t0 = time.time()
    svuota()
    FUNZ[q]()
    print('fatto', q, round(time.time() - t0, 1), 's')
