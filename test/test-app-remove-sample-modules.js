'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:app-remove-sample-modules', function () {
  describe('remove sdk samples', function () {
    this.timeout(60000);

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': false })
        .withPrompts({
          removeDefaultSourceAmps: true,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    it('does not create sample amp specific files', function () {
      assert.noFile([
        'repo-amp/pom.xml',
        'share-amp/pom.xml',
      ]);
    });
  });

  describe('remove sdk sample modules', function () {
    this.timeout(60000);

    const osTempDir = path.join(os.tmpdir(), './temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({'skip-install': false})
        .withPrompts({
          removeDefaultSourceAmps: true,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    it('creates a project', function () {
      assert.file(path.join(osTempDir, '.yo-rc.json'));
    });

    it('does not create sample amp specific files', function () {
      assert.noFile([
        'repo-amp/pom.xml',
        'share-amp/pom.xml',
      ]);
    });

    describe('remove sdk sample modules again', function () {
      before(function () {
        return helpers.run(path.join(__dirname, '../generators/app'))
          .cd(osTempDir)
          .withLocalConfig({
            removeDefaultSourceAmps: true,
            removeDefaultSourceSamples: false,
          })
          .withOptions({ 'skip-install': false })
          .toPromise();
      });

      it('does not create sample amp specific files', function () {
        assert.noFile([
          'repo-amp/pom.xml',
          'share-amp/pom.xml',
        ]);
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
