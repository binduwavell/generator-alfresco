'use strict';

var assert = require('assert');
var chalk = require('chalk');
var inspect = require('eyes').inspector({maxLength: false});

describe('generator-alfresco:alfresco-module-registry', function () {

  var yomock = {
    "config": {
      "get": function(key) { return undefined; },
      "set": function(key, value) { }
    }
  };

  describe('.getModules()', function() {

    it('returns an empty list by default', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      var modules = repo.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, []);
    });

    it('handles a module provided via long argument list', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      var modules = repo.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      }]);
    });

    it('handles a module provided via object form', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule({
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
      var modules = repo.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      }]);
    });

  });

  describe('.getNamedModules()', function() {

    it('returns an empty list by default', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      var modules = repo.getNamedModules();
      assert.ok(modules);
      assert.deepEqual(modules, []);
    });

    it('handles a module provided via long argument list', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      var modules = repo.getNamedModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        "name": 'groupId:artifactId:version:packaging:war:location',
        "module": {
          "groupId": 'groupId',
          "artifactId": 'artifactId',
          "version": 'version',
          "packaging": 'packaging',
          "war": 'war',
          "location": 'location',
          "path": 'path'
        }
      }]);
    });

    it('handles a module provided via object form', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule({
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
      var modules = repo.getNamedModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        "name": 'groupId:artifactId:version:packaging:war:location',
        "module": {
          "groupId": 'groupId',
          "artifactId": 'artifactId',
          "version": 'version',
          "packaging": 'packaging',
          "war": 'war',
          "location": 'location',
          "path": 'path'
        }
      }]);
    });

  });

  describe('.addModule()', function() {

    it('ignores requests to add an existing module', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      var modules = repo.getModules();
      assert.ok(modules);
      assert.deepEqual(modules, [{
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      }]);
    });

    it('throws for invalid modules', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      // throw if no arguments
      assert.throws(function() {
        repo.addModule();
      });
      // throw if we are missing an argument
      assert.throws(function() {
        repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location');
      });
      // throw if inner arguments are undefined
      assert.throws(function() {
        repo.addModule('groupId', 'artifactId', undefined, 'packaging', 'war', undefined, 'path');
      });
    });

  });

  describe('.findModule()', function() {

    it('does not find a non-existent module', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      var module = repo.findModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      assert.equal(module, undefined);
    });

    it('finds the only existing module', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      var module = repo.findModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      assert.ok(module);
      assert.deepEqual(module, {
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
    });

    it('finds the first module', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      repo.addModule('groupId2', 'artifactId2', 'version2', 'packaging2', 'war2', 'location2', 'path2');
      var module = repo.findModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      assert.ok(module);
      assert.deepEqual(module, {
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
    });

    it('finds the middle module', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId1', 'artifactId1', 'version1', 'packaging1', 'war1', 'location1', 'path1');
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      repo.addModule('groupId3', 'artifactId3', 'version3', 'packaging3', 'war3', 'location3', 'path3');
      var module = repo.findModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      assert.ok(module);
      assert.deepEqual(module, {
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
    });

    it('finds the last module', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      repo.addModule('groupId1', 'artifactId1', 'version1', 'packaging1', 'war1', 'location1', 'path1');
      repo.addModule('groupId2', 'artifactId2', 'version2', 'packaging2', 'war2', 'location2', 'path2');
      repo.addModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      var module = repo.findModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      assert.ok(module);
      assert.deepEqual(module, {
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
    });

  });

  describe('.normalizeModule()', function() {

    it('handles a module provided via long argument list', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      var module = repo.normalizeModule('groupId', 'artifactId', 'version', 'packaging', 'war', 'location', 'path');
      assert.ok(module);
      assert.deepEqual(module, {
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
    });

    it('handles a module provided via object form', function () {
      var repo = require('../app/alfresco-module-registry.js')(yomock);
      var module = repo.normalizeModule({
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
      assert.ok(module);
      assert.deepEqual(module, {
        "groupId": 'groupId',
        "artifactId": 'artifactId',
        "version": 'version',
        "packaging": 'packaging',
        "war": 'war',
        "location": 'location',
        "path": 'path'
      });
    });

  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
