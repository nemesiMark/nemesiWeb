# Mondi (pagina di prova) — texture dei pianeti e del cielo, cotte in Blender (Cycles) da materiali procedurali.
# Uso:
#   /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python pianeti.py -- \
#       quali=nemesi,gigante,luna,ghiaccio,nuvole,cielo,anelli res=2048 out=../tex/png
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


# ───────────────────────── Tool: luna di roccia con crateri e piccole luci verdi (le officine) ─────────────────────────
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


FUNZ = {'nemesi': nemesi, 'gigante': gigante, 'luna': luna, 'ghiaccio': ghiaccio, 'nuvole': nuvole, 'cielo': cielo, 'anelli': anelli}
import time
for q in QUALI:
    t0 = time.time()
    svuota()
    FUNZ[q]()
    print('fatto', q, round(time.time() - t0, 1), 's')
