/* A animação do tutorial do app, redesenhada para o navegador.
 *
 * É a mesma cena que aparece na primeira abertura do SmartReplay: mesmas
 * coordenadas (320×240), mesmos tempos, mesmo desenho. Aqui ela roda em canvas
 * em vez de Flutter — não é vídeo, então não pesa e fica nítida em qualquer
 * tela. As legendas ficam no HTML para o tradutor do site cuidar delas. */
(function () {
  var tela = document.getElementById('tut-canvas');
  if (!tela || !tela.getContext) return;
  var ctx = tela.getContext('2d');

  var VERDE = '#39FF14';
  var LARG = 320, ALT = 240, CHAO = 208, XTRIPE = 108, TOPO_TRIPE = 146;
  var CEL = { x: XTRIPE, y: TOPO_TRIPE - 15 };
  var PAINEL = { x: 12, y: 16, w: 56, h: 98 };
  var ADV = { x: 232, y: 143 };
  var DURACAO = 6000, CENAS = 3;

  var escala = 1, t = 0, cena = 0, inicio = null, rodando = true;

  function medir() {
    var caixa = tela.parentNode.getBoundingClientRect();
    var largura = Math.min(caixa.width, 640);
    var dpr = window.devicePixelRatio || 1;
    escala = largura / LARG;
    tela.style.width = largura + 'px';
    tela.style.height = (largura * ALT / LARG) + 'px';
    tela.width = Math.round(largura * dpr);
    tela.height = Math.round(largura * ALT / LARG * dpr);
    ctx.setTransform(dpr * escala, 0, 0, dpr * escala, 0, 0);
    pintar();
  }

  /** Só o desenho do quadro atual — separado do laço para o resize poder
   *  repintar sem depender de a animação estar rodando. */
  function pintar() {
    ctx.clearRect(0, 0, LARG, ALT);
    quadra();
    if (cena === 0) cenaMontar(); else if (cena === 1) cenaPerto(); else cenaLonge();
  }

  // ── utilitários de desenho ────────────────────────────────────────────────
  function linha(x1, y1, x2, y2, cor, larg) {
    ctx.strokeStyle = cor; ctx.lineWidth = larg || 1; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function circulo(x, y, r, cor, contorno, larg) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    if (contorno) { ctx.strokeStyle = cor; ctx.lineWidth = larg || 1; ctx.stroke(); }
    else { ctx.fillStyle = cor; ctx.fill(); }
  }
  function retangulo(x, y, w, h, r, cor, contorno, larg) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    if (contorno) { ctx.strokeStyle = cor; ctx.lineWidth = larg || 1; ctx.stroke(); }
    else { ctx.fillStyle = cor; ctx.fill(); }
  }
  function elipse(cx, cy, rx, ry, cor, contorno, larg) {
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (contorno) { ctx.strokeStyle = cor; ctx.lineWidth = larg || 1; ctx.stroke(); }
    else { ctx.fillStyle = cor; ctx.fill(); }
  }
  /** Lê um texto que o tradutor do site mantém, com reserva. */
  function texto(id, reserva) {
    var el = document.getElementById(id);
    return (el && el.textContent.trim()) || reserva;
  }
  function limitar(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function suave(v) { return v * v * (3 - 2 * v); }
  function entre(a, b, v) { return a + (b - a) * v; }

  /** Laterais da quadra numa dada profundidade — a perspectiva se apoia nisto. */
  function bordas(y) {
    var f = limitar((y - 122) / (CHAO - 122), 0, 1);
    return [158 + (136 - 158) * f, 300 + (316 - 300) * f];
  }

  function quadra() {
    // Alambrado ao fundo: fecha a cena e dá para onde o olho ir.
    ctx.fillStyle = 'rgba(255,255,255,0.022)';
    ctx.fillRect(146, 92, 166, 30);
    for (var x = 152; x < 312; x += 9) linha(x, 95, x, 122, 'rgba(255,255,255,0.05)', 0.6);
    linha(146, 92, 312, 92, 'rgba(255,255,255,0.14)', 1);

    var g = ctx.createLinearGradient(0, 122, 0, CHAO);
    g.addColorStop(0, '#1F4630'); g.addColorStop(1, '#0E2214');
    ctx.beginPath();
    ctx.moveTo(158, 122); ctx.lineTo(300, 122); ctx.lineTo(316, CHAO); ctx.lineTo(136, CHAO);
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();

    // Linhas mais fracas ao longe: a mesma tinta em toda a quadra achataria.
    function tinta(y) {
      var f = limitar((y - 122) / (CHAO - 122), 0, 1);
      return ['rgba(255,255,255,' + (0.13 + 0.17 * f).toFixed(3) + ')', 0.8 + 0.5 * f];
    }
    var c = tinta(180);
    ctx.strokeStyle = c[0]; ctx.lineWidth = c[1]; ctx.stroke();

    [146, 186].forEach(function (y) {
      var b = bordas(y), k = tinta(y);
      linha(b[0] + 6, y, b[1] - 6, y, k[0], k[1]);
    });
    var b1 = bordas(146), b2 = bordas(186), k = tinta(166);
    linha((b1[0] + b1[1]) / 2, 146, (b2[0] + b2[1]) / 2, 186, k[0], k[1]);

    // A rede: fita clara no topo é o que faz o olho ler "rede" e não "muro".
    var br = bordas(166);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(br[0] - 2, 158, (br[1] + 2) - (br[0] - 2), 8);
    for (var fx = br[0] + 4; fx < br[1]; fx += 11) linha(fx, 159.5, fx, 166, 'rgba(255,255,255,0.10)', 0.6);
    linha(br[0] - 2, 158, br[0] - 2, 168, 'rgba(255,255,255,0.34)', 1.4);
    linha(br[1] + 2, 158, br[1] + 2, 168, 'rgba(255,255,255,0.34)', 1.4);
    linha(br[0] - 2, 158, br[1] + 2, 158, 'rgba(255,255,255,0.38)', 1.2);

    linha(6, CHAO, 318, CHAO, 'rgba(255,255,255,0.12)', 1.2);
  }

  function sombra(x, y, larg, forca) {
    ctx.save();
    if ('filter' in ctx) ctx.filter = 'blur(2px)';
    elipse(x, y, larg / 2, larg * 0.13, 'rgba(0,0,0,' + (0.38 * forca).toFixed(2) + ')');
    ctx.restore();
  }

  function tripe() {
    var jx = XTRIPE, jy = TOPO_TRIPE + 22;
    linha(XTRIPE, TOPO_TRIPE, jx, jy, 'rgba(255,255,255,0.54)', 1.8);
    linha(jx, jy, XTRIPE - 16, CHAO, 'rgba(255,255,255,0.54)', 1.8);
    linha(jx, jy, XTRIPE + 16, CHAO, 'rgba(255,255,255,0.54)', 1.8);
    linha(jx, jy, XTRIPE + 3, CHAO - 3, 'rgba(255,255,255,0.54)', 1.8);
  }

  function celular(cx, cy, ligado, flash) {
    retangulo(cx - 7.5, cy - 13.5, 15, 27, 2.5, '#0D0D0F');
    retangulo(cx - 7.5, cy - 13.5, 15, 27, 2.5, 'rgba(255,255,255,0.7)', true, 1.2);
    var cor = !ligado ? '#1A1A1D'
      : (flash > 0 ? misturar('#16301D', VERDE, flash) : '#16301D');
    retangulo(cx - 5.5, cy - 11, 11, 22, 1.4, cor);
    if (ligado && !flash) {
      var p = 0.5 + 0.5 * Math.abs(Math.sin(t * Math.PI * 8));
      circulo(cx + 3, cy - 8, 1.4, 'rgba(255,0,0,' + p.toFixed(2) + ')');
    }
  }

  function misturar(a, b, k) {
    function n(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
    var x = n(a), y = n(b);
    return 'rgb(' + Math.round(entre(x[0], y[0], k)) + ',' + Math.round(entre(x[1], y[1], k)) + ',' + Math.round(entre(x[2], y[2], k)) + ')';
  }

  /** A tela do app ampliada — a ponte entre o desenho e o aparelho real. */
  function painel(aparicao, flash, clipe) {
    if (aparicao <= 0) return;
    var P = PAINEL;
    ctx.save();
    ctx.translate(P.x + P.w / 2, P.y + P.h / 2);
    ctx.scale(0.9 + 0.1 * aparicao, 0.9 + 0.1 * aparicao);
    ctx.translate(-(P.x + P.w / 2), -(P.y + P.h / 2));

    linha(P.x + P.w, P.y, CEL.x - 7, CEL.y - 13, 'rgba(255,255,255,' + (0.18 * aparicao).toFixed(2) + ')', 0.8);
    linha(P.x + P.w, P.y + P.h, CEL.x - 7, CEL.y + 13, 'rgba(255,255,255,' + (0.18 * aparicao).toFixed(2) + ')', 0.8);

    retangulo(P.x, P.y, P.w, P.h, 7, 'rgba(13,13,15,' + aparicao.toFixed(2) + ')');
    retangulo(P.x, P.y, P.w, P.h, 7, 'rgba(255,255,255,' + (0.7 * aparicao).toFixed(2) + ')', true, 1.4);

    var T = { x: P.x + 4, y: P.y + 4, w: P.w - 8, h: P.h - 8 };
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(T.x, T.y, T.w, T.h, 4); else ctx.rect(T.x, T.y, T.w, T.h);
    ctx.clip();
    ctx.fillStyle = 'rgba(22,48,29,' + aparicao.toFixed(2) + ')';
    ctx.fillRect(T.x, T.y, T.w, T.h);

    // O visor mostra a mesma quadra da cena — é o que amarra as duas metades.
    var vis = 'rgba(255,255,255,' + (0.15 * aparicao).toFixed(2) + ')';
    ctx.beginPath();
    ctx.moveTo(T.x + 8, T.y + 34); ctx.lineTo(T.x + T.w - 8, T.y + 34);
    ctx.lineTo(T.x + T.w - 2, T.y + T.h - 20); ctx.lineTo(T.x + 2, T.y + T.h - 20);
    ctx.closePath(); ctx.strokeStyle = vis; ctx.lineWidth = 0.8; ctx.stroke();
    linha(T.x + 5, T.y + 47, T.x + T.w - 5, T.y + 47, vis, 0.8);

    var chip = 'rgba(255,255,255,' + (0.45 * aparicao).toFixed(2) + ')';
    retangulo(T.x + 4, T.y + 5, 11, 5, 2, chip);
    retangulo(T.x + 17, T.y + 5, 9, 5, 2, chip);
    var pulso = 0.5 + 0.5 * Math.abs(Math.sin(t * Math.PI * 8));
    circulo(T.x + T.w - 7, T.y + 7.5, 2.6, 'rgba(255,0,0,' + (pulso * aparicao).toFixed(2) + ')');

    var gal = { x: T.x + T.w - 13, y: T.y + T.h - 15, w: 10, h: 10 };
    retangulo(T.x + 3, T.y + T.h - 15, T.w - 19, 10, 5, 'rgba(57,255,20,' + (0.85 * aparicao).toFixed(2) + ')');
    retangulo(gal.x, gal.y, gal.w, gal.h, 2, 'rgba(255,255,255,' + (0.45 * aparicao).toFixed(2) + ')');

    if (flash > 0) {
      ctx.fillStyle = 'rgba(57,255,20,' + (0.92 * flash).toFixed(2) + ')';
      ctx.fillRect(T.x, T.y, T.w, T.h);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(texto('tut-salvo', 'SALVO'), T.x + T.w / 2, T.y + T.h / 2);
    }
    if (clipe >= 0) {
      var v = limitar(clipe, 0, 1); v = v * v;
      var px = entre(T.x + T.w / 2, gal.x + gal.w / 2, v);
      var py = entre(T.y + T.h / 2, gal.y + gal.h / 2, v);
      var lado = 30 * (1 - v) + 8;
      retangulo(px - lado / 2, py - lado * 0.35, lado, lado * 0.7, 2,
        'rgba(57,255,20,' + ((1 - v) * 0.95).toFixed(2) + ')');
    }
    ctx.restore();
    ctx.restore();
  }

  function cone(forca) {
    if (forca <= 0) return;
    ctx.beginPath();
    ctx.moveTo(CEL.x + 8, CEL.y); ctx.lineTo(306, 126); ctx.lineTo(310, 200); ctx.closePath();
    ctx.fillStyle = 'rgba(57,255,20,' + (0.10 * forca).toFixed(3) + ')'; ctx.fill();
  }

  function mao(pesX, pesY, altura, ang, paraEsquerda) {
    var lado = paraEsquerda ? -1 : 1;
    var ox = pesX, oy = pesY - altura * 0.75;
    var cx = ox + lado * Math.sin(ang) * altura * 0.17;
    var cy = oy - Math.cos(ang) * altura * 0.17;
    return [cx + lado * Math.sin(ang - 0.4) * altura * 0.16, cy - Math.cos(ang - 0.4) * altura * 0.16];
  }

  function raquete(mx, my, altura, paraEsquerda, cor) {
    var lado = paraEsquerda ? -1 : 1;
    var dx = lado * 0.5, dy = -0.87;
    var cabo = [mx + dx * altura * 0.09, my + dy * altura * 0.09];
    var aro = [mx + dx * altura * 0.21, my + dy * altura * 0.21];
    linha(mx, my, cabo[0], cabo[1], cor, altura * 0.035);
    ctx.save(); ctx.translate(aro[0], aro[1]); ctx.rotate(-lado * 0.5);
    elipse(0, 0, altura * 0.065, altura * 0.095, cor, true, altura * 0.03);
    ctx.restore();
  }

  /** A pessoa, em silhueta articulada: tronco largo, membros finos, juntas que
   *  dobram e sombra no chão. Sem isso, vira palito. */
  function pessoa(pesX, pesY, o) {
    o = o || {};
    var altura = o.altura || 88, passo = o.passo || 0;
    var frente = o.frente === undefined ? 3.35 : o.frente;
    var tras = o.tras === undefined ? 3.55 : o.tras;
    var paraEsquerda = o.paraEsquerda === undefined ? true : o.paraEsquerda;
    var cor = o.cor || '#fff';
    if (o.raquete) tras = Math.max(tras, 3.85);
    var lado = paraEsquerda ? -1 : 1;
    sombra(pesX, pesY, altura * 0.46, altura / 88);

    var qy = pesY - altura * 0.46, oy = pesY - altura * 0.75;
    var balanco = Math.sin(passo * Math.PI * 2) * altura * 0.15;
    [altura * 0.10 + balanco, -altura * 0.10 - balanco].forEach(function (d) {
      var px = pesX + d;
      var jx = (pesX + px) / 2 + lado * altura * 0.035, jy = (qy + pesY) / 2 - altura * 0.01;
      linha(pesX, qy, jx, jy, cor, altura * 0.085);
      linha(jx, jy, px, pesY, cor, altura * 0.085);
    });
    linha(pesX, oy + altura * 0.02, pesX, qy, cor, altura * 0.132);
    circulo(pesX + lado * altura * 0.012, pesY - altura * 0.885, altura * 0.076, cor);

    function braco(ang) {
      var cx = pesX + lado * Math.sin(ang) * altura * 0.17;
      var cy = oy - Math.cos(ang) * altura * 0.17;
      var m = mao(pesX, pesY, altura, ang, paraEsquerda);
      linha(pesX, oy, cx, cy, cor, altura * 0.06);
      linha(cx, cy, m[0], m[1], cor, altura * 0.06);
      return m;
    }
    var mt = braco(tras);
    braco(frente);
    if (o.raquete) raquete(mt[0], mt[1], altura, !paraEsquerda, cor);
  }

  function adversario() {
    var b = Math.sin(t * Math.PI * 4) * 1.2;
    pessoa(ADV.x + b, ADV.y, { altura: 34, paraEsquerda: false, raquete: true, cor: 'rgba(255,255,255,0.7)' });
  }

  function balao(ax, ay, frase, aparicao) {
    if (aparicao <= 0) return;
    ctx.font = 'italic bold 10px system-ui, sans-serif';
    var larg = ctx.measureText(frase).width + 14, alt = 19;
    var cx = ax, cy = ay - alt / 2;
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(0.75 + 0.25 * aparicao, 0.75 + 0.25 * aparicao); ctx.translate(-cx, -cy);
    var tinta = 'rgba(255,255,255,' + aparicao.toFixed(2) + ')';
    retangulo(cx - larg / 2, cy - alt / 2, larg, alt, 8, tinta);
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + alt / 2 - 1); ctx.lineTo(ax + 1, ay + 6); ctx.lineTo(cx + 5, cy + alt / 2 - 1);
    ctx.closePath(); ctx.fillStyle = tinta; ctx.fill();
    ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(frase, cx, cy);
    ctx.restore();
  }

  function relogio(px, py, aceso) {
    linha(px - 3.5, py - 4.5, px + 3.5, py - 4.5, 'rgba(255,255,255,0.6)', 2);
    circulo(px, py, 5.4, 'rgba(255,255,255,0.7)');
    circulo(px, py, 3.9, misturar('#17301C', VERDE, aceso));
    if (aceso > 0.5) {
      circulo(px, py, 6.5 + 3 * (aceso - 0.5), 'rgba(57,255,20,' + limitar((1 - aceso) * 1.4, 0, 1).toFixed(2) + ')', true, 1.2);
    }
  }

  function ondas(ox, oy, dx, dy, avanco) {
    if (avanco <= 0) return;
    for (var i = 0; i < 3; i++) {
      var f = limitar(avanco * 1.5 - i * 0.2, 0, 1);
      if (f <= 0) continue;
      circulo(entre(ox, dx, f), entre(oy, dy, f), 3 + 5 * (1 - f),
        'rgba(57,255,20,' + ((1 - f) * 0.9).toFixed(2) + ')', true, 1.6);
    }
  }

  function bola(x, y, r) { circulo(x, y, r, '#fff'); }

  // ── as três cenas ─────────────────────────────────────────────────────────
  function cenaMontar() {
    tripe();
    var chegando = limitar(t / 0.38, 0, 1), saindo = limitar((t - 0.70) / 0.30, 0, 1);
    var x = t < 0.70 ? 262 - (262 - 152) * (1 - Math.pow(1 - chegando, 2))
                     : 152 + 46 * suave(saindo);
    var montando = limitar((t - 0.38) / 0.18, 0, 1);
    var ligando = limitar((t - 0.56) / 0.12, 0, 1);
    var ligado = t > 0.62;
    var estica = t < 0.38 ? 0.23 : (t < 0.70 ? Math.max(0.23, Math.max(montando, ligando)) : (1 - saindo) * 0.23);
    var frente = 3.35 - 1.75 * suave(estica);

    cone(ligado ? limitar((t - 0.62) / 0.12, 0, 1) : 0);
    adversario();
    pessoa(x, CHAO, { passo: t < 0.38 ? chegando * 3.5 : (saindo > 0 ? saindo * 1.5 : 0), frente: frente, raquete: true });

    var m = mao(x, CHAO, 88, frente, true);
    var cx = t < 0.38 ? m[0] : entre(m[0], CEL.x, suave(montando));
    var cy = t < 0.38 ? m[1] : entre(m[1], CEL.y, suave(montando));
    celular(cx, cy, ligado, 0);
    painel(limitar((t - 0.62) / 0.14, 0, 1), 0, -1);
  }

  function cenaPerto() {
    tripe(); cone(1); adversario();
    var b = limitar((t - 0.04) / 0.34, 0, 1);
    if (b > 0 && b < 1) {
      bola(ADV.x - 26 * b, ADV.y - 8 + 54 * b - 32 * Math.sin(b * Math.PI), 2.6 + b);
    }
    pessoa(178, CHAO, { raquete: true });
    var aparicao = t < 0.38 ? limitar((t - 0.30) / 0.08, 0, 1) : limitar(1 - (t - 0.62) / 0.10, 0, 1);
    balao(178, CHAO - 96, texto('tut-expressao', 'bela jogada'), aparicao);
    var flash = t > 0.46 ? limitar(1 - (t - 0.46) / 0.26, 0, 1) : 0;
    celular(CEL.x, CEL.y, true, flash);
    painel(1, flash, t > 0.68 ? limitar((t - 0.68) / 0.20, 0, 1) : -1);
  }

  function cenaLonge() {
    tripe(); cone(1); adversario();
    var b = limitar(t / 0.30, 0, 1);
    if (b < 1) bola(ADV.x + 46 * b, ADV.y - 8 + 46 * b - 28 * Math.sin(b * Math.PI), 2.6 + b * 0.8);
    var levanta = limitar((t - 0.12) / 0.20, 0, 1);
    var bracoPulso = 3.35 - 1.55 * suave(levanta);
    var toque = limitar((t - 0.36) / 0.08, 0, 1);
    pessoa(272, 194, { altura: 52, frente: bracoPulso, tras: 3.55 - 0.7 * toque, raquete: true });
    var p = mao(272, 194, 52, bracoPulso, true);
    relogio(p[0], p[1], toque);
    ondas(p[0], p[1], CEL.x + 6, CEL.y, limitar((t - 0.44) / 0.30, 0, 1));
    var flash = t > 0.70 ? limitar(1 - (t - 0.70) / 0.26, 0, 1) : 0;
    celular(CEL.x, CEL.y, true, flash);
    painel(1, flash, -1);
  }

  // ── laço ──────────────────────────────────────────────────────────────────
  var legendas = [].slice.call(document.querySelectorAll('.tut-legenda'));
  var barras = [].slice.call(document.querySelectorAll('.tut-barra i'));

  function quadro(agora) {
    if (!inicio) inicio = agora;
    var passado = agora - inicio;
    if (passado >= DURACAO) { inicio = agora; passado = 0; cena = (cena + 1) % CENAS; }
    t = passado / DURACAO;

    pintar();

    legendas.forEach(function (el, i) { el.classList.toggle('ativa', i === cena); });
    barras.forEach(function (el, i) {
      el.style.setProperty('--w', (i < cena ? 100 : i === cena ? t * 100 : 0) + '%');
    });

    if (rodando) requestAnimationFrame(quadro);
  }

  // Só anima quando está à vista: fora da tela, não gasta bateria de ninguém.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting && !rodando) { rodando = true; inicio = null; requestAnimationFrame(quadro); }
        else if (!e.isIntersecting) rodando = false;
      });
    }, { threshold: 0.15 }).observe(tela);
  }

  window.addEventListener('resize', medir);
  medir();
  requestAnimationFrame(quadro);
})();
