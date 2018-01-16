'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:jsroot-2-1-1', function () {
  this.timeout(60000);
  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  describe('with simple 2.1.1 project', function () {
    before(function () {
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

    describe('when creating class file with two words', function () {
      const jsRootJavaFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/jsroot/TwoWords.java');
      const contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/jsroot-object-hello-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'hello',
            'class': 'two words',
            'package': 'org.alfresco.jsroot',
          })
          .toPromise();
      });

      it('creates appropriate javascript root object files', function () {
        assert.file([
          jsRootJavaFile,
          contextFile,
        ]);
      });

      it('has valid content in jsroot class', function () {
        assert.fileContent([
          [jsRootJavaFile, /package org\.alfresco\.jsroot/],
          [jsRootJavaFile, /class TwoWords extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(TwoWords.class\)/],
          [jsRootJavaFile, /TwoWords the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.hello"/],
          [contextFile, /class="org.alfresco.jsroot.TwoWords/],
        ]);
      });
    });

    describe('when creating root object with CamelCase name', function () {
      const jsRootJavaFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/jsroot/CamelCase.java');
      const contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/jsroot-object-camelroot-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'CamelRoot',
            'class': 'CamelCase',
            'package': 'org.alfresco.jsroot',
          })
          .toPromise();
      });

      it('creates appropriate javascript root object files', function () {
        assert.file([
          jsRootJavaFile,
          contextFile,
        ]);
      });

      it('has valid content in jsroot class', function () {
        assert.fileContent([
          [jsRootJavaFile, /package org\.alfresco\.jsroot/],
          [jsRootJavaFile, /class CamelCase extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(CamelCase.class\)/],
          [jsRootJavaFile, /CamelCase the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.camelroot"/],
          [contextFile, /class="org.alfresco.jsroot.CamelCase/],
        ]);
      });
    });

    describe('when creating root object with two words', function () {
      const jsRootJavaFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/jsroot/HelloWorld.java');
      const contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/jsroot-object-twowords-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'Two Words',
            'class': 'HelloWorld',
            'package': 'org.alfresco.jsroot',
          })
          .toPromise();
      });

      it('creates appropriate javascript root object files', function () {
        assert.file([
          jsRootJavaFile,
          contextFile,
        ]);
      });

      it('has valid content in jsroot class', function () {
        assert.fileContent([
          [jsRootJavaFile, /package org\.alfresco\.jsroot/],
          [jsRootJavaFile, /class HelloWorld extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(HelloWorld.class\)/],
          [jsRootJavaFile, /HelloWorld the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.twowords"/],
          [contextFile, /class="org.alfresco.jsroot.HelloWorld/],
        ]);
      });
    });

    describe('when creating root object using package that does not end with .jsroot', function () {
      const jsRootJavaFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/jsroot/Test.java');
      const contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/jsroot-object-testroot-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'testroot',
            'class': 'test',
            'package': 'org.alfresco',
          })
          .toPromise();
      });

      it('creates appropriate javascript root object files', function () {
        assert.file([
          jsRootJavaFile,
          contextFile,
        ]);
      });

      it('has valid content in js root object class', function () {
        assert.fileContent([
          [jsRootJavaFile, /package org\.alfresco\.jsroot/],
          [jsRootJavaFile, /class Test extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(Test.class\)/],
          [jsRootJavaFile, /Test the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.testroot"/],
          [contextFile, /class="org.alfresco.jsroot.Test/],
        ]);
      });
    });

    describe('when creating root objects with prompts', function () {
      const jsRootJavaFile = path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/jsroot/Prompts.java');
      const contextFile = path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/jsroot-object-prompt-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withPrompts({
            'root': 'prompt',
            'class': 'prompts',
            'package': 'org.alfresco.jsroot',
          })
          .toPromise();
      });

      it('creates appropriate javascript root object files', function () {
        assert.file([
          jsRootJavaFile,
          contextFile,
        ]);
      });

      it('has valid content in js root object class', function () {
        assert.fileContent([
          [jsRootJavaFile, /package org\.alfresco\.jsroot/],
          [jsRootJavaFile, /class Prompts extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(Prompts.class\)/],
          [jsRootJavaFile, /Prompts the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="repo-amp.prompt"/],
          [contextFile, /class="org.alfresco.jsroot.Prompts/],
        ]);
      });
    });
  });

  describe('when creating javascript root object when there is no project', function () {
    const noProjectTempDir = path.join(os.tmpdir(), 'no-project');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
        .inDir(noProjectTempDir)
        // generator will create a temp directory and make sure it's empty
        .withOptions({
          'root': 'noproject',
          'class': 'no-project',
          'package': 'org.alfresco.jsroot',
        })
        .toPromise();
    });

    it('does not create javascript root object files', function () {
      const jsRootJavaFile = path.join(noProjectTempDir, 'repo-amp/src/main/java/org/alfresco/jsroot/NoProject.java');
      const contextFile = path.join(noProjectTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/jsroot-object-noproject-context.xml');
      assert.noFile([
        jsRootJavaFile,
        contextFile,
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
