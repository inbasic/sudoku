/* global sudoku */
'use strict';

var editor = document.getElementById('editor');
var ginput = document.getElementById('guide');

var selected = '';
var puzzle = {};
var uPuzzle = {};

var ask = function () {}; // module:ask
var storage = (function (){init()})(); // module:storage

function guide () {
  if (!ginput.checked) {
    return;
  }
  var p = Object.assign({}, uPuzzle);
  p = Object.assign(p, puzzle);
  var conflicts = sudoku.getConflicts(p);
  [].forEach.call(document.querySelectorAll('[data-id]'), function (td) {
    td.classList.remove('error');
    td.classList.remove('guide');
  });
  conflicts.forEach(function (obj) {
    obj.errorFields.forEach(function (id) {
      document.querySelector('[data-id=' + id + ']').classList.add('error');
    });
    obj.unit.forEach(function (id) {
      document.querySelector('[data-id=' + id + ']').classList.add('guide');
    });
  });
}

function set (id, value, type) {
  type = type || 'user';
  var elem = document.querySelector('[data-id=' + id + ']');
  elem.textContent = value || '.';
  elem.dataset.type = type;
  if (type === 'system') {
    puzzle[id] = value;
  }
  else {
    if (value) {
      uPuzzle[id] = value;
    }
    else {
      delete uPuzzle[id];
    }
  }
}

function restore () {
  [].forEach.call(document.querySelectorAll('[data-id]'), function (td) {
    td.textContent = '.';
    td.dataset.type = 'user';
  });
  Object.keys(puzzle).forEach(function (key) {
    set(key, puzzle[key], 'system');
  });
  Object.keys(uPuzzle).forEach(function (key) {
    set(key, uPuzzle[key], 'user');
  });
  guide();
}

function blur () {
  if (!selected) {
    return;
  }
  if (editor.value) {
    var value = Math.min(editor.value, 9);
    value = Math.max(value, 1);
    set(selected, value, 'user');
  }
  else {
    set(selected, null, 'user');
  }
  guide();
}
editor.addEventListener('blur', blur, false);
editor.addEventListener('keypress', function () {
  this.select();
}, false);
document.querySelector('form').addEventListener('keydown', function (e) {
  if (e.keyCode === 13 || e.keyCode === 9) {
    blur();
    e.preventDefault();
  }
}, true);

document.addEventListener('click', function (e) {
  var target = e.target;
  var id = target.dataset.id;
  if (id) {
    selected = id;
    editor.value = uPuzzle[id] || '';
    target.appendChild(editor);
    window.setTimeout(function () {
      editor.focus();
      editor.select();
    }, 100);
  }
}, true);

function reset () {
  puzzle = sudoku.generate();
  uPuzzle = {};
}

(function (button) {
  button.addEventListener('click', function () {
    ask('Are you sure you want to discard the current game?', function () {
      reset();
      restore();
    });
  });
})(document.getElementById('reset'));
(function (button) {
  button.addEventListener('click', function () {
    ask('Are you sure you want to give up?', function () {
      var tmp = sudoku.solve(puzzle);
      Object.keys(puzzle).forEach(function (key) {
        delete tmp[key];
      });
      uPuzzle = tmp;
      selected = '';
      restore();
    });
  });
})(document.getElementById('solve'));
ginput.addEventListener('change', function () {
  storage.write('guide', this.checked);
  if (this.checked) {
    guide();
  }
  else {
    [].forEach.call(document.querySelectorAll('[data-id]'), function (td) {
      td.classList.remove('error');
      td.classList.remove('guide');
    });
  }
});

function init () {
  (function (p) {
    if (p) {
      try {
        puzzle = JSON.parse(p);
      }
      catch (e) {}
    }
  })(storage.read('puzzle'));
  (function (p) {
    if (p) {
      try {
        uPuzzle = JSON.parse(p);
      }
      catch (e) {}
    }
  })(storage.read('uPuzzle'));

  if (storage.read('guide') === 'true') {
    ginput.checked = true;
  }
  if (Object.keys(puzzle).length === 0) {
    reset();
  }
  restore();
}
// unload
(function (callback) {
  if (typeof chrome !== 'undefined') {
    chrome.app.window.getAll()[0].onClosed.addListener(callback);
  }
  else {
    window.onunload = callback;
  }
})(function () {
  blur();
  storage.write('puzzle', JSON.stringify(puzzle));
  storage.write('uPuzzle', JSON.stringify(uPuzzle));
});
