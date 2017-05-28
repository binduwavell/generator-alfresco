'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var constants = require('generator-alfresco-common').constants;
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');
var fs = require('fs');
var rmdir = require('rmdir');

describe('generator-alfresco:app', function () {
  describe('default prompts', function () {
    this.timeout(60000);

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .toPromise();
    });

    it('creates basic files', function () {
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

    it('does not create advanced files', function () {
      // TODO(bwavell): add more tests
      assert.noFile([
        constants.FOLDER_CUSTOMIZATIONS + '/amps/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/amps_share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/pom.xml',
      ]);
    });

    it('does not add customizations to modules in top pom', function () {
      assert.noFileContent(
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

    describe('when trying to generate model without any source modules', function () {
      var osTempDir = path.join(os.tmpdir(), 'temp-test');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/model'))
          .cd(osTempDir)
          .withOptions({
            'model-name': 'testModel',
            'model-description': 'test desc',
            'model-author': 'test author',
            'model-version': '1.0',
            'namespace-uri': 'http://www.test.com/model/content/1.0',
            'namespace-prefix': 'zz',
          })
          .toPromise();
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

  describe('generate project with default source amps', function () {
    this.timeout(60000);
    var osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          removeDefaultSourceAmps: false,
        })
        .toPromise();
    });

    describe('generate second pair of source modules', function () {
      before(function () {
        return helpers.run(path.join(__dirname, '../generators/amp-add-source'))
          .cd(osTempDir)
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
          .toPromise();
      });

      it('amp files exist in project', function () {
        assert.file([
          path.join(osTempDir, 'both-customizations-repo-amp/pom.xml'),
          path.join(osTempDir, 'both-customizations-share-amp/pom.xml'),
        ]);
      });

      it('sample files exist in project', function () {
        assert.file([
          path.join(osTempDir, 'both-customizations-repo-amp/src/main/amp/web/css/demoamp.css'),
          path.join(osTempDir, 'both-customizations-share-amp/src/main/amp/web/js/example/widgets/TemplateWidget.js'),
        ]);
      });

      describe('generate a model without specifying which source amp to target', function () {
        before(function () {
          return helpers.run(path.join(__dirname, '../generators/model'))
            .cd(osTempDir)
            .withOptions({
              'model-name': 'testModel',
              'model-description': 'test desc',
              'model-author': 'test author',
              'model-version': '1.0',
              'namespace-uri': 'http://www.test.com/model/content/1.0',
              'namespace-prefix': 'zz',
            })
            .toPromise();
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

    before(function () {
      process.chdir(osTempDir);
      fs.writeFileSync('.yo-rc.json', JSON.stringify({ 'generator-generator': {} }));
      return helpers.run(path.join(__dirname, '../generators/app'))
        .cd(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          removeDefaultSourceAmps: false,
        })
        .toPromise();
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
