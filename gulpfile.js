var gulp = require('gulp');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var path = require('path');
var del = require('del');
var compass = require('gulp-compass');
var minifyCSS = require('gulp-minify-css');

//file paths
var DIST_PATH = 'public/assets/stylesheets/css'
var SCRIPT_PATH = 'public/scripts/**/*.js';
var SASS_PATH = 'public/assets/stylesheets/sass/**/*.sass';
var IMAGES_PATH = 'public/images/**/*.{png,jpeg,jpg,gif,svg}';
var CSS_PATH = 'public/assets/stylesheets/css/global.css';
var HTML_PATH = 'public/app/components/**/*.html';

// check
gulp.task('check', function() {
	return gulp.src(['*', 'js/*', 'css/*', 'html/*'])
		.pipe(livereload());
});

//sass styles
//gulp.task('sass', function () {
//	console.log('starting sass styles task');
//	return gulp.src('public/stylesheets/sass/global.sass')
//		.pipe(plumber(function (error) {
//			console.log('task of styles error');
//			console.log(error);
//			this.emit('end');
//		}))
//		.pipe(sourcemaps.init())
//		.pipe(autoprefixer())
//		.pipe(sass({
//				outputStyle: 'compressed'
//			}
//		))
//		.pipe(sourcemaps.write())
//		.pipe(gulp.dest(DIST_PATH))
//		.pipe(livereload());
//});
//
////scripts
//gulp.task('scripts', function () {
//	console.log('starting' +
//		' script task');
//
//	return gulp.src(SCRIPT_PATH)
//		.pipe(plumber(function gulp(error) {
//			console.log('scripts task error');
//			console.log(error);
//			this.emit('end');
//		}))
//		.pipe(sourcemaps.init())
//		.pipe(uglify())
//		.pipe(concat('scripts.js'))
//		.pipe(sourcemaps.write())
//		.pipe(gulp.dest(DIST_PATH))
//		.pipe(livereload());
//});
//
//
//gulp.task('compass', function() {
//	gulp.src('public/assets/stylesheets/sass/**/*.sass')
//		.pipe(compass({
//			project_path :'public/assets/stylesheets',
//			sass : '/sass',
//			debug: true
//		}))
//		.pipe(minifyCSS())
//		.pipe(gulp.dest(DIST_PATH));
//});

gulp.task('clean', function () {
	return del.sync([
		DIST_PATH
	]);
})

//gulp.task('default', ['clean', 'sass', 'scripts'] , function () {
//	console.log('starting' +
//		' default taks');
//});

gulp.task('watch' , function () {
	console.log('starting watch task');
	livereload.listen();
	//gulp.watch(SCRIPT_PATH, ['scripts']);
	//gulp.watch(CSS_PATH, ['check']);
	gulp.watch(SASS_PATH, ['check']);
	gulp.watch(HTML_PATH, ['check']);

});
