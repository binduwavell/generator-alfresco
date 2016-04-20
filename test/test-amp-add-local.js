'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var fs = require('fs');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:amp-add-local', function () {
  this.timeout(30000);

  var osTempDir = path.join(os.tmpdir(), 'temp-test');

  // We need a test project setup before we begin
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
        projectArtifactId: 'temp-test',
      })
      .on('end', done);
  });

  it('starts with a basic project', function () {
    assert.file([
      path.join(osTempDir, 'pom.xml'),
      path.join(osTempDir, 'run.sh'),
    ]);
  });

  it('project does not reference repo-amp in repo/pom.xml', function () {
    assert.noFileContent(
      path.join(osTempDir, 'repo/pom.xml'),
      /<artifactId>repo-amp</
    );
  });

  it('project does not reference share-amp in share/pom.xml', function () {
    assert.noFileContent(
      path.join(osTempDir, 'repo/pom.xml'),
      /<artifactId>repo-amp</
    );
  });

  describe('installing a local repo amp using options', function () {
    before(function (done) {
      var ampSrc = path.join(__dirname, 'fixtures/repo-amp.amp');
      var ampPath = path.join(osTempDir, 'amps/repo-amp.amp');
      fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
      helpers.run(path.join(__dirname, '../generators/amp-add-local'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true, // tests can't handle conflicts
          'path': 'amps/repo-amp.amp',
          'group-id': 'org.alfresco',
          'artifact-id': 'repo-amp',
          'version': '1.0.0-SNAPSHOT',
        })
        .on('end', done);
    });

    it('references amp in repo/pom.xml', function () {
      assert.fileContent(
        path.join(osTempDir, 'repo/pom.xml'),
        /<artifactId>repo-amp</
      );
    });
  });

  describe('installing a local share amp using prompts', function () {
    before(function (done) {
      var ampSrc = path.join(__dirname, 'fixtures/share-amp.amp');
      var ampPath = path.join(osTempDir, 'amps_share/share-amp.amp');
      fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
      helpers.run(path.join(__dirname, '../generators/amp-add-local'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true, // tests can't handle conflicts
        })
        .withPrompts({
          'path': 'amps_share/share-amp.amp',
        })
        .on('end', done);
    });

    it('references amp in share/pom.xml', function () {
      assert.fileContent([
        [path.join(osTempDir, 'share/pom.xml'), /<groupId>org.alfresco</],
        [path.join(osTempDir, 'share/pom.xml'), /<artifactId>share-amp</],
        [path.join(osTempDir, 'share/pom.xml'), /<version>1.0.0-SNAPSHOT</],
      ]);
    });
  });

  describe('attempting to install a local amp using invalid options when all amps are accounted for', function () {
    // if you skip the previous test so that the share amp is not installed
    // prior to this code running this will fail with nasty errors related
    // to options not being provided. If however, the previous tests are run
    // the then when we get here the prompts are not even displayed because
    // we bail when we discover that there are no amps in ./amps or
    // ./amps_share that aren't already referenced in the module registry.
    before(function (done) {
      var ampSrc = path.join(__dirname, 'fixtures/share-amp.amp');
      var ampPath = path.join(osTempDir, 'amps_share/share-amp.amp');
      fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
      helpers.run(path.join(__dirname, '../generators/amp-add-local'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true, // tests can't handle conflicts
        })
        .on('end', done);
    });

    it('references amp in repo/pom.xml', function () {
      assert.fileContent(
        path.join(osTempDir, 'repo/pom.xml'),
        /<artifactId>repo-amp</
      );
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
