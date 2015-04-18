'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;

describe('Alfresco:remove-samples', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../remove-samples'))
      .withArguments('name')
      .withOptions({ skipInstall: true, force: true })
      .on('end', done);
  });

  it.skip('creates files', function () {
    assert.file([
      'somefile.js'
    ]);
  });
});
