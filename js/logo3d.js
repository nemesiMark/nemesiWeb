/* Nemesi Web 3.4 · il logo in 3D dell'apertura (Three.js r147, senza moduli).
   La forma viene da js/logo-forma.js, ricavato dal logo vettoriale: la faccia nera davanti con il triangolo verde
   incassato, il nastro grigio che dalla piega va indietro fino all'orlo, la barra verde, uno spessore con il bordo
   verde come le aste del sito. Sulle facce è proiettato il disegno SVG del logo, quindi di fronte è identico al logo;
   profondità, luce che passa e un giro leggero lo rendono un oggetto. Dietro, l'alone verde.
   Un filtro a schermo lo mostra come il video di riferimento: strisce verticali che piovono dall'alto, il pieno che
   sale dal basso con il bordo frastagliato; all'uscita il pieno torna strisce dal basso, le strisce cadono e il nero
   si scioglie a colonne mostrando il sito.
   Uso: var L = Logo3D.play(canvas); L.first (primo fotogramma disegnato: il nero c'è), L.ready (texture pronte),
   L.held (il logo è composto), L.exit(fatto) lo fa uscire e poi si chiude da solo, L.duration (durata dell'uscita),
   L.stop(). Senza WebGL 2 play restituisce null. Per le prove: play(canvas, { clock, pose }). */
(function(){
'use strict';
var T = window.THREE, FO = window.LOGO_FORMA;
if (!T || !FO) return;

function clamp(x, a, b){ return x < a ? a : x > b ? b : x; }
function seg(t, a, b){ return clamp((t - a) / (b - a), 0, 1); }
function sm(a, b, x){ var t = seg(x, a, b); return t * t * (3 - 2 * t); }
function io2(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function io3(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

/* ── la forma, in pixel del disegno originale (1536×1024, y in giù) ── */
function dense(a, step){                       // contorno → punti fitti [x, y]
  var pts = [[a[0], a[1]]], x = a[0], y = a[1], i = 2, k, n;
  while (i < a.length){
    if (a[i] === 0){
      var x1 = a[i + 1], y1 = a[i + 2];
      n = Math.max(1, Math.ceil(Math.hypot(x1 - x, y1 - y) / step));
      for (k = 1; k <= n; k++) pts.push([x + (x1 - x) * k / n, y + (y1 - y) * k / n]);
      x = x1; y = y1; i += 3;
    } else {
      var ax = a[i + 1], ay = a[i + 2], bx = a[i + 3], by = a[i + 4], ex = a[i + 5], ey = a[i + 6];
      n = Math.max(2, Math.ceil((Math.hypot(ax - x, ay - y) + Math.hypot(bx - ax, by - ay) + Math.hypot(ex - bx, ey - by)) / step));
      for (k = 1; k <= n; k++){
        var t = k / n, u = 1 - t;
        pts.push([u * u * u * x + 3 * u * u * t * ax + 3 * u * t * t * bx + t * t * t * ex,
                  u * u * u * y + 3 * u * u * t * ay + 3 * u * t * t * by + t * t * t * ey]);
      }
      x = ex; y = ey; i += 7;
    }
  }
  var out = [pts[0]];
  for (k = 1; k < pts.length; k++){ var q = out[out.length - 1]; if (Math.hypot(pts[k][0] - q[0], pts[k][1] - q[1]) > .2) out.push(pts[k]); }
  return out;
}
function chiuso(p){ var a = p[0], b = p[p.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < .5) p.pop(); return p; }
function aX(p, x){                             // punto della curva (crescente in x) all'ascissa x
  if (x <= p[0][0]) return p[0].slice();
  for (var i = 1; i < p.length; i++) if (p[i][0] >= x){
    var a = p[i - 1], b = p[i], t = (x - a[0]) / Math.max(1e-6, b[0] - a[0]);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  return p[p.length - 1].slice();
}
function dentro(P, x, y){
  var c = false;
  for (var i = 0, j = P.length - 1; i < P.length; j = i++){
    var xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

var VB = FO.vb, A = FO.A, B = FO.B, TIP = FO.TIP;
var DM = 150, SP = 34, REC = 10, ZB = -16;     // nastro: quanto va indietro l'orlo; spessore; incasso del triangolo; barra
var NU = 180, NV = 10;
var fold = dense(FO.fold, 3), rim = dense(FO.rim, 3);
var triP = chiuso(dense(FO.tri, 4)), barP = chiuso(dense(FO.bar, 4)), fP = chiuso(dense(FO.F, 4));
var X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9;
fP.concat(rim, barP).forEach(function(p){ X0 = Math.min(X0, p[0]); X1 = Math.max(X1, p[0]); Y0 = Math.min(Y0, p[1]); Y1 = Math.max(Y1, p[1]); });
var CX = (X0 + X1) / 2, CY = (Y0 + Y1) / 2, U = 1 / 400;
function wx(x){ return (x - CX) * U; }
function wy(y){ return (CY - y) * U; }
function tu(x){ return (x - VB[0]) / VB[2]; }
function tv(y){ return 1 - (y - VB[1]) / VB[3]; }
/* il nastro: piatto all'attacco (A), poi l'orlo va indietro, di più sopra la punta e un po' meno in fondo a destra */
function fondo(u){ return DM * sm(0, .22, u) * (1 - .42 * sm(.3, 1, u)); }
var ST = [];                                   // stazioni: piega e orlo alla stessa x normalizzata
for (var si = 0; si <= NU; si++){
  var su = si / NU;
  ST.push({ f: aX(fold, A[0] + su * (B[0] - A[0])), r: aX(rim, A[0] + su * (TIP[0] - A[0])), d: fondo(su) });
}

/* ── costruzione delle mesh ── */
function Geo(){ this.p = []; this.n = []; this.uv = []; this.ix = []; }
Geo.prototype.v = function(x, y, z, nx, ny, nz, u, v){ this.p.push(x, y, z); this.n.push(nx, ny, nz); this.uv.push(u, v); return this.p.length / 3 - 1; };
Geo.prototype.make = function(){
  var g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(this.p, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(this.n, 3));
  g.setAttribute('uv', new T.Float32BufferAttribute(this.uv, 2));
  g.setIndex(this.ix);
  return g;
};
function faccia(g, contour, holes, z){         // faccia piana rivolta verso chi guarda
  var V2 = function(p){ return new T.Vector2(p[0], -p[1]); };
  var tris = T.ShapeUtils.triangulateShape(contour.map(V2), holes.map(function(h){ return h.map(V2); }));
  var all = contour.concat.apply(contour, holes), base = g.p.length / 3;
  all.forEach(function(p){ g.v(wx(p[0]), wy(p[1]), z * U, 0, 0, 1, tu(p[0]), tv(p[1])); });
  tris.forEach(function(t){
    var a = all[t[0]], b = all[t[1]], c = all[t[2]];
    var cr = (b[0] - a[0]) * (a[1] - c[1]) - (a[1] - b[1]) * (c[0] - a[0]);
    if (cr >= 0) g.ix.push(base + t[0], base + t[1], base + t[2]); else g.ix.push(base + t[0], base + t[2], base + t[1]);
  });
}
/* normali verso l'esterno di un contorno (per il verso conta la maggioranza dei tratti: un contorno semplice ha
   la forma sempre dallo stesso lato) */
function normali(pts, loop, fuori){
  var n = pts.length, ns = loop ? n : n - 1, N = [], voto = 0, i;
  for (i = 0; i < ns; i++){
    var p = pts[i], q = pts[(i + 1) % n], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1;
    var nx = -dy / l, ny = dx / l;
    voto += fuori((p[0] + q[0]) / 2 + nx * 1.5, (p[1] + q[1]) / 2 + ny * 1.5) ? 1 : -1;
    N.push([nx, ny]);
  }
  if (voto < 0) N.forEach(function(v){ v[0] = -v[0]; v[1] = -v[1]; });
  return N;
}
function nVert(N, loop, k, s){                 // normale al vertice k del tratto s: liscia, salvo negli spigoli
  var ns = N.length, o = loop ? (s + (k === s ? -1 : 1) + ns) % ns : s + (k === s ? -1 : 1);
  if (o < 0 || o >= ns) return N[s];
  var a = N[s], b = N[o];
  if (a[0] * b[0] + a[1] * b[1] < .82) return a;
  var x = a[0] + b[0], y = a[1] + b[1], l = Math.hypot(x, y) || 1;
  return [x / l, y / l];
}
function Z(z, k){ return typeof z === 'number' ? z : z[k]; }
/* spessore lungo un contorno: davanti zf, dietro zb (numeri o liste per punto). uv = (tipo, 0 davanti → 1 dietro) */
function parete(g, pts, loop, zf, zb, fuori, tipo){
  var n = pts.length, N = normali(pts, loop, fuori);
  for (var s = 0; s < N.length; s++){
    var k0 = s, k1 = (s + 1) % n, P0 = pts[k0], P1 = pts[k1], n0 = nVert(N, loop, k0, s), n1 = nVert(N, loop, k1, s), b = g.p.length / 3;
    g.v(wx(P0[0]), wy(P0[1]), Z(zf, k0) * U, n0[0], -n0[1], 0, tipo, 0);
    g.v(wx(P1[0]), wy(P1[1]), Z(zf, k1) * U, n1[0], -n1[1], 0, tipo, 0);
    g.v(wx(P1[0]), wy(P1[1]), Z(zb, k1) * U, n1[0], -n1[1], 0, tipo, 1);
    g.v(wx(P0[0]), wy(P0[1]), Z(zb, k0) * U, n0[0], -n0[1], 0, tipo, 1);
    var sx = wx(P1[0]) - wx(P0[0]), sy = wy(P1[1]) - wy(P0[1]), Nw = N[s];
    if (-sy * Nw[0] - sx * Nw[1] >= 0) g.ix.push(b, b + 1, b + 2, b, b + 2, b + 3);   // il lato visibile è quello della normale
    else g.ix.push(b, b + 2, b + 1, b, b + 3, b + 2);
  }
}
/* il neon: una pinna sottile attaccata al bordo, alla sua profondità, che va verso l'esterno.
   uv = (x lungo il logo, 0 → 1, distanza dal bordo in pixel del disegno) */
function pinna(g, pts, loop, z, fuori, w){
  var n = pts.length, N = normali(pts, loop, fuori), b0 = g.p.length / 3, k;
  for (k = 0; k < n; k++){
    var a = N[Math.min(k, N.length - 1)], c = N[loop ? (k - 1 + N.length) % N.length : Math.max(k - 1, 0)];
    var nx = a[0] + c[0], ny = a[1] + c[1], l = Math.hypot(nx, ny) || 1, P = pts[k], X = (P[0] - X0) / (X1 - X0);
    nx /= l; ny /= l;
    g.v(wx(P[0]), wy(P[1]), Z(z, k) * U, 0, 0, 1, X, 0);
    g.v(wx(P[0] + nx * w), wy(P[1] + ny * w), Z(z, k) * U, 0, 0, 1, X, w);
  }
  for (k = 0; k < (loop ? n : n - 1); k++){
    var i0 = b0 + k * 2, i1 = b0 + ((k + 1) % n) * 2;
    g.ix.push(i0, i1, i1 + 1, i0, i1 + 1, i0 + 1);
  }
}

function costruisci(){
  var art = new Geo(), mur = new Geo(), i, j;
  /* faccia nera (con il foro del triangolo): lungo la piega usa le stesse stazioni del nastro, così non ci sono fessure */
  var iB = 0, dB = 1e9;
  fP.forEach(function(p, k){ var d = Math.hypot(p[0] - B[0], p[1] - B[1]); if (d < dB){ dB = d; iB = k; } });
  var resto = fP.slice(iB + 1);
  var fc = ST.map(function(s){ return s.f; }).concat(resto);
  faccia(art, fc, [triP], 0);
  faccia(art, triP, [], -REC);
  faccia(art, barP, [], ZB);
  /* il nastro grigio: superficie rigata dalla piega (davanti) all'orlo (indietro) */
  var b0 = art.p.length / 3, P = [];
  for (i = 0; i <= NU; i++) for (j = 0; j <= NV; j++){
    var s = ST[i], v = j / NV, x = s.f[0] + (s.r[0] - s.f[0]) * v, y = s.f[1] + (s.r[1] - s.f[1]) * v;
    P.push([wx(x), wy(y), -s.d * v * U]);
    art.v(wx(x), wy(y), -s.d * v * U, 0, 0, 1, tu(x), tv(y));
  }
  function at(i, j){ return P[clamp(i, 0, NU) * (NV + 1) + clamp(j, 0, NV)]; }
  for (i = 0; i <= NU; i++) for (j = 0; j <= NV; j++){
    var ii = Math.max(i, 1), a1 = at(ii + 1, j), a0 = at(ii - 1, j), c1 = at(ii, j + 1), c0 = at(ii, j - 1);
    var ux = a1[0] - a0[0], uy = a1[1] - a0[1], uz = a1[2] - a0[2], vx = c1[0] - c0[0], vy = c1[1] - c0[1], vz = c1[2] - c0[2];
    var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
    if (nz < 0){ nx = -nx; ny = -ny; nz = -nz; }
    var o = (b0 + i * (NV + 1) + j) * 3;
    art.n[o] = nx / l; art.n[o + 1] = ny / l; art.n[o + 2] = nz / l;
  }
  for (i = 0; i < NU; i++) for (j = 0; j < NV; j++){
    var q00 = b0 + i * (NV + 1) + j, q10 = q00 + NV + 1, q01 = q00 + 1, q11 = q10 + 1;
    var pa = P[q00 - b0], pb = P[q10 - b0], pc = P[q11 - b0];
    var cz = (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0]);
    if (cz >= 0) art.ix.push(q00, q10, q11, q00, q11, q01); else art.ix.push(q00, q11, q10, q00, q01, q11);
  }
  /* spessori */
  var gPoly = ST.map(function(s){ return s.r; }).concat(ST.slice().reverse().map(function(s){ return s.f; }));
  function fuoriU(x, y){ return !dentro(fc, x, y) && !dentro(gPoly, x, y); }
  parete(mur, [B].concat(resto, [A]), false, 0, -SP, fuoriU, 0);
  var rimP = ST.map(function(s){ return s.r; }), zr = ST.map(function(s){ return -s.d; });
  parete(mur, rimP, false, zr, zr.map(function(z){ return z - SP; }), fuoriU, 0);
  var bot = [], zbt = [], last = ST[NU];
  for (j = NV; j >= 0; j--){ var w = j / NV; bot.push([last.f[0] + (last.r[0] - last.f[0]) * w, last.f[1] + (last.r[1] - last.f[1]) * w]); zbt.push(-last.d * w); }
  parete(mur, bot, false, zbt, zbt.map(function(z){ return z - SP; }), fuoriU, 0);
  parete(mur, triP, true, 0, -REC, function(x, y){ return dentro(triP, x, y); }, 1);
  parete(mur, barP, true, ZB, ZB - SP, function(x, y){ return !dentro(barP, x, y); }, 2);
  /* neon: il contorno esterno del nastro (dall'angolo in basso a sinistra, su per il fianco, lungo l'orlo fino alla
     punta), i due piedi, la barra */
  var iL = 0, dL = 1e9;
  resto.forEach(function(p, k){ var d = Math.hypot(p[0] - 254.2, p[1] - 764.9); if (d < dL){ dL = d; iL = k; } });
  var fianco = resto.slice(iL), est = fianco.concat(rimP), zEst = fianco.map(function(){ return 0; }).concat(zr);
  var neon = new Geo(), piedi = new Geo(), nbar = new Geo();
  pinna(neon, est, false, zEst, fuoriU, 14);
  var iF = 0, dF = 1e9;
  resto.forEach(function(p, k){ var d = Math.hypot(p[0] - 441.6, p[1] - 764.9); if (d < dF){ dF = d; iF = k; } });
  var piedeS = resto.slice(iF, iL + 1), piedeD;
  var iE = 0, dE = 1e9;
  resto.forEach(function(p, k){ var d = Math.hypot(p[0] - 1012.9, p[1] - 775); if (d < dE){ dE = d; iE = k; } });
  piedeD = bot.concat(resto.slice(0, iE + 1));
  pinna(piedi, piedeS, false, 0, fuoriU, 14);
  pinna(piedi, piedeD, false, zbt.concat(resto.slice(0, iE + 1).map(function(){ return 0; })), fuoriU, 14);
  pinna(nbar, barP, true, ZB, function(x, y){ return !dentro(barP, x, y); }, 14);
  return { art: art.make(), mur: mur.make(), neon: neon.make(), piedi: piedi.make(), nbar: nbar.make() };
}

/* ── shader ── */
var VS = [
  'varying vec2 vUv; varying vec3 vN, vW;',
  'void main(){',
  '  vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;',
  '  vN = normalize(mat3(modelMatrix) * normal);',
  '  gl_Position = projectionMatrix * viewMatrix * w;',
  '}'].join('\n');
var LUCI = [
  'uniform vec3 uCam, uL1; uniform float uI1;',
  'varying vec2 vUv; varying vec3 vN, vW;',
  'float bp(vec3 N, vec3 V, vec3 Lp, float k){ vec3 H = normalize(normalize(Lp - vW) + V); return pow(max(dot(N, H), 0.0), k); }'].join('\n');
/* facce: il colore è il disegno del logo; sopra, una banda di luce che scorre in diagonale (con un poco di
   parallasse, perché segue il riflesso della vista): sottile sulla lacca nera, più piena sul nastro e sui pannelli */
var FS_ART = [
  'uniform sampler2D uArt; uniform vec4 uVb; uniform float uSw, uSwI;', LUCI,
  'void main(){',
  '  vec4 a = texture2D(uArt, vUv);',
  '  vec3 c = a.a > 0.004 ? a.rgb / a.a : vec3(0.06, 0.06, 0.07);',
  '  vec3 N = normalize(vN), V = normalize(uCam - vW), R = reflect(-V, N);',
  '  vec2 m = vec2(uVb.x + vUv.x * uVb.z, uVb.y + (1.0 - vUv.y) * uVb.w);',
  '  float lime = clamp((c.g - c.b) * 2.4 - 0.2, 0.0, 1.0);',
  '  float dark = 1.0 - smoothstep(0.05, 0.35, dot(c, vec3(0.333)));',
  '  float q = dot(m, vec2(0.88, 0.47)) + (R.x * 0.88 - R.y * 0.47) * 260.0 - uSw;',
  '  float sh = exp(-q * q / 2100.0) + 0.3 * exp(-q * q / 26000.0);',
  '  float amt = mix(mix(0.3, 0.12, dark), 0.22, lime);',
  '  c += mix(vec3(1.0), vec3(0.94, 1.0, 0.7), lime) * sh * amt * uSwI;',
  '  gl_FragColor = vec4(c, 1.0);',
  '}'].join('\n');
/* spessori: 0 bordo del nastro (lacca nera con la luce verde davanti), 1 pareti dell'incasso, 2 fianchi della barra */
var FS_MUR = [
  LUCI,
  'void main(){',
  '  float d = clamp(vUv.y, 0.0, 1.0), k = vUv.x;',
  '  vec3 N = normalize(vN), V = normalize(uCam - vW);',
  '  vec3 lime = vec3(0.74, 0.99, 0.22), c;',
  '  if (k < 0.5){',
  '    c = mix(vec3(0.045, 0.06, 0.03), vec3(0.012, 0.014, 0.012), smoothstep(0.1, 0.9, d));',
  '    c += lime * (exp(-d * 10.0) * 0.9 + 0.06);',
  '  } else if (k < 1.5){',
  '    c = mix(vec3(0.02, 0.024, 0.02), lime * 0.6, d * d);',
  '  } else {',
  '    c = mix(lime * 0.85, lime * 0.28, d);',
  '  }',
  '  float fr = pow(1.0 - abs(dot(N, V)), 3.0);',
  '  c += lime * fr * 0.2;',
  '  c += vec3(0.95, 1.0, 0.82) * bp(N, V, uL1, 40.0) * uI1 * 0.4;',
  '  gl_FragColor = vec4(c, 1.0);',
  '}'].join('\n');
var FS_ALONE = [
  'uniform sampler2D uGlow; uniform float uI; varying vec2 vUv;',
  'void main(){ vec4 g = texture2D(uGlow, vUv); gl_FragColor = vec4(g.rgb * uI, 0.0); }'].join('\n');
/* neon: il tratto del contorno e il bagliore stretto subito fuori (il bagliore largo è nella texture dell'alone).
   Sul nastro il colore cambia lungo il logo come nel disegno; piedi e barra hanno il loro colore */
var FS_NEON = [
  'uniform float uI, uNw, uNa, uTa, uTs, uGrad; uniform vec3 uNc, uTc; varying vec2 vUv;',
  'vec4 grad(float x){',
  '  vec4 c = mix(vec4(0.369, 0.549, 0.047, 0.6), vec4(0.392, 0.573, 0.055, 0.62), smoothstep(0.0, 0.066, x));',
  '  c = mix(c, vec4(0.494, 0.682, 0.078, 0.78), smoothstep(0.066, 0.174, x));',
  '  c = mix(c, vec4(0.588, 0.8, 0.11, 0.92), smoothstep(0.174, 0.227, x));',
  '  c = mix(c, vec4(0.596, 0.808, 0.11, 0.92), smoothstep(0.227, 0.568, x));',
  '  c = mix(c, vec4(0.525, 0.729, 0.094, 0.62), smoothstep(0.568, 0.649, x));',
  '  c = mix(c, vec4(0.416, 0.58, 0.071, 0.34), smoothstep(0.649, 0.738, x));',
  '  return mix(c, vec4(0.353, 0.502, 0.055, 0.2), smoothstep(0.738, 1.0, x));',
  '}',
  'void main(){',
  '  float r = vUv.y;',
  '  float n = 1.0 - smoothstep(uNw - 1.1, uNw + 1.1, r);',
  '  float t = 0.5 * exp(-pow(r / uTs, 1.7) * 0.9);',
  '  vec4 g = grad(vUv.x);',
  '  vec3 nc = mix(uNc * uNa, g.rgb * g.a, uGrad);',
  '  vec3 tc = mix(uTc, mix(vec3(0.62, 0.83, 0.22), vec3(0.45, 0.65, 0.04), vUv.x), uGrad) * uTa;',
  '  gl_FragColor = vec4((nc * n + tc * t * (1.0 - n * 0.6)) * uI, 0.0);',
  '}'].join('\n');
var VS_ALONE = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

/* il filtro a schermo (in pixel CSS, y in giù): pieno, strisce, sbavature ai fronti, sipario nero */
var VS_Q = 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }';
var FS_Q = [
  'uniform sampler2D tS;',
  'uniform vec2 uRes; uniform vec4 uBox; uniform vec3 uBg0, uBg1;',
  'uniform float uDpr, uT, uIn, uSol, uOut, uFall, uMelt, uPitch, uSW, uHot;',
  'float h1(float n){ return fract(sin(n * 91.3458 + 17.17) * 47453.5453); }',
  'float h2(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
  'vec4 at(vec2 q, float lod){ return textureLod(tS, vec2(q.x * uDpr / uRes.x, 1.0 - q.y * uDpr / uRes.y), lod); }',
  'float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }',
  'void main(){',
  '  float W = uRes.x / uDpr, H = uRes.y / uDpr;',
  '  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;',
  '  float col = floor(p.x / uPitch), cx = (col + 0.5) * uPitch;',
  '  float ha = h1(col), hb = h1(col + 37.1), hc = h1(col + 71.9), hd = h1(col + 113.3);',
  '  float bA = h1(floor(col / 6.0) + 211.0), bB = h1(floor((col + 3.0) / 5.0) + 307.0);',
  '  float y0 = uBox.y - 90.0, y1 = uBox.w + 90.0;',
  /* i due fronti frastagliati: sotto fIn c'è il pieno (entrata), sotto fOut tornano le strisce (uscita) */
  '  float fIn = mix(y1, y0, uSol) + (ha - 0.5) * 44.0 + (bA - 0.5) * 76.0;',
  '  float fOut = mix(y1, y0, uOut) + (hb - 0.5) * 44.0 + (bB - 0.5) * 76.0;',
  '  vec4 lay = vec4(0.0);',
  '  if (p.y > fIn && p.y < fOut){',
  '    vec4 s = at(p, 0.0);',
  '    vec3 bl = at(p, 3.5).rgb * 0.55 + at(p, 5.0).rgb * 0.45;',
  '    lay = vec4(s.rgb + max(bl - 0.2, 0.0) * 0.5, s.a);',
  '  } else {',
  /* strisce: ogni colonna ha il suo passo; all'entrata piovono dall'alto, all'uscita cadono */
  '    float ein = clamp(uIn * 1.45 - ha * 0.45, 0.0, 1.0);',
  '    float drop = pow(1.0 - ein, 3.0) * (70.0 + 130.0 * hc);',
  '    float fall = uFall * uFall * H * 0.6 * (0.45 + hc);',
  '    float Y = p.y + drop - fall;',
  '    float per = mix(13.0, 25.0, hd), ph = ha * per;',
  '    float kk = floor((Y + ph) / per), fy = Y + ph - kk * per, yc = (kk + 0.5) * per - ph;',
  '    vec4 sc = at(vec2(cx, yc), 1.0);',
  '    float lum = luma(sc.rgb), b = max(lum * 1.2, sc.a * 0.2);',
  '    float rk = h2(vec2(col, kk));',
  '    float on = smoothstep(rk * 0.75, rk * 0.75 + 0.25, uIn) * (1.0 - smoothstep(rk * 0.7, rk * 0.7 + 0.3, uFall * 1.15));',
  '    float duty = mix(0.34, 0.88, smoothstep(0.04, 0.7, b));',
  '    float bw = mix(1.0, uPitch * 0.42, smoothstep(0.04, 0.85, b));',
  '    float ax = clamp((bw * 0.5 - abs(p.x - cx)) * uDpr + 0.5, 0.0, 1.0);',
  '    float ay = clamp(fy * uDpr + 0.5, 0.0, 1.0) * clamp((duty * per - fy) * uDpr + 0.5, 0.0, 1.0);',
  /* colore: quello del logo, più acceso, con le frange: verde giallo sui bordi a sinistra, verde menta a destra */
  '    vec4 sl = at(vec2(cx - 13.0, yc), 2.5), sr = at(vec2(cx + 13.0, yc), 2.5);',
  '    float g = (luma(sr.rgb) - luma(sl.rgb)) * 1.8 + (sr.a - sl.a) * 0.9;',
  '    vec3 dc = sc.rgb * 1.32 + 0.05 + sc.a * 0.04;',
  '    float xs = clamp((cx - uBox.x) / max(uBox.z - uBox.x, 1.0), 0.0, 1.0);',
  '    vec3 tint = mix(vec3(0.95, 1.0, 0.45), vec3(0.45, 1.0, 0.82), xs);',
  '    dc = mix(dc, tint * (0.5 + b * 1.1), 0.2);',
  '    dc = mix(dc, vec3(0.97, 1.0, 0.42) * (0.55 + b * 1.3), clamp(g, 0.0, 1.0) * 0.85);',
  '    dc = mix(dc, vec3(0.38, 1.0, 0.84) * (0.55 + b * 1.3), clamp(-g, 0.0, 1.0) * 0.85);',
  '    dc = min(dc, vec3(1.2));',
  '    float da = on * ax * ay * smoothstep(0.03, 0.09, b);',
  '    vec4 dash = vec4(dc * da, da * smoothstep(0.08, 0.5, b));',
  /* sbavature: ai fronti il pieno si allunga per un tratto, solo su alcune colonne */
  '    float s1 = (16.0 + 70.0 * hc) * step(0.42, hc), d1 = fIn - p.y;',
  '    vec4 m1 = at(vec2(p.x, fIn + 1.0), 0.0) * pow(clamp(1.0 - d1 / max(s1, 1.0), 0.0, 1.0), 1.6) * step(0.0, d1) * 0.9;',
  '    float s2 = (16.0 + 70.0 * hb) * step(0.45, hb), d2 = p.y - fOut;',
  '    vec4 m2 = at(vec2(p.x, fOut - 1.0), 0.0) * pow(clamp(1.0 - d2 / max(s2, 1.0), 0.0, 1.0), 1.6) * step(0.0, d2) * 0.9;',
  '    vec4 smr = max(m1, m2);',
  '    lay = smr + dash * (1.0 - smr.a);',
  '  }',
  /* il sipario: il nero cade a colonne strette, prima al centro; in testa a ogni colonna un filo di luce */
  '  float sj = floor(p.x / uSW), r1 = h1(sj + 401.0), r2 = h1(sj + 517.0);',
  '  float dj = r1 * 0.08 + 0.3 * abs((sj + 0.5) * uSW - W * 0.5) / (W * 0.5);',
  '  float pj = clamp((uMelt - dj) / (0.4 + 0.12 * r2), 0.0, 1.0);',
  '  float top = -6.0 + (0.2 * pj + 0.8 * pj * pj) * (H + 30.0);',
  '  float cur = clamp((p.y - top) * uDpr + 0.5, 0.0, 1.0);',
  '  vec2 cq = (p - vec2(W * 0.5, H * 0.46)) / max(W, H);',
  '  vec3 bg = mix(uBg0, uBg1, smoothstep(0.0, 0.75, length(cq) * 1.5));',
  '  bg += (h2(gl_FragCoord.xy + floor(uT * 30.0) * 7.31) - 0.5) * (2.2 / 255.0);',
  '  float hot = uHot * smoothstep(0.0, 0.06, pj) * (1.0 - pj) * exp(-max(p.y - top, 0.0) * 0.6);',
  '  vec3 col3 = lay.rgb + (bg + vec3(0.72, 0.99, 0.2) * hot) * cur * (1.0 - lay.a);',
  '  gl_FragColor = vec4(col3, lay.a + cur * (1.0 - lay.a));',
  '}'].join('\n');

/* ── tempi (secondi dal momento in cui il disegno è pronto) ── */
var IN0 = .05, IN1 = 1.45, SO0 = 1.0, SO1 = 2.3, THOLD = 3.2, EXIT = 1.45;
/* LENTO: tutto il movimento del logo scorre più piano di questo fattore (dalla 3.14; i tempi qui sopra restano quelli «di disegno») */
var LENTO = 1.4;

function svgImg(svg, w, h){
  return new Promise(function(res, rej){
    var s = svg.replace(/width="[\d.]+" height="[\d.]+"/, 'width="' + w + '" height="' + h + '"');
    var im = new Image();
    im.onload = function(){ res(im); }; im.onerror = rej;
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  });
}
function canvasTex(im, w, h){
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(im, 0, 0, w, h);
  var t = new T.CanvasTexture(c);
  t.premultiplyAlpha = true; t.anisotropy = 4; t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter;
  return t;
}

function play(canvas, opts){
  opts = opts || {};
  var clock0 = opts.clock || function(){ return performance.now() / 1000; };
  var clock = function(){ return clock0() / LENTO; };
  var renderer;
  try { renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' }); }
  catch (err){ return null; }
  if (!renderer.capabilities.isWebGL2){ renderer.dispose(); return null; }
  renderer.setClearColor(0x000000, 0);
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 2, H = 2;

  var scene = new T.Scene(), cam = new T.PerspectiveCamera(20, 1, .1, 200);
  var grp = new T.Group(); scene.add(grp);
  var G = costruisci();
  var L1 = new T.Vector3();
  var uLuci = { uCam: { value: new T.Vector3() }, uL1: { value: L1 }, uI1: { value: 0 } };
  var EMPTY = new T.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); EMPTY.needsUpdate = true;
  var uArt = { value: EMPTY }, uGlow = { value: EMPTY }, uGI = { value: 1 };
  var uSw = { value: -1e4 }, uSwI = { value: 0 };
  var matArt = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_ART, uniforms: Object.assign({ uArt: uArt, uVb: { value: new T.Vector4(VB[0], VB[1], VB[2], VB[3]) }, uSw: uSw, uSwI: uSwI }, uLuci) });
  var matMur = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_MUR, uniforms: uLuci, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  var matAlone = new T.ShaderMaterial({ vertexShader: VS_ALONE, fragmentShader: FS_ALONE, uniforms: { uGlow: uGlow, uI: uGI },
    depthTest: false, depthWrite: false, blending: T.CustomBlending, blendEquation: T.AddEquation, blendSrc: T.OneFactor, blendDst: T.OneFactor,
    blendEquationAlpha: T.AddEquation, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor });
  function matNeon(o){
    return new T.ShaderMaterial({ vertexShader: VS_ALONE, fragmentShader: FS_NEON, transparent: true, depthWrite: false,
      blending: T.CustomBlending, blendEquation: T.AddEquation, blendSrc: T.OneFactor, blendDst: T.OneFactor,
      blendEquationAlpha: T.AddEquation, blendSrcAlpha: T.ZeroFactor, blendDstAlpha: T.OneFactor, side: T.DoubleSide,
      uniforms: { uI: uGI, uNw: { value: o.nw }, uNa: { value: o.na }, uTa: { value: o.ta }, uTs: { value: 3.5 }, uGrad: { value: o.grad ? 1 : 0 },
        uNc: { value: new T.Color(o.nc || '#000000') }, uTc: { value: new T.Color(o.tc || '#000000') } } });
  }
  var matsN = [matNeon({ nw: 2.3, na: 1, ta: .46, grad: true }), matNeon({ nw: 2, na: .55, ta: .75, nc: '#7EB40C', tc: '#8CC80A' }),
               matNeon({ nw: 2.2, na: .8, ta: .75, nc: '#94D010', tc: '#A2DC1E' })];
  [G.neon, G.piedi, G.nbar].forEach(function(g, k){ grp.add(new T.Mesh(g, matsN[k])); });
  var mArt = new T.Mesh(G.art, matArt), mMur = new T.Mesh(G.mur, matMur);
  var alone = new T.Mesh(new T.PlaneGeometry(VB[2] * U, VB[3] * U), matAlone);
  alone.position.set(wx(VB[0] + VB[2] / 2), wy(VB[1] + VB[3] / 2), -SP * .45 * U);
  alone.renderOrder = -1;
  grp.add(alone); grp.add(mArt); grp.add(mMur);

  var rt = new T.WebGLRenderTarget(2, 2, { samples: 4, minFilter: T.LinearMipmapLinearFilter, magFilter: T.LinearFilter, generateMipmaps: true });
  var qU = {
    tS: { value: rt.texture }, uRes: { value: new T.Vector2(2, 2) }, uBox: { value: new T.Vector4(0, 0, 1, 1) },
    uBg0: { value: new T.Vector3(.047, .051, .059) }, uBg1: { value: new T.Vector3(.016, .016, .02) },
    uDpr: { value: dpr }, uT: { value: 0 }, uIn: { value: 0 }, uSol: { value: 0 }, uOut: { value: 0 }, uFall: { value: 0 }, uMelt: { value: 0 },
    uPitch: { value: 7 }, uSW: { value: 7 }, uHot: { value: .45 }
  };
  var quad = new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ vertexShader: VS_Q, fragmentShader: FS_Q, uniforms: qU, depthTest: false, depthWrite: false }));
  quad.frustumCulled = false;
  var qScene = new T.Scene(), qCam = new T.Camera(); qScene.add(quad);

  /* inquadratura: il logo largo metà dello schermo sul computer, quasi tutto sul telefono */
  var tanH = Math.tan(cam.fov * Math.PI / 360), LW = (X1 - X0) * U, LH = (Y1 - Y0) * U, dist = 10, frac = .5;
  function size(){
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    rt.setSize(Math.round(W * dpr), Math.round(H * dpr));
    cam.aspect = W / H; cam.updateProjectionMatrix();
    frac = W < 760 ? .8 : W < 1100 ? .6 : .5;
    dist = Math.max(LW / (frac * 2 * tanH * cam.aspect), LH / (.4 * 2 * tanH));
    var lw = LW / (2 * dist * tanH * cam.aspect) * W;
    qU.uRes.value.set(W * dpr, H * dpr); qU.uDpr.value = dpr;
    qU.uPitch.value = clamp(Math.round(lw / 104), 4, 8); qU.uSW.value = qU.uPitch.value;
  }
  size();
  addEventListener('resize', size);

  /* il disegno del logo diventa texture: a colori per le facce, l'alone a metà risoluzione */
  var ready = false, failed = false, resReady, pronto = new Promise(function(r){ resReady = r; });
  /* l'alone: solo il bagliore largo (il neon e il bagliore stretto sono le pinne attaccate ai bordi) */
  var aloneSvg = FO.glow.replace(/<g filter="url\(#gfS\)">[\s\S]*?<\/g>/, '').replace(/<g filter="url\(#gfN\)">[\s\S]*?<\/g>/, '');
  var tw = clamp(Math.ceil(frac * W * dpr * 1.3 / 256) * 256, 1280, 2560), th = Math.round(tw * VB[3] / VB[2]);
  Promise.all([svgImg(FO.art, tw, th), svgImg(aloneSvg, tw / 2, Math.round(th / 2))]).then(function(im){
    if (dead) return;
    uArt.value = canvasTex(im[0], tw, th); uGlow.value = canvasTex(im[1], tw / 2, Math.round(th / 2));
    renderer.initTexture(uArt.value); renderer.initTexture(uGlow.value);
    ready = true; resReady();
  }).catch(function(){ failed = true; resReady(); });
  try { renderer.compile(scene, cam); renderer.compile(qScene, qCam); } catch (err){}

  var resFirst, resHeld, first = new Promise(function(r){ resFirst = r; }), held = new Promise(function(r){ resHeld = r; });
  var raf = 0, dead = false, t0 = -1, te = -1, done = null, gotFirst = false, gotHeld = false, inAtExit = 0, solAtExit = 0;
  var v3 = new T.Vector3(), BOXP = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];

  function tick(){
    raf = requestAnimationFrame(tick);
    var now = clock();
    if (ready && t0 < 0) t0 = now;
    var lt = t0 < 0 ? 0 : now - t0, e = te < 0 ? -1 : now - te;
    var vIn = seg(lt, IN0, IN1), vSol = io2(seg(lt, SO0, SO1));
    if (e >= 0){ vIn = Math.max(inAtExit, Math.min(1, inAtExit + e / .35)); vSol = solAtExit; }
    qU.uT.value = now % 100; qU.uIn.value = vIn; qU.uSol.value = vSol;
    qU.uOut.value = e < 0 ? 0 : io2(seg(e, 0, .75));
    qU.uFall.value = e < 0 ? 0 : seg(e, .22, 1.38);
    qU.uMelt.value = e < 0 ? 0 : seg(e, .28, 1.22);

    if (ready){
      /* il logo arriva girato e si mette di fronte mentre si compone; poi respira piano */
      var yaw = -.42 * (1 - io3(seg(lt, 0, 2.5))) + .065 * Math.sin(lt * .45 + .3);
      var pit = .035 * Math.sin(lt * .33), elev = .09;
      if (opts.pose){ var po = opts.pose(lt); if (po){ yaw = po[0]; pit = po[1]; elev = po[2]; } }
      grp.rotation.set(pit, yaw, 0);
      grp.scale.setScalar(.955 + .045 * io2(seg(lt, 0, 2.6)) + (e > 0 ? .03 * io2(seg(e, 0, 1.4)) : 0));
      cam.position.set(0, dist * elev, dist);
      cam.lookAt(0, -dist * .0105, 0);
      uLuci.uCam.value.copy(cam.position);
      /* la luce passa da sinistra a destra: la prima volta mentre il logo si chiude, poi ogni 6 secondi */
      var ls = lt - 1.6, sw = ls < 0 ? -1 : (ls % 6) / 1.9;
      uSw.value = sw < 0 || sw > 1 ? -1e4 : 100 + 1650 * io2(sw); uSwI.value = 1;
      L1.set(-3.4 + 6.8 * clamp(sw, 0, 1), 3.0, 1.7); uLuci.uI1.value = sw < 0 || sw > 1 ? 0 : Math.sin(Math.PI * sw);
      uGI.value = .92 + .08 * Math.sin(lt * 1.3);
      /* dove sta il logo sullo schermo (per i fronti e per il colore delle strisce) */
      grp.updateMatrixWorld(true); cam.updateMatrixWorld(true);
      var bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
      for (var k = 0; k < 4; k++){
        v3.set(wx(BOXP[k][0]), wy(BOXP[k][1]), 0).applyMatrix4(grp.matrixWorld).project(cam);
        var sx = (v3.x + 1) / 2 * W, sy = (1 - v3.y) / 2 * H;
        bx0 = Math.min(bx0, sx); bx1 = Math.max(bx1, sx); by0 = Math.min(by0, sy); by1 = Math.max(by1, sy);
      }
      qU.uBox.value.set(bx0, by0, bx1, by1);
      renderer.setRenderTarget(rt); renderer.render(scene, cam);
    } else {
      renderer.setRenderTarget(rt); renderer.clear();
    }
    renderer.setRenderTarget(null); renderer.render(qScene, qCam);
    if (!gotFirst){ gotFirst = true; resFirst(); }
    if (!gotHeld && ((ready && lt >= THOLD) || failed)){ gotHeld = true; resHeld(); }
    if (e >= EXIT){ var d = done; stop(); if (d) d(); }
  }
  function stop(){
    if (dead) return; dead = true;
    cancelAnimationFrame(raf); removeEventListener('resize', size);
    [G.art, G.mur, G.neon, G.piedi, G.nbar, alone.geometry, quad.geometry].forEach(function(g){ g.dispose(); });
    [matArt, matMur, matAlone, quad.material].concat(matsN).forEach(function(m){ m.dispose(); });
    [uArt.value, uGlow.value, EMPTY].forEach(function(t){ t.dispose(); });
    rt.dispose(); renderer.dispose();
    try { renderer.forceContextLoss(); } catch (err){}
  }
  raf = requestAnimationFrame(tick);
  return {
    first: first, held: held, ready: pronto, duration: EXIT * LENTO, stop: stop,
    exit: function(fatto){
      if (te >= 0 || dead) return;
      var now = clock(), lt = t0 < 0 ? 0 : now - t0;
      inAtExit = seg(lt, IN0, IN1); solAtExit = io2(seg(lt, SO0, SO1));
      te = now; done = fatto || null;
    }
  };
}

window.Logo3D = { play: play };
})();
