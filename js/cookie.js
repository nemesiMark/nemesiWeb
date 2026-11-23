/* Barra dei cookie (dalla 3.30): compare finché non si sceglie; la scelta vale anche per la mappa dello studio.
   Stessa chiave di js/mappa.js (nemesi_cookie_v1). Nella pagina senza mappa (portfolio.html) definisce lei window.nemesiCookie. */
(function(){
  var CHIAVE = 'nemesi_cookie_v1', d = document, html = d.documentElement;
  function salva(v){ try{ localStorage.setItem(CHIAVE, JSON.stringify({maps:v})) }catch(e){} }
  var C = window.nemesiCookie || (window.nemesiCookie = {
    get:function(){ try{ return JSON.parse(localStorage.getItem(CHIAVE)||'null') }catch(e){ return null } },
    accept:function(){ salva(true) }
  });
  if (!C.reject) C.reject = function(){ salva(false) };
  if (window.self !== window.top) return;           // anteprima dell'area riservata: niente barra
  if (C.get()) return;                              // scelta già fatta

  var st = d.createElement('style');
  st.textContent =
    '.cookie{position:fixed;left:16px;right:16px;bottom:16px;z-index:70;max-width:560px;margin:0 auto;display:flex;align-items:center;gap:16px;flex-wrap:wrap;'+
    'padding:16px 18px;background:rgba(23,23,28,.94);color:#EDEDEF;border:1px solid rgba(205,253,103,.35);border-radius:14px;'+
    'box-shadow:0 12px 40px rgba(0,0,0,.45);font:400 14px/1.45 var(--sans,system-ui,sans-serif);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);'+
    'opacity:0;transform:translateY(12px);transition:opacity .4s ease,transform .4s ease}'+
    '.cookie.su{opacity:1;transform:none}'+
    '.cookie p{margin:0;flex:1 1 260px}'+
    '.cookie .cb{display:flex;gap:10px;margin-left:auto}'+
    '.cookie button{font:500 13px/1 var(--mono,ui-monospace,monospace);letter-spacing:.02em;padding:11px 16px;border-radius:999px;cursor:pointer;border:1px solid rgba(205,253,103,.5);background:transparent;color:#EDEDEF}'+
    '.cookie button.si{background:#CDFD67;border-color:#CDFD67;color:#17171C}'+
    '.cookie button:hover{border-color:#CDFD67}'+
    '.cookie button:focus-visible{outline:2px solid #CDFD67;outline-offset:2px}'+
    '.avvio .cookie{display:none}'+
    '@media (prefers-reduced-motion:reduce){.cookie{transition:none}}';
  d.head.appendChild(st);

  var b = d.createElement('div');
  b.className = 'cookie';
  b.setAttribute('role', 'dialog');
  b.setAttribute('aria-label', 'Cookie');
  b.innerHTML = '<p>Usiamo solo i cookie della mappa dello studio, con le foto satellitari di Esri. Si caricano se accetti.</p>'+
    '<div class="cb"><button type="button" class="no">Rifiuta</button><button type="button" class="si">Accetta</button></div>';

  function chiudi(){ b.classList.remove('su'); setTimeout(function(){ if (b.parentNode) b.parentNode.removeChild(b) }, 450) }
  b.querySelector('.si').addEventListener('click', function(){ chiudi(); C.accept() });
  b.querySelector('.no').addEventListener('click', function(){ chiudi(); C.reject() });

  // se si accetta dal riquadro «Mostra la mappa», la barra se ne va
  var acc = C.accept;
  C.accept = function(){ chiudi(); return acc.apply(this, arguments) };

  function mostra(){ d.body.appendChild(b); requestAnimationFrame(function(){ requestAnimationFrame(function(){ b.classList.add('su') }) }) }
  function quando(){
    if (!html.classList.contains('avvio')) return setTimeout(mostra, 600);
    var mo = new MutationObserver(function(){ if (!html.classList.contains('avvio')){ mo.disconnect(); setTimeout(mostra, 600) } });
    mo.observe(html, {attributes:true, attributeFilter:['class']});
  }
  if (d.body) quando(); else d.addEventListener('DOMContentLoaded', quando);
})();
