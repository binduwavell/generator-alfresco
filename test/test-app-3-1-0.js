'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const constants = require('generator-alfresco-common').constants;
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:app-3-1-0', function () {
  describe('SDK 3.1.0', function () {
    this.timeout(60000);

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '3.1.0',
          projectArtifactId: 'test-artifact',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    it('creates files', function () {
      // TODO(bwavell): add more tests
      assert.file([
        '.editorconfig',
        '.gitignore',
        '.yo-rc.json',
        'pom.xml',
        'debug.bat',
        'debug.sh',
        'run.bat',
        'run.sh',
        'scripts/debug.bat',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.bat',
        'scripts/run.sh',
        constants.FOLDER_INTEGRATION_TESTS + '/src/test/java/org/alfresco/platformsample/CustomContentModelIT.java',
        constants.FOLDER_INTEGRATION_TESTS + '/src/test/java/org/alfresco/platformsample/DemoComponentIT.java',
        constants.FOLDER_INTEGRATION_TESTS + '/src/test/java/org/alfresco/platformsample/HelloWorldWebScriptIT.java',
        constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/test-artifact-platform-jar/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/test-artifact-share-jar/pom.xml',
        'test-artifact-platform-jar/pom.xml',
        'test-artifact-share-jar/pom.xml',
        'TODO.md',
      ]);
    });
    it('adds generic include for generated beans', function () {
      assert.fileContent(
        'test-artifact-platform-jar/src/main/resources/alfresco/module/test-artifact-platform-jar/module-context.xml',
        /<import resource="classpath:alfresco\/module\/\${project\.artifactId}\/context\/generated\/\*-context\.xml"\/>/
      );
    });
    it('edition is community', function () {
      assert.fileContent(
        'pom.xml',
        /<maven.alfresco.edition>community<\/maven.alfresco.edition>/
      );
    });
    it('does not set edition to enterprise', function () {
      assert.noFileContent(
        'pom.xml',
        /<maven.alfresco.edition>enterprise<\/maven.alfresco.edition>/
      );
    });
    it('uses correct folder names for exploding sources', function () {
      assert.fileContent([
        ['scripts/explode-alf-sources.sh',
          /test-artifact-platform-jar/],
        ['scripts/explode-alf-sources.sh',
          /test-artifact-share-jar/],
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
