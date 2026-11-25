/* Apertura — il video del logo (video/apertura.mp4, con lo schermo in verticale apertura-m.mp4, 1080×1920) a tutto schermo su nero.
   Il video finisce sul verde del sito (#CDFD67, dentro la striscia luminosa del logo): alla fine il verde si stringe
   in una linea luminosa orizzontale che si spegne («taglio di luce») e sotto c'è già la pagina.
   Uso: var L = Apertura.play(contenitore); L.first (il nero è sullo schermo), L.held (manca ANTICIPO alla fine, il video è finito o non è partito),
   L.exit(fatto) toglie il video e poi si chiude da solo, L.duration (durata dell'uscita, s), L.stop().
   Il <video> viene creato presto nell'<head> (window.__videoApertura) per scaricarlo subito; se manca lo crea qui. */
(function(){
'use strict';
var ATTESA = 3.0;      // se il video non parte entro questi secondi si va avanti senza
var FUORI = .45;       // dissolvenza del video se chi guarda salta prima della fine (s)
var TAGLIO = .8;       // taglio di luce alla fine del video (s)
var ANTICIPO = .5;     // l'uscita (e la caduta delle aste, dietro il video) parte quando mancano questi secondi alla fine: il video è già tutto verde

function play(box){
  if (!box) return null;
  var video = window.__videoApertura || null;
  if (!video){
    video = document.createElement('video');
    video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.preload = 'auto';
    video.src = innerWidth < innerHeight ? 'video/apertura-m.mp4?v=4' : 'video/apertura.mp4?v=4';
  }
  video.className = 'pre-video';
  video.setAttribute('aria-hidden', 'true');
  box.insertBefore(video, box.firstChild);
  box.style.background = '#000';

  var resFirst, resHeld, first = new Promise(function(r){ resFirst = r; }), held = new Promise(function(r){ resHeld = r; });
  var gotHeld = false, failed = false, avviato = false, dead = false, uscita = false;
  function hold(){ if (!gotHeld){ gotHeld = true; resHeld(); } }
  function fail(){ if (failed || avviato) return; failed = true; try { video.pause(); } catch (e){} video.style.visibility = 'hidden'; hold(); }
  requestAnimationFrame(function(){ resFirst(); });

  var tAttesa = setTimeout(function(){ if (!avviato) fail(); }, ATTESA * 1000);
  function parti(){
    if (dead || failed) return;
    var p; try { p = video.play(); } catch (e){ fail(); return; }
    if (p && p.catch) p.catch(function(){ fail(); });
  }
  video.addEventListener('playing', function(){ avviato = true; clearTimeout(tAttesa); });
  video.addEventListener('ended', hold);
  video.addEventListener('timeupdate', function(){ if (video.duration && video.currentTime >= video.duration - ANTICIPO) hold(); });
  video.addEventListener('error', fail);
  if (video.readyState >= 2) parti(); else video.addEventListener('canplay', parti, { once: true });

  function stop(){
    if (dead) return; dead = true;
    clearTimeout(tAttesa);
    try { video.pause(); } catch (e){}
    video.style.visibility = 'hidden'; box.style.background = 'transparent';
    video.removeAttribute('src'); try { video.load(); } catch (e){}
  }

  return {
    first: first, held: held, duration: TAGLIO, stop: stop,
    exit: function(fatto){
      if (uscita || dead) return; uscita = true;
      clearTimeout(tAttesa);
      /* sotto il video c'è subito la pagina (grigia come la fine del video); se il video non è partito sfuma il nero */
      if (failed || !avviato){
        box.style.transition = 'opacity ' + (FUORI * 1.6) + 's ease'; box.style.opacity = '0';
        setTimeout(function(){ stop(); box.style.opacity = ''; box.style.transition = ''; if (fatto) fatto(); }, FUORI * 1600 + 30);
        return;
      }
      /* vicino alla fine il video è tutto verde: al suo posto un velo dello stesso verde si stringe in una linea luminosa
         orizzontale, che si accorcia verso il centro e si spegne; intanto dietro le aste cominciano a cadere.
         Se chi guarda salta prima, il video sfuma subito. */
      function taglio(){
        var v = document.createElement('div');
        v.style.cssText = 'position:absolute;left:50%;top:50%;width:100%;height:100%;transform:translate(-50%,-50%);background:#CDFD67;will-change:height,width';
        box.appendChild(v);
        try { video.pause(); } catch (e){}
        video.style.visibility = 'hidden'; box.style.background = 'transparent';
        var fine = function(){ v.remove(); stop(); if (fatto) fatto(); };
        if (!v.animate){ fine(); return; }
        var a = v.animate([
          { height: '100%', width: '100%', opacity: 1, background: '#CDFD67', boxShadow: '0 0 0 0 rgba(205,253,103,0), 0 0 0 0 rgba(205,253,103,0)', easing: 'cubic-bezier(.75,0,.85,.3)' },
          { height: '2px', width: '100%', opacity: 1, background: '#F1FFD2', boxShadow: '0 0 14px 3px rgba(205,253,103,.95), 0 0 70px 14px rgba(205,253,103,.45)', offset: .58, easing: 'cubic-bezier(.55,0,.8,.2)' },
          { height: '1px', width: '0%', opacity: 0, background: '#F1FFD2', boxShadow: '0 0 6px 1px rgba(205,253,103,0), 0 0 24px 4px rgba(205,253,103,0)' }
        ], { duration: TAGLIO * 1000, fill: 'forwards' });
        a.onfinish = fine;
      }
      function via(dur, ferma){
        box.style.background = 'transparent'; video.style.transition = 'opacity ' + dur + 's ease'; video.style.opacity = '0';
        if (ferma){ try { video.pause(); } catch (e){} }
        setTimeout(function(){ stop(); if (fatto) fatto(); }, dur * 1000 + 30);
      }
      var resto = video.duration ? video.duration - video.currentTime : 0;
      if (video.ended || resto <= ANTICIPO + .3) taglio();
      else via(FUORI, true);
    }
  };
}

window.Apertura = { play: play };
})();
