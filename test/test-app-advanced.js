'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

describe('generator-alfresco:app', function () {
  describe('default prompts', function () {
    this.timeout(60000);
    var osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          projectStructure: 'advanced',
        })
        .toPromise();
    });

    it('creates advanced files and folders', function () {
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
        constants.FOLDER_CUSTOMIZATIONS + '/amps/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/amps_share/README.md',
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

    it('adds customizations to modules in top pom', function () {
      assert.fileContent(
        'pom.xml',
        /<module>customizations<\/module>/
      );
    });

    describe('generate second pair of source modules', function () {
      before(function () {
        return helpers.run(path.join(__dirname, '../generators/amp-add-source'))
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
          .toPromise();
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
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
