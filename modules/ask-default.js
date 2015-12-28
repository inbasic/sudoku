var ask =  function (msg, callback) {
  if (window.confirm(msg)) {
    callback();
  }
};
