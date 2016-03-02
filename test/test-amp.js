'use strict';
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');

describe('generator-alfresco:amp', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/amp'))
      .inDir(path.join(os.tmpdir(), './temp-test'), function(dir) {
        // console.log("SETTING UP DIRECTORY: " + dir);
        var fooPath = path.join(dir, 'foo-repo-amp');
        var pomPath = path.join(fooPath, 'pom.xml');
        fs.mkdirSync(fooPath);
        fs.writeFileSync(pomPath, '');
      })
      .on('end', done);
  });

  it('creates files', function () {
    assert.file('foo-repo-amp/pom.xml');
  });
});
