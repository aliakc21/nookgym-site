/* NookGym · dambıl imleci, hız çizgileri ve tıklama çatlağı. Bütün sayfalarda ortak (_parca/bas.html).
   Bilerek ES5 yazıldı: eski tarayıcılar ve akıllı TV'ler de ayrıştırabilsin.
   - Yalnız fareli masaüstünde çalışır (hover: hover ve pointer: fine). Dokunmatikte, TV'de, hareket
     azaltma, yüksek kontrast (forced-colors ya da prefers-contrast: more) ya da veri tasarrufu açıkken
     hiçbir şey yapmaz, sistem imlecine dokunmaz. Sayfa açıkken bu ayarlardan biri açılırsa imleç kapanır
     (veri tasarrufu için bağlantının 'change' olayı, olay gelmeyen tarayıcılarda bir sonraki fare hareketi).
   - İçerik Güvenlik Politikası (style-src 'self'): CSS'in tamamı styles.css'te ("Dambıl imleci" bölümü).
     Bu dosya <style>/<link> ya da style="" eklemez; yalnız el.style.transform atar, classList ve
     canvas kullanır.
   - Görünüm: tek el altıgen dambıl (koyu metal başlar, bronz bilezik, tırtıklı çelik sap), arkadan amber
     kenar ışığı (ışıklı tabela). Tıklama noktası dambılın üst ucundaki amber nokta; dambıl hep sağ alta
     yatık durur, hareket yönüne göre en çok 6° eğilir, durunca yerine döner.
   - Hızlı gezdirince dambılın arkasında kısa ömürlü (~0,25 sn), ince, paralel amber hız çizgileri çıkar;
     yavaş gezinmede ve dururken çizgi yok, okuma bozulmaz.
   - Bağlantı ve düğmelerde dambıl uca doğru ~2 px kalkar, 5° daha yatar, kenar ışığı ve gölgesi güçlenir.
     Tıklayınca dambıl ezilip yaylanır, tıklama noktasında zemin kısa bir an çatlar (açılış
     animasyonundaki çatlak). Ses yok.
   - Yay, ezilme, eğilme, çizgi ve çatlak ömürleri geçen süreye, çizgi sayısı katedilen yola bağlı:
     60/120/144/240/360 Hz ekranda aynı hızda ve yoğunlukta.
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
  var baglanti = navigator.connection;
  var uygunDegil = function () {
    return !mqInce.matches || mqAz.matches || mqZit.matches || mqKontrast.matches || !!(baglanti && baglanti.saveData);
  };
  if (uygunDegil()) return;

  var simdiAl = function () { return window.performance && performance.now ? performance.now() : Date.now(); };

  var basla = function () {
    var kok = document.documentElement;

    var tuval = document.createElement('canvas');
    tuval.className = 'imlec-iz';
    tuval.setAttribute('aria-hidden', 'true');
    var ctx = tuval.getContext && tuval.getContext('2d');
    if (!ctx) return;

    // Dikey dambıl, görünür boyu 43 px (SVG 32×80 birim, 18×45 px kutu; 1 px = 1,78 birim).
    // Tıklama noktası üst uçtaki amber nokta (16, 0) → kutuda (9 px, 0). Başlar altıgen dambılın yandan
    // görünüşü (üç yüz, pahlı köşe). Amber kenar ışığı gövdenin altında kalın bir kontur: koyu zeminde
    // dambılı arkadan aydınlatır, amber düğmelerin üstünde koyu gövde zaten seçilir.
    var SILUET =
      'M12.8 2H19.2V8.5H12.8Z' +
      'M4.5 7.5H27.5L30.5 10.5V24L27.5 27H4.5L1.5 24V10.5Z' +
      'M9.5 27H22.5V30.2H9.5Z' +
      'M12.2 30.2H19.8V49.8H12.2Z' +
      'M9.5 49.8H22.5V53H9.5Z' +
      'M4.5 53H27.5L30.5 56V69.5L27.5 72.5H4.5L1.5 69.5V56Z' +
      'M12.8 72.5H19.2V77H12.8Z';
    var dambil = document.createElement('div');
    dambil.className = 'imlec';
    dambil.setAttribute('aria-hidden', 'true');
    dambil.innerHTML =
      '<svg viewBox="0 0 32 80" width="18" height="45" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="imlec-g-kafa" x1="0" x2="1">' +
      '<stop offset="0" stop-color="#0E0C0A"/><stop offset=".23" stop-color="#1A1612"/>' +
      '<stop offset=".23" stop-color="#5A4F41"/><stop offset=".5" stop-color="#40372D"/><stop offset=".77" stop-color="#2A241D"/>' +
      '<stop offset=".77" stop-color="#1E1914"/><stop offset="1" stop-color="#6E5236"/></linearGradient>' +
      '<linearGradient id="imlec-g-sap" x1="0" x2="1"><stop offset="0" stop-color="#3A3631"/><stop offset=".42" stop-color="#D2CABB"/><stop offset="1" stop-color="#47423B"/></linearGradient>' +
      '<linearGradient id="imlec-g-bilezik" x1="0" x2="1"><stop offset="0" stop-color="#5E4630"/><stop offset=".45" stop-color="#CA9F6C"/><stop offset="1" stop-color="#6A4F34"/></linearGradient>' +
      '<radialGradient id="imlec-g-uc" cx=".4" cy=".38" r=".7"><stop offset="0" stop-color="#FFF1D2"/><stop offset=".55" stop-color="#E2B97F"/><stop offset="1" stop-color="#CA9F6C"/></radialGradient></defs>' +
      '<circle class="imlec-hale" cx="16" cy="0" r="8" fill="#CA9F6C"/>' +
      '<g class="imlec-govde">' +
      '<path class="imlec-kenar" d="' + SILUET + '" fill="none" stroke="#CA9F6C" stroke-width="4.4" stroke-linejoin="round"/>' +
      '<g stroke="#0D0C0A" stroke-width="1.1" stroke-linejoin="round">' +
      '<rect x="12.8" y="2" width="6.4" height="7" rx="1.2" fill="url(#imlec-g-sap)"/>' +
      '<rect x="12.8" y="71" width="6.4" height="6" rx="1.2" fill="url(#imlec-g-sap)"/>' +
      '<rect x="12.2" y="29.6" width="7.6" height="20.8" fill="url(#imlec-g-sap)"/>' +
      '<rect x="9.5" y="27" width="13" height="3.2" rx=".8" fill="url(#imlec-g-bilezik)"/>' +
      '<rect x="9.5" y="49.8" width="13" height="3.2" rx=".8" fill="url(#imlec-g-bilezik)"/>' +
      '<path d="M4.5 7.5H27.5L30.5 10.5V24L27.5 27H4.5L1.5 24V10.5Z" fill="url(#imlec-g-kafa)"/>' +
      '<path d="M4.5 53H27.5L30.5 56V69.5L27.5 72.5H4.5L1.5 69.5V56Z" fill="url(#imlec-g-kafa)"/></g>' +
      '<path d="M8.9 8.3V26.2M23.1 8.3V26.2M8.9 53.8V71.7M23.1 53.8V71.7" stroke="#0D0C0A" stroke-opacity=".7" stroke-width=".8"/>' +
      '<path d="M12.7 32.2L19.3 35.4M19.3 32.2L12.7 35.4M12.7 35.6L19.3 38.8M19.3 35.6L12.7 38.8M12.7 39L19.3 42.2M19.3 39L12.7 42.2M12.7 42.4L19.3 45.6M19.3 42.4L12.7 45.6M12.7 45.8L19.3 49M19.3 45.8L12.7 49" stroke="#0D0C0A" stroke-opacity=".45" stroke-width=".6"/>' +
      '<path class="imlec-parlama" d="M9.9 9.3H22.1M9.9 54.8H22.1" stroke="#E6D3AE" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path class="imlec-isik" d="M29.1 11V23.5M29.1 56.5V69" stroke="#E2B97F" stroke-width="1" stroke-linecap="round"/></g>' +
      '<circle class="imlec-uc" cx="16" cy="0" r="3.7" fill="url(#imlec-g-uc)" stroke="#0D0C0A" stroke-width="1.3"/></svg>';

    document.body.appendChild(tuval);
    document.body.appendChild(dambil);
    // styles.css yüklenmediyse (imleç bölümü yok) hiçbir şey yapma: dambıl sayfanın akışına düşmesin
    if (!window.getComputedStyle || window.getComputedStyle(tuval).position !== 'fixed') {
      tuval.parentNode.removeChild(tuval);
      dambil.parentNode.removeChild(dambil);
      return;
    }
    var govde = dambil.querySelector('.imlec-govde');
    var govdeSon = '';

    // Tuvalin CSS boyutu styles.css'te (%100); burada yalnız piksel tamponu ekran yoğunluğuna (DPR) göre
    // ayarlanır. Kaydırma çubuğu gelip gidince de tuvalin boyu değişir: ResizeObserver yakalar.
    var W = 0, H = 0;
    var sigdir = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = tuval.clientWidth || window.innerWidth;
      var h = tuval.clientHeight || window.innerHeight;
      var bw = Math.round(w * dpr), bh = Math.round(h * dpr);
      W = w;
      H = h;
      if (tuval.width !== bw) tuval.width = bw;
      if (tuval.height !== bh) tuval.height = bh;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sigdir();

    var KARE = 1000 / 60;            // ms: hızlar ve yay katsayıları 60 Hz karesine göre
    var DERECE = Math.PI / 180;
    var DURUS = -32;                 // dambılın dinlenik eğimi (derece, sağ alta yatık)
    var BOY = 22;                    // uçtan gövde ortasına (CSS px)
    var MAX_CIZGI = 120;             // hız çizgisi üst sınırı
    var MAX_CATLAK = 4;
    var cizgiler = [];
    var catlaklar = [];
    var pt = {
      x: -300, y: -300, lx: -300, ly: -300, vx: 0, vy: 0, serit: 9,
      egim: DURUS, kalk: 0, kv: 0, olcek: 1, ov: 0, ezik: 0, ev: 0,
      goruldu: false, gorunur: false, basili: false,
      kaldir: false, metin: false, cerceve: false, secim: false
    };
    var sinif = { kaldir: false, metin: false, cerceve: false, secim: false };
    var raf = 0;
    var sonZaman = 0;
    var boyandi = false;
    var kapali = false;

    var sinirla = function (v, a) { return v < -a ? -a : v > a ? a : v; };

    // Hız çizgisi: dambılın arkasında, hareket yönüne paralel ince amber çizgi. 5 şeritten birine düşer
    // (aynı şerit art arda gelmez); şeritler dambılın hareket yönüne dik genişliğine yayılır. Ucu gövdenin
    // hemen arkasından (altından) başlar, kuyruğu geriye uzar. ek: bu karede çizilmeden önce düşülecek
    // sürenin, çizginin yolda çıktığı ana göre fazlası (ms); yolun başında çıkan çizgi daha yaşlıdır.
    var cizgi = function (cx, cy, ux, uy, hiz, yayilim, ek) {
      if (cizgiler.length >= MAX_CIZGI) return;
      var serit = (Math.random() * 5) | 0;
      if (serit === pt.serit) serit = (serit + 1 + ((Math.random() * 4) | 0)) % 5;
      pt.serit = serit;
      var kay = (serit - 2) * yayilim + (Math.random() - 0.5) * 1.4;
      var geri = 2 + Math.random() * 7;
      var omur = 210 + Math.random() * 80;
      cizgiler.push({
        x: cx - uy * kay - ux * geri,
        y: cy + ux * kay - uy * geri,
        ux: ux, uy: uy,
        L: Math.max(22, Math.min(96, hiz * 2.6)) * (0.65 + Math.random() * 0.35),
        w: 1.15 + Math.random() * 0.55,
        o: omur + ek, m: omur
      });
    };

    // Tıklamada zemin çatlağı (açılış animasyonundaki gibi çarpma noktasından yayılan kırık çizgiler):
    // 5–7 zikzak kol (biraz yassı: yerde gibi), bazılarında yan dal. ~70 ms'de yayılır, sonra söner.
    // Koyu zeminde yarıktan amber ışık sızar; açık zeminde (amber düğme) yarık koyu görünür ve yazının
    // üstünde uzun kalmasın diye daha çabuk söner (toplam 0,38 sn).
    var catlak = function (x, y, acik, simdi) {
      if (catlaklar.length >= MAX_CATLAK) catlaklar.shift();
      var kollar = [];
      var n = 5 + ((Math.random() * 3) | 0);
      var bas = Math.random() * Math.PI * 2;
      // dambılın gövdesi uçtan bu yöne uzanır: o yöne düşen kol yana itilir, gövdenin altında kalmasın
      var govdeAci = (90 + pt.egim - 5 * pt.kalk) * DERECE;
      var i, j, a, yon, px, py, kol, uz, s, dal, b, isaret, da;
      for (i = 0; i < n; i += 1) {
        yon = bas + i * (Math.PI * 2 / n) + (Math.random() - 0.5) * 0.6;
        da = Math.atan2(Math.sin(yon - govdeAci), Math.cos(yon - govdeAci));
        if (Math.abs(da) < 0.45) yon = govdeAci + (da < 0 ? -0.45 : 0.45);
        // kol tıklama noktasının 4 px dışından başlar: uç nokta çatlağın içinde kaybolmasın
        px = Math.cos(yon) * 4; py = Math.sin(yon) * 4 * 0.72; kol = [px, py];
        kol.ana = true;
        s = 4 + ((Math.random() * 2) | 0);
        uz = (22 + Math.random() * 18) / s;
        isaret = Math.random() < 0.5 ? -1 : 1;
        for (j = 0; j < s; j += 1) {
          if (Math.random() < 0.8) isaret = -isaret;
          a = yon + isaret * (0.2 + Math.random() * 0.45);
          px += Math.cos(a) * uz;
          py += Math.sin(a) * uz * 0.72;
          kol.push(px, py);
          if (j === 1 && Math.random() < 0.45) {
            b = yon + (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.4);
            dal = [px, py, px + Math.cos(b) * 4, py + Math.sin(b) * 4 * 0.72];
            b += (Math.random() - 0.5) * 0.9;
            dal.push(dal[2] + Math.cos(b) * 4, dal[3] + Math.sin(b) * 4 * 0.72);
            kollar.push(dal);
          }
        }
        kollar.push(kol);
      }
      // m: toplam ömür, tut: tam görünür kaldığı süre (ms)
      catlaklar.push({ x: x, y: y, k: kollar, acik: acik, t: simdi, m: acik ? 380 : 520, tut: acik ? 150 : 210 });
    };

    // bir kolu (kırık çizgi) büyüme oranına göre kısmen çiz; merkezden uca doğru incelir
    var kolCiz = function (c, kol, buyu, kalin) {
      var adet = kol.length / 2 - 1;
      var son = adet * buyu;
      var ana = kol.ana ? 1 : 0.55;
      var j, f, x0, y0;
      for (j = 0; j < son; j += 1) {
        f = Math.min(1, son - j);
        x0 = c.x + kol[j * 2];
        y0 = c.y + kol[j * 2 + 1];
        ctx.lineWidth = kalin * ana * (1 - 0.65 * j / adet);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + (kol[j * 2 + 2] - kol[j * 2]) * f, y0 + (kol[j * 2 + 3] - kol[j * 2 + 1]) * f);
        ctx.stroke();
      }
    };

    // tıklanan yerin zemini açık mı (amber düğme gibi)? Yalnız tıklamada bir kez bakılır.
    var zeminAcik = function (el) {
      var m;
      while (el && el.nodeType === 1) {
        m = window.getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (m && m.length >= 3 && (m.length < 4 || +m[3] > 0.5)) {
          return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 > 0.45;
        }
        el = el.parentNode;
      }
      return false;
    };

    var tick = function () {
      raf = 0;
      if (kapali) return;
      // f: geçen süre, 60 Hz karesi cinsinden (0,05–3; alt sınır yalnız sıfıra bölmeyi önler, 1200 Hz).
      // Hız eşiği, yaylar ve ömürler ekran tazeleme hızından bağımsız kalsın.
      var simdi = simdiAl();
      var f = sonZaman ? (simdi - sonZaman) / KARE : 1;
      f = f < 0.05 ? 0.05 : f > 3 ? 3 : f;
      var gecen = f * KARE;
      sonZaman = simdi;
      var dx = pt.x - pt.lx;
      var dy = pt.y - pt.ly;
      var d = Math.sqrt(dx * dx + dy * dy);
      var i, n, p, k, a, l, hx, hy, tx, ty, g, q, buyu, bas, t, r, bx, by, ux, uy, yay;
      var cizilir = pt.gorunur && !pt.metin && !pt.cerceve && !pt.secim;

      // yumuşatılmış hız (px / 60 Hz karesi): olay sıklığındaki oynamalar çizgi ve eğimi titretmesin
      a = 1 - Math.pow(0.65, f);
      pt.vx += (dx / f - pt.vx) * a;
      pt.vy += (dy / f - pt.vy) * a;
      var hiz = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);

      // yalnız hızlı harekette hız çizgisi (yaklaşık 480 px/sn üstü). Yön yumuşatılmış hızdan: çizgiler
      // paralel. Çıkış noktaları son karede alınan yola dağıtılır: çizgi uçları öbek öbek dizilmesin.
      // Sayı bu karede katedilen yola bağlı (d / hiz = kaç 60 Hz karesi yol): fare olayları her karede
      // gelmese de (125 Hz fare, 240/360 Hz ekran) toplam yoğunluk aynı kalır.
      if (cizilir && d > 0.5 && hiz > 8) {
        n = Math.min(4, (hiz - 8) * 0.12 + 0.6) * Math.min(3, d / hiz);
        n = Math.floor(n) + (Math.random() < n % 1 ? 1 : 0);
        ux = pt.vx / hiz;
        uy = pt.vy / hiz;
        r = (pt.egim - 5 * pt.kalk) * DERECE;
        bx = -Math.sin(r) * BOY * pt.olcek;
        by = Math.cos(r) * BOY * pt.olcek;
        // şerit aralığı: gövde hareket yönüne dik durunca geniş, yönüne paralelken dar
        yay = 2.6 + Math.abs(-bx * uy + by * ux) / BOY * 5.4;
        for (i = 0; i < n; i += 1) {
          t = Math.random();
          cizgi(pt.lx + dx * t + bx, pt.ly + dy * t + by, ux, uy, hiz, yay, t * gecen);
        }
      }
      pt.lx = pt.x;
      pt.ly = pt.y;

      for (i = 0; i < catlaklar.length;) {
        if (simdi - catlaklar[i].t >= catlaklar[i].m) catlaklar.splice(i, 1);
        else i += 1;
      }

      var ciz = cizgiler.length > 0 || catlaklar.length > 0;
      if (ciz || boyandi) ctx.clearRect(0, 0, W, H);
      boyandi = ciz;

      // çatlaklar (çizgilerin altında)
      for (i = 0; i < catlaklar.length; i += 1) {
        p = catlaklar[i];
        q = simdi - p.t;
        buyu = Math.min(1, q / 70);
        k = q <= p.tut ? 1 : 1 - (q - p.tut) / (p.m - p.tut);
        a = k * k * (3 - 2 * k);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (p.acik) {
          ctx.strokeStyle = '#8B6843';
          ctx.globalAlpha = a * 0.35;
          for (n = 0; n < p.k.length; n += 1) kolCiz(p, p.k[n], buyu, 3.4);
          ctx.strokeStyle = '#0D0C0A';
          ctx.globalAlpha = a * 0.9;
          for (n = 0; n < p.k.length; n += 1) kolCiz(p, p.k[n], buyu, 1.8);
        } else {
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = '#CA9F6C';
          ctx.globalAlpha = a * 0.3;
          for (n = 0; n < p.k.length; n += 1) kolCiz(p, p.k[n], buyu, 3.8);
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = '#F4DEB2';
          ctx.globalAlpha = a;
          for (n = 0; n < p.k.length; n += 1) kolCiz(p, p.k[n], buyu, 1.35);
        }
      }

      // hız çizgileri: geriye akar, kuyruktan kısalır. Uçlar yuvarlak ve saydamdan başlar (ilk ~5 px'te
      // belirir): sert kesik uç ve basamaklanma yok. Koordinatlar yuvarlanmaz (alt piksel konum).
      ctx.lineCap = 'round';
      for (i = cizgiler.length - 1; i >= 0; i -= 1) {
        p = cizgiler[i];
        p.o -= gecen;
        if (p.o <= 0) {
          // sıra önemsiz: sondakini buraya taşı (o zaten bu karede işlendi)
          cizgiler[i] = cizgiler[cizgiler.length - 1];
          cizgiler.pop();
          continue;
        }
        k = p.o / p.m;
        p.x -= p.ux * 0.9 * f;
        p.y -= p.uy * 0.9 * f;
        l = p.L * (0.3 + 0.7 * k);
        hx = p.x; hy = p.y;
        tx = hx - p.ux * l; ty = hy - p.uy * l;
        bas = Math.min(0.3, 5 / l);
        g = ctx.createLinearGradient(hx + p.ux * 1.5, hy + p.uy * 1.5, tx, ty);
        g.addColorStop(0, 'rgba(244,222,178,0)');
        g.addColorStop(bas, 'rgba(244,222,178,1)');
        g.addColorStop(bas + (1 - bas) * 0.3, 'rgba(202,159,108,0.85)');
        g.addColorStop(1, 'rgba(202,159,108,0)');
        ctx.strokeStyle = g;
        a = Math.pow(k, 1.4);
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(tx, ty);
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = a * 0.3;
        ctx.lineWidth = p.w * 3.4;
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = a;
        ctx.lineWidth = p.w;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';

      // Dambıl yatay harekete göre en çok 6° eğilir (ağırlık geride kalır), durunca dinlenik eğimine döner.
      // Bağlantı/düğme üstünde ucuna doğru ~2 px kalkar, 5° daha yatar, hafif büyür. Basılıyken ezilir,
      // bırakınca yaylanır. Yaylar 60 Hz'lik adımlarla (h ≤ 1) ilerler: 120/144 Hz ekranda da aynı hızda,
      // yavaş karede de kararlı.
      var hedefEgim = DURUS + sinirla(pt.vx * 0.3, 6);
      var hedefKalk = pt.kaldir ? 1 : 0;
      var hedefEzik = pt.basili ? 0.12 : 0;
      var kalan = f, h;
      while (kalan > 0.001) {
        h = kalan > 1 ? 1 : kalan;
        kalan -= h;
        pt.egim += (hedefEgim - pt.egim) * (1 - Math.pow(0.8, h));
        pt.kv = (pt.kv + (hedefKalk - pt.kalk) * 0.28 * h) * Math.pow(0.6, h);
        pt.kalk += pt.kv * h;
        pt.ov = (pt.ov + (1 + pt.kalk * 0.05 - pt.olcek) * 0.3 * h) * Math.pow(0.62, h);
        pt.olcek += pt.ov * h;
        pt.ev = (pt.ev + (hedefEzik - pt.ezik) * 0.32 * h) * Math.pow(0.6, h);
        pt.ezik += pt.ev * h;
      }
      var hedefOlcek = 1 + pt.kalk * 0.05;

      dambil.style.transform =
        'translate3d(' + pt.x.toFixed(2) + 'px,' + pt.y.toFixed(2) + 'px,0)' +
        ' rotate(' + (pt.egim - 5 * pt.kalk).toFixed(2) + 'deg)' +
        ' scale(' + (pt.olcek * (1 + pt.ezik * 0.6)).toFixed(3) + ',' + (pt.olcek * (1 - pt.ezik)).toFixed(3) + ')';
      // gövde kendi ekseninde uca doğru kalkar (SVG birimi, 3,4 birim ≈ 1,9 px); uç noktası kıpırdamaz
      var gs = 'translate(0px,' + (-3.4 * pt.kalk).toFixed(2) + 'px)';
      if (gs !== govdeSon) {
        govdeSon = gs;
        govde.style.transform = gs;
      }

      if (ciz || d > 0 ||
          Math.abs(pt.vx) > 0.05 || Math.abs(pt.vy) > 0.05 ||
          Math.abs(hedefEgim - pt.egim) > 0.05 ||
          Math.abs(hedefKalk - pt.kalk) > 0.002 || Math.abs(pt.kv) > 0.002 ||
          Math.abs(hedefOlcek - pt.olcek) > 0.002 || Math.abs(pt.ov) > 0.002 ||
          Math.abs(hedefEzik - pt.ezik) > 0.002 || Math.abs(pt.ev) > 0.002) {
        raf = window.requestAnimationFrame(tick);
      } else {
        sonZaman = 0;
      }
    };
    var uyandir = function () { if (!raf && !kapali) raf = window.requestAnimationFrame(tick); };

    // sınıfları yalnız değişince yaz (her karede classList'e dokunma)
    var sinifYaz = function () {
      var ad;
      for (ad in sinif) {
        if (sinif.hasOwnProperty(ad) && sinif[ad] !== pt[ad]) {
          sinif[ad] = pt[ad];
          if (pt[ad]) dambil.classList.add(ad); else dambil.classList.remove(ad);
        }
      }
      if (pt.secim) kok.classList.add('imlec-secim'); else kok.classList.remove('imlec-secim');
    };

    // Sistem imleci yalnız dambıl gerçekten çizilebildiğinde gizlenir.
    var goster = function () {
      if (!pt.goruldu || kapali) return;
      pt.gorunur = true;
      pt.vx = pt.vy = 0;
      dambil.classList.add('acik');
      kok.classList.add('imlec-acik');
    };
    var gizle = function () {
      if (kapali) return;
      pt.gorunur = false;
      pt.basili = false;
      pt.secim = false;
      dambil.classList.remove('acik');
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
    // imlecin altındaki öğeye göre durum: iframe (Instagram/harita) üstünde dambıl gizlenir,
    // iframe içinde zaten sistem imleci görünür; yazı alanında sistem metin imleci
    var durum = function (el, x, y) {
      var once = pt.cerceve || pt.metin;
      pt.cerceve = !!el && el.tagName === 'IFRAME';
      pt.metin = !pt.cerceve && yaziAlani(el);
      pt.kaldir = !pt.cerceve && !pt.metin && tutulur(el);
      // iframe'den ya da yazı alanından çıkınca eski konumdan yeniye hız çizgisi çekilmesin
      if (once && !pt.cerceve && !pt.metin && typeof x === 'number') {
        pt.x = pt.lx = x;
        pt.y = pt.ly = y;
        pt.vx = pt.vy = 0;
      }
      sinifYaz();
      uyandir();
    };

    window.addEventListener('pointermove', function (e) {
      if (kapali) return;
      // veri tasarrufu sonradan açıldıysa ('change' olayı gelmeyen tarayıcılar için ucuz yedek denetim)
      if (baglanti && baglanti.saveData) { kapat(); return; }
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
        catlak(pt.x, pt.y, zeminAcik(e.target), simdiAl());
        pt.ev += 0.05;
      }
      uyandir();
    }, { passive: true });

    window.addEventListener('pointerup', birak);
    window.addEventListener('pointercancel', birak);
    window.addEventListener('contextmenu', birak);

    // Fareyle metin seçerken dambıl çekilir, sistem imleci (metin imleci) görünür.
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
    // tarayıcı kendi sürükleme imlecini çizer, olay akışı kesilir: dambıl donup kalmasın
    window.addEventListener('dragstart', gizle);
    var boyut = function () { if (kapali) return; sigdir(); uyandir(); };
    window.addEventListener('resize', boyut);
    var gozcu = window.ResizeObserver ? new window.ResizeObserver(boyut) : null;
    if (gozcu) gozcu.observe(tuval);

    // sekme gizliyken döngü tamamen durur, çizgiler ve çatlaklar temizlenir
    document.addEventListener('visibilitychange', function () {
      if (kapali || !document.hidden) return;
      gizle();
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      sonZaman = 0;
      cizgiler.length = 0;
      catlaklar.length = 0;
      ctx.clearRect(0, 0, W, H);
      boyandi = false;
    });

    // Sayfa açıkken ayar değişirse (hareket azaltma, yüksek kontrast, dokunmatik kip, veri tasarrufu)
    // imleç kapanır.
    // Dinleyiciler yerinde kalır ama hepsi "kapali" iken hemen döner: diziler bir daha dolmaz.
    var kapat = function () {
      if (kapali) return;
      kapali = true;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      if (gozcu) gozcu.disconnect();
      cizgiler.length = 0;
      catlaklar.length = 0;
      kok.classList.remove('imlec-acik');
      kok.classList.remove('imlec-secim');
      if (tuval.parentNode) tuval.parentNode.removeChild(tuval);
      if (dambil.parentNode) dambil.parentNode.removeChild(dambil);
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
    if (baglanti && baglanti.addEventListener) baglanti.addEventListener('change', degisti);
  };

  if (document.body) basla();
  else document.addEventListener('DOMContentLoaded', basla);
})();
