'use strict';

var assert = require('assert');
var chalk = require('chalk');

describe('generator-alfresco:app-output', function () {

  var logmock = {
    log: function(message) {
      this.msg = message;
    },
    get: function() {
      return this.msg;
    },
  };

  it('can provide info', function () {
    var out = require('../generators/app/app-output.js')(logmock);
    out.info("HELLO");
    assert.equal(chalk.stripColor(logmock.get()), 'INFO:  HELLO');
  });

  it('can warn or issues', function () {
    var out = require('../generators/app/app-output.js')(logmock);
    out.warn("WORLD");
    assert.equal(chalk.stripColor(logmock.get()), 'WARN:  WORLD');
  });

  it('can error out', function () {
    var out = require('../generators/app/app-output.js')(logmock);
    out.error("OBLITERATION!");
    assert.equal(chalk.stripColor(logmock.get()), 'ERROR: OBLITERATION!');
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
