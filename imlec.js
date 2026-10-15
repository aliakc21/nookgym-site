/* NookGym · halter imleci ve magnezyum (tebeşir) tozu. Bütün sayfalarda ortak (_parca/bas.html).
   Bilerek ES5 yazıldı: eski tarayıcılar ve akıllı TV'ler de ayrıştırabilsin.
   - Yalnız fareli masaüstünde çalışır (hover: hover ve pointer: fine). Dokunmatikte, TV'de, hareket
     azaltma, yüksek kontrast (forced-colors ya da prefers-contrast: more) ya da veri tasarrufu açıkken
     hiçbir şey yapmaz, sistem imlecine dokunmaz. Sayfa açıkken bu ayarlardan biri açılırsa imleç kapanır.
   - İçerik Güvenlik Politikası (style-src 'self'): CSS'in tamamı styles.css'te ("Halter imleci" bölümü).
     Bu dosya <style>/<link> ya da style="" eklemez; yalnız el.style.transform gibi CSSOM atamaları
     ve classList kullanır.
   - Tıklama noktası halterin üst ucundaki açık amber nokta. Halter hep sağ alta yatık durur; bağlantı ve
     düğmelerde gövde aşağıya dikleşmez, biraz daha yatar (alttaki öğenin üstüne sarkmasın).
   - Hızlı gezdirince tebeşir tozu savrulur; yavaş gezinmede toz çıkmaz, okuma bozulmaz.
   - Bağlantı ve düğmelerde plakalar ve uç parlar, halter hafifçe büyür. Tıklayınca ezilip yaylanır,
     tebeşir patlar, yerde halka açılır. Ses yok.
   - Yazı alanlarında, metin seçerken ve iframe'lerin (Instagram, harita) üstünde sistem imleci görünür. */
(function () {
  'use strict';
  if (window.ngImlec) return;
  window.ngImlec = true;

  var ua = navigator.userAgent;
  var tv = /(smart-tv|smarttv|smart tv|tizen|web0s|webos|hbbtv|netcast|nettv|viera|bravia|aquosbrowser|googletv|android ?tv|crkey|roku|philipstv|vidaa|hisense|mitv)/i.test(ua) || /\bAFT[A-Z0-9]/.test(ua);
  if (/[?&]tv=1(&|$)/.test(location.search)) tv = true;
  if (/[?&]tv=0(&|$)/.test(location.search)) tv = false;
  if (tv || !window.matchMedia || !window.PointerEvent || !window.requestAnimationFrame) return;

  var mqInce = window.matchMedia('(hover: hover) and (pointer: fine)');
  var mqAz = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqZit = window.matchMedia('(forced-colors: active)');
  var mqKontrast = window.matchMedia('(prefers-contrast: more)');
  var uygunDegil = function () { return !mqInce.matches || mqAz.matches || mqZit.matches || mqKontrast.matches; };
  if (uygunDegil()) return;
  var baglanti = navigator.connection;
  if (baglanti && baglanti.saveData) return;

  var basla = function () {
    var kok = document.documentElement;

    var tuval = document.createElement('canvas');
    tuval.className = 'imlec-toz';
    tuval.setAttribute('aria-hidden', 'true');
    var ctx = tuval.getContext && tuval.getContext('2d');
    if (!ctx) return;

    // Dikey halter, görünür boyu 46 px. Tıklama noktası üst uçtaki açık amber nokta (14, 0) → kutuda (8 px, 0).
    // Uç sivri kovan, alt uç küt: halter tek yönü gösterir. Plakalarda koyu kontur: amber düğmelerin
    // (.btn-ana) üstünde de seçilsin.
    var halter = document.createElement('div');
    halter.className = 'imlec';
    halter.setAttribute('aria-hidden', 'true');
    halter.innerHTML =
      '<svg viewBox="0 0 28 80" width="16" height="46" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="imlec-g-celik" x1="0" x2="1"><stop offset="0" stop-color="#5A564F"/><stop offset=".45" stop-color="#F2EEE6"/><stop offset="1" stop-color="#5E5A52"/></linearGradient>' +
      '<linearGradient id="imlec-g-plaka" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F4DEB2"/><stop offset=".35" stop-color="#CA9F6C"/><stop offset="1" stop-color="#8B6843"/></linearGradient></defs>' +
      '<circle class="imlec-hale" cx="14" cy="0" r="7.5" fill="#CA9F6C"/>' +
      '<g stroke="#0D0C0A" stroke-width="1.4" stroke-linejoin="round">' +
      '<path d="M14 0L17.2 11.5H10.8Z" fill="url(#imlec-g-celik)"/>' +
      '<rect x="8.5" y="11" width="11" height="3.2" rx="1" fill="#8B6843"/>' +
      '<rect x="1" y="14.2" width="26" height="7.4" rx="2" fill="url(#imlec-g-plaka)"/>' +
      '<rect x="4" y="21.6" width="20" height="4.6" rx="1.4" fill="url(#imlec-g-plaka)"/>' +
      '<rect x="12.3" y="26.2" width="3.4" height="27.6" fill="url(#imlec-g-celik)"/>' +
      '<rect x="4" y="53.8" width="20" height="4.6" rx="1.4" fill="url(#imlec-g-plaka)"/>' +
      '<rect x="1" y="58.4" width="26" height="7.4" rx="2" fill="url(#imlec-g-plaka)"/>' +
      '<rect x="8.5" y="65.8" width="11" height="3.2" rx="1" fill="#8B6843"/>' +
      '<rect x="11.6" y="69" width="4.8" height="9" rx="2" fill="url(#imlec-g-celik)"/></g>' +
      '<path d="M12.3 32h3.4M12.3 35.5h3.4M12.3 39h3.4M12.3 41h3.4M12.3 44.5h3.4M12.3 48h3.4" stroke="rgba(13,12,10,.4)" stroke-width=".8"/>' +
      '<g class="imlec-parlama" fill="#FFF5DC"><rect x="2.6" y="15.3" width="22.8" height="2" rx="1"/><rect x="2.6" y="59.5" width="22.8" height="2" rx="1"/></g>' +
      '<circle class="imlec-uc" cx="14" cy="0" r="3.6" fill="#FFF5DC" stroke="#0D0C0A" stroke-width="1.4"/></svg>';

    document.body.appendChild(tuval);
    document.body.appendChild(halter);

    var W = 0, H = 0;
    var sigdir = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      tuval.width = Math.round(W * dpr);
      tuval.height = Math.round(H * dpr);
      tuval.style.width = W + 'px';
      tuval.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sigdir();

    // magnezyum: beyaz/kirli beyaz tebeşir, ara sıra amber kırıntı
    var TOZ = ['#FFFFFF', '#F7F4EE', '#EDE8DF', '#E2DCD0', '#D6CFC1'];
    var KIRINTI = ['#F4DEB2', '#CA9F6C'];
    var MAX = 320;
    var parts = [];
    var pt = {
      x: -300, y: -300, lx: -300, ly: -300,
      egim: -32, olcek: 1, ov: 0, ezik: 0, ev: 0,
      goruldu: false, gorunur: false, basili: false,
      kaldir: false, metin: false, cerceve: false, secim: false
    };
    var sinif = { kaldir: false, metin: false, cerceve: false, secim: false };
    var raf = 0;
    var boyandi = false;
    var kapali = false;

    // tebeşir bulutu: kenarı yumuşak hazır doku (her karede degrade kurmamak için bir kez çizilir)
    var bulutDoku = document.createElement('canvas');
    bulutDoku.width = bulutDoku.height = 64;
    var bctx = bulutDoku.getContext('2d');
    var bg = bctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    bg.addColorStop(0, 'rgba(237,232,223,1)');
    bg.addColorStop(0.45, 'rgba(237,232,223,0.5)');
    bg.addColorStop(1, 'rgba(237,232,223,0)');
    bctx.fillStyle = bg;
    bctx.fillRect(0, 0, 64, 64);

    var sec = function (dizi) { return dizi[(Math.random() * dizi.length) | 0]; };
    var sinirla = function (v, a) { return v < -a ? -a : v > a ? a : v; };

    // (dx, dy): tozun savrulacağı ana yön; guc: hız çarpanı
    var tane = function (x, y, dx, dy, guc) {
      if (parts.length >= MAX) return;
      var a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.9;
      var hiz = (0.5 + Math.random() * 2.2) * guc;
      var amber = Math.random() < 0.08;
      var omur = 36 + Math.random() * 44;
      parts.push({
        t: amber ? 2 : 0,
        x: x + (Math.random() - 0.5) * 3,
        y: y + (Math.random() - 0.5) * 3,
        vx: Math.cos(a) * hiz,
        vy: Math.sin(a) * hiz - Math.random() * 0.8,
        r: 0.5 + Math.random(),
        c: amber ? sec(KIRINTI) : sec(TOZ),
        o: omur, m: omur
      });
    };
    var bulut = function (x, y) {
      if (parts.length >= MAX) return;
      var omur = 44 + Math.random() * 30;
      parts.push({ t: 3, x: x, y: y, vx: (Math.random() - 0.5) * 0.6, vy: -0.15 - Math.random() * 0.35, r: 5 + Math.random() * 5, c: '#EDE8DF', o: omur, m: omur });
    };
    // tıklamada "yere vurma" halkası: yassı elips, 4 px'ten 26 px'e açılır
    var halka = function (x, y) {
      if (parts.length >= MAX) return;
      parts.push({ t: 4, x: x, y: y, vx: 0, vy: 0, r: 4, c: '', o: 26, m: 26 });
    };

    var tick = function () {
      raf = 0;
      if (kapali) return;
      var dx = pt.x - pt.lx;
      var dy = pt.y - pt.ly;
      var d = Math.sqrt(dx * dx + dy * dy);
      var i, n, p, k, t, rr;
      var cizilir = pt.gorunur && !pt.metin && !pt.cerceve && !pt.secim;

      if (cizilir) {
        // yalnız hızlı harekette toz: hareket yönünün tersine ve biraz yukarı savrulur
        if (d > 6) {
          n = Math.min(10, (d - 6) * 0.22);
          n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
          for (i = 0; i < n; i += 1) {
            t = Math.random();
            tane(pt.lx + dx * t, pt.ly + dy * t, -dx / d, -dy / d - 0.5, 0.8 + Math.min(d, 60) / 50);
          }
          if (d > 18 && Math.random() < 0.3) bulut(pt.x, pt.y);
        }
        if (pt.basili) {
          for (i = 0; i < 2; i += 1) tane(pt.x, pt.y, (Math.random() - 0.5) * 1.4, -1, 1.1);
        }
      }
      pt.lx = pt.x;
      pt.ly = pt.y;

      if (parts.length || boyandi) ctx.clearRect(0, 0, W, H);
      boyandi = parts.length > 0;
      for (i = parts.length - 1; i >= 0; i -= 1) {
        p = parts[i];
        p.o -= 1;
        if (p.o <= 0 || p.y > H + 20) {
          // sıra önemsiz: sondakini buraya taşı (o zaten bu karede işlendi)
          parts[i] = parts[parts.length - 1];
          parts.pop();
          continue;
        }
        k = p.o / p.m;
        if (p.t === 4) {
          rr = p.r + (1 - k) * 22;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.scale(1, 0.32);
          ctx.beginPath();
          ctx.arc(0, 0, rr, 0, Math.PI * 2);
          ctx.restore();
          ctx.globalAlpha = k * 0.35;
          ctx.strokeStyle = '#F4DEB2';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          continue;
        }
        p.vx *= 0.94;
        p.vy = p.vy * 0.94 + (p.t === 3 ? -0.004 : 0.035);
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.c;
        if (p.t === 3) {
          rr = p.r * (1 + (1 - k) * 2.2) * 1.6;
          ctx.globalAlpha = k * 0.22;
          ctx.drawImage(bulutDoku, p.x - rr, p.y - rr, rr * 2, rr * 2);
        } else {
          ctx.globalAlpha = Math.min(1, k * 1.3) * 0.9;
          if (p.r < 1.1) ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
          else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
        }
      }
      ctx.globalAlpha = 1;

      // halter hareket yönüne hafifçe yatar. Bağlantı/düğme üstünde dikleşmez, biraz daha yatar (-38°):
      // gövde alttaki öğenin üstüne sarkmasın, tıklama noktası (uç) hep en üstte kalsın. Hafif büyür (yaylı),
      // basılıyken ezilir.
      var hedefEgim = (pt.kaldir ? -38 : -32) + sinirla(dx * 0.35, 9);
      pt.egim += (hedefEgim - pt.egim) * 0.18;
      var hedefOlcek = pt.kaldir ? 1.06 : 1;
      pt.ov = (pt.ov + (hedefOlcek - pt.olcek) * 0.3) * 0.62;
      pt.olcek += pt.ov;
      var hedefEzik = pt.basili ? 0.1 : 0;
      pt.ev = (pt.ev + (hedefEzik - pt.ezik) * 0.3) * 0.62;
      pt.ezik += pt.ev;
      // ağır kaldırış titremesi: yalnız tuş basılıyken
      var j = pt.basili ? 0.8 : 0;
      halter.style.transform =
        'translate3d(' + (pt.x + (Math.random() - 0.5) * j).toFixed(2) + 'px,' + (pt.y + (Math.random() - 0.5) * j).toFixed(2) + 'px,0)' +
        ' rotate(' + pt.egim.toFixed(2) + 'deg)' +
        ' scale(' + (pt.olcek * (1 + pt.ezik * 0.6)).toFixed(3) + ',' + (pt.olcek * (1 - pt.ezik)).toFixed(3) + ')';

      if (parts.length || pt.basili || d > 0 ||
          Math.abs(hedefEgim - pt.egim) > 0.2 ||
          Math.abs(hedefOlcek - pt.olcek) > 0.002 || Math.abs(pt.ov) > 0.002 ||
          Math.abs(hedefEzik - pt.ezik) > 0.002 || Math.abs(pt.ev) > 0.002) {
        raf = window.requestAnimationFrame(tick);
      }
    };
    var uyandir = function () { if (!raf && !kapali) raf = window.requestAnimationFrame(tick); };

    // sınıfları yalnız değişince yaz (her karede classList'e dokunma)
    var sinifYaz = function () {
      var ad;
      for (ad in sinif) {
        if (sinif.hasOwnProperty(ad) && sinif[ad] !== pt[ad]) {
          sinif[ad] = pt[ad];
          if (pt[ad]) halter.classList.add(ad); else halter.classList.remove(ad);
        }
      }
      if (pt.secim) kok.classList.add('imlec-secim'); else kok.classList.remove('imlec-secim');
    };

    // Sistem imleci yalnız halter gerçekten çizilebildiğinde gizlenir.
    var goster = function () {
      if (!pt.goruldu || kapali) return;
      pt.gorunur = true;
      halter.classList.add('acik');
      kok.classList.add('imlec-acik');
    };
    var gizle = function () {
      if (kapali) return;
      pt.gorunur = false;
      pt.basili = false;
      pt.secim = false;
      halter.classList.remove('acik');
      kok.classList.remove('imlec-acik');
      sinifYaz();
      uyandir();
    };
    var birak = function () {
      if (kapali) return;
      pt.basili = false;
      if (pt.secim) { pt.secim = false; sinifYaz(); }
      uyandir();
    };

    var DUGME_INPUT = /^(button|submit|reset|checkbox|radio|range|color|file|image)$/i;
    var yaziAlani = function (el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.tagName === 'INPUT') return !DUGME_INPUT.test(el.type || '');
      return el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable === true;
    };
    var tutulur = function (el) {
      var ad;
      while (el && el.nodeType === 1) {
        if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return false;
        ad = el.tagName;
        if ((ad === 'A' && el.hasAttribute('href')) || ad === 'BUTTON' || ad === 'SUMMARY' || ad === 'LABEL' ||
            (ad === 'INPUT' && DUGME_INPUT.test(el.type || '')) || el.getAttribute('role') === 'button') return true;
        el = el.parentNode;
      }
      return false;
    };
    // imlecin altındaki öğeye göre durum: iframe (Instagram/harita) üstünde halter gizlenir,
    // iframe içinde zaten sistem imleci görünür; yazı alanında sistem metin imleci
    var durum = function (el, x, y) {
      var once = pt.cerceve || pt.metin;
      pt.cerceve = !!el && el.tagName === 'IFRAME';
      pt.metin = !pt.cerceve && yaziAlani(el);
      pt.kaldir = !pt.cerceve && !pt.metin && tutulur(el);
      // iframe'den ya da yazı alanından çıkınca eski konumdan yeniye toz çizgisi çekilmesin
      if (once && !pt.cerceve && !pt.metin && typeof x === 'number') { pt.x = pt.lx = x; pt.y = pt.ly = y; }
      sinifYaz();
      uyandir();
    };

    window.addEventListener('pointermove', function (e) {
      if (kapali) return;
      if (e.pointerType === 'touch') { if (pt.gorunur) gizle(); return; }
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (pt.basili && !(e.buttons & 1)) birak();
      if (!pt.goruldu || !pt.gorunur) { pt.lx = e.clientX; pt.ly = e.clientY; pt.goruldu = true; }
      pt.x = e.clientX;
      pt.y = e.clientY;
      if (!pt.gorunur) goster();
      uyandir();
    }, { passive: true });

    window.addEventListener('pointerdown', function (e) {
      if (kapali) return;
      if (e.pointerType === 'touch') { if (pt.gorunur) gizle(); return; }
      if ((e.pointerType !== 'mouse' && e.pointerType !== 'pen') || e.button !== 0 || e.ctrlKey) return;
      if (!pt.gorunur) { pt.lx = e.clientX; pt.ly = e.clientY; pt.goruldu = true; }
      pt.x = e.clientX;
      pt.y = e.clientY;
      if (!pt.gorunur) goster();
      pt.basili = true;
      // preventDefault yok: metin seçimi, bağlantılar ve düğmeler her zamanki gibi çalışır
      if (!pt.metin && !pt.cerceve) {
        for (var i = 0; i < 22; i += 1) {
          var a = Math.random() * Math.PI * 2;
          tane(pt.x, pt.y, Math.cos(a), Math.sin(a) - 0.4, 1.4);
        }
        bulut(pt.x, pt.y);
        bulut(pt.x, pt.y);
        bulut(pt.x, pt.y);
        halka(pt.x, pt.y);
      }
      uyandir();
    }, { passive: true });

    window.addEventListener('pointerup', birak);
    window.addEventListener('pointercancel', birak);
    window.addEventListener('contextmenu', birak);

    // Fareyle metin seçerken halter çekilir, sistem imleci (metin imleci) görünür.
    document.addEventListener('selectionchange', function () {
      if (kapali || !pt.basili || pt.secim) return;
      var s = window.getSelection && window.getSelection();
      if (s && !s.isCollapsed) { pt.secim = true; sinifYaz(); }
    });

    document.addEventListener('pointerover', function (e) {
      if (kapali || e.pointerType === 'touch') return;
      durum(e.target, e.clientX, e.clientY);
    }, { passive: true });

    window.addEventListener('blur', function () {
      if (kapali) return;
      // Odak bir iframe'e geçtiyse (app.js harita/Instagram'ı açınca odağı ona verir; ya da Tab ile)
      // fare yerinde kalmış olabilir: yalnız tuşu bırak, altındaki öğeye yeniden bak.
      var etkin = document.activeElement;
      if (etkin && etkin.tagName === 'IFRAME') {
        birak();
        if (pt.goruldu && document.elementFromPoint) durum(document.elementFromPoint(pt.x, pt.y));
        return;
      }
      gizle();
    });
    kok.addEventListener('mouseleave', gizle);
    // tarayıcı kendi sürükleme imlecini çizer, olay akışı kesilir: halter donup kalmasın
    window.addEventListener('dragstart', gizle);
    window.addEventListener('resize', function () { if (kapali) return; sigdir(); uyandir(); });

    // sekme gizliyken döngü tamamen durur, toz temizlenir
    document.addEventListener('visibilitychange', function () {
      if (kapali || !document.hidden) return;
      gizle();
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      parts.length = 0;
      ctx.clearRect(0, 0, W, H);
      boyandi = false;
    });

    // Sayfa açıkken ayar değişirse (hareket azaltma, yüksek kontrast, dokunmatik kip) imleç kapanır.
    // Dinleyiciler yerinde kalır ama hepsi "kapali" iken hemen döner: parts dizisi bir daha dolmaz.
    var kapat = function () {
      if (kapali) return;
      kapali = true;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      parts.length = 0;
      kok.classList.remove('imlec-acik');
      kok.classList.remove('imlec-secim');
      if (tuval.parentNode) tuval.parentNode.removeChild(tuval);
      if (halter.parentNode) halter.parentNode.removeChild(halter);
    };
    var degisti = function () { if (uygunDegil()) kapat(); };
    var dinle = function (mq) {
      if (mq.addEventListener) mq.addEventListener('change', degisti);
      else if (mq.addListener) mq.addListener(degisti);
    };
    dinle(mqInce);
    dinle(mqAz);
    dinle(mqZit);
    dinle(mqKontrast);
  };

  if (document.body) basla();
  else document.addEventListener('DOMContentLoaded', basla);
})();
