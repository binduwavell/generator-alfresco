'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('generator-alfresco:app-folder-artifact-same-2-1-1', function () {
  describe('when artifactId != current directory name', function () {
    this.timeout(60000);
    const osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectStructure: 'basic',
          projectArtifactId: 'test-artifact',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    it('there is a .yo-rc.json in the current working directory', function () {
      assert.file([
        '.yo-rc.json',
      ]);
    });
    it('the current working directory is called test-artifact', function () {
      assert.equal(path.basename(process.cwd()), 'test-artifact');
    });
    it('the test-artifact folder is in the temp-test folder', function () {
      assert.equal(path.basename(path.resolve('..')), 'temp-test');
    });
    // TODO(vprince): pull the helpers.run() code into describe/before pattern used elsewhere
    it('we can abort project creation based on artifactId and folder name mismatch', function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .cd(path.join(osTempDir, 'test-artifact'))
        .withPrompts({
          abortExistingProject: true,
          sdkVersion: '2.2.0',
          projectArtifactId: 'test-artifact-1',
        })
        .toPromise()
        .then(dir => {
          assert.equal(fs.existsSync(path.join(osTempDir, 'test-artifact/test-artifact-1')), false);
        });
    });
    // TODO(vprince): pull the helpers.run() code into describe/before pattern used elsewhere
    it('we can abort project creation based on artifactId update prompt', function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .cd(path.join(osTempDir, 'test-artifact'))
        .withPrompts({
          abortExistingProject: false,
          sdkVersion: '2.2.0',
          projectArtifactId: 'test-artifact-1',
          abortProjectArtifactIdUpdate: true,
        })
        .toPromise()
        .then(dir => {
          assert.equal(fs.existsSync(path.join(osTempDir, 'test-artifact/test-artifact-1')), false);
        });
    });
  });

  describe('when artifactId is the same as the current directory name', function () {
    this.timeout(60000);
    const osTempDir = path.join(os.tmpdir(), 'demo');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectStructure: 'basic',
          projectArtifactId: 'demo',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });
    it('there is a .json-config in the current working directory', function () {
      assert.file([
        '.yo-rc.json',
        osTempDir,
      ]);
    });
    it('no artifactId sub-folder is created because the current folder is named the same as the artifactId', function () {
      assert.noFile([
        path.join(osTempDir, 'demo'),
      ]);
    });
    it('maven generated files exist', function () {
      assert.file([
        path.join(osTempDir, 'pom.xml'),
      ]);
      assert.fileContent(
        'pom.xml',
        /<artifactId>demo<\/artifactId>/
      );
    });
  });

  describe('re-running generator without changing the artifactId', function () {
    this.timeout(60000);
    const osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectStructure: 'basic',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });
    it('there is a .json-config in the current working directory', function () {
      assert.file([
        '.yo-rc.json',
      ]);
    });
    // TODO(vprince): pull the helpers.run() code into describe/before pattern used elsewhere
    it('re-running generator and updating artifactId in existing project', function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .withOptions({
          'skip-install': true,
          'force': true,
        })
        .cd(osTempDir)
        .withPrompts({
          abortExistingProject: false,
          sdkVersion: '2.1.1',
          projectArtifactId: 'test-artifact-1',
          abortProjectArtifactIdUpdate: false,
        })
        .toPromise()
        .then(function (dir) {
          assert.equal(fs.existsSync(osTempDir), true);
          assert.equal(fs.existsSync(path.join(osTempDir, 'test-artifact-1')), false);
          assert.file([
            path.join(osTempDir, 'pom.xml'),
          ]);
          assert.fileContent(
            'pom.xml',
            /<artifactId>test-artifact-1<\/artifactId>/
          );
        });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
