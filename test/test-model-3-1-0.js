'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:model-3-1-0', function () {
  this.timeout(60000);
  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '3.1.0',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: false,
        removeDefaultSourceSamples: false,
      })
      .toPromise();
  });

  // TODO(vprince): break down into describe/it
  it('create model files in existing project', function () {
    return helpers.run(path.join(__dirname, '../generators/model'))
      .cd(osTempDir)
      .withOptions({
        'force': true,
        'model-name': 'testModel',
        'model-description': 'test desc',
        'model-author': 'test author',
        'model-version': '1.0',
        'namespace-uri': 'http://www.test.com/model/content/1.0',
        'namespace-prefix': 'zz',
      })
      .toPromise()
      .then(dir => {
        const modelFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/model/generated/testModel.xml');
        const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/test-model-context.xml');
        const messageFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/generated/testModel.properties');
        assert.file([
          modelFile,
          contextFile,
          messageFile,
        ]);
        assert.fileContent(
          modelFile,
          /<model name="zz:test"/
        );
        assert.fileContent(
          modelFile,
          /<version>1.0<\/version>/
        );
        assert.fileContent(
          modelFile,
          /<author>test author<\/author>/
        );
        assert.fileContent(
          modelFile,
          /<description>test desc<\/description>/
        );
        assert.fileContent(
          modelFile,
          /<namespace uri="http:\/\/www.test.com\/model\/content\/1.0" prefix="zz"\/>/
        );
        assert.fileContent(
          contextFile,
          /<bean id="test.dictionaryBootstrap"/
        );
        assert.fileContent(
          contextFile,
          /<value>alfresco\/module\/\${project.artifactId}\/model\/generated\/testModel.xml<\/value>/
        );
        assert.fileContent(
          messageFile,
          /zz_test/
        );
        assert.fileContent(
          contextFile,
          /<value>alfresco\/module\/\${project.artifactId}\/messages\/generated\/testModel<\/value>/
        );
        assert.fileContent(
          contextFile,
          /<property name="models"/
        );
        assert.fileContent(
          contextFile,
          /<property name="labels"/
        );
      });
  });

  // TODO(vprince): break down into describe/it
  it('create with invalid version', function () {
    return helpers.run(path.join(__dirname, '../generators/model'))
      .cd(osTempDir)
      .withOptions({
        'model-name': 'invalidVersionModel',
        'model-version': 'asd',
      })
      .toPromise()
      .then(dir => {
        // console.log(fs.readdirSync(path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/model/generated')));
        assert.noFile([
          'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/model/generated/invalidVersionModel.xml',
          'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/invalidversion-model-context.xml',
          'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/generated/invalidVersionModel.properties',
        ].map(relativePath => path.join(osTempDir, relativePath)));
      });
  });

  // TODO(vprince): break down into describe/it with some assertion about the expected state
  it('name only contains invalid characters for coverage', function () {
    return helpers.run(path.join(__dirname, '../generators/model'))
      .cd(osTempDir)
      .withOptions({
        'model-name': '......',
        'model-description': 'test desc',
        'model-author': 'test author',
        'model-version': 1,
        'namespace-prefix': 'zz',
      })
      .toPromise();
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
