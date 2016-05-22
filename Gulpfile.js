var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');

gulp.task('styles', function() {
    gulp.src('assets/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/'));
});

//lint task
gulp.task('lint', function() {
  return gulp.src('assets/js/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
});

//Watch task
gulp.task('default', ['styles', 'lint'], function() {
    gulp.watch('assets/sass/**/*.scss',{name:'Watch SASS'},['styles']);
    gulp.watch('assets/js/**/*.js',{name:'Watch JS'},['lint']);
});
