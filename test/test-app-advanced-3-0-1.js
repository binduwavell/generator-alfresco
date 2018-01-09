'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const constants = require('generator-alfresco-common').constants;
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:app-advanced-3-0-1', function () {
  describe('default prompts', function () {
    this.timeout(60000);
    const osTempDir = path.join(os.tmpdir(), 'temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '3.0.1',
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
        constants.FOLDER_CUSTOMIZATIONS + '/amps/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/amps_share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/modules/platform/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/modules/share/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/README.md',
        constants.FOLDER_CUSTOMIZATIONS + '/pom.xml',
        constants.FOLDER_INTEGRATION_TESTS + '/src/test/java/org/alfresco/platformsample/CustomContentModelIT.java.sample',
        constants.FOLDER_INTEGRATION_TESTS + '/src/test/java/org/alfresco/platformsample/DemoComponentIT.java.sample',
        constants.FOLDER_INTEGRATION_TESTS + '/src/test/java/org/alfresco/platformsample/HelloWorldWebScriptIT.java.sample',
        constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
        constants.FOLDER_SOURCE_TEMPLATES + '/temp-test-platform-jar/pom.xml',
        constants.FOLDER_SOURCE_TEMPLATES + '/temp-test-share-jar/pom.xml',
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
          path.join(osTempDir, 'customizations/both-customizations-repo/pom.xml'),
          path.join(osTempDir, 'customizations/both-customizations-share/pom.xml'),
        ]);
      });

      it('sample files exist in project', function () {
        assert.file([
          path.join(osTempDir, 'customizations/both-customizations-repo/src/main/resources/alfresco/extension/templates/webscripts/alfresco/tutorials/helloworld.get.desc.xml'),
          path.join(osTempDir, 'customizations/both-customizations-share/src/main/resources/META-INF/resources/both-customizations-share/js/tutorials/widgets/css/TemplateWidget.css'),
        ]);
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
