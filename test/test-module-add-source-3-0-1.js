'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:module-add-source-3-0-1', function () {
  this.timeout(30000);

  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  // We need a test project setup before we begin
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '3.0.1',
        projectStructure: 'advanced',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: true,
      })
      .toPromise();
  });

  describe('after creating both a repo and share source module', function () {
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

    it('module files exist in project', function () {
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

  describe('after creating both repo and share source modules and removing samples', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/module-add-source'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'both',
          'project-group-id': 'org.alfresco',
          'project-artifact-id': 'remove-samples',
          'project-version': '1.0.0-SNAPSHOT',
          'remove-default-source-samples': true,
          'create-parent': false,
          'parent-name': '',
          'parent-description': '',
          'repo-name': '',
          'repo-description': '',
        })
        .toPromise();
    });

    it('module files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'customizations/remove-samples-repo/pom.xml'),
        path.join(osTempDir, 'customizations/remove-samples-share/pom.xml'),
      ]);
    });

    it('sample files do not exist in project', function () {
      assert.noFile([
        path.join(osTempDir, 'customizations/remove-samples-repo/src/main/resources/alfresco/extension/templates/webscripts/alfresco/tutorials/helloworld.get.desc.xml'),
        path.join(osTempDir, 'customizations/remove-samples-share/src/main/resources/META-INF/resources/remove-samples-share/js/tutorials/widgets/css/TemplateWidget.css'),
      ]);
    });
  });

  describe('after creating both repo and share source modules via prompts', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/module-add-source'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
        })
        .withPrompts({
          'war': 'Both repo & share',
          'projectGroupId': 'org.alfresco',
          'projectArtifactIdPrefix': 'prompts',
          'projectVersion': '1.0.0-SNAPSHOT',
          'removeDefaultSourceSamples': false,
          'createParent': false,
          'parentName': 'parent name',
          'parentDescription': 'parent description',
          'repoName': 'repo name',
          'repoDescription': 'repo description',
          'shareName': 'share name',
          'shareDescription': 'share description',
        })
        .toPromise();
    });

    it('module files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'customizations/prompts-repo/pom.xml'),
        path.join(osTempDir, 'customizations/prompts-share/pom.xml'),
      ]);
    });
  });

  describe('after creating repo source module', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/module-add-source'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'repo',
          'project-group-id': 'org.alfresco',
          'project-artifact-id': 'repo-customizations',
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

    it('repo module files exist in project', function () {
      assert.file(path.join(osTempDir, 'customizations/repo-customizations-repo/pom.xml'));
    });

    it('share modules files do NOT exist in project', function () {
      assert.noFile(path.join(osTempDir, 'customizations/repo-customizations-share/pom.xml'));
    });
  });

  describe('after creating share source module', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/module-add-source'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'share',
          'project-group-id': 'org.alfresco',
          'project-artifact-id': 'share-customizations',
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

    it('share module files exist in project', function () {
      assert.file(path.join(osTempDir, 'customizations/share-customizations-share/pom.xml'));
    });

    it('repo module files do NOT exist in project', function () {
      assert.noFile(path.join(osTempDir, 'customizations/share-customizations-repo/pom.xml'));
    });
  });

  describe('after creating both repo and share source modules in parent folder', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/module-add-source'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'both',
          'project-group-id': 'org.alfresco',
          'project-artifact-id': 'both-parent',
          'project-version': '1.0.0-SNAPSHOT',
          'remove-default-source-samples': false,
          'create-parent': true,
          'parent-name': 'parent name',
          'parent-description': 'parent description',
          'repo-name': 'repo name',
          'repo-description': 'repo description',
        })
        .toPromise();
    });

    it('module files exist under the parent project folder', function () {
      assert.file([
        path.join(osTempDir, 'customizations/both-parent-parent/pom.xml'),
        path.join(osTempDir, 'customizations/both-parent-parent/both-parent-repo/pom.xml'),
        path.join(osTempDir, 'customizations/both-parent-parent/both-parent-share/pom.xml'),
      ]);
    });
  });

  describe('when creating source module with invalid war type', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/module-add-source'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'war': 'asdf',
          'project-artifact-id': 'invalid-war-type',
          'remove-default-source-samples': true,
        })
        .toPromise();
    });

    it('nothing is created', function () {
      assert.noFile([
        path.join(osTempDir, 'customizations/invalid-war-type-repo/pom.xml'),
        path.join(osTempDir, 'customizations/invalid-war-type-share/pom.xml'),
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
