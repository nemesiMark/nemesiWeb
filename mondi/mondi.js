/* Mondi — la home di Nemesi Web (index.html, dalla 3.57; prima pagina di prova mondi.html, 3.55–3.56).
   Dopo il video dell'apertura e il «taglio di luce», la luce entra nel mondo Nemesi (cemento crepato di verde, come il muro del video),
   che gira al centro dello spazio. Linee al neon lo collegano ai mondi delle sezioni, che lampeggiano:
   01 Portfolio (gigante ad anelli), 02 Studio (la Terra, Bologna accesa), 03 Tool (luna con le officine e sette satelliti), 04 Contatti (gigante di ghiaccio che manda segnali).
   Nemesi, le aste e i mondi sono un solo blocco rigido: gira piano intorno alla verticale e con la «manina» (trascinando) si gira in ogni direzione.
   Clic su un mondo, sulla sua etichetta o sulla barra: salto nell'iperspazio (carica, tunnel, frenata), arrivo in orbita e contenuti della sezione.
   Esc o «Indietro»: salto all'indietro, con la stessa forza, fino al centro.
   Texture cotte in Blender (mondi/blender/*.py), Terra dalle mappe NASA (pubblico dominio). Three.js r147 classico, post-produzione propria (bloom HDR,
   scie, aberrazione, onda d'urto, grana). Contratto di verifica: ?subito (niente video né entrata), window.__ready, window.__mondi. */
(function(){
'use strict';
var d = document.documentElement;
var Q = new URLSearchParams(location.search);
var RIDOTTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
var MOBILE = matchMedia('(pointer: coarse)').matches;
var hdr = document.getElementById('hdr');
var pre = document.getElementById('pre');
var canvas = document.getElementById('gl');
var SEZIONI = ['portfolio', 'studio', 'tool', 'contatti'];
var pannelli = {};
SEZIONI.forEach(function(id){ pannelli[id] = document.getElementById('p-' + id); });
var etichette = {};
document.querySelectorAll('.et').forEach(function(b){ etichette[b.getAttribute('data-vai')] = b; });

/* ── strumenti: stessi dati del sito (js/strumenti-icone.js) ── */
(function(){
  var FIGMA = '<svg viewBox="0 0 38 57" aria-hidden="true"><path fill="#F24E1E" d="M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19Z"/><path fill="#FF7262" d="M19 0H28.5A9.5 9.5 0 0 1 28.5 19H19Z"/><path fill="#A259FF" d="M19 19H9.5A9.5 9.5 0 0 0 9.5 38H19Z"/><circle fill="#1ABCFE" cx="28.5" cy="28.5" r="9.5"/><path fill="#0ACF83" d="M9.5 38H19V47.5A9.5 9.5 0 1 1 9.5 38Z"/></svg>';
  var ul = document.getElementById('strumenti');
  (window.STRUMENTI || []).forEach(function(t){
    var li = document.createElement('li'); li.className = 'strum';
    li.innerHTML = '<a class="vetro" href="' + t.url + '" target="_blank" rel="noopener" style="--corpo:' + t.corpo + ';--alone:' + (t.logo === 'figma' ? '#A259FF' : (t.chiaro ? t.logo : t.corpo)) + '">' +
      '<span class="ico">' + (t.logo === 'figma' ? FIGMA : '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="' + t.logo + '" d="' + t.d + '"/></svg>') + '</span>' +
      '<span class="s-nome">' + t.nome + '<small>' + t.casa + '</small></span><span class="s-desc">' + t.testo + '</span></a>';
    ul.appendChild(li);
  });
})();

/* ── menu del telefono (come nel sito) ── */
var burger = hdr.querySelector('.burger');
function menu(o){ hdr.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Chiudi il menu' : 'Apri il menu'); }
burger.addEventListener('click', function(){ menu(!hdr.classList.contains('open')); });
document.addEventListener('click', function(e){ if (hdr.classList.contains('open') && !hdr.contains(e.target)) menu(false); });

function senzaGL(){
  d.classList.remove('gl', 'avvio'); d.classList.add('senza-gl');
  SEZIONI.forEach(function(id){ pannelli[id].hidden = false; });
  document.querySelectorAll('[data-vai]').forEach(function(a){ var id = a.getAttribute('data-vai'); if (a.tagName === 'A') a.setAttribute('href', id === 'centro' ? '#' : '#p-' + id); });
  hdr.querySelectorAll('.links a').forEach(function(a){ a.addEventListener('click', function(){ menu(false); }); });
  /* le etichette dei mondi fanno da indice: portano alla loro sezione */
  document.querySelectorAll('.et').forEach(function(b){ b.addEventListener('click', function(){
    var p = pannelli[b.getAttribute('data-vai')]; if (p) p.scrollIntoView({ behavior: RIDOTTO ? 'auto' : 'smooth', block: 'start' }); }); });
}
if (!d.classList.contains('gl') || !window.THREE){ senzaGL(); return; }

var renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance' }); } catch (e){ renderer = null; }
if (!renderer){ senzaGL(); return; }

/* ════════════════════════════ costanti e aiuti ════════════════════════════ */
var V3 = THREE.Vector3;
var GL2 = renderer.capabilities.isWebGL2;
var HDR = THREE.UnsignedByteType;
try {
  if (GL2 ? (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'))
          : (renderer.extensions.has('OES_texture_half_float') && renderer.extensions.has('OES_texture_half_float_linear') && renderer.extensions.has('EXT_color_buffer_half_float')))
    HDR = THREE.HalfFloatType;
} catch (e){}
var MSAA = GL2 ? (MOBILE ? 2 : 4) : 0;
var ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
renderer.setClearColor(0x000000, 1);

function lin(h, k){ var c = new THREE.Color(h); return new V3(Math.pow(c.r, 2.2), Math.pow(c.g, 2.2), Math.pow(c.b, 2.2)).multiplyScalar(k === undefined ? 1 : k); }
function clamp01(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
function mix(a, b, t){ return a + (b - a) * t; }
var E = {
  inOut: function(t){ t = clamp01(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
  out3: function(t){ t = clamp01(t); return 1 - Math.pow(1 - t, 3); },
  in2: function(t){ t = clamp01(t); return t * t; },
  in3: function(t){ t = clamp01(t); return t * t * t; },
  outExpo: function(t){ t = clamp01(t); return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); },
  inOut2: function(t){ t = clamp01(t); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
};
var VERDE = lin('#CDFD67');
var SOLE = new V3(-0.80, 0.36, 0.30).normalize();
var SOLE_COL = lin('#FFF3E4', 1.45);
var R0 = 1.2;

/* ════════════════════════════ texture ════════════════════════════ */
var GRANDE = !MOBILE && Math.max(screen.width, screen.height) * (devicePixelRatio || 1) >= 1800;
var CARTELLA = 'mondi/tex/';
var FILE = {
  cielo: 'cielo.jpg', nemesiC: 'nemesi-colore.jpg', nemesiN: 'nemesi-normale.jpg', nemesiL: 'nemesi-luce.jpg',
  terraG: 'terra-giorno.jpg', terraL: 'terra-luci.jpg', terraM: 'terra-mare.jpg', terraN: 'terra-nuvole.jpg',
  gigante: 'gigante-colore.jpg', lunaC: 'luna-colore.jpg', lunaN: 'luna-normale.jpg', lunaL: 'luna-luce.jpg', ghiaccio: 'ghiaccio-colore.jpg'
};
var PICCOLE = { gigante: 1, ghiaccio: 1, lunaC: 1, lunaN: 1, lunaL: 1, nemesiN: 1, terraM: 1, terraN: 1 };   // bastano a metà lato anche sul computer
var T = {};
var vuota = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); vuota.needsUpdate = true;
function caricaTexture(){
  var loader = new THREE.TextureLoader();
  var lista = Object.keys(FILE).map(function(k){
    var url = CARTELLA + (GRANDE && !PICCOLE[k] ? '' : 'm/') + FILE[k] + '?v=2';
    return new Promise(function(res){
      loader.load(url, function(t){
        t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = ANISO;
        t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; T[k] = t; res();
      }, undefined, function(){ T[k] = vuota; res(); });
    });
  });
  lista.push(new Promise(function(res){
    loader.load(CARTELLA + 'anelli.png?v=2', function(t){ t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; T.anelli = t; res(); },
      undefined, function(){ T.anelli = vuota; res(); });
  }));
  return Promise.all(lista);
}

/* ════════════════════════════ shader ════════════════════════════ */
var VS_PIANETA = [
  'varying vec2 vUv; varying vec3 vPw; varying vec3 vNw;',
  'void main(){ vUv = uv; vec4 pw = modelMatrix * vec4(position, 1.0); vPw = pw.xyz; vNw = normalize(mat3(modelMatrix) * normal);',
  '  gl_Position = projectionMatrix * viewMatrix * pw; }'
].join('\n');

var FS_PIANETA = [
  'uniform sampler2D tColore; uniform sampler2D tNormale; uniform sampler2D tLuce; uniform sampler2D tNuvole; uniform sampler2D tMare; uniform sampler2D tAnelli;',
  'uniform mat3 uRot; uniform vec3 uSole; uniform vec3 uSoleCol; uniform float uSoleF; uniform vec3 uAmb;',
  'uniform vec3 uAtmo; uniform float uAtmoF; uniform vec3 uLuceCol; uniform float uLuceF; uniform float uNuvOff;',
  'uniform vec3 uCentro; uniform vec3 uAnN; uniform vec2 uAnR; uniform float uAcc; uniform vec3 uAccP; uniform float uImp; uniform float uSel; uniform float uAlb;',
  'varying vec2 vUv; varying vec3 vPw; varying vec3 vNw;',
  'void main(){',
  '  vec3 V = normalize(cameraPosition - vPw);',
  '  vec3 Ng = normalize(vNw);',
  '  vec3 N = Ng;',
  '#ifdef NORMALE',
  '  vec3 nb = texture2D(tNormale, vUv).xyz * 2.0 - 1.0;',
  '  N = normalize(mix(Ng, normalize(uRot * vec3(nb.x, nb.z, -nb.y)), 0.9));',
  '#endif',
  '  vec3 L = uSole;',
  '  float ndlG = dot(Ng, L);',
  '  float term = smoothstep(-0.10, 0.30, ndlG);',
  '  float dif = max(dot(N, L), 0.0) * term * uSoleF;',
  '  vec3 alb = pow(texture2D(tColore, vUv).rgb, vec3(2.2)) * uAlb;',
  '  vec3 col = vec3(0.0);',
  '  float notte = 1.0 - smoothstep(-0.30, 0.16, ndlG);',
  '  float ombraAn = 1.0;',
  '#ifdef ANELLI',
  '  float den = dot(L, uAnN);',
  '  if (abs(den) > 0.001){ float tt = dot(uCentro - vPw, uAnN) / den; if (tt > 0.0){ vec3 hp = vPw + L * tt; float rr = length(hp - uCentro);',
  '    float u = (rr - uAnR.x) / (uAnR.y - uAnR.x); if (u > 0.0 && u < 1.0) ombraAn = 1.0 - texture2D(tAnelli, vec2(u, 0.5)).a * 0.85; } }',
  '#endif',
  '#ifdef TERRA',
  '  vec2 uvN = vec2(vUv.x + uNuvOff, vUv.y);',
  '  float nuv = texture2D(tNuvole, uvN).r;',
  '  float omb = texture2D(tNuvole, uvN + vec2(-0.0025, 0.0012)).r;',
  '  float mare = texture2D(tMare, vUv).r;',
  '  vec3 terra = alb * (1.0 - omb * 0.45);',
  '  terra = mix(terra, vec3(dot(terra, vec3(0.3, 0.59, 0.11))), 0.15);',
  '  terra *= mix(vec3(1.0), vec3(0.55, 0.78, 1.15), mare * 0.6);',
  '  vec3 base = mix(terra, vec3(0.92), nuv * 0.92);',
  '  col += base * dif * uSoleCol;',
  '  vec3 Hh = normalize(L + V); float nh = max(dot(Ng, Hh), 0.0);',
  '  col += uSoleCol * (pow(nh, 420.0) * 1.1 + pow(nh, 40.0) * 0.035) * mare * (1.0 - nuv) * term * uSoleF;',
  '  float luci = texture2D(tLuce, vUv).r;',
  '  col += vec3(1.0, 0.68, 0.36) * luci * luci * notte * (1.0 - nuv * 0.85) * uLuceF;',
  '#else',
  '  vec3 diretta = alb * dif * uSoleCol * ombraAn;',
  '  #ifdef GAS',
  '  diretta *= mix(0.42, 1.0, pow(max(dot(Ng, V), 0.0), 0.5));',
  '  #endif',
  '  col += diretta;',
  '  #ifdef LUCE',
  '  float e = texture2D(tLuce, vUv).r;',
  '  float acc = 1.0; float onda = 0.0;',
  '    #ifdef ACCENDI',
  '  float ang = acos(clamp(dot(Ng, uAccP), -1.0, 1.0)) / 3.14159265;',
  '  acc = 1.0 - smoothstep(uAcc - 0.05, uAcc, ang);',
  '  acc += exp(-pow((ang - uAcc) * 20.0, 2.0)) * (1.0 - step(0.999, uAcc)) * 3.0;',
  '  onda = exp(-pow((ang - uImp) * 14.0, 2.0));',
  '    #endif',
  '  float e2 = e * e;',
  '  vec3 em = uLuceCol * mix(e2, e, 0.35) * (0.07 + notte * 0.95) * acc;',
  '  em += vec3(1.0, 1.0, 0.88) * smoothstep(0.75, 1.0, e) * (0.05 + notte * 0.8) * acc * 0.9;',
  '  em += (uLuceCol * 0.8 + vec3(0.5)) * mix(e2, e, 0.5) * onda * 1.4;',
  '  col += em * uLuceF;',
  '  #endif',
  '#endif',
  '  col += alb * uAmb;',
  '  float fr = pow(1.0 - max(dot(Ng, V), 0.0), 2.6);',
  '  col += uAtmo * fr * smoothstep(-0.45, 0.65, ndlG) * uAtmoF * max(uSoleF, 0.15);',
  '  col += uAtmo * fr * uSel * 0.8;',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

/* atmosfera: guscio poco più grande; la luce dipende da quanto il raggio di vista sfiora il pianeta */
var VS_MONDO = 'varying vec3 vPw; void main(){ vec4 pw = modelMatrix * vec4(position, 1.0); vPw = pw.xyz; gl_Position = projectionMatrix * viewMatrix * pw; }';
var FS_ATMO = [
  'uniform vec3 uCentro; uniform float uR; uniform float uRa; uniform vec3 uSole; uniform vec3 uAtmo; uniform float uF; uniform float uPot; uniform float uSel;',
  'varying vec3 vPw;',
  'void main(){',
  '  vec3 rd = normalize(vPw - cameraPosition);',
  '  float t = dot(uCentro - cameraPosition, rd);',
  '  vec3 cp = cameraPosition + rd * t;',
  '  float b = length(cp - uCentro);',
  '  float h = clamp((b - uR) / (uRa - uR), 0.0, 1.0);',
  '  float glow = b > uR ? pow(1.0 - h, uPot) : pow(b / uR, 9.0) * 0.6;',
  '  vec3 n = normalize(cp - uCentro);',
  '  float luce = smoothstep(-0.45, 0.6, dot(n, uSole));',
  '  float contro = pow(max(dot(rd, uSole), 0.0), 5.0);',
  '  gl_FragColor = vec4(uAtmo * glow * (luce + contro * 1.3 + uSel * 0.7) * uF, 1.0);',
  '}'
].join('\n');

/* anelli del Portfolio: profilo radiale da Blender, ombra del pianeta, luce che passa da dietro */
var VS_ANELLI = 'varying vec3 vPl; varying vec3 vPw; void main(){ vPl = position; vec4 pw = modelMatrix * vec4(position, 1.0); vPw = pw.xyz; gl_Position = projectionMatrix * viewMatrix * pw; }';
var FS_ANELLI = [
  'uniform sampler2D tAnelli; uniform vec2 uR; uniform vec3 uSole; uniform vec3 uSoleCol; uniform vec3 uCentro; uniform vec3 uN; uniform float uRp; uniform float uF;',
  'varying vec3 vPl; varying vec3 vPw;',
  'void main(){',
  '  float r = length(vPl.xy);',
  '  float u = (r - uR.x) / (uR.y - uR.x);',
  '  if (u < 0.0 || u > 1.0) discard;',
  '  vec4 tx = texture2D(tAnelli, vec2(u, 0.5));',
  '  vec3 c = pow(tx.rgb, vec3(2.2)); float a = tx.a;',
  '  vec3 V = normalize(cameraPosition - vPw);',
  '  float sl = dot(uN, uSole), sv = dot(uN, V);',
  '  float el = abs(sl);',
  '  float lit = sl * sv > 0.0 ? 0.22 + 0.9 * el : (0.1 + 0.7 * el) * (1.0 - a * 0.7);',
  '  float fwd = pow(max(dot(-V, uSole), 0.0), 6.0) * (1.0 - a) * 1.6;',
  '  vec3 p = vPw - uCentro; float tt = dot(-p, uSole); vec3 q = p + uSole * tt;',
  '  float sh = tt > 0.0 ? smoothstep(uRp * 0.97, uRp * 1.03, length(q)) : 1.0;',
  '  gl_FragColor = vec4(c * uSoleCol * (lit + fwd) * sh * uF, a * 0.94 * clamp(uF * 1.5, 0.0, 1.0));',
  '}'
].join('\n');

/* anello al neon intorno a Nemesi (il taglio di luce diventato orbita) */
var FS_ANELLO_NEON = [
  'uniform vec3 uCol; uniform float uMid; uniform float uLarg; uniform float uDis; uniform float uLuce; uniform float uTempo;',
  'varying vec3 vPl; varying vec3 vPw;',
  'void main(){',
  '  float r = length(vPl.xy); float x = (r - uMid) / uLarg;',
  '  float ang = atan(vPl.y, vPl.x) / 6.2831853 + 0.5;',
  '  if (ang > uDis) discard;',
  '  float core = exp(-x * x * 70.0); float glow = exp(-x * x * 5.0) * 0.1;',
  '  float testa = exp(-pow((ang - uDis) * 40.0, 2.0)) * (1.0 - step(0.999, uDis));',
  '  float imp = exp(-pow(fract(ang - uTempo * 0.06) * 9.0 - 4.5, 2.0)) * 0.8;',
  '  vec3 c = uCol * (glow + core * (0.9 + testa * 4.0 + imp)) + vec3(1.0, 1.0, 0.92) * core * core * core * 0.8;',
  '  gl_FragColor = vec4(c * uLuce, 1.0);',
  '}'
].join('\n');

/* linee al neon: nastro sempre rivolto alla camera, tagliato davanti alla camera, impulsi che viaggiano verso il mondo */
var VS_LINEA = [
  'attribute float aT; attribute float aLato;',
  'uniform vec3 uA; uniform vec3 uB; uniform float uPx; uniform float uLargM; uniform vec2 uRis;',
  'varying float vT; varying float vX;',
  'void main(){',
  '  vec4 va = viewMatrix * vec4(uA, 1.0); vec4 vb = viewMatrix * vec4(uB, 1.0);',
  '  float nz = -0.08;',
  '  vT = 0.0; vX = 0.0;',
  '  if (va.z > nz && vb.z > nz){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }',
  '  float ta = 0.0, tb = 1.0;',
  '  if (va.z > nz) ta = (nz - va.z) / (vb.z - va.z);',
  '  if (vb.z > nz) tb = (nz - va.z) / (vb.z - va.z);',
  '  float t = mix(ta, tb, aT);',
  '  vec4 ca = projectionMatrix * mix(va, vb, ta); vec4 cb = projectionMatrix * mix(va, vb, tb); vec4 cp = projectionMatrix * mix(va, vb, t);',
  '  vec2 dpx = (cb.xy / cb.w - ca.xy / ca.w) * uRis;',
  '  vec2 dir = length(dpx) > 0.0001 ? normalize(dpx) : vec2(1.0, 0.0);',
  '  float px = max(uPx, uLargM * projectionMatrix[1][1] * uRis.y * 0.5 / cp.w);',
  '  cp.xy += vec2(-dir.y, dir.x) * aLato * px / (uRis * 0.5) * cp.w;',
  '  gl_Position = cp; vT = t; vX = aLato;',
  '}'
].join('\n');
var FS_LINEA = [
  'uniform vec3 uCol; uniform float uLuce; uniform float uDis; uniform float uTempo; uniform float uFase;',
  'varying float vT; varying float vX;',
  'void main(){',
  '  if (vT > uDis) discard;',
  '  float x = abs(vX);',
  '  float core = exp(-x * x * 34.0); float alone = exp(-x * x * 4.0) * 0.12;',
  '  float imp = 0.0;',
  '  for (int k = 0; k < 2; k++){ float s = fract(uTempo * 0.12 + uFase + float(k) * 0.5); imp += exp(-pow((vT - s) * 24.0, 2.0)); }',
  '  float testa = exp(-pow((vT - uDis) * 26.0, 2.0)) * (1.0 - step(0.999, uDis));',
  '  float bordi = smoothstep(0.0, 0.04, vT);',
  '  vec3 c = uCol * (alone + core * (0.9 + imp * 1.6 + testa * 5.0)) + vec3(1.0, 1.0, 0.92) * core * core * core * (0.7 + imp * 0.8 + testa * 2.0);',
  '  gl_FragColor = vec4(c * uLuce * bordi, 1.0);',
  '}'
].join('\n');

/* puntini (fine delle linee) e segnali: quadrati rivolti alla camera, a misura fissa in pixel */
var VS_PUNTO = [
  'uniform vec3 uPos; uniform float uPx; uniform vec2 uRis; varying vec2 vQ;',
  'void main(){ vec4 c = projectionMatrix * viewMatrix * vec4(uPos, 1.0); vQ = position.xy; c.xy += position.xy * uPx / (uRis * 0.5) * c.w; gl_Position = c; }'
].join('\n');
var FS_PUNTO = [
  'uniform vec3 uCol; uniform float uTempo; uniform float uFase; uniform float uLuce; uniform float uSel;',
  'varying vec2 vQ;',
  'void main(){',
  '  float r = length(vQ);',
  '  float lamp = 0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTempo * 2.4 + uFase * 6.2831), 10.0) + 0.35 * uSel;',
  '  float nucleo = exp(-r * r * 120.0) * 3.2; float alone = exp(-r * r * 12.0) * 0.5;',
  '  float o = fract(uTempo * 0.42 + uFase); float onda = exp(-pow((r - o) * 18.0, 2.0)) * (1.0 - o) * (0.55 + uSel);',
  '  vec3 c = uCol * ((nucleo + alone) * lamp * (1.0 + uSel * 0.8) + onda) + vec3(1.0) * nucleo * 0.4 * lamp;',
  '  gl_FragColor = vec4(c * uLuce, 1.0);',
  '}'
].join('\n');
/* aloni intorno ai mondi (passaggio del mouse) e onde del segnale di Contatti: quadrati rivolti alla camera, a misura nel mondo */
var VS_ALONE = [
  'uniform vec3 uPos; uniform float uSize; varying vec2 vQ;',
  'void main(){ vec3 rx = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]); vec3 ry = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);',
  '  vQ = position.xy; gl_Position = projectionMatrix * viewMatrix * vec4(uPos + (rx * position.x + ry * position.y) * uSize, 1.0); }'
].join('\n');
var FS_ALONE = [
  'uniform vec3 uCol; uniform float uTempo; uniform float uSel; uniform float uSegnale; uniform float uR; uniform float uLuce;',
  'varying vec2 vQ;',
  'void main(){',
  '  float r = length(vQ); if (r > 1.0) discard;',
  '  float a = atan(vQ.y, vQ.x);',
  '  float anello = exp(-pow((r - uR) * 140.0, 2.0)) * uSel * (0.55 + 0.45 * step(0.0, sin(a * 24.0 + uTempo * 1.5)));',
  '  float tacche = exp(-pow((r - uR - 0.05) * 90.0, 2.0)) * uSel * step(0.985, cos(a * 4.0 - uTempo * 0.6));',
  '  float s = 0.0;',
  '  for (int k = 0; k < 3; k++){ float o = fract(uTempo * 0.22 + float(k) / 3.0); float rr = mix(uR * 0.72, 1.0, o); s += exp(-pow((r - rr) * 60.0, 2.0)) * pow(1.0 - o, 1.6); }',
  '  vec3 c = uCol * (anello * 1.4 + tacche * 2.0 + s * uSegnale * 0.32);',
  '  gl_FragColor = vec4(c * uLuce, 1.0);',
  '}'
].join('\n');

/* stelle, polvere vicina, scie dell'iperspazio */
var VS_STELLE = [
  'attribute vec3 aCol; attribute float aDim; attribute float aFase;',
  'uniform float uTempo; uniform float uPx; uniform float uWarp; varying vec3 vCol;',
  'void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;',
  '  float tw = 0.75 + 0.25 * sin(uTempo * (0.7 + aFase * 2.8) + aFase * 60.0);',
  '  vCol = aCol * tw * (1.0 - uWarp * 0.7); gl_PointSize = max(1.0, aDim * uPx); }'
].join('\n');
var FS_STELLE = 'varying vec3 vCol; void main(){ vec2 q = gl_PointCoord - 0.5; float a = exp(-dot(q, q) * 22.0); gl_FragColor = vec4(vCol * a, 1.0); }';
var VS_POLVERE = [
  'attribute float aDim; attribute float aFase; uniform float uTempo; uniform float uScala; varying float vA;',
  'void main(){ vec3 p = position; p.y += sin(uTempo * 0.07 + aFase * 6.28) * 0.35; p.x += cos(uTempo * 0.05 + aFase * 9.0) * 0.35;',
  '  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; float z = -mv.z;',
  '  gl_PointSize = clamp(uScala * aDim / max(z, 0.1), 1.0, 160.0); vA = smoothstep(0.6, 3.0, z) * (1.0 - smoothstep(16.0, 30.0, z)); }'
].join('\n');
var FS_POLVERE = 'uniform float uLuce; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = (1.0 - smoothstep(0.82, 1.0, r)) * (0.5 + 0.5 * smoothstep(0.35, 0.95, r)); gl_FragColor = vec4(vec3(0.72, 0.82, 0.66) * a * vA * uLuce, 1.0); }';
var VS_SCIE = [
  'attribute vec3 aP; attribute float aV; attribute float aC;',
  'uniform float uDist; uniform float uLung; uniform float uL; uniform float uWarp; uniform float uVerso; uniform float uPx; uniform vec2 uRis; uniform float uRoll;',
  'varying float vA; varying float vY; varying float vC; varying float vR;',
  'void main(){',
  '  float z = -0.7 - mod(aP.z - uDist * aV, uL);',
  '  float cr = cos(uRoll), sr = sin(uRoll);',
  '  vec3 testa = vec3(cr * aP.x - sr * aP.y, sr * aP.x + cr * aP.y, z);',
  '  vec3 coda = testa - vec3(0.0, 0.0, uLung * aV * uVerso); coda.z = min(coda.z, -0.35);',
  '  vec4 ch = projectionMatrix * vec4(testa, 1.0); vec4 ct = projectionMatrix * vec4(coda, 1.0);',
  '  vec2 dpx = (ch.xy / ch.w - ct.xy / ct.w) * uRis;',
  '  vec2 dir = length(dpx) > 0.0001 ? normalize(dpx) : vec2(1.0, 0.0);',
  '  vec4 cp = mix(ch, ct, position.x);',
  '  cp.xy += vec2(-dir.y, dir.x) * position.y * (0.45 + aC * 1.0) * uPx / (uRis * 0.5) * cp.w;',
  '  gl_Position = cp;',
  '  vA = (1.0 - position.x * 0.95) * smoothstep(-0.7 - uL, -0.7 - uL * 0.65, z) * uWarp * smoothstep(0.1, 0.45, length(ch.xy / ch.w));',
  '  vY = position.y; vC = aC; vR = length(ch.xy / ch.w);',
  '}'
].join('\n');
/* colore delle scie: bianco azzurro vicino al centro, verde verso i bordi, con un filo bianco nel mezzo */
var FS_SCIE = [
  'uniform vec3 uCol; varying float vA; varying float vY; varying float vC; varying float vR;',
  'void main(){ float a = exp(-vY * vY * 2.5) * vA;',
  '  vec3 c = mix(vec3(0.6, 0.8, 1.0), uCol, smoothstep(0.2, 0.95, vR) * (0.4 + 0.6 * vC));',
  '  gl_FragColor = vec4((c + vec3(0.3) * exp(-vY * vY * 14.0)) * a * 1.5, 1.0); }'
].join('\n');
var VS_SATELLITI = [
  'attribute vec3 aCol; uniform float uScala; uniform float uLuce; varying vec3 vCol;',
  'void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; vCol = aCol * uLuce;',
  '  gl_PointSize = clamp(uScala * 0.05 / max(-mv.z, 0.1), 5.0, 26.0); }'
].join('\n');
var FS_SATELLITI = 'varying vec3 vCol; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = exp(-r * r * 9.0) + exp(-r * r * 80.0) * 2.0; gl_FragColor = vec4(vCol * a, 1.0); }';

/* post-produzione */
var VS_POST = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
var FS_SOGLIA = [
  'uniform sampler2D tSrc; uniform vec2 uTx; uniform float uSoglia; varying vec2 vUv;',
  'float lum(vec3 c){ return max(c.r, max(c.g, c.b)); }',
  'void main(){',
  '  vec3 a = texture2D(tSrc, vUv + uTx * vec2(-1.0, -1.0)).rgb; vec3 b = texture2D(tSrc, vUv + uTx * vec2(1.0, -1.0)).rgb;',
  '  vec3 c = texture2D(tSrc, vUv + uTx * vec2(-1.0, 1.0)).rgb; vec3 e = texture2D(tSrc, vUv + uTx * vec2(1.0, 1.0)).rgb;',
  '  float wa = 1.0 / (1.0 + lum(a)), wb = 1.0 / (1.0 + lum(b)), wc = 1.0 / (1.0 + lum(c)), we = 1.0 / (1.0 + lum(e));',
  '  vec3 m = (a * wa + b * wb + c * wc + e * we) / (wa + wb + wc + we);',
  '  float br = lum(m); float k = 0.6; float soft = clamp(br - uSoglia + k, 0.0, 2.0 * k); soft = soft * soft / (4.0 * k + 0.0001);',
  '  float w = max(soft, br - uSoglia) / max(br, 0.0001);',
  '  gl_FragColor = vec4(min(m * w, vec3(40.0)), 1.0);',
  '}'
].join('\n');
var FS_GIU = [
  'uniform sampler2D tSrc; uniform vec2 uTx; varying vec2 vUv;',
  'vec3 s(vec2 o){ return texture2D(tSrc, vUv + uTx * o).rgb; }',
  'void main(){',
  '  vec3 A = s(vec2(-2.0, -2.0)), B = s(vec2(0.0, -2.0)), C = s(vec2(2.0, -2.0)), D = s(vec2(-1.0, -1.0)), Ee = s(vec2(1.0, -1.0));',
  '  vec3 F = s(vec2(-2.0, 0.0)), G = s(vec2(0.0)), Hh = s(vec2(2.0, 0.0)), I = s(vec2(-1.0, 1.0)), J = s(vec2(1.0, 1.0));',
  '  vec3 K = s(vec2(-2.0, 2.0)), Ll = s(vec2(0.0, 2.0)), M = s(vec2(2.0, 2.0));',
  '  vec3 o = (D + Ee + I + J) * 0.125 + (A + B + F + G) * 0.03125 + (B + C + G + Hh) * 0.03125 + (F + G + K + Ll) * 0.03125 + (G + Hh + Ll + M) * 0.03125;',
  '  gl_FragColor = vec4(o, 1.0);',
  '}'
].join('\n');
var FS_SU = [
  'uniform sampler2D tBasso; uniform sampler2D tQui; uniform vec2 uTx; uniform float uPeso; varying vec2 vUv;',
  'vec3 s(vec2 o){ return texture2D(tBasso, vUv + uTx * o).rgb; }',
  'void main(){',
  '  vec3 t = s(vec2(-1.0, -1.0)) + 2.0 * s(vec2(0.0, -1.0)) + s(vec2(1.0, -1.0)) + 2.0 * s(vec2(-1.0, 0.0)) + 4.0 * s(vec2(0.0)) + 2.0 * s(vec2(1.0, 0.0)) + s(vec2(-1.0, 1.0)) + 2.0 * s(vec2(0.0, 1.0)) + s(vec2(1.0, 1.0));',
  '  gl_FragColor = vec4(texture2D(tQui, vUv).rgb + t / 16.0 * uPeso, 1.0);',
  '}'
].join('\n');
var FS_FINALE = [
  'uniform sampler2D tScena; uniform sampler2D tBloom; uniform float uBloom; uniform float uEsp; uniform float uWarp; uniform float uAberr;',
  'uniform float uFlash; uniform float uVign; uniform float uTempo; uniform float uOnda; uniform float uOndaR; uniform vec2 uOndaC; uniform vec2 uRis;',
  'uniform float uSfoca; uniform float uTunnel; uniform float uTunDist; uniform float uRoll; uniform vec3 uVerde;',
  'varying vec2 vUv;',
  'vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
  'float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }',
  /* rumore periodico (si richiude sul giro e sulla lunghezza del tunnel, così non ci sono cuciture) */
  'float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
  'float vn(vec2 p, vec2 per){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); vec2 j = mod(i + 1.0, per); i = mod(i, per);',
  '  return mix(mix(h1(i), h1(vec2(j.x, i.y)), f.x), mix(h1(vec2(i.x, j.y)), h1(j), f.x), f.y); }',
  'void main(){',
  '  vec2 asp = vec2(uRis.x / uRis.y, 1.0);',
  '  vec2 c0 = vec2(0.5);',
  '  vec2 uv = vUv;',
  '  vec2 dd = (uv - c0) * asp; float rr = length(dd);',
  '  float anello = 0.0;',
  '  if (uOnda > 0.001){ vec2 od = (uv - uOndaC) * asp; float ro = length(od); float k = exp(-pow((ro - uOndaR) * 9.0, 2.0));',
  '    uv -= normalize(od + 0.00001) / asp * k * uOnda * 0.035; anello = exp(-pow((ro - uOndaR) * 60.0, 2.0)) * uOnda; }',
  '  vec2 dir = uv - c0;',
  '  float ab = uAberr * (0.25 + dot(dd, dd) * 1.6);',
  '  vec3 col;',
  '  if (uSfoca > 0.0005){',
  '    vec3 acc = vec3(0.0);',
  '    for (int i = 0; i < 6; i++){ float f = 1.0 - uSfoca * float(i) / 5.0; vec2 d2 = dir * f;',
  '      acc += vec3(texture2D(tScena, c0 + d2 * (1.0 + ab)).r, texture2D(tScena, c0 + d2).g, texture2D(tScena, c0 + d2 * (1.0 - ab)).b); }',
  '    col = acc / 6.0;',
  '  } else {',
  '    col = vec3(texture2D(tScena, c0 + dir * (1.0 + ab)).r, texture2D(tScena, uv).g, texture2D(tScena, c0 + dir * (1.0 - ab)).b);',
  '  }',
  '  col += texture2D(tBloom, uv).rgb * uBloom;',
  '  col *= uEsp;',
  /* tunnel dell'iperspazio: raggi di luce su un cilindro visto da dentro (profondità = 1 / distanza dal centro) */
  '  if (uTunnel > 0.002){',
  '    float an = fract(atan(dd.y, dd.x) / 6.2831853 + 0.5 + uRoll * 0.159155);',
  '    float zz = 0.42 / max(rr, 0.03) + uTunDist;',
  '    float n1 = vn(vec2(an * 150.0, zz * 0.9), vec2(150.0, 360.0));',
  '    float n2 = vn(vec2(an * 40.0, zz * 0.35), vec2(40.0, 140.0));',
  '    float raggi = pow(n1, 9.0) * 3.0 + pow(n2, 4.0) * 0.16;',
  '    float m = smoothstep(0.04, 0.5, rr) * (0.55 + 0.45 * smoothstep(0.35, 1.1, rr));',
  '    vec3 tc = mix(vec3(0.5, 0.74, 1.0), uVerde, smoothstep(0.18, 0.9, rr));',
  '    col *= 1.0 - 0.5 * min(uTunnel, 1.0) * smoothstep(0.05, 0.7, rr);',
  '    col += tc * raggi * m * uTunnel * 0.6;',
  '  }',
  '  col += mix(vec3(0.75, 0.9, 1.0), vec3(0.8, 1.0, 0.6), 0.4) * exp(-rr * rr * 60.0) * uWarp * uWarp * 0.22;',
  '  col += mix(vec3(1.0), uVerde, 0.6) * anello * 0.2;',
  '  col = aces(col);',

  '  float v = smoothstep(1.35, 0.35, length(dd * vec2(0.82, 1.0)));',
  '  col *= mix(1.0, v, uVign);',
  '  col = pow(col, vec3(1.0 / 2.2));',
  '  col = mix(col, vec3(1.0, 1.0, 0.96), clamp(uFlash * (0.3 + 0.7 * exp(-rr * rr * 3.0)), 0.0, 1.0));',
  '  col += (hash(vUv * uRis + fract(uTempo) * 61.0) - 0.5) * 0.028;',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

/* ════════════════════════════ scena ════════════════════════════ */
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(30, 1, 0.05, 2500);
var W = 1, H = 1, DPR = 1, qualita = 1;
var RIS = new THREE.Vector2(1, 1);   // pixel veri (per gli shader)
var VIGN = 0.42;   // vignetta a riposo (più leggera: il cielo si vede fino agli angoli)
var FX = { warp: 0, vel: 0, verso: 1, flash: 0, onda: 0, ondaR: 0, ondaX: 0.5, ondaY: 0.5, aberr: 0.0011, esp: 1.0, bloom: 0.9, vign: VIGN, scossa: 0, dist: 0,
  sfoca: 0, tunnel: 0, tun: 0, roll: 0 };
var tempo = 0;

var GEO_SFERA = new THREE.SphereGeometry(1, 160, 80);
var GEO_GUSCIO = new THREE.SphereGeometry(1, 96, 48);
var GEO_QUAD = new THREE.PlaneGeometry(2, 2);

function U(v){ return { value: v }; }

/* cielo */
var cielo = new THREE.Mesh(new THREE.SphereGeometry(900, 64, 32), new THREE.ShaderMaterial({
  /* il cielo di Blender, più acceso, su un fondo blu notte appena sollevato dal nero */
  uniforms: { tCielo: U(vuota), uLuce: U(1.3), uFondo: U(new V3(0.0032, 0.0042, 0.0062)) },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D tCielo; uniform float uLuce; uniform vec3 uFondo; varying vec2 vUv; void main(){ gl_FragColor = vec4(pow(texture2D(tCielo, vUv).rgb, vec3(2.2)) * uLuce + uFondo, 1.0); }',
  side: THREE.BackSide, depthWrite: false, depthTest: false
}));
cielo.renderOrder = -10; cielo.frustumCulled = false; cielo.rotation.y = 2.065;
scene.add(cielo);

/* stelle lontane (seguono la camera: sono all'infinito) */
var stelle = (function(){
  var n = MOBILE ? 3200 : 5200, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), dim = new Float32Array(n), fase = new Float32Array(n);
  for (var i = 0; i < n; i++){
    var u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos[i * 3] = s * Math.cos(a) * 600; pos[i * 3 + 1] = u * 600; pos[i * 3 + 2] = s * Math.sin(a) * 600;
    var m = Math.pow(Math.random(), 9.0);
    dim[i] = 0.9 + m * 3.6;
    var t = Math.random(), c = t < 0.12 ? [1.0, 0.76, 0.58] : t < 0.32 ? [1.0, 0.91, 0.8] : t < 0.85 ? [0.94, 0.96, 1.0] : [0.72, 0.83, 1.0];
    var b = 0.22 + m * 6.0 + Math.random() * 0.2;
    col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b; fase[i] = Math.random();
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aDim', new THREE.BufferAttribute(dim, 1)); g.setAttribute('aFase', new THREE.BufferAttribute(fase, 1));
  var p = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uTempo: U(0), uPx: U(1), uWarp: U(0) }, vertexShader: VS_STELLE, fragmentShader: FS_STELLE,
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
  p.frustumCulled = false; p.renderOrder = -9; scene.add(p); return p;
})();

/* polvere vicina, sfocata: dà profondità quando la camera si muove */
var polvere = (function(){
  var n = MOBILE ? 140 : 260, pos = new Float32Array(n * 3), dim = new Float32Array(n), fase = new Float32Array(n);
  for (var i = 0; i < n; i++){
    pos[i * 3] = (Math.random() * 2 - 1) * 17; pos[i * 3 + 1] = (Math.random() * 2 - 1) * 10; pos[i * 3 + 2] = -14 + Math.random() * 26;
    dim[i] = 0.025 + Math.pow(Math.random(), 2.0) * 0.1; fase[i] = Math.random();
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aDim', new THREE.BufferAttribute(dim, 1)); g.setAttribute('aFase', new THREE.BufferAttribute(fase, 1));
  var p = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uTempo: U(0), uScala: U(800), uLuce: U(0.035) }, vertexShader: VS_POLVERE, fragmentShader: FS_POLVERE,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  p.frustumCulled = false; p.renderOrder = 5; scene.add(p); return p;
})();

function matPianeta(o){
  var defs = {}; ['NORMALE', 'LUCE', 'TERRA', 'ANELLI', 'GAS', 'ACCENDI'].forEach(function(k){ if (o[k]) defs[k] = ''; });
  return new THREE.ShaderMaterial({
    defines: defs,
    uniforms: {
      tColore: U(vuota), tNormale: U(vuota), tLuce: U(vuota), tNuvole: U(vuota), tMare: U(vuota), tAnelli: U(vuota),
      uRot: U(new THREE.Matrix3()), uSole: U(SOLE), uSoleCol: U(SOLE_COL), uSoleF: U(1), uAmb: U(o.amb || new V3(0.012, 0.013, 0.016)),
      uAtmo: U(o.atmo || new V3()), uAtmoF: U(o.atmoF || 0), uLuceCol: U(o.luceCol || new V3(1, 1, 1)), uLuceF: U(o.luceF || 0), uNuvOff: U(0),
      uCentro: U(new V3()), uAnN: U(new V3(0, 1, 0)), uAnR: U(new THREE.Vector2(1, 2)), uAcc: U(1), uAccP: U(new V3(0, 0, 1)), uImp: U(-1), uSel: U(0), uAlb: U(o.alb || 1)
    },
    vertexShader: VS_PIANETA, fragmentShader: FS_PIANETA
  });
}
function atmosfera(r, ra, col, f, pot){
  var m = new THREE.Mesh(GEO_GUSCIO, new THREE.ShaderMaterial({
    uniforms: { uCentro: U(new V3()), uR: U(r), uRa: U(ra), uSole: U(SOLE), uAtmo: U(col), uF: U(f), uPot: U(pot || 2.4), uSel: U(0) },
    vertexShader: VS_MONDO, fragmentShader: FS_ATMO, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  m.scale.setScalar(ra); m.renderOrder = 2; return m;
}
function alone(col){
  var m = new THREE.Mesh(GEO_QUAD, new THREE.ShaderMaterial({
    uniforms: { uPos: U(new V3()), uSize: U(1), uCol: U(col), uTempo: U(0), uSel: U(0), uSegnale: U(0), uR: U(0.62), uLuce: U(1) },
    vertexShader: VS_ALONE, fragmentShader: FS_ALONE, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  m.frustumCulled = false; m.renderOrder = 3; return m;
}
function punto(col, px){
  var m = new THREE.Mesh(GEO_QUAD, new THREE.ShaderMaterial({
    uniforms: { uPos: U(new V3()), uPx: U(px), uRis: U(RIS), uCol: U(col), uTempo: U(0), uFase: U(Math.random()), uLuce: U(1), uSel: U(0) },
    vertexShader: VS_PUNTO, fragmentShader: FS_PUNTO, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  m.frustumCulled = false; m.renderOrder = 6; return m;
}
var GEO_LINEA = (function(){
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Array(12).fill(0), 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute([0, 1, 1, 0], 1));
  g.setAttribute('aLato', new THREE.Float32BufferAttribute([-1, -1, 1, 1], 1));
  g.setIndex([0, 1, 2, 0, 2, 3]); return g;
})();
function linea(col, fase, px, largM){
  var m = new THREE.Mesh(GEO_LINEA, new THREE.ShaderMaterial({
    uniforms: { uA: U(new V3()), uB: U(new V3()), uPx: U(px), uLargM: U(largM || 0), uRis: U(RIS), uCol: U(col), uLuce: U(1), uDis: U(1), uTempo: U(0), uFase: U(fase || 0) },
    vertexShader: VS_LINEA, fragmentShader: FS_LINEA, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide
  }));
  m.frustumCulled = false; m.renderOrder = 4; return m;
}

/* ── Nemesi, il mondo centrale ── */
var NEMESI = (function(){
  var g = new THREE.Group(); scene.add(g);
  var asse = new THREE.Group(); asse.rotation.set(0.16, 0, 0.34); g.add(asse);
  var gira = new THREE.Group(); asse.add(gira);
  var mat = matPianeta({ NORMALE: 1, LUCE: 1, ACCENDI: 1, alb: 1.9, luceCol: VERDE.clone().multiplyScalar(3.0), luceF: 1, atmo: lin('#DCEBC8', 0.45), atmoF: 0.4, amb: new V3(0.014, 0.015, 0.018) });
  var sfera = new THREE.Mesh(GEO_SFERA, mat); sfera.scale.setScalar(R0); gira.add(sfera);
  var atmo = atmosfera(R0, R0 * 1.09, lin('#CBEAA8', 0.3), 1, 3.0); g.add(atmo);
  var neon = new THREE.Mesh(new THREE.RingGeometry(R0 * 1.42, R0 * 1.62, 360, 1), new THREE.ShaderMaterial({
    uniforms: { uCol: U(VERDE.clone().multiplyScalar(1.6)), uMid: U(R0 * 1.52), uLarg: U(R0 * 0.075), uDis: U(1), uLuce: U(1), uTempo: U(0) },
    vertexShader: VS_ANELLI, fragmentShader: FS_ANELLO_NEON, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide
  }));
  neon.rotation.x = -Math.PI / 2; neon.renderOrder = 3; asse.add(neon);
  /* un secondo anello, sottilissimo e spento, un po' più largo */
  var neon2 = new THREE.Mesh(new THREE.RingGeometry(R0 * 1.86, R0 * 1.94, 360, 1), new THREE.ShaderMaterial({
    uniforms: { uCol: U(VERDE.clone().multiplyScalar(0.5)), uMid: U(R0 * 1.9), uLarg: U(R0 * 0.04), uDis: U(1), uLuce: U(0.5), uTempo: U(0) },
    vertexShader: VS_ANELLI, fragmentShader: FS_ANELLO_NEON, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide
  }));
  neon2.rotation.x = -Math.PI / 2; neon2.rotation.y = 0.12; neon2.renderOrder = 3; asse.add(neon2);
  return { g: g, asse: asse, gira: gira, sfera: sfera, mat: mat, atmo: atmo, neon: neon, neon2: neon2, r: R0, vel: 2 * Math.PI / 55 };
})();

/* ── i mondi delle sezioni ── */
var MONDI = {};
function nuovoMondo(id, r, matOpz, atmoCol, atmoF, atmoSpess, rotAsse, vel){
  var g = new THREE.Group(); scene.add(g);
  var asse = new THREE.Group(); asse.rotation.set(rotAsse[0], 0, rotAsse[1]); g.add(asse);
  var gira = new THREE.Group(); asse.add(gira);
  var mat = matPianeta(matOpz);
  var sfera = new THREE.Mesh(GEO_SFERA, mat); sfera.scale.setScalar(r); gira.add(sfera);
  var atmo = atmoCol ? atmosfera(r, r * (1 + atmoSpess), atmoCol, atmoF, 2.2) : null; if (atmo) g.add(atmo);
  var al = alone(VERDE.clone().multiplyScalar(1.6)); al.material.uniforms.uSize.value = r * 2.6; al.material.uniforms.uR.value = 0.6; g.add(al);
  var pt = punto(VERDE.clone().multiplyScalar(1.4), 24); scene.add(pt);
  var ln = linea(VERDE.clone().multiplyScalar(1.15), Math.random(), 5, 0.016); scene.add(ln);
  var m = { id: id, g: g, asse: asse, gira: gira, sfera: sfera, mat: mat, atmo: atmo, alone: al, punto: pt, linea: ln, r: r, vel: vel,
    sel: 0, selT: 0, acceso: 1, centro: g.position, extra: [] };
  MONDI[id] = m; return m;
}
(function(){
  /* 01 Portfolio: gigante gassoso color sabbia con anelli */
  var p = nuovoMondo('portfolio', 0.5, { GAS: 1, ANELLI: 1, amb: new V3(0.01, 0.01, 0.012), atmo: lin('#E8DCC0', 0.5), atmoF: 0.5 }, lin('#E9D9B6', 0.4), 1, 0.07, [0.08, 0.46], 2 * Math.PI / 38);
  var an = new THREE.Mesh(new THREE.RingGeometry(p.r * 1.28, p.r * 2.35, 256, 1), new THREE.ShaderMaterial({
    uniforms: { tAnelli: U(vuota), uR: U(new THREE.Vector2(p.r * 1.28, p.r * 2.35)), uSole: U(SOLE), uSoleCol: U(SOLE_COL), uCentro: U(p.g.position), uN: U(new V3()), uRp: U(p.r), uF: U(1) },
    vertexShader: VS_ANELLI, fragmentShader: FS_ANELLI, transparent: true, depthWrite: false, side: THREE.DoubleSide
  }));
  an.rotation.x = -Math.PI / 2; an.renderOrder = 1; p.asse.add(an); p.anelli = an;
  p.mat.uniforms.uAnR.value.set(p.r * 1.28, p.r * 2.35);

  /* 02 Studio: la Terra, con Bologna accesa */
  var t = nuovoMondo('studio', 0.44, { TERRA: 1, amb: new V3(0.006, 0.008, 0.012), luceF: 3.6, atmo: lin('#7FB2FF', 0.9), atmoF: 0.9 }, lin('#6CA4FF', 0.75), 1, 0.08, [0.0, 0.41], 2 * Math.PI / 80);
  var lat = 44.4949 * Math.PI / 180, lon = 11.3426 * Math.PI / 180;
  var u = (lon + Math.PI) / (2 * Math.PI), th = Math.PI / 2 - lat;
  t.bologna = new V3(-Math.cos(u * 2 * Math.PI) * Math.sin(th), Math.cos(th), Math.sin(u * 2 * Math.PI) * Math.sin(th));
  t.pin = punto(VERDE.clone().multiplyScalar(2.0), 26); scene.add(t.pin);
  t.raggio = linea(VERDE.clone().multiplyScalar(1.4), 0.3, 1.6, 0.0); scene.add(t.raggio);

  /* 03 Tool: luna di roccia, officine accese e sette satelliti nei colori degli strumenti */
  var l = nuovoMondo('tool', 0.36, { NORMALE: 1, LUCE: 1, luceCol: VERDE.clone().multiplyScalar(4.0), luceF: 1, amb: new V3(0.01, 0.01, 0.011), atmo: lin('#9FB0A0', 0.3), atmoF: 0.25 }, lin('#A9C2A0', 0.18), 1, 0.05, [0.2, -0.3], 2 * Math.PI / 90);
  var cols = (window.STRUMENTI || []).map(function(s){ return s.logo === 'figma' ? '#A259FF' : (s.chiaro ? s.logo : (s.corpo === '#1B1F24' || s.corpo === '#1C1C1C' || s.corpo === '#1E1E1E' ? (s.logo === '#FFFFFF' ? '#E8ECF2' : s.logo) : s.corpo)); });
  if (!cols.length) cols = ['#D97757', '#007ACC', '#E8ECF2', '#A259FF', '#F38020', '#32E6E2', '#3ECF8E'];
  var nS = cols.length, sp = new Float32Array(nS * 3), sc = new Float32Array(nS * 3);
  cols.forEach(function(c, i){ var v = lin(c, 3.2); sc[i * 3] = v.x; sc[i * 3 + 1] = v.y; sc[i * 3 + 2] = v.z; });
  var sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('aCol', new THREE.BufferAttribute(sc, 3));
  l.satelliti = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: { uScala: U(800), uLuce: U(1) }, vertexShader: VS_SATELLITI, fragmentShader: FS_SATELLITI,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  l.satelliti.frustumCulled = false; l.satelliti.renderOrder = 6; l.g.add(l.satelliti);
  l.orbite = cols.map(function(c, i){
    var o = { r: l.r * (1.45 + i * 0.13), inc: [0.35 - i * 0.11, 0.6 + i * 0.8], vel: (0.9 - i * 0.07) * (i % 2 ? -1 : 1) * 0.5, f: i * 0.9 };
    var pts = []; for (var k = 0; k <= 128; k++){ var a = k / 128 * Math.PI * 2; pts.push(new V3(Math.cos(a) * o.r, 0, Math.sin(a) * o.r)); }
    var ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(c), transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
    ln.rotation.set(o.inc[0], o.inc[1], 0); ln.renderOrder = 2; l.g.add(ln); o.linea = ln; return o;
  });

  /* 04 Contatti: gigante di ghiaccio che manda segnali */
  var c = nuovoMondo('contatti', 0.46, { GAS: 1, amb: new V3(0.01, 0.012, 0.014), atmo: lin('#9EF0F2', 0.9), atmoF: 0.8 }, lin('#8FE6EE', 0.8), 1, 0.09, [0.1, -0.5], 2 * Math.PI / 50);
  c.alone.material.uniforms.uSegnale.value = 1; c.alone.material.uniforms.uSize.value = c.r * 2.5;
  c.alone.material.uniforms.uCol.value = lin('#BDF6F0', 1.2);
})();

function assegnaTexture(){
  cielo.material.uniforms.tCielo.value = T.cielo;
  var u = NEMESI.mat.uniforms; u.tColore.value = T.nemesiC; u.tNormale.value = T.nemesiN; u.tLuce.value = T.nemesiL;
  u = MONDI.portfolio.mat.uniforms; u.tColore.value = T.gigante; u.tAnelli.value = T.anelli; MONDI.portfolio.anelli.material.uniforms.tAnelli.value = T.anelli;
  u = MONDI.studio.mat.uniforms; u.tColore.value = T.terraG; u.tLuce.value = T.terraL; u.tMare.value = T.terraM; u.tNuvole.value = T.terraN;
  u = MONDI.tool.mat.uniforms; u.tColore.value = T.lunaC; u.tNormale.value = T.lunaN; u.tLuce.value = T.lunaL;
  u = MONDI.contatti.mat.uniforms; u.tColore.value = T.ghiaccio;
}

/* ── scie dell'iperspazio (spazio della camera) ── */
var scie = (function(){
  var n = MOBILE ? 420 : 1000, L = 60;
  var g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  var aP = new Float32Array(n * 3), aV = new Float32Array(n), aC = new Float32Array(n);
  for (var i = 0; i < n; i++){
    var a = Math.random() * Math.PI * 2, rr = 0.7 + Math.pow(Math.random(), 1.2) * 5.0;
    aP[i * 3] = Math.cos(a) * rr; aP[i * 3 + 1] = Math.sin(a) * rr; aP[i * 3 + 2] = Math.random() * L;
    aV[i] = 0.55 + Math.random() * 0.9; aC[i] = Math.random();
  }
  g.setAttribute('aP', new THREE.InstancedBufferAttribute(aP, 3)); g.setAttribute('aV', new THREE.InstancedBufferAttribute(aV, 1)); g.setAttribute('aC', new THREE.InstancedBufferAttribute(aC, 1));
  g.instanceCount = n;
  var m = new THREE.Mesh(g, new THREE.ShaderMaterial({
    uniforms: { uDist: U(0), uLung: U(1), uL: U(L), uWarp: U(0), uVerso: U(1), uPx: U(1), uRis: U(RIS), uRoll: U(0), uCol: U(VERDE.clone().multiplyScalar(1.2)) },
    vertexShader: VS_SCIE, fragmentShader: FS_SCIE, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true, side: THREE.DoubleSide
  }));
  m.frustumCulled = false; m.renderOrder = 50; m.visible = false; scene.add(m); return m;
})();

/* ════════════════════════════ post-produzione ════════════════════════════ */
var postScena = new THREE.Scene(), postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
var triangolo = new THREE.BufferGeometry();
triangolo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
triangolo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
var quad = new THREE.Mesh(triangolo); quad.frustumCulled = false; postScena.add(quad);
function postMat(fs, u){ return new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS_POST, fragmentShader: fs, depthTest: false, depthWrite: false }); }
var mSoglia = postMat(FS_SOGLIA, { tSrc: U(null), uTx: U(new THREE.Vector2()), uSoglia: U(HDR === THREE.HalfFloatType ? 1.0 : 0.72) });
var mGiu = postMat(FS_GIU, { tSrc: U(null), uTx: U(new THREE.Vector2()) });
var mSu = postMat(FS_SU, { tBasso: U(null), tQui: U(null), uTx: U(new THREE.Vector2()), uPeso: U(1) });
var mFinale = postMat(FS_FINALE, { tScena: U(null), tBloom: U(null), uBloom: U(0.9), uEsp: U(1), uWarp: U(0), uAberr: U(0.0016), uFlash: U(0), uVign: U(VIGN), uTempo: U(0),
  uOnda: U(0), uOndaR: U(0), uOndaC: U(new THREE.Vector2(0.5, 0.5)), uRis: U(RIS), uSfoca: U(0), uTunnel: U(0), uTunDist: U(0), uRoll: U(0), uVerde: U(VERDE.clone().multiplyScalar(1.3)) });
var LIV = MOBILE ? 5 : 6;
var rtScena = null, giu = [], su = [];
function rt(w, h, o){
  return new THREE.WebGLRenderTarget(w, h, Object.assign({ type: HDR, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: false, stencilBuffer: false, generateMipmaps: false }, o || {}));
}
function passo(mat, target){ quad.material = mat; renderer.setRenderTarget(target); renderer.render(postScena, postCam); }
function disegna(){
  renderer.setRenderTarget(rtScena); renderer.clear(); renderer.render(scene, camera);
  mSoglia.uniforms.tSrc.value = rtScena.texture; mSoglia.uniforms.uTx.value.set(1 / rtScena.width, 1 / rtScena.height);
  passo(mSoglia, giu[0]);
  for (var i = 1; i < LIV; i++){ mGiu.uniforms.tSrc.value = giu[i - 1].texture; mGiu.uniforms.uTx.value.set(1 / giu[i - 1].width, 1 / giu[i - 1].height); passo(mGiu, giu[i]); }
  var basso = giu[LIV - 1];
  for (var j = LIV - 2; j >= 0; j--){
    mSu.uniforms.tBasso.value = basso.texture; mSu.uniforms.tQui.value = giu[j].texture; mSu.uniforms.uTx.value.set(1 / basso.width, 1 / basso.height);
    mSu.uniforms.uPeso.value = 1.0; passo(mSu, su[j]); basso = su[j];
  }
  var f = mFinale.uniforms;
  f.tScena.value = rtScena.texture; f.tBloom.value = su[0].texture; f.uBloom.value = FX.bloom * 0.16; f.uEsp.value = FX.esp; f.uWarp.value = FX.warp;
  f.uAberr.value = FX.aberr; f.uFlash.value = FX.flash; f.uVign.value = FX.vign; f.uTempo.value = tempo; f.uOnda.value = FX.onda; f.uOndaR.value = FX.ondaR;
  f.uOndaC.value.set(FX.ondaX, FX.ondaY); f.uSfoca.value = FX.sfoca; f.uTunnel.value = FX.tunnel; f.uTunDist.value = FX.tun; f.uRoll.value = FX.roll;
  passo(mFinale, null);
}

/* ════════════════════════════ disposizione ════════════════════════════ */
/* posizioni dei mondi: orizzontale (computer) e verticale (telefono); la camera si allontana se lo schermo è stretto */
var DISP = {
  l: { cam: [0, 0.3, 14.6], tgt: [0, -0.1, 0], fov: 30,
       portfolio: [-4.55, 1.75, -1.3], studio: [-3.6, -2.05, 1.4], tool: [4.1, 1.95, 0.4], contatti: [4.65, -1.75, -1.2] },
  p: { cam: [0, 0.1, 17.5], tgt: [0, 0.1, 0], fov: 40,
       portfolio: [-1.5, 3.55, -0.8], tool: [1.55, 3.4, 0.5], studio: [-1.45, -3.1, 0.7], contatti: [1.5, -3.3, -0.6] }
};
/* inquadratura di ogni sezione: dove sta il pianeta (frazioni dello schermo), quanto è grande, da che parte lo si guarda (verso il centro, verso il sole, in alto) */
var INQ = {
  portfolio: { l: { x: 0.8, y: 0.56, r: 0.16 }, p: { x: 0.5, y: 0.9, r: 0.24 }, dir: [0.55, 0.55, 0.42] },
  studio:    { l: { x: 0.77, y: 0.56, r: 0.36 }, p: { x: 0.5, y: 0.95, r: 0.46 }, dir: [0.75, 0.05, 0.12] },
  tool:      { l: { x: 0.76, y: 0.55, r: 0.28 }, p: { x: 0.5, y: 0.97, r: 0.42 }, dir: [0.8, 0.12, 0.18] },
  contatti:  { l: { x: 0.76, y: 0.56, r: 0.22 }, p: { x: 0.5, y: 0.98, r: 0.44 }, dir: [0.7, 0.45, 0.1] }
};
function verticale(){ return W / H < 0.85; }
function disposizione(){ return verticale() ? DISP.p : DISP.l; }

/* ── il sistema rigido: Nemesi, le aste e i mondi sono un solo blocco ──
   Gira piano intorno all'asse verticale (un giro in 2 minuti) e si porta dietro aste e mondi; con la «manina» si gira in ogni direzione,
   poi continua per inerzia e si rimette dritto piano piano. I mondi cambiano posto ma tengono il loro asse e la loro rotazione. */
var SU = new V3(0, 1, 0), UNO = new THREE.Quaternion();
var SIS = { q: new THREE.Quaternion(), w: new V3(), om: 2 * Math.PI / 120, k: 1, presa: null, prova: false };
var sisW = new V3(), sisQ = new THREE.Quaternion(), sisT = new THREE.Quaternion(), sisS = new THREE.Quaternion(), sisI = new THREE.Quaternion();
function raddrizza(q, k){
  /* q = inclinazione · giro intorno alla verticale: l'inclinazione torna a zero, il giro resta */
  var l = Math.hypot(q.y, q.w); if (l < 1e-5) return;
  sisT.set(0, q.y / l, 0, q.w / l);
  sisS.copy(q).multiply(sisI.copy(sisT).invert());
  sisS.slerp(UNO, k);
  q.copy(sisS).multiply(sisT);
}
function sistemaFermo(){ return DOVE !== 'centro' || !!salto; }
function aggiornaSistema(dt){
  if (!SIS.presa && !sistemaFermo() && !SIS.prova){
    /* rallenta fin quasi a fermarsi quando il puntatore è su un mondo, così si clicca bene */
    var vuole = (sottoMouse ? 0.0 : 1) * (RIDOTTO ? 0.25 : 1);
    SIS.k += (vuole - SIS.k) * (1 - Math.exp(-dt * (sottoMouse ? 4 : 0.7)));
    sisW.set(0, SIS.om * SIS.k, 0);
    SIS.w.lerp(sisW, 1 - Math.exp(-dt * 1.5));            // l'inerzia della spinta si spegne nella rotazione lenta
    var ang = SIS.w.length() * dt;
    if (ang > 1e-8){ sisQ.setFromAxisAngle(sisW.copy(SIS.w).normalize(), ang); SIS.q.premultiply(sisQ); }
    raddrizza(SIS.q, 1 - Math.exp(-dt * 0.85));
    SIS.q.normalize();
  }
  NEMESI.g.quaternion.copy(SIS.q);
  posizionaMondi();
}
function posizionaMondi(){
  SEZIONI.forEach(function(id){
    var m = MONDI[id];
    m.g.position.copy(m.base).applyQuaternion(SIS.q);
    var dirN = tmp.copy(m.g.position).normalize();
    m.lineaA.copy(dirN).multiplyScalar(R0);
    m.lineaB.copy(m.g.position).addScaledVector(dirN, -m.r * 1.16);
    m.linea.material.uniforms.uA.value.copy(m.lineaA); m.linea.material.uniforms.uB.value.copy(m.lineaB);
    m.punto.material.uniforms.uPos.value.copy(m.lineaB);
    m.alone.material.uniforms.uPos.value.copy(m.g.position);
    if (m.atmo) m.atmo.material.uniforms.uCentro.value.copy(m.g.position);
    m.mat.uniforms.uCentro.value.copy(m.g.position);
  });
}
function sistemaMondi(){
  var D = disposizione();
  SEZIONI.forEach(function(id){
    var m = MONDI[id];
    if (!m.base){ m.base = new V3(); m.lineaA = new V3(); m.lineaB = new V3(); }
    m.base.fromArray(D[id]);
  });
  NEMESI.atmo.material.uniforms.uCentro.value.set(0, 0, 0);
  NEMESI.mat.uniforms.uCentro.value.set(0, 0, 0);
  posaCache = null;
  posizionaMondi();
}
var camProva = new THREE.PerspectiveCamera(30, 1, 0.05, 2500), provaV = new V3(), provaQ = new THREE.Quaternion();
var posaCache = null;
function posaCentro(){
  if (!posaCache || posaCache.W !== W || posaCache.H !== H){
    var D = disposizione(), fov = D.fov;
    var pos = new V3().fromArray(D.cam), tgt = new V3().fromArray(D.tgt);
    /* indietro finché tutti i mondi, in ogni punto del loro giro, stanno fra la barra e il fondo dello schermo,
       con l'etichetta sopra o sotto (dove c'è posto, come fa aggiornaSchermo) */
    var alto = 74, basso = H < 520 ? 14 : 40, lato = 16, et = H < 520 ? 40 : 58, PASSI = 24;
    camProva.fov = fov; camProva.aspect = W / H; camProva.updateProjectionMatrix();
    var fpx = (H / 2) / Math.tan(fov * Math.PI / 360);
    for (var k = 0; k < 60; k++){
      camProva.position.copy(pos); camProva.lookAt(tgt); camProva.updateMatrixWorld();
      var ok = true;
      for (var j = 0; j < PASSI && ok; j++){
        provaQ.setFromAxisAngle(SU, j / PASSI * Math.PI * 2);
        ok = SEZIONI.every(function(id){
          var m = MONDI[id]; provaV.fromArray(D[id]).applyQuaternion(provaQ);
          var dist = camProva.position.distanceTo(provaV), r = m.r * fpx / dist;
          provaV.project(camProva);
          var x = (provaV.x * 0.5 + 0.5) * W, y = (-provaV.y * 0.5 + 0.5) * H;
          var y0 = y - r * 1.25, y1 = y + r * 1.25;
          var etOk = y0 - et > alto || y1 + et < H - basso;
          return x - Math.max(r * 1.4, 60) > lato && x + Math.max(r * 1.4, 60) < W - lato && y0 > alto && y1 < H - basso && etOk;
        });
      }
      if (ok) break;
      pos.sub(tgt).multiplyScalar(1.03).add(tgt);
    }
    posaCache = { W: W, H: H, pos: pos, tgt: tgt, fov: fov };
  }
  return { pos: posaCache.pos.clone(), tgt: posaCache.tgt.clone(), fov: posaCache.fov, ox: 0, oy: 0 };
}
/* Nemesi non deve stare fra la camera e il mondo, né troppo vicino alla camera */
function vistaLibera(pos, C){
  if (pos.length() < R0 * 2.8) return false;
  var ab = tmpB.copy(C).sub(pos), t = clamp01(-pos.dot(ab) / ab.lengthSq());
  return tmp2.copy(pos).addScaledVector(ab, t).length() > R0 * 1.8;
}
function posaSezione(id){
  var m = MONDI[id], v = verticale(), q = v ? INQ[id].p : INQ[id].l, fov = v ? 40 : 30;
  var rpx = v ? q.r * W : q.r * H;
  var fpx = (H / 2) / Math.tan(fov * Math.PI / 360);
  var dist = m.r / Math.sin(Math.atan(rpx / fpx));
  var C = m.g.position, k = INQ[id].dir;
  var base = posaCentro().pos.sub(C).normalize().multiplyScalar(k[0]).addScaledVector(SOLE, k[1]).add(new V3(0, k[2], 0)).normalize();
  /* se il mondo è passato dietro Nemesi, la camera gira verso l'esterno finché la vista è libera */
  var fuori = C.clone().normalize().add(new V3(0, 0.35, 0)).normalize(), verso = base.clone();
  for (var i = 1; i <= 8 && !vistaLibera(C.clone().addScaledVector(verso, dist), C); i++) verso.copy(base).lerp(fuori, i / 8).normalize();
  return { pos: C.clone().addScaledVector(verso, dist), tgt: C.clone(), fov: fov, ox: q.x - 0.5, oy: q.y - 0.5, verso: verso };
}

/* ════════════════════════════ camera ════════════════════════════ */
var CAM = { pos: new V3(), tgt: new V3(), fov: 30, ox: 0, oy: 0 };
var PAR = { x: 0, y: 0, tx: 0, ty: 0 };
var tmp = new V3(), tmp2 = new V3(), tmpB = new V3(), tmpQ = new THREE.Quaternion();
function camDa(p){ CAM.pos.copy(p.pos); CAM.tgt.copy(p.tgt); CAM.fov = p.fov; CAM.ox = p.ox; CAM.oy = p.oy; }
function applicaCamera(dt){
  var k = 1 - Math.exp(-dt * 2.2);
  PAR.x += (PAR.tx - PAR.x) * k; PAR.y += (PAR.ty - PAR.y) * k;
  var amp = DOVE === 'centro' ? 1 : 0.35;
  camera.position.copy(CAM.pos);
  camera.lookAt(CAM.tgt);
  /* parallasse del puntatore e un respiro lento: la camera si sposta un poco nel suo piano */
  var dx = (PAR.x * 0.55 + Math.sin(tempo * 0.11) * 0.18) * amp, dy = (PAR.y * 0.32 + Math.sin(tempo * 0.07 + 1.3) * 0.1) * amp;
  if (RIDOTTO){ dx = 0; dy = 0; }
  tmp.set(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(dx);
  tmp2.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(dy);
  camera.position.add(tmp).add(tmp2);
  if (FX.scossa > 0){ camera.position.x += (Math.random() - 0.5) * FX.scossa; camera.position.y += (Math.random() - 0.5) * FX.scossa; }
  camera.lookAt(CAM.tgt);
  if (FX.roll) camera.rotateZ(FX.roll);
  camera.fov = CAM.fov; camera.aspect = W / H;
  if (Math.abs(CAM.ox) > 1e-4 || Math.abs(CAM.oy) > 1e-4) camera.setViewOffset(W, H, -CAM.ox * W, -CAM.oy * H, W, H);
  else if (camera.view && camera.view.enabled) camera.clearViewOffset();
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
}

/* ════════════════════════════ dimensioni ════════════════════════════ */
function dimensiona(){
  W = Math.max(1, innerWidth); H = Math.max(1, innerHeight); posaCache = null;
  DPR = Math.min(devicePixelRatio || 1, MOBILE ? 1.75 : 1.6) * qualita;
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  var pw = Math.max(1, Math.round(W * DPR)), ph = Math.max(1, Math.round(H * DPR));
  RIS.set(pw, ph);
  if (!rtScena) rtScena = rt(pw, ph, { depthBuffer: true, samples: MSAA }); else rtScena.setSize(pw, ph);
  for (var i = 0; i < LIV; i++){
    var w = Math.max(1, (pw >> 1) >> i), h = Math.max(1, (ph >> 1) >> i);
    if (!giu[i]){ giu[i] = rt(w, h); su[i] = rt(w, h); } else { giu[i].setSize(w, h); su[i].setSize(w, h); }
  }
  var fpx = (ph / 2) / Math.tan(30 * Math.PI / 360);
  polvere.material.uniforms.uScala.value = fpx;
  MONDI.tool.satelliti.material.uniforms.uScala.value = fpx;
  stelle.material.uniforms.uPx.value = DPR;
  scie.material.uniforms.uPx.value = DPR;
  SEZIONI.forEach(function(id){ MONDI[id].punto.material.uniforms.uPx.value = (verticale() ? 17 : 24) * DPR; MONDI[id].linea.material.uniforms.uPx.value = 5 * DPR; });
  MONDI.studio.pin.material.uniforms.uPx.value = 26 * DPR; MONDI.studio.raggio.material.uniforms.uPx.value = 1.6 * DPR;
  sistemaMondi();
}

/* ════════════════════════════ stato e animazione ════════════════════════════ */
var DOVE = 'centro', salto = null, prossimo = null, pronto = false, hover = null, sottoMouse = null;   // sottoMouse: il mondo sotto il mouse (ferma la giostra)
var INTRO = { acc: 1, sole: 1, neon: 1, linee: [1, 1, 1, 1], mondi: [1, 1, 1, 1], atmo: 1 };
var bolognaW = new V3();

function aggiorna(dt){
  tempo += dt;
  /* rotazioni: Nemesi gira con tutto il sistema (aste e mondi), i mondi girano anche su se stessi */
  aggiornaSistema(dt);
  var terra = MONDI.studio;
  SEZIONI.forEach(function(id){ var m = MONDI[id]; if (!(id === 'studio' && terra.qBologna)) m.gira.rotateY(m.vel * dt * (RIDOTTO ? 0.2 : 1)); });
  /* la Terra: andando allo Studio, Bologna gira verso chi guarda, sul confine fra giorno e notte */
  if (terra.qBologna) terra.gira.quaternion.slerp(terra.qBologna, 1 - Math.exp(-dt * (salto ? 2.2 : 1.4)));
  terra.mat.uniforms.uNuvOff.value = (tempo * 0.0016) % 1;
  /* uniformi comuni */
  var mats = [NEMESI].concat(SEZIONI.map(function(id){ return MONDI[id]; }));
  mats.forEach(function(m){ m.g.updateMatrixWorld(true); m.mat.uniforms.uRot.value.setFromMatrix4(m.sfera.matrixWorld).multiplyScalar(1 / m.sfera.scale.x); });
  /* Nemesi */
  var nu = NEMESI.mat.uniforms;
  nu.uAcc.value = INTRO.acc; nu.uSoleF.value = INTRO.sole; nu.uAtmoF.value = 0.4 * INTRO.atmo;
  NEMESI.atmo.material.uniforms.uF.value = INTRO.atmo;
  NEMESI.neon.material.uniforms.uDis.value = INTRO.neon; NEMESI.neon.material.uniforms.uTempo.value = tempo;
  NEMESI.neon2.material.uniforms.uDis.value = INTRO.neon; NEMESI.neon2.material.uniforms.uTempo.value = tempo * 0.7;
  if (nu.uImp.value > -1){ nu.uImp.value += dt * 0.55; if (nu.uImp.value > 1.3) nu.uImp.value = -1; }
  /* sezioni */
  SEZIONI.forEach(function(id, i){
    var m = MONDI[id];
    m.sel += ((hover === id ? 1 : 0) - m.sel) * (1 - Math.exp(-dt * 8));
    var acceso = INTRO.mondi[i];
    m.mat.uniforms.uSoleF.value = 0.06 + 0.94 * acceso; m.mat.uniforms.uSel.value = m.sel;
    if (m.atmo){ m.atmo.material.uniforms.uF.value = acceso; m.atmo.material.uniforms.uSel.value = m.sel; }
    if (m.anelli) m.anelli.material.uniforms.uF.value = 0.06 + 0.94 * acceso;
    var inSez = DOVE !== 'centro' || salto;
    var lu = m.linea.material.uniforms;
    lu.uTempo.value = tempo; lu.uDis.value = INTRO.linee[i];
    var bersaglio = m.lineaLuce !== undefined ? m.lineaLuce : 1;
    lu.uLuce.value = (bersaglio + m.sel * 0.9) * (m.sfarfallio !== undefined ? m.sfarfallio : 1);
    var pu = m.punto.material.uniforms;
    pu.uTempo.value = tempo; pu.uSel.value = m.sel; pu.uLuce.value = acceso * (inSez ? (DOVE === id ? 0 : 0.6) : 1);
    var au = m.alone.material.uniforms; au.uTempo.value = tempo; au.uSel.value = inSez ? 0 : m.sel; au.uLuce.value = acceso * (DOVE === id ? 0.45 : 1);
  });
  /* Bologna: puntino e raggio verde */
  terra.sfera.updateMatrixWorld();
  bolognaW.copy(terra.bologna).multiplyScalar(1.004).applyMatrix4(terra.sfera.matrixWorld);
  var nB = bolognaW.clone().sub(terra.g.position).normalize();
  var vistaB = nB.dot(tmp.copy(camera.position).sub(bolognaW).normalize());
  terra.pin.material.uniforms.uPos.value.copy(bolognaW); terra.pin.material.uniforms.uTempo.value = tempo;
  terra.pin.material.uniforms.uLuce.value = INTRO.mondi[1] * (DOVE === 'studio' ? 1.3 : 0.75) * clamp01(vistaB * 4 + 0.5);
  terra.raggio.material.uniforms.uA.value.copy(bolognaW); terra.raggio.material.uniforms.uB.value.copy(bolognaW).addScaledVector(nB, terra.r * 0.32);
  terra.raggio.material.uniforms.uTempo.value = tempo; terra.raggio.material.uniforms.uLuce.value = INTRO.mondi[1] * (DOVE === 'studio' ? 1 : 0.6) * clamp01(vistaB * 3 + 0.3);
  /* satelliti degli strumenti */
  var tool = MONDI.tool, sp = tool.satelliti.geometry.attributes.position;
  tool.orbite.forEach(function(o, i){
    var a = o.f + tempo * o.vel * (RIDOTTO ? 0.2 : 1);
    tmp.set(Math.cos(a) * o.r, 0, Math.sin(a) * o.r).applyEuler(o.linea.rotation);
    sp.setXYZ(i, tmp.x, tmp.y, tmp.z);
    o.linea.material.opacity = 0.14 * INTRO.mondi[2] + (DOVE === 'tool' ? 0.1 : 0);
  });
  sp.needsUpdate = true; tool.satelliti.material.uniforms.uLuce.value = INTRO.mondi[2];
  /* anelli del Portfolio */
  var pf = MONDI.portfolio; pf.asse.updateMatrixWorld();
  var nA = new V3(0, 0, 1).applyQuaternion(pf.anelli.getWorldQuaternion(tmpQ)).normalize();
  pf.anelli.material.uniforms.uN.value.copy(nA); pf.mat.uniforms.uAnN.value.copy(nA);
  /* stelle, cielo e polvere seguono o no la camera */
  cielo.position.copy(camera.position); stelle.position.copy(camera.position);
  stelle.material.uniforms.uTempo.value = tempo; stelle.material.uniforms.uWarp.value = FX.warp;
  polvere.material.uniforms.uTempo.value = tempo;
  /* scie e tunnel */
  FX.dist += FX.vel * dt * 360;
  FX.tun = ((FX.tun + FX.vel * dt * 26) % 400 + 400) % 400;
  var su = scie.material.uniforms; su.uDist.value = FX.dist; su.uWarp.value = Math.min(1, FX.warp * 1.4); su.uLung.value = 1.0 + FX.warp * 42; su.uVerso.value = FX.verso;
  su.uRoll.value = FX.roll;
  scie.visible = FX.warp > 0.01;
}

/* ════════════════════════════ etichette e puntatore ════════════════════════════ */
function proietta(v, out){
  tmp.copy(v).project(camera);
  out.x = (tmp.x * 0.5 + 0.5) * W; out.y = (-tmp.y * 0.5 + 0.5) * H; out.z = tmp.z; return out;
}
var segnoB = document.getElementById('segno-bologna'), segnoS = { x: 0, y: 0, z: 0 };
var SCHERMO = {};
SEZIONI.forEach(function(id){ SCHERMO[id] = { x: 0, y: 0, z: 0, r: 0, d: 0, cop: 0 }; });
var centroS = { x: 0, y: 0, z: 0, r: 0, d: 0 };
/* quanto un disco sullo schermo è coperto da un altro più vicino (0 = libero, 1 = tutto dietro) */
function copertura(s, a){
  if (a.d >= s.d) return 0;
  var dd = Math.hypot(s.x - a.x, s.y - a.y);
  return clamp01((a.r + s.r - dd) / (2 * Math.max(1, s.r)));
}
var ordineEt = '';
function aggiornaSchermo(){
  var fpx = (H / 2) / Math.tan(camera.fov * Math.PI / 360);
  proietta(NEMESI.g.position, centroS);
  centroS.d = camera.position.distanceTo(NEMESI.g.position); centroS.r = R0 * fpx / Math.max(0.01, centroS.d);
  SEZIONI.forEach(function(id){
    var m = MONDI[id], s = SCHERMO[id];
    proietta(m.g.position, s);
    s.d = Math.max(0.01, camera.position.distanceTo(m.g.position));
    s.r = m.r * fpx / s.d;
  });
  /* i mondi che passano dietro Nemesi o dietro un altro mondo abbassano l'etichetta; quella del più vicino sta sopra */
  SEZIONI.forEach(function(id){
    var s = SCHERMO[id], c = copertura(s, centroS);
    SEZIONI.forEach(function(k){ if (k !== id) c = Math.max(c, copertura(s, SCHERMO[k]) * 0.9); });
    s.cop = c;
  });
  var ord = SEZIONI.slice().sort(function(a, b){ return SCHERMO[b].d - SCHERMO[a].d; });
  var chiave = ord.join(',');
  if (chiave !== ordineEt){ ordineEt = chiave; ord.forEach(function(id, i){ if (etichette[id]) etichette[id].style.zIndex = String(i + 1); }); }
  /* etichette sopra o sotto il loro mondo: si sistemano prima quelle dei mondi più vicini,
     le altre scelgono il lato libero; se non c'è posto si abbassano */
  var messe = [];
  for (var i = ord.length - 1; i >= 0; i--){
    var id = ord[i], s = SCHERMO[id], el = etichette[id];
    if (!el) continue;
    if (!el._w){ el._w = el.offsetWidth; el._h = el.offsetHeight; }
    var w = el._w, h = el._h, x = s.x - w / 2;
    var nat = s.y < centroS.y, cur = el._sopra === undefined ? nat : el._sopra;
    var lato = function(sopra){
      var y = sopra ? s.y - s.r * 1.25 - h - 2 : s.y + s.r * 1.25 + 2;
      var dentro = y > 62 && y + h < H - 6, sov = 0;
      messe.forEach(function(r){ sov += Math.max(0, Math.min(x + w, r.x + r.w) - Math.max(x, r.x)) * Math.max(0, Math.min(y + h, r.y + r.h) - Math.max(y, r.y)); });
      return { sopra: sopra, y: y, dentro: dentro, sov: sov };
    };
    var a = lato(cur), b = lato(!cur), scelto = a;
    if (!a.dentro && !b.dentro) scelto = (s.y < H / 2) === a.sopra ? b : a;      // nessuno dei due entra: verso il centro dello schermo
    else if (!a.dentro) scelto = b;
    else if (b.dentro && b.sov < a.sov * 0.5 - 40) scelto = b;                    // dall'altra parte c'è molto più posto
    else if (b.dentro && b.sopra === nat && a.sov <= 0 && b.sov <= 0) scelto = b; // torna al lato naturale quando è libero
    el._sopra = scelto.sopra;
    messe.push({ x: x, y: scelto.y, w: w, h: h });
    var copEt = Math.min(1, scelto.sov / (w * h) * 1.6);
    el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + scelto.y.toFixed(1) + 'px,0)';
    var vis = Math.round((1 - 0.82 * Math.max(s.cop, copEt * 0.9)) * 20) / 20;
    if (el._vis !== vis){ el._vis = vis; el.style.setProperty('--vis', String(vis)); }
  }
}
function aggiornaSegno(){
  if (!segnoB) return;
  var t = MONDI.studio, vis = DOVE === 'studio' && !salto && t.pin.material.uniforms.uLuce.value > 0.6;
  segnoB.classList.toggle('su', vis);
  if (!vis) return;
  proietta(bolognaW, segnoS);
  segnoB.style.transform = 'translate3d(' + segnoS.x.toFixed(1) + 'px,' + segnoS.y.toFixed(1) + 'px,0)';
}
function colpito(x, y){
  if (DOVE !== 'centro' || salto || !pronto) return null;
  /* fra i mondi sotto il puntatore vince il più vicino; uno nascosto dietro Nemesi non si prende */
  var best = null, bd = 1e9;
  SEZIONI.forEach(function(id){
    var s = SCHERMO[id]; var dd = Math.hypot(x - s.x, y - s.y);
    if (copertura(s, centroS) > 0.55) return;
    var rr = Math.max(s.r * 1.45, 34);
    var p = MONDI[id].punto.material.uniforms.uPos.value; var sp = proietta(p, {});
    var dp = Math.hypot(x - sp.x, y - sp.y);
    var dmin = Math.min(dd / rr, dp / 30);
    if (dmin < 1 && s.d < bd){ bd = s.d; best = id; }
  });
  return best;
}
function suNemesi(x, y){ return DOVE === 'centro' && !salto && pronto && Math.hypot(x - centroS.x, y - centroS.y) < centroS.r * 1.12; }
function impostaHover(id){
  if (hover === id) return;
  hover = id;
  SEZIONI.forEach(function(k){ etichette[k].classList.toggle('on', k === id); });
}
/* manina: aperta sul mondo centrale, chiusa mentre lo si gira, dito sui mondi */
function cursore(x, y){
  canvas.style.cursor = SIS.presa ? 'grabbing' : hover ? 'pointer' : (x !== undefined && suNemesi(x, y)) ? 'grab' : '';
}
var rotAsse = new V3(), rotQ = new THREE.Quaternion(), rotV = new V3();
function giraSistema(dx, dy, dtMs){
  /* trascinare di un raggio di Nemesi gira il blocco di un radiante: la superficie segue il dito */
  var p = SIS.presa, l = Math.hypot(dx, dy); if (l < 0.01) return;
  var ang = l / Math.max(40, p.r);
  rotAsse.set(dy / l, dx / l, 0).applyQuaternion(camera.quaternion).normalize();
  rotQ.setFromAxisAngle(rotAsse, ang); SIS.q.premultiply(rotQ).normalize();
  var dts = Math.max(8, dtMs) / 1000;
  rotV.copy(rotAsse).multiplyScalar(Math.min(7, ang / dts));
  SIS.w.lerp(rotV, 0.5);
}
function lasciaSistema(e){
  var p = SIS.presa; if (!p) return;
  SIS.presa = null;
  /* se il dito era fermo prima di lasciare, niente spinta */
  var fermo = performance.now() - p.ultimo; SIS.w.multiplyScalar(Math.exp(-Math.max(0, fermo - 30) / 70));
  try { if (e && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); } catch (er){}
  cursore(e ? e.clientX : undefined, e ? e.clientY : undefined);
}
canvas.addEventListener('pointermove', function(e){
  var p = SIS.presa;
  if (p && e.pointerId === p.id){
    var ora = performance.now();
    giraSistema(e.clientX - p.x, e.clientY - p.y, ora - p.ultimo);
    p.x = e.clientX; p.y = e.clientY; p.ultimo = ora;
    return;
  }
  PAR.tx = (e.clientX / W - 0.5) * 2; PAR.ty = -(e.clientY / H - 0.5) * 2;
  if (e.pointerType === 'mouse'){ sottoMouse = colpito(e.clientX, e.clientY); impostaHover(sottoMouse); cursore(e.clientX, e.clientY); }
});
canvas.addEventListener('pointerleave', function(){ if (SIS.presa) return; sottoMouse = null; impostaHover(null); cursore(); PAR.tx = 0; PAR.ty = 0; });
var giuP = null;
canvas.addEventListener('pointerdown', function(e){
  giuP = { x: e.clientX, y: e.clientY, t: performance.now() };
  if (e.button > 0 || DOVE !== 'centro' || salto || !pronto || SIS.presa) return;
  /* si prende il blocco dal mondo centrale o dallo spazio vuoto; sopra un mondo vale il clic */
  if (colpito(e.clientX, e.clientY)) return;
  SIS.presa = { id: e.pointerId, x: e.clientX, y: e.clientY, ultimo: performance.now(), r: centroS.r };
  SIS.w.set(0, 0, 0); SIS.k = 1;
  try { canvas.setPointerCapture(e.pointerId); } catch (er){}
  cursore();
});
canvas.addEventListener('pointercancel', lasciaSistema);
canvas.addEventListener('lostpointercapture', function(e){ if (SIS.presa && e.pointerId === SIS.presa.id) lasciaSistema(e); });
canvas.addEventListener('pointerup', function(e){
  if (SIS.presa && e.pointerId === SIS.presa.id) lasciaSistema(e);
  if (!giuP) return; var mosso = Math.hypot(e.clientX - giuP.x, e.clientY - giuP.y); giuP = null;
  if (mosso > 12) return;
  var id = colpito(e.clientX, e.clientY);
  if (id){ vai(id); return; }
  /* un clic sul mondo centrale manda un'onda di luce nelle crepe */
  if (suNemesi(e.clientX, e.clientY)){
    SIS.w.set(0, 0, 0);
    NEMESI.mat.uniforms.uImp.value = 0; NEMESI.mat.uniforms.uAccP.value.copy(camera.position).normalize();
  }
});
SEZIONI.forEach(function(id){
  var el = etichette[id];
  el.addEventListener('mouseenter', function(){ sottoMouse = id; impostaHover(id); });
  el.addEventListener('mouseleave', function(){ sottoMouse = null; impostaHover(null); });
  el.addEventListener('focus', function(){ var v = true; try { v = el.matches(':focus-visible'); } catch (e){} if (v) impostaHover(id); });
  el.addEventListener('blur', function(){ impostaHover(null); });
});
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-vai]');
  if (!a) return;
  e.preventDefault(); menu(false);
  vai(a.getAttribute('data-vai'));
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape'){
    if (hdr.classList.contains('open')){ menu(false); burger.focus(); return; }
    if (DOVE !== 'centro') vai('centro');
  }
});

/* ════════════════════════════ pannelli ════════════════════════════ */
function apriPannello(id){
  var p = pannelli[id]; if (!p) return;
  p.hidden = false; p.classList.remove('via'); void p.offsetWidth; p.classList.add('on');
}
function fuocoPannello(id){
  var p = pannelli[id], t = p && p.querySelector('.titolo');
  if (t) try { t.focus({ preventScroll: true }); } catch (e){}
}
function chiudiPannello(id){
  var p = pannelli[id]; if (!p || p.hidden) return;
  p.classList.remove('on'); p.classList.add('via');
  setTimeout(function(){ if (!p.classList.contains('on')){ p.classList.remove('via'); p.hidden = true; } }, 320);
}
function segnaBarra(id){
  hdr.querySelectorAll('.links a').forEach(function(a){ if (a.getAttribute('data-vai') === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
}

/* ════════════════════════════ il salto ════════════════════════════ */
function luciLinee(id, k){
  SEZIONI.forEach(function(s){ MONDI[s].lineaLuce = s === id ? 1 + 1.3 * k : 1 - 0.7 * k; });
}
function luciSezione(id){
  SEZIONI.forEach(function(s){ MONDI[s].lineaLuce = s === id ? 0.32 : 0.16; });
}
/* curva di Bézier quadratica (con s < 0 la camera arretra lungo la tangente iniziale) */
function bezier(p0, c, p1, s, out){
  if (s < 0){ return out.copy(p0).addScaledVector(tmpB.copy(c).sub(p0).normalize(), s * p0.distanceTo(p1)); }
  var u = 1 - s;
  return out.set(0, 0, 0).addScaledVector(p0, u * u).addScaledVector(c, 2 * u * s).addScaledVector(p1, s * s);
}
/* la rotta non passa dentro Nemesi né nei suoi anelli: se ci passa, il punto di controllo si sposta fuori */
function evitaNemesi(p0, p1, ctrl){
  var c = ctrl.clone(), q = new V3(), Rs = R0 * 2.1;
  for (var it = 0; it < 8; it++){
    var min = 1e9, vic = new V3();
    for (var i = 0; i <= 24; i++){ bezier(p0, c, p1, i / 24, q); var l = q.length(); if (l < min){ min = l; vic.copy(q); } }
    if (min >= Rs) break;
    c.addScaledVector(vic.lengthSq() > 1e-6 ? vic.normalize() : new V3(0, 1, 0), (Rs - min) * 2.2 + 0.1);
  }
  return c;
}
/* impulso: sale in fretta e si spegne (t in unità di avanzamento del salto) */
function colpo(t, su, giu){ return t <= 0 ? 0 : E.out3(t / su) * Math.exp(-Math.max(0, t - su) / giu); }

/* in avanti: carica (la camera si tende all'indietro), scatto nell'iperspazio con tunnel e scie, frenata di colpo in orbita e rimbalzo */
function percorsoAvanti(p, da, a, id, ctrl, roll){
  var A = 0.2, B = 0.66, C = MONDI[id].g.position;
  var tA = clamp01(p / A), tR = clamp01((p - A) / (B - A)), tC = clamp01((p - B) / (1 - B));
  CAM.tgt.lerpVectors(da.tgt, C, E.inOut(tA));
  var s;
  if (p < A) s = -0.05 * Math.sin(Math.PI * 0.5 * tA);
  else if (p < B) s = -0.05 + 0.98 * E.in3(tR);
  else s = 0.93 + 0.07 * E.outExpo(tC);
  bezier(da.pos, ctrl, a.pos, s, CAM.pos);
  /* il mondo «atterra»: la camera gli va un poco incontro e torna al suo posto */
  if (p > B && tC < 0.45) CAM.pos.addScaledVector(tmpB.copy(C).sub(a.pos).normalize(), a.pos.distanceTo(C) * 0.055 * Math.sin(Math.PI * tC / 0.45) * (1 - tC));
  /* «vertigine»: mentre si corre verso il mondo il campo si allarga quasi quanto la distanza si accorcia;
     nella carica si stringe (tensione), allo scatto si apre di colpo, all'uscita si richiude con un piccolo pugno */
  var d0 = da.pos.distanceTo(C), fA = da.fov * 0.9;
  var vert = function(pos){ var t = Math.tan(fA * Math.PI / 360) * Math.pow(d0 / Math.max(0.3, pos.distanceTo(C)), 0.8); return Math.min(100, Math.atan(t) * 360 / Math.PI); };
  if (p < A) CAM.fov = mix(da.fov, fA, E.inOut(tA));
  else if (p < B) CAM.fov = Math.min(104, vert(CAM.pos) + 16 * colpo(p - A, 0.03, 0.1));
  else { var fB = vert(bezier(da.pos, ctrl, a.pos, 0.93, new V3())); CAM.fov = mix(fB, a.fov, E.outExpo(tC)) * (1 - 0.06 * Math.sin(Math.PI * Math.min(1, tC / 0.4)) * (tC < 0.4 ? 1 : 0)); }
  if (p < B){ var kO = 1 - E.inOut(tA); CAM.ox = da.ox * kO; CAM.oy = da.oy * kO; }
  else { var kC = E.out3(tC); CAM.ox = a.ox * kC; CAM.oy = a.oy * kC; }
  FX.verso = 1;
  if (p < A){
    FX.warp = 0.16 * E.in2(tA); FX.tunnel = 0; FX.roll = 0;
    FX.scossa = 0.02 * tA; FX.esp = 1 - 0.2 * E.in2(tA);
  } else if (p < B){
    FX.warp = 0.16 + 0.84 * E.out3(tR / 0.22); FX.tunnel = E.in2(clamp01(tR / 0.3)) * 1.1; FX.roll = roll * E.inOut(tR);
    FX.scossa = 0.05 * FX.warp; FX.esp = 1 + 0.08 * FX.warp + 0.3 * colpo(p - A, 0.01, 0.04);
  } else {
    FX.warp = 1 - E.out3(tC / 0.14); FX.tunnel = 1.1 * (1 - E.out3(tC / 0.1)); FX.roll = roll * (1 - E.out3(tC / 0.5));
    FX.scossa = 0.1 * Math.exp(-tC / 0.07); FX.esp = 1 + 0.28 * Math.exp(-tC / 0.06);
  }
  FX.vel = FX.warp;
  FX.flash = 0.32 * Math.exp(-Math.pow((p - A) / 0.012, 2)) + 0.6 * Math.exp(-Math.pow((p - B) / 0.015, 2));
  /* onde d'urto: allo scatto dal centro, all'arrivo intorno al mondo */
  var o1 = (p - A) / 0.3, o2 = (p - B) / 0.24;
  if (o2 > 0 && o2 < 1){ FX.onda = (1 - o2) * 0.9; FX.ondaR = o2 * 1.25; FX.ondaX = 0.5 + CAM.ox; FX.ondaY = 0.5 - CAM.oy; }
  else if (o1 > 0 && o1 < 1){ FX.onda = (1 - o1) * 1.1; FX.ondaR = o1 * 1.6; FX.ondaX = 0.5; FX.ondaY = 0.5; }
  else FX.onda = 0;
  FX.aberr = 0.0011 + FX.warp * 0.016 + (p < A ? 0.004 * tA : 0);
  FX.sfoca = FX.warp * 0.13;
  FX.vign = VIGN + (1 - VIGN) * FX.warp * 0.85;
  FX.bloom = 0.9 + FX.warp * 0.1;
  luciLinee(id, tA);
  polvere.material.uniforms.uLuce.value = 0.035 + FX.warp * 0.1;
}
/* indietro verso il centro: piccola rincorsa verso il mondo, poi la camera viene risucchiata all'indietro con la stessa forza dell'andata */
function percorsoIndietro(p, da, a, ctrl, roll){
  var A = 0.16, B = 0.7;
  var tA = clamp01(p / A), tR = clamp01((p - A) / (B - A)), tC = clamp01((p - B) / (1 - B));
  CAM.tgt.lerpVectors(da.tgt, a.tgt, E.inOut(clamp01((p - A * 0.5) / (B - A * 0.5))));
  var s;
  if (p < A) s = -0.035 * Math.sin(Math.PI * 0.5 * tA);
  else if (p < B) s = -0.035 + 0.965 * E.in2(tR);
  else s = 0.93 + 0.07 * E.outExpo(tC);
  bezier(da.pos, ctrl, a.pos, s, CAM.pos);
  /* all'arrivo la camera va un poco oltre e torna: il sistema intero si assesta */
  if (p > B && tC < 0.45) CAM.pos.addScaledVector(tmpB.copy(a.pos).sub(a.tgt).normalize(), a.pos.distanceTo(a.tgt) * 0.05 * Math.sin(Math.PI * tC / 0.45) * (1 - tC));
  var picco = 74;
  if (p < A) CAM.fov = mix(da.fov, da.fov * 0.9, E.inOut(tA));
  else if (p < B) CAM.fov = mix(da.fov * 0.9, picco, E.out3(tR / 0.35)) + 10 * colpo(p - A, 0.03, 0.1);
  else CAM.fov = mix(picco, a.fov, E.outExpo(tC)) * (1 - 0.05 * Math.sin(Math.PI * Math.min(1, tC / 0.4)) * (tC < 0.4 ? 1 : 0));
  var kO = 1 - E.inOut(p / (A * 2)); CAM.ox = da.ox * kO; CAM.oy = da.oy * kO;
  FX.verso = -1;
  if (p < A){
    FX.warp = 0.14 * E.in2(tA); FX.tunnel = 0; FX.roll = 0; FX.scossa = 0.018 * tA; FX.esp = 1 - 0.18 * E.in2(tA);
  } else if (p < B){
    FX.warp = 0.14 + 0.86 * E.out3(tR / 0.22); FX.tunnel = E.in2(clamp01(tR / 0.3)) * 1.1; FX.roll = roll * E.inOut(tR);
    FX.scossa = 0.045 * FX.warp; FX.esp = 1 + 0.08 * FX.warp + 0.28 * colpo(p - A, 0.01, 0.04);
  } else {
    FX.warp = 1 - E.out3(tC / 0.14); FX.tunnel = 1.1 * (1 - E.out3(tC / 0.1)); FX.roll = roll * (1 - E.out3(tC / 0.5));
    FX.scossa = 0.08 * Math.exp(-tC / 0.07); FX.esp = 1 + 0.24 * Math.exp(-tC / 0.06);
  }
  FX.vel = -FX.warp;
  FX.flash = 0.28 * Math.exp(-Math.pow((p - A) / 0.012, 2)) + 0.5 * Math.exp(-Math.pow((p - B) / 0.015, 2));
  /* onde d'urto: allo scatto si chiude verso il centro, all'arrivo si apre intorno a Nemesi */
  var o1 = (p - A) / 0.28, o2 = (p - B) / 0.26;
  FX.ondaX = 0.5; FX.ondaY = 0.5;
  if (o2 > 0 && o2 < 1){ FX.onda = (1 - o2) * 0.9; FX.ondaR = o2 * 1.4; }
  else if (o1 > 0 && o1 < 1){ FX.onda = (1 - o1) * 0.9; FX.ondaR = (1 - o1) * 1.5; }
  else FX.onda = 0;
  FX.aberr = 0.0011 + FX.warp * 0.016 + (p < A ? 0.004 * tA : 0);
  FX.sfoca = FX.warp * 0.13;
  FX.vign = VIGN + (1 - VIGN) * FX.warp * 0.85;
  FX.bloom = 0.9 + FX.warp * 0.1;
  luciLinee(null, 1 - E.inOut(clamp01(p / B)));
  polvere.material.uniforms.uLuce.value = 0.035 + FX.warp * 0.1;
}
/* tornati al centro, le aste ripartono da Nemesi una dopo l'altra e si accendono sfarfallando */
function riaccendiLinee(){
  SEZIONI.forEach(function(id, i){
    var m = MONDI[id], L = { v: 0 }, S = { f: 0 };
    INTRO.linee[i] = 0;
    gsap.to(L, { v: 1, duration: 0.42, delay: 0.04 + i * 0.09, ease: 'power2.in', onUpdate: function(){ INTRO.linee[i] = L.v; } });
    gsap.to(S, { f: 1, duration: 0.42, delay: 0.4 + i * 0.09, ease: 'none', onUpdate: function(){
      var f = S.f; m.sfarfallio = f < 0.15 ? 0.35 : f < 0.25 ? 1.7 : f < 0.4 ? 0.3 : f < 0.55 ? 1.35 : 1; } });
  });
}
function riposo(){
  FX.warp = 0; FX.vel = 0; FX.flash = 0; FX.onda = 0; FX.aberr = 0.0011; FX.scossa = 0; FX.vign = VIGN; FX.bloom = 0.9;
  FX.sfoca = 0; FX.tunnel = 0; FX.roll = 0; FX.esp = 1;
  polvere.material.uniforms.uLuce.value = 0.035;
}
function quatBologna(){
  /* orientamento della Terra con Bologna rivolta alla camera d'arrivo, un poco verso la notte (luci accese) e il nord in alto */
  var t = MONDI.studio, a = posaSezione('studio');
  var f = a.verso.clone().addScaledVector(SOLE, 0.1).add(new V3(0, 0.06, 0)).normalize();
  var yw = new V3(0, 1, 0).addScaledVector(f, -f.y).normalize();
  var xw = new V3().crossVectors(yw, f);
  var b = t.bologna.clone().normalize();
  var yl = new V3(0, 1, 0).addScaledVector(b, -b.y).normalize();
  var xl = new V3().crossVectors(yl, b);
  var M = new THREE.Matrix4().makeBasis(xw, yw, f).multiply(new THREE.Matrix4().makeBasis(xl, yl, b).transpose());
  var qa = new THREE.Quaternion(); t.asse.updateMatrixWorld(true); t.asse.getWorldQuaternion(qa);
  return qa.invert().multiply(new THREE.Quaternion().setFromRotationMatrix(M));
}
function creaSalto(id, opz){
  var da = { pos: CAM.pos.clone(), tgt: CAM.tgt.clone(), fov: CAM.fov, ox: CAM.ox, oy: CAM.oy };
  var a = id === 'centro' ? posaCentro() : posaSezione(id);
  var avanti = id !== 'centro';
  var dur = avanti ? 2.2 : 1.9;
  /* da una sezione all'altra la rotta gira larga, davanti al mondo centrale, invece di sfiorarlo */
  var ctrl = DOVE !== 'centro' && avanti ? posaCentro().pos.lerp(da.pos.clone().add(a.pos).multiplyScalar(0.5), 0.35) : da.pos.clone().add(a.pos).multiplyScalar(0.5);
  ctrl = evitaNemesi(da.pos, a.pos, ctrl);
  /* nella corsa la camera ruota un poco su se stessa, una volta a destra e una a sinistra */
  rollVerso = -rollVerso;
  var roll = rollVerso * 0.085;
  var J = { p: 0 };
  var tl = gsap.timeline({ paused: !!(opz && opz.fermo), onComplete: function(){ arrivato(id); } });
  tl.to(J, { p: 1, duration: dur, ease: 'none', onUpdate: function(){ if (avanti) percorsoAvanti(J.p, da, a, id, ctrl, roll); else percorsoIndietro(J.p, da, a, ctrl, roll); } });
  if (avanti) tl.call(function(){ apriPannello(id); }, null, dur * 0.74);
  else if (!(opz && opz.fermo)) tl.call(riaccendiLinee, null, dur * 0.7);
  return tl;
}
var rollVerso = 1;
function vai(id, opz){
  opz = opz || {};
  if (!pronto) return;
  if (id !== 'centro' && SEZIONI.indexOf(id) < 0) return;
  if (salto){ prossimo = id; return; }
  if (id === DOVE) return;
  impostaHover(null);
  /* il sistema si ferma dov'è: il salto parte verso il mondo nel punto in cui si trova */
  SIS.presa = null; SIS.w.set(0, 0, 0); SIS.k = 0; sottoMouse = null; canvas.style.cursor = '';
  var dove0 = DOVE;
  if (dove0 !== 'centro') chiudiPannello(dove0);
  MONDI.studio.qBologna = id === 'studio' ? quatBologna() : null;
  if (opz.storia !== false) try { history.pushState({ mondo: id }, '', id === 'centro' ? location.pathname + location.search : '#' + id); } catch (e){}
  segnaBarra(id === 'centro' ? null : id);
  if (RIDOTTO || opz.subito){
    camDa(id === 'centro' ? posaCentro() : posaSezione(id));
    luciLinee(id === 'centro' ? null : id, id === 'centro' ? 0 : 1);
    arrivato(id);
    if (id !== 'centro') apriPannello(id);
    return;
  }
  d.classList.add('salto');
  salto = creaSalto(id);
  salto.play();
}
function arrivato(id){
  var da = DOVE;
  DOVE = id; salto = null; riposo();
  if (id === 'centro') luciLinee(null, 0); else luciSezione(id);
  d.classList.remove('salto');
  d.classList.toggle('in-sezione', id !== 'centro');
  if (id === 'centro' && da !== 'centro' && etichette[da]) try { etichette[da].focus({ preventScroll: true }); } catch (e){}
  if (id !== 'centro') fuocoPannello(id);
  if (prossimo){ var p = prossimo; prossimo = null; if (p !== DOVE) vai(p); }
}
addEventListener('popstate', function(e){
  var id = (e.state && e.state.mondo) || (location.hash.length > 1 ? location.hash.slice(1) : 'centro');
  if (id !== DOVE) vai(id, { storia: false });
});

/* ════════════════════════════ ciclo ════════════════════════════ */
var ultimo = performance.now(), campioni = [], abbassata = 0;
function ciclo(){
  var ora = performance.now(), dt = Math.min(0.05, (ora - ultimo) / 1000); ultimo = ora;
  aggiorna(dt);
  applicaCamera(dt);
  aggiornaSchermo();
  aggiornaSegno();
  disegna();
  /* se il computer fatica, si abbassa un poco la risoluzione (al massimo due volte) */
  if (pronto && !salto && abbassata < 2){
    campioni.push(dt);
    if (campioni.length >= 90){
      var media = campioni.reduce(function(a, b){ return a + b; }, 0) / campioni.length; campioni = [];
      if (media > 0.024){ qualita *= 0.8; abbassata++; dimensiona(); }
    }
  }
}

/* ════════════════════════════ entrata ════════════════════════════ */
function statoFinale(){
  INTRO.acc = 1; INTRO.sole = 1; INTRO.neon = 1; INTRO.atmo = 1; INTRO.linee = [1, 1, 1, 1]; INTRO.mondi = [1, 1, 1, 1];
  SEZIONI.forEach(function(id){ MONDI[id].sfarfallio = 1; });
}
function mostraInterfaccia(subito){
  d.classList.add('pronto');
  if (subito){ SEZIONI.forEach(function(id){ etichette[id].classList.add('su'); }); return; }
  gsap.fromTo(hdr, { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity' });
  SEZIONI.forEach(function(id, i){ setTimeout(function(){ etichette[id].classList.add('su'); }, 350 + i * 90); });
}
function entrata(){
  /* la luce del taglio entra nel mondo: buio, poi le crepe si accendono dal centro, sorge il sole, la camera si allontana e le linee partono verso i mondi */
  var fin = posaCentro();
  var vicino = { pos: fin.tgt.clone().add(fin.pos.clone().sub(fin.tgt).normalize().multiplyScalar(R0 * (verticale() ? 5.6 : 4.3))), tgt: fin.tgt.clone(), fov: fin.fov, ox: 0, oy: 0 };
  camDa(vicino);
  INTRO.acc = 0; INTRO.sole = 0; INTRO.neon = 0; INTRO.atmo = 0; INTRO.linee = [0, 0, 0, 0]; INTRO.mondi = [0, 0, 0, 0];
  NEMESI.mat.uniforms.uAccP.value.copy(vicino.pos).normalize();
  SEZIONI.forEach(function(id){ MONDI[id].sfarfallio = 1; });
  var tl = gsap.timeline({ onComplete: function(){ statoFinale(); pronto = true; window.__ready = true; } });
  var P = { k: 0 };
  tl.to(INTRO, { acc: 1, duration: 2.1, ease: 'power1.inOut' }, 0.74)
    .to(FX, { flash: 0.08, duration: 0.1, ease: 'power2.out' }, 0.76)
    .to(FX, { flash: 0, duration: 0.6, ease: 'power2.in' }, 0.86)
    .to(INTRO, { sole: 1, atmo: 1, duration: 2.2, ease: 'power2.inOut' }, 0.8)
    .to(P, { k: 1, duration: 2.9, ease: 'power3.inOut', onUpdate: function(){
        CAM.pos.lerpVectors(vicino.pos, fin.pos, P.k); CAM.tgt.lerpVectors(vicino.tgt, fin.tgt, P.k); } }, 0.75)
    .to(INTRO, { neon: 1, duration: 1.2, ease: 'power2.inOut' }, 1.35);
  SEZIONI.forEach(function(id, i){
    var t0 = 1.95 + i * 0.2, m = MONDI[id];
    var L = { v: 0 };
    tl.to(L, { v: 1, duration: 0.55, ease: 'power2.in', onUpdate: function(){ INTRO.linee[i] = L.v; } }, t0);
    /* il neon si accende sfarfallando, poi il mondo prende luce */
    var S = { f: 0 };
    tl.to(S, { f: 1, duration: 0.5, ease: 'none', onUpdate: function(){
        var f = S.f; m.sfarfallio = f < 0.12 ? 0.3 : f < 0.2 ? 1.6 : f < 0.3 ? 0.25 : f < 0.42 ? 1.3 : f < 0.5 ? 0.5 : 1; } }, t0 + 0.5);
    var M = { v: 0 };
    tl.to(M, { v: 1, duration: 0.9, ease: 'power2.out', onUpdate: function(){ INTRO.mondi[i] = M.v; } }, t0 + 0.48);
  });
  tl.call(function(){ mostraInterfaccia(false); }, null, 2.6);
  window.__intro = tl;
  return tl;
}

/* ════════════════════════════ avvio ════════════════════════════ */
dimensiona();
camDa(posaCentro());
statoFinale();
var aspetta;
addEventListener('resize', function(){
  clearTimeout(aspetta);
  aspetta = setTimeout(function(){
    dimensiona();
    SEZIONI.forEach(function(id){ etichette[id]._w = 0; });
    if (!salto && pronto){ camDa(DOVE === 'centro' ? posaCentro() : posaSezione(DOVE)); if (DOVE === 'studio') MONDI.studio.qBologna = quatBologna(); }
  }, 140);
});

var avvio = d.classList.contains('avvio');
var subito = Q.has('subito') || RIDOTTO;
var hashIniziale = location.hash.length > 1 ? location.hash.slice(1) : null;
if (hashIniziale && SEZIONI.indexOf(hashIniziale) < 0) hashIniziale = null;
var L = null, saltaVideo, saltato = new Promise(function(r){ saltaVideo = r; });
if (avvio){
  try { if (window.Apertura) L = Apertura.play(pre); } catch (e){ L = null; }
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function(ev){ addEventListener(ev, function(){ saltaVideo(); }, { once: true, passive: true }); });
}
function fontPronti(){ return document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function(r){ setTimeout(r, 2500); })]) : Promise.resolve(); }

caricaTexture().then(function(){
  assegnaTexture();
  /* prima di mostrare: compila gli shader e carica le texture sulla scheda video (sotto il video, non si vede) */
  scie.visible = true;
  try { renderer.compile(scene, camera); } catch (e){}
  scie.visible = false;
  Object.keys(T).forEach(function(k){ try { renderer.initTexture(T[k]); } catch (e){} });
  aggiorna(0); applicaCamera(0); disegna();
  return fontPronti();
}).then(function(){
  gsap.ticker.add(ciclo);
  if (hashIniziale){
    statoFinale(); pronto = true; mostraInterfaccia(true);
    vai(hashIniziale, { subito: true, storia: false });
    try { history.replaceState({ mondo: hashIniziale }, '', '#' + hashIniziale); } catch (e){}
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ window.__ready = true; }); });
    return;
  }
  if (!avvio){
    if (subito){ statoFinale(); camDa(posaCentro()); pronto = true; mostraInterfaccia(true); requestAnimationFrame(function(){ requestAnimationFrame(function(){ window.__ready = true; }); }); }
    else entrata();
    return;
  }
  return Promise.race([L ? L.held : Promise.resolve(), saltato]).then(function(){
    if (L) L.exit(function(){ d.classList.remove('avvio'); });
    else d.classList.remove('avvio');
    entrata();
  });
});

/* ════════════════════════════ prove ════════════════════════════ */
window.__mondi = {
  vai: vai,
  stato: function(){ return { dove: DOVE, salto: !!salto, pronto: pronto, qualita: qualita, hdr: HDR === THREE.HalfFloatType, gl2: GL2 }; },
  /* ferma un salto a metà: __mondi.prova('portfolio', 0.5) */
  prova: function(id, p){
    if (salto){ salto.kill(); salto = null; }
    if (DOVE !== 'centro') chiudiPannello(DOVE);
    MONDI.studio.qBologna = id === 'studio' ? quatBologna() : null;
    camDa(DOVE === 'centro' ? posaCentro() : posaSezione(DOVE)); rollVerso = -1;
    var tl = creaSalto(id, { fermo: true }); d.classList.add('salto'); tl.progress(p); return true;
  },
  hover: function(id){ impostaHover(id); },
  /* mette il sistema a un angolo preciso e lo tiene fermo (per le foto): __mondi.giostra(90) · __mondi.giostra(0, false) lo libera */
  giostra: function(gradi, ferma){ SIS.q.setFromAxisAngle(SU, (gradi || 0) * Math.PI / 180); SIS.w.set(0, 0, 0); SIS.prova = ferma !== false; return true; },
  sistema: function(){ return { q: SIS.q.toArray().map(function(x){ return +x.toFixed(4); }), w: SIS.w.toArray().map(function(x){ return +x.toFixed(3); }), k: +SIS.k.toFixed(3), presa: !!SIS.presa }; },
  fx: function(o){ Object.assign(FX, o); return true; },
  misure: function(){ var o = { W: W, H: H, fov: camera.fov, camFov: CAM.fov, vert: verticale(), dispFov: disposizione().fov, dove: DOVE, cam: camera.position.toArray().map(function(x){ return +x.toFixed(2); }), centro: [centroS.x, centroS.y] };
    SEZIONI.forEach(function(id){ var q = SCHERMO[id]; o[id] = [Math.round(q.x), Math.round(q.y), Math.round(q.r), +q.cop.toFixed(2)]; }); o.nemesi = [Math.round(centroS.x), Math.round(centroS.y), Math.round(centroS.r)]; return o; }
};
})();
