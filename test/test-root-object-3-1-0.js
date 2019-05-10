'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:jsroot-3-1-0', function () {
  this.timeout(60000);
  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  describe('with simple 3.1.0 project', function () {
    before(function () {
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

    describe('when creating class file with two words', function () {
      const jsRootJavaFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/jsroot/Hello.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-hello-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'hello',
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
          [jsRootJavaFile, /class Hello extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(Hello.class\)/],
          [jsRootJavaFile, /Hello the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="temp-test-platform-jar.hello"/],
          [contextFile, /class="org.alfresco.jsroot.Hello/],
        ]);
      });
    });

    describe('when creating root object with CamelCase name', function () {
      const jsRootJavaFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/jsroot/CamelRoot.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-camelroot-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'CamelRoot',
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
          [jsRootJavaFile, /class CamelRoot extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(CamelRoot.class\)/],
          [jsRootJavaFile, /CamelRoot the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="temp-test-platform-jar.camelroot"/],
          [contextFile, /class="org.alfresco.jsroot.CamelRoot/],
        ]);
      });
    });

    describe('when creating root object with two words', function () {
      const jsRootJavaFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/jsroot/TwoWords.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-twowords-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'Two Words',
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
          [contextFile, /<bean id="temp-test-platform-jar.twowords"/],
          [contextFile, /class="org.alfresco.jsroot.TwoWords/],
        ]);
      });
    });

    describe('when creating root object using package that does not end with .jsroot', function () {
      const jsRootJavaFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/jsroot/Testroot.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-testroot-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withOptions({
            'root': 'testroot',
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
          [jsRootJavaFile, /class Testroot extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(Testroot.class\)/],
          [jsRootJavaFile, /Testroot the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="temp-test-platform-jar.testroot"/],
          [contextFile, /class="org.alfresco.jsroot.Testroot/],
        ]);
      });
    });

    describe('when creating root objects with prompts', function () {
      const jsRootJavaFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/jsroot/Prompt.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-prompt-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsrootobject'))
          .cd(osTempDir)
          .withPrompts({
            'root': 'prompt',
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
          [jsRootJavaFile, /class Prompt extends BaseProcessorExtension/],
          [jsRootJavaFile, /LogFactory\.getLog\(Prompt.class\)/],
          [jsRootJavaFile, /Prompt the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="temp-test-platform-jar.prompt"/],
          [contextFile, /class="org.alfresco.jsroot.Prompt/],
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
          'package': 'org.alfresco.jsroot',
        })
        .toPromise();
    });

    it('does not create javascript root object files', function () {
      const jsRootJavaFile = path.join(noProjectTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/jsroot/NoProject.java');
      const contextFile = path.join(noProjectTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-noproject-context.xml');
      assert.noFile([
        jsRootJavaFile,
        contextFile,
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
