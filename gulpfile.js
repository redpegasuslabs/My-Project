// Initialize Modules
const { src, dest, watch, series, parallel } = require('gulp');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const lineec = require('gulp-line-ending-corrector');
const changed = require('gulp-changed'); 
const htmlmin = require('gulp-htmlmin'); 
const browserSync = require('browser-sync').create();
reload = browserSync.reload;

// File Path Variables
const files = {
    scssAppPath: 'app/scss/**/*.scss',
    jsAppPath: 'app/js/**/*.js',
    imgAppPath: 'app/img/**/*.{jpg,png,gif,svg}',
    scssDistPath: 'dist/style',
    jsDistPath: 'dist/js',
    imgDistPath: 'dist/img',
    htmlAppPath: '*.html',
    buildPath: 'final-build/'
}

// Sass Task
function scssTask(){
    return src(files.scssAppPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(concat('style.min.css'))
    .pipe(postcss([ autoprefixer(), cssnano() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(files.scssDistPath));
}

// JS Task
function jsTask(){
    return src(files.jsAppPath)
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(lineec())
    .pipe(dest(files.jsDistPath));
}

// Cachebusting Task
const cbstring = new Date().getTime();
function cachebustTask(){
    return src(['*.html'])
        .pipe(replace(/cb=\d+/g, 'cb=' + cbstring))
        .pipe(dest('.'));
}

// Image Minify Task
function imgMinifyTask(){
    return src(files.imgAppPath)
    .pipe(changed(files.imgDistPath))
    .pipe(imagemin())
    .pipe(dest(files.imgDistPath))
}

// Watch Task
function watchTask(){
    browserSync.init ({
        server: {
            baseDir: './'
        }
          })
    watch(files.scssAppPath, parallel(scssTask));
    watch(files.jsAppPath, parallel(jsTask));
    watch(files.imgAppPath, parallel(imgMinifyTask));
    watch(['./*.html', files.scssDistPath, files.jsDistPath, files.imgDistPath]).on('change', browserSync.reload);
}

// Default Task
exports.default = series(
    parallel(scssTask, jsTask),
    cachebustTask,
    imgMinifyTask,
    watchTask
);

// HTML Minify Task (For Final Build Only)
function htmlMinifyTask(){
    return src(files.htmlAppPath)
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest(files.buildPath))
}

// Migration Task (For Final Build Only)
function migrationTask(){
    return src('dist/**')
    .pipe(dest(files.buildPath + 'dist/'))
}

// Final Build Creation (For Final Build Only)
exports.build = series(htmlMinifyTask, migrationTask);