(function () {
  var APP_STORE_URL = 'https://apps.apple.com/us/app/keyaudit-pro/id6829339296';
  var standalone =
    (window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
  var userAgent = window.navigator.userAgent || '';
  var ios =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && window.navigator.maxTouchPoints > 1);
  var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

  if (standalone) {
    window.location.replace(ios ? APP_STORE_URL : '/app/');
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').catch(function () {});
    });
  }

  if (!mobile) return;

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest
      ? event.target.closest('a[href]')
      : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    if (/(^|\/)app\.html(?:[?#].*)?$/.test(href)) {
      event.preventDefault();
      window.location.href = ios ? APP_STORE_URL : '/app/';
    }
  });

  window.addEventListener('appinstalled', function () {
    window.location.href = '/app/';
  });
})();
