'use strict';

var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app-2-1-0', function () {

  describe('default prompts with SDK 2.1.0', function () {

    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.0',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .on('end', done);
    });

    it('creates files', function () {
      // TODO(bwavell): add more tests
      assert.file([
        '.editorconfig',
        '.gitignore',
        '.yo-rc.json',
        'pom.xml',
        'debug.sh',
        'run.sh',
        'run-without-springloaded.sh',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.sh',
        'scripts/run-without-springloaded.sh',
        'amps/README.md',
        'amps_share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/share-amp/pom.xml',
        'repo/pom.xml',
        'repo-amp/pom.xml',
        'runner/pom.xml',
        'share/pom.xml',
        'share-amp/pom.xml',
        'solr-config/pom.xml',
        'TODO.md',
      ]);
    });
    it('adds generic include for generated beans', function () {
      assert.fileContent(
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/module-context.xml',
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
        ['run.sh', /-Penterprise/],
        ['run-without-springloaded.sh', /-Penterprise/],
        ['scripts/debug.sh', /-Penterprise/],
        ['scripts/run.sh', /-Penterprise/],
        ['scripts/run-without-springloaded.sh', /-Penterprise/]
      ]);
    });
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
