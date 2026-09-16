/* Сайт-визитка: тема, липкая шапка, кейс по ссылке, печать. Без зависимостей. */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Переключатель темы ---------- */
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* приватный режим — тема живёт до перезагрузки */ }
      toggle.setAttribute('aria-label', next === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    });
  }

  /* ---------- Липкая шапка появляется после первого экрана ---------- */
  var topbar = document.getElementById('topbar');
  var sentinel = document.getElementById('hero-end');

  if (topbar && sentinel && 'IntersectionObserver' in window) {
    // Показываем шапку только когда метка конца первого экрана ушла ВВЕРХ за вьюпорт.
    // Проверка isIntersecting в одиночку не годится: в самом верху страницы метка ещё
    // не видна (она ниже сгиба), и шапка появилась бы поверх героя.
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      topbar.hidden = e.isIntersecting || e.boundingClientRect.top > 0;
    }, { rootMargin: '0px' }).observe(sentinel);
  } else if (topbar) {
    topbar.hidden = false;
  }

  /* ---------- Кейс раскрывается по прямой ссылке (#case-gov-650) ---------- */
  function openFromHash() {
    var id = window.location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      el.scrollIntoView({ block: 'start' });
    }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Печать ---------- */
  var printBtn = document.getElementById('print-btn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  // В PDF все кейсы должны быть раскрыты, после печати — вернуть как было.
  var wasOpen = [];
  window.addEventListener('beforeprint', function () {
    wasOpen = [];
    document.querySelectorAll('details').forEach(function (d) {
      wasOpen.push(d.open);
      d.open = true;
    });
  });
  window.addEventListener('afterprint', function () {
    document.querySelectorAll('details').forEach(function (d, i) {
      if (wasOpen.length) d.open = wasOpen[i];
    });
  });
})();
