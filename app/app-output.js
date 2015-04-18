'use strict';
var chalk = require('chalk');

/*
 *
 * Usage:
 * ... inside generator code
 * this.out = require('./app-output.js')(this);
 * this.out.info('Something amazing');
 * this.out.warn('Something alarming');
 * this.out.error('Something abominable');
 *
 */

module.exports = function(yo) {
  var module = {};

  module.info = function(message) {
    yo.log(chalk.bold(chalk.green('INFO:  ') + message));
  }

  module.warn = function(message) {
    yo.log(chalk.bold(chalk.yellow('WARN:  ') + message));
  }

  module.error = function(message) {
    yo.log(chalk.bold(chalk.red('ERROR: ') + message));
  }

  return module;
}
