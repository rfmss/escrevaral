(function () {
  'use strict';
  if (location.protocol !== 'https:' && location.protocol !== 'http:') { return; }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(function () {});
  }
}());
