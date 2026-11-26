# Contatti (dalla 3.67): pianeta di ghiaccio crepato. Crosta chiara turchese, rete di crepe accese (tre ordini, le piccole solo
# in certe zone) e quattro «strisce di tigre» intorno al polo sud. Da qui escono anche le bocche dei piccoli geyser (BOCCHE in mondi.js).
# Non usa Blender: rumore di Perlin in numpy, calcolato sulla sfera con le stesse UV di THREE.SphereGeometry (nessuna cucitura),
# a fasce di righe per non riempire la memoria.
# uso: python3 crepe.py res=4096 out=../tex/png   (poi ./prepara.sh; qualche minuto). Stampa le bocche da copiare in BOCCHE.
import numpy as np, sys, json
from PIL import Image
ARG = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
W = int(ARG.get('res', 4096)); H = W // 2
OUT = ARG.get('out', '../tex/png')

G = np.array([[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]], float)
def hsh(x, y, z, s):
    h = (x * 73856093) ^ (y * 19349663) ^ (z * 83492791) ^ (s * 2654435761)
    h = (h ^ (h >> 13)) * 1274126177; h = h ^ (h >> 16)
    return h % 12
def perlin(p, s=0):
    pi = np.floor(p).astype(np.int64); f = p - pi
    u = f * f * f * (f * (f * 6 - 15) + 10)
    out = 0
    acc = {}
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                g = G[hsh(pi[..., 0] + dx, pi[..., 1] + dy, pi[..., 2] + dz, s)]
                d = f - np.array([dx, dy, dz])
                acc[(dx, dy, dz)] = (g * d).sum(-1)
    lx = lambda a, b: a + (b - a) * u[..., 0]
    x00 = lx(acc[(0,0,0)], acc[(1,0,0)]); x10 = lx(acc[(0,1,0)], acc[(1,1,0)])
    x01 = lx(acc[(0,0,1)], acc[(1,0,1)]); x11 = lx(acc[(0,1,1)], acc[(1,1,1)])
    y0 = x00 + (x10 - x00) * u[..., 1]; y1 = x01 + (x11 - x01) * u[..., 1]
    return y0 + (y1 - y0) * u[..., 2]
def fbm(p, f, ott=5, s=0, gain=0.5):
    a, t, n = 1.0, 0.0, 0.0
    for k in range(ott):
        t += a * perlin(p * f * (2.03 ** k) + k * 3.7, s + k); n += a; a *= gain
    return 0.5 + 0.5 * t / n * 1.6
def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def hexc(h): h = h.lstrip('#'); return np.array([int(h[k:k+2], 16) / 255 for k in (0, 2, 4)])
def rampa(x, st):
    x = np.clip(x, 0, 1); pos = np.array([s[0] for s in st]); cols = np.array([hexc(s[1]) for s in st])
    return np.stack([np.interp(x, pos, cols[:, c]) for c in range(3)], -1)
def punto(lat, lon):
    la, lo = np.radians(lat), lon * 2 * np.pi
    return np.array([-np.cos(lo) * np.cos(la), np.sin(la), np.sin(lo) * np.cos(la)])
def ruota(P, c, alpha):
    ca, sa = np.cos(alpha)[..., None], np.sin(alpha)[..., None]
    cp = np.cross(c, P); dp = (P * c).sum(-1)[..., None]
    return P * ca + cp * sa + c * dp * (1 - ca)
def ellisse(P, c, ax, ay):
    up = np.array([0, 1.0, 0]); e = np.cross(up, c); e /= np.linalg.norm(e); n = np.cross(c, e)
    x, y = (P * e).sum(-1), (P * n).sum(-1); fronte = (P * c).sum(-1)
    return np.where(fronte > 0, np.sqrt((x / ax) ** 2 + (y / ay) ** 2), 99.0), y

def fascia(i0, i1):
    i = (np.arange(i0, i1) + 0.5) / H; j = (np.arange(W) + 0.5) / W
    phi = j[None, :] * 2 * np.pi; th = i[:, None] * np.pi
    P = np.stack([-np.cos(phi) * np.sin(th), np.cos(th) * np.ones_like(phi), np.sin(phi) * np.sin(th)], -1)
    def deform(p, f, a, s):
        return p + a * np.stack([fbm(p, f, 3, s) - 0.5, fbm(p, f, 3, s + 11) - 0.5, fbm(p, f, 3, s + 23) - 0.5], -1)
    q = deform(P, 1.4, 0.5, 30)
    r1 = np.abs(fbm(q, 1.3, 5, 40) - 0.5); l1 = 1 - sstep(0.0, 0.016, r1)
    r2 = np.abs(fbm(deform(q, 3.0, 0.2, 50), 3.4, 4, 60) - 0.5); l2 = 1 - sstep(0.0, 0.011, r2)
    r3 = np.abs(fbm(q, 8.0, 3, 70) - 0.5); l3 = 1 - sstep(0.0, 0.02, r3)
    zona2 = sstep(0.45, 0.6, fbm(P, 1.7, 3, 80)); zona3 = sstep(0.5, 0.62, fbm(P, 2.5, 3, 90))
    rete = np.maximum(l1 * 0.85, np.maximum(l2 * zona2 * 0.6, l3 * zona3 * 0.3))
    # strisce di tigre: quattro solchi paralleli intorno al polo sud
    sud = sstep(-0.55, -0.8, P[..., 1])
    xs = P[..., 0] * 0.8 + P[..., 2] * 0.6 + (fbm(P, 3.0, 3, 100) - 0.5) * 0.18
    tig = (1 - sstep(0.0, 0.05, np.abs(np.sin(xs * np.pi * 3.2)))) * sud * sstep(0.35, 0.0, np.abs(P[..., 0] * -0.6 + P[..., 2] * 0.8))
    luce = np.clip(np.maximum(rete * 0.75, tig), 0, 1)
    m1 = fbm(P, 2.2, 5, 110); m2 = fbm(P * np.array([1.0, 3.0, 1.0]), 4.0, 4, 120)
    base = rampa(m1 * 0.75 + m2 * 0.25, [(0.0, '#3F8597'), (0.35, '#6AAFBE'), (0.55, '#8FCAD3'), (0.75, '#B3DFE4'), (1.0, '#CDEDEF')])
    vecchio = sstep(0.55, 0.7, fbm(P, 1.2, 4, 130))
    base = base * (1 - vecchio[..., None] * 0.35) + hexc('#4A8C9E') * vecchio[..., None] * 0.35
    bordo = np.maximum(1 - sstep(0.0, 0.05, r1), (1 - sstep(0.0, 0.03, r2)) * zona2) * 0.35
    col = base * (1 - bordo[..., None] * 0.5)
    col = col * (1 - luce[..., None] * 0.7) + hexc('#2E95A8') * luce[..., None] * 0.7
    return P, col, luce, tig, l1

COL = np.zeros((H, W, 3), np.uint8); LUCE = np.zeros((H, W), np.uint8); cand = []
rng = np.random.default_rng(4); passo = max(64, H // 16)
for i0 in range(0, H, passo):
    P, col, luce, tig, l1 = fascia(i0, min(H, i0 + passo))
    COL[i0:i0 + len(P)] = (np.clip(col, 0, 1) * 255 + 0.5).astype(np.uint8)
    LUCE[i0:i0 + len(P)] = (np.clip(luce, 0, 1) * 255 + 0.5).astype(np.uint8)
    for maschera, tipo in ((tig > 0.85, 0), ((l1 > 0.9) & (np.abs(P[..., 1]) < 0.8), 1)):
        idx = np.argwhere(maschera)
        if len(idx): cand += [(tipo, P[a, b]) for a, b in idx[rng.choice(len(idx), min(len(idx), 300), replace=False)]]
    print('righe', i0, file=sys.stderr)
Image.fromarray(COL).save(OUT + '/crepe-colore.png'); Image.fromarray(LUCE).save(OUT + '/crepe-luce.png')
# bocche dei geyser: quattro sulle strisce di tigre e dieci sulle crepe grandi, lontane fra loro
rng.shuffle(cand); bocche = []
for quanti, tipo, dmin in ((4, 0, 0.16), (10, 1, 0.5)):
    presi = 0
    for t, p in cand:
        if t != tipo or presi >= quanti: continue
        if all(np.dot(p, q) < np.cos(dmin) for q in bocche): bocche.append(p); presi += 1
print(json.dumps([[round(float(x), 3) for x in p] for p in bocche]))
