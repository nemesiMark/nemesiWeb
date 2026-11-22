/* Nemesi Web 2.9 · il logo in 3D dell'apertura.
   Il marchio (nastro nero piegato, triangolo e barra arancio) è costruito in Three.js r147 e passa per un filtro
   a schermo che lo taglia in strisce verticali sottili, sfalsate e con le frange di colore: si compone dall'alto,
   resta, poi si sfalda in una pioggia di strisce e lascia il posto al sito.
   Uso: var L = Logo3D.play(canvas); L.held (promessa: il logo è composto); L.exit(fatto) lo fa piovere via. */
(function(){
'use strict';
var T = window.THREE, PI = Math.PI;
if (!T) return;

function lin(h){ return new T.Color(h).convertSRGBToLinear(); }
function clamp(x, a, b){ return x < a ? a : x > b ? b : x; }
function seg(t, a, b){ return clamp((t - a) / (b - a), 0, 1); }
function io3(t){ return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
function out3(t){ return 1 - Math.pow(1 - t, 3); }

/* ── il disegno del marchio, in pixel dell'immagine originale (1536×1024, y in giù) ── */
var CX = 790, CY = 500, U = 1 / 400;                         // centro e scala: 400 px = 1 unità
function P(x, y){ return new T.Vector2((x - CX) * U, -(y - CY) * U); }

/* nastro: due gambe dritte raccordate in cima da un arco, tagliate in orizzontale al piede */
function nastro(){
  var FOOT = 760, TH = 118, RC = 120;                         // piede, spessore, raggio del raccordo (alla mezzeria)
  var a = new T.Vector2(330, FOOT), b = new T.Vector2(1185, FOOT);
  var dl = new T.Vector2(-0.53, 0.848).normalize();           // gamba sinistra: dalla cima verso il piede (y in giù)
  var dr = new T.Vector2(0.80, 0.60).normalize();             // gamba destra
  /* vertice V dove le due mezzerie si incontrano: a = V + s·dl, b = V + u·dr */
  var det = dl.x * (-dr.y) - (-dr.x) * dl.y;
  var rx = b.x - a.x, ry = b.y - a.y;
  var s = (rx * dr.y - dr.x * ry) / det;
  var V = new T.Vector2(a.x - s * dl.x, a.y - s * dl.y);
  /* arco di raccordo tangente alle due gambe */
  var half = Math.acos(clamp(dl.dot(dr), -1, 1)) / 2;
  var bis = dl.clone().add(dr).normalize();                   // bisettrice, verso il basso (dentro la V)
  var dc = RC / Math.sin(half), C = V.clone().addScaledVector(bis, dc);
  var tl = V.clone().addScaledVector(dl, RC / Math.tan(half)); // punti di tangenza
  var tr = V.clone().addScaledVector(dr, RC / Math.tan(half));
  var i, n = 28;
  var nl = new T.Vector2(dl.y, -dl.x);                        // normale «fuori» della gamba sinistra (verso l'alto-sinistra)
  if (nl.y > 0) nl.negate();
  var nr = new T.Vector2(-dr.y, dr.x);
  if (nr.y > 0) nr.negate();
  var outer = [], inner = [], h = TH / 2;
  function foot(p, d, nn, sign){                              // punto sul bordo, fatto scorrere lungo la gamba fino al piede
    var q = p.clone().addScaledVector(nn, sign * h), k = (FOOT - q.y) / d.y;
    return q.addScaledVector(d, k);
  }
  outer.push(foot(a, dl, nl, 1)); inner.push(foot(a, dl, nl, -1));
  /* arco: da tl a tr passando per la cima; il centro C sta sotto, i bordi sono cerchi di raggio RC±h */
  var A0 = Math.atan2(tl.y - C.y, tl.x - C.x), A1 = Math.atan2(tr.y - C.y, tr.x - C.x);
  /* in pixel (y in giù) la cima ha angolo -PI/2: si va da A0 ad A1 passando per -PI/2 */
  var da = A1 - A0; while (da > PI) da -= 2 * PI; while (da < -PI) da += 2 * PI;
  for (i = 0; i <= n; i++){
    var ang = A0 + da * (i / n), cs = Math.cos(ang), sn = Math.sin(ang);
    outer.push(new T.Vector2(C.x + cs * (RC + h), C.y + sn * (RC + h)));
    inner.push(new T.Vector2(C.x + cs * Math.max(RC - h, 4), C.y + sn * Math.max(RC - h, 4)));
  }
  outer.push(foot(b, dr, nr, 1)); inner.push(foot(b, dr, nr, -1));
  var pts = outer.concat(inner.reverse()).map(function(v){ return P(v.x, v.y); });
  return new T.Shape(pts);
}
function poligono(list){ return new T.Shape(list.map(function(v){ return P(v[0], v[1]); })); }

/* ── materiali ── */
var VS = 'varying vec2 vP; varying vec3 vN; varying vec3 vV;\n' +
  'void main(){ vP = position.xy; vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }';
/* pannelli arancio: luce propria, sfumata dal giallo in alto a sinistra al rosso in basso a destra */
var FS_ARANCIO = 'uniform vec3 uA, uB, uC; uniform vec2 uLo, uHi; uniform float uK; varying vec2 vP; varying vec3 vN; varying vec3 vV;\n' +
  'void main(){ vec2 q = (vP - uLo) / (uHi - uLo); float t = clamp(0.62 * (1.0 - q.y) + 0.38 * q.x, 0.0, 1.0);\n' +
  ' vec3 c = t < 0.5 ? mix(uA, uB, t * 2.0) : mix(uB, uC, t * 2.0 - 1.0);\n' +
  ' float side = 1.0 - abs(normalize(vN).z); c = mix(c, uB * 0.55, side * 0.6);\n' +
  ' gl_FragColor = vec4(c * uK, 1.0); }';

/* filtro a schermo: strisce verticali, sfalsamento, frange di colore, alone arancio */
var VS_Q = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
var FS_Q = [
  'uniform sampler2D tS; uniform vec2 uRes; uniform float uDpr, uTime, uFront, uOut, uFlick, uFlickY;',
  'varying vec2 vUv;',
  'float h1(float n){ return fract(sin(n * 127.1) * 43758.5453); }',
  'float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
  'vec3 enc(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }',
  'void main(){',
  '  vec2 fc = vUv * uRes;',
  '  float cw = 3.0 * uDpr;',                                         // larghezza di una striscia
  '  float col = floor(fc.x / cw), rc = h1(col + 1.0);',
  '  float sl = (10.0 + 34.0 * h1(col * 3.1 + 7.0)) * uDpr;',            // lunghezza dei tratti di questa colonna
  '  float sg = floor((fc.y + rc * 997.0) / sl);',
  '  float d = 1.0 - vUv.y;',                                         // 0 in cima, 1 in fondo
  '  float a = smoothstep(uFront - 0.04, uFront + 0.22, d + (rc - 0.5) * 0.08);',  // sotto il fronte il logo è ancora a pezzi
  '  a = max(a, uFlick * (1.0 - smoothstep(0.0, 0.045, abs(vUv.y - uFlickY))) * (0.35 + 0.65 * step(0.45, rc)));',
  '  a = max(a, uOut * (0.65 + 0.35 * rc));',
  '  float tq = floor(uTime * 14.0);',
  '  float jit = (h2(vec2(col, sg + tq)) - 0.5) * 0.22 * a;',             // sfalsamento verticale che tremola
  '  float fall = uOut * uOut * (0.25 + 0.9 * rc);',                       // all\'uscita le strisce cadono
  '  float sx = mix(vUv.x, (col + 0.5) * cw / uRes.x, step(0.02, a));',  // dentro una striscia il colore è uno solo
  '  float sy = vUv.y + jit + fall;',
  '  float ca = (0.0015 + 0.010 * a);',                                  // frange rosso / blu
  '  vec4 g = texture2D(tS, vec2(sx, sy));',
  '  float r = texture2D(tS, vec2(sx + ca * 0.35, sy + ca)).r;',
  '  float b = texture2D(tS, vec2(sx - ca * 0.35, sy - ca)).b;',
  '  vec4 s = vec4(r, g.g, b, g.a);',
  '  float keep = step(a * 0.93, h2(vec2(col * 1.7, sg)));',              // le strisce spariscono a caso
  '  float dash = mix(1.0, step(0.32, fract((fc.y + rc * 53.0) / (6.0 * uDpr))), smoothstep(0.08, 0.35, a));',
  '  float m = keep * dash;',
  '  vec3 tint = 0.5 + 0.5 * cos(6.2831 * (rc + vec3(0.0, 0.33, 0.67)));', // un filo di arcobaleno sulle strisce sciolte
  '  s.rgb = mix(s.rgb, s.rgb * (0.6 + 0.8 * tint), a * 0.55);',
  '  float al = s.a * m;',
  /* alone arancio: campiona il pannello acceso intorno al punto (il logo pulito è nitido, l\'alone no) */
  '  vec3 glow = vec3(0.0);',
  '  for (int i = 0; i < 12; i++){ float an = float(i) * 0.5236 + 0.26; vec2 o = vec2(cos(an), sin(an));',
  '    vec4 q1 = texture2D(tS, vUv + o * 9.0 * uDpr / uRes); vec4 q2 = texture2D(tS, vUv + o * 22.0 * uDpr / uRes);',
  '    glow += vec3(1.0, 0.42, 0.12) * (max(q1.r - 1.6 * q1.b, 0.0) * 0.8 + max(q2.r - 1.6 * q2.b, 0.0) * 0.5); }',
  '  glow *= (1.0 / 12.0) * 0.9 * pow(1.0 - uOut, 3.0) * (1.0 - smoothstep(0.3, 1.0, a));',
  '  vec3 c = enc(s.rgb) * al;',
  '  float ga = clamp(max(glow.r, max(glow.g, glow.b)), 0.0, 1.0) * (1.0 - al);',
  '  c += enc(glow) * (1.0 - al);',
  '  gl_FragColor = vec4(c, clamp(al + ga, 0.0, 1.0));',
  '}'].join('\n');

function play(canvas){
  var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);

  var scene = new T.Scene();
  var cam = new T.PerspectiveCamera(26, 1, .1, 60);

  /* luci: chiave dall'alto a sinistra (il dorso del nastro diventa grigio), riflessi arancio dai pannelli */
  scene.add(new T.HemisphereLight(0xdfe3ea, 0x101014, 0.32));
  var key = new T.DirectionalLight(0xffffff, 2.4); key.position.set(-1.2, 5, -1.6); scene.add(key);
  var fill = new T.DirectionalLight(0xbfc6d4, 0.5); fill.position.set(2.5, 3, -2); scene.add(fill);
  var o1 = new T.PointLight(0xff5a14, 1.1, 1.6, 2); o1.position.copy(new T.Vector3(P(600, 640).x, P(600, 640).y, 0.35)); scene.add(o1);
  var o2 = new T.PointLight(0xff6a1a, 1.0, 1.6, 2); o2.position.copy(new T.Vector3(P(1180, 520).x, P(1180, 520).y, 0.3)); scene.add(o2);

  var logo = new T.Group(); scene.add(logo);
  var DEPTH = 0.62;
  var nero = new T.MeshStandardMaterial({ color: 0x17171b, roughness: 0.3, metalness: 0.1 });
  var gN = new T.ExtrudeGeometry(nastro(), { depth: DEPTH, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 4, curveSegments: 1 });
  gN.translate(0, 0, -DEPTH);
  var mN = new T.Mesh(gN, nero); logo.add(mN);

  /* bordo acceso: lo stesso nastro appena più grande, arancio, dietro la faccia (si vede come un filo sul contorno) */
  var bordo = new T.Mesh(new T.ExtrudeGeometry(nastro(), { depth: 0.04, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.02, bevelSegments: 2, curveSegments: 1 }),
    new T.MeshBasicMaterial({ color: lin('#FF7A22') }));
  bordo.geometry.translate(0, 0, -0.075); logo.add(bordo);

  function pannello(list, k){
    var sh = poligono(list), g = new T.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2 });
    g.computeBoundingBox(); var bb = g.boundingBox;
    var m = new T.ShaderMaterial({ vertexShader: VS, fragmentShader: FS_ARANCIO, uniforms: {
      uA: { value: lin('#FFE45C') }, uB: { value: lin('#FF7A1E') }, uC: { value: lin('#E42400') },
      uLo: { value: new T.Vector2(bb.min.x, bb.min.y) }, uHi: { value: new T.Vector2(bb.max.x, bb.max.y) }, uK: { value: k } } });
    var mesh = new T.Mesh(g, m); mesh.position.z = -0.03; logo.add(mesh); return mesh;
  }
  pannello([[288, 748], [578, 414], [716, 546], [548, 748]], 1.0);            // triangolo sotto la gamba sinistra
  pannello([[1100, 218], [1280, 218], [1280, 668], [1100, 492]], 1.05);       // barra a destra

  /* passaggio a schermo */
  var rt = new T.WebGLRenderTarget(2, 2, { samples: 4 });
  var qMat = new T.ShaderMaterial({ vertexShader: VS_Q, fragmentShader: FS_Q, transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tS: { value: rt.texture }, uRes: { value: new T.Vector2(1, 1) }, uDpr: { value: dpr }, uTime: { value: 0 },
      uFront: { value: -0.3 }, uOut: { value: 0 }, uFlick: { value: 0 }, uFlickY: { value: 0.5 } } });
  var quad = new T.Mesh(new T.PlaneGeometry(2, 2), qMat), qScene = new T.Scene(), qCam = new T.Camera();
  quad.frustumCulled = false; qScene.add(quad);

  /* inquadratura: il logo occupa circa metà della larghezza (di più sul telefono) */
  var W = 1, H = 1, LW = 1135 * U + 0.4, LH = 560 * U + 0.35;
  function resize(){
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setSize(W, H, false); rt.setSize(Math.round(W * dpr), Math.round(H * dpr));
    qMat.uniforms.uRes.value.set(Math.round(W * dpr), Math.round(H * dpr));
    cam.aspect = W / H; cam.updateProjectionMatrix();
    var frac = W < 760 ? 0.86 : 0.6;
    var vh = 2 * Math.tan(cam.fov * PI / 360);                            // altezza vista a distanza 1
    var dW = LW / (frac * vh * cam.aspect), dH = LH / (0.56 * vh);
    dist = Math.max(dW, dH);
  }
  var dist = 8;
  addEventListener('resize', resize); resize();

  /* tempi (secondi): compare a strisce, si compone dall'alto, resta; poi piove via quando la pagina lo chiede */
  var TB0 = 0.15, TB1 = 2.1, THOLD = 2.9;
  var t0 = performance.now(), raf = 0, exitAt = -1, EXIT = 1.25, onDone = null, heldRes, alive = true;
  var held = new Promise(function(r){ heldRes = r; });
  var flickNext = 2.35, flickT = -1, flickY = .5;

  function tick(now){
    if (!alive) return;
    var t = (now - t0) / 1000;
    var u = qMat.uniforms;
    u.uTime.value = t;
    u.uFront.value = -0.3 + 1.6 * io3(seg(t, TB0, TB1));
    /* ogni tanto una riga di strisce scatta, come un segnale disturbato */
    if (exitAt < 0 && t > flickNext){ flickT = t; flickY = 0.3 + Math.random() * 0.4; flickNext = t + 0.9 + Math.random() * 1.4; }
    var fk = flickT > 0 ? Math.max(0, 1 - (t - flickT) / 0.22) : 0;
    u.uFlick.value = fk * 0.8; u.uFlickY.value = flickY;
    if (t > THOLD && heldRes){ heldRes(); heldRes = null; }
    var e = exitAt < 0 ? 0 : seg(t, exitAt, exitAt + EXIT);
    u.uOut.value = out3(e) * 0.4 + e * e * 0.6;
    /* il logo gira piano e respira; all'uscita scende un poco */
    var turn = -0.62 + 0.36 * out3(seg(t, 0, 3.2)) + 0.03 * Math.sin(t * 0.9);
    logo.rotation.set(0.05 + 0.02 * Math.sin(t * 0.7), turn, 0);
    logo.position.y = -0.03 + 0.025 * Math.sin(t * 1.1) - 0.25 * e * e;
    cam.position.set(-0.22 * dist, 0.36 * dist, 0.92 * dist);
    cam.lookAt(0, -0.05, 0);
    renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, cam);
    renderer.setRenderTarget(null); renderer.clear(); renderer.render(qScene, qCam);
    if (exitAt >= 0 && e >= 1){ stop(); if (onDone) onDone(); return; }
    raf = requestAnimationFrame(tick);
  }
  function stop(){
    alive = false; cancelAnimationFrame(raf); removeEventListener('resize', resize);
    rt.dispose(); renderer.dispose();
    try { renderer.forceContextLoss(); } catch (e){}
  }
  raf = requestAnimationFrame(tick);

  return {
    held: held,
    exit: function(done){ if (exitAt >= 0) return; onDone = done; exitAt = (performance.now() - t0) / 1000; },
    duration: EXIT,
    stop: stop
  };
}

window.Logo3D = { play: play };
})();
