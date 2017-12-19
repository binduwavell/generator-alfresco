'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const constants = require('generator-alfresco-common').constants;
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:app-advanced-2-1-1', function () {
  describe('default prompts', function () {
    this.timeout(60000);
    const osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
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
        return helpers.run(path.join(__dirname, '../generators/module-add-source'))
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
