var gulp = require('gulp')
var shell = require('gulp-shell')

gulp.task('make', shell.task([
  'bower install && npm install'
]));

// Run project
gulp.task('run', shell.task([
  'node node_modules/node-webkit-builder/bin/nwbuild -v 0.10.5 --run ./'
]));

// Compile project
gulp.task('build-osx', shell.task([
	'node node_modules/node-webkit-builder/bin/nwbuild -v 0.10.5 -p osx ./'
]));

// Compile project
gulp.task('build-win', shell.task([
	'node node_modules/node-webkit-builder/bin/nwbuild -v 0.10.5 -p win ./'
]));

// Compile project
gulp.task('build-linux', shell.task([
	'node node_modules/node-webkit-builder/bin/nwbuild -v 0.10.5 -p linux32,linux64 ./'
]));
