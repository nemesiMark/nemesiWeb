/* Mondi — la home di Nemesi Web (index.html, dalla 3.57; prima pagina di prova mondi.html, 3.55–3.56).
   Dopo il video dell'apertura e il «taglio di luce», la luce entra nel mondo Nemesi (cemento crepato di verde, come il muro del video),
   che gira al centro dello spazio. Linee al neon lo collegano ai mondi; ogni tanto una linea si accende da Nemesi fino al suo mondo e lo illumina:
   Portfolio (gigante ad anelli), Studio (la Terra, Bologna accesa), Tool (luna con le officine; dalla 3.59 le sette icone degli strumenti
   del vecchio sito le girano intorno, ognuna con la sua scia), Contatti (gigante di ghiaccio che manda segnali) e, dalla 3.58, l'Area
   riservata (pianeta di lava). Sopra ogni mondo il suo nome in 3D (lettere fatte in Blender, mondi/nomi.bin; dalla 3.59 in marmo bianco).
   Nemesi, le aste e i mondi sono un solo blocco rigido: gira piano intorno alla verticale e con la «manina» (trascinando) si gira in ogni direzione.
   Clic su un mondo, sul suo nome o sulla barra: la camera vola fino al mondo (dalla 3.58 un viaggio vero: si gira, accelera, rallenta ed entra
   in orbita), poi i contenuti della sezione; il pianeta di lava porta all'area riservata. Esc o «Indietro»: la camera torna al centro.
   Texture cotte in Blender (mondi/blender/*.py), Terra dalle mappe NASA (pubblico dominio). Three.js r147 classico, post-produzione propria (bloom HDR,
   sfocatura di movimento, aberrazione, grana). Contratto di verifica: ?subito (niente video né entrata), window.__ready, window.__mondi. */
(function(){
'use strict';
var d = document.documentElement;
var Q = new URLSearchParams(location.search);
var RIDOTTO = matchMedia('(prefers-reduced-motion: reduce)').matches;
var MOBILE = matchMedia('(pointer: coarse)').matches;
var hdr = document.getElementById('hdr');
var pre = document.getElementById('pre');
var canvas = document.getElementById('gl');
var SEZIONI = ['portfolio', 'studio', 'tool', 'contatti'];        // i mondi con un pannello
var MONDI_ID = SEZIONI.concat(['area']);                          // tutti i mondi: le sezioni e l'area riservata (pianeta di lava)
var AREA = 'area-riservata.html';
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
  document.querySelectorAll('[data-vai]').forEach(function(a){ var id = a.getAttribute('data-vai'); if (a.tagName === 'A' && id !== 'area') a.setAttribute('href', id === 'centro' ? '#' : '#p-' + id); });
  hdr.querySelectorAll('.links a').forEach(function(a){ a.addEventListener('click', function(){ menu(false); }); });
  /* le etichette dei mondi fanno da indice: portano alla loro sezione (quella dell'area riservata alla sua pagina) */
  document.querySelectorAll('.et').forEach(function(b){ b.addEventListener('click', function(){
    var id = b.getAttribute('data-vai');
    if (id === 'area'){ location.href = AREA; return; }
    var p = pannelli[id]; if (p) p.scrollIntoView({ behavior: RIDOTTO ? 'auto' : 'smooth', block: 'start' }); }); });
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
  gigante: 'gigante-colore.jpg', lunaC: 'luna-colore.jpg', lunaN: 'luna-normale.jpg', lunaL: 'luna-luce.jpg', ghiaccio: 'ghiaccio-colore.jpg',
  lavaC: 'lava-colore.jpg', lavaN: 'lava-normale.jpg', lavaL: 'lava-luce.jpg'
};
var PICCOLE = { gigante: 1, ghiaccio: 1, lunaC: 1, lunaN: 1, lunaL: 1, nemesiN: 1, terraM: 1, terraN: 1, lavaC: 1, lavaN: 1, lavaL: 1 };   // bastano a metà lato anche sul computer
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
/* nomi in 3D (mondi/nomi.bin, da mondi/blender/nomi.py): per ogni mondo posizioni uint16 dentro la scatola della scritta,
   normali int8 e indici; maiuscole alte 1, centro in (0, 0, 0), facciata verso +Z */
var NOMI = {};
function caricaNomi(){
  if (!window.fetch) return Promise.resolve();
  return fetch('mondi/nomi.bin?v=1').then(function(r){ if (!r.ok) throw new Error('nomi ' + r.status); return r.arrayBuffer(); }).then(function(buf){
    var dv = new DataView(buf), o = 12, i;
    var pad = function(){ o = (o + 3) & ~3; };
    if (String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) !== 'NOMI') throw new Error('nomi: formato');
    for (var k = 0, n = dv.getUint32(8, true); k < n; k++){
      var l = dv.getUint8(o), id = '';
      for (i = 0; i < l; i++) id += String.fromCharCode(dv.getUint8(o + 1 + i));
      o += 1 + l; pad();
      var mn = [], mx = [];
      for (i = 0; i < 3; i++){ mn.push(dv.getFloat32(o + i * 4, true)); mx.push(dv.getFloat32(o + 12 + i * 4, true)); }
      o += 24;
      var nv = dv.getUint32(o, true), ni = dv.getUint32(o + 4, true); o += 8;
      var q = new Uint16Array(buf, o, nv * 3); o += nv * 6;
      var nn = new Int8Array(buf, o, nv * 3); o += nv * 3; pad();
      var grande = nv > 65535, idx = grande ? new Uint32Array(buf, o, ni) : new Uint16Array(buf, o, ni); o += ni * (grande ? 4 : 2); pad();
      var pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3);
      for (i = 0; i < nv * 3; i++){ var a = i % 3; pos[i] = mn[a] + q[i] / 65535 * (mx[a] - mn[a]); nor[i] = nn[i] / 127; }
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
      g.setIndex(new THREE.BufferAttribute(grande ? new Uint32Array(idx) : new Uint16Array(idx), 1));
      NOMI[id] = { geo: g, w: mx[0] - mn[0], h: mx[1] - mn[1] };
    }
  }).catch(function(e){ NOMI = {}; try { console.warn('nomi in 3D: ' + (e && e.message)); } catch (er){} });   // senza nomi in 3D restano quelli scritti
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
  'uniform vec3 uCentro; uniform vec3 uAnN; uniform vec2 uAnR; uniform float uAcc; uniform vec3 uAccP; uniform float uImp; uniform float uSel; uniform float uAlb; uniform float uPunto;',
  'uniform float uTempo; uniform float uLampo; uniform vec3 uLampoP; uniform vec3 uLampoCol;',
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
  '  #ifdef LAVA',
  /* lava: accesa di giorno e di notte, con un tremolio lento; dove è più calda tende al giallo */
  '  float e = texture2D(tLuce, vUv).r;',
  '  float tremo = 0.8 + 0.2 * sin(uTempo * 1.6 + e * 9.0 + vUv.x * 70.0) * sin(uTempo * 0.85 + vUv.y * 45.0);',
  '  vec3 em = uLuceCol * (e * e * 1.25 + e * 0.1) * tremo * (0.6 + notte * 0.4);',
  '  em += vec3(1.0, 0.72, 0.36) * smoothstep(0.62, 1.0, e) * 1.4 * tremo;',
  '  col += em * uLuceF;',
  '  #elif defined(LUCE)',
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
  /* accensione: la luce arrivata dalla linea illumina la faccia rivolta a Nemesi (dalla 3.59 senza l'onda che correva sul mondo) */
  /* dalla 3.65 dove la linea tocca il mondo resta un punto verde acceso: anche sul lato in ombra si vede che la linea arriva */
  '  if (uPunto > 0.001){ float cp = max(dot(Ng, uLampoP), 0.0); col += vec3(0.62, 0.98, 0.14) * uPunto * (pow(cp, 1400.0) * 2.2 + pow(cp, 160.0) * 0.22); }',
  '  if (uLampo > 0.001){',
  '    float faccia = smoothstep(-0.25, 1.0, dot(Ng, uLampoP));',
  '    col += uLampoCol * uLampo * (alb * faccia * 1.1 + fr * 0.55);',
  '  }',
  '  gl_FragColor = vec4(col, 1.0);',
  '}'
].join('\n');

/* atmosfera: guscio poco più grande; la luce dipende da quanto il raggio di vista sfiora il pianeta */
var VS_MONDO = 'varying vec3 vPw; void main(){ vec4 pw = modelMatrix * vec4(position, 1.0); vPw = pw.xyz; gl_Position = projectionMatrix * viewMatrix * pw; }';
var FS_ATMO = [
  'uniform vec3 uCentro; uniform float uR; uniform float uRa; uniform vec3 uSole; uniform vec3 uAtmo; uniform float uF; uniform float uPot; uniform float uSel;',
  'uniform float uLampo; uniform vec3 uLampoCol; uniform float uBasso;',
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
  '  gl_FragColor = vec4((uAtmo * glow * (luce + contro * 1.3 + uSel * 0.7 + uBasso + uLampo * 1.4) + uLampoCol * glow * uLampo * 0.35) * uF, 1.0);',
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

/* anelli al neon intorno a Nemesi (il taglio di luce diventato orbita): dalla 3.58 sono tubi veri (toro), con un secondo tubo
   largo e tenue per l'alone. Un tubo ha lo stesso spessore da ogni parte: prima erano anelli piatti, che visti di taglio
   diventavano sottilissimi e a puntini */
var VS_TUBO = 'varying vec2 vUv; varying vec3 vN; varying vec3 vPw; void main(){ vUv = uv; vec4 pw = modelMatrix * vec4(position, 1.0); vPw = pw.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * pw; }';
var FS_TUBO = [
  'uniform vec3 uCol; uniform float uDis; uniform float uLuce; uniform float uTempo; uniform float uAlone;',
  'varying vec2 vUv; varying vec3 vN; varying vec3 vPw;',
  'void main(){',
  '  float ang = vUv.x;',
  '  if (ang > uDis) discard;',
  '  float f = abs(dot(normalize(vN), normalize(cameraPosition - vPw)));',   /* 1 al centro del tubo, 0 ai bordi */
  '  float testa = exp(-pow((ang - uDis) * 40.0, 2.0)) * (1.0 - step(0.999, uDis));',
  '  float imp = exp(-pow(fract(ang - uTempo * 0.06) * 9.0 - 4.5, 2.0)) * 0.8;',
  '  vec3 c = uAlone > 0.5 ? uCol * pow(f, 2.2) * 0.13 * (1.0 + testa * 2.5 + imp * 0.7)',
  '                        : uCol * pow(f, 0.6) * (0.85 + testa * 4.0 + imp) + vec3(1.0, 1.0, 0.92) * pow(f, 5.0) * 0.75;',
  '  gl_FragColor = vec4(c * uLuce, 1.0);',
  '}'
].join('\n');

/* linee al neon: nastro sempre rivolto alla camera, tagliato davanti alla camera; l'accensione (uAccT = dove è arrivata la luce,
   uAccF = forza) parte da Nemesi e corre fino al mondo, lasciando la linea accesa dietro di sé */
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
  'uniform vec3 uCol; uniform float uLuce; uniform float uDis; uniform float uAccT; uniform float uAccF; uniform vec4 uEt[5]; uniform float uLarga;',
  'varying float vT; varying float vX;',
  'void main(){',
  '  if (vT > uDis) discard;',
  /* dietro i nomi dei mondi la linea si interrompe (uEt: zone dei nomi in pixel, dal basso) */
  '  float dietroNome = 1.0;',
  '  for (int k = 0; k < 5; k++){ vec2 q = max(uEt[k].xy - gl_FragCoord.xy, gl_FragCoord.xy - uEt[k].zw); dietroNome = min(dietroNome, smoothstep(-1.0, 7.0, max(q.x, q.y))); }',
  '  if (dietroNome < 0.002) discard;',
  '  float x = abs(vX) * uLarga;',   /* uLarga: il nastro è largo uLarga volte la linea, per l'alone della luce che corre */
  '  float core = exp(-x * x * 34.0); float alone = exp(-x * x * 4.0) * 0.12;',
  '  float dietro = uAccT - vT;',
  '  float scia = uAccF * step(0.0, dietro) * (0.5 + 0.5 * exp(-dietro * 3.0));',
  '  float testaA = uAccF * exp(-pow(dietro * 26.0, 2.0)) * step(uAccT, 1.02);',
  '  float bagliore = testaA * exp(-x * x * 0.35) * 0.9;',
  '  float testa = exp(-pow((vT - uDis) * 26.0, 2.0)) * (1.0 - step(0.999, uDis));',
  '  float bordi = smoothstep(0.0, 0.04, vT);',
  '  float k = scia * 1.3 + testaA * 6.0 + testa * 5.0;',
  '  vec3 c = uCol * (alone * (1.0 + k * 0.8) + core * (0.85 + k) + bagliore) + vec3(1.0, 1.0, 0.92) * (core * core * core * (0.65 + scia * 0.7 + (testaA + testa) * 2.2) + bagliore * 0.5);',
  '  gl_FragColor = vec4(c * uLuce * bordi * dietroNome, 1.0);',
  '}'
].join('\n');

/* puntino di Bologna sulla Terra: quadrato rivolto alla camera, a misura fissa in pixel */
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
  'uniform vec3 uCol; uniform float uTempo; uniform float uSel; uniform float uSegnale; uniform float uR; uniform float uLuce; uniform vec4 uEt[5];',
  'varying vec2 vQ;',
  'void main(){',
  '  float r = length(vQ); if (r > 1.0) discard;',
  /* come le linee, anelli e onde passano dietro i nomi dei mondi senza attraversarli */
  '  float dietroNome = 1.0;',
  '  for (int k = 0; k < 5; k++){ vec2 q = max(uEt[k].xy - gl_FragCoord.xy, gl_FragCoord.xy - uEt[k].zw); dietroNome = min(dietroNome, smoothstep(-1.0, 7.0, max(q.x, q.y))); }',
  '  if (dietroNome < 0.002) discard;',
  /* dalla 3.62 niente più cerchio con le tacche col mouse sopra: si accende di rosso il nome in 3D */
  '  float s = 0.0;',
  '  for (int k = 0; k < 3; k++){ float o = fract(uTempo * 0.22 + float(k) / 3.0); float rr = mix(uR * 0.72, 1.0, o); s += exp(-pow((r - rr) * 60.0, 2.0)) * pow(1.0 - o, 1.6); }',
  '  vec3 c = uCol * (s * uSegnale * 0.32);',
  '  gl_FragColor = vec4(c * uLuce * dietroNome, 1.0);',
  '}'
].join('\n');

/* stelle, polvere vicina, pulviscolo del viaggio */
var VS_STELLE = [
  'attribute vec3 aCol; attribute float aDim; attribute float aFase;',
  'uniform float uTempo; uniform float uPx; varying vec3 vCol;',
  'void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;',
  '  float tw = 0.75 + 0.25 * sin(uTempo * (0.7 + aFase * 2.8) + aFase * 60.0);',
  '  vCol = aCol * tw; gl_PointSize = max(1.0, aDim * uPx); }'
].join('\n');
var FS_STELLE = 'varying vec3 vCol; void main(){ vec2 q = gl_PointCoord - 0.5; float a = exp(-dot(q, q) * 22.0); gl_FragColor = vec4(vCol * a, 1.0); }';
var VS_POLVERE = [
  'attribute float aDim; attribute float aFase; uniform float uTempo; uniform float uScala; varying float vA;',
  'void main(){ vec3 p = position; p.y += sin(uTempo * 0.07 + aFase * 6.28) * 0.35; p.x += cos(uTempo * 0.05 + aFase * 9.0) * 0.35;',
  '  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; float z = -mv.z;',
  '  gl_PointSize = clamp(uScala * aDim / max(z, 0.1), 1.0, 160.0); vA = smoothstep(0.6, 3.0, z) * (1.0 - smoothstep(16.0, 30.0, z)); }'
].join('\n');
var FS_POLVERE = 'uniform float uLuce; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5) * 2.0; float a = (1.0 - smoothstep(0.82, 1.0, r)) * (0.5 + 0.5 * smoothstep(0.35, 0.95, r)); gl_FragColor = vec4(vec3(0.72, 0.82, 0.66) * a * vA * uLuce, 1.0); }';
/* pulviscolo del viaggio: granelli fermi nello spazio lungo la rotta, illuminati dal sole; mentre la camera corre ognuno
   lascia una scia lunga quanto il suo movimento sullo schermo in 1/60 di secondo (uPrima = camera di un attimo prima) */
var VS_PULV = [
  'attribute vec3 aP; attribute float aB;',
  'uniform mat4 uPrima; uniform float uPx; uniform vec2 uRis; uniform float uF; uniform float uScatto;',
  'varying float vA; varying vec2 vQ;',
  'void main(){',
  '  vec4 ch = projectionMatrix * viewMatrix * vec4(aP, 1.0);',
  '  vec4 ct = uPrima * vec4(aP, 1.0);',
  '  vA = 0.0; vQ = position.xy;',
  '  if (uF < 0.001 || ch.w < 0.12 || ct.w < 0.12){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }',
  '  vec2 a = ch.xy / ch.w; vec2 b = a + (ct.xy / ct.w - a) * uScatto;',
  '  vec2 d = (a - b) * uRis * 0.5; float l = length(d);',
  '  vec2 dir = l > 0.01 ? d / l : vec2(1.0, 0.0);',
  '  float w = uPx * (0.55 + aB * 0.35);',
  '  vec2 p = mix(b, a, position.x) + (dir * (position.x * 2.0 - 1.0) * w + vec2(-dir.y, dir.x) * position.y * w) / (uRis * 0.5);',
  '  gl_Position = vec4(p, ch.z / ch.w, 1.0);',
  '  vA = aB * uF * w / (w + l * 0.4) * smoothstep(0.3, 1.4, ch.w) * (1.0 - smoothstep(9.0, 16.0, ch.w));',
  '}'
].join('\n');
var FS_PULV = 'varying float vA; varying vec2 vQ; void main(){ float a = exp(-vQ.y * vQ.y * 2.6) * vA; gl_FragColor = vec4(vec3(0.86, 0.88, 0.84) * a, 1.0); }';
/* nomi dei mondi in 3D (dalla 3.59 in marmo bianco): fondo bianco caldo appena nuvoloso con venature grigie leggere (nello spazio
   della scritta, così restano ferme sulle lettere), luce morbida che avvolge anche il lato in ombra, lucido sullo smusso e sulla facciata,
   fianchi un poco più scuri; col mouse sopra (dalla 3.62) la scritta si illumina di rosso. Facciata = normale dell'oggetto verso +Z, maiuscole alte 1 */
var VS_NOME = [
  'varying vec3 vNo; varying vec3 vNw; varying vec3 vPw; varying vec3 vPo;',
  'void main(){ vNo = normal; vPo = position; vec4 pw = modelMatrix * vec4(position, 1.0); vPw = pw.xyz; vNw = normalize(mat3(modelMatrix) * normal);',
  '  gl_Position = projectionMatrix * viewMatrix * pw; }'
].join('\n');
var FS_NOME = [
  'uniform vec3 uSole; uniform vec3 uSoleCol; uniform vec3 uRosso; uniform float uSel; uniform float uLuce; uniform float uSeme;',
  'varying vec3 vNo; varying vec3 vNw; varying vec3 vPw; varying vec3 vPo;',
  'float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
  'float rumore(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),',
  '             mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0)), f.x), f.y), f.z); }',
  'float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int k = 0; k < 4; k++){ s += a * rumore(p); p = p * 2.03 + 1.7; a *= 0.5; } return s; }',
  'void main(){',
  '  vec3 N = normalize(vNw); vec3 V = normalize(cameraPosition - vPw);',
  '  float nz = normalize(vNo).z;',
  '  float fronte = smoothstep(0.93, 0.995, nz);',
  '  float smusso = (1.0 - fronte) * smoothstep(0.05, 0.45, nz);',
  '  float fianco = max(0.0, 1.0 - fronte - smusso);',
  /* marmo: una vena principale mossa con il suo alone e venine più sottili, grigio azzurre; non troppo fini (le lettere sono alte
     pochi pixel: una vena di un pixel sfarfallerebbe) */
  '  vec3 p = vPo + vec3(uSeme, uSeme * 0.37, 0.0);',
  '  float f = fbm(p * 1.3);',
  '  float s1 = abs(sin((p.x * 0.55 + p.y * 1.25 + f * 3.4) * 3.1));',
  '  float s2 = abs(sin((p.x * 1.4 - p.y * 0.8 + fbm(p * 2.6 + 4.0) * 2.6) * 4.3));',
  '  float vena = (1.0 - smoothstep(0.0, 0.22, s1)) * 0.62 + (1.0 - smoothstep(0.0, 0.7, s1)) * 0.16 + (1.0 - smoothstep(0.0, 0.13, s2)) * 0.32;',
  '  vec3 alb = vec3(0.9, 0.885, 0.85) * (0.93 + 0.07 * fbm(p * 4.0)) * (0.93 + 0.1 * clamp(vPo.y + 0.5, 0.0, 1.0));',
  '  alb = mix(alb, vec3(0.42, 0.45, 0.5), clamp(vena, 0.0, 1.0) * 0.55);',
  '  float avv = clamp((dot(N, uSole) + 0.5) / 1.5, 0.0, 1.0);',
  '  vec3 sole = mix(uSoleCol, vec3(dot(uSoleCol, vec3(0.3333))), 0.55);',
  '  vec3 cielo = mix(vec3(0.2, 0.21, 0.25), vec3(0.42, 0.43, 0.46), clamp(N.y * 0.5 + 0.5, 0.0, 1.0));',
  '  vec3 col = alb * (cielo + sole * avv * 0.5);',
  /* lucido: riflesso netto del sole e del cielo, più forte sullo smusso */
  '  vec3 Hh = normalize(uSole + V); float nh = max(dot(N, Hh), 0.0);',
  '  float fr = 0.04 + 0.96 * pow(clamp(1.0 - dot(N, V), 0.0, 1.0), 5.0);',
  '  vec3 R = reflect(-V, N);',
  '  vec3 env = mix(vec3(0.02, 0.022, 0.03), vec3(0.42, 0.43, 0.46), smoothstep(-0.2, 0.9, R.y));',
  '  col += sole * (pow(nh, 160.0) * 1.2 + pow(nh, 30.0) * 0.06) * (fronte + smusso * 1.4) + env * fr * 0.8;',
  '  col *= 1.0 - 0.32 * fianco;',
  /* col mouse sopra (dalla 3.62) la scritta si illumina di rosso: facciata tinta, smusso e fianchi accesi (il bloom fa l'alone) */
  '  col = mix(col, col * vec3(0.85, 0.16, 0.12) + uRosso * (fronte * 0.75 + smusso * 2.4 + fianco * 1.0), uSel);',
  '  gl_FragColor = vec4(col, uLuce);',
  '}'
].join('\n');
/* scie delle icone degli strumenti (dalla 3.59): nastro lungo l'orbita dietro l'icona, sempre rivolto alla camera.
   L'orbita è un cerchio (centro uC, raggio uR, piano uE1–uE2), uA = angolo dell'icona, uArco = quanto è lunga la scia (radianti);
   aS = 0 all'icona, 1 in fondo alla scia. Largo uLarg nel mondo, mai meno di uPx pixel (da lontano resta una scia sottile) */
var VS_SCIA = [
  'attribute float aS; attribute float aLato;',
  'uniform vec3 uC; uniform vec3 uE1; uniform vec3 uE2; uniform float uR; uniform float uA; uniform float uArco;',
  'uniform float uLarg; uniform float uPx; uniform vec2 uRis;',
  'varying float vS; varying float vX;',
  'void main(){',
  '  float th = uA - uArco * aS;',
  '  vec3 p = uC + (uE1 * cos(th) + uE2 * sin(th)) * uR;',
  '  vec3 tg = uE2 * cos(th) - uE1 * sin(th);',
  '  vec4 c = projectionMatrix * viewMatrix * vec4(p, 1.0);',
  '  vec4 c2 = projectionMatrix * viewMatrix * vec4(p + tg * 0.02, 1.0);',
  '  vS = aS; vX = aLato;',
  '  if (c.w < 0.05 || c2.w < 0.05){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }',
  '  vec2 d = (c2.xy / c2.w - c.xy / c.w) * uRis;',
  '  vec2 dir = length(d) > 0.0001 ? normalize(d) : vec2(1.0, 0.0);',
  '  float px = max(uPx, uLarg * projectionMatrix[1][1] * uRis.y * 0.5 / c.w) * (1.0 - 0.7 * aS);',
  '  c.xy += vec2(-dir.y, dir.x) * aLato * px / (uRis * 0.5) * c.w;',
  '  gl_Position = c;',
  '}'
].join('\n');
var FS_SCIA = [
  'uniform vec3 uCol; uniform vec3 uFig[5]; uniform float uMulti; uniform float uLuce; uniform vec4 uEt[5];',
  'varying float vS; varying float vX;',
  'void main(){',
  '  float dietroNome = 1.0;',
  '  for (int k = 0; k < 5; k++){ vec2 q = max(uEt[k].xy - gl_FragCoord.xy, gl_FragCoord.xy - uEt[k].zw); dietroNome = min(dietroNome, smoothstep(-1.0, 7.0, max(q.x, q.y))); }',
  '  if (dietroNome < 0.002) discard;',
  /* Figma ha un marchio a cinque colori: la sua scia li attraversa tutti */
  '  vec3 col = uCol;',
  '  if (uMulti > 0.5){ float t = clamp(vS, 0.0, 1.0) * 4.0; col = uFig[0]; for (int k = 0; k < 4; k++) col = mix(col, uFig[k + 1], clamp(t - float(k), 0.0, 1.0)); }',
  '  float x = abs(vX);',
  '  float core = exp(-x * x * 10.0); float alone = exp(-x * x * 2.5) * 0.3;',
  /* la scia nasce da dietro l'icona (quando l'icona si allontana la scia le passa davanti: lì resta tenue, così il marchio si legge);
     clamp: in fondo alla scia vS può superare 1 di un soffio, e pow di un numero negativo dà NaN, che il bloom allarga in un puntino bianco */
  '  float coda = pow(clamp(1.0 - vS, 0.0, 1.0), 1.6) * smoothstep(0.03, 0.17, vS);',
  '  vec3 c = col * (core + alone) * coda * 1.7 + vec3(1.0, 1.0, 0.95) * pow(core, 4.0) * coda * coda * 0.5;',
  '  gl_FragColor = vec4(c * uLuce * dietroNome, 1.0);',
  '}'
].join('\n');

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
  'uniform sampler2D tScena; uniform sampler2D tBloom; uniform float uBloom; uniform float uEsp; uniform float uAberr;',
  'uniform float uFlash; uniform float uVign; uniform float uTempo; uniform vec2 uRis; uniform float uSfoca; uniform vec2 uSfocaC;',
  'varying vec2 vUv;',
  'vec3 aces(vec3 x){ return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }',
  'float hash(vec2 p){ p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }',
  'void main(){',
  '  vec2 asp = vec2(uRis.x / uRis.y, 1.0);',
  '  vec2 c0 = vec2(0.5);',
  '  vec2 dd = (vUv - c0) * asp; float rr = length(dd);',
  '  float ab = uAberr * (0.25 + dot(dd, dd) * 1.6);',
  '  vec3 col;',
  '  if (uSfoca > 0.0005){',
  /* sfocatura di movimento: radiale intorno al punto verso cui va la camera */
  '    vec2 dir = vUv - uSfocaC; vec3 acc = vec3(0.0);',
  '    for (int i = 0; i < 8; i++){ float f = 1.0 - uSfoca * float(i) / 7.0; vec2 p = uSfocaC + dir * f; vec2 q = (p - c0) * ab;',
  '      acc += vec3(texture2D(tScena, p + q).r, texture2D(tScena, p).g, texture2D(tScena, p - q).b); }',
  '    col = acc / 8.0;',
  '  } else {',
  '    vec2 dir = vUv - c0;',
  '    col = vec3(texture2D(tScena, c0 + dir * (1.0 + ab)).r, texture2D(tScena, vUv).g, texture2D(tScena, c0 + dir * (1.0 - ab)).b);',
  '  }',
  '  col += texture2D(tBloom, vUv).rgb * uBloom;',
  '  col *= uEsp;',
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
/* effetti di ripresa: scossa = tremolio della camera (radianti), sfoca = sfocatura di movimento intorno a (sfocaX, sfocaY), pulv = pulviscolo */
var FX = { flash: 0, aberr: 0.0011, esp: 1.0, bloom: 0.9, vign: VIGN, scossa: 0, sfoca: 0, sfocaX: 0.5, sfocaY: 0.5, roll: 0, pulv: 0 };
var tempo = 0;

var GEO_SFERA = new THREE.SphereGeometry(1, 160, 80);
var GEO_GUSCIO = new THREE.SphereGeometry(1, 96, 48);
var GEO_QUAD = new THREE.PlaneGeometry(2, 2);

function U(v){ return { value: v }; }

/* cielo */
var cielo = new THREE.Mesh(new THREE.SphereGeometry(900, 64, 32), new THREE.ShaderMaterial({
  /* il cielo di Blender, più acceso, su un fondo blu notte appena sollevato dal nero */
  uniforms: { tCielo: U(vuota), uLuce: U(1.6), uFondo: U(new V3(0.0075, 0.0095, 0.014)) },
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
  var p = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms: { uTempo: U(0), uPx: U(1) }, vertexShader: VS_STELLE, fragmentShader: FS_STELLE,
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

/* zone dei nomi sullo schermo (pixel veri, y dal basso): linee, anelli e onde si interrompono lì dietro; fuori schermo quando il nome è spento */
var ZONE_NOMI = [0, 1, 2, 3, 4].map(function(){ return new THREE.Vector4(-1e5, -1e5, -1e5, -1e5); });
function matPianeta(o){
  var defs = {}; ['NORMALE', 'LUCE', 'TERRA', 'ANELLI', 'GAS', 'ACCENDI', 'LAVA'].forEach(function(k){ if (o[k]) defs[k] = ''; });
  return new THREE.ShaderMaterial({
    defines: defs,
    uniforms: {
      tColore: U(vuota), tNormale: U(vuota), tLuce: U(vuota), tNuvole: U(vuota), tMare: U(vuota), tAnelli: U(vuota),
      uRot: U(new THREE.Matrix3()), uSole: U(SOLE), uSoleCol: U(SOLE_COL), uSoleF: U(1), uAmb: U(o.amb || new V3(0.012, 0.013, 0.016)),
      uAtmo: U(o.atmo || new V3()), uAtmoF: U(o.atmoF || 0), uLuceCol: U(o.luceCol || new V3(1, 1, 1)), uLuceF: U(o.luceF || 0), uNuvOff: U(0),
      uCentro: U(new V3()), uAnN: U(new V3(0, 1, 0)), uAnR: U(new THREE.Vector2(1, 2)), uAcc: U(1), uAccP: U(new V3(0, 0, 1)), uImp: U(-1), uSel: U(0), uAlb: U(o.alb || 1), uPunto: U(0),
      uTempo: U(0), uLampo: U(0), uLampoP: U(new V3(0, 0, 1)), uLampoCol: U(VERDE.clone().multiplyScalar(1.6))
    },
    vertexShader: VS_PIANETA, fragmentShader: FS_PIANETA
  });
}
function atmosfera(r, ra, col, f, pot, basso){
  var m = new THREE.Mesh(GEO_GUSCIO, new THREE.ShaderMaterial({
    uniforms: { uCentro: U(new V3()), uR: U(r), uRa: U(ra), uSole: U(SOLE), uAtmo: U(col), uF: U(f), uPot: U(pot || 2.4), uSel: U(0),
      uLampo: U(0), uLampoCol: U(VERDE.clone().multiplyScalar(1.6)), uBasso: U(basso || 0) },
    vertexShader: VS_MONDO, fragmentShader: FS_ATMO, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  m.scale.setScalar(ra); m.renderOrder = 2; return m;
}
function alone(col){
  var m = new THREE.Mesh(GEO_QUAD, new THREE.ShaderMaterial({
    uniforms: { uPos: U(new V3()), uSize: U(1), uCol: U(col), uTempo: U(0), uSel: U(0), uSegnale: U(0), uR: U(0.62), uLuce: U(1), uEt: U(ZONE_NOMI) },
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
function linea(col, px, largM){
  var m = new THREE.Mesh(GEO_LINEA, new THREE.ShaderMaterial({
    uniforms: { uA: U(new V3()), uB: U(new V3()), uPx: U(px), uLargM: U(largM || 0), uRis: U(RIS), uCol: U(col), uLuce: U(1), uDis: U(1), uAccT: U(-1), uAccF: U(0), uEt: U(ZONE_NOMI), uLarga: U(1) },
    vertexShader: VS_LINEA, fragmentShader: FS_LINEA, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide
  }));
  m.frustumCulled = false; m.renderOrder = 4; return m;
}

function anelloNeon(r, tubo, col, luce){
  /* il tubo e il suo alone condividono disegno (uDis), impulso (uTempo) e luce: si aggiornano una volta sola (g.u) */
  var g = new THREE.Group(), u = { uDis: U(1), uTempo: U(0), uLuce: U(luce) };
  [[tubo, 0, 10], [tubo * 4.2, 1, 12]].forEach(function(t){
    var m = new THREE.Mesh(new THREE.TorusGeometry(r, t[0], t[2], 480), new THREE.ShaderMaterial({
      uniforms: { uCol: U(col), uAlone: U(t[1]), uDis: u.uDis, uTempo: u.uTempo, uLuce: u.uLuce },
      vertexShader: VS_TUBO, fragmentShader: FS_TUBO, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
    }));
    m.renderOrder = 3; g.add(m);
  });
  g.rotation.x = -Math.PI / 2; g.u = u; return g;
}

/* ── Nemesi, il mondo centrale ── */
var NEMESI = (function(){
  var g = new THREE.Group(); scene.add(g);
  var asse = new THREE.Group(); asse.rotation.set(0.16, 0, 0.34); g.add(asse);
  var gira = new THREE.Group(); asse.add(gira);
  var mat = matPianeta({ NORMALE: 1, LUCE: 1, ACCENDI: 1, alb: 1.9, luceCol: VERDE.clone().multiplyScalar(3.0), luceF: 1, atmo: lin('#DCEBC8', 0.45), atmoF: 0.4, amb: new V3(0.014, 0.015, 0.018) });
  var sfera = new THREE.Mesh(GEO_SFERA, mat); sfera.scale.setScalar(R0); gira.add(sfera);
  var atmo = atmosfera(R0, R0 * 1.09, lin('#CBEAA8', 0.3), 1, 3.0); g.add(atmo);
  /* due anelli al neon (tubi di luce, raggio del tubo nello spazio) */
  var neon = anelloNeon(R0 * 1.52, 0.024, VERDE.clone().multiplyScalar(1.6), 1); asse.add(neon);
  /* il secondo, più sottile e più spento, un po' più largo */
  var neon2 = anelloNeon(R0 * 1.9, 0.0145, VERDE.clone().multiplyScalar(0.8), 0.75); neon2.rotation.y = 0.12; asse.add(neon2);
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
  var ln = linea(VERDE.clone().multiplyScalar(1.15), 5, 0.016); scene.add(ln);
  /* acc: secondi dall'inizio dell'accensione (-1 = spenta); nome: la scritta in 3D (si crea quando arriva nomi.bin);
     aloneK: luce dell'alone, che si abbassa piano quando si va verso questo mondo */
  var m = { id: id, g: g, asse: asse, gira: gira, sfera: sfera, mat: mat, atmo: atmo, alone: al, linea: ln, r: r, vel: vel,
    sel: 0, acc: -1, accT: -1, accF: 0, lampo: 0, nome: null, nomeL: 0, nomeSu: false, centro: g.position, aloneK: 1 };
  MONDI[id] = m; return m;
}
(function(){
  /* Portfolio: gigante gassoso color sabbia con anelli */
  var p = nuovoMondo('portfolio', 0.5, { GAS: 1, ANELLI: 1, amb: new V3(0.01, 0.01, 0.012), atmo: lin('#E8DCC0', 0.5), atmoF: 0.5 }, lin('#E9D9B6', 0.4), 1, 0.07, [0.08, 0.46], 2 * Math.PI / 38);
  var an = new THREE.Mesh(new THREE.RingGeometry(p.r * 1.28, p.r * 2.35, 256, 1), new THREE.ShaderMaterial({
    uniforms: { tAnelli: U(vuota), uR: U(new THREE.Vector2(p.r * 1.28, p.r * 2.35)), uSole: U(SOLE), uSoleCol: U(SOLE_COL), uCentro: U(p.g.position), uN: U(new V3()), uRp: U(p.r), uF: U(1) },
    vertexShader: VS_ANELLI, fragmentShader: FS_ANELLI, transparent: true, depthWrite: false, side: THREE.DoubleSide
  }));
  an.rotation.x = -Math.PI / 2; an.renderOrder = 1; p.asse.add(an); p.anelli = an;
  p.mat.uniforms.uAnR.value.set(p.r * 1.28, p.r * 2.35);

  /* Studio: la Terra, con Bologna accesa */
  var t = nuovoMondo('studio', 0.44, { TERRA: 1, amb: new V3(0.006, 0.008, 0.012), luceF: 3.6, atmo: lin('#7FB2FF', 0.9), atmoF: 0.9 }, lin('#6CA4FF', 0.75), 1, 0.08, [0.0, 0.41], 2 * Math.PI / 80);
  var lat = 44.4949 * Math.PI / 180, lon = 11.3426 * Math.PI / 180;
  var u = (lon + Math.PI) / (2 * Math.PI), th = Math.PI / 2 - lat;
  t.bologna = new V3(-Math.cos(u * 2 * Math.PI) * Math.sin(th), Math.cos(th), Math.sin(u * 2 * Math.PI) * Math.sin(th));
  t.pin = punto(VERDE.clone().multiplyScalar(2.0), 26); scene.add(t.pin);
  t.raggio = linea(VERDE.clone().multiplyScalar(1.4), 1.6, 0.0); scene.add(t.raggio);

  /* Tool: luna di roccia con le officine accese; intorno le girano le icone degli strumenti (ICONE, più sotto) */
  nuovoMondo('tool', 0.36, { NORMALE: 1, LUCE: 1, luceCol: VERDE.clone().multiplyScalar(4.0), luceF: 1, amb: new V3(0.01, 0.01, 0.011), atmo: lin('#9FB0A0', 0.3), atmoF: 0.25 }, lin('#A9C2A0', 0.18), 1, 0.05, [0.2, -0.3], 2 * Math.PI / 90);

  /* Contatti: gigante di ghiaccio che manda segnali */
  var c = nuovoMondo('contatti', 0.46, { GAS: 1, amb: new V3(0.01, 0.012, 0.014), atmo: lin('#9EF0F2', 0.9), atmoF: 0.8 }, lin('#8FE6EE', 0.8), 1, 0.09, [0.1, -0.5], 2 * Math.PI / 50);
  c.alone.material.uniforms.uSegnale.value = 1; c.alone.material.uniforms.uSize.value = c.r * 2.5;
  c.alone.material.uniforms.uCol.value = lin('#BDF6F0', 1.2);

  /* Area riservata (dalla 3.58): pianeta di lava, crosta di basalto quasi nera rotta da fratture e laghi accesi, foschia arancione */
  var lv = nuovoMondo('area', 0.36, { NORMALE: 1, LUCE: 1, LAVA: 1, alb: 1.6, luceCol: new V3(1.0, 0.26, 0.04).multiplyScalar(4.2), luceF: 1,
    amb: new V3(0.012, 0.009, 0.008), atmo: lin('#FF8A4A', 0.55), atmoF: 0.45 }, lin('#FF6A2A', 0.5), 1, 0.07, [0.14, 0.32], 2 * Math.PI / 64);
  lv.atmo.material.uniforms.uBasso.value = 0.45;
})();
/* dalla 3.63 la luce che arriva dalla linea accende il mondo del suo colore (prima tutti di verde); la linea e la luce che corre restano verdi */
(function(){
  var COL = { portfolio: '#F2DFB4', studio: '#6CA4FF', tool: '#C9CED6', contatti: '#8FE6EE', area: '#FF6A1A' };
  Object.keys(COL).forEach(function(id){
    var m = MONDI[id], c = lin(COL[id]); c.multiplyScalar(1.6 / Math.max(c.x, c.y, c.z));
    m.mat.uniforms.uLampoCol.value = c;
    if (m.atmo) m.atmo.material.uniforms.uLampoCol.value = c.clone();
  });
})();

/* ── icone degli strumenti (dalla 3.59) ──
   Le sette lastre laccate della giostra dei Tool del vecchio sito (nemesiWeb-film, js/lastra.js, dalla 3.9): stessa forma (lastra a bordo
   arrotondato 1,3 × 1,04 × 0,2), corpo nel colore della marca, marchio disegnato sulla faccia, lacca con vernice trasparente e lo stesso
   studio di luci riflesso. Qui girano intorno alla luna di Tool su orbite inclinate, tutte nello stesso verso, rivolte a chi guarda con
   un lento ondeggiare che mostra lo spessore; ognuna si lascia dietro una scia del colore del suo marchio (Figma: i suoi cinque colori) */
function geoLastra(w, h, t, rc, rb){   // = slabGeometry() del vecchio lastra.js: lastra a bordo arrotondato con normali morbide
  var cs = 10, ps = 4, pts = [], prof = [], i, j, PI = Math.PI;
  var hw = w / 2, hh = h / 2;
  var R4 = [rc, rc, rc, rc].map(function(v){ return Math.min(v, hw, hh); });
  var angoli = [[hw - R4[0], hh - R4[0], 0], [-hw + R4[1], hh - R4[1], PI / 2], [-hw + R4[2], -hh + R4[2], PI], [hw - R4[3], -hh + R4[3], 3 * PI / 2]];
  for (var c = 0; c < 4; c++) for (i = 0; i <= cs; i++){
    var a = angoli[c][2] + (i / cs) * (PI / 2), nx = Math.cos(a), ny = Math.sin(a), r = R4[c];
    pts.push([angoli[c][0] + nx * r, angoli[c][1] + ny * r, nx, ny]);
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
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
}
var ICONE = (function(){
  var STR = (window.STRUMENTI || []).filter(function(s){ return s.id !== 'figma'; }), tool = MONDI.tool, lista = [];   // Figma resta nel pannello, non intorno alla luna (3.60)
  if (!STR.length) return lista;
  function colore(h){ return new THREE.Color(h).convertSRGBToLinear(); }
  /* lo studio di luci del vecchio sito: stanza scura con pannelli chiari (in alto il più forte), riflessi nella lacca */
  var studio = (function(){
    var s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(40, 40, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.11, 0.11, 0.12), side: THREE.BackSide })));
    function pannello(w, h, x, y, z, rx, ry, k){
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m);
    }
    pannello(18, 8, 0, 10, 3, Math.PI / 2, 0, 2.4);
    pannello(5, 14, -11, 1.5, 4, 0, Math.PI / 2, 1.2);
    pannello(3, 12, 11, 0.5, -2, 0, -Math.PI / 2, 0.7);
    pannello(16, 5, 0, 1.5, 12, 0, Math.PI, 1.1);
    var pm = new THREE.PMREMGenerator(renderer), tx = pm.fromScene(s, 0.03).texture; pm.dispose();
    return tx;
  })();
  var GSW = 1.3, GSH = 1.04, GST = 0.2, TWG = 1024, THG = Math.round(TWG * GSH / GSW);
  var geo = geoLastra(GSW, GSH, GST, 0.11, 0.03), geoLogo = new THREE.PlaneGeometry(GSW - 0.03, GSH - 0.03);
  var SCALA = tool.r * 0.27;   // l'icona è larga 1,3 · SCALA, un terzo abbondante del raggio della luna
  /* il marchio di Figma ha cinque colori: si disegna a parte */
  var FIG = [['#F24E1E', 'M19 0H9.5A9.5 9.5 0 0 0 9.5 19H19Z'], ['#FF7262', 'M19 0H28.5A9.5 9.5 0 0 1 28.5 19H19Z'],
    ['#A259FF', 'M19 19H9.5A9.5 9.5 0 0 0 9.5 38H19Z'], ['#1ABCFE', 'M38 28.5A9.5 9.5 0 1 1 19 28.5A9.5 9.5 0 0 1 38 28.5Z'],
    ['#0ACF83', 'M9.5 38H19V47.5A9.5 9.5 0 1 1 9.5 38Z']];
  function figma(g, x, y, alto){
    var k = alto / 57; g.save(); g.translate(x - 19 * k, y - 28.5 * k); g.scale(k, k);
    FIG.forEach(function(f){ g.fillStyle = f[0]; g.fill(new Path2D(f[1])); });
    g.restore();
  }
  /* scia: striscia di 64 tratti lungo l'orbita (la forma la fa VS_SCIA) */
  var geoScia = (function(){
    var N = 64, s = [], l = [], p = [], ix = [];
    for (var k = 0; k <= N; k++){ s.push(k / N, k / N); l.push(-1, 1); p.push(0, 0, 0, 0, 0, 0); }
    for (k = 0; k < N; k++){ var a = k * 2; ix.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 1)); g.setAttribute('aLato', new THREE.Float32BufferAttribute(l, 1));
    g.setIndex(ix); return g;
  })();
  /* colore della scia = colore del marchio (Figma: i cinque colori in fila), tutti con la stessa forza */
  var SCIA = { claude: '#D97757', vscode: '#1F9CF0', github: '#E8ECF2', figma: '#A259FF', cloudflare: '#F38020', netlify: '#32E6E2', supabase: '#3ECF8E' };
  function forte(h, k){ var c = lin(h); return c.multiplyScalar(k / Math.max(c.x, c.y, c.z)); }
  var FIG_COL = FIG.map(function(f){ return forte(f[0], 1.9); });
  /* orbite: inclinazione sull'orizzontale e verso dove si inclina (radianti), raggio (in raggi della luna), velocità (radianti al secondo) */
  var ORB = [[0.30, 0.2, 1.36, 0.40], [0.80, 1.9, 1.56, 0.33], [0.52, 3.4, 1.46, 0.37], [0.98, 4.6, 1.62, 0.30],
             [0.18, 5.5, 1.30, 0.43], [0.66, 0.9, 1.60, 0.35], [0.42, 2.7, 1.50, 0.32]];
  STR.forEach(function(s, i){
    var c = document.createElement('canvas'); c.width = TWG; c.height = THG;
    var g = c.getContext('2d'), lato = THG * 0.46;
    if (s.logo === 'figma') figma(g, TWG / 2, THG / 2, lato * 1.05);
    else { g.save(); g.translate(TWG / 2 - lato / 2, THG / 2 - lato / 2); g.scale(lato / 24, lato / 24); g.fillStyle = s.logo; g.fill(new Path2D(s.d)); g.restore(); }
    var tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; tx.anisotropy = ANISO;
    var base = colore(s.corpo);
    /* la lastra si disegna dopo le scie (fra gli oggetti trasparenti, ma piena): quando un'icona si allontana la sua scia le passa
       davanti, e senza questo il marchio si vedrebbe attraverso la luce; la luna invece la copre sempre */
    var mat = new THREE.MeshPhysicalMaterial({ color: base, roughness: s.chiaro ? 0.32 : 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06,
      envMap: studio, envMapIntensity: 1, emissive: base.clone().multiplyScalar(0.16), transparent: true, depthWrite: true });
    var lastra = new THREE.Mesh(geo, mat); lastra.renderOrder = 7;
    var o = new THREE.Group(); o.add(lastra);
    var logo = new THREE.Mesh(geoLogo, new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, toneMapped: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
    logo.position.z = GST / 2 + 0.002; logo.renderOrder = 7; o.add(logo);
    o.scale.setScalar(SCALA); scene.add(o);
    var q = ORB[i % ORB.length], inc = q[0], az = q[1];
    var n = new V3(Math.sin(inc) * Math.cos(az), Math.cos(inc), Math.sin(inc) * Math.sin(az));
    var e1 = new V3(-Math.sin(az), 0, Math.cos(az)), e2 = new V3().crossVectors(n, e1).normalize();
    var R = tool.r * q[2], multi = s.logo === 'figma';
    var scia = new THREE.Mesh(geoScia, new THREE.ShaderMaterial({
      uniforms: { uC: U(tool.g.position), uE1: U(e1), uE2: U(e2), uR: U(R), uA: U(0), uArco: U(1.3), uLarg: U(GSH * SCALA * 0.2), uPx: U(1.1), uRis: U(RIS),
        uCol: U(forte(SCIA[s.id] || s.corpo, 1.9)), uFig: U(FIG_COL), uMulti: U(multi ? 1 : 0), uLuce: U(1), uEt: U(ZONE_NOMI) },
      vertexShader: VS_SCIA, fragmentShader: FS_SCIA, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, side: THREE.DoubleSide
    }));
    scia.frustumCulled = false; scia.renderOrder = 6; scene.add(scia);
    lista.push({ id: s.id, o: o, mat: mat, logo: logo, scia: scia, e1: e1, e2: e2, R: R, w: q[3], ang: i * 2.69, ph: i * 1.7 });
  });
  return lista;
})();

function assegnaTexture(){
  cielo.material.uniforms.tCielo.value = T.cielo;
  var u = NEMESI.mat.uniforms; u.tColore.value = T.nemesiC; u.tNormale.value = T.nemesiN; u.tLuce.value = T.nemesiL;
  u = MONDI.portfolio.mat.uniforms; u.tColore.value = T.gigante; u.tAnelli.value = T.anelli; MONDI.portfolio.anelli.material.uniforms.tAnelli.value = T.anelli;
  u = MONDI.studio.mat.uniforms; u.tColore.value = T.terraG; u.tLuce.value = T.terraL; u.tMare.value = T.terraM; u.tNuvole.value = T.terraN;
  u = MONDI.tool.mat.uniforms; u.tColore.value = T.lunaC; u.tNormale.value = T.lunaN; u.tLuce.value = T.lunaL;
  u = MONDI.contatti.mat.uniforms; u.tColore.value = T.ghiaccio;
  u = MONDI.area.mat.uniforms; u.tColore.value = T.lavaC; u.tNormale.value = T.lavaN; u.tLuce.value = T.lavaL;
}

/* ── pulviscolo del viaggio: si semina lungo la rotta a ogni salto ── */
var pulv = (function(){
  var n = MOBILE ? 420 : 900;
  var g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  var aP = new Float32Array(n * 3), aB = new Float32Array(n);
  g.setAttribute('aP', new THREE.InstancedBufferAttribute(aP, 3)); g.setAttribute('aB', new THREE.InstancedBufferAttribute(aB, 1));
  g.instanceCount = n;
  var m = new THREE.Mesh(g, new THREE.ShaderMaterial({
    uniforms: { uPrima: U(new THREE.Matrix4()), uPx: U(1), uRis: U(RIS), uF: U(0), uScatto: U(1) },
    vertexShader: VS_PULV, fragmentShader: FS_PULV, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
  }));
  m.frustumCulled = false; m.renderOrder = 8; m.visible = false; scene.add(m);
  return { mesh: m, n: n, aP: aP, aB: aB };
})();
var vpPrima = new THREE.Matrix4(), vpPronta = false;

/* ── nomi dei mondi in 3D (da nomi.bin): stanno sopra il loro mondo, paralleli allo schermo e appena inclinati ── */
var matNome = new THREE.ShaderMaterial({
  uniforms: { uSole: U(SOLE), uSoleCol: U(SOLE_COL), uRosso: U(new V3(1.0, 0.045, 0.03).multiplyScalar(1.6)), uSel: U(0), uLuce: U(0), uSeme: U(0) },
  vertexShader: VS_NOME, fragmentShader: FS_NOME, transparent: true, depthWrite: true
});
function creaNomi(){
  var ci = false;
  MONDI_ID.forEach(function(id, i){
    var n = NOMI[id], m = MONDI[id]; if (!n || m.nome) return;
    var mat = matNome.clone(); mat.uniforms.uSole.value = SOLE; mat.uniforms.uSoleCol.value = SOLE_COL; mat.uniforms.uSeme.value = i * 3.7;   // venature diverse per ogni nome
    m.nome = new THREE.Mesh(n.geo, mat); m.nome.renderOrder = 7; m.nome.frustumCulled = false; m.nome.visible = false;
    m.nomeW = n.w; m.nomeFase = i * 1.7;
    scene.add(m.nome); ci = true;
  });
  if (ci) d.classList.add('nomi3d');
}

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
var mFinale = postMat(FS_FINALE, { tScena: U(null), tBloom: U(null), uBloom: U(0.9), uEsp: U(1), uAberr: U(0.0016), uFlash: U(0), uVign: U(VIGN), uTempo: U(0),
  uRis: U(RIS), uSfoca: U(0), uSfocaC: U(new THREE.Vector2(0.5, 0.5)) });
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
  f.tScena.value = rtScena.texture; f.tBloom.value = su[0].texture; f.uBloom.value = FX.bloom * 0.16; f.uEsp.value = FX.esp;
  f.uAberr.value = FX.aberr; f.uFlash.value = FX.flash; f.uVign.value = FX.vign; f.uTempo.value = tempo;
  f.uSfoca.value = FX.sfoca; f.uSfocaC.value.set(FX.sfocaX, FX.sfocaY);
  passo(mFinale, null);
}

/* ════════════════════════════ disposizione ════════════════════════════ */
/* posizioni dei mondi: orizzontale (computer) e verticale (telefono); la camera si allontana se lo schermo è stretto */
var DISP = {
  l: { cam: [0, 0.3, 14.6], tgt: [0, -0.1, 0], fov: 30,
       portfolio: [-4.55, 1.75, -1.3], studio: [-3.6, -2.05, 1.4], tool: [4.1, 1.95, 0.4], contatti: [4.65, -1.75, -1.2], area: [0.35, -3.0, 2.2] },
  p: { cam: [0, 0.1, 17.5], tgt: [0, 0.1, 0], fov: 40,
       portfolio: [-1.5, 3.55, -0.8], tool: [1.55, 3.4, 0.5], studio: [-1.45, -3.1, 0.7], contatti: [1.5, -3.3, -0.6], area: [0.05, -5.0, 0.7] }
};
/* inquadratura di ogni sezione: dove sta il pianeta (frazioni dello schermo), quanto è grande, da che parte lo si guarda (verso il centro, verso il sole, in alto) */
var INQ = {
  portfolio: { l: { x: 0.8, y: 0.56, r: 0.16 }, p: { x: 0.5, y: 0.9, r: 0.24 }, dir: [0.55, 0.55, 0.42] },
  studio:    { l: { x: 0.77, y: 0.56, r: 0.36 }, p: { x: 0.5, y: 0.95, r: 0.46 }, dir: [0.75, 0.05, 0.12] },
  /* Tool (dalla 3.59): luna un poco più piccola, così le icone che le girano intorno restano nello schermo e fuori dal pannello */
  tool:      { l: { x: 0.76, y: 0.54, r: 0.21 }, p: { x: 0.5, y: 0.84, r: 0.3 }, dir: [0.8, 0.12, 0.18] },
  contatti:  { l: { x: 0.76, y: 0.56, r: 0.22 }, p: { x: 0.5, y: 0.98, r: 0.44 }, dir: [0.7, 0.45, 0.1] },
  /* l'area riservata non ha pannello: il pianeta arriva al centro, grande, poi ci si tuffa dentro */
  area:      { l: { x: 0.5, y: 0.5, r: 0.3 }, p: { x: 0.5, y: 0.5, r: 0.36 }, dir: [0.75, 0.3, 0.2] }
};
function verticale(){ return W / H < 0.85; }
/* misure dei nomi in 3D sullo schermo (pixel CSS): altezza delle maiuscole, margini della zona cliccabile */
function misuraNomi(){
  /* dalla 3.59 un quarto più piccoli (prima 12, 14–16 e 15–21 px) */
  var h = H < 520 ? 10 : verticale() ? (W < 500 ? 11 : 12) : Math.max(12, Math.min(16, H * 0.0158));
  var px = Math.round(h * 0.55), py = Math.round(h * 0.5);
  return { h: h, px: px, py: py, box: h + py * 2 };
}
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
  MONDI_ID.forEach(function(id){
    var m = MONDI[id];
    m.g.position.copy(m.base).applyQuaternion(SIS.q);
    var dirN = tmp.copy(m.g.position).normalize();
    m.lineaA.copy(dirN).multiplyScalar(R0);
    m.lineaB.copy(m.g.position).addScaledVector(dirN, -m.r * 0.99);   // dalla 3.65 arriva sulla superficie (prima si fermava a 1,16 raggi: da vicino restava staccata)
    m.linea.material.uniforms.uA.value.copy(m.lineaA); m.linea.material.uniforms.uB.value.copy(m.lineaB);
    m.alone.material.uniforms.uPos.value.copy(m.g.position);
    if (m.atmo) m.atmo.material.uniforms.uCentro.value.copy(m.g.position);
    m.mat.uniforms.uCentro.value.copy(m.g.position);
  });
}
function sistemaMondi(){
  var D = disposizione();
  MONDI_ID.forEach(function(id){
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
    var alto = 74, basso = H < 520 ? 14 : 40, lato = 16, et = misuraNomi().box + 6, PASSI = 24;
    camProva.fov = fov; camProva.aspect = W / H; camProva.updateProjectionMatrix();
    var fpx = (H / 2) / Math.tan(fov * Math.PI / 360);
    for (var k = 0; k < 60; k++){
      camProva.position.copy(pos); camProva.lookAt(tgt); camProva.updateMatrixWorld();
      var ok = true;
      for (var j = 0; j < PASSI && ok; j++){
        provaQ.setFromAxisAngle(SU, j / PASSI * Math.PI * 2);
        ok = MONDI_ID.every(function(id){
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
var PAR = { x: 0, y: 0, tx: 0, ty: 0, amp: 1 };
var tmp = new V3(), tmp2 = new V3(), tmpB = new V3(), tmpQ = new THREE.Quaternion();
function camDa(p){ CAM.pos.copy(p.pos); CAM.tgt.copy(p.tgt); CAM.fov = p.fov; CAM.ox = p.ox; CAM.oy = p.oy; }
function ampParallasse(){ return META === 'centro' ? 1 : 0.35; }
function applicaCamera(dt){
  var k = 1 - Math.exp(-dt * 2.2);
  PAR.x += (PAR.tx - PAR.x) * k; PAR.y += (PAR.ty - PAR.y) * k;
  /* parallasse piena al centro e ridotta nelle sezioni: dalla 3.59 cambia piano durante il viaggio (META = dove si va);
     prima cambiava di colpo all'arrivo e la camera faceva un piccolo salto proprio quando si fermava */
  PAR.amp += (ampParallasse() - PAR.amp) * (1 - Math.exp(-dt * 1.1));
  var amp = PAR.amp;
  camera.position.copy(CAM.pos);
  camera.lookAt(CAM.tgt);
  /* parallasse del puntatore e un respiro lento: la camera si sposta un poco nel suo piano */
  var dx = (PAR.x * 0.55 + Math.sin(tempo * 0.11) * 0.18) * amp, dy = (PAR.y * 0.32 + Math.sin(tempo * 0.07 + 1.3) * 0.1) * amp;
  if (RIDOTTO){ dx = 0; dy = 0; }
  tmp.set(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(dx);
  tmp2.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(dy);
  camera.position.add(tmp).add(tmp2);
  camera.lookAt(CAM.tgt);
  /* in corsa la ripresa ondeggia appena: rotazioni lente e morbide (dalla 3.59; prima un tremolio di 4–5 volte al secondo,
     che sullo schermo si leggeva come uno scatto) */
  if (FX.scossa > 0){
    camera.rotateX((Math.sin(tempo * 4.3) * 0.6 + Math.sin(tempo * 2.7 + 1.7) * 0.4) * FX.scossa);
    camera.rotateY((Math.sin(tempo * 3.6 + 0.5) * 0.6 + Math.sin(tempo * 2.1 + 2.9) * 0.4) * FX.scossa);
  }
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
  ICONE.forEach(function(ic){ ic.scia.material.uniforms.uPx.value = 1.1 * DPR; });
  stelle.material.uniforms.uPx.value = DPR;
  pulv.mesh.material.uniforms.uPx.value = 1.1 * DPR;
  /* le linee dei mondi: nastro largo 3 volte (12 px), così la luce che corre ha il suo alone */
  MONDI_ID.forEach(function(id){ var u = MONDI[id].linea.material.uniforms; u.uPx.value = 15 * DPR; u.uLarga.value = 3; u.uLargM.value = 0.048; });
  MONDI.studio.pin.material.uniforms.uPx.value = 26 * DPR; MONDI.studio.raggio.material.uniforms.uPx.value = 1.6 * DPR;
  sistemaMondi();
}

/* ════════════════════════════ stato e animazione ════════════════════════════ */
var DOVE = 'centro', salto = null, prossimo = null, pronto = false, hover = null, sottoMouse = null;   // sottoMouse: il mondo sotto il mouse (ferma la giostra)
var META = 'centro';   // dove si sta andando (= DOVE da fermi): le luci che cambiano fra centro e sezione la seguono piano
var INTRO = { acc: 1, sole: 1, neon: 1, linee: [1, 1, 1, 1, 1], mondi: [1, 1, 1, 1, 1], atmo: 1 };
var bolognaW = new V3();

/* ── accensione: la luce parte da Nemesi, corre lungo la linea (ACC_T secondi), arriva al mondo e lo illumina ── */
var ACC_T = 0.8, ACC_FINE = ACC_T + 2.6;
var ACC = { prossima: 1.6, coda: [], ultimo: null, ferme: false };   // ferme: niente accensioni da sole (per le foto)
function accendi(m, daArrivo){
  if (!m || RIDOTTO) return;
  if (m.acc >= 0 && m.acc < ACC_T + 1.0) return;          // è già accesa
  m.acc = daArrivo ? ACC_T : 0;
}
function prossimaAccensione(){
  /* tutti i mondi in ordine sparso, senza ripetere subito l'ultimo */
  if (!ACC.coda.length){
    ACC.coda = MONDI_ID.slice().sort(function(){ return Math.random() - 0.5; });
    if (ACC.coda[0] === ACC.ultimo) ACC.coda.push(ACC.coda.shift());
  }
  var id = ACC.coda.shift(); ACC.ultimo = id; return MONDI[id];
}
function aggiornaAccensione(m, dt){
  if (m.acc >= 0){ m.acc += dt; if (m.acc > ACC_FINE) m.acc = -1; }
  var t = m.acc;
  if (t < 0){ m.accT = -1; m.accF = 0; m.lampo = 0; }
  else if (t < ACC_T){ m.accT = Math.pow(t / ACC_T, 1.35); m.accF = 1; m.lampo = 0; }
  else {
    var u = t - ACC_T;
    m.accT = 1 + u * 1.2; m.accF = Math.exp(-u / 0.45);
    m.lampo = (1 - Math.exp(-u / 0.05)) * Math.exp(-u / 0.75);
  }
}

function aggiorna(dt){
  tempo += dt;
  /* rotazioni: Nemesi gira con tutto il sistema (aste e mondi), i mondi girano anche su se stessi */
  aggiornaSistema(dt);
  var terra = MONDI.studio;
  MONDI_ID.forEach(function(id){ var m = MONDI[id]; if (!(id === 'studio' && terra.qBologna)) m.gira.rotateY(m.vel * dt * (RIDOTTO ? 0.2 : 1)); });
  /* la Terra: andando allo Studio, Bologna gira verso chi guarda, sul confine fra giorno e notte */
  if (terra.qBologna) terra.gira.quaternion.slerp(terra.qBologna, 1 - Math.exp(-dt * (salto ? 2.2 : 1.4)));
  terra.mat.uniforms.uNuvOff.value = (tempo * 0.0016) % 1;
  /* uniformi comuni */
  var mats = [NEMESI].concat(MONDI_ID.map(function(id){ return MONDI[id]; }));
  mats.forEach(function(m){ m.g.updateMatrixWorld(true); m.mat.uniforms.uRot.value.setFromMatrix4(m.sfera.matrixWorld).multiplyScalar(1 / m.sfera.scale.x); });
  /* Nemesi */
  var nu = NEMESI.mat.uniforms;
  nu.uAcc.value = INTRO.acc; nu.uSoleF.value = INTRO.sole; nu.uAtmoF.value = 0.4 * INTRO.atmo;
  NEMESI.atmo.material.uniforms.uF.value = INTRO.atmo;
  NEMESI.neon.u.uDis.value = INTRO.neon; NEMESI.neon.u.uTempo.value = tempo;
  NEMESI.neon2.u.uDis.value = INTRO.neon; NEMESI.neon2.u.uTempo.value = tempo * 0.7;
  if (nu.uImp.value > -1){ nu.uImp.value += dt * 0.55; if (nu.uImp.value > 1.3) nu.uImp.value = -1; }
  /* al centro, ogni tanto una linea si accende e illumina il suo mondo */
  if (pronto && DOVE === 'centro' && !salto && !RIDOTTO && !ACC.ferme){
    ACC.prossima -= dt;
    if (ACC.prossima <= 0){ accendi(prossimaAccensione()); ACC.prossima = 1.7 + Math.random() * 1.1; }
  }
  /* mondi */
  var inSez = DOVE !== 'centro' || !!salto || d.classList.contains('salto');   // (la classe c'è anche nelle prove di __mondi.prova)
  MONDI_ID.forEach(function(id, i){
    var m = MONDI[id];
    m.sel += ((hover === id ? 1 : 0) - m.sel) * (1 - Math.exp(-dt * 8));
    var acceso = INTRO.mondi[i];
    aggiornaAccensione(m, dt);
    var mu = m.mat.uniforms;
    mu.uSoleF.value = 0.06 + 0.94 * acceso; mu.uSel.value = m.sel; mu.uTempo.value = tempo;
    if (id === 'area') mu.uLuceF.value = 0.25 + 0.75 * acceso;   // la lava si accende con il suo mondo
    mu.uPunto.value = Math.max(0, Math.min(1, (INTRO.linee[i] - 0.97) / 0.03)) * (m.sfarfallio !== undefined ? m.sfarfallio : 1);
    mu.uLampo.value = m.lampo * acceso; mu.uLampoP.value.copy(m.g.position).negate().normalize();
    if (m.atmo){ var at = m.atmo.material.uniforms; at.uF.value = acceso; at.uSel.value = m.sel; at.uLampo.value = m.lampo * acceso; }
    if (m.anelli) m.anelli.material.uniforms.uF.value = 0.06 + 0.94 * acceso;
    var lu = m.linea.material.uniforms;
    lu.uDis.value = INTRO.linee[i]; lu.uAccT.value = m.accT; lu.uAccF.value = m.accF;
    var bersaglio = m.lineaLuce !== undefined ? m.lineaLuce : 1;
    lu.uLuce.value = (bersaglio + m.sel * 0.9) * (m.sfarfallio !== undefined ? m.sfarfallio : 1);
    /* l'alone del mondo verso cui si va si abbassa piano (prima di colpo all'arrivo) */
    m.aloneK += ((META === id ? 0.45 : 1) - m.aloneK) * (1 - Math.exp(-dt * 1.4));
    var au = m.alone.material.uniforms; au.uTempo.value = tempo; au.uSel.value = inSez ? 0 : m.sel; au.uLuce.value = acceso * m.aloneK;
    /* il nome in 3D compare con l'interfaccia e sparisce in fretta quando si parte */
    if (m.nome){
      var vuole = m.nomeSu && !inSez ? (m.nomeVis !== undefined ? m.nomeVis : 1) : 0;
      m.nomeL += (vuole - m.nomeL) * (1 - Math.exp(-dt * (vuole > m.nomeL ? 3.2 : 10)));
      if (m.nomeL < 0.004 && vuole === 0) m.nomeL = 0;
      m.nome.material.uniforms.uSel.value = m.sel; m.nome.material.uniforms.uLuce.value = m.nomeL;
    }
  });
  /* Bologna: puntino e raggio verde */
  terra.sfera.updateMatrixWorld();
  bolognaW.copy(terra.bologna).multiplyScalar(1.004).applyMatrix4(terra.sfera.matrixWorld);
  var nB = bolognaW.clone().sub(terra.g.position).normalize();
  var vistaB = nB.dot(tmp.copy(camera.position).sub(bolognaW).normalize());
  terra.pin.material.uniforms.uPos.value.copy(bolognaW); terra.pin.material.uniforms.uTempo.value = tempo;
  /* Bologna più accesa quando si va allo Studio: cresce piano durante il viaggio */
  terra.vicino = (terra.vicino || 0) + ((META === 'studio' ? 1 : 0) - (terra.vicino || 0)) * (1 - Math.exp(-dt * 1.4));
  terra.pin.material.uniforms.uLuce.value = INTRO.mondi[1] * (0.75 + 0.55 * terra.vicino) * clamp01(vistaB * 4 + 0.5);
  terra.raggio.material.uniforms.uA.value.copy(bolognaW); terra.raggio.material.uniforms.uB.value.copy(bolognaW).addScaledVector(nB, terra.r * 0.32);
  terra.raggio.material.uniforms.uLuce.value = INTRO.mondi[1] * (0.6 + 0.4 * terra.vicino) * clamp01(vistaB * 3 + 0.3);
  /* icone degli strumenti: avanzano sulla loro orbita (posizione e orientamento in aggiornaIcone, quando la camera è già al suo posto) */
  ICONE.forEach(function(ic){ ic.ang += ic.w * dt * (RIDOTTO ? 0.2 : 1); });
  /* anelli del Portfolio */
  var pf = MONDI.portfolio; pf.asse.updateMatrixWorld();
  var nA = new V3(0, 0, 1).applyQuaternion(pf.anelli.getWorldQuaternion(tmpQ)).normalize();
  pf.anelli.material.uniforms.uN.value.copy(nA); pf.mat.uniforms.uAnN.value.copy(nA);
  /* stelle, cielo e polvere seguono o no la camera */
  cielo.position.copy(camera.position); stelle.position.copy(camera.position);
  stelle.material.uniforms.uTempo.value = tempo;
  polvere.material.uniforms.uTempo.value = tempo;
  /* pulviscolo del viaggio: scie lunghe quanto il movimento in 1/60 di secondo, qualunque sia la frequenza dello schermo */
  var pu = pulv.mesh.material.uniforms;
  pu.uF.value = FX.pulv; pu.uScatto.value = Math.max(0.35, Math.min(2.5, (1 / 60) / Math.max(dt, 0.001)));
  pulv.mesh.visible = FX.pulv > 0.002;
}
/* icone degli strumenti: al loro posto sull'orbita, rivolte alla camera (già mossa in questo fotogramma) con un lento ondeggiare;
   si accendono con la loro luna all'entrata */
var iconaE = new THREE.Euler(), iconaQ = new THREE.Quaternion(), PROVA_ICONE = {};
function aggiornaIcone(){
  var acceso = INTRO.mondi[MONDI_ID.indexOf('tool')], C = MONDI.tool.g.position, k = RIDOTTO ? 0.3 : 1;
  ICONE.forEach(function(ic){
    ic.o.visible = acceso > 0.01 && PROVA_ICONE.lastre !== false; ic.scia.visible = PROVA_ICONE.scie !== false;
    ic.o.position.copy(C).addScaledVector(ic.e1, Math.cos(ic.ang) * ic.R).addScaledVector(ic.e2, Math.sin(ic.ang) * ic.R);
    iconaE.set(0.15 * k * Math.sin(tempo * 0.47 + ic.ph), 0.55 * k * Math.sin(tempo * 0.61 + ic.ph * 1.3), 0.06 * k * Math.sin(tempo * 0.39 + ic.ph * 0.7));
    ic.o.quaternion.copy(camera.quaternion).multiply(iconaQ.setFromEuler(iconaE));
    ic.mat.envMapIntensity = acceso; ic.mat.emissiveIntensity = acceso; ic.logo.material.opacity = acceso;
    var u = ic.scia.material.uniforms; u.uA.value = ic.ang; u.uLuce.value = acceso;
  });
}

/* ════════════════════════════ etichette e puntatore ════════════════════════════ */
function proietta(v, out){
  tmp.copy(v).project(camera);
  out.x = (tmp.x * 0.5 + 0.5) * W; out.y = (-tmp.y * 0.5 + 0.5) * H; out.z = tmp.z; return out;
}
var segnoB = document.getElementById('segno-bologna'), segnoS = { x: 0, y: 0, z: 0 };
var SCHERMO = {};
MONDI_ID.forEach(function(id){ SCHERMO[id] = { x: 0, y: 0, z: 0, r: 0, d: 0, cop: 0 }; });
var centroS = { x: 0, y: 0, z: 0, r: 0, d: 0 };
/* quanto un disco sullo schermo è coperto da un altro più vicino (0 = libero, 1 = tutto dietro) */
function copertura(s, a){
  if (a.d >= s.d) return 0;
  var dd = Math.hypot(s.x - a.x, s.y - a.y);
  return clamp01((a.r + s.r - dd) / (2 * Math.max(1, s.r)));
}
var ordineEt = '';
var nomeQ = new THREE.Quaternion(), nomeE = new THREE.Euler(), nomeV = new V3(), avantiV = new V3();
function aggiornaSchermo(){
  var fpx = (H / 2) / Math.tan(camera.fov * Math.PI / 360);
  proietta(NEMESI.g.position, centroS);
  centroS.d = camera.position.distanceTo(NEMESI.g.position); centroS.r = R0 * fpx / Math.max(0.01, centroS.d);
  MONDI_ID.forEach(function(id){
    var m = MONDI[id], s = SCHERMO[id];
    proietta(m.g.position, s);
    s.d = Math.max(0.01, camera.position.distanceTo(m.g.position));
    s.r = m.r * fpx / s.d;
  });
  /* i mondi che passano dietro Nemesi o dietro un altro mondo abbassano il nome; quello del più vicino sta sopra */
  MONDI_ID.forEach(function(id){
    var s = SCHERMO[id], c = copertura(s, centroS);
    MONDI_ID.forEach(function(k){ if (k !== id) c = Math.max(c, copertura(s, SCHERMO[k]) * 0.9); });
    s.cop = c;
  });
  var ord = MONDI_ID.slice().sort(function(a, b){ return SCHERMO[b].d - SCHERMO[a].d; });
  var chiave = ord.join(',');
  if (chiave !== ordineEt){ ordineEt = chiave; ord.forEach(function(id, i){ if (etichette[id]) etichette[id].style.zIndex = String(i + 1); }); }
  /* il nome sta sopra il suo mondo (si sistemano prima quelli dei mondi più vicini); va sotto solo se sopra non c'è posto
     o se sopra coprirebbe un altro nome e sotto no. L'etichetta (bottone) resta dove sta il nome: clic, tastiera e lettori di schermo */
  var mn = misuraNomi(), messe = [];
  camera.getWorldDirection(avantiV);
  var tanF = Math.tan(camera.fov * Math.PI / 360);
  for (var i = ord.length - 1; i >= 0; i--){
    var id = ord[i], s = SCHERMO[id], el = etichette[id], m = MONDI[id];
    if (!el) continue;
    if (!el._w){
      if (m.nome){ el._w = Math.round(m.nomeW * mn.h + mn.px * 2); el._h = mn.box; el.style.width = el._w + 'px'; el.style.height = el._h + 'px'; }
      else { el.style.width = ''; el.style.height = ''; el._w = el.offsetWidth; el._h = el.offsetHeight; }
    }
    var w = el._w, h = el._h, x = s.x - w / 2;
    var lato = function(sopra){
      var y = sopra ? s.y - s.r * 1.2 - h : s.y + s.r * 1.2;
      var dentro = y > 62 && y + h < H - 6, sov = 0;
      messe.forEach(function(r){ sov += Math.max(0, Math.min(x + w, r.x + r.w) - Math.max(x, r.x)) * Math.max(0, Math.min(y + h, r.y + r.h) - Math.max(y, r.y)); });
      return { sopra: sopra, y: y, dentro: dentro, sov: sov };
    };
    var a = lato(true), b = lato(false), scelto = a;
    if (el._sopra === false){ if (!(a.dentro && a.sov <= 0) && b.dentro) scelto = b; }                 // torna sopra appena è libero
    else if ((!a.dentro && b.dentro) || (a.dentro && b.dentro && a.sov > w * h * 0.25 && b.sov <= 0)) scelto = b;
    el._sopra = scelto.sopra;
    messe.push({ x: x, y: scelto.y, w: w, h: h });
    var copEt = Math.min(1, scelto.sov / (w * h) * 1.6);
    el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + scelto.y.toFixed(1) + 'px,0)';
    var vis = Math.round((1 - 0.82 * Math.max(s.cop, copEt * 0.9)) * 20) / 20;
    if (el._vis !== vis){ el._vis = vis; el.style.setProperty('--vis', String(vis)); }
    m.nomeVis = vis;
    /* il nome in 3D: al centro della sua zona, alla profondità del suo mondo, con le maiuscole alte mn.h pixel;
       parallelo allo schermo, con la cima appena verso chi guarda e un dondolio lento, così si vedono spessore e smusso */
    if (m.nome){
      nomeV.set((x + w / 2) / W * 2 - 1, -((scelto.y + h / 2) / H) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
      /* stessa immagine a qualunque distanza lungo il raggio: lo si mette vicino alla camera, così nessun mondo lo taglia */
      var prof = Math.min(2.5, Math.max(0.2, tmp2.copy(m.g.position).sub(camera.position).dot(avantiV)));
      m.nome.position.copy(camera.position).addScaledVector(nomeV, prof / Math.max(0.05, nomeV.dot(avantiV)));
      m.nome.scale.setScalar(mn.h * 2 * prof * tanF / H);
      nomeE.set(0.22, Math.sin(tempo * 0.37 + m.nomeFase) * 0.17, 0);
      m.nome.quaternion.copy(camera.quaternion).multiply(nomeQ.setFromEuler(nomeE));
      m.nome.visible = m.nomeL > 0.003;
      var z = ZONE_NOMI[MONDI_ID.indexOf(id)];
      if (m.nomeL > 0.05){
        var cx = x + w / 2, cy = scelto.y + h / 2, hw = m.nomeW * mn.h / 2 + mn.h * 0.3, hh = mn.h * 0.85;
        z.set((cx - hw) * DPR, (H - cy - hh) * DPR, (cx + hw) * DPR, (H - cy + hh) * DPR);
      } else z.set(-1e5, -1e5, -1e5, -1e5);
    }
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
  MONDI_ID.forEach(function(id){
    var s = SCHERMO[id]; var dd = Math.hypot(x - s.x, y - s.y);
    if (copertura(s, centroS) > 0.55) return;
    var rr = Math.max(s.r * (id === 'tool' ? 1.75 : 1.45), 34);   // Tool: anche le icone che le girano intorno
    var sp = proietta(MONDI[id].lineaB, {});
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
  MONDI_ID.forEach(function(k){ etichette[k].classList.toggle('on', k === id); });
  /* col puntatore sopra, la sua linea si accende */
  if (id && MONDI[id] && DOVE === 'centro' && !salto) accendi(MONDI[id]);
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
MONDI_ID.forEach(function(id){
  var el = etichette[id];
  el.addEventListener('mouseenter', function(){ sottoMouse = id; impostaHover(id); });
  el.addEventListener('mouseleave', function(){ sottoMouse = null; impostaHover(null); });
  el.addEventListener('focus', function(){ var v = true; try { v = el.matches(':focus-visible'); } catch (e){} if (v) impostaHover(id); });
  el.addEventListener('blur', function(){ impostaHover(null); });
});
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('[data-vai]');
  if (!a) return;
  /* il lucchetto è un link vero: con Cmd, Ctrl o Maiuscole si apre come sempre (altra scheda o finestra) */
  if (a.tagName === 'A' && a.getAttribute('data-vai') === 'area' && (e.metaKey || e.ctrlKey || e.shiftKey)) return;
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

/* ════════════════════════════ il viaggio ════════════════════════════ */
function luciLinee(id, k){
  MONDI_ID.forEach(function(s){ MONDI[s].lineaLuce = s === id ? 1 + 1.3 * k : 1 - 0.7 * k; });
}
function luciSezione(id){
  MONDI_ID.forEach(function(s){ MONDI[s].lineaLuce = s === id ? 0.32 : 0.16; });
}
/* luci delle linee durante il viaggio (dalla 3.59 senza salti): si parte da come sono (centro o sezione); all'andata la linea del mondo
   scelto si accende e le altre si abbassano, poi verso l'arrivo vanno piano alla luce della sezione; al ritorno si riaccendono tutte */
function luciViaggio(J, p){
  var kDa = E.inOut(clamp01(p / 0.22));
  MONDI_ID.forEach(function(s){
    var ora;
    if (J.avanti){
      var k = E.inOut(clamp01(p / 0.3));
      ora = mix(s === J.id ? 1 + 1.3 * k : 1 - 0.7 * k, s === J.id ? 0.32 : 0.16, E.inOut(clamp01((p - 0.62) / 0.38)));
    } else ora = 1 - 0.7 * (1 - E.inOut(clamp01(p / 0.7)));
    MONDI[s].lineaLuce = mix(J.luci[s], ora, kDa);
  });
}
/* rotta: curva di Bézier cubica percorsa a passo costante (tabella delle lunghezze), così la velocità la decide solo il profilo;
   dalla 3.59 la tabella è più fitta (256 tratti invece di 96): la velocità non ha più piccoli gradini da un tratto all'altro */
var N_ROTTA = 256;
function cubica(r, s, out){
  var u = 1 - s;
  return out.set(0, 0, 0).addScaledVector(r.p[0], u * u * u).addScaledVector(r.p[1], 3 * u * u * s).addScaledVector(r.p[2], 3 * u * s * s).addScaledVector(r.p[3], s * s * s);
}
function rotta(p0, p1, p2, p3){
  var r = { p: [p0.clone(), p1.clone(), p2.clone(), p3.clone()], lut: new Float32Array(N_ROTTA + 1), L: 0 };
  var a = p0.clone(), b = new V3();
  for (var i = 1; i <= N_ROTTA; i++){ cubica(r, i / N_ROTTA, b); r.L += b.distanceTo(a); r.lut[i] = r.L; a.copy(b); }
  return r;
}
function lungo(r, f, out){
  /* il primo tratto che arriva alla distanza d (ricerca binaria nella tabella) */
  var d = clamp01(f) * r.L, lut = r.lut, lo = 1, hi = N_ROTTA;
  while (lo < hi){ var mid = (lo + hi) >> 1; if (lut[mid] < d) lo = mid + 1; else hi = mid; }
  var a = lut[lo - 1], b = lut[lo];
  return cubica(r, (lo - 1 + (b > a ? (d - a) / (b - a) : 0)) / N_ROTTA, out);
}
/* la rotta gira intorno a Nemesi (con i suoi anelli) e agli altri mondi: se ci passa troppo vicino, i punti di controllo si spostano fuori */
function evita(r, ost){
  var q = new V3(), spinta = new V3();
  for (var it = 0; it < 12; it++){
    var peggio = 0;
    for (var i = 2; i <= 38; i++){
      cubica(r, i / 40, q);
      for (var k = 0; k < ost.length; k++){ var dd = q.distanceTo(ost[k].c); if (ost[k].r - dd > peggio){ peggio = ost[k].r - dd; spinta.copy(q).sub(ost[k].c); } }
    }
    if (peggio <= 0) break;
    if (spinta.lengthSq() < 1e-6) spinta.set(0, 1, 0);
    spinta.normalize();
    r.p[1].addScaledVector(spinta, peggio * 1.5 + 0.08); r.p[2].addScaledVector(spinta, peggio * 1.5 + 0.08);
    r = rotta(r.p[0], r.p[1], r.p[2], r.p[3]);
  }
  return r;
}
function creaRotta(id, da, a){
  var avanti = id !== 'centro';
  var P0 = da.pos.clone(), P3 = a.pos.clone(), L = P0.distanceTo(P3), P1, P2;
  var Cda = DOVE !== 'centro' && MONDI[DOVE] ? MONDI[DOVE].g.position : null;
  if (avanti){
    var C = MONDI[id].g.position;
    /* si parte verso il mondo (da un altro mondo: prima ci si stacca da quello) e si arriva da dietro la posa d'arrivo, dritti verso il mondo */
    P1 = Cda ? P0.clone().addScaledVector(tmp.copy(P0).sub(Cda).normalize(), L * 0.3).addScaledVector(tmp2.copy(C).sub(P0).normalize(), L * 0.12)
             : P0.clone().addScaledVector(tmp.copy(C).sub(P0).normalize(), L * 0.34);
    P2 = P3.clone().addScaledVector(a.verso, L * 0.32);
  } else {
    /* ci si stacca dal mondo all'indietro e si arriva arretrando: il sistema entra tutto nell'inquadratura */
    P1 = P0.clone().addScaledVector(tmp.copy(P0).sub(Cda || da.tgt).normalize(), L * 0.3);
    P2 = P3.clone().addScaledVector(tmp.copy(a.tgt).sub(P3).normalize(), L * 0.28);
  }
  var ost = [{ c: new V3(), r: R0 * 2.2 }];
  /* i mondi con qualcosa intorno (gli anelli del Portfolio, le icone di Tool) si evitano più larghi */
  MONDI_ID.forEach(function(k){ if (k !== id && k !== DOVE) ost.push({ c: MONDI[k].g.position.clone(), r: MONDI[k].r * (k === 'portfolio' ? 2.6 : k === 'tool' ? 2.3 : 1.8) }); });
  return evita(rotta(P0, P1, P2, P3), ost);
}
/* profilo della corsa: velocità t^1.5 · (1 - t)^2.6, cioè parte dolcemente, è al massimo poco oltre un terzo del tempo,
   poi frena a lungo e si ferma senza scatti. PROFILO = strada fatta (0..1), velocita() = velocità rispetto al massimo */
var V_A = 1.5, V_B = 2.6, V_MAX = Math.pow(V_A / (V_A + V_B), V_A) * Math.pow(V_B / (V_A + V_B), V_B);
function velocita(t){ t = clamp01(t); return Math.pow(t, V_A) * Math.pow(1 - t, V_B) / V_MAX; }
var PROFILO = (function(){
  var n = 200, f = new Float32Array(n + 1), tot = 0;
  for (var i = 1; i <= n; i++){ tot += velocita((i - 0.5) / n); f[i] = tot; }
  for (i = 1; i <= n; i++) f[i] /= tot;
  return f;
})();
function corsa(t){ t = clamp01(t) * 200; var i = Math.floor(t); return i >= 200 ? 1 : PROFILO[i] + (PROFILO[i + 1] - PROFILO[i]) * (t - i); }
/* pulviscolo: granelli sparsi intorno alla rotta (mai proprio sulla rotta), più fitti vicino */
function seminaPulviscolo(r){
  var q = new V3(), t = new V3(), a = new V3(), b = new V3(), P = pulv.aP, B = pulv.aB;
  for (var i = 0; i < pulv.n; i++){
    var f = Math.random();
    lungo(r, f, q); lungo(r, Math.min(1, f + 0.01), t);
    if (t.distanceToSquared(q) < 1e-10) lungo(r, Math.max(0, f - 0.01), t).sub(q).negate(); else t.sub(q);
    t.normalize();
    a.set(0, 1, 0).cross(t); if (a.lengthSq() < 1e-4) a.set(1, 0, 0).cross(t); a.normalize(); b.crossVectors(t, a);
    var ang = Math.random() * Math.PI * 2, rad = 0.22 + Math.pow(Math.random(), 1.5) * 3.4;
    q.addScaledVector(a, Math.cos(ang) * rad).addScaledVector(b, Math.sin(ang) * rad);
    P[i * 3] = q.x; P[i * 3 + 1] = q.y; P[i * 3 + 2] = q.z; B[i] = 0.25 + Math.pow(Math.random(), 3.0) * 1.3;
  }
  pulv.mesh.geometry.attributes.aP.needsUpdate = true; pulv.mesh.geometry.attributes.aB.needsUpdate = true;
}
/* il viaggio: la camera si gira verso la meta mentre parte, accelera, poi frena a lungo ed entra in orbita intorno al mondo
   (o, tornando, arretra finché vede tutto il sistema). Nessun lampo e nessun tunnel: il mondo cresce davvero perché ci si avvicina;
   il pulviscolo sfila, la ripresa trema appena e si inclina un poco nella curva */
var motoDir = new V3();
function percorso(p, J){
  var a = J.a, da = J.da, r = J.r, f = corsa(p), v = velocita(p);
  lungo(r, f, CAM.pos);
  lungo(r, Math.min(1, f + 0.004), motoDir); motoDir.sub(CAM.pos);
  if (motoDir.lengthSq() < 1e-10) motoDir.copy(CAM.tgt).sub(CAM.pos);
  motoDir.normalize();
  if (J.avanti){
    CAM.tgt.lerpVectors(da.tgt, a.tgt, E.inOut(clamp01(p / 0.4)));
    var k0 = 1 - E.inOut(clamp01(p / 0.3)), k1 = E.inOut(clamp01((p - 0.55) / 0.45));
    CAM.ox = da.ox * k0 + a.ox * k1; CAM.oy = da.oy * k0 + a.oy * k1;
  } else {
    CAM.tgt.lerpVectors(da.tgt, a.tgt, E.inOut(clamp01((p - 0.04) / 0.62)));
    var k2 = 1 - E.inOut(clamp01(p / 0.35)); CAM.ox = da.ox * k2; CAM.oy = da.oy * k2;
  }
  luciViaggio(J, p);
  CAM.fov = mix(da.fov, a.fov, E.inOut(p));
  /* inclinazione nella curva: comincia e finisce senza strappi (sin², dalla 3.59) */
  FX.roll = J.banca * Math.pow(Math.sin(Math.PI * p), 2) * (0.4 + 0.6 * v);
  FX.scossa = 0.0014 * v * v;
  FX.sfoca = 0.026 * v * v;
  FX.pulv = Math.min(1, v * 1.25);
  FX.aberr = 0.0011 + 0.0028 * v;
  FX.vign = VIGN + 0.16 * v;
  FX.bloom = 0.9 + 0.08 * v;
  FX.esp = 1; FX.flash = 0;
  polvere.material.uniforms.uLuce.value = 0.035 + 0.05 * v;
}
/* tornati al centro, le aste ripartono da Nemesi una dopo l'altra, si accendono sfarfallando e illuminano il loro mondo */
function riaccendiLinee(){
  MONDI_ID.forEach(function(id, i){
    var m = MONDI[id], L = { v: 0 }, S = { f: 0 };
    INTRO.linee[i] = 0;
    gsap.to(L, { v: 1, duration: 0.42, delay: 0.04 + i * 0.09, ease: 'power2.in', onUpdate: function(){ INTRO.linee[i] = L.v; }, onComplete: function(){ accendi(m, true); } });
    gsap.to(S, { f: 1, duration: 0.42, delay: 0.4 + i * 0.09, ease: 'none', onUpdate: function(){
      var f = S.f; m.sfarfallio = f < 0.15 ? 0.35 : f < 0.25 ? 1.7 : f < 0.4 ? 0.3 : f < 0.55 ? 1.35 : 1; } });
  });
}
function riposo(){
  FX.flash = 0; FX.aberr = 0.0011; FX.scossa = 0; FX.vign = VIGN; FX.bloom = 0.9; FX.sfoca = 0; FX.roll = 0; FX.esp = 1; FX.pulv = 0;
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
  var r = creaRotta(id, da, a);
  var dur = avanti ? (DOVE === 'centro' ? 3.0 : 3.3) : 2.7;
  /* nella curva la ripresa si inclina un poco verso l'interno, come un velivolo */
  var d1 = r.p[3].clone().sub(r.p[2]).normalize(), destra = new V3(1, 0, 0).applyQuaternion(camera.quaternion);
  var J = { p: 0, da: da, a: a, r: r, avanti: avanti, id: id, banca: -0.045 * Math.max(-1, Math.min(1, d1.dot(destra) * 1.6)), luci: {} };
  MONDI_ID.forEach(function(s){ J.luci[s] = MONDI[s].lineaLuce !== undefined ? MONDI[s].lineaLuce : 1; });
  seminaPulviscolo(r);
  var tl = gsap.timeline({ paused: !!(opz && opz.fermo), onComplete: function(){ arrivato(id); } });
  tl.to(J, { p: 1, duration: dur, ease: 'none', onUpdate: function(){ percorso(J.p, J); } });
  if (avanti && pannelli[id]) tl.call(function(){ apriPannello(id); }, null, dur * 0.8);
  else if (!avanti && !(opz && opz.fermo)) tl.call(riaccendiLinee, null, dur * 0.72);
  tl._dur = dur;
  return tl;
}
var vpFisso = false;   // nelle prove (__mondi.prova) la camera «di un attimo prima» resta quella calcolata, per vedere le scie
function vai(id, opz){
  opz = opz || {};
  if (id === 'area' && (RIDOTTO || !pronto)){ location.href = AREA; return; }
  if (!pronto || entrando) return;
  if (id !== 'centro' && MONDI_ID.indexOf(id) < 0) return;
  if (salto){ prossimo = id; return; }
  if (id === DOVE) return;
  impostaHover(null);
  vpFisso = false;
  /* il sistema si ferma dov'è: il viaggio parte verso il mondo nel punto in cui si trova */
  SIS.presa = null; SIS.w.set(0, 0, 0); SIS.k = 0; sottoMouse = null; canvas.style.cursor = '';
  var dove0 = DOVE;
  if (dove0 !== 'centro') chiudiPannello(dove0);
  MONDI.studio.qBologna = id === 'studio' ? quatBologna() : null;
  if (id === 'area'){ try { history.replaceState({ mondo: 'centro' }, '', location.pathname + location.search); } catch (e){} }
  else if (opz.storia !== false) try { history.pushState({ mondo: id }, '', id === 'centro' ? location.pathname + location.search : '#' + id); } catch (e){}
  segnaBarra(SEZIONI.indexOf(id) >= 0 ? id : null);
  META = id;
  if (RIDOTTO || opz.subito){
    camDa(id === 'centro' ? posaCentro() : posaSezione(id));
    luciLinee(id === 'centro' ? null : id, id === 'centro' ? 0 : 1);
    /* senza viaggio anche le luci che di solito cambiano piano vanno subito al loro posto */
    PAR.amp = ampParallasse(); MONDI.studio.vicino = id === 'studio' ? 1 : 0;
    MONDI_ID.forEach(function(k){ MONDI[k].aloneK = k === id ? 0.45 : 1; });
    arrivato(id);
    if (pannelli[id]) apriPannello(id);
    return;
  }
  d.classList.add('salto');
  salto = creaSalto(id);
  salto.play();
}
function arrivato(id){
  var da = DOVE;
  DOVE = id; META = id; salto = null; riposo();
  if (id === 'centro') luciLinee(null, 0); else luciSezione(id);
  d.classList.remove('salto');
  d.classList.toggle('in-sezione', id !== 'centro');
  if (id === 'area'){
    /* se durante il viaggio si è chiesto di tornare (Esc, Indietro) si torna, altrimenti ci si tuffa nell'area */
    if (prossimo && prossimo !== 'area'){ var pr = prossimo; prossimo = null; vai(pr); return; }
    prossimo = null; entraArea(); return;
  }
  if (id === 'centro' && da !== 'centro' && etichette[da]) try { etichette[da].focus({ preventScroll: true }); } catch (e){}
  if (id !== 'centro') fuocoPannello(id);
  if (prossimo){ var p = prossimo; prossimo = null; if (p !== DOVE) vai(p); }
}
/* area riservata: arrivati al pianeta di lava la camera si tuffa nella sua luce e passa dall'altra parte, nel colore della pagina
   dell'area: nero con la pioggia di codice (accesso) o chiaro se si è già entrati (accesso ancora valido nel browser) */
var velo = document.getElementById('velo'), entrando = false, entraTl = null;
function entraArea(){
  entrando = true;
  var dentro = false;
  try { var t = JSON.parse(localStorage.getItem('nemesiweb-ar-token')); dentro = !!(t && t.token && t.scade > Date.now() / 1000); } catch (e){}
  if (velo) velo.style.background = dentro ? '#fbfbfd' : '#000';
  var m = MONDI.area, p0 = CAM.pos.clone(), dir = m.g.position.clone().sub(p0), corsaMax = dir.length() - m.r * 1.03;
  dir.normalize();
  var T = { k: 0 };
  entraTl = gsap.timeline({ onComplete: function(){ location.href = AREA; } });
  entraTl.to(T, { k: 1, duration: 1.1, ease: 'power2.in', onUpdate: function(){
      var k = T.k;
      CAM.pos.copy(p0).addScaledVector(dir, corsaMax * k);
      FX.esp = 1 + k * k * 2.4; FX.bloom = 0.9 + k * 1.4; FX.sfoca = 0.035 * k * k; FX.scossa = 0.0015 * k;
    } }, 0);
  if (velo) entraTl.fromTo(velo, { opacity: 0 }, { opacity: 1, duration: 0.42, ease: 'power1.in' }, 0.72);
}
addEventListener('pageshow', function(e){
  if (!e.persisted || !entrando) return;
  /* tornati indietro dall'area riservata con la pagina ancora in memoria: via il velo, la camera torna al centro */
  if (entraTl){ entraTl.kill(); entraTl = null; }
  if (velo){ gsap.killTweensOf(velo); velo.style.opacity = '0'; }
  entrando = false; riposo();
  camDa(posaSezione('area'));
  vai('centro', { storia: false });
});
addEventListener('popstate', function(e){
  var id = (e.state && e.state.mondo) || (location.hash.length > 1 ? location.hash.slice(1) : 'centro');
  if (SEZIONI.indexOf(id) < 0) id = 'centro';
  if (id !== DOVE) vai(id, { storia: false });
});

/* ════════════════════════════ ciclo ════════════════════════════ */
/* un solo orologio per tutto (dalla 3.59): il tempo del fotogramma che dà requestAnimationFrame (preciso, a passi regolari),
   agganciato al periodo dello schermo. Prima GSAP leggeva Date.now() e la scena performance.now() nel momento in cui toccava allo
   script: a ogni fotogramma sbagliavano di qualche millisecondo (passi da 12 a 18 ms invece di 16,7) e nel viaggio, dove la camera
   corre, il movimento andava a scatti. Ora GSAP non ha un orologio suo: lo muove giro() con lo stesso passo della scena */
var OROLOGIO = { t: 0, ultimo: -1, periodo: 1 / 60, campioni: [], n: 0 };
function passoOrologio(ts){
  var o = OROLOGIO, dt = o.ultimo < 0 ? o.periodo : (ts - o.ultimo) / 1000;
  o.ultimo = ts;
  /* periodo dello schermo dagli ultimi passi (60 Hz, 120 Hz…), senza quelli fuori misura */
  if (dt > 0.004 && dt < 0.045){
    o.campioni.push(dt); if (o.campioni.length > 30) o.campioni.shift();
    if (++o.n % 15 === 0){
      var s = o.campioni.slice().sort(function(a, b){ return a - b; }), q = s.length >> 2, m = 0;
      for (var i = q; i < s.length - q; i++) m += s[i];
      o.periodo = m / (s.length - 2 * q);   // media della metà centrale: i tempi del browser sono arrotondati al decimo di millisecondo
    }
  }
  /* un passo dura esattamente uno (o due, tre… se un fotogramma è saltato) periodi dello schermo */
  var k = Math.max(1, Math.round(dt / o.periodo));
  if (Math.abs(dt - k * o.periodo) < o.periodo * 0.2) dt = k * o.periodo;
  return Math.min(0.05, Math.max(0, dt));
}
function giro(ts){
  requestAnimationFrame(giro);
  var dt = passoOrologio(ts);
  OROLOGIO.t += dt;
  gsap.updateRoot(OROLOGIO.t);
  ciclo(dt);
}
function avviaOrologio(){
  OROLOGIO.t = gsap.ticker.time;
  gsap.ticker.remove(gsap.updateRoot);
  requestAnimationFrame(giro);
}
var campioni = [], abbassata = 0, tmpM = new THREE.Matrix4();
function ciclo(dt){
  aggiorna(dt);
  applicaCamera(dt);
  aggiornaIcone();
  aggiornaSchermo();
  aggiornaSegno();
  /* sfocatura di movimento intorno al punto dello schermo verso cui va la camera */
  if (FX.sfoca > 0.0005 && salto){
    tmp.copy(motoDir).multiplyScalar(10).add(camera.position).project(camera);
    if (tmp.z < 1){ FX.sfocaX = clamp01(tmp.x * 0.5 + 0.5); FX.sfocaY = clamp01(tmp.y * 0.5 + 0.5); }
  } else if (!entrando){ FX.sfocaX = 0.5; FX.sfocaY = 0.5; }
  /* pulviscolo: la camera di un attimo prima (il fotogramma precedente) disegna le scie */
  pulv.mesh.material.uniforms.uPrima.value.copy(vpPronta ? vpPrima : tmpM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  disegna();
  if (!vpFisso){ vpPrima.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); vpPronta = true; }
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
  INTRO.acc = 1; INTRO.sole = 1; INTRO.neon = 1; INTRO.atmo = 1; INTRO.linee = [1, 1, 1, 1, 1]; INTRO.mondi = [1, 1, 1, 1, 1];
  MONDI_ID.forEach(function(id){ MONDI[id].sfarfallio = 1; });
}
function mostraInterfaccia(subito){
  d.classList.add('pronto');
  var su = function(id){ etichette[id].classList.add('su'); MONDI[id].nomeSu = true; };
  if (subito){ MONDI_ID.forEach(function(id){ su(id); if (MONDI[id].nome) MONDI[id].nomeL = 1; }); return; }
  gsap.fromTo(hdr, { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity' });
  MONDI_ID.forEach(function(id, i){ setTimeout(function(){ su(id); }, 350 + i * 90); });
}
function entrata(){
  /* la luce del taglio entra nel mondo: buio, poi le crepe si accendono dal centro, sorge il sole, la camera si allontana e le linee partono verso i mondi */
  var fin = posaCentro();
  var vicino = { pos: fin.tgt.clone().add(fin.pos.clone().sub(fin.tgt).normalize().multiplyScalar(R0 * (verticale() ? 5.6 : 4.3))), tgt: fin.tgt.clone(), fov: fin.fov, ox: 0, oy: 0 };
  camDa(vicino);
  INTRO.acc = 0; INTRO.sole = 0; INTRO.neon = 0; INTRO.atmo = 0; INTRO.linee = [0, 0, 0, 0, 0]; INTRO.mondi = [0, 0, 0, 0, 0];
  NEMESI.mat.uniforms.uAccP.value.copy(vicino.pos).normalize();
  MONDI_ID.forEach(function(id){ MONDI[id].sfarfallio = 1; });
  var tl = gsap.timeline({ onComplete: function(){ statoFinale(); pronto = true; window.__ready = true; } });
  var P = { k: 0 };
  tl.to(INTRO, { acc: 1, duration: 2.1, ease: 'power1.inOut' }, 0.74)
    .to(FX, { flash: 0.08, duration: 0.1, ease: 'power2.out' }, 0.76)
    .to(FX, { flash: 0, duration: 0.6, ease: 'power2.in' }, 0.86)
    .to(INTRO, { sole: 1, atmo: 1, duration: 2.2, ease: 'power2.inOut' }, 0.8)
    .to(P, { k: 1, duration: 2.9, ease: 'power3.inOut', onUpdate: function(){
        CAM.pos.lerpVectors(vicino.pos, fin.pos, P.k); CAM.tgt.lerpVectors(vicino.tgt, fin.tgt, P.k); } }, 0.75)
    .to(INTRO, { neon: 1, duration: 1.2, ease: 'power2.inOut' }, 1.35);
  MONDI_ID.forEach(function(id, i){
    var t0 = 1.95 + i * 0.18, m = MONDI[id];
    var L = { v: 0 };
    tl.to(L, { v: 1, duration: 0.55, ease: 'power2.in', onUpdate: function(){ INTRO.linee[i] = L.v; } }, t0);
    /* la linea arriva al mondo e lo illumina */
    tl.call(function(){ accendi(m, true); }, null, t0 + 0.55);
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
    MONDI_ID.forEach(function(id){ etichette[id]._w = 0; });
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

Promise.all([caricaTexture(), caricaNomi()]).then(function(){
  assegnaTexture();
  creaNomi();
  /* prima di mostrare: compila gli shader e carica le texture sulla scheda video (sotto il video, non si vede) */
  pulv.mesh.visible = true; MONDI_ID.forEach(function(id){ if (MONDI[id].nome) MONDI[id].nome.visible = true; });
  try { renderer.compile(scene, camera); } catch (e){}
  pulv.mesh.visible = false; MONDI_ID.forEach(function(id){ if (MONDI[id].nome) MONDI[id].nome.visible = false; });
  Object.keys(T).forEach(function(k){ try { renderer.initTexture(T[k]); } catch (e){} });
  aggiorna(0); applicaCamera(0); aggiornaIcone(); disegna();
  return fontPronti();
}).then(function(){
  avviaOrologio();
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
  /* ferma un viaggio a metà: __mondi.prova('portfolio', 0.5); il pulviscolo mostra le scie di 1/60 di secondo prima */
  prova: function(id, p){
    if (salto){ salto.kill(); salto = null; }
    if (DOVE !== 'centro') chiudiPannello(DOVE);
    MONDI.studio.qBologna = id === 'studio' ? quatBologna() : null;
    camDa(DOVE === 'centro' ? posaCentro() : posaSezione(DOVE));
    var tl = creaSalto(id, { fermo: true }); d.classList.add('salto');
    tl.progress(Math.max(0, p - 1 / (60 * tl._dur))); applicaCamera(0);
    vpPrima.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); vpPronta = true; vpFisso = true;
    tl.progress(p); return true;
  },
  /* accende una linea: __mondi.accendi('tool', 0.5) = mezzo secondo dopo la partenza (la luce arriva al mondo a 0,8) */
  accendi: function(id, t){ var m = MONDI[id]; if (!m) return false; m.acc = t || 0; return true; },
  /* __mondi.accensioni(false) spegne le accensioni che partono da sole (per le foto), __mondi.accensioni(true) le riaccende */
  accensioni: function(si){ ACC.ferme = si === false; if (ACC.ferme) MONDI_ID.forEach(function(id){ MONDI[id].acc = -1; }); return true; },
  hover: function(id){ impostaHover(id); },
  /* icone degli strumenti: dove stanno sullo schermo; __mondi.icone({ lastre: false }) o ({ scie: false }) ne nasconde una parte (prove) */
  icone: function(o){ if (o) PROVA_ICONE = o; return ICONE.map(function(ic){ var s = proietta(ic.o.position, {}); return [ic.id, Math.round(s.x), Math.round(s.y)]; }); },
  /* mette il sistema a un angolo preciso e lo tiene fermo (per le foto): __mondi.giostra(90) · __mondi.giostra(0, false) lo libera */
  giostra: function(gradi, ferma){ SIS.q.setFromAxisAngle(SU, (gradi || 0) * Math.PI / 180); SIS.w.set(0, 0, 0); SIS.prova = ferma !== false; return true; },
  sistema: function(){ return { q: SIS.q.toArray().map(function(x){ return +x.toFixed(4); }), w: SIS.w.toArray().map(function(x){ return +x.toFixed(3); }), k: +SIS.k.toFixed(3), presa: !!SIS.presa }; },
  fx: function(o){ Object.assign(FX, o); return true; },
  misure: function(){ var o = { W: W, H: H, fov: camera.fov, camFov: CAM.fov, vert: verticale(), dispFov: disposizione().fov, dove: DOVE, cam: camera.position.toArray().map(function(x){ return +x.toFixed(2); }), centro: [centroS.x, centroS.y] };
    MONDI_ID.forEach(function(id){ var q = SCHERMO[id]; o[id] = [Math.round(q.x), Math.round(q.y), Math.round(q.r), +q.cop.toFixed(2)]; }); o.nemesi = [Math.round(centroS.x), Math.round(centroS.y), Math.round(centroS.r)]; return o; }
};
})();
