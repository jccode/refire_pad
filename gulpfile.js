var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var coffee = require('gulp-coffee');
var gettext = require('gulp-angular-gettext');
var shell = require('gulp-shell');
var replace = require('gulp-replace-task');
var args = require('yargs').argv;
var fs = require('fs');

var paths = {
    sass: ['./scss/**/*.scss'],
    coffee: ['./coffee/**/*.coffee']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('coffee', function(done) {
    gulp.src(paths.coffee)
        .pipe(coffee())
        .on('error', gutil.log)
        .pipe(concat('application.js'))
        .pipe(gulp.dest('./www/js'))
        .on('end', done);
});

gulp.task('watch', function() {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.coffee, ['coffee']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});



gulp.task('pot', function() {
    return gulp.src(['./www/templates/**/*.html', './www/js/**/*.js'])
        .pipe(gettext.extract('template.pot', {
            // options
        }))
        .pipe(gulp.dest('po/'));
});

gulp.task('msgmerge', function(done) {
    if(!sh.which('msgmerge')) {
        console.log( 'msgmerge havn\'t install. You need to install it first.' );
        process.exit(1);
    }
    gulp.src('./po/*.po')
        .pipe(shell("msgmerge -U <%= file.path %> po/template.pot"));
});

gulp.task('translate', function() {
    return gulp.src('po/**/*.po')
        .pipe(gettext.compile({
            // options
        }))
        .pipe(concat('translations.js'))
        .pipe(gulp.dest('./www/js'));
});

gulp.task('replace', function() {
    var env = args.env || 'dev';
    var filename = env + '.json';
    var settings = JSON.parse(fs.readFileSync('./config/env/'+filename, 'utf-8'));

    gulp.src('./config/settings.coffee')
        .pipe(replace({
            patterns: [
                {match: 'baseurl', replacement: settings.baseurl}
            ]
        }))
        .pipe(gulp.dest('./coffee/'));
});

