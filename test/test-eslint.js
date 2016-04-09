'use strict';
var lint = require('mocha-eslint');

var paths = [
  'generators/*.js',
  'generators/*/*.js',
];

var options = {
  // Specify style of output
  formatter: 'compact',
  // Only display warnings if a test is failing
  alwaysWarn: false,
  // Increase the timeout of the test if linting takes to long
  timeout: 5000,
};

// Run the tests
lint(paths, options);
