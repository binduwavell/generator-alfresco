'use strict';

var assert = require('assert');
var memFs = require('mem-fs');
var FileEditor = require('mem-fs-editor');
var path = require('path');

describe('generator-alfresco:alfresco-module-manager', function () {

  var yomock = {
    config: {
      "get": function() { return undefined; },
      "set": function() { }
    },
    destinationPath: function(p) { return path.join('/tmp', p)},
    out: {
      info: function(msg) { /* console.log('INFO: ' + msg) */ },
      warn: function(msg) { /* console.log('WARN: ' + msg) */ },
      error: function(msg) { /* console.log('ERROR: ' + msg) */ },
    },
  };

  describe('.addModule()', function() {

    beforeEach(function () {
      yomock.fs = FileEditor.create(memFs.create());
      yomock.moduleManager = require('../generators/app/alfresco-module-manager.js')(yomock);
      yomock.topPomPath = yomock.destinationPath('pom.xml');
      yomock.fs.write(yomock.topPomPath, "");
      yomock.wrapperPomPath = yomock.destinationPath('war/pom.xml');
      yomock.fs.write(yomock.wrapperPomPath, "");
      yomock.templatePomPath = yomock.destinationPath('amps_source_templates/war-packaging/pom.xml');
      yomock.fs.write(yomock.templatePomPath, "");
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'source', 'path');
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
        "war": 'war',
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

    it('adds a module to the top pom', function () {
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.topPomPath)
      );
      var mod = pom.findModule('artifactId');
      //console.log(pom.getPOMString());
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
      yomock.moduleManager.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'source', 'path');
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
      yomock.moduleRegistry = require('../generators/app/alfresco-module-registry.js')(yomock);
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
      var modules = yomock.moduleRegistry.getModules();
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

    it.skip('removes dependency from the war wrapper pom', function () {
      // TODO: implement dependency removal logic in alfresco-module-manager
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      var dep = pom.findDependency('groupId', 'artifactId', 'version', 'packaging');
      assert.equal(dep, undefined);
    });

    it.skip('removes overlay from the war wrapper pom', function () {
      // TODO: implement overlay removal logic in alfresco-module-manager
      var pom = require('../generators/app/maven-pom.js')(
        yomock.fs.read(yomock.wrapperPomPath)
      );
      var overlay = pom.findOverlay('groupId', 'artifactId', 'packaging');
      assert.equal(overlay, undefined);
    });

  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
