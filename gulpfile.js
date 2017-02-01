var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({lazy:false});
var gulpBowerFiles = require('gulp-bower-files');
var gutil = require('gulp-util');
var gulpFilter = require('gulp-filter');
var path = require('path');


function createFileFromString(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}

// gulp.task('coffee', function() {
//   gulp.src('./app/**/*.coffee')
//     .pipe(coffee({bare: true}).on('error', gutil.log))
//     .pipe(gulp.dest('./app/'))
// });

gulp.task('scripts', function(){
    //combine all js files of the app
// var jshintOptions = {
//       strict:false,
//       undef:false,
//       globalstrict:false
//     }
    gulp.src(['!./app/**/*_test.js','./app/**/*.js'])
        // .pipe(plugins.jshint(jshintOptions))
        // .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.concat('main.js'))
        .pipe(gulp.dest('./build/scripts'));
});
gulp.task('cleanBuild', function () {

    return gulp.src('build', {read: false})
        .pipe(plugins.clean());
});
gulp.task('templates',function(){
    //combine all template files of the app into a js file
    gulp.src(['!./app/index.html',
        './app/**/*.html'])
        .pipe(plugins.angularTemplatecache('templates.js',{standalone:true}))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('css', function(){
    gulp.src('./app/**/*.css')
        .pipe(plugins.concat('main.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorJS', function(){
    //concatenate vendor JS files
    // gulp.src(['!./bower_components/**/*.min.js',
    //     './bower_components/**/*.js'])
    gulpBowerFiles()
    .pipe(gulpFilter('**/*.js'))
      /*
       * If you need the scripts to be loaded in a different order,
       * edit the array below
       */
    .pipe(plugins.order([
      "**/jquery.js",
      "**/angular.js",
      "**/angular-*.js",
      '**/lo-dash.compat.js',
      '**/safeApply.js',
      '**/restangular.js',
      '**/ngForce.js',
      '**/ngForce-*.js'
    ]))

    .pipe(plugins.concat('lib.js'))
    .pipe(gulp.dest('./build/scripts'));
});

gulp.task('vendorCSS', function(){
    //concatenate vendor CSS files
    gulpBowerFiles()
    .pipe(gulpFilter('**/*.css'))
        .pipe(plugins.concat('lib.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorFonts', function(){
    //concatenate vendor CSS files
    gulpBowerFiles()
    .pipe(gulpFilter('**/fonts/*'))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('copy-index', function() {
    gulp.src('./app/index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('watch',function(){
    gulp.watch([
        'build/**/*.html',
        'build/**/*.js',
        'build/**/*.css'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    gulp.watch(['./app/**/*.js','!./app/**/*test.js'],['scripts']);
    gulp.watch(['!./app/index.html','./app/**/*.html'],['templates']);
    gulp.watch('./app/**/*.css',['css']);
    gulp.watch('./app/index.html',['copy-index']);

});

gulp.task('connect', function() {
  return plugins.connect.server({
      root: ['build'],
      port: 9000,
      livereload: true
   });
});

gulp.task('zip-staticresource', function () {
    return gulp.src('build/**/*')
        .pipe(plugins.zip('TBN_TimeLog.resource'))
        .pipe(gulp.dest('../src/staticresources'));
});

gulp.task('meta-staticresource', function () {
    return createFileFromString('TBN_TimeLog.resource-meta.xml', '<?xml version="1.0" encoding="UTF-8"?><StaticResource xmlns="http://soap.sforce.com/2006/04/metadata"><cacheControl>Private</cacheControl><contentType>application/octet-stream</contentType></StaticResource>')
        .pipe(gulp.dest('../src/staticresources'));
});

gulp.task('meta-page', function() {
  return createFileFromString('TBN_TimeLog.page-meta.xml','<?xml version="1.0" encoding="UTF-8"?><ApexPage xmlns="http://soap.sforce.com/2006/04/metadata"><apiVersion>29.0</apiVersion><availableInTouch>true</availableInTouch><label>TBN_TimeLog</label></ApexPage>')
          .pipe(gulp.dest('../src/pages'));
});

gulp.task('vf-page', function() {
  return gulp.src('./app/TBN_TimeLog.page')
          .pipe(gulp.dest('../src/pages'));
});
gulp.task('save-static-resource-zip', ['meta-staticresource','zip-staticresource']);
gulp.task('save-vf-page', ['vf-page', 'meta-page']);

gulp.task('save', ['save-static-resource-zip','save-vf-page']);
gulp.task('build', ['connect','scripts','templates','css','copy-index','vendorJS','vendorCSS','watch']);
gulp.task('cleanAndBuild', ['cleanBuild'], function() {
  gulp.start('build');
});
gulp.task('default',['cleanAndBuild']);
