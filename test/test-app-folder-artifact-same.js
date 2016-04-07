'use strict';

var assert = require('yeoman-assert');
var constants = require('../generators/app/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app-folder-artifact-same', function () {

  describe('when artifactId != current directory name', function () {

    this.timeout(60000);
    this.osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(this.osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectArtifactId: 'test-artifact',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .on('end', done);
    }.bind(this));

    it('there is a .yo-rc.json in the current working directory', function () {
      assert.file([
        '.yo-rc.json',
      ]);
    });
    it('the current working directory is called test-artifact', function() {
      assert.equal(path.basename(process.cwd()),'test-artifact');
    });
    it('the test-artifact folder is in the temp-test folder', function() {
      assert.equal(path.basename(path.resolve('..')),'temp-test');
    });
    it('we can abort project creation based on artifactId and folder name mismatch', function(done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function() {
          // we want our test to run inside the previously generated directory
          // and we don't want it to be empty, so this is a hack for that.
          process.chdir(path.join(this.osTempDir, 'test-artifact'));
        }.bind(this))
        .withPrompts({
          abortExistingProject: true,
          sdkVersion: '2.2.0',
          projectArtifactId: 'test-artifact-1',
        })
        .on('end', function() {
          assert.equal(fs.existsSync(path.join(this.osTempDir,'test-artifact/test-artifact-1')),false);
          done();
        }.bind(this));
    }.bind(this));
    it('we can abort project creation based on artifactId update prompt', function(done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function() {
          // we want our test to run inside the previously generated directory
          // and we don't want it to be empty, so this is a hack for that.
          process.chdir(path.join(this.osTempDir, 'test-artifact'));
        }.bind(this))
        .withPrompts({
          abortExistingProject: false,
          sdkVersion: '2.2.0',
          projectArtifactId: 'test-artifact-1',
          abortProjectArtifactIdUpdate: true,
        })
        .on('end', function() {
          assert.equal(fs.existsSync(path.join(this.osTempDir,'test-artifact/test-artifact-1')),false);
          done();
        }.bind(this));
    }.bind(this));
  });

  describe('when artifactId is the same as the current directory name', function () {

    this.timeout(60000);
    this.osTempDir = path.join(os.tmpdir(), 'demo');

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(this.osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectArtifactId: 'demo',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .on('end', done);
    }.bind(this));
    it('there is a .json-config in the current working directory', function () {
      assert.file([
        '.yo-rc.json',
        this.osTempDir,
      ]);
    }.bind(this));
    it('no artifactId sub-folder is created because the current folder is named the same as the artifactId', function () {
      assert.noFile([
        path.join(this.osTempDir, 'demo'),
      ]);
    }.bind(this));
    it('maven generated files exist', function () {
      assert.file([
        path.join(this.osTempDir, 'pom.xml'),
      ]);
      assert.fileContent(
        'pom.xml',
        /<artifactId>demo<\/artifactId>/
      );
    }.bind(this));

  });

  describe('re-running generator without changing the artifactId', function () {

    this.timeout(60000);
    this.osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(this.osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .on('end', done);
    }.bind(this));
    it('there is a .json-config in the current working directory', function () {
      assert.file([
        '.yo-rc.json',
      ]);
    });
    it('re-running generator and updating artifactId in existing project', function(done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .withOptions({
          'skip-install': true,
          'force':true
        })
        .inTmpDir(function() {
          // we want our test to run inside the previously generated directory
          // and we don't want it to be empty, so this is a hack for that.
          process.chdir(this.osTempDir);
        }.bind(this))
        .withPrompts({
          abortExistingProject: false,
          sdkVersion: '2.1.1',
          projectArtifactId: 'test-artifact-1',
          abortProjectArtifactIdUpdate: false,
        })
        .on('end', function() {
          assert.equal(fs.existsSync(this.osTempDir),true);
          assert.equal(fs.existsSync(path.join(this.osTempDir,'test-artifact-1')),false);
          assert.file([
            path.join(this.osTempDir, 'pom.xml'),
          ]);
          assert.fileContent(
            'pom.xml',
            /<artifactId>test-artifact-1<\/artifactId>/
          );
          done();
        }.bind(this));
    }.bind(this));
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
