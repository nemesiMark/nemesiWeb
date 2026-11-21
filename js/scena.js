/* Scena 3D dell'apertura (Three.js r147, script classico: funziona anche aprendo il file dal disco).
   Le aste di NEMESI WEB sospese nel buio, con luce vermiglia e ambra, braci e foschia.
   setProgress(k): 0 = aste sparse, 1 = aste allineate esattamente sulla scritta HTML (stessi pixel). */
(function(){
  'use strict';

  function lin(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function inOut3(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2; }
  function inOutSine(t){ return .5 - .5*Math.cos(Math.PI*t); }   // accelera e frena dolce: velocità massima metà della cubica
  function inOut2(t){ return t < .5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2; }
  function rng(seed){ return function(){ seed = (seed*16807) % 2147483647; return (seed - 1)/2147483646; }; }

  function dotTexture(inner, outer){
    var c = document.createElement('canvas'); c.width = c.height = 64;
    var x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, inner); g.addColorStop(.35, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c); return t;
  }

  function create(canvas, getGeo, opts){
    opts = opts || {};
    var mobile = !!opts.mobile;
    var NIGHT = '#0E0C0B';
    var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:!mobile, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.35));
    renderer.setClearColor(lin(NIGHT), 1);

    var scene = new THREE.Scene();
    scene.background = lin(NIGHT);
    scene.fog = new THREE.FogExp2(lin(NIGHT), .00028);

    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), .04).texture;

    var FOV = 35;
    var camera = new THREE.PerspectiveCamera(FOV, 1, 10, 30000);

    // luci: chiave vermiglia di lato, controluce ambra, frontale che cresce verso la fine
    var ambient = new THREE.AmbientLight(lin('#3a2a22'), .25); scene.add(ambient);
    var key = new THREE.SpotLight(lin('#FF3B12'), 4.2, 0, .6, .9, 0);
    var rim = new THREE.PointLight(lin('#FFC08A'), 2.2, 0, 0);
    var front = new THREE.DirectionalLight(lin('#FFF1E2'), .1);
    var keyTarget = new THREE.Object3D();
    scene.add(key, keyTarget, rim, front); key.target = keyTarget;

    var DARK = lin('#2B231F'), LIGHT = lin('#E4DED3');
    var mat = new THREE.MeshPhysicalMaterial({ color:DARK.clone(), roughness:.26, metalness:.55,
      clearcoat:.9, clearcoatRoughness:.15, envMapIntensity:.18 });
    var beams = [], N = getGeo().A.length, R = rng(7);
    for (var i = 0; i < N; i++){
      var m = new THREE.Mesh(new THREE.BufferGeometry(), mat); scene.add(m);
      beams.push({ mesh:m, sx:R(), sy:R(), sz:R(), ex:(R()-.5)*Math.PI*2, ey:(R()-.5)*Math.PI*2, ez:(R()-.5)*Math.PI*2,
        spin:(R()-.5)*.5, bob:R()*Math.PI*2, delay:(i/(N-1))*.12 + R()*.04 });
    }

    // foschia: grandi macchie morbide che derivano lente
    var hazeTex = dotTexture('rgba(255,120,70,.55)', 'rgba(120,40,20,.18)');
    var hazes = [];
    for (var h = 0; h < (mobile ? 4 : 7); h++){
      var sm = new THREE.SpriteMaterial({ map:hazeTex, transparent:true, opacity:.07, depthWrite:false, blending:THREE.AdditiveBlending });
      var sp = new THREE.Sprite(sm); scene.add(sp);
      hazes.push({ s:sp, a:R()*Math.PI*2, r:R(), z:R(), size:.9 + R()*1.1 });
    }
    // un bagliore caldo dietro la scultura
    var core = new THREE.Sprite(new THREE.SpriteMaterial({ map:dotTexture('rgba(255,160,80,1)', 'rgba(255,60,20,.35)'),
      transparent:true, opacity:.2, depthWrite:false, blending:THREE.AdditiveBlending }));
    scene.add(core);

    // braci
    var EN = mobile ? 140 : 380;
    var epos = new Float32Array(EN*3), ecol = new Float32Array(EN*3), espd = new Float32Array(EN);
    var cA = lin('#FF4A1C'), cB = lin('#FFB347');
    for (var e = 0; e < EN; e++){
      var c = R() < .6 ? cA : cB; ecol[e*3] = c.r; ecol[e*3+1] = c.g; ecol[e*3+2] = c.b;
      epos[e*3] = R(); epos[e*3+1] = R(); epos[e*3+2] = R(); espd[e] = .25 + R()*.75;
    }
    var egeo = new THREE.BufferGeometry();
    var ebuf = new THREE.BufferAttribute(new Float32Array(EN*3), 3);
    egeo.setAttribute('position', ebuf);
    egeo.setAttribute('color', new THREE.BufferAttribute(ecol, 3));
    var emat = new THREE.PointsMaterial({ size:mobile ? 5 : 7, map:dotTexture('rgba(255,255,255,1)', 'rgba(255,255,255,.25)'),
      vertexColors:true, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.9 });
    var embers = new THREE.Points(egeo, emat); scene.add(embers);

    // post: bagliore sulle luci alte, poi correzione gamma
    var composer = new THREE.EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, { type:THREE.HalfFloatType }));
    composer.addPass(new THREE.RenderPass(scene, camera));
    var bloom = new THREE.UnrealBloomPass(new THREE.Vector2(256, 256), mobile ? .45 : .55, .5, .9);
    composer.addPass(bloom);
    composer.addPass(new THREE.ShaderPass(THREE.GammaCorrectionShader));

    var W = 1, H = 1, D = 1, k = 0, ks = 0, introV = 1, active = false, raf = 0, last = 0, clock = 0;
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    var qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), eul = new THREE.Euler();

    function resize(){
      W = canvas.clientWidth || window.innerWidth; H = canvas.clientHeight || window.innerHeight;
      renderer.setSize(W, H, false); composer.setSize(W, H);
      bloom.resolution.set(W/2, H/2);
      camera.aspect = W/H; D = (H/2)/Math.tan(FOV*Math.PI/360); camera.updateProjectionMatrix();
      key.position.set(-W*.7, H*.45, D*.55); keyTarget.position.set(0, 0, -H*.3);
      rim.position.set(W*.55, H*.35, -H*1.4);
      front.position.set(0, 0, 1);
      core.position.set(W*.08, H*.04, -H*1.5); core.scale.set(H*2.2, H*2.2, 1);
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

    // ks = progresso ammorbidito (insegue k con una costante di ~120 ms): niente scatti tra un passo di rotella e l'altro.
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
      // luce: drammatica all'inizio, piena e frontale alla fine
      // alla fine le luci si spengono e resta solo il colore carta (emissivo): combacia con le aste HTML
      var fade = Math.pow(1 - camK, 1.4), glow = Math.pow(camK, 2.2);
      front.intensity = .25*fade;
      key.intensity = 4.2*fade;
      rim.intensity = 2.2*fade;
      ambient.intensity = .25*fade;
      mat.emissive.copy(LIGHT).multiplyScalar(glow);
      mat.envMapIntensity = .18*fade;
      mat.color.copy(DARK).lerp(LIGHT, camK*camK*(1 - glow));
      mat.metalness = .55*fade; mat.roughness = .26 + .14*camK;
      scene.fog.density = .00028*(1 - .85*camK);
      core.material.opacity = .2*(1 - .8*camK);
      // foschia e braci
      for (var h = 0; h < hazes.length; h++){
        var z = hazes[h], ang = z.a + t*.03*(h%2 ? 1 : -1);
        z.s.position.set(Math.cos(ang)*W*.45*z.r, Math.sin(ang)*H*.3*z.r - H*.1, -H*.4 - z.z*H*1.4);
        z.s.scale.set(H*z.size, H*z.size, 1); z.s.material.opacity = .07*(1 - .85*camK);
      }
      var p = ebuf.array;
      for (var j = 0; j < EN; j++){
        var yy = (epos[j*3+1] + t*.018*espd[j]) % 1;
        p[j*3] = (epos[j*3] - .5)*W*1.7 + Math.sin(t*.4 + j)*14;
        p[j*3+1] = (yy - .5)*H*1.6;
        p[j*3+2] = -epos[j*3+2]*H*2.2 + H*.3;
      }
      ebuf.needsUpdate = true;
      emat.opacity = .9*(1 - .75*camK);
      composer.render();
    }

    function loop(now){
      raf = 0;
      var dt = last ? Math.min(.05, (now - last)/1000) : 0; last = now;
      clock += dt;
      mx += (tmx - mx)*.05; my += (tmy - my)*.05;
      ks += (k - ks)*(1 - Math.exp(-dt/.12)); if (Math.abs(k - ks) < 1e-4) ks = k;
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
