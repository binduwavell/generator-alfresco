'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const fs = require('fs');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:amp-add-local-3-1-0', function () {
  this.timeout(30000);

  describe('an advanced project', function () {
    const osTempDir = path.join(os.tmpdir(), 'temp-test');

    // We need a test project setup before we begin
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '3.1.0',
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

    it('project does not reference repo-amp or share-amp in top pom.xml', function () {
      assert.noFileContent([
        [path.join(osTempDir, 'pom.xml'), /<artifactId>repo-amp</],
        [path.join(osTempDir, 'pom.xml'), /<artifactId>share-amp</],
      ]);
    });

    describe('installing a local repo amp using options', function () {
      before(function () {
        const ampSrc = path.join(__dirname, 'fixtures/repo-amp.amp');
        const ampPath = path.join(osTempDir, 'customizations/amps/repo-amp.amp');
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

      it('references repo-amp in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>repo-amp</);
      });
    });

    describe('installing a local share amp using prompts', function () {
      before(function () {
        const ampSrc = path.join(__dirname, 'fixtures/share-amp.amp');
        const ampPath = path.join(osTempDir, 'customizations/amps_share/share-amp.amp');
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

      it('references share-amp in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>share-amp</);
      });
    });

    describe('installing an empty local repo amp using prompts', function () {
      before(function () {
        const ampSrc = path.join(__dirname, 'fixtures/empty-amp.amp');
        const ampPath = path.join(osTempDir, 'customizations/amps/empty-amp.amp');
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

      it('references amp in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>empty-amp</);
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
        const ampSrc = path.join(__dirname, 'fixtures/share-amp.amp');
        const ampPath = path.join(osTempDir, 'customizations/amps_share/share-amp.amp');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .toPromise();
      });

      it('references amp in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>share-amp</);
      });
    });
  });

  describe('a basic project', function () {
    const osTempDir = path.join(os.tmpdir(), 'temp-test');

    // We need a test project setup before we begin
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({'skip-install': true})
        .withPrompts({
          sdkVersion: '3.1.0',
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

      it('does not reference repo-amp in top pom.xml because basic projects don\'t have a customizations folder', function () {
        assert.noFileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>repo-amp</);
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
