'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:surf-extensions-3-0-1', function () {
  this.timeout(60000);
  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '3.0.1',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: false,
        removeDefaultSourceSamples: false,
      })
      .toPromise();
  });

  it('create surf extension in existing project', function () {
    return helpers.run(path.join(__dirname, '../generators/surf-extension'))
      .cd(osTempDir)
      .withOptions({
        'force': true,
        'surf-extension-name': 'test',
        'module-id': 'Test Module',
        'module-version': '1.0',
        'module-description': 'This is just a test',
        'auto-deploy': 'true',
      })
      .toPromise()
      .then(dir => {
        const surfExtensionFile = path.join(osTempDir, 'temp-test-share-jar/src/main/resources/alfresco/web-extension/site-data/extensions/test-extension.xml');
        assert.file([
          surfExtensionFile,
        ]);
        assert.fileContent(
          surfExtensionFile,
          /<id>Test Module<\/id>/
        );
        assert.fileContent(
          surfExtensionFile,
          /<description>This is just a test<\/description>/
        );
        assert.fileContent(
          surfExtensionFile,
          /<version>1.0<\/version>/
        );
        assert.fileContent(
          surfExtensionFile,
          /<auto-deploy>true<\/auto-deploy>/
        );
      });
  });

  it('create with invalid version', function () {
    return helpers.run(path.join(__dirname, '../generators/surf-extension'))
      .cd(osTempDir)
      .withPrompts({
        'force': true,
        'surf-extension-name': 'invalidVersion',
        'module-id': 'Test Module',
        'module-version': 'a',
        'module-description': 'This is just a test',
        'auto-deploy': 'true',
      })
      .toPromise()
      .then(dir => {
        assert.noFile([
          'temp-test-share-jar/src/main/resources/alfresco/web-extension/site-data/extensions/invalidVersion-extension.xml',
        ].map(relativePath => path.join(osTempDir, relativePath)));
      });
  });

  it('create with invalid auto deploy', function () {
    return helpers.run(path.join(__dirname, '../generators/surf-extension'))
      .cd(osTempDir)
      .withPrompts({
        'force': true,
        'surf-extension-name': 'invalidAutoDeploy',
        'module-id': 'Test Module',
        'module-version': '1.0',
        'module-description': 'This is just a test',
        'auto-deploy': 'test',
      })
      .toPromise()
      .then(dir => {
        assert.noFile([
          'temp-test-share-jar/src/main/resources/alfresco/web-extension/site-data/extensions/invalidAutoDeploy-extension.xml',
        ].map(relativePath => path.join(osTempDir, relativePath)));
      });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
