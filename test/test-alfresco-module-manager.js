'use strict';
/* eslint-env node, mocha */
const assert = require('assert');
const memFs = require('mem-fs');
const FileEditor = require('mem-fs-editor');
const os = require('os');
const path = require('path');
const constants = require('generator-alfresco-common').constants;

describe('generator-alfresco:alfresco-module-manager', function () {
  const yomock = {
    config: {
      'get': () => { return undefined },
      'set': () => { },
    },
    tmpdir: os.tmpdir(),
    destinationPath: p => { if (p) { return path.join(yomock.tmpdir, p) } else { return yomock.tmpdir } },
    out: {
      info: msg => { /* console.log('INFO: ' + msg) */ },
      warn: msg => { /* console.log('WARN: ' + msg) */ },
      error: msg => { /* console.log('ERROR: ' + msg) */ },
    },
    projectGroupId: 'org.example',
    projectArtifactId: 'test',
    projectPackaging: 'pom',
    projectVersion: '1.0',
    sdkVersions: require('../generators/common/sdk-versions.js'),
    sdk: require('../generators/common/sdk-versions.js')['2.1.1'],
  };

  describe('.addModule()', function () {
    beforeEach(function () {
      yomock.fs = FileEditor.create(memFs.create());
      yomock.moduleManager = require('../generators/common/alfresco-module-manager.js')(yomock);
      yomock.topPomPath = yomock.destinationPath('pom.xml');
      yomock.fs.write(yomock.topPomPath, '');
      yomock.wrapperPomPath = yomock.destinationPath('repo/pom.xml');
      yomock.fs.write(yomock.wrapperPomPath, '');
      yomock.templatePomPath = yomock.destinationPath(constants.FOLDER_SOURCE_TEMPLATES + '/repo-packaging/pom.xml');
      yomock.fs.write(yomock.templatePomPath, '');
      yomock.modulePropertiesPath = yomock.destinationPath(constants.FOLDER_SOURCE_TEMPLATES + '/repo-packaging/src/main/amp/config/alfresco/module/repo-amp/module.properties');
      yomock.fs.write(yomock.modulePropertiesPath, '');
      yomock.projectPomPath = yomock.destinationPath('path/pom.xml');
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'repo', 'source', 'path');
      yomock.moduleManager.save();
    });

    it('adds a module to the registry', function () {
      const modules = yomock.moduleManager.moduleRegistry.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        'groupId': 'groupId',
        'artifactId': 'artifactId',
        'version': 'version',
        'packaging': 'packaging',
        'war': 'repo',
        'location': 'source',
        'path': 'path',
      }]);
    });

    it('copies the module template', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.templatePomPath)
      );
      assert.ok(pom.getPOMString());
    });

    it('updates the project pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.projectPomPath)
      );
      // console.log(pom.getPOMString());
      const groupIdNode = pom.getOrCreateTopLevelElement('pom', 'groupId');
      assert.ok(groupIdNode);
      assert.equal(groupIdNode.textContent, 'groupId');
      const artifactIdNode = pom.getOrCreateTopLevelElement('pom', 'artifactId');
      assert.ok(artifactIdNode);
      assert.equal(artifactIdNode.textContent, 'artifactId');
      const versionNode = pom.getOrCreateTopLevelElement('pom', 'version');
      assert.ok(versionNode);
      assert.equal(versionNode.textContent, 'version');
      const packagingNode = pom.getOrCreateTopLevelElement('pom', 'packaging');
      assert.ok(packagingNode);
      assert.equal(packagingNode.textContent, 'packaging');
      const parentNode = pom.getOrCreateTopLevelElement('pom', 'parent');
      assert.ok(parentNode);
      assert.equal(parentNode.toString(), [
        '<parent xmlns="http://maven.apache.org/POM/4.0.0">',
        '    <groupId>com.example</groupId>',
        '    <artifactId>placeholder</artifactId>',
        '    <version>0.0.1-SNAPSHOT</version>',
        '  </parent>',
      ].join('\n'));
    });

    it('adds a module to the top pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.topPomPath)
      );
      const mod = pom.findModule('artifactId');
      // console.log(pom.getPOMString());
      assert.ok(mod);
    });

    it('adds a dependency to the war pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      const dep = pom.findDependency('groupId', 'artifactId', 'version', 'packaging');
      // console.log(pom.getPOMString());
      assert.ok(dep);
    });

    it('adds an overlay to the war pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      const overlay = pom.findOverlay('groupId', 'artifactId', 'packaging');
      // console.log(pom.getPOMString());
      assert.ok(overlay);
    });

    it('does not add a module to the top pom more than once', function () {
      // attempt to add twice, then remove once. If the module is actually
      // added twice we'll end up with a module when we find the module
      // if the second add was squashed as expected, we'll end up with
      // no module.
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'repo', 'source', 'path');
      yomock.moduleManager.save();
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.topPomPath)
      );
      pom.removeModule('artifactId');
      const mod = pom.findModule('artifactId');
      assert.equal(mod, undefined);
    });
  });

  describe('.removeModule()', function () {
    beforeEach(function () {
      yomock.fs = FileEditor.create(memFs.create());
      yomock.moduleManager = require('../generators/common/alfresco-module-manager.js')(yomock);
      yomock.topPomPath = yomock.destinationPath('pom.xml');
      yomock.fs.write(yomock.topPomPath, '');
      yomock.wrapperPomPath = yomock.destinationPath('war/pom.xml');
      yomock.fs.write(yomock.wrapperPomPath, '');
      yomock.targetPomPath = yomock.destinationPath('path/pom.xml');
      yomock.fs.write(yomock.targetPomPath, '');
      yomock.templatePomPath = yomock.destinationPath(constants.FOLDER_SOURCE_TEMPLATES + '/war-packaging/pom.xml');
      yomock.fs.write(yomock.templatePomPath, '');
      yomock.modulePropertiesPath = yomock.destinationPath(constants.FOLDER_SOURCE_TEMPLATES + '/war-packaging/src/main/amp/config/alfresco/module/repo-amp/module.properties');
      yomock.fs.write(yomock.modulePropertiesPath, '');
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'source', 'path');
      yomock.moduleManager.removeModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'source', 'path');
      yomock.moduleManager.save();
    });

    it('removes a module from the registry', function () {
      const modules = yomock.moduleManager.moduleRegistry.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, []);
    });

    it('removes module files', function () {
      assert.equal(yomock.fs.exists(yomock.targetPomPath), false);
    });

    it('removes module from the top pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.topPomPath)
      );
      const mod = pom.findModule('artifactId');
      assert.equal(mod, undefined);
    });

    it('removes dependency from the war wrapper pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      const dep = pom.findDependency('groupId', 'artifactId', 'version', 'packaging');
      assert.equal(dep, undefined);
    });

    it('removes overlay from the war wrapper pom', function () {
      const pom = require('generator-alfresco-common').maven_pom(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      const overlay = pom.findOverlay('groupId', 'artifactId', 'packaging');
      assert.equal(overlay, undefined);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
