'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const fs = require('fs');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:jar-add-local-3-1-0', function () {
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

    it('project does not reference platform-jar or share-jar in top pom.xml', function () {
      assert.noFileContent([
        [path.join(osTempDir, 'pom.xml'), /<artifactId>platform-jar</],
        [path.join(osTempDir, 'pom.xml'), /<artifactId>share-jar</],
      ]);
    });

    describe('installing a local platform jar using options', function () {
      before(function () {
        const jarSrc = path.join(__dirname, 'fixtures/platform-jar.jar');
        const jarPath = path.join(osTempDir, 'customizations/modules/platform/platform-jar.jar');
        fs.writeFileSync(jarPath, fs.readFileSync(jarSrc));
        return helpers.run(path.join(__dirname, '../generators/jar-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
            'path': 'customizations/modules/platform/platform-jar.jar',
            'group-id': 'org.alfresco',
            'artifact-id': 'platform-jar',
            'amp-version': '1.0.0-SNAPSHOT',
          })
          .toPromise();
      });

      it('references platform-jar in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>platform-jar</);
      });
    });

    describe('installing a local share jar using prompts', function () {
      before(function () {
        const ampSrc = path.join(__dirname, 'fixtures/share-jar.jar');
        const ampPath = path.join(osTempDir, 'customizations/modules/share/share-jar.jar');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/jar-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .withPrompts({
            'path': 'customizations/modules/share/share-jar.jar',
          })
          .toPromise();
      });

      it('references share-jar in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>share-jar</);
      });
    });

    describe('installing an empty local platform jar using prompts', function () {
      before(function () {
        const ampSrc = path.join(__dirname, 'fixtures/empty-jar.jar');
        const ampPath = path.join(osTempDir, 'customizations/modules/platform/empty-jar.jar');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/jar-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .withPrompts({
            'path': 'customizations/modules/platform/empty-jar.jar',
            'groupId': 'com.empty',
            'artifactId': 'empty-jar',
            'ampVersion': '1.0.0-SNAPSHOT',
          })
          .toPromise();
      });

      it('references jar in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>empty-jar</);
      });
    });

    describe('attempting to install a local jar using invalid options when all jars are accounted for', function () {
      // if you skip the previous test so that the share amp is not installed
      // prior to this code running this will fail with nasty errors related
      // to options not being provided. If however, the previous tests are run
      // the then when we get here the prompts are not even displayed because
      // we bail when we discover that there are no amps in ./amps or
      // ./amps_share that aren't already referenced in the module registry.
      before(function () {
        const ampSrc = path.join(__dirname, 'fixtures/share-jar.jar');
        const ampPath = path.join(osTempDir, 'customizations/modules/share/share-jar.jar');
        fs.writeFileSync(ampPath, fs.readFileSync(ampSrc));
        return helpers.run(path.join(__dirname, '../generators/jar-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
          })
          .toPromise();
      });

      it('references jar in top pom.xml', function () {
        assert.fileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>share-jar</);
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

    describe('installing a non-existent local platform jar using options', function () {
      before(function () {
        return helpers.run(path.join(__dirname, '../generators/amp-add-local'))
          .cd(osTempDir)
          .withOptions({
            'force': true, // tests can't handle conflicts
            'path': 'customizations/modules/platform/platform-jar.jar',
            'group-id': 'org.alfresco',
            'artifact-id': 'platform-jar',
            'amp-version': '1.0.0-SNAPSHOT',
          })
          .toPromise();
      });

      it('does not reference platform-jar in top pom.xml because basic projects don\'t have a customizations folder', function () {
        assert.noFileContent(path.join(osTempDir, 'pom.xml'), /<artifactId>platform-jar</);
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
