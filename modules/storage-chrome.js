var storage = (function () {
  var objs = {};

  chrome.storage.local.get(null, function (o) {
    objs = o;
    window.setTimeout(init, 0);
  });
  return {
    read: function (id) {
      return objs[id] + '';
    },
    write: function (id, data) {
      objs[id] = data;
      chrome.runtime.sendMessage({cmd: 'store', id: id, data: data});
    }
  };
})();
