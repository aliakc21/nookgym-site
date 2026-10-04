/* NookGym · yardımcı betik (çerez, analiz, dış istek yok).
   1) Açılış videosu: yalnız <html> .intro sınıfı taşıyorsa çalışır. Video şu an kapalı
      (index.html head notu); .intro eklenmediği için hiçbir şey indirilmez.
   2) Harita: "Haritayı açın"a basılana kadar Google'a hiç istek gitmez.
   3) Mobil/tablet menü: 62rem altında üst bilgideki menü düğmesi. */
(function () {
  'use strict';

  var kok = document.documentElement;

  /* ---------- 1) Açılış videosu ---------- */
  var video = document.querySelector('.isaret-video');

  if (video && kok.classList.contains('intro')) {
    var kapandi = false;
    var sayac;

    var vazgec = function () {
      if (kapandi) return;
      kapandi = true;
      clearTimeout(sayac);
      try { video.pause(); } catch (e) { /* yok say */ }
      kok.classList.remove('intro', 'oynuyor');
      while (video.firstChild) video.removeChild(video.firstChild);
      video.removeAttribute('src');
    };

    var bitir = function () {
      if (kapandi) return;
      kapandi = true;
      clearTimeout(sayac);
      kok.classList.remove('oynuyor');
      kok.classList.add('bitti');
    };

    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (t) {
      var kaynak = document.createElement('source');
      kaynak.src = video.getAttribute('data-' + t[0]);
      kaynak.type = t[1];
      video.appendChild(kaynak);
    });

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    video.addEventListener('playing', function () {
      if (kapandi) return;
      clearTimeout(sayac);
      kok.classList.add('oynuyor');
      try { sessionStorage.setItem('ng-acilis', '1'); } catch (e) { /* yok say */ }
    }, { once: true });
    video.addEventListener('ended', bitir);
    video.addEventListener('error', vazgec, true);

    /* Dokununca atla */
    var isaret = document.querySelector('.isaret');
    if (isaret) {
      isaret.addEventListener('click', function () {
        if (!kok.classList.contains('oynuyor')) return;
        try { video.pause(); } catch (e) { /* yok say */ }
        bitir();
      });
    }

    sayac = setTimeout(vazgec, 2500);
    video.preload = 'auto';
    video.load();
    var oynat = video.play();
    if (oynat && typeof oynat.catch === 'function') oynat.catch(vazgec);
  }

  /* ---------- 2) Tıklayınca yüklenen harita ---------- */
  var dugme = document.querySelector('[data-harita]');

  if (dugme) {
    dugme.hidden = false;
    dugme.addEventListener('click', function () {
      var yer = dugme.closest('.harita-yer');
      var cerceve = document.createElement('iframe');
      cerceve.src = dugme.getAttribute('data-harita');
      cerceve.title = 'NookGym konumu, Google Haritalar';
      /* width/height özniteliği verilmez: boyutu yer tutucuyla aynı CSS kuralı (aspect-ratio) belirler, sayfa zıplamaz. */
      cerceve.setAttribute('allowfullscreen', '');
      cerceve.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      yer.replaceWith(cerceve);
      cerceve.focus();
    });
  }

  /* ---------- 3) Mobil/tablet menü ---------- */
  var menuDugme = document.querySelector('.menu-dugme');
  var menu = document.getElementById('ust-nav');

  if (menuDugme && menu) {
    var menuKapat = function () {
      menuDugme.setAttribute('aria-expanded', 'false');
      menu.classList.remove('acik');
    };
    menuDugme.hidden = false;
    menuDugme.addEventListener('click', function () {
      var acilsin = menuDugme.getAttribute('aria-expanded') !== 'true';
      menuDugme.setAttribute('aria-expanded', acilsin ? 'true' : 'false');
      menu.classList.toggle('acik', acilsin);
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) menuKapat();
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !menuDugme.contains(e.target)) menuKapat();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('acik')) {
        menuKapat();
        menuDugme.focus();
      }
    });
  }
})();
