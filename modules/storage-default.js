var storage = (function () {
  window.setTimeout(init, 1);
  return {
    read: function (id) {
      return window.localStorage.getItem(id);
    },
    write: function (id, data) {
      window.localStorage.setItem(id, data);
    }
  };
})();
