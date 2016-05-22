const gulp = require('gulp');
const jshint = require('gulp-jshint');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');

gulp.task('styles', function() {
    gulp.src('assets/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./assets/css/'));
});

gulp.task('scripts', () =>
    gulp.src('assets/js/src/app.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('assets/js/dist/'))
);

// gulp.task('js', () => {
//   return gulp.src('assets/js/src/*.js')
//   // .pipe(jshint())
//   // .pipe(jshint.reporter('default'))
//   .pipe(sourcemaps.init())
//   .pipe(babel({
//     presets: ['es2015']
//   }))
//   .pipe(concat('all.js'))
//   .pipe(sourcemaps.write('.'))
//   .pipe(gulp.dest('assets/dist'));
// });

//Watch task
gulp.task('default', ['styles', 'scripts'], function() {
    gulp.watch('assets/sass/**/*.scss',{name:'Watch SASS'},['styles']);
    gulp.watch('assets/js/src/*.js',{name:'Watch JS'},['scripts']);
});
