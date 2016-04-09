'use strict';

var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');

describe('generator-alfresco:app:enterprise', function () {

  this.timeout(60000);

  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompts({
        communityOrEnterprise: 'Enterprise',
        removeDefaultSourceAmps: false,
        removeDefaultSourceSamples: false,
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file([
      'repo/src/main/resources/alfresco/extension/license/README.md',
    ]);
  });

  it('updates run.sh and debug.sh with -Penterprise flag', function () {
    assert.fileContent([
      ['debug.sh', /-Penterprise/],
      ['run.sh', /-Penterprise/],
      ['run.bat', /-Penterprise/],
      ['run-without-springloaded.sh', /-Penterprise/],
      ['scripts/debug.sh', /-Penterprise/],
      ['scripts/run.sh', /-Penterprise/],
      ['scripts/run.bat', /-Penterprise/],
      ['scripts/run-without-springloaded.sh', /-Penterprise/],
    ]);
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
