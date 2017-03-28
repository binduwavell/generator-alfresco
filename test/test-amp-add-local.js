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

  describe('an advanced project', function () {
    var osTempDir = path.join(os.tmpdir(), 'temp-test');

    // We need a test project setup before we begin
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectStructure: 'advanced',
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
      before(function () {
        var ampSrc = path.join(__dirname, 'fixtures/repo-amp.amp');
        var ampPath = path.join(osTempDir, 'customizations/amps/repo-amp.amp');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
            'path': 'customizations/amps/repo-amp.amp',
            'group-id': 'org.alfresco',
            'artifact-id': 'repo-amp',
            'amp-version': '1.0.0-SNAPSHOT',
          })
          .toPromise();
      });

      it('references amp in repo/pom.xml', function () {
        assert.fileContent(
          path.join(osTempDir, 'repo/pom.xml'),
          /<artifactId>repo-amp</
        );
      });
    });

    describe('installing a local share amp using prompts', function () {
      before(function () {
        var ampSrc = path.join(__dirname, 'fixtures/share-amp.amp');
        var ampPath = path.join(osTempDir, 'customizations/amps_share/share-amp.amp');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .withPrompts({
            'path': 'customizations/amps_share/share-amp.amp',
          })
          .toPromise();
      });

      it('references amp in share/pom.xml', function () {
        assert.fileContent([
          [path.join(osTempDir, 'share/pom.xml'), /<groupId>org.alfresco</],
          [path.join(osTempDir, 'share/pom.xml'), /<artifactId>share-amp</],
          [path.join(osTempDir, 'share/pom.xml'), /<version>1.0.0-SNAPSHOT</],
        ]);
      });
    });

    describe('installing an empty local repo amp using prompts', function () {
      before(function () {
        var ampSrc = path.join(__dirname, 'fixtures/empty-amp.amp');
        var ampPath = path.join(osTempDir, 'customizations/amps/empty-amp.amp');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .withPrompts({
            'path': 'customizations/amps/empty-amp.amp',
            'groupId': 'com.empty',
            'artifactId': 'empty-amp',
            'ampVersion': '1.0.0-SNAPSHOT',
          })
          .toPromise();
      });

      it('references amp in share/pom.xml', function () {
        assert.fileContent([
          [path.join(osTempDir, 'repo/pom.xml'), /<groupId>com.empty</],
          [path.join(osTempDir, 'repo/pom.xml'), /<artifactId>empty-amp</],
          [path.join(osTempDir, 'repo/pom.xml'), /<version>1.0.0-SNAPSHOT</],
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
      before(function () {
        var ampSrc = path.join(__dirname, 'fixtures/share-amp.amp');
        var ampPath = path.join(osTempDir, 'customizations/amps_share/share-amp.amp');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .toPromise();
      });

      it('references amp in repo/pom.xml', function () {
        assert.fileContent(
          path.join(osTempDir, 'repo/pom.xml'),
          /<artifactId>repo-amp</
        );
      });
    });
  });

  describe('a basic project', function () {
    var osTempDir = path.join(os.tmpdir(), 'temp-test');

    // We need a test project setup before we begin
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({'skip-install': true})
        .withPrompts({
          sdkVersion: '2.1.1',
          projectStructure: 'basic',
          projectArtifactId: 'temp-test',
        })
        .toPromise();
    });

    it('has basic project assets', function () {
      assert.file([
        path.join(osTempDir, 'pom.xml'),
        path.join(osTempDir, 'run.sh'),
      ]);
    });

    describe('installing a non-existent local repo amp using options', function () {
      before(function () {
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
            'path': 'customizations/amps/repo-amp.amp',
            'group-id': 'org.alfresco',
            'artifact-id': 'repo-amp',
            'amp-version': '1.0.0-SNAPSHOT',
          })
          .toPromise();
      });

      it('does not reference amp in repo/pom.xml because basic projects don\'t have a customizations folder', function () {
        assert.noFileContent(
          path.join(osTempDir, 'repo/pom.xml'),
          /<artifactId>repo-amp</
        );
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
