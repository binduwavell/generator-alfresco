'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');
var fs = require('fs');
var rmdir = require('rmdir');

describe('generator-alfresco:app', function () {
  describe('default prompts', function () {
    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .on('end', done);
    });

    it('creates files', function () {
      // TODO(bwavell): add more tests
      assert.file([
        '.editorconfig',
        '.gitignore',
        '.yo-rc.json',
        'pom.xml',
        'debug.sh',
        'run.sh',
        'run.bat',
        'run-without-springloaded.sh',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.sh',
        'scripts/run.bat',
        'scripts/run-without-springloaded.sh',
        'amps/README.md',
        'amps_share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/share-amp/pom.xml',
        'repo/pom.xml',
        'runner/pom.xml',
        'share/pom.xml',
        'solr-config/pom.xml',
        'TODO.md',
      ]);
    });
    it('adds amps_source to modules in top pom', function () {
      assert.fileContent(
        'pom.xml',
        /<module>customizations<\/module>/
      );
    });
    it('debug.sh does not reference springloaded', function () {
      assert.noFileContent(
        'scripts/debug.sh',
        /springloaded/
      );
    });
    it('does not create enterprise specific files', function () {
      assert.noFile([
        'repo/src/main/resources/alfresco/extension/license/README.md',
      ]);
    });
    it('run.sh and debug.sh should not include -Penterprise flag', function () {
      assert.noFileContent([
        ['debug.sh', /-Penterprise/],
        ['run.sh', /-Penterprise/],
        ['run.bat', /-Penterprise/],
        ['run-without-springloaded.sh', /-Penterprise/],
        ['scripts/debug.sh', /-Penterprise/],
        ['scripts/run.sh', /-Penterprise/],
        ['scripts/run.bat', /-Penterprise/],
        ['scripts/run-without-springloaded.sh', /-Penterprise/],
      ]);
    });
    describe('generate model without modules', function () {
      var osTempDir = path.join(os.tmpdir(), 'temp-test');
      before(function (done) {
        helpers.run(path.join(__dirname, '../generators/model'))
          // generator will create a temp directory and make sure it's empty
          .inTmpDir(function () {
            // we want our test to run inside the previously generated directory
            // and we don't want it to be empty, so this is a hack for that.
            // process.chdir(path.join(this.osTempDir, 'temp-test'));
            process.chdir(osTempDir);
          })
          .withOptions({
            'model-name': 'testModel',
            'model-description': 'test desc',
            'model-author': 'test author',
            'model-version': '1.0',
            'namespace-prefix': 'zz',
          })
          .on('end', done);
      });

      it('model files should not be generated', function () {
        var modelFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml');
        var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/test-model-context.xml');
        assert.noFile([
          modelFile,
          contextFile,
        ]);
      });
    });
  });

  describe('generate project with source amps', function () {
    this.timeout(60000);
    var osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          removeDefaultSourceAmps: false,
        })
        .on('end', done);
    });
    describe('generate second pair of modules', function () {
      before(function (done) {
        helpers.run(path.join(__dirname, '../generators/amp-add-source'))
          // generator will create a temp directory and make sure it's empty
          .inTmpDir(function () {
            // HACK: we want our test to run inside the previously generated
            // directory and we don't want it to be empty, so this is a hack
            // for that.
            process.chdir(osTempDir);
          })
          .withOptions({
            'force': true, // tests can't handle conflicts
            'war': 'both',
            'project-group-id': 'org.alfresco',
            'project-artifact-id': 'both-customizations',
            'project-version': '1.0.0-SNAPSHOT',
            'remove-default-source-samples': false,
            'create-parent': false,
            'parent-name': '',
            'parent-description': '',
            'repo-name': '',
            'repo-description': '',
          })
          .on('end', done);
      });
      it('amp files exist in project', function () {
        assert.file([
          path.join(osTempDir, 'customizations/both-customizations-repo-amp/pom.xml'),
          path.join(osTempDir, 'customizations/both-customizations-share-amp/pom.xml'),
        ]);
      });
      it('sample files exist in project', function () {
        assert.file([
          path.join(osTempDir, 'customizations/both-customizations-repo-amp/src/main/amp/web/css/demoamp.css'),
          path.join(osTempDir, 'customizations/both-customizations-share-amp/src/main/amp/web/js/example/widgets/TemplateWidget.js'),
        ]);
      });
      describe('generate a valid model', function () {
        before(function (done) {
          helpers.run(path.join(__dirname, '../generators/model'))
            // generator will create a temp directory and make sure it's empty
            .inTmpDir(function () {
              // we want our test to run inside the previously generated directory
              // and we don't want it to be empty, so this is a hack for that.
              // process.chdir(path.join(this.osTempDir, 'temp-test'));
              process.chdir(osTempDir);
            })
            .withOptions({
              'model-name': 'testModel',
              'model-description': 'test desc',
              'model-author': 'test author',
              'model-version': '1.0',
              'namespace-prefix': 'zz',
            })
            .on('end', done);
        });
        it('model files should not be generated', function () {
          var modelFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/generated/testModel.xml');
          var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/test-model-context.xml');
          assert.noFile([
            modelFile,
            contextFile,
          ]);
        });
      });
    });
  });

  describe('generate project within a different yeoman project', function () {
    this.timeout(60000);
    var osTempDir = path.join(os.tmpdir(), 'a-yo-project');
    if (!fs.existsSync(osTempDir)) {
      fs.mkdirSync(osTempDir);
    } else {
      rmdir(osTempDir, function (err, dirs, files) {
        if (err) throw err;
        fs.mkdirSync(osTempDir);
      });
    }

    before(function (done) {
      process.chdir(osTempDir);
      fs.writeFile('.yo-rc.json', JSON.stringify({ 'generator-generator': {} }));
      helpers.run(path.join(__dirname, '../generators/app'))
        .inTmpDir(function () {
          // we want our test to run inside the previously generated directory
          // and we don't want it to be empty, so this is a hack for that.
          process.chdir(osTempDir);
        })
        .withOptions({ 'skip-install': true })
        .withPrompts({
          removeDefaultSourceAmps: false,
        })
        .on('end', done);
    });
    it('did not create files', function () {
      assert.noFile([
        '.editorconfig',
        '.gitignore',
        'pom.xml',
        'debug.sh',
        'run.sh',
        'run.bat',
        'run-without-springloaded.sh',
        'scripts/debug.sh',
        'scripts/env.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.sh',
        'scripts/run.bat',
        'scripts/run-without-springloaded.sh',
        'amps/README.md',
        'amps_share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/share-amp/pom.xml',
        'repo/pom.xml',
        'runner/pom.xml',
        'share/pom.xml',
        'solr-config/pom.xml',
        'TODO.md',
      ]);
    });
    it('.yo-rc.json does not contain generator-alfresco', function () {
      assert.noFileContent(
        '.yo-rc.json',
        /generator-alfresco/
      );
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
