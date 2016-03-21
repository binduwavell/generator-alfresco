'use strict';

var assert = require('yeoman-assert');
var constants = require('../generators/app/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app-environment', function () {

  describe('detects invalid JAVA_HOME quickly', function () {

    this.timeout(1000);

    before(function (done) {
      this.bail = false;
      if (process.env.JAVA_HOME) {
        var javaHome = process.env.JAVA_HOME;
        process.env.JAVA_HOME = 'asdfASDF';
        helpers.run(path.join(__dirname, '../generators/app'))
          .inDir(path.join(os.tmpdir(), './temp-test'))
          .withOptions({ 'skip-install': false })
          .on('end', function() {
              process.env.JAVA_HOME = javaHome;
              done();
            });
      } else {
        console.log("WARNING: Skipping tests because JAVA_HOME is not set");
        this.bail = true;
        done();
      }
    });

    it('does not generate a project', function () {
      if (this.bail) {
        console.log("WARNING: Skipping test");
        return;
      }
      assert.noFile([
        '.editorconfig',
        '.gitignore',
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
  });

  describe('detects invalid M2_HOME quickly', function () {

    this.timeout(1000);

    before(function (done) {
      var m2Home = process.env.M2_HOME;
      process.env.M2_HOME = 'asdfASDF';
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': false })
        .on('end', function() {
            if (m2Home) {
              process.env.M2_HOME = m2Home;
            } else {
              delete process.env.M2_HOME;
            }
            done();
          });
    });

    it('does not generate a project', function () {
      assert.noFile([
        '.editorconfig',
        '.gitignore',
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
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
