const gulp = require('gulp');
const mocha = require('gulp-mocha');

/*gulp.task('watch', function() {
   gulp.watch('*.test.js', ['test']);
});*/

gulp.task('test', () =>
  gulp.src('*.test.js', {read: false})
    .pipe(mocha())
);

gulp.task('default', ['test']);