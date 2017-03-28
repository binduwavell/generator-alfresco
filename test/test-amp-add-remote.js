'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:amp-add-remote', function () {
  this.timeout(30000);

  var osTempDir = path.join(os.tmpdir(), 'temp-test');

  // We need a test project setup before we begin
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
        projectArtifactId: 'temp-test',
      })
      .toPromise();
  });

  it('starts with a basic project', function () {
    assert.file([
      path.join(osTempDir, 'pom.xml'),
      path.join(osTempDir, 'run.sh'),
    ]);
  });

  describe('installing a remote repo amp using options', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/amp-add-remote'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'repo',
          'group-id': 'com.softwareloop',
          'artifact-id': 'uploader-plus-repo',
          'amp-version': '1.2',
        })
        .toPromise();
    });

    it('references amp in repo/pom.xml', function () {
      assert.fileContent([
        [path.join(osTempDir, 'repo/pom.xml'), /<groupId>com.softwareloop</],
        [path.join(osTempDir, 'repo/pom.xml'), /<artifactId>uploader-plus-repo</],
        [path.join(osTempDir, 'repo/pom.xml'), /<version>1.2</],
      ]);
    });
  });

  describe('installing a remote share amp using prompts', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/amp-add-remote'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'share',
          'group-id': 'com.softwareloop',
          'artifact-id': 'uploader-plus-surf',
          'amp-version': '1.2',
        })
        .toPromise();
    });

    it('references amp in repo/pom.xml', function () {
      assert.fileContent([
        [path.join(osTempDir, 'share/pom.xml'), /<groupId>com.softwareloop</],
        [path.join(osTempDir, 'share/pom.xml'), /<artifactId>uploader-plus-surf</],
        [path.join(osTempDir, 'share/pom.xml'), /<version>1.2</],
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
