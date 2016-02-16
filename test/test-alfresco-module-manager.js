'use strict';

var assert = require('assert');
var memFs = require('mem-fs');
var FileEditor = require('mem-fs-editor');
var os = require('os');
var path = require('path');
var constants = require('../generators/app/constants.js');

describe('generator-alfresco:alfresco-module-manager', function () {

  var yomock = {
    config: {
      "get": function() { return undefined; },
      "set": function() { }
    },
    tmpDir: os.tmpDir(),
    destinationPath: function(p) { if (p) { return path.join(yomock.tmpDir, p); } else { return yomock.tmpDir; }}.bind(this),
    out: {
      info: function(msg) { /* console.log('INFO: ' + msg) */ },
      warn: function(msg) { /* console.log('WARN: ' + msg) */ },
      error: function(msg) { /* console.log('ERROR: ' + msg) */ },
    },
    projectGroupId: 'org.example',
    projectArtifactId: 'test',
    projectPackaging: 'pom',
    projectVersion: '1.0',
    sdkVersions: require('../generators/app/sdk-versions.js'),
    sdk: require('../generators/app/sdk-versions.js')['2.1.1']
  };

  describe('.addModule()', function() {

    beforeEach(function () {
      yomock.fs = FileEditor.create(memFs.create());
      yomock.moduleManager = require('../generators/app/alfresco-module-manager.js')(yomock);
      yomock.topPomPath = yomock.destinationPath('pom.xml');
      yomock.fs.write(yomock.topPomPath, "");
      yomock.wrapperPomPath = yomock.destinationPath('repo/pom.xml');
      yomock.fs.write(yomock.wrapperPomPath, "");
      yomock.templatePomPath = yomock.destinationPath(constants.SOURCE_TEMPLATES_FOLDER + '/repo-packaging/pom.xml');
      yomock.fs.write(yomock.templatePomPath, '');
      yomock.projectPomPath = yomock.destinationPath('path/pom.xml');
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'repo', 'source', 'path');
      yomock.moduleManager.save();
    });

    it('adds a module to the registry', function () {
      var modules = yomock.moduleManager.moduleRegistry.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'repo',
        "location": 'source',
        "path": 'path'
      }]);
    });

    it('copies the module template', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.templatePomPath)
      );
      assert.ok( pom.getPOMString() );
    });

    it('updates the project pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.projectPomPath)
      );
      // console.log(pom.getPOMString());
      var groupIdNode = pom.getOrCreateTopLevelElement('pom', 'groupId');
      assert.ok(groupIdNode);
      assert.equal(groupIdNode.textContent, 'groupId');
      var artifactIdNode = pom.getOrCreateTopLevelElement('pom', 'artifactId');
      assert.ok(artifactIdNode);
      assert.equal(artifactIdNode.textContent, 'artifactId');
      var versionNode = pom.getOrCreateTopLevelElement('pom', 'version');
      assert.ok(versionNode);
      assert.equal(versionNode.textContent, 'version');
      var packagingNode = pom.getOrCreateTopLevelElement('pom', 'packaging');
      assert.ok(packagingNode);
      assert.equal(packagingNode.textContent, 'packaging');
      var parentNode = pom.getOrCreateTopLevelElement('pom', 'parent');
      assert.ok(parentNode);
      assert.equal(parentNode.toString(), '<parent>\n    <groupId>org.example</groupId>\n    <artifactId>test</artifactId>\n    <version>1.0</version>\n  </parent>');
    });

    it('adds a module to the top pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.topPomPath)
      );
      var mod = pom.findModule('artifactId');
      // console.log(pom.getPOMString());
      assert.ok(mod);
    });

    it('adds a dependency to the war pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      var dep = pom.findDependency('groupId', 'artifactId', 'version', 'packaging');
      //console.log(pom.getPOMString());
      assert.ok(dep);
    });

    it('adds an overlay to the war pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      var overlay = pom.findOverlay('groupId', 'artifactId', 'packaging');
      //console.log(pom.getPOMString());
      assert.ok(overlay);
    });

    it('does not add a module to the top pom more than once', function () {
      // attempt to add twice, then remove once. If the module is actually
      // added twice we'll end up with a module when we find the module
      // if the second add was squashed as expected, we'll end up with
      // no module.
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'repo', 'source', 'path');
      yomock.moduleManager.save();
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.topPomPath)
      );
      pom.removeModule('artifactId');
      var mod = pom.findModule('artifactId');
      assert.equal(mod, undefined);
    });

  });

  describe('.removeModule()', function() {

    beforeEach(function () {
      yomock.fs = FileEditor.create(memFs.create());
      yomock.moduleManager = require('../generators/app/alfresco-module-manager.js')(yomock);
      yomock.topPomPath = yomock.destinationPath('pom.xml');
      yomock.fs.write(yomock.topPomPath, "");
      yomock.wrapperPomPath = yomock.destinationPath('war/pom.xml');
      yomock.fs.write(yomock.wrapperPomPath, "");
      yomock.targetPomPath = yomock.destinationPath('path/pom.xml');
      yomock.fs.write(yomock.targetPomPath, "");
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'source', 'path');
      yomock.moduleManager.removeModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'source', 'path');
      yomock.moduleManager.save();
    });

    it('removes a module from the registry', function () {
      var modules = yomock.moduleManager.moduleRegistry.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, []);
    });

    it('removes module files', function () {
      assert.equal(yomock.fs.exists(yomock.targetPomPath), false);
    });

    it('removes module from the top pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.topPomPath)
      );
      var mod = pom.findModule('artifactId');
      assert.equal(mod, undefined);
    });

    it('removes dependency from the war wrapper pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      var dep = pom.findDependency('groupId', 'artifactId', 'version', 'packaging');
      assert.equal(dep, undefined);
    });

    it('removes overlay from the war wrapper pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      var overlay = pom.findOverlay('groupId', 'artifactId', 'packaging');
      assert.equal(overlay, undefined);
    });

  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
