'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var debug = require('debug')('generator-alfresco-test:action');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

describe('generator-alfresco:action', function () {
  this.timeout(60000);
  var osTempDir = path.join(os.tmpdir(), 'temp-test');

  describe('with 2.1.1 project containing default amps and samples', function () {
    before(function () {
      debug('Attempting to scaffold a project to perform tests inside.');
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({'skip-install': true})
        .withPrompts({
          sdkVersion: '2.1.1',
          projectArtifactId: 'temp-test',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    describe('when creating action with two word name', function () {
      var actionFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/actions/TwoWordsActionExecuter.java');
      var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/action-two-words-context.xml');
      var messageFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/repo-amp-two-words-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
          // generator will create a temp directory and make sure it's empty
          .cd(osTempDir)
          .withOptions({
            'name': 'two words',
            'package': 'org.alfresco.actions',
          })
          .toPromise();
      });

      it('creates appropriate action files', function () {
        assert.file([
          actionFile,
          contextFile,
          messageFile,
        ]);
      });

      it('has valid content in action class', function () {
        assert.fileContent([
          [actionFile, /package org\.alfresco\.actions/],
          [actionFile, /class TwoWordsActionExecuter extends/],
          [actionFile, /LogFactory\.getLog\(TwoWordsActionExecuter.class\)/],
          [actionFile, /TwoWordsActionExecuter is processing/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.two-words"/],
          [contextFile, /class="org.alfresco.actions.TwoWordsActionExecuter/],
        ]);
      });
    });

    describe('when creating action with camel case name', function () {
      var actionFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/actions/CamelCaseActionExecuter.java');
      var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/action-camel-case-context.xml');
      var messageFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/repo-amp-camel-case-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
          // generator will create a temp directory and make sure it's empty
          .cd(osTempDir)
          .withOptions({
            'name': 'CamelCase',
            'package': 'org.alfresco.actions',
          })
          .toPromise();
      });

      it('creates appropriate action files', function () {
        assert.file([
          actionFile,
          contextFile,
          messageFile,
        ]);
      });

      it('has valid content in action class', function () {
        assert.fileContent([
          [actionFile, /package org\.alfresco\.actions/],
          [actionFile, /class CamelCaseActionExecuter extends/],
          [actionFile, /LogFactory\.getLog\(CamelCaseActionExecuter.class\)/],
          [actionFile, /CamelCaseActionExecuter is processing/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.camel-case"/],
          [contextFile, /class="org.alfresco.actions.CamelCaseActionExecuter/],
        ]);
      });
    });

    describe('when creating action using package that does not end with .actions', function () {
      var actionFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/actions/TestActionExecuter.java');
      var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/action-test-context.xml');
      var messageFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/repo-amp-test-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
          // generator will create a temp directory and make sure it's empty
          .cd(osTempDir)
          .withOptions({
            'name': 'test',
            'package': 'org.alfresco',
          })
          .toPromise();
      });

      it('creates appropriate action files', function () {
        assert.file([
          actionFile,
          contextFile,
          messageFile,
        ]);
      });

      it('has valid content in action class', function () {
        assert.fileContent([
          [actionFile, /package org\.alfresco\.actions/],
          [actionFile, /class TestActionExecuter extends/],
          [actionFile, /LogFactory\.getLog\(TestActionExecuter.class\)/],
          [actionFile, /TestActionExecuter is processing/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.test"/],
          [contextFile, /class="org.alfresco.actions.TestActionExecuter/],
        ]);
      });
    });

    describe('when creating action using prompts', function () {
      var actionFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/actions/PromptsActionExecuter.java');
      var contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/action-prompts-context.xml');
      var messageFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/repo-amp-prompts-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
          // generator will create a temp directory and make sure it's empty
          .cd(osTempDir)
          .withPrompts({
            'name': 'prompts',
            'package': 'org.alfresco.actions',
          })
          .toPromise();
      });

      it('creates appropriate action files', function () {
        assert.file([
          actionFile,
          contextFile,
          messageFile,
        ]);
      });

      it('has valid content in action class', function () {
        assert.fileContent([
          [actionFile, /package org\.alfresco\.actions/],
          [actionFile, /class PromptsActionExecuter extends/],
          [actionFile, /LogFactory\.getLog\(PromptsActionExecuter.class\)/],
          [actionFile, /PromptsActionExecuter is processing/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.prompts"/],
          [contextFile, /class="org.alfresco.actions.PromptsActionExecuter/],
        ]);
      });
    });
  });

  describe('when creating actions when there is no project', function () {
    var noProjectTempDir = path.join(os.tmpdir(), 'no-project');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/action'))
        .inDir(noProjectTempDir)
        // generator will create a temp directory and make sure it's empty
        .withOptions({
          'name': 'no-project',
          'package': 'org.alfresco.actions',
        })
        .toPromise();
    });

    it('does not create action files', function () {
      var actionFile = path.join(noProjectTempDir, 'repo-amp/src/main/java/org/alfresco/actions/NoProjectActionExecuter.java');
      var contextFile = path.join(noProjectTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/action-no-project-context.xml');
      var messageFile = path.join(noProjectTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/messages/repo-amp-no-project-action.properties');
      assert.noFile([
        actionFile,
        contextFile,
        messageFile,
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
