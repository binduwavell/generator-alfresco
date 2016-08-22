'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

describe('generator-alfresco:model', function () {
  this.timeout(60000);
  var osTempDir = path.join(os.tmpdir(), 'temp-test');

  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: false,
        removeDefaultSourceSamples: false,
      })
      .toPromise();
  });

  // TODO(vprince): break down into describe/it
  it('create model files in existing project', function () {
    return helpers.run(path.join(__dirname, '../generators/model'))
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function () {
        // HACK: we want our test to run inside the previously generated
        // directory and we don't want it to be empty, so this is a hack
        // for that.
        process.chdir(osTempDir);
      })
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
      .then(function (dir) {
        var modelFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml');
        var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/test-model-context.xml');
        var messageFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/generated/testModel.properties');
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
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function () {
        // HACK: we want our test to run inside the previously generated
        // directory and we don't want it to be empty, so this is a hack
        // for that.
        process.chdir(osTempDir);
      })
      .withOptions({
        'model-name': 'invalidVersionModel',
        'model-version': 'asd',
      })
      .toPromise()
      .then(function (dir) {
        // console.log(fs.readdirSync(path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated')));
        assert.noFile([
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/invalidVersionModel.xml'),
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/invalidversion-model-context.xml'),
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/generated/invalidVersionModel.properties'),
        ]);
      });
  });

  // TODO(vprince): break down into describe/it with some assertion about the expected state
  it('name only contains invalid characters for coverage', function () {
    return helpers.run(path.join(__dirname, '../generators/model'))
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function () {
        // HACK: we want our test to run inside the previously generated
        // directory and we don't want it to be empty, so this is a hack
        // for that.
        process.chdir(osTempDir);
      })
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
