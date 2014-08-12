var gulp = require('gulp');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var bump = require('gulp-bump');
var shell = require('gulp-shell');
var rimraf = require('rimraf');

var dest = {
  build: "public/build",
  download: "public/zip"
};

gulp.task('clean', function() {
  gulp.src(dest.build, {
    read: false
  })
  .pipe(clean());
});

gulp.task('css', function() {
  gulp.src('public/local/auto/**/*.styl')
    .pipe(stylus())
    .pipe(autoprefixer("> 1%", "last 2 version"))
    .pipe(gulp.dest(dest.build))
    .pipe(concat('auto.all.css'))
    .pipe(gulp.dest(dest.build))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(minifycss())
    .pipe(gulp.dest(dest.build));

  gulp.src('public/local/auto/**/*.styl')
    .pipe(stylus())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(minifycss())
    .pipe(gulp.dest(dest.build));
});

gulp.task('js', function() {
  gulp.src('public/local/auto/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest(dest.build))
    .pipe(concat('auto.all.js'))
    .pipe(gulp.dest(dest.build))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dest.build));

  gulp.src('public/local/auto/**/*.js')
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dest.build));
});

gulp.task('bump', function() {
  gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));

  gulp.src('./bower.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('tag', function() {
  var pkg = require('./package.json');
  var v = pkg.version;
  var message = v;

  gulp.src('./')
    .pipe(shell([
      'git add -A',
      'git commit -m "' + v + '"',
      'git push',
      'git tag -a ' + v + ' -m "' + message + '"',
      "git push origin master --tags"
    ]));
});

gulp.task('zip', function() {
  var zip = require('gulp-zip');

  var pkg = require('./package.json');

  gulp.src(dest.build + '/**')
    .pipe(zip('auto.js-' + pkg.version + '.zip'))
    .pipe(gulp.dest(dest.download));
});

gulp.task('build', ['bump', 'css', 'js']);

gulp.task('drop-dist', function(cb){
  rimraf('./dist', cb);
});

gulp.task('bower', ['drop-dist'], function() {
  gulp.src(dest.build + "/**/*.*", {
    base: './public/build'
  }).pipe(gulp.dest('./dist'));
});
