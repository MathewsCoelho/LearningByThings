/* === CONFIG === */

const project     = 'LearningByThings'; // Pasta do Projeto
const projectName = 'LearningByThings'; // Nome do projeto sem espaço
const tinyKey     = 'RRsNOOTwnj4BJk6PhWOnkKCdEEoEFoSZ'; // Key TinyPNG

/* === COMMANDS === */

// SERVIDOR                   - gulp server
// SPRITE                     - gulp sprite 
// IMAGEM COMPRESS LOSSESS    - gulp build-img
// FINALIZAÇÃO                - gulp build-finish

/* === INIT === */

var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    htmlReplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify'),
    cssnano = require('gulp-cssnano'),
    usemin = require('gulp-usemin'),
    cssmin = require('gulp-cssmin'),
    htmlmin = require('gulp-htmlmin'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    merge = require('merge-stream'),
    spritesmith = require('gulp.spritesmith'),
    tinypng = require('gulp-tinypng'),
    revReplace = require('gulp-rev-replace'),
    rev = require('gulp-rev'),
    revdel = require('gulp-rev-delete-original'),
    sequence = require('gulp-sequence'),
    concat = require('gulp-concat'),
    browserSync = require('browser-sync');

/* === SCRIPTS === */

gulp.task('copy', ['clean'], function() {

  return gulp.src('src/**/*')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function() {

  return gulp.src('dist')
    .pipe(clean());
});

gulp.task('server', ['build-sass', 'browserSync'], function() {

  gulp.watch('src/**/*.scss').on('change', function (){
    
    gulp.start('build-sass');
  });
  gulp.watch('src/**/*').on('change', browserSync.reload);
});

gulp.task('browserSync', function() {

  browserSync.init({
    // server:{ baseDir:'./' }
    // proxy:'localhost/'+ project +'/src/'
    proxy:'localhost/' $project '/src/'
  });
});

gulp.task('sprite', ['build-sprite'], function (){

  gulp.start('build-tinypng');
});

gulp.task('rev', function(){
  return gulp.src(['dist/**/*.{css,js,jpg,jpeg,png,svg}'])
    .pipe(rev())
    .pipe(revdel())
    .pipe(gulp.dest('dist/'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/'))
})

gulp.task('revreplace', ['rev'], function(){
  return gulp.src(['dist/index.html', 'dist/**/*.css', 'dist/**/*.js'])
    .pipe(revReplace({
        manifest: gulp.src('dist/rev-manifest.json'),
        replaceInExtensions: ['.html', '.js', '.css']
    }))
    .pipe(gulp.dest('dist/'));
});

/* === BUILDS === */

gulp.task('build-img', function() {

  return gulp.src('src/assets/img/**/*.png')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/assets/img/'));
});

gulp.task('build-sprite', function () {
  var spriteData = gulp.src('src/assets/img/icons/*.png').pipe(spritesmith({
    imgName: projectName + '-sprite.png',
    imgPath: '../img/'+projectName+'-sprite.png',
    cssName: '_sprite.scss',
    padding: 10
  }));

  var imgStream = spriteData.img
    .pipe(gulp.dest('src/assets/img/'));

  var cssStream = spriteData.css
    .pipe(gulp.dest('src/assets/scss/'));

  return merge(imgStream, cssStream);
});

gulp.task('build-tinypng', function () {
    return gulp.src('src/assets/img/'+ projectName +'-sprite.png')
        .pipe(tinypng(tinyKey))
        .pipe(gulp.dest('src/assets/img/'));
});

gulp.task('build-sass', function(){

  return gulp.src('src/assets/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
        browsers: ['last 10 versions'],
        cascade: false
    }))
    .pipe(cssnano({zindex: false}))
    .pipe(gulp.dest('src/assets/css/'))
    .pipe(browserSync.stream());
});

gulp.task('minify-html', function() {
  return gulp.src('dist/**/*.{html,php}')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/'))
});

gulp.task('build-compress', ['build-sass'], function() {

  return gulp.src('src/**/*.{html,php}')
    .pipe(usemin({
      js: [uglify({preserveComments : false})],
      css: [cssmin({keepSpecialComments : 0})]
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('finish', sequence('copy', 'build-img', 'build-compress', 'minify-html'))