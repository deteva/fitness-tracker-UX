var gulp = require('gulp');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var del = require('del');

//file paths
var DIST_PATH = 'public/dist'
var SCRIPT_PATH = 'public/scripts/**/*.js';
var SASS_PATH = 'public/stylesheets/scss/**/*.scss';
var TEMPLATE_PATH = 'app/views/**/*/hbs';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,gif,svg}';

//scss styles
gulp.task('scss', function () {
	console.log('starting' +
		'scss styles task');
	return gulp.src('public/stylesheets/scss/main.scss')
		.pipe(plumber(function (error) {
			console.log('task' +
				' of styles' +
				' error');
			console.log(error);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(autoprefixer())
		.pipe(sass({
				outputStyle: 'compressed'
			}
		))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(DIST_PATH))
		.pipe(livereload());
});
//scripts
gulp.task('scripts', function () {
	console.log('starting' +
		' script task');

	return gulp.src(SCRIPT_PATH)
		.pipe(plumber(function (error) {
			console.log('scripts task error');
			console.log(error);
			this.emit('end');
		}))
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(concat('scripts.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(DIST_PATH))
		.pipe(livereload());
});


gulp.task('clean', function () {
	return del.sync([
		DIST_PATH
	]);
})

gulp.task('default', ['clean', 'scss', 'scripts'] , function () {
	console.log('starting' +
		' default taks');
});


gulp.task('watch', ['default'] , function () {
	console.log('starting' +
		' watch task');
	//require();//server.js
	livereload.listen();
	gulp.watch(SCRIPT_PATH, ['scripts']);
	//gulp.watch(CSS_PATH, ['styles']);
	gulp.watch('public/stylesheets/scss/**/*.scss', ['scss']);
	gulp.watch(TEMPLATE_PATH, ['templates']);
});
//<script src =
// "http://localhost:35729/livereload.js"></script>