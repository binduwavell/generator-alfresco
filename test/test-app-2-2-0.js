'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

describe('generator-alfresco:app', function () {
  describe('SDK 2.2.0', function () {
    this.timeout(60000);

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.2.0',
          projectArtifactId: 'test-artifact',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    it('creates files', function () {
      // TODO(bwavell): add more tests
      assert.file([
        '.editorconfig',
        '.gitignore',
        '.yo-rc.json',
        'pom.xml',
        'debug.sh',
        'run.bat',
        'run-without-springloaded.sh',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.bat',
        'scripts/run-without-springloaded.sh',
        'amps/README.md',
        'amps_share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/test-artifact-repo-amp/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/test-artifact-share-amp/pom.xml',
        'repo/pom.xml',
        'test-artifact-repo-amp/pom.xml',
        'runner/pom.xml',
        'share/pom.xml',
        'test-artifact-share-amp/pom.xml',
        'solr-config/pom.xml',
        'TODO.md',
      ]);
    });
    it('adds amps_source to modules in top pom', function () {
      assert.fileContent(
        'pom.xml',
        /<module>customizations<\/module>/
      );
    });
    it('debug.sh does not reference springloaded', function () {
      assert.noFileContent(
        'scripts/debug.sh',
        /springloaded/
      );
    });
    it('adds generic include for generated beans', function () {
      assert.fileContent(
        'test-artifact-repo-amp/src/main/amp/config/alfresco/module/test-artifact-repo-amp/module-context.xml',
        /<import resource="classpath:alfresco\/module\/\${project\.artifactId}\/context\/generated\/\*-context\.xml"\/>/
      );
    });
    it('does not create enterprise specific files', function () {
      assert.noFile([
        'repo/src/main/resources/alfresco/extension/license/README.md',
      ]);
    });
    it('run.sh and debug.sh should not include -Penterprise flag', function () {
      assert.noFileContent([
        ['debug.sh', /-Penterprise/],
        ['run.bat', /-Penterprise/],
        ['run-without-springloaded.sh', /-Penterprise/],
        ['scripts/debug.sh', /-Penterprise/],
        ['scripts/run.bat', /-Penterprise/],
        ['scripts/run-without-springloaded.sh', /-Penterprise/],
      ]);
    });
    it('uses correct folder names for exploding sources', function () {
      assert.fileContent([
        ['scripts/explode-alf-sources.sh',
        /test-artifact-repo-amp/],
        ['scripts/explode-alf-sources.sh',
        /test-artifact-share-amp/],
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
