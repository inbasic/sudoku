var ask = (function (parent, callback) {
  window.addEventListener('keyup', function (e) {
    if (e.keyCode === 27) {
      parent.style.display = 'none';
    }
  });
  parent.addEventListener('click', function (e) {
    var target = e.target;
    var cmd = target.dataset.cmd;
    if (cmd === 'ok') {
      callback();
    }
    if (cmd) {
      parent.style.display = 'none';
    }
  });
  return function (msg, c) {
    callback = c;
    parent.querySelector('p').textContent = msg;
    parent.style.display = 'flex';
  };
})(document.querySelector('body>span'));
