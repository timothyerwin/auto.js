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
var nodemon = require('gulp-nodemon');
var jeet = require('jeet');
var rupture = require('rupture');
var nib = require('nib');

var dest = {
  build: "public/autojs",
  download: "public/zip"
};

gulp.task('clean', function () {
  gulp.src(dest.build, {
      read: false
    })
    .pipe(clean());
});

gulp.task('css', function () {
  gulp.src('public/**/*.styl', {
    base: './'
  })
    .pipe(stylus({
      use: [nib(), jeet(), rupture()]
    }))
    .pipe(autoprefixer("> 1%", "last 2 version"))
    .pipe(gulp.dest('./'))
});

gulp.task('auto', function () {
  gulp.src('dev/auto/**/*.styl')
    .pipe(stylus({
      use: [nib(), jeet(), rupture()]
    }))
    .pipe(autoprefixer("> 1%", "last 2 version"))
    .pipe(gulp.dest(dest.build))
    .pipe(concat('auto.all.css'))
    .pipe(gulp.dest(dest.build))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(minifycss())
    .pipe(gulp.dest(dest.build));

  gulp.src('dev/auto/**/*.styl')
    .pipe(stylus({
      use: [nib(), jeet(), rupture()]
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(minifycss())
    .pipe(gulp.dest(dest.build));

  gulp.src('dev/auto/**/*.js')
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

  gulp.src('dev/auto/**/*.js')
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest(dest.build));
});

gulp.task('bump', function () {
  gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));

  gulp.src('./bower.json')
    .pipe(bump())
    .pipe(gulp.dest('./'));
});

gulp.task('tag', function () {
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

gulp.task('zip', function () {
  var zip = require('gulp-zip');

  var pkg = require('./package.json');

  gulp.src(dest.build + '/**')
    .pipe(zip('auto.js.zip'))
    .pipe(gulp.dest(dest.download));
});

gulp.task('build', ['bump', 'auto']);

gulp.task('drop-dist', function (cb) {
  rimraf('./dist', cb);
});

gulp.task('bower', ['drop-dist'], function () {
  gulp.src(dest.build + "/**/*.*", {
    base: './public/build'
  }).pipe(gulp.dest('./dist'));
});

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
});

gulp.task('default', ['auto', 'css'], function () {

  gulp.watch('dev/**/*.*', ['auto']);
  gulp.watch('public/**/*.styl', ['css']);

  nodemon({
    script: 'server.js',
    ignore: ["public/*", "node_modules/*", ".git/*", "dev/*"]
  }).on('change', ['lint'])
})
