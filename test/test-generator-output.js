'use strict';
/* eslint-env node, mocha */
var assert = require('assert');
var chalk = require('chalk');

describe('generator-alfresco:generator-output', function () {
  beforeEach(function () {
    this.msg = '';
    this.logmock = {
      log: function (message) {
        if (this.msg) {
          this.msg += '\n';
        }
        this.msg += message;
      }.bind(this),
      get: function () {
        return this.msg;
      }.bind(this),
    };
  });

  it('can provide info', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.info('HELLO');
    assert.equal(chalk.stripColor(this.logmock.get()), 'INFO:  HELLO');
  });

  it('can warn or issues', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.warn('WORLD');
    assert.equal(chalk.stripColor(this.logmock.get()), 'WARN:  WORLD');
  });

  it('can error out', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.error('OBLITERATION!');
    assert.equal(chalk.stripColor(this.logmock.get()), 'ERROR: OBLITERATION!');
  });

  it('does not display anything when docs is called without arguments', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.docs();
    assert.equal(this.logmock.get(), '');
  });

  it('can display documentation without a link', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.docs('useful info');
    assert.equal(chalk.stripColor(this.logmock.get()), 'useful info');
  });

  it('can display a link without documentation', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.docs(undefined, 'link');
    assert.equal(chalk.stripColor(this.logmock.get()), 'See: link');
  });

  it('can display documentation with a link', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.docs('useful info', 'link');
    assert.equal(chalk.stripColor(this.logmock.get()), 'useful info\nSee: link');
  });

  it('can display multi-line documentation', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.docs(['useful', 'info']);
    assert.equal(chalk.stripColor(this.logmock.get()), 'useful\n\ninfo');
  });

  it('can provide a definition', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.definition('example', 'this is an example.');
    assert.equal(chalk.stripColor(this.logmock.get()), 'example: this is an example.');
  });

  it('can produce a color banner', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    assert.equal(chalk.stripColor(out.bannerText()), out.rawBannerText());
  });

  /*
  it('display banners', function () {
    var out = require('../generators/app/generator-output.js')(this.logmock);
    console.log(out.rawBannerText());
    console.log(out.fancyBannerText());
  });
  */

  it('can produce a fancy banner', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.banner('    ', 120);
    assert.equal(chalk.stripColor(this.logmock.get()), out.rawBannerText());
  });

  /*
  it('display logos', function () {
    var out = require('../generators/app/generator-output.js')(this.logmock);
    console.log(out.rawLogoText());
    console.log(out.fancyLogoText());
  });
  */

  it('can produce a fancy logo', function () {
    var out = require('../generators/common/generator-output.js')(this.logmock);
    out.banner('    ', 100);
    assert.equal(chalk.stripColor(this.logmock.get()), out.rawLogoText());
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
