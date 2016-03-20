'use strict';
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:model', function () {
  this.timeout(60000);
  var osTempDir = path.join(os.tmpdir(), 'temp-test');

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

  it('create model files in existing project', function(done) {
    helpers.run(path.join(__dirname, '../generators/model'))
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function() {
        // we want our test to run inside the previously generated directory
        // and we don't want it to be empty, so this is a hack for that.
        //process.chdir(path.join(this.osTempDir, 'temp-test'));
        process.chdir(osTempDir);
      })
      .withOptions({
        "model-name": "testModel",
        "model-description": "test desc",
        "model-author": "test author",
        "model-version": "1.0",
        "namespace-prefix": "zz",
      })
      .on('end', function() {
        assert.file([
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml'),
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/test-model-context.xml'),
        ]);
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml'),
          /<model name="zz:test"/
        );
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml'),
          /<version>1.0<\/version>/
        );
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml'),
          /<author>test author<\/author>/
        );
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml'),
          /<description>test desc<\/description>/
        );
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml'),
          /<namespace uri="http:\/\/www.test.com\/model\/content\/1.0" prefix="zz"\/>/
        );
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/test-model-context.xml'),
          /<bean id="test.dictionaryBootstrap"/
        );
        assert.fileContent(
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/test-model-context.xml'),
          /<value>alfresco\/module\/\${project.artifactId}\/model\/generated\/testModel.xml<\/value>/
        );
        done();
      });
  });

  it('create with invalid version', function(done) {
    helpers.run(path.join(__dirname, '../generators/model'))
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function() {
        // we want our test to run inside the previously generated directory
        // and we don't want it to be empty, so this is a hack for that.
        //process.chdir(path.join(this.osTempDir, 'temp-test'));
        process.chdir(osTempDir);
      })
      .withOptions({
        "model-name": "invalidVersionModel",
        "model-version": "asd",
      })
      .on('end', function() {
        //console.log(fs.readdirSync(path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated')));
        assert.noFile([
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/invalidVersionModel.xml'),
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/invalidversion-model-context.xml'),
        ]);
        done();
      });
  });

  it('handle integer version', function(done) {
    helpers.run(path.join(__dirname, '../generators/model'))
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function() {
        // we want our test to run inside the previously generated directory
        // and we don't want it to be empty, so this is a hack for that.
        //process.chdir(path.join(this.osTempDir, 'temp-test'));
        process.chdir(osTempDir);
      })
      .withOptions({
        "model-name": "numericVersionModel",
        "model-description": "test desc",
        "model-author": "test author",
        "model-version": 1,
        "namespace-prefix": "zz",
      })
      .on('end', function() {
        assert.file([
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/numericversionModel.xml'),
          path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/numericversion-model-context.xml'),
        ]);
        done();
      });
  });

  it('name only invalid characters for coverage', function(done) {
    helpers.run(path.join(__dirname, '../generators/model'))
      // generator will create a temp directory and make sure it's empty
      .inTmpDir(function() {
        // we want our test to run inside the previously generated directory
        // and we don't want it to be empty, so this is a hack for that.
        //process.chdir(path.join(this.osTempDir, 'temp-test'));
        process.chdir(osTempDir);
      })
      .withOptions({
        "model-name": "......",
        "model-description": "test desc",
        "model-author": "test author",
        "model-version": 1,
        "namespace-prefix": "zz",
      })
      .on('end', done);
  });

});
