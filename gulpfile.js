const gulp = require('gulp');
const mocha = require('gulp-mocha');
const mochaPhantomJS = require('gulp-mocha-phantomjs');

/*gulp.task('watch', function() {
   gulp.watch('*.test.js', ['test']);
});*/

gulp.task('parser-test', () =>
  gulp.src('*.test.js', {read: false})
    .pipe(mocha())
);

gulp.task('ui-test', function () {
   return gulp
    .src('html/test/ui-test-runner.html')
    .pipe(mochaPhantomJS());
});

gulp.task('default', ['parser-test', 'ui-test']);