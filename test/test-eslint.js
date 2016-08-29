'use strict';
/* eslint-env node, mocha */
var semver = require('semver');
var versions = process.versions;
if (semver.lt(versions.node, '4.4.0')) {
  console.warn('Not running eslint because ' + versions.node + ' is not supported by eslint, min node version is 4.4.0');
} else {
  runESLint();
}

function runESLint () {
  var lint = require('mocha-eslint');

  var paths = [
    'generators/*.js',
    'generators/*/*.js',
    'test/*.js',
  ];

  var options = {
    // Specify style of output
    formatter: 'compact',
    // Only display warnings if a test is failing
    alwaysWarn: false,
    // Increase the timeout of the test if linting takes to long
    timeout: 5000,
  };

  // Run the tests if node is new enough to run eslint
  lint(paths, options);
}
