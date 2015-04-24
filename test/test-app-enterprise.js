'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('alfresco:app', function () {

  this.timeout(60000);

  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompt({
        communityOrEnterprise: 'Enterprise'
      })
      .on('end', done);
  });

  it('updates run.sh and debug.sh with -Penterprise flag', function () {
    assert.fileContent([
      ['run.sh', /-Penterprise/],
      ['debug.sh', /-Penterprise/]
    ]);
  });
});
