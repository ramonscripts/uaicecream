(function () {
  // Cabeçalho "sem fundo": a camada clara fica embaixo e a escura por cima, recortada na
  // altura exata das faixas escuras (.ds-section--dark e rodapé) que passam atrás dele.
  document.addEventListener('DOMContentLoaded', function () {
    var wrap = document.querySelector('.site-header');
    if (!wrap) return;
    var dark = wrap.querySelector('.site-header__dark');
    var zones = [].slice.call(document.querySelectorAll('.ds-section--dark, .ds-footer'));
    var ticking = false;
    function update() {
      ticking = false;
      var h = wrap.getBoundingClientRect().height; // altura exata, sem arredondar (evita um fio escuro na borda)
      document.documentElement.style.setProperty('--header-h', h + 'px');
      var clip = null;
      var dpr = window.devicePixelRatio || 1;
      var snap = function (v) { v = Math.round(v * dpr) / dpr; return v < 1 ? 0 : (h - v < 1 ? h : v); }; // pixel físico, sem fio de meio pixel nas bordas
      for (var i = 0; i < zones.length; i++) {
        var r = zones[i].getBoundingClientRect();
        var t = snap(Math.max(0, Math.min(h, r.top))), b = snap(Math.max(0, Math.min(h, r.bottom)));
        if (b > t) { clip = 'inset(' + t + 'px 0 ' + (h - b) + 'px 0)'; break; }
      }
      // nada escuro atrás: esconde a camada escura de vez, em vez de recortar até zero
      dark.style.visibility = clip ? 'visible' : 'hidden';
      if (clip) dark.style.clipPath = clip;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
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
