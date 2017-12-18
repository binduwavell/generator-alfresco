'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:module-add-source', function () {
  this.timeout(30000);

  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  // We need a test project setup before we begin
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
        projectStructure: 'advanced',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: true,
      })
      .toPromise();
  });

  describe('after creating both a repo and share amp', function () {
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
  });

  describe('after creating both a repo and share amp and removing samples', function () {
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

    it('amp files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'customizations/remove-samples-repo-amp/pom.xml'),
        path.join(osTempDir, 'customizations/remove-samples-share-amp/pom.xml'),
      ]);
    });

    it('sample files do not exist in project', function () {
      assert.noFile([
        path.join(osTempDir, 'customizations/remove-samples-repo-amp/src/main/amp/web/css/demoamp.css'),
        path.join(osTempDir, 'customizations/remove-samples-share-amp/src/main/amp/web/js/example/widgets/TemplateWidget.js'),
      ]);
    });
  });

  describe('after creating both a repo and share amp via prompts', function () {
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

    it('amp files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'customizations/prompts-repo-amp/pom.xml'),
        path.join(osTempDir, 'customizations/prompts-share-amp/pom.xml'),
      ]);
    });
  });

  describe('after creating repo amp', function () {
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

    it('repo amp files exist in project', function () {
      assert.file(path.join(osTempDir, 'customizations/repo-customizations-repo-amp/pom.xml'));
    });

    it('share amp files do NOT exist in project', function () {
      assert.noFile(path.join(osTempDir, 'customizations/repo-customizations-share-amp/pom.xml'));
    });
  });

  describe('after creating share amp', function () {
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

    it('share amp files exist in project', function () {
      assert.file(path.join(osTempDir, 'customizations/share-customizations-share-amp/pom.xml'));
    });

    it('repo amp files do NOT exist in project', function () {
      assert.noFile(path.join(osTempDir, 'customizations/share-customizations-repo-amp/pom.xml'));
    });
  });

  describe('after creating both repo and share amps in parent folder', function () {
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

    it('amp files exist under the parent project folder', function () {
      assert.file([
        path.join(osTempDir, 'customizations/both-parent-parent/pom.xml'),
        path.join(osTempDir, 'customizations/both-parent-parent/both-parent-repo-amp/pom.xml'),
        path.join(osTempDir, 'customizations/both-parent-parent/both-parent-share-amp/pom.xml'),
      ]);
    });
  });

  describe('when creating amp with invalid war type', function () {
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
        path.join(osTempDir, 'customizations/invalid-war-type-repo-amp/pom.xml'),
        path.join(osTempDir, 'customizations/invalid-war-type-share-amp/pom.xml'),
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
