'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const constants = require('generator-alfresco-common').constants;
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:app-environment', function () {
  describe('detects invalid JAVA_HOME quickly', function () {
    this.timeout(4000);

    before(function () {
      this.bail = false;
      if (process.env.JAVA_HOME) {
        const javaHome = process.env.JAVA_HOME;
        process.env.JAVA_HOME = 'asdfASDF';
        return helpers.run(path.join(__dirname, '../generators/app'))
          .inDir(path.join(os.tmpdir(), './temp-test'))
          .withOptions({ 'skip-install': false })
          .withPrompts({
            removeDefaultSourceAmps: false,
            removeDefaultSourceSamples: false,
          })
          .toPromise()
          .then(dir => {
            process.env.JAVA_HOME = javaHome;
          });
      } else {
        console.log('WARNING: Skipping tests because JAVA_HOME is not set');
        this.bail = true;
      }
    });

    it('does not generate a project', function () {
      if (this.bail) {
        console.log('WARNING: Skipping test');
        return;
      }
      assert.noFile([
        '.editorconfig',
        '.gitignore',
        'pom.xml',
        'debug.sh',
        'run.sh',
        'run.bat',
        'run-without-springloaded.sh',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.sh',
        'scripts/run.bat',
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
    this.timeout(4000);

    before(function () {
      const m2Home = process.env.M2_HOME;
      process.env.M2_HOME = 'asdfASDF';
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': false })
        .withPrompts({
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise()
        .then(dir => {
          if (m2Home) {
            process.env.M2_HOME = m2Home;
          } else {
            delete process.env.M2_HOME;
          }
        });
    });

    it('does not generate a project', function () {
      assert.noFile([
        '.editorconfig',
        '.gitignore',
        'pom.xml',
        'debug.sh',
        'run.sh',
        'run.bat',
        'run-without-springloaded.sh',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.sh',
        'scripts/run.bat',
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
