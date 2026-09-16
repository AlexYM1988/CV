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

  function syncToggleLabel() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', currentTheme() === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
  }

  // Инлайн-скрипт в <head> мог восстановить тему из localStorage до отрисовки,
  // поэтому подпись кнопки приводим в соответствие с реальным состоянием сразу.
  syncToggleLabel();

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* приватный режим — тема живёт до перезагрузки */ }
      syncToggleLabel();
    });
  }

  // Системная тема сменилась, а вручную ничего не выбрано — обновляем подпись.
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSchemeChange = function () { if (!root.getAttribute('data-theme')) syncToggleLabel(); };
    if (mq.addEventListener) mq.addEventListener('change', onSchemeChange);
    else if (mq.addListener) mq.addListener(onSchemeChange);
  }

  /* ---------- Липкая шапка ---------- */
  // Шапка всегда в DOM и всегда фиксирована: над первым экраном она прозрачная
  // и показывает только переключатель темы, ниже — становится полноценной.
  // Через hidden делать нельзя: переключатель темы был бы недостижим на первом
  // экране, а появление блока дёргало бы вёрстку.
  var topbar = document.getElementById('topbar');
  var sentinel = document.getElementById('hero-end');

  if (topbar && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      // Полная шапка нужна только когда метка конца первого экрана ушла ВВЕРХ
      // за вьюпорт. Одного isIntersecting мало: в самом верху страницы метка
      // ещё ниже сгиба и тоже не пересекается.
      var passed = !e.isIntersecting && e.boundingClientRect.top <= 0;
      topbar.classList.toggle('topbar--bare', !passed);
    }, { rootMargin: '0px' }).observe(sentinel);
  } else if (topbar) {
    topbar.classList.remove('topbar--bare');
  }

  /* ---------- Кейс раскрывается по прямой ссылке (#case-gov-650) ---------- */
  function openFromHash() {
    var id = window.location.hash.slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var d = el.tagName === 'DETAILS' ? el : el.querySelector('details');
    if (!d) return;
    d.open = true;
    // Скроллим к карточке целиком, а не к раскрывашке, иначе заголовок
    // кейса уезжает за верх экрана.
    el.scrollIntoView({ block: 'start' });
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* ---------- Печать ---------- */
  var printBtn = document.getElementById('print-btn');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  // В PDF все кейсы должны быть раскрыты, после печати — вернуть как было.
  // Состояние запоминается прямо на элементе: при повторной печати общий
  // массив разъехался бы с набором details.
  window.addEventListener('beforeprint', function () {
    var list = document.querySelectorAll('details');
    for (var i = 0; i < list.length; i++) {
      if (!list[i].hasAttribute('data-was-open')) {
        list[i].setAttribute('data-was-open', list[i].open ? '1' : '0');
      }
      list[i].open = true;
    }
  });

  window.addEventListener('afterprint', function () {
    var list = document.querySelectorAll('details');
    for (var i = 0; i < list.length; i++) {
      var was = list[i].getAttribute('data-was-open');
      if (was !== null) {
        list[i].open = was === '1';
        list[i].removeAttribute('data-was-open');
      }
    }
  });
})();
