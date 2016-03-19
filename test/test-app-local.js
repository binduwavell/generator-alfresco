'use strict';

var assert = require('yeoman-assert');
var constants = require('../generators/app/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app-local', function () {

  describe('default prompts with local SDK, twice', function () {

    this.timeout(60000);

    before(function (done) {
      var tmpdir = path.join(os.tmpdir(), './temp-test');
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(tmpdir)
        .withOptions({ 'skip-install': false })
        .withPrompts({
          sdkVersion: 'local',
          archetypeVersion: '2.1.1',
        })
        .on('end', function() {
          helpers.run(path.join(__dirname, '../generators/app'))
            .inDir(tmpdir, function(dir) {
              fs.mkdirSync( path.join(dir, constants.FOLDER_SOURCE_TEMPLATES) );
              fs.mkdirSync( path.join(dir, constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp') );
              fs.writeFileSync( path.join( path.join(dir, constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml') ), '' );
            })
            .withLocalConfig({ 'archetypeVersion': '2.1.0' })
            .withOptions({ 'skip-install': false })
            .withPrompts({
              sdkVersion: 'local',
              archetypeVersion: '2.1.1',
            })
            .on('end', done);
        });
    });

    it('creates files', function () {
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
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/README.md',
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
