'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var constants = require('../generators/common/constants.js');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');

describe('generator-alfresco:app-remove-sample-code', function () {
  describe('remove sdk sample code, twice', function () {
    this.timeout(60000);

    before(function (done) {
      var tmpdir = path.join(os.tmpdir(), './temp-test');
      helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(tmpdir)
        .withOptions({ 'skip-install': false })
        .withPrompts({
          archetypeVersion: '2.1.1',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: true,
        })
        .on('end', function () {
          helpers.run(path.join(__dirname, '../generators/app'))
            .inDir(tmpdir, function (dir) {
              fs.mkdirSync(path.join(dir, constants.FOLDER_SOURCE_TEMPLATES));
              fs.mkdirSync(path.join(dir, constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp'));
              fs.writeFileSync(path.join(path.join(dir, constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml')), '');
            })
            .withLocalConfig({
              archetypeVersion: '2.1.1',
              removeDefaultSourceAmps: false,
              removeDefaultSourceSamples: true,
            })
            .withOptions({ 'skip-install': false })
            .on('end', done);
        });
    });

    it('removes demo files', function () {
      assert.noFile([
        // This list is representative, it is not a complete list of items that are removed
        'repo-amp/src/main/java/org/alfresco/demoamp/Demo.java',
        'repo-amp/src/test/java/org/alfresco/demoamp/test/DemoComponentTest.java',
      ]);
    });

    it('deletes sample files', function () {
      assert.noFile([
        'repo-amp/src/main/amp/web/css/demoamp.css',
        'repo-amp/src/main/amp/web/jsp/demoamp.jsp',
        'repo-amp/src/main/amp/web/scripts/demoamp.js',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/webscripts/helloworld.get.js',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/bootstrap-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/service-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/webscript-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/content-model.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/workflow-model.xml',
        'repo-amp/src/main/java/org/alfresco/demoamp/Demo.java',
        'repo-amp/src/main/java/org/alfresco/demoamp/DemoComponent.java',
        'repo-amp/src/main/java/org/alfresco/demoamp/HelloWorldWebScript.java',
        'repo-amp/src/test/java/org/alfresco/demoamp/test/DemoComponentTest.java',
      ]);
    });

    it('creates files to protect some directories', function () {
      assert.file([
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/README.md',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
      ]);
    });
    it('rename slingshot context to *.sample', function () {
      assert.noFile([
        'share-amp/src/main/amp/config/alfresco/web-extension/share-amp-slingshot-application-context.xml',
      ]);
      assert.file([
        'share-amp/src/main/amp/config/alfresco/web-extension/share-amp-slingshot-application-context.xml.sample',
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
