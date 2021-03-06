/*
Author: Rumbiiha Swaibu
Website: doolbay.com
Email :admin@doolbay.com or rumbiihas@gmail.com
*/

// Load plugins
const browsersync = require('browser-sync').create();
const cache = require('gulp-cache');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const imagemin = require('gulp-imagemin');
const gulp = require('gulp');
const panini = require('panini');
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const concat = require('gulp-concat');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist',
    },
    port: 3000,
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}
// html tasks
function html() {
  return gulp
    .src('src/pages/**/*.html')
    .pipe(
      panini({
        root: 'src/pages/',
        layouts: 'src/layouts/',
        partials: 'src/partials/',
        helpers: 'src/helpers/',
        data: 'src/data/',
      }),
    )
    .pipe(gulp.dest('./dist'));
}
// reset page
function htmlReset(done) {
  panini.refresh();
  done();
}

// Clean dist
function clean() {
  return del(['./dist/']);
}

function modules() {
  // Bootstrap JS

  const webfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/*').pipe(gulp.dest('./dist/assets/webfonts/'));

  const jquery = gulp
    .src(['./node_modules/jquery/dist/jquery.slim.min.js', './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('./dist/assets/js'));
  const bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/bootstrap.min.js').pipe(gulp.dest('./dist/assets/bootstrap/js'));

  return merge(bootstrapJS, webfonts, jquery);
}

// CSS task
function styles() {
  return gulp
    .src('./src/assets/scss/**/*.scss')
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'expanded',
        includePaths: './node_modules',
      }),
    )
    .on('error', sass.logError)
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browsersync.stream());
}

// media tasks
function images() {
  return gulp
    .src('src/assets/images/**/*.+(png|jpg|jpeg|gif|ico|webp|svg)')
    .pipe(
      cache(
        imagemin([
          imagemin.gifsicle({
            interlaced: true,
          }),
          imagemin.mozjpeg({
            progressive: true,
          }),
          imagemin.optipng({
            optimizationLevel: 5,
          }),
        ]),
      ),
    )
    .pipe(gulp.dest('dist/assets/images/'));
}

// JS task
function appJs() {
  return gulp.src('./src/assets/js/**/*').pipe(gulp.dest('./dist/assets/js')).pipe(browsersync.stream());
}

// JS task
function icons() {
  return gulp.src('./src/assets/icons/**/*').pipe(gulp.dest('./dist/assets/icons')).pipe(browsersync.stream());
}
// JS task
function cname() {
  return gulp.src('./src/pages/CNAME').pipe(gulp.dest('./dist')).pipe(browsersync.stream());
}

function vendors() {
  return gulp.src('./src/assets/vendors/**/*').pipe(gulp.dest('./dist/assets/vendors')).pipe(browsersync.stream());
}
// watch tasks
function watchfiles() {
  gulp.watch('./src/assets/scss/**/*', gulp.series(htmlReset, styles, browserSyncReload));
  gulp.watch('src/pages/**/**/*', html);
  gulp.watch('src/assets/images/**/*', images);
  gulp.watch('src/assets/js/**/*', appJs);
  gulp.watch('src/{layouts,includes,helpers,partials,data}/**/**/*', gulp.series(htmlReset, html, browserSyncReload));
}
const build = gulp.series(clean, gulp.parallel(
  html, styles, vendors, modules, appJs, images, icons, cname,
));
exports.default = gulp.series(build, gulp.parallel(browserSync, watchfiles));
