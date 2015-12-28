'use strict';
// launcher
chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('data/panel/index.html', {
    id: 'main',
    bounds: {width: 500, height: 600}
  });
});
// storage
chrome.runtime.onMessage.addListener(function (request) {
  if (request.cmd === 'store') {
    var tmp = {};
    tmp[request.id] = request.data;
    chrome.storage.local.set(tmp, function () {});
  }
});
// welcome
chrome.storage.local.get('version', function (prefs) {
  let version = chrome.runtime.getManifest().version;
  if (prefs.version !== version) {
    chrome.browser.openTab({
      url: 'http://add0n.com/sudoku.html?type=' + (prefs.version ? 'update' : 'install') + '&version=' + version
    });
    chrome.storage.local.set({version}, function () {});
  }
});
