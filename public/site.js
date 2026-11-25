(function () {
  // Atualizar a página (F5) volta sempre ao topo, mesmo com #âncora no endereço. Links e "voltar" seguem normais.
  var nav = window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (nav && nav.type === 'reload') {
    // 'manual' fica valendo só para esta entrada do histórico; voltar para 'auto' no load deixava o navegador restaurar depois
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    // tira a #âncora do endereço antes do navegador pular até ela
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
    var top = function () { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }; // sem a rolagem suave do html
    document.addEventListener('DOMContentLoaded', top);
    window.addEventListener('load', function () { top(); requestAnimationFrame(top); });
  }

  // Cabeçalho fixo: guarda a altura dele em --header-h para a primeira faixa da página começar por baixo.
  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.querySelector('.site-header');
    if (!wrap) return;
    function update() { document.documentElement.style.setProperty('--header-h', wrap.getBoundingClientRect().height + 'px'); }
    window.addEventListener('resize', update);
    update();
  });


  // Fotos em .media-fit: a foto fica inteira (contain) e o espaço que sobra é preenchido com as cores
  // da própria borda dela. Foto mais estreita que a caixa: usa as colunas da esquerda/direita.
  // Foto mais larga (ex.: embalagens): usa a primeira e a última linha para construir o topo e a base.
  document.addEventListener('DOMContentLoaded', function () {
    [].forEach.call(document.querySelectorAll('.media-fit .ds-feature > .ds-media img'), function (img) {
      var N = 16, d = null; // foto reduzida a 16x16: cada pixel já é a média de uma região
      function read() {
        var c = document.createElement('canvas'); c.width = N; c.height = N;
        var ctx = c.getContext('2d');
        try { ctx.drawImage(img, 0, 0, N, N); d = ctx.getImageData(0, 0, N, N).data; }
        catch (e) { d = null; } // imagem de outro domínio: fica a cor padrão do CSS
      }
      function line(dir, fixed, isRow) { // degradê com os pixels de uma linha ou coluna da borda
        var stops = [];
        for (var k = 0; k < N; k++) {
          var i = ((isRow ? fixed * N + k : k * N + fixed)) * 4;
          stops.push('rgb(' + d[i] + ' ' + d[i + 1] + ' ' + d[i + 2] + ') ' + (k / (N - 1) * 100).toFixed(1) + '%');
        }
        return 'linear-gradient(' + dir + ',' + stops.join(',') + ')';
      }
      function paint() {
        if (!d) return;
        var box = img.parentNode.getBoundingClientRect();
        var wide = img.naturalWidth / img.naturalHeight > box.width / box.height;
        img.parentNode.style.setProperty('--edge-bg', wide
          ? line('to right', 0, true) + ' top/100% 50.5% no-repeat,' + line('to right', N - 1, true) + ' bottom/100% 50.5% no-repeat'
          : line('to bottom', 0, false) + ' left/50.5% 100% no-repeat,' + line('to bottom', N - 1, false) + ' right/50.5% 100% no-repeat');
      }
      function start() { read(); paint(); window.addEventListener('resize', paint); }
      if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start);
    });
  });

  // Galeria da página de compra: miniatura leva à foto; arrastar a foto marca a miniatura certa.
  document.addEventListener('DOMContentLoaded', function () {
    var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    [].forEach.call(document.querySelectorAll('[data-gallery]'), function (g) {
      var track = g.querySelector('.gallery__track');
      var thumbs = [].slice.call(g.querySelectorAll('.gallery__thumb'));
      function mark(i) { thumbs.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); }); }
      thumbs.forEach(function (t, i) {
        t.addEventListener('click', function () { track.scrollTo({ left: i * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' }); mark(i); });
      });
      track.addEventListener('scroll', function () { mark(Math.round(track.scrollLeft / track.clientWidth)); }, { passive: true });
    });
  });

  // Linha que arrasta (.rail): setas andam um cartão por vez e apagam quando chega no fim.
  document.addEventListener('DOMContentLoaded', function () {
    var smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    [].forEach.call(document.querySelectorAll('.rail'), function (rail) {
      var grid = rail.querySelector('.site-grid--rail');
      var prev = rail.querySelector('[data-rail="prev"]');
      var next = rail.querySelector('[data-rail="next"]');
      if (!grid || !prev || !next) return;
      function step(dir) {
        var card = grid.firstElementChild;
        var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
        grid.scrollBy({ left: dir * (card ? card.getBoundingClientRect().width + gap : grid.clientWidth), behavior: smooth ? 'smooth' : 'auto' });
      }
      function update() {
        var max = grid.scrollWidth - grid.clientWidth;
        prev.disabled = grid.scrollLeft <= 1;
        next.disabled = grid.scrollLeft >= max - 1;
        rail.classList.toggle('rail--fits', max <= 1);
      }
      prev.addEventListener('click', function () { step(-1); });
      next.addEventListener('click', function () { step(1); });
      grid.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    });
  });

  // Revelar ao rolar: o título entra palavra por palavra; quando termina, o resto do bloco
  // aparece por baixo em cascata. Sem JS ou com "reduzir movimento", tudo fica visível.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  document.documentElement.classList.add('js-reveal'); // só agora o CSS esconde o que vai ser revelado

  var TITLES = '.ds-hero__title, .ds-feature__title, .t-title';
  var GROUPS = '.site-grid, .ds-cols, .ds-rows, .stack-sm, .shop'; // revelados item a item
  var WORD_STEP = 70, WORD_TIME = 900, ITEM_STEP = 110;

  function expand(el) {
    if (el.matches(GROUPS)) return [].slice.call(el.children).reduce(function (a, c) { return a.concat(expand(c)); }, []);
    return [el];
  }
  function splitWords(title) {
    var words = title.textContent.trim().split(/\s+/);
    title.textContent = '';
    words.forEach(function (w, i) {
      var outer = document.createElement('span'); outer.className = 'reveal-word';
      var inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--w', i);
      outer.appendChild(inner); title.appendChild(outer);
      if (i < words.length - 1) title.appendChild(document.createTextNode(' '));
    });
    return words.length;
  }
  function mark(el) { el.classList.add('reveal'); return el; }

  document.addEventListener('DOMContentLoaded', function () {
    var pending = [];
    function show(title) {
      var u = title._reveal;
      title.classList.add('is-in');
      u.pre.forEach(function (el) { el.classList.add('is-in'); });
      // o restante só começa quando a última palavra do título termina de entrar
      var wait = (u.words - 1) * WORD_STEP + WORD_TIME * 0.6;
      u.post.forEach(function (el, i) { el.style.transitionDelay = (wait + i * ITEM_STEP) + 'ms'; el.classList.add('is-in'); });
    }
    // dispara quando o título passa da linha a 88% da altura da tela (ou se já foi rolado para cima dela).
    // Checa direto no evento de rolagem: são poucos títulos e a lista esvazia conforme eles aparecem.
    function check() {
      if (!pending.length) return;
      var line = window.innerHeight * 0.88;
      pending = pending.filter(function (t) {
        if (t.getBoundingClientRect().top < line) { show(t); return false; }
        return true;
      });
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);

    [].slice.call(document.querySelectorAll('main .ds-section__in')).forEach(function (inner) {
      var titles = [].slice.call(inner.querySelectorAll(TITLES));
      var tops = [].slice.call(inner.children);
      titles.forEach(function (title) {
        var u = { words: splitWords(title), pre: [], post: [] };
        var parent = title.parentElement, sib;
        for (sib = title.previousElementSibling; sib; sib = sib.previousElementSibling) u.pre.push(mark(sib));
        for (sib = title.nextElementSibling; sib; sib = sib.nextElementSibling) u.post = u.post.concat(expand(sib).map(mark));
        // feature: a imagem ao lado do texto entra junto com o restante
        if (parent.classList.contains('ds-feature__text')) for (sib = parent.nextElementSibling; sib; sib = sib.nextElementSibling) u.post.push(mark(sib));
        // blocos seguintes da faixa, até o próximo título, pertencem a este título
        var top = tops.find(function (t) { return t.contains(title); });
        if (top) {
          for (sib = top.nextElementSibling; sib && !sib.querySelector(TITLES) && !sib.matches(TITLES); sib = sib.nextElementSibling) {
            u.post = u.post.concat(expand(sib).map(mark));
          }
        }
        // imagens (e cards com imagem) entram junto com o título, não depois dele
        var hasImg = function (el) { return el.matches('.ds-media') || !!el.querySelector('.ds-media'); };
        u.pre = u.pre.concat(u.post.filter(hasImg));
        u.post = u.post.filter(function (el) { return !hasImg(el); });
        title.classList.add('reveal-title');
        title._reveal = u;
        pending.push(title);
      });
    });
    check();
  });

})();
