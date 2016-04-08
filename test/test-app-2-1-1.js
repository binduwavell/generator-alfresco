'use strict';

var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app-2-1-1', function () {

  describe('provide non-standard project GAV with SDK 2.1.1', function () {

    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectGroupId: 'org.alfresco',
          projectArtifactId: 'demoamp',
          projectVersion: '1.0.0-SNAPSHOT',
          projectPackage: 'foo.bar.baz',
          communityOrEnterprise: 'Community',
          includeGitIgnore: true,
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: true,
        })
        .on('end', done);
    });

    it('removes package based demo files', function () {
      assert.noFile([
        'repo-amp/src/main/java/foo/bar/baz/demoamp/Demo.java',
        'repo-amp/src/test/java/foo/bar/baz/demoamp/test/DemoComponentTest.java',
        'repo-amp/src/main/java/foo/bar/baz/demoamp/HelloWorldWebScript.java',
        'repo-amp/src/main/java/foo/bar/baz/demoamp',
        'repo-amp/src/test/java/foo/bar/baz/demoamp/test/DemoComponentTest.java',
        'repo-amp/src/test/java/foo/bar/baz/demoamp'
      ]);
    });
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
