/*
  KeyAudit Pro - Google Ads / GA4 tracking.

  SETUP
  1. Create the Google Ads account and a GA4 property.
  2. Paste the IDs into CONFIG below.
  3. Create the conversion actions in Google Ads, then paste their labels.
  4. Deploy this file and the pages that include it.

  While the IDs are blank this file does nothing: no script is loaded,
  no cookies are set, and no network requests are made.
*/
(function (window, document) {
  'use strict';

  var CONFIG = {
    // Google Ads tag, e.g. 'AW-123456789'
    adsId: 'AW-18596803259',
    // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'
    ga4Id: '',
    // Conversion labels from Google Ads > Goals > Conversions > Tag setup
    conversionLabels: {
      // Fires once when a paid license is successfully issued on license.html
      purchase: '',
      // Optional: fires when the Stripe checkout form is ready
      beginCheckout: '',
    },
    currency: 'USD',
  };

  var state = { started: false };

  function isConfigured() {
    return Boolean(CONFIG.adsId || CONFIG.ga4Id);
  }

  function start() {
    if (state.started || !isConfigured()) return;
    state.started = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    var primaryId = CONFIG.adsId || CONFIG.ga4Id;
    var script = document.createElement('script');
    script.async = true;
    script.src =
      'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryId);
    document.head.appendChild(script);

    if (CONFIG.adsId) window.gtag('config', CONFIG.adsId);
    if (CONFIG.ga4Id) window.gtag('config', CONFIG.ga4Id);
  }

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function claim(key, storage) {
    var store = storage || window.localStorage;
    try {
      if (store.getItem(key)) return false;
      store.setItem(key, '1');
      return true;
    } catch (error) {
      return true;
    }
  }

  function toNumber(value) {
    var number = Number(value);
    return isFinite(number) && number >= 0 ? number : null;
  }

  function track(eventName, params) {
    if (!isConfigured()) return false;
    start();
    window.gtag('event', eventName, params || {});
    return true;
  }

  function beginCheckout(details) {
    if (!isConfigured()) return false;
    // Once per browser session: checkout can mount more than once per visit.
    if (!claim('kap:ads:begin_checkout', window.sessionStorage)) return false;
    start();

    var value = toNumber(details && details.value);
    var currency = (details && details.currency) || CONFIG.currency;

    if (CONFIG.adsId && CONFIG.conversionLabels.beginCheckout) {
      var conversion = {
        send_to: CONFIG.adsId + '/' + CONFIG.conversionLabels.beginCheckout,
      };
      if (value !== null) {
        conversion.value = value;
        conversion.currency = currency;
      }
      window.gtag('event', 'conversion', conversion);
    }

    var event = { currency: currency };
    if (value !== null) event.value = value;
    window.gtag('event', 'begin_checkout', event);
    return true;
  }

  function purchase(details) {
    if (!isConfigured()) return false;

    var transactionId =
      details && details.transactionId ? String(details.transactionId) : '';
    if (transactionId && !claim('kap:ads:purchase:' + transactionId)) {
      return false;
    }

    start();

    var value = toNumber(details && details.value);
    var currency = (details && details.currency) || CONFIG.currency;
    var label = CONFIG.conversionLabels.purchase;

    if (CONFIG.adsId && label) {
      var conversion = {
        send_to: CONFIG.adsId + '/' + label,
        transaction_id: transactionId,
      };
      if (value !== null && value > 0) {
        conversion.value = value;
        conversion.currency = currency;
      }
      window.gtag('event', 'conversion', conversion);
    }

    var event = { transaction_id: transactionId, currency: currency };
    if (value !== null && value > 0) event.value = value;
    window.gtag('event', 'purchase', event);
    return true;
  }

  window.KeyAuditAds = {
    config: CONFIG,
    isConfigured: isConfigured,
    beginCheckout: beginCheckout,
    purchase: purchase,
    track: track,
  };

  if (isConfigured()) start();
})(window, document);
