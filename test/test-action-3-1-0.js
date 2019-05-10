'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const debug = require('debug')('generator-alfresco-test:action');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:action-3-1-0', function () {
  this.timeout(60000);
  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  describe('with 3.1.0 project containing default amps and samples', function () {
    before(function () {
      debug('Attempting to scaffold a project to perform tests inside.');
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({'skip-install': true})
        .withPrompts({
          sdkVersion: '3.1.0',
          projectArtifactId: 'temp-test',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    describe('when creating action with two word name', function () {
      const actionFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/actions/TwoWordsActionExecuter.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/action-two-words-context.xml');
      const messageFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/temp-test-platform-jar-two-words-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
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
          [contextFile, /<bean id="temp-test-platform-jar.two-words"/],
          [contextFile, /class="org.alfresco.actions.TwoWordsActionExecuter/],
        ]);
      });
    });

    describe('when creating action with camel case name', function () {
      const actionFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/actions/CamelCaseActionExecuter.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/action-camel-case-context.xml');
      const messageFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/temp-test-platform-jar-camel-case-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
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
          [contextFile, /<bean id="temp-test-platform-jar.camel-case"/],
          [contextFile, /class="org.alfresco.actions.CamelCaseActionExecuter/],
        ]);
      });
    });

    describe('when creating action using package that does not end with .actions', function () {
      const actionFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/actions/TestActionExecuter.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/action-test-context.xml');
      const messageFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/temp-test-platform-jar-test-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
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
          [contextFile, /<bean id="temp-test-platform-jar.test"/],
          [contextFile, /class="org.alfresco.actions.TestActionExecuter/],
        ]);
      });
    });

    describe('when creating action using prompts', function () {
      const actionFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/actions/PromptsActionExecuter.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/action-prompts-context.xml');
      const messageFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/temp-test-platform-jar-prompts-action.properties');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/action'))
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
          [contextFile, /<bean id="temp-test-platform-jar.prompts"/],
          [contextFile, /class="org.alfresco.actions.PromptsActionExecuter/],
        ]);
      });
    });
  });

  describe('when creating actions when there is no project', function () {
    const noProjectTempDir = path.join(os.tmpdir(), 'no-project');

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
      const actionFile = path.join(noProjectTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/actions/NoProjectActionExecuter.java');
      const contextFile = path.join(noProjectTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/action-no-project-context.xml');
      const messageFile = path.join(noProjectTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/messages/temp-test-platform-jar-no-project-action.properties');
      assert.noFile([
        actionFile,
        contextFile,
        messageFile,
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
