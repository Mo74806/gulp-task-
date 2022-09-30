const gulp = require("gulp");
const { src, dest, watch, parallel, series } = require("gulp");
const replace = require("gulp-replace");
var cleanCss = require("gulp-clean-css");
const removeDuplicateLines = require("gulp-remove-duplicate-lines");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
var browserSync = require("browser-sync");

var globs = {
  html: "project/*.html",
  css: "project/css/**/*.css",
  img: "project/pics/*",
  js: "project/js/**/*.js",
};

function minifyHTML() {
  return src(globs.html)
    .pipe(
      replace(/css\/([^"]*)/g, function () {
        return "./assets/css/style.min.css";
      })
    )
    .pipe(
      replace(/js\/([^"]*)/g, function () {
        return "./assets/js/all.min.js";
      })
    )
    .pipe(
      replace(/pics\/([^"]*)/g, function (imagePath) {
        return "dist/" + imagePath;
      })
    )
    .pipe(removeDuplicateLines({ include: /\<script/g }))
    .pipe(removeDuplicateLines({ include: /\<link/g }))
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest("dist"));
}

function minifyCSS() {
  return src(globs.css)
    .pipe(concat("style.min.css"))
    .pipe(cleanCss())
    .pipe(dest("dist/assets/css"));
}

function minifyJS() {
  return src(globs.js, { sourcemaps: true })
    .pipe(concat("all.min.js"))
    .pipe(terser())
    .pipe(dest("dist/assets/js"));
}

function minifyImage() {
  return src("project/pics/*").pipe(imagemin()).pipe(dest("dist/assets"));
}

exports.img = minifyImage;
function serve(cb) {
  browserSync({
    server: {
      baseDir: "dist/",
    },
  });
  cb();
}

function reloadTask(done) {
  browserSync.reload();
  done();
}
function watchTask() {
  watch(globs.html, series(minifyHTML, reloadTask));
  watch(globs.js, series(minifyJS, reloadTask));
  watch(globs.css, series(minifyCSS, reloadTask));
  watch(globs.img, series(minifyImage, reloadTask));
}
exports.default = series(
  parallel(minifyHTML, minifyJS, minifyCSS, minifyImage),
  serve,
  watchTask
);
