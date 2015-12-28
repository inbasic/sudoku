'use strict';

var sp = require('sdk/simple-prefs');
var timers = require('sdk/timers');
var tabs = require('sdk/tabs');
var self = require('sdk/self');
var unload = require('sdk/system/unload');
var platform = require('sdk/system').platform;
var desktop = ['winnt', 'linux', 'darwin', 'openbsd'].indexOf(platform) !== -1;
var {Cu} = require('chrome');

var {Services} = Cu.import('resource://gre/modules/Services.jsm');

function getNativeWindow() {
  let window = Services.wm.getMostRecentWindow('navigator:browser');
  return window.NativeWindow;
}
function close () {
  for (let tab of tabs) {
    if (tab && (tab.url || '').indexOf(self.data.url('')) === 0) {
      tab.close();
    }
  }
}

if (desktop) {
  var utils = require('sdk/window/utils');
  var win;
  unload.when(function () {
    if (win && !Cu.isDeadWrapper(win)) {
      win.close();
    }
  });
  require('sdk/ui/button/action').ActionButton({
    id: 'sudoku',
    label: 'Sudoku',
    icon: {
      '16': './icons/16.png',
      '32': './icons/32.png',
      '64': './icons/64.png'
    },
    onClick: function () {
      win = utils.openDialog({
        url: self.data.url('panel/index.html'),
        features: 'chrome,centerscreen,resizable,width=500,height=600',
        name: 'Sudoku'
      });
      win.focus();
    }
  });
}
else {
  var id = getNativeWindow().menu.add('Sudoku', null, function () {
    close();
    tabs.open(self.data.url('panel/index.html'));
  });
  unload.when(function () {
    getNativeWindow().menu.remove(id);
    close();
  });
}

exports.main = function (options) {
  if (options.loadReason === 'install' || options.loadReason === 'startup') {
    var version = sp.prefs.version;
    if (self.version !== version) {
      timers.setTimeout(function () {
        tabs.open(
          'http://add0n.com/sudoku.html?v=' + self.version +
          (version ? '&p=' + version + '&type=upgrade' : '&type=install')
        );
      }, 3000);
      sp.prefs.version = self.version;
    }
  }
};
