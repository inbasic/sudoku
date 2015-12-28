'use strict';

var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var change = require('gulp-change');
var babel = require('gulp-babel');
var gulpif = require('gulp-if');
var gulpFilter = require('gulp-filter');
var shell = require('gulp-shell');
var wait = require('gulp-wait');
var clean = require('gulp-clean');
var zip = require('gulp-zip');
var rename = require('gulp-rename');
var util = require('gulp-util');
var minify = require('gulp-minifier');
var gzip = require('gulp-gzip');
var runSequence = require('run-sequence');

var modules = (function (files) {
  var tmp = {};
  files.forEach(function (file) {
    var s = file.split('-')
    tmp[s[0]] = tmp[s[0]] || {};
    tmp[s[0]][s[1].replace('.js', '')] = fs.readFileSync(path.resolve('modules', file)).toString();
  });
  return tmp;
})(fs.readdirSync('modules'));

/* clean */
gulp.task('clean', function () {
  return gulp.src([
    'builds/unpacked/chrome/*',
    'builds/unpacked/androud/*',
    'builds/unpacked/www/*',
    'builds/unpacked/firefox/*',
  ], {read: false})
    .pipe(clean());
});
/* www build */
gulp.task('www-build', function () {
  gulp.src([
    'src/data/panel/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.path.indexOf('index.html') !== -1;
  }, change(function (content) {
    return content.replace('href="../icons/16.png"', 'href="http://cdn.add0n.com/icons/sudoku16.png"');
  })))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*module\\:' + name), modules[name].www || modules[name].default);
    }
    return content;
  })))
  .pipe(minify({
    minify: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyJS: true,
    minifyCSS: true
  }))
  .pipe(gulp.dest('builds/unpacked/www'))
  .pipe(gzip({gzipOptions: {level: 9}}))
  .pipe(gulp.dest('builds/unpacked/www'))
});
/* chrome build */
gulp.task('chrome-build', function () {
  gulp.src([
    'src/data/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*module\\:' + name), modules[name].chrome || modules[name].default);
    }
    return content;
  })))
  .pipe(gulp.dest('builds/unpacked/chrome/data'))

  gulp.src([
    'src/lib/chrome.js'
  ])
  .pipe(gulp.dest('builds/unpacked/chrome/lib'))

  gulp.src([
    'src/manifest.json'
  ])
  .pipe(gulp.dest('builds/unpacked/chrome'))
});
/* firefox build */
gulp.task('firefox-build', function () {
  gulp.src([
    'src/data/**/*'
  ])
  .pipe(gulpFilter(function (f) {
    if (f.relative.indexOf('.DS_Store') !== -1 || f.relative.indexOf('Thumbs.db') !== -1) {
      return false;
    }
    return true;
  }))
  .pipe(gulpif(function (f) {
    return f.relative.indexOf('.js') !== -1;
  }, change(function (content) {
    for (var name in modules) {
      content = content.replace(new RegExp('.*module\\:' + name), modules[name].firefox || modules[name].default);
    }
    return content;
  })))
  .pipe(gulp.dest('builds/unpacked/firefox/data'))

  gulp.src([
    'src/lib/firefox.js'
  ])
  .pipe(gulp.dest('builds/unpacked/firefox/lib'))

  gulp.src([
    'src/package.json'
  ])
  .pipe(gulp.dest('builds/unpacked/firefox'))
});
/* firefox pack */
gulp.task('firefox-pack', function () {
  gulp.src('')
  .pipe(wait(1000))
  .pipe(shell([
    'jpm xpi',
    'mv *.xpi ../../packed/firefox.xpi',
    'jpm post --post-url http://localhost:8888/'
  ], {
    cwd: './builds/unpacked/firefox'
  }))
  .pipe(shell([
    'zip firefox.xpi install.rdf icon.png icon64.png',
  ], {
    cwd: './builds/packed'
  }));
});

/* */
gulp.task('www', function (callback) {
  runSequence('clean', 'www-build', callback);
});
gulp.task('chrome', function (callback) {
  runSequence('clean', 'chrome-build', callback);
});
gulp.task('firefox', function (callback) {
  runSequence('clean', 'firefox-build', 'firefox-pack', callback);
});
