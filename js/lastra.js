/* Nemesi Web 2.0 · «Dritto e rovescio» — la lastra.
   Three.js r147 classico (niente moduli: funziona anche aprendo il file dal disco).
   Un solo oggetto per tutto il film: una lastra nera laccata, a due strati, con il bordo arancio acceso
   come le facce laterali del marchio. Copione in «vh» di scorrimento (K); la pagina chiama set(p) e frame(). */
(function(){
'use strict';
var T = window.THREE, PI = Math.PI;

/* ── misure del mondo (unità della scena) ── */
var SCW = 3.1, SCH = SCW * 9 / 16;          // schermo 16:9
var BZ = 0.05;                               // cornice laccata intorno allo schermo
var CW = SCW + 2 * BZ, CH = SCH + 2 * BZ;    // faccia della lastra
var RB = 0.0085;                             // raggio dello spigolo (profilo)
var SW = CW + 2 * RB, SH = CH + 2 * RB;      // ingombro totale
var LT = 0.026;                              // spessore di uno strato
var RC = 0.072;                              // raggio degli angoli

/* ── copione (vh di scorrimento) ──
   KH è l'apertura: le aste fluttuano, compongono la lastra distesa e una riga di luce la salda.
   Tutto il resto (K) parte dopo, spostato in avanti di HO: dentro pose() si lavora con q = p - HO. */
var HO = 1.1;
var KH = { c0:.06, c1:.95, s0:.9, s1:1.12 };
var K = {
  cam0:.08, rise0:.14, rise1:1.25,           // la lastra distesa si alza: Rain Ink
  flip1a:1.95, flip1b:2.6,                   // rovescio: Olimp
  flip2a:3.3, flip2b:3.95,                   // mezzo giro: Parola
  split0:3.8, split1:4.55,                   // sdoppiamento: Foglio
  join0:5.4, join1:5.85,
  flip3a:5.75, flip3b:6.4,                   // Metal Gear
  cross0:7.1, cross1:7.82, rad:8.75,         // attraversamento, anelli, Radente
  fin0:9.45, fin1:10.45, end:11.0            // la lastra torna e mostra la faccia vuota
};
/* il copione visto dalla pagina: tempi assoluti (apertura compresa) */
var KX = { o:HO };
for (var kk in K) KX[kk] = K[kk] + HO;
for (var kh in KH) KX[kh] = KH[kh];

var COL = { nero:'#9AA0A8', arancio:'#F56F27', chiaro:'#FFA54D', oro:'#F9D377', scuro:'#EA4006', brace:'#C92C02', caldo:'#FFE3B0' };
function lin(h){ return new T.Color(h).convertSRGBToLinear(); }
function raw(h){ return new T.Color(h); }
function clamp(x, a, b){ return x < a ? a : x > b ? b : x; }
function mix(a, b, t){ return a + (b - a) * t; }
function seg(p, a, b){ return clamp((p - a) / (b - a), 0, 1); }
function io3(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function io2(t){ return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function settle(t, amt){ return io3(t) + amt * Math.sin(PI * clamp((t - .55) / .45, 0, 1)); }   // arrivo con un filo di assestamento
function damp(cur, target, lambda, dt){ return mix(cur, target, 1 - Math.exp(-lambda * dt)); }

/* ── geometria: lastra a bordo arrotondato con normali morbide ── */
function slabGeometry(w, h, t, rc, rb, rcs){                  // rcs: raggi diversi per angolo [alto-dx, alto-sx, basso-sx, basso-dx]
  var cs = 10, ps = 4, pts = [], prof = [], i, j;
  var hw = w / 2, hh = h / 2;
  var R4 = (rcs || [rc, rc, rc, rc]).map(function(v){ return Math.min(v, hw, hh); });
  var corners = [[hw - R4[0], hh - R4[0], 0], [-hw + R4[1], hh - R4[1], PI / 2], [-hw + R4[2], -hh + R4[2], PI], [hw - R4[3], -hh + R4[3], 3 * PI / 2]];
  for (var c = 0; c < 4; c++) for (i = 0; i <= cs; i++){
    var a = corners[c][2] + (i / cs) * (PI / 2), nx = Math.cos(a), ny = Math.sin(a), r = R4[c];
    pts.push([corners[c][0] + nx * r, corners[c][1] + ny * r, nx, ny]);
  }
  var hz = t / 2, b = Math.min(rb, hz);
  for (i = 0; i <= ps; i++){ var a1 = PI / 2 * (1 - i / ps); prof.push([Math.cos(a1) * b, hz - b + Math.sin(a1) * b, Math.cos(a1), Math.sin(a1)]); }
  for (i = 0; i <= ps; i++){ var a2 = -PI / 2 * (i / ps); prof.push([Math.cos(a2) * b, -hz + b + Math.sin(a2) * b, Math.cos(a2), Math.sin(a2)]); }
  var pos = [], nor = [], idx = [], n = pts.length, m = prof.length;
  for (i = 0; i < n; i++) for (j = 0; j < m; j++){
    var P = pts[i], Q = prof[j];
    pos.push(P[0] + P[2] * Q[0], P[1] + P[3] * Q[0], Q[1]);
    nor.push(P[2] * Q[2], P[3] * Q[2], Q[3]);
  }
  for (i = 0; i < n; i++){ var i2 = (i + 1) % n;
    for (j = 0; j < m - 1; j++){
      var v00 = i * m + j, v01 = i * m + j + 1, v10 = i2 * m + j, v11 = i2 * m + j + 1;
      idx.push(v00, v01, v10, v10, v01, v11);
    }
  }
  var base = pos.length / 3;                                  // tappo davanti
  pos.push(0, 0, hz); nor.push(0, 0, 1);
  for (i = 0; i < n; i++){ pos.push(pts[i][0], pts[i][1], hz); nor.push(0, 0, 1); }
  for (i = 0; i < n; i++) idx.push(base, base + 1 + i, base + 1 + (i + 1) % n);
  var base2 = pos.length / 3;                                 // tappo dietro
  pos.push(0, 0, -hz); nor.push(0, 0, -1);
  for (i = 0; i < n; i++){ pos.push(pts[i][0], pts[i][1], -hz); nor.push(0, 0, -1); }
  for (i = 0; i < n; i++) idx.push(base2, base2 + 1 + (i + 1) % n, base2 + 1 + i);
  var g = new T.BufferGeometry();
  g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}

/* ── shader comuni ── */
var SD = 'float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }\n' +
         'float hash2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }\n';
var VS_PLANE = 'varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;\n' +
  'void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; vWN = normalize(mat3(modelMatrix) * normal);\n' +
  ' gl_Position = projectionMatrix * viewMatrix * wp; }';

/* schermo: immagine (o faccia vuota), accensione con una barra di luce, vetro, alone al passaggio, pixel che si sbriciolano */
var FS_SCREEN = [
  'uniform sampler2D uMap; uniform vec2 uSize; uniform float uRad;',
  'uniform float uReveal, uHover, uDim, uPix, uEmpty, uGlow, uTime, uSeed, uFogD, uCut;',
  'uniform vec3 uOr, uGold, uHot;',
  'varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;', SD,
  'void main(){',
  '  vec2 p = (vUv - 0.5) * uSize;',
  '  float d = sdBox(p, uSize * 0.5, uRad);',
  '  if (d > 0.0) discard;',
  '  if (p.y < uCut) discard;',                                  /* saldatura dell'apertura: la lastra c'è solo dove è già passata la luce */
  '  vec3 img = texture2D(uMap, vUv).rgb;',
  '  float emb = 0.0;',
  '  if (uPix > 0.001){',
  /* griglia fissa sulla faccia (le tessere crescono solo perché la camera si avvicina);
     il buco si apre dal centro, dove passa la camera, e i bordi del buco bruciano d'arancio */
  '    vec2 cells = vec2(96.0, 54.0);',
  '    vec2 c = floor(vUv * cells);',
  '    vec2 q = ((c + 0.5) / cells - 0.5) * uSize / (uSize * 0.5 + 0.06);',
  '    float v = length(q) * 0.7071 * 0.78 + hash2(c + uSeed) * 0.22;',
  '    float thr = uPix * 1.08 - 0.04;',
  '    if (v < thr) discard;',
  '    emb = 1.0 - smoothstep(0.0, 0.06, v - thr);',
  '    img = mix(img, texture2D(uMap, (c + 0.5) / cells).rgb, smoothstep(0.0, 0.22, uPix)) * (1.0 - 0.5 * uPix);',
  '  }',
  '  vec3 emp = vec3(0.026, 0.026, 0.031) + vec3(0.030, 0.016, 0.010) * (1.0 - smoothstep(0.0, 0.75, length(p / uSize)));',
  '  float inner = exp(-pow((d + 0.085) / 0.0045, 2.0));',
  '  emp += uOr * inner * 0.75 * uGlow + uOr * exp(d / 0.09) * 0.16 * uGlow;',
  '  img = mix(img, emp, uEmpty);',
  '  float y = 1.0 - vUv.y;',
  '  float fr = uReveal * 1.2 - 0.1;',
  '  float on = mix(smoothstep(fr + 0.006, fr - 0.006, y), 1.0, uEmpty);',
  '  vec3 col = mix(vec3(0.020, 0.020, 0.024), img, on);',
  '  float act = step(0.001, uReveal) * step(uReveal, 0.999) * (1.0 - uEmpty);',
  '  col += uHot * exp(-pow((y - fr) / 0.008, 2.0)) * 0.95 * act;',
  '  col += uOr * exp(-pow((y - fr) / 0.07, 2.0)) * 0.20 * act * on;',
  '  vec3 V = normalize(cameraPosition - vWP);',
  '  float g = dot(normalize(vWN), V);',
  '  float band = vUv.x * 0.8 + vUv.y * 0.45 - (0.1 + (1.0 - g) * 2.2);',
  '  col += vec3(1.0, 0.96, 0.92) * smoothstep(0.32, 0.0, abs(band)) * 0.045;',
  '  float rim = smoothstep(-0.07, 0.0, d);',
  '  col += uOr * rim * uHover * 0.55;',
  '  col = mix(col, mix(uOr, uGold, emb * emb * 0.6), emb * 0.9);',
  '  col *= 1.0 - uDim;',
  '  float dist = length(cameraPosition - vWP);',
  '  col = mix(col, vec3(0.604, 0.627, 0.659), 1.0 - exp(-pow(uFogD * dist, 2.0)));',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'].join('\n');

/* alone al passaggio del puntatore (fuori dalla sagoma della lastra) */
var FS_NEON = [
  'uniform vec2 uSz, uHalf; uniform float uR, uI; uniform vec3 uOr, uGold;',
  'varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;', SD,
  'void main(){',
  '  vec2 p = (vUv - 0.5) * uSz;',
  '  float d = sdBox(p, uHalf, uR);',
  '  if (d < 0.0) discard;',
  '  float g = exp(-d / 0.028) * 0.8 + exp(-d / 0.12) * 0.36 + exp(-d / 0.36) * 0.12;',
  '  g *= 1.0 - smoothstep(0.55, 1.4, d);',                       /* si spegne del tutto prima del bordo del piano */
  '  vec3 col = mix(uOr, uGold, exp(-d / 0.018) * 0.7) * g;',
  '  gl_FragColor = vec4(col * uI, 1.0);',
  '}'].join('\n');

/* riga di luce dell'apertura: nucleo, alone e una scia anamorfica orizzontale */
var FS_LINE = [
  'uniform vec2 uSz; uniform float uI, uHalf; uniform vec3 uOr, uGold;',
  'varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;',
  'void main(){',
  '  vec2 p = (vUv - 0.5) * uSz; float ax = abs(p.x);',
  '  float inside = 1.0 - smoothstep(uHalf * 0.9, uHalf * 1.03, ax);',
  '  float core = exp(-pow(p.y / 0.02, 2.0)) * inside;',
  '  float halo = exp(-pow(p.y / 0.17, 2.0)) * exp(-pow(ax / (uHalf * 1.08), 4.0)) * 0.30;',
  '  float streak = exp(-pow(p.y / 0.007, 2.0)) * exp(-ax / 2.4) * 0.55;',
  '  vec3 col = uOr * (halo + streak) + uGold * core * 0.40;',
  '  gl_FragColor = vec4(col * uI, 1.0);',
  '}'].join('\n');

/* calore sullo sfondo: alone morbido dietro la lastra */
var FS_HALO = [
  'uniform vec2 uSz; uniform float uI; uniform vec3 uOr;',
  'varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;',
  'void main(){ vec2 p = (vUv - 0.5) * uSz; float g = exp(-dot(p * vec2(0.66, 1.0), p * vec2(0.66, 1.0)) / 4.2);',
  '  gl_FragColor = vec4(uOr * g * 0.06 * uI, 1.0); }'].join('\n');

/* anelli di luce (i cerchi di Radente) */
var VS_RING = 'varying vec3 vOP; varying vec3 vWN; varying vec3 vWP;\n' +
  'void main(){ vOP = position; vec4 wp = modelMatrix * vec4(position, 1.0); vWP = wp.xyz; vWN = normalize(mat3(modelMatrix) * normal);\n' +
  ' gl_Position = projectionMatrix * viewMatrix * wp; }';
var FS_RING = [
  'uniform float uI, uFogD; uniform vec3 uOr, uGold, uDeep;',
  'varying vec3 vOP; varying vec3 vWN; varying vec3 vWP;',
  'void main(){',
  '  float a = atan(vOP.y, vOP.x);',
  '  float up = 0.5 + 0.5 * sin(a);',
  '  vec3 col = mix(uDeep, uOr, smoothstep(0.0, 0.6, up));',
  '  col = mix(col, uGold, smoothstep(0.7, 1.0, up));',
  '  vec3 V = normalize(cameraPosition - vWP);',
  '  col *= 0.75 + 0.6 * pow(1.0 - abs(dot(normalize(vWN), V)), 2.0);',
  '  float dist = length(cameraPosition - vWP);',
  '  col *= exp(-pow(uFogD * dist, 2.0));',
  '  gl_FragColor = vec4(col * uI, 1.0);',
  '}'].join('\n');
var FS_RINGHALO = [
  'uniform vec2 uSz; uniform float uR, uI, uFogD; uniform vec3 uOr;',
  'varying vec2 vUv; varying vec3 vWN; varying vec3 vWP;',
  'void main(){ vec2 p = (vUv - 0.5) * uSz; float d = abs(length(p) - uR);',
  '  float g = exp(-d / 0.035) * 0.42 + exp(-d / 0.16) * 0.16;',
  '  float dist = length(cameraPosition - vWP);',
  '  gl_FragColor = vec4(uOr * g * uI * exp(-pow(uFogD * dist, 2.0)), 1.0); }'].join('\n');

/* pulviscolo: profondità durante i viaggi */
var VS_DUST = [
  'attribute float aS; uniform float uTime, uPx, uMax; varying float vA;',
  'void main(){ vec3 p = position; p.y += sin(uTime * 0.13 + aS * 23.0) * 0.06; p.x += cos(uTime * 0.11 + aS * 17.0) * 0.05;',
  '  vec4 mv = modelViewMatrix * vec4(p, 1.0); float dz = -mv.z;',
  '  gl_PointSize = min(uPx * (0.35 + aS) / max(dz, 0.1), uMax);',
  '  vA = smoothstep(0.5, 2.4, dz) * (1.0 - smoothstep(12.0, 24.0, dz)) * (0.35 + 0.65 * aS);',
  '  gl_Position = projectionMatrix * mv; }'].join('\n');
var FS_DUST = [
  'uniform vec3 uCol; uniform float uI; varying float vA;',
  'void main(){ vec2 q = gl_PointCoord - 0.5; float r = dot(q, q); if (r > 0.25) discard;',
  '  gl_FragColor = vec4(uCol * smoothstep(0.25, 0.0, r) * vA * uI, 1.0); }'].join('\n');

function glowMat(fs, uniforms){
  return new T.ShaderMaterial({ vertexShader: VS_PLANE, fragmentShader: fs, uniforms: uniforms,
    transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false,
    side: T.DoubleSide });                                  // anche da dietro: dopo i mezzi giri l'alone si guarda dal retro del piano
}

/* ── corpo laccato: faccia nera lucida, bordo arancio acceso con una luce che gli corre intorno ── */
function bodyMaterial(env){
  var m = new T.MeshPhysicalMaterial({ color: lin('#09090B'), roughness: .3, metalness: 0, clearcoat: 1, clearcoatRoughness: .07,
    envMap: env, envMapIntensity: 1 });
  var u = { uEdge:{value:1}, uHover:{value:0}, uPix:{value:0}, uCell:{value:SCW / 96}, uTime:{value:0}, uRun:{value:1},
    uDeep:{value:lin(COL.brace)}, uMid:{value:lin(COL.arancio)}, uGold:{value:lin(COL.oro)}, uHot:{value:lin(COL.caldo)},
    uHalfW:{value:SW / 2}, uHalfH:{value:SH / 2}, uCut:{value:-1e4}, uCap:{value:new T.Vector3(CW / 2, CH / 2, RC)} };
  m.userData.u = u;
  m.onBeforeCompile = function(sh){
    for (var k in u) sh.uniforms[k] = u[k];
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjN; varying vec3 vObjP; varying vec3 vWN2; varying vec3 vAX; varying vec3 vAY;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvObjN = objectNormal; vWN2 = normalize(mat3(modelMatrix) * objectNormal);\n' +
        'vAX = normalize(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0)); vAY = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjP = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vObjN; varying vec3 vObjP; varying vec3 vWN2; varying vec3 vAX; varying vec3 vAY;\n' +
        'uniform float uEdge, uHover, uPix, uCell, uTime, uRun, uHalfW, uHalfH, uCut; uniform vec3 uDeep, uMid, uGold, uHot, uCap;\n' +
        'float hh1(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' +
        'if (vObjP.y < uCut) discard;\n' +
        'float pE = 0.0;\n' +
        'if (uPix > 0.001){ vec2 cc = floor(vObjP.xy / uCell); float pv = length(vObjP.xy / vec2(uHalfW, uHalfH)) * 0.7071 * 0.78 + hh1(cc) * 0.22;\n' +
        '  float pt = uPix * 1.08 - 0.04; if (pv < pt) discard; pE = 1.0 - smoothstep(0.0, 0.06, pv - pt); }')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' +
        'float side = smoothstep(0.16, 0.92, 1.0 - abs(normalize(vObjN).z));\n' +
        /* filo nitido sul bordo del tappo, largo un pixel a qualunque distanza: di fronte lo spigolo è più sottile
           di un pixel e da solo si vedrebbe sgranato */
        'float capF = smoothstep(0.02, 0.0, 1.0 - abs(normalize(vObjN).z));\n' +
        'vec2 cq = abs(vObjP.xy) - uCap.xy + uCap.z;\n' +
        'float cd = length(max(cq, 0.0)) + min(max(cq.x, cq.y), 0.0) - uCap.z;\n' +
        'float cw = max(fwidth(cd), 1e-5);\n' +
        'float rimL = smoothstep(-1.7 * cw, -0.5 * cw, cd) * capF;\n' +
        'float bev = smoothstep(0.0, 0.03, 1.0 - abs(normalize(vObjN).z));\n' +   // l'inizio dello spigolo, perché il filo non si sdoppi
        'rimL = max(rimL, bev);\n' +
        'vec2 on2 = (cq.x > 0.0 && cq.y > 0.0) ? normalize(cq) : (cq.x > cq.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));\n' +
        'on2 *= vec2(vObjP.x < 0.0 ? -1.0 : 1.0, vObjP.y < 0.0 ? -1.0 : 1.0);\n' +
        'vec3 nB = normalize(mix(normalize(vWN2), normalize(vAX * on2.x + vAY * on2.y), rimL));\n' +
        'float bl = dot(nB, normalize(vec3(-0.34, 0.56, 0.76)));\n' +
        'vec3 ec = mix(uDeep, uMid, smoothstep(-0.75, 0.15, bl));\n' +
        'ec = mix(ec, uGold, smoothstep(0.35, 0.97, bl));\n' +
        'float ang = atan(vObjP.y / uHalfH, vObjP.x / uHalfW);\n' +
        'float dA = abs(mod(ang - uTime * 0.42 + 3.14159, 6.28318) - 3.14159);\n' +
        'ec += uHot * exp(-dA * dA / 0.045) * 0.5 * uRun;\n' +
        'ec = mix(ec, uHot, uHover * 0.3);\n' +
        'totalEmissiveRadiance += ec * max(side, rimL * 0.55) * uEdge * (1.0 + uHover * 0.9);\n' +
        'totalEmissiveRadiance += mix(uMid, uGold, pE * pE * 0.6) * pE * 1.3;');
  };
  return m;
}

function screenMaterial(seed){
  return new T.ShaderMaterial({ vertexShader: VS_PLANE, fragmentShader: FS_SCREEN, toneMapped: false,
    polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    uniforms: { uMap:{value:null}, uSize:{value:new T.Vector2(SCW, SCH)}, uRad:{value:.024},
      uReveal:{value:0}, uHover:{value:0}, uDim:{value:0}, uPix:{value:0}, uEmpty:{value:0}, uGlow:{value:0},
      uTime:{value:0}, uSeed:{value:seed}, uFogD:{value:.032}, uCut:{value:-1e4},
      uOr:{value:raw(COL.arancio)}, uGold:{value:raw(COL.oro)}, uHot:{value:raw(COL.caldo)} } });
}

/* ── aste dell'apertura: stessa lacca della lastra, fianchi arancio e una luce che scorre lungo ognuna ── */
function stickMaterial(env, halfL, spd, ph, halfH, r4){
  var m = new T.MeshPhysicalMaterial({ color: lin('#0A0A0C'), roughness: .28, metalness: 0, clearcoat: 1, clearcoatRoughness: .06,
    envMap: env, envMapIntensity: 1.15 });
  var u = { uEdge:{value:0}, uFlash:{value:0}, uTime:{value:0}, uHalfL:{value:halfL}, uSpd:{value:spd}, uPh:{value:ph},
    uHalfH:{value:halfH}, uR4:{value:new T.Vector4(r4[0], r4[1], r4[2], r4[3])},
    uCutN:{value:new T.Vector3(0, 0, -1)}, uCutD:{value:1e4},
    uDeep:{value:lin(COL.brace)}, uMid:{value:lin(COL.arancio)}, uGold:{value:lin(COL.oro)}, uHot:{value:lin(COL.caldo)} };
  m.userData.u = u;
  m.onBeforeCompile = function(sh){
    for (var k in u) sh.uniforms[k] = u[k];
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSN; varying vec3 vSP; varying vec3 vSWN; varying vec3 vSWP; varying vec3 vAX; varying vec3 vAY;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvSN = objectNormal; vSWN = normalize(mat3(modelMatrix) * objectNormal);\n' +
        'vAX = normalize(mat3(modelMatrix) * vec3(1.0, 0.0, 0.0)); vAY = normalize(mat3(modelMatrix) * vec3(0.0, 1.0, 0.0));')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSP = position; vSWP = (modelMatrix * vec4(position, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSN; varying vec3 vSP; varying vec3 vSWN; varying vec3 vSWP; varying vec3 vAX; varying vec3 vAY;\n' +
        'uniform float uEdge, uFlash, uTime, uHalfL, uHalfH, uSpd, uPh, uCutD; uniform vec4 uR4; uniform vec3 uCutN, uDeep, uMid, uGold, uHot;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n' +
        'if (dot(uCutN, vSWP) > uCutD) discard;')                    // dove è passata la luce resta la lastra vera
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n' +
        'float side = smoothstep(0.16, 0.92, 1.0 - abs(normalize(vSN).z));\n' +
        'float bl = dot(normalize(vSWN), normalize(vec3(-0.34, 0.56, 0.76)));\n' +
        'vec3 ec = mix(uDeep, uMid, smoothstep(-0.75, 0.15, bl));\n' +
        'ec = mix(ec, uGold, 0.45 * smoothstep(0.45, 0.97, bl));\n' +
        'float s = vSP.x / uHalfL * 0.5 + 0.5;\n' +
        'float c = fract(uTime * uSpd + uPh) * 1.9 - 0.45;\n' +
        'float run = exp(-pow((s - c) / 0.06, 2.0));\n' +
        'totalEmissiveRadiance += (ec * 0.5 + uHot * run * 0.7) * side * uEdge;\n' +
        /* filo di luce sul piano nero: il bordo della faccia che guarda la luce chiave, nitido a un pixel */
        'float capF = smoothstep(0.02, 0.0, 1.0 - abs(normalize(vSN).z));\n' +
        'float cr = vSP.x > 0.0 ? (vSP.y > 0.0 ? uR4.x : uR4.w) : (vSP.y > 0.0 ? uR4.y : uR4.z);\n' +
        'vec2 cq = abs(vSP.xy) - vec2(uHalfL, uHalfH) + cr;\n' +
        'float cd = length(max(cq, 0.0)) + min(max(cq.x, cq.y), 0.0) - cr;\n' +
        'float cw = max(fwidth(cd), 1e-5);\n' +
        'float rimL = smoothstep(-2.2 * cw, -0.6 * cw, cd) * capF;\n' +
        'vec2 on2 = (cq.x > 0.0 && cq.y > 0.0) ? normalize(cq) : (cq.x > cq.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));\n' +
        'on2 *= vec2(vSP.x < 0.0 ? -1.0 : 1.0, vSP.y < 0.0 ? -1.0 : 1.0);\n' +
        'float lk = smoothstep(-0.05, 0.7, dot(normalize(vAX * on2.x + vAY * on2.y), normalize(vec3(-0.34, 0.56, 0.76))));\n' +
        'totalEmissiveRadiance += vec3(1.0, 0.86, 0.72) * rimL * (0.03 + 0.2 * lk + run * 0.3) * uEdge;\n' +
        'totalEmissiveRadiance += mix(uMid, uGold, 0.45) * uFlash * (side * 1.5 + 0.1);');
  };
  return m;
}

/* ═════════════════════════════ scena ═════════════════════════════ */
function create(canvas, opts){
  opts = opts || {};
  var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.NoToneMapping;
  renderer.setClearColor(new T.Color(COL.nero), 1);
  var DPRMAX = Math.min(window.devicePixelRatio || 1, 2), dpr = DPRMAX;
  renderer.setPixelRatio(dpr);

  var scene = new T.Scene();
  scene.fog = new T.FogExp2(lin(COL.nero), .03);
  var camera = new T.PerspectiveCamera(30, 1, .04, 160);
  /* studio buio con tre luci a striscia: la lacca resta nera di fronte e accende riflessi solo quando la lastra gira */
  function studio(){
    var s = new T.Scene();
    s.add(new T.Mesh(new T.BoxGeometry(40, 40, 40), new T.MeshBasicMaterial({ color: 0x000000, side: T.BackSide })));
    function panel(w, h, x, y, z, rx, ry, col, k){
      var m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k), side: T.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
    }
    panel(16, 2.4, 0, 10, 3, PI / 2, 0, '#ffffff', 2.4);          // striscia alta
    panel(2.6, 14, -11, 1.5, 2, 0, PI / 2, '#ffe2c4', 1.3);        // striscia calda a sinistra
    panel(2, 12, 11, .5, -3, 0, -PI / 2, '#dfe3ff', .8);           // striscia fredda a destra
    panel(12, 3, 0, -10, 5, -PI / 2, 0, '#F56F27', .45);           // riflesso arancio dal basso
    var pm = new T.PMREMGenerator(renderer), tx = pm.fromScene(s, .015).texture; pm.dispose();
    return tx;
  }
  var env = studio();

  /* lastra: due strati incollati */
  var gLayer = slabGeometry(CW, CH, LT, RC, RB);
  var gScreen = new T.PlaneGeometry(SCW, SCH);
  var G = new T.Group(); scene.add(G);
  function layer(seedA, seedB, withIn){
    var o = new T.Group(), mat = bodyMaterial(env), body = new T.Mesh(gLayer, mat);
    o.add(body);
    var front = new T.Mesh(gScreen, screenMaterial(seedA)); front.position.z = LT / 2 + .0007; o.add(front);
    var back = new T.Mesh(gScreen, screenMaterial(seedB)); back.position.z = -LT / 2 - .0007; back.rotation.y = PI; o.add(back);
    var neon = new T.Mesh(new T.PlaneGeometry(SW + 3, SH + 3), glowMat(FS_NEON, {
      uSz:{value:new T.Vector2(SW + 3, SH + 3)}, uHalf:{value:new T.Vector2(SW / 2, SH / 2)}, uR:{value:RC + RB},
      uI:{value:0}, uOr:{value:raw(COL.arancio)}, uGold:{value:raw(COL.oro)} }));
    neon.renderOrder = 5; o.add(neon);
    return { o:o, body:body, mat:mat, front:front, back:back, neon:neon, hover:0 };
  }
  var L1 = layer(1.3, 2.1), L2 = layer(3.7, 4.9);
  L1.o.position.z = LT / 2; L2.o.position.z = -LT / 2;
  G.add(L1.o); G.add(L2.o);
  // facce: A = davanti dello strato 1, B = dietro dello strato 2, IN = faccia interna dello strato 2 (si vede allo sdoppiamento)
  var FA = L1.front, FB = L2.back, FIN = L2.front;
  L1.back.visible = false;

  /* Radente: una seconda lastra in fondo alla profondità */
  var R = layer(5.1, 6.3); R.back.visible = false; scene.add(R.o);
  var gThick = slabGeometry(CW, CH, LT * 2, RC, RB); R.body.geometry = gThick;
  R.front.position.z = LT + .0007;

  /* riga di luce dell'apertura */
  var lineU = { uSz:{value:new T.Vector2(16, 1.4)}, uI:{value:1}, uHalf:{value:SW / 2}, uOr:{value:raw(COL.arancio)}, uGold:{value:raw(COL.oro)} };
  var line = new T.Mesh(new T.PlaneGeometry(16, 1.4), glowMat(FS_LINE, lineU)); line.renderOrder = 6; scene.add(line);
  /* calore dietro la lastra */
  var haloU = { uSz:{value:new T.Vector2(18, 11)}, uI:{value:1}, uOr:{value:raw(COL.arancio)} };
  var halo = new T.Mesh(new T.PlaneGeometry(18, 11), glowMat(FS_HALO, haloU)); halo.renderOrder = -1; scene.add(halo);

  /* anelli */
  var rings = [], gRing = new T.TorusGeometry(1, .013, 12, 220);
  function ring(){
    var u = { uI:{value:0}, uFogD:{value:.03}, uOr:{value:raw(COL.arancio)}, uGold:{value:raw(COL.oro)}, uDeep:{value:raw(COL.brace)} };
    var m = new T.Mesh(gRing, new T.ShaderMaterial({ vertexShader: VS_RING, fragmentShader: FS_RING, uniforms: u, toneMapped: false }));
    var hu = { uSz:{value:new T.Vector2(3, 3)}, uR:{value:1}, uI:{value:0}, uFogD:{value:.03}, uOr:{value:raw(COL.arancio)} };
    var h = new T.Mesh(new T.PlaneGeometry(3, 3), glowMat(FS_RINGHALO, hu)); h.renderOrder = 4;
    var g = new T.Group(); g.add(m); g.add(h); scene.add(g);
    var r = { g:g, m:m, h:h, u:u, hu:hu, z:0 }; rings.push(r); return r;
  }
  for (var ri = 0; ri < 5; ri++) ring();

  /* pulviscolo */
  var NDUST = 700, dp = new Float32Array(NDUST * 3), ds = new Float32Array(NDUST), rnd = 7;
  function rand(){ rnd = (rnd * 16807) % 2147483647; return (rnd - 1) / 2147483646; }
  for (var di = 0; di < NDUST; di++){ dp[di * 3] = (rand() - .5) * 15; dp[di * 3 + 1] = (rand() - .5) * 9; dp[di * 3 + 2] = 9 - rand() * 36; ds[di] = rand(); }
  var gd = new T.BufferGeometry(); gd.setAttribute('position', new T.BufferAttribute(dp, 3)); gd.setAttribute('aS', new T.BufferAttribute(ds, 1));
  var dustU = { uTime:{value:0}, uPx:{value:30}, uMax:{value:4}, uCol:{value:raw('#FFDDBB')}, uI:{value:.3} };
  var dust = new T.Points(gd, new T.ShaderMaterial({ vertexShader: VS_DUST, fragmentShader: FS_DUST, uniforms: dustU,
    transparent: true, blending: T.AdditiveBlending, depthWrite: false, toneMapped: false }));
  dust.frustumCulled = false; scene.add(dust);

  /* aste dell'apertura: la lastra tagliata in file di pezzi sfalsati, come mattoni.
     All'inizio è una vista esplosa: le file stanno una sopra l'altra sopra la lastra, con i pezzi un po' staccati,
     e ogni piano gira avanti e indietro con il suo ritmo (una scultura cinetica, sempre in movimento).
     Scorrendo, fila dopo fila dal basso, il piano si ferma, i pezzi si chiudono e la fila scende al suo posto
     sulla lastra distesa (prima quella in fondo, ultima quella davanti a chi guarda).
     Poi una riga di luce le salda e resta la lastra vera. */
  var ROWS = 12, GAP = .02, DUR = .3, AL0 = .42;
  var STK = new T.Group(); scene.add(STK);
  var sticks = [], levels = [];
  (function(){
    var r = 11, rh = CH / ROWS, prev = [], j, k2;
    function rr(){ r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; }
    for (j = 0; j < ROWS; j++){
      var cuts, tries = 0;
      do {
        cuts = rr() < .5 ? [mix(.3, .7, rr())] : [mix(.17, .4, rr()), mix(.6, .83, rr())];
        tries++;
      } while (tries < 40 && cuts.some(function(c){ return prev.some(function(q){ return Math.abs(c - q) < .09; }); }));
      prev = cuts;
      levels.push({ bob:rr() * 6.28 });
      var xs = [0].concat(cuts, [1]);
      for (k2 = 0; k2 < xs.length - 1; k2++){
        var first = k2 === 0, last = k2 === xs.length - 2, top = j === 0, bot = j === ROWS - 1;
        var x0 = -CW / 2 + xs[k2] * CW + (first ? 0 : GAP / 2), x1 = -CW / 2 + xs[k2 + 1] * CW - (last ? 0 : GAP / 2);
        var y1 = CH / 2 - j * rh - (top ? 0 : GAP / 2), y0 = CH / 2 - (j + 1) * rh + (bot ? 0 : GAP / 2);
        var w = x1 - x0, rs = .014;
        var r4 = [top && last ? RC : rs, top && first ? RC : rs, bot && first ? RC : rs, bot && last ? RC : rs];
        var geo = slabGeometry(w, y1 - y0, LT * 2, rs, RB, r4);
        var mat = stickMaterial(env, w / 2, .045 + .07 * rr(), rr(), (y1 - y0) / 2, r4.map(function(v){ return Math.min(v, w / 2, (y1 - y0) / 2); }));
        var mesh = new T.Mesh(geo, mat); STK.add(mesh);
        sticks.push({ m:mesh, u:mat.userData.u, row:j, lx:(x0 + x1) / 2, ly:(y0 + y1) / 2, ign:rr() * .6, ph:rr() * 6.28,
          a:KH.c0 + j / (ROWS - 1) * (KH.c1 - DUR - KH.c0 - .03) + k2 * .012 });
      }
    }
  })();
  var CL = { y0:.3, dh:.19, sp:1.16 };
  var qY = new T.Quaternion(), qX = new T.Quaternion(), AY = new T.Vector3(0, 1, 0), AX = new T.Vector3(1, 0, 0),
      pS = new T.Vector3(), nY = new T.Vector3(), nZ = new T.Vector3();
  function smooth01(x){ return x * x * (3 - 2 * x); }
  function poseSticks(P, t, cutY){
    var vis = P < KH.s1 + .002;
    STK.visible = vis; if (!vis) return;
    G.updateMatrixWorld(true);
    nY.set(0, 1, 0).applyQuaternion(G.quaternion); nZ.set(0, 0, 1).applyQuaternion(G.quaternion);
    var cutD = cutY > 1e3 ? 1e4 : nY.dot(G.position) + cutY;
    for (var i = 0; i < sticks.length; i++){
      var s = sticks[i], lv = levels[s.row], k = seg(P, s.a, s.a + DUR);
      var er = io3(seg(k, 0, .5)), eh = io3(seg(k, .2, 1)), ex = smooth01(seg(k, .75, 1));
      /* piani della vista esplosa: un'onda di torsione sale lungo la torre (mai oltre mezzo giro, così tornare dritti
         è sempre la strada breve); fermandosi il piano torna dritto e i pezzi si chiudono */
      var phi = (Math.sin(2 * PI * t / 27 - .4 * s.row) + .35 * Math.sin(2 * PI * t / 11.5 + .9 * s.row + 1) + S.ptrS.x * .3) * (1 - er);
      var sp = mix(CL.sp, 1, er), xr = s.lx * sp;
      var h = mix(CL.y0 + s.row * CL.dh + .035 * Math.sin(t * .6 + lv.bob), 0, eh);
      s.m.position.set(xr * Math.cos(phi), h, -xr * Math.sin(phi) - s.ly * eh);
      /* e un'onda di rollio: i piani si inclinano uno dopo l'altro e la lacca prende la luce a turno */
      var roll = (.34 * Math.sin(2 * PI * t / 17 - .55 * s.row) + .06 * Math.sin(t * .9 + s.ph)) * (1 - er);
      qY.setFromAxisAngle(AY, phi); qX.setFromAxisAngle(AX, -PI / 2 + roll);
      s.m.quaternion.copy(qY).multiply(qX);
      if (ex > 0){                                                  // ultimo tratto: esattamente al suo posto sulla lastra
        pS.set(s.lx, s.ly, 0).applyMatrix4(G.matrixWorld);
        s.m.position.lerp(pS, ex); s.m.quaternion.slerp(G.quaternion, ex);
      }
      s.u.uTime.value = t;
      s.u.uEdge.value = clamp(S.ign * 1.6 - s.ign, 0, 1);
      s.u.uFlash.value = .85 * Math.exp(-Math.pow((P - s.a - DUR) / .035, 2));
      s.u.uCutN.value.copy(nY); s.u.uCutD.value = cutD;
    }
  }

  /* immagini dei lavori */
  var tex = [], EMPTY = new T.DataTexture(new Uint8Array([8, 8, 10, 255]), 1, 1); EMPTY.needsUpdate = true;
  function load(urls, onProgress){
    var done = 0, aniso = renderer.capabilities.getMaxAnisotropy();
    return Promise.all(urls.map(function(u, i){
      return new Promise(function(res){
        function fine(){ done++; if (onProgress) onProgress(done / urls.length); res(); }
        function prova(n){                                          // una connessione persa non lascia la faccia vuota: si riprova
          new T.TextureLoader().load(u, function(t){
            t.anisotropy = Math.min(8, aniso); t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true;
            tex[i] = t; renderer.initTexture(t); fine();
          }, undefined, function(){ if (n < 2) setTimeout(function(){ prova(n + 1); }, 500 * (n + 1)); else { tex[i] = EMPTY; fine(); } });
        }
        prova(0);
      });
    })).then(function(){ renderer.compile(scene, camera); });
  }

  /* ── impaginazione: dove deve stare la lastra sullo schermo (in pixel), tradotta in distanze ── */
  var W = 1, H = 1, L = null, TAN = Math.tan(15 * PI / 180);
  function ppu(dist){ return H / (2 * dist * TAN); }                 // pixel per unità alla distanza data
  function distFor(len, px){ return len * H / (2 * TAN * px); }
  function layout(){
    var P = W / H < 1.0, l = { portrait:P };
    if (!P){
      var side = Math.max(40, W * .05);
      l.slabPx = Math.min(.52 * W, .48 * H * SW / SH);
      l.stage = { x: .5 * W, y: .6 * H };
      l.linePx = Math.min(.42 * W, 640);
      l.line = { x: .5 * W, y: .665 * H };
      l.finPx = Math.min(.62 * W, .62 * H * SW / SH);
      l.fin = { x: .5 * W, y: .52 * H };
      var gap = Math.max(28, .025 * W);
      side = Math.max(side, W * .07);
      l.appPx = Math.min(l.slabPx * .9, (W - 2 * side - gap) / 2);
      l.appGap = gap;
    } else {
      l.slabPx = Math.min(W - 40, 640);
      l.stage = { x: .5 * W, y: .57 * H };
      l.linePx = Math.min(.76 * W, 560);
      l.line = { x: .5 * W, y: .62 * H };
      l.finPx = Math.min(.64 * H, (W - 32) * SW / SH);            // lastra girata in verticale: il lato lungo va in altezza
      l.fin = { x: .5 * W, y: .54 * H };
      l.appPx = Math.min(l.slabPx * .94, (H * .5 - 56) * SW / SH / 2 * 2);
      l.appGap = 52;
    }
    l.dStage = distFor(SW, l.slabPx);
    /* apertura: la lastra distesa al centro, vista dall'alto; le aste le girano intorno */
    l.heroPx = P ? Math.min(.8 * W, 520) : Math.min(.4 * W, 600);
    l.hero = { x: .5 * W, y: (P ? .7 : .74) * H };                   // la lastra distesa in basso, la torre delle file sopra
    l.dHero = distFor(SW, l.heroPx);
    l.dFin = distFor(SW, l.finPx);
    l.dApp = distFor(SW, l.appPx);
    l.zr = l.dApp - l.dStage;
    if (!P){ l.ox = (l.appPx / 2 + l.appGap / 2) / ppu(l.dApp); l.oy = 0; }
    else { var lh = l.appPx * SH / SW; l.ox = 0; l.oy = (lh / 2 + l.appGap / 2) / ppu(l.dApp); }
    l.z1 = -.6;                                                     // subito dopo l'attraversamento
    l.zEnd = -9.2;                                                  // camera davanti a Radente
    l.zR = l.zEnd - l.dStage;
    l.shiftHero = { x: l.hero.x - W / 2, y: l.hero.y - H / 2 };
    /* vista esplosa: sul telefono i piani sono più distanti (c'è altezza) e i pezzi meno staccati (c'è poca larghezza) */
    CL.y0 = .3; CL.dh = P ? .32 : .19; CL.sp = P ? 1.05 : 1.16;
    l.shiftStage = { x: l.stage.x - W / 2, y: l.stage.y - H / 2 };
    l.shiftFin = { x: l.fin.x - W / 2, y: l.fin.y - H / 2 };
    return l;
  }
  function ringOff(u){ var e = Math.sin(PI * u); return { x: .62 * e * Math.sin(2.1 * PI * u), y: .3 * e * Math.sin(1.5 * PI * u + .7) }; }
  var RU = [.15, .36, .57, .78];
  function placeStatic(){
    R.o.position.set(0, 0, L.zR);
    for (var i = 0; i < 4; i++){
      var r = rings[i], o = ringOff(RU[i]);
      r.g.position.set(o.x, o.y, mix(L.z1, L.zEnd, RU[i]));
      r.g.scale.setScalar(.56 + i * .03);
      r.hu.uR.value = 1;
    }
    var rr = rings[4]; rr.g.position.set(0, 0, L.zR - .02); rr.g.scale.setScalar(2.08);
  }
  function resize(){
    W = Math.max(1, canvas.clientWidth || innerWidth); H = Math.max(1, canvas.clientHeight || innerHeight);
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    camera.aspect = W / H;
    L = layout(); placeStatic();
    dustU.uPx.value = 22 * dpr * (H / 900); dustU.uMax.value = 3.2 * dpr;
  }

  /* ── stato ── */
  var S = { p:0, ign:1, hov:[0,0,0,0,0,0], hovT:[0,0,0,0,0,0], ptr:{x:0, y:0}, ptrS:{x:0, y:0}, t:0, faces:{} };
  var CAM = { z:0, x:0, y:0, tx:0, ty:0, tz:-10, sx:0, sy:0 };

  function camZ(p){
    var zH = L.dHero, zS = L.dStage;
    if (p <= K.rise1) return mix(zH, zS, io2(seg(p, K.cam0, K.rise1)));
    if (p <= K.cross0) return zS - .16 * seg(p, K.rise1, K.cross0);
    if (p <= K.cross1){ var u = seg(p, K.cross0, K.cross1); return mix(zS - .16, L.z1, u * u); }
    if (p <= K.rad){ var v = seg(p, K.cross1, K.rad); return mix(L.z1, L.zEnd, 1 - (1 - v) * (1 - v)); }
    return L.zEnd - .32 * seg(p, K.rad, K.end);
  }

  function pose(P, t){
    var i, p = P - HO;                                             // p: tempo del film dopo l'apertura
    /* camera */
    var cz = camZ(p), cx = 0, cy = 0, lx = 0, ly = 0;
    if (p > K.cross1 && p < K.rad + .001){
      var u = (L.z1 - cz) / (L.z1 - L.zEnd), o = ringOff(u), oa = ringOff(Math.min(1, u + .1));
      cx = o.x; cy = o.y; var w = Math.sin(PI * u); lx = mix(o.x, oa.x, .8) * (1 - .3 * w); ly = mix(o.y, oa.y, .8);
    }
    cx += .025 * Math.sin(t * .21); cy += .018 * Math.sin(t * .17 + 1);
    CAM.x = cx; CAM.y = cy; CAM.z = cz; CAM.tx = lx; CAM.ty = ly; CAM.tz = cz - 10;
    /* apertura: la camera guarda la lastra distesa dall'alto e scende mentre la lastra si alza;
       tutto il gruppo camera-mira ruota intorno al centro della lastra, così a fine discesa è identico a prima */
    var al = AL0 * (1 - io3(seg(p, K.cam0, K.rise1)));
    if (al > 1e-5){
      var ca = Math.cos(al), sa = Math.sin(al), be = .07 * Math.sin(t * .09) * al / AL0, cb = Math.cos(be), sb = Math.sin(be), y2, z2, x2;
      y2 = CAM.y * ca + CAM.z * sa; z2 = -CAM.y * sa + CAM.z * ca; CAM.y = y2; CAM.z = z2;
      y2 = CAM.ty * ca + CAM.tz * sa; z2 = -CAM.ty * sa + CAM.tz * ca; CAM.ty = y2; CAM.tz = z2;
      x2 = CAM.x * cb + CAM.z * sb; z2 = -CAM.x * sb + CAM.z * cb; CAM.x = x2; CAM.z = z2;
      x2 = CAM.tx * cb + CAM.tz * sb; z2 = -CAM.tx * sb + CAM.tz * cb; CAM.tx = x2; CAM.tz = z2;
    }
    var t1 = io3(seg(p, .12, K.rise1)), t2 = io3(seg(p, K.fin0, K.fin1));
    CAM.sx = mix(mix(L.shiftHero.x, L.shiftStage.x, t1), L.shiftFin.x, t2);
    CAM.sy = mix(mix(L.shiftHero.y, L.shiftStage.y, t1), L.shiftFin.y, t2);

    /* lastra */
    var rise = settle(seg(p, K.rise0, K.rise1), .045);
    var f1 = seg(p, K.flip1a, K.flip1b), f2 = seg(p, K.flip2a, K.flip2b), f3 = seg(p, K.flip3a, K.flip3b), f4 = seg(p, K.fin0 + .18, K.fin1);
    var rx = -PI / 2 * (1 - rise), ry = PI * (settle(f1, .02) + settle(f2, .02) + settle(f3, .02) + io3(f4)), rz = 0;
    var wob = Math.sin(PI * f1) + Math.sin(PI * f2) + Math.sin(PI * f3);
    rx += .085 * wob;
    if (L.portrait) rz = PI / 2 * io3(f4);
    var gx = 0, gy = 0, gz = -.32 * wob;

    /* sdoppiamento */
    var s = io3(seg(p, K.split0, K.split1)) * (1 - io3(seg(p, K.join0, K.join1)));
    var sep = Math.min(1, s / .3), slide = io3(clamp((s - .15) / .85, 0, 1));
    var dzs = .17 * sep * (1 - .55 * slide);
    L1.o.position.set(-L.ox * slide, L.oy * slide, LT / 2 + dzs);
    L2.o.position.set(L.ox * slide, -L.oy * slide, -LT / 2 - dzs);
    if (!L.portrait){ L1.o.rotation.set(0, .1 * slide, 0); L2.o.rotation.set(0, -.1 * slide, 0); }
    else { L1.o.rotation.set(.07 * slide, 0, 0); L2.o.rotation.set(-.07 * slide, 0, 0); }
    gz -= L.zr * slide;

    /* ritorno finale: da dietro la camera, sopra la spalla sinistra, fino davanti */
    if (p > K.fin0){
      var f = io3(seg(p, K.fin0, K.fin1)), czF = camZ(K.fin1), zF = czF - L.dFin;
      var P0 = [0, 0, 0], P1 = [-2.3, 2.5, camZ(K.fin0) + 1.4], P2 = [0, 0, zF];
      var a = (1 - f) * (1 - f), b = 2 * (1 - f) * f, c = f * f;
      gx = a * P0[0] + b * P1[0] + c * P2[0]; gy = a * P0[1] + b * P1[1] + c * P2[1]; gz = a * P0[2] + b * P1[2] + c * P2[2];
      rx += -.35 * Math.sin(PI * f);
    }
    /* deriva lenta e puntatore (non nel finale: la frase sta ferma sulla faccia) */
    var still = 1 - seg(p, K.fin0, K.fin0 + .3);
    rx += (.012 * Math.sin(t * .31) - .045 * S.ptrS.y * rise) * still;
    ry += (.016 * Math.sin(t * .23) + .06 * S.ptrS.x * rise) * still;
    G.position.set(gx, gy, gz);
    G.rotation.set(rx, ry, rz, 'YXZ');

    /* facce: cosa mostrano e quanto sono accese (deciso solo da p, così si torna indietro senza sorprese) */
    var A, B, rA, rB, eA = 0, gA = 0;
    if (p < 2.9){ A = 0; rA = io2(seg(p, .72, 1.3)); }
    else if (p < 6.6){ A = 2; rA = io2(seg(p, 3.55, 4.05)); }
    else { A = -1; rA = 1; eA = 1; gA = io2(seg(p, 9.95, 10.55)); }
    if (p < 4.6){ B = 1; rB = io2(seg(p, 2.2, 2.72)); } else { B = 4; rB = io2(seg(p, 6.05, 6.58)); }
    setFace(FA, A, rA, eA, gA); setFace(FB, B, rB, 0, 0);
    setFace(FIN, 3, io2(seg(p, 4.12, 4.6)), 0, 0);
    setFace(R.front, 5, io2(seg(p, 7.85, 8.6)), 0, 0);
    S.faces = { A:A, B:B };

    /* attraversamento: la faccia si sbriciola in pixel mentre la camera ci passa dentro */
    var pix = 0;
    if (p > K.cross0 && p < K.fin0) pix = cz > 0 ? 1 - clamp((cz - .2) / 3.4, 0, 1) : 1;
    pix = clamp(pix, 0, 1);
    [L1, L2].forEach(function(Ly){ Ly.mat.userData.u.uPix.value = pix; Ly.front.material.uniforms.uPix.value = pix; Ly.back.material.uniforms.uPix.value = pix; });
    G.visible = !(pix >= .999 && p < K.fin0);

    /* luce del bordo */
    var edge = S.ign;
    L1.mat.userData.u.uEdge.value = L2.mat.userData.u.uEdge.value = edge;
    R.mat.userData.u.uEdge.value = io2(seg(p, K.cross0 + .3, K.rad)) * (1 - io3(seg(p, K.fin0, K.fin1 - .2)));

    /* riga di luce, calore, Radente, anelli, pulviscolo */
    lineU.uI.value = S.ign * (1 - io2(seg(p, K.rise0, K.rise0 + .55)));
    line.position.set(gx, gy, gz + SH / 2 + .01);
    haloU.uI.value = mix(.55, 1, t1) * (1 - io2(seg(p, K.cross0, K.cross0 + .45))) + io2(seg(p, K.fin0 + .3, K.fin1)) * 1.1 + io2(seg(p, 7.9, 8.6)) * (1 - t2) * .8;
    if (p < K.cross0 + .45) halo.position.set(gx, gy, gz - 2.6);
    else if (p < K.fin0 + .3) halo.position.set(0, 0, L.zR - 2.6);
    else halo.position.set(gx, gy, gz - 2.6);
    R.o.visible = p > K.cross0 - .15 && p < K.fin1 - .1;
    R.front.material.uniforms.uDim.value = io3(seg(p, K.fin0, K.fin1 - .2));
    var rI = io2(seg(p, K.cross0 - .05, K.cross0 + .5));
    for (i = 0; i < 5; i++){
      var rg = rings[i], k = i < 4 ? rI * (1 - io2(seg(p, K.rad - .1, K.rad + .5)) * .85) : io2(seg(p, 7.8, 8.7));
      k *= 1 - (i < 4 ? .9 : .62) * io3(seg(p, K.fin0, K.fin1));
      rg.u.uI.value = k; rg.hu.uI.value = k; rg.g.visible = k > .002;
    }
    dustU.uI.value = .16 + .5 * io2(seg(p, K.cross0, K.cross1)) * (1 - io2(seg(p, K.rad, K.fin0))) + .08 * (1 - seg(P, KH.c1, KH.s1));

    /* apertura: prima solo le aste; poi la riga di luce passa sulla lastra distesa, dal fondo verso chi guarda,
       e dietro di sé lascia la lastra vera (le aste vengono tagliate via, la lastra compare) */
    var hs = seg(P, KH.s0, KH.s1), cutY = P < KH.s0 ? 1e4 : P < KH.s1 ? mix(SH / 2 + .03, -SH / 2 - .01, io2(hs)) : -1e4;
    var cutG = cutY > 1e3 ? 1e4 : cutY;
    L1.mat.userData.u.uCut.value = L2.mat.userData.u.uCut.value = cutG;
    FA.material.uniforms.uCut.value = FB.material.uniforms.uCut.value = FIN.material.uniforms.uCut.value = cutG;
    if (P < KH.s0) G.visible = false;
    poseSticks(P, t, cutY);
    if (P < KH.s0) lineU.uI.value = 0;
    else if (P < KH.s1){
      lineU.uI.value = S.ign * (1 + .4 * Math.sin(PI * hs));
      line.position.copy(G.position).addScaledVector(nY, cutY).addScaledVector(nZ, (LT + .012) * (1 - smooth01(seg(hs, .86, 1))));
    }
  }

  function setFace(mesh, work, reveal, empty, glow){
    var u = mesh.material.uniforms;
    u.uMap.value = work >= 0 ? (tex[work] || EMPTY) : EMPTY;
    u.uReveal.value = reveal; u.uEmpty.value = empty; u.uGlow.value = glow;
    mesh.userData.work = work; mesh.userData.reveal = reveal;
  }

  /* ── fotogramma ── */
  var v3 = new T.Vector3(), v4 = new T.Vector3(), lastT = 0, slow = 0, frames = 0;
  function frame(time){
    var t = time || performance.now() / 1000, dt = Math.min(.1, lastT ? t - lastT : .016);
    lastT = t; S.t = t;
    S.ptrS.x = damp(S.ptrS.x, S.ptr.x, 3, dt); S.ptrS.y = damp(S.ptrS.y, S.ptr.y, 3, dt);
    for (var i = 0; i < 6; i++) S.hov[i] = damp(S.hov[i], S.hovT[i], 9, dt);
    pose(S.p, t);
    /* alone al passaggio: sulla faccia che mostra quel lavoro */
    var hA = S.faces.A >= 0 ? S.hov[S.faces.A] : 0, hB = S.hov[S.faces.B] || 0, hIn = S.hov[3], hR = S.hov[5];
    FA.material.uniforms.uHover.value = hA; FB.material.uniforms.uHover.value = hB; FIN.material.uniforms.uHover.value = hIn;
    R.front.material.uniforms.uHover.value = hR;
    var split = Math.abs(L1.o.position.x) + Math.abs(L1.o.position.y) > .05;
    var h1 = split ? hA : Math.max(hA, hB), h2 = split ? Math.max(hB, hIn) : 0;
    L1.neon.material.uniforms.uI.value = h1; L2.neon.material.uniforms.uI.value = h2; R.neon.material.uniforms.uI.value = hR;
    L1.mat.userData.u.uHover.value = h1; L2.mat.userData.u.uHover.value = split ? h2 : h1; R.mat.userData.u.uHover.value = hR;
    [L1, L2, R].forEach(function(Ly){ Ly.mat.userData.u.uTime.value = t; });
    dustU.uTime.value = t;
    camera.position.set(CAM.x, CAM.y, CAM.z);
    camera.lookAt(CAM.tx, CAM.ty, CAM.tz);
    camera.setViewOffset(W, H, -CAM.sx, -CAM.sy, W, H);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    /* risoluzione adattiva: se i fotogrammi pesano, scende (mai risale, per non oscillare) */
    frames++;
    if (dt > .028) slow++; else slow = Math.max(0, slow - .25);
    if (slow > 24 && dpr > 1){ dpr = Math.max(1, dpr - .25); slow = 0; resize(); }
  }

  /* ── dove stanno le facce sullo schermo (per i collegamenti cliccabili e le didascalie) ── */
  var CORN = [[-SCW / 2, SCH / 2], [SCW / 2, SCH / 2], [SCW / 2, -SCH / 2], [-SCW / 2, -SCH / 2]];
  function quad(mesh){
    var q = [], ok = true;
    mesh.updateWorldMatrix(true, false);
    for (var k = 0; k < 4; k++){
      v3.set(CORN[k][0], CORN[k][1], 0).applyMatrix4(mesh.matrixWorld);
      v4.copy(v3).applyMatrix4(camera.matrixWorldInverse); if (v4.z > -.05) ok = false;
      v3.project(camera);
      q.push((v3.x + 1) / 2 * W, (1 - v3.y) / 2 * H);
    }
    return ok ? q : null;
  }
  function facing(mesh){
    v3.set(0, 0, 1).transformDirection(mesh.matrixWorld);
    mesh.getWorldPosition(v4); v4.sub(camera.position).multiplyScalar(-1).normalize();
    return v3.dot(v4);
  }
  function hits(){
    var out = [], p = S.p;
    if (G.visible){
      var split = Math.abs(L1.o.position.x) + Math.abs(L1.o.position.y) > .05;
      [FA, FB, FIN].forEach(function(m){
        var w = m.userData.work;
        if (w < 0 || m.userData.reveal < .55) return;
        if (m === FIN && !split) return;
        if (m.material.uniforms.uPix.value > .01) return;
        if (facing(m) < .55) return;
        var q = quad(m); if (q) out.push({ i:w, q:q });
      });
    }
    if (R.o.visible && p - HO > 8.2 && p - HO < K.fin0 + .1 && R.front.userData.reveal > .55 && facing(R.front) > .55){ var qr = quad(R.front); if (qr) out.push({ i:5, q:qr }); }
    return out;
  }
  function emptyFace(){ return S.p - HO > K.fin0 + .2 && FA.userData.work < 0 ? quad(FA) : null; }

  canvas.addEventListener('webglcontextlost', function(e){ e.preventDefault(); }, false);
  resize();
  pose(0, 0);

  return {
    K: KX, load: load, resize: resize, frame: frame, hits: hits, emptyFace: emptyFace,
    set: function(p){ S.p = p; },
    ignite: function(v){ S.ign = v; },
    hover: function(i, on){ if (i >= 0 && i < 6) S.hovT[i] = on ? 1 : 0; },
    pointer: function(x, y){ S.ptr.x = x; S.ptr.y = y; },
    layout: function(){ return L; },
    state: function(){ return { p:S.p, dpr:dpr, faces:S.faces, cam:[CAM.x, CAM.y, CAM.z], g:[G.position.x, G.position.y, G.position.z, G.rotation.x, G.rotation.y], hits:hits().map(function(h){ return h.i; }) }; }
  };
}

window.Lastra = { K: KX, create: create };
})();
