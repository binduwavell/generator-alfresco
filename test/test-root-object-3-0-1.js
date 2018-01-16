'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:jsroot-3-0-1', function () {
  this.timeout(60000);
  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  describe('with simple 3.0.1 project', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(osTempDir)
        .withOptions({'skip-install': true})
        .withPrompts({
          sdkVersion: '3.0.1',
          projectArtifactId: 'temp-test',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    describe('when creating jsroot with two word name', function () {
      const behaviorFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/java/org/alfresco/behaviors/TwoWords.java');
      const contextFile = path.join(osTempDir, 'temp-test-platform-jar/src/main/resources/alfresco/module/temp-test-platform-jar/context/generated/jsroot-object-two-words-context.xml');

      before(function () {
        return helpers.run(path.join(__dirname, '../generators/jsroot'))
          .cd(osTempDir)
          .withOptions({
            'class': 'two words',
            'package': 'org.alfresco.jsroot',
          })
          .toPromise();
      });

      it('creates appropriate behavior files', function () {
        assert.file([
          behaviorFile,
          contextFile,
        ]);
      });

      it('has valid content in jsroot class', function () {
        assert.fileContent([
          [behaviorFile, /package org\.alfresco\.jsroot/],
          [behaviorFile, /class TwoWords extends BaseProcessorExtension/],
          [behaviorFile, /LogFactory\.getLog\(TwoWords.class\)/],
          [behaviorFile, /TwoWords the javascript root object works :\)/],
        ]);
      });

      it('has valid content in context file', function () {
        assert.fileContent([
          [contextFile, /<bean id="temp-test-platform-jar.two-words"/],
          [contextFile, /class="org.alfresco.jsroot.TwoWords/],
        ]);
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
