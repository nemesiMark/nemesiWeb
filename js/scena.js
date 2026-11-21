/* Scena 3D dell'apertura (Three.js r147, script classico: funziona anche aprendo il file dal disco).
   Le aste di NEMESI WEB in grafite, sospese su un fondo carta chiaro, con una luce arancio di taglio.
   setProgress(k): 0 = aste sparse, 1 = aste allineate esattamente sulla scritta HTML (stessi pixel). */
(function(){
  'use strict';

  function lin(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function inOut3(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }
  function inOutSine(t){ return .5 - .5*Math.cos(Math.PI*t); }   // accelera e frena dolce: velocità massima metà della cubica
  function inOut2(t){ return t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }
  function rng(seed){ return function(){ seed = (seed*16807) % 2147483647; return (seed - 1)/2147483646; }; }

  function create(canvas, getGeo, opts){
    opts = opts || {};
    var mobile = !!opts.mobile;
    var PAPER = '#E4E4E8';
    // definizione piena: bordi smussati (antialias) anche sul telefono e risoluzione fino a 2× sugli schermi Retina
    var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;   // conversione dei colori fatta dal renderer: niente passaggio intermedio sgranato
    renderer.setClearColor(new THREE.Color(PAPER), 1);   // il colore di sfondo va al canvas così com'è (non passa dalla conversione sRGB)

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(PAPER);
    scene.fog = new THREE.FogExp2(lin(PAPER), .00022);   // le aste lontane sbiadiscono nella carta

    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture;

    var FOV = 35;
    var camera = new THREE.PerspectiveCamera(FOV, 1, 10, 30000);

    // luci da studio chiaro: ambiente pieno, frontale morbida, una chiave arancio di taglio, controluce bianco
    var AMB = .85, KEY = 1.4, RIM = 1.0, FRONT = .85;
    var ambient = new THREE.AmbientLight(lin('#FFFFFF'), AMB); scene.add(ambient);
    var key = new THREE.SpotLight(lin('#F07A1A'), KEY, 0, .6, .9, 0);
    var rim = new THREE.PointLight(lin('#FFFFFF'), RIM, 0, 0);
    var front = new THREE.DirectionalLight(lin('#FFFFFF'), FRONT);
    var keyTarget = new THREE.Object3D();
    scene.add(key, keyTarget, rim, front); key.target = keyTarget;

    // grafite satinata; alla fine solo il colore inchiostro (emissivo), identico alle aste HTML
    var DARK = lin('#232428'), INK = lin('#141518');
    var mat = new THREE.MeshPhysicalMaterial({ color:DARK.clone(), roughness:.42, metalness:.25,
      clearcoat:.5, clearcoatRoughness:.3, envMapIntensity:.6 });
    var beams = [], N = getGeo().A.length, R = rng(7);
    for (var i = 0; i < N; i++){
      var m = new THREE.Mesh(new THREE.BufferGeometry(), mat); scene.add(m);
      beams.push({ mesh:m, sx:R(), sy:R(), sz:R(), ex:(R()-.5)*Math.PI*2, ey:(R()-.5)*Math.PI*2, ez:(R()-.5)*Math.PI*2,
        spin:(R()-.5)*.5, bob:R()*Math.PI*2, delay:(i/(N-1))*.12 + R()*.04 });
    }

    // niente post-produzione: si disegna direttamente sul canvas, così l'antialias del renderer resta attivo

    var W = 1, H = 1, D = 1, k = 0, ks = 0, introV = 1, active = false, raf = 0, last = 0, clock = 0;
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    var qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), eul = new THREE.Euler();

    function resize(){
      W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W/H; D = (H/2)/Math.tan(FOV*Math.PI/360); camera.updateProjectionMatrix();
      key.position.set(-W*.7, H*.45, D*.55); keyTarget.position.set(0, 0, -H*.3);
      rim.position.set(W*.55, H*.35, -H*1.4);
      front.position.set(0, 0, 1);
      // aste con gli spigoli arrotondati, alla misura vera (in pixel)
      for (var i = 0; i < N; i++){
        var f = finalPose(i), old = beams[i].mesh.geometry;
        beams[i].mesh.geometry = new THREE.RoundedBoxGeometry(f.len, f.th, f.depth, 3, f.th*.14);
        old.dispose();
      }
      draw();
    }

    function finalPose(i){
      var a = getGeo().A[i];
      var depth = a.sy*100*1.15;
      return { x:a.x - W/2, y:H/2 - a.y, z:-depth/2, rz:-a.r*Math.PI/180, len:a.sx*100, th:a.sy*100, depth:depth };
    }

    // ks = progresso ammorbidito (insegue k con una costante di ~400 ms): niente scatti tra un passo di rotella e l'altro.
    // Le aste arrivano entro k = .82 e la ripresa entro .9: al passaggio alle aste HTML (k ≥ .94) è tutto fermo.
    function draw(){
      var t = clock, k = ks;
      var camK = inOutSine(clamp((k - .04)/.86, 0, 1));
      // aste: dallo sparso alla scritta, ognuna con il suo ritardo
      for (var i = 0; i < N; i++){
        var b = beams[i], f = finalPose(i);
        var e = inOutSine(clamp((k - b.delay)/.66, 0, 1)), free = 1 - e;
        var sx = (b.sx - .5)*W*1.15, sy = (b.sy - .5)*H*1.05 + Math.sin(t*.6 + b.bob)*22*free, sz = -H*.25 - b.sz*H*1.6;
        b.mesh.position.set(sx + (f.x - sx)*e, sy + (f.y - sy)*e, sz + (f.z - sz)*e);
        eul.set(b.ex + t*b.spin*free, b.ey + t*b.spin*.7*free, b.ez); qA.setFromEuler(eul);
        eul.set(0, 0, f.rz); qB.setFromEuler(eul);
        b.mesh.quaternion.copy(qA).slerp(qB, e);
      }
      // camera: di tre quarti e vicina → frontale, alla distanza in cui un pixel è un pixel
      var yaw = (.62 + mx*.08)*(1 - camK), pitch = (.16 + my*.05)*(1 - camK);
      var rad = (D*.6 + (D - D*.6)*camK) * (1 + .35*(1 - introV)*(1 - camK));
      var tz = -H*.45*(1 - camK);
      camera.position.set(Math.sin(yaw)*Math.cos(pitch)*rad, Math.sin(pitch)*rad, tz + Math.cos(yaw)*Math.cos(pitch)*rad);
      camera.lookAt(0, 0, tz);
      // luce: di taglio all'inizio; alla fine le luci si spengono e resta solo il colore inchiostro (emissivo),
      // che combacia con le aste HTML
      var fade = Math.pow(1 - camK, 1.4), glow = Math.pow(camK, 2.2);
      front.intensity = FRONT*fade;
      key.intensity = KEY*fade;
      rim.intensity = RIM*fade;
      ambient.intensity = AMB*fade;
      mat.emissive.copy(INK).multiplyScalar(glow);
      mat.envMapIntensity = .6*fade;
      mat.color.copy(DARK).lerp(INK, camK*camK).multiplyScalar(1 - glow);
      mat.metalness = .25*fade; mat.roughness = .42 + .1*camK;
      scene.fog.density = .00022*(1 - camK);
      renderer.render(scene, camera);
    }

    function loop(now){
      raf = 0;
      var dt = last ? Math.min(.05, (now - last)/1000) : 0; last = now;
      clock += dt;
      mx += (tmx - mx)*.05; my += (tmy - my)*.05;
      ks += (k - ks)*(1 - Math.exp(-dt/.4)); if (Math.abs(k - ks) < 1e-4) ks = k;
      draw();
      if (active) raf = requestAnimationFrame(loop);
    }

    if (!mobile) window.addEventListener('pointermove', function(ev){
      tmx = (ev.clientX/window.innerWidth - .5)*2; tmy = (ev.clientY/window.innerHeight - .5)*2;
    }, { passive:true });

    resize();
    return {
      resize:resize,
      setProgress:function(v){ k = clamp(v, 0, 1); if (!active){ ks = k; draw(); } },
      setIntro:function(v){ introV = v; if (!active) draw(); },
      setActive:function(on){
        if (on === active) return; active = on;
        if (!on){ ks = k; draw(); }   // fermandosi si allinea esattamente
        if (on && !raf){ last = 0; raf = requestAnimationFrame(loop); }
      },
      render:draw,
      state:function(){ return { k:k, ks:ks, active:active, intro:introV }; }
    };
  }

  window.NemesiScene = { create:create };
})();
