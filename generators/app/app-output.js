'use strict';
var chalk = require('chalk');
var size = require('window-size');
var wrap = require('wrap-ansi');

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

  module.size = require('window-size');
  module.info = function(message) {
    yo.log(wrap(chalk.bold(chalk.green('INFO:  ') + message), size.width));
  }

  module.warn = function(message) {
    yo.log(wrap(chalk.bold(chalk.yellow('WARN:  ') + message), size.width));
  }

  module.error = function(message) {
    yo.log(wrap(chalk.bold(chalk.red('ERROR: ') + message), size.width));
  }

  module.docs = function(text, link) {
    if (text) {
      yo.log(wrap(chalk.dim.yellow(text), size.width));
    }
    if (link) {
      yo.log(chalk.dim.green('See: ') + chalk.blue.underline(link));
    }
  }

  module.definition = function(term, def) {
    yo.log(wrap(chalk.bold.yellow(term + ': ') + chalk.dim.yellow(def), size.width));
  }

  return module;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
