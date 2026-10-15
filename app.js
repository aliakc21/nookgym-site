/* NookGym · yardımcı betik (çerez, analiz, dış istek yok).
   1) Açılış videosu: yalnız <html> .intro sınıfı taşıyorsa çalışır. Video şu an kapalı
      (index.html head notu); .intro eklenmediği için hiçbir şey indirilmez.
   2) Harita: "Haritayı açın"a basılana kadar Google'a hiç istek gitmez.
   3) Mobil/tablet menü: 62rem altında üst bilgideki menü düğmesi.
   4) Kampanya: bitiş anı (İstanbul saati, data-bitis) geçtiyse teklif gizlenir, "Kampanya sona erdi" görünür;
      ilk ekran kartının kenar ışığı fare/odak gelince bir tur döner (yalnız sınıf; CSP uyumlu);
      Instagram videosu yalnız "Videoyu izleyin"e basılınca yüklenir (önce Instagram'a hiç istek gitmez, ses çalmaz). */
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

  /* ---------- 4) Kampanya ---------- */
  var kampanya = document.getElementById('kampanya');

  if (kampanya && kampanya.hasAttribute('data-bitis')) {
    var bitis = Date.parse(kampanya.getAttribute('data-bitis'));
    if (!isNaN(bitis) && Date.now() >= bitis) {
      Array.prototype.forEach.call(document.querySelectorAll('[data-kampanya-aktif]'), function (el) {
        el.hidden = true;
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-kampanya-bitti]'), function (el) {
        el.hidden = false;
      });
      var bittiBaslik = document.getElementById('kampanya-bitti-baslik');
      if (bittiBaslik) {
        bittiBaslik.id = 'kampanya-baslik';
        var eskiBaslik = kampanya.querySelector('.kampanya-teklif h2');
        if (eskiBaslik) eskiBaslik.removeAttribute('id');
      }
    }
  }

  /* İlk ekran kartının kenar ışığı (styles.css "Işıklı tabela"): açılış turu bitince "dur"; fare ya da
     klavye odağı gelince "tur" ile bir tur daha. Tur her zaman sonuna kadar döner (fare erken çıksa da
     ışık sıçramaz); bitince "tur" kalkar. Hareket azaltma açıkken animasyon yok, bu sınıflar iş görmez. */
  var kart = document.querySelector('.kampanya-kart');

  if (kart) {
    var turla = function () {
      if (kart.classList.contains('dur') && !kart.classList.contains('tur')) kart.classList.add('tur');
    };
    kart.addEventListener('animationend', function (e) {
      if (e.target !== kart || e.animationName !== 'kampanya-isik') return;
      if (kart.classList.contains('tur')) kart.classList.remove('tur');
      else kart.classList.add('dur');
    });
    kart.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') turla(); });
    kart.addEventListener('focusin', turla);
  }

  var oynatDugme = document.querySelector('[data-instagram]');

  if (oynatDugme) {
    oynatDugme.hidden = false;
    oynatDugme.addEventListener('click', function () {
      var yer = oynatDugme.closest('.video-yer');
      var cerceve = document.createElement('iframe');
      cerceve.src = oynatDugme.getAttribute('data-instagram');
      cerceve.title = 'Kampanya videosu, Instagram';
      cerceve.className = 'video-cerceve';
      cerceve.setAttribute('allowfullscreen', '');
      cerceve.setAttribute('loading', 'eager');
      cerceve.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      yer.replaceWith(cerceve);
      cerceve.focus();
    });
  }
})();
