'use strict';
/* eslint-env node, mocha */
var _ = require('lodash');
var assert = require('assert');
var debug = require('debug')('generator-alfresco-test:prompt-validators');
var validators = require('../generators/common/prompt-validators.js');

describe('generator-alfresco:prompt-validators', function () {
  var yomock = {
    'config': {
      'get': function (key) { return undefined },
      'set': function (key, value) { },
    },
    'projectGroupId': 'org.alfresco',
    'projectVersion': '1.0.0-SNAPSHOT',
  };
  var yomockmodules = {
    'config': {
      'get': function (key) { return this[key] },
      'set': function (key, value) { },
      'moduleRegistry': [
        {
          'groupId': 'groupId',
          'artifactId': 'boo-repo-amp',
          'version': 'version',
          'packaging': 'amp',
          'war': 'repo',
          'location': 'source',
          'path': 'customizations/boo-repo-amp',
        }],
    },
    'projectGroupId': 'org.alfresco',
    'projectVersion': '1.0.0-SNAPSHOT',
  };
  var isNotEmpty = function (input) {
    return !_.isEmpty(input);
  };
  var thisNameCheck = function (input) {
    debug('input %s', input);
    if (this.name === input) return true;
    return 'that did not work';
  };
  var moduleRegistryWithNoModules = require('./../generators/common/alfresco-module-registry.js')(yomock);
  var moduleRegistryWithOneModule = require('./../generators/common/alfresco-module-registry.js')(yomockmodules);
  describe('.sequentialValidatorFactory()', function () {
    it('handles invalid input', function () {
      assert.equal(validators.sequentialValidatorFactory([])(undefined), undefined);
      assert.equal(validators.sequentialValidatorFactory([])(null), undefined);
    });
    it('handles single value in array', function () {
      assert.equal(validators.sequentialValidatorFactory([validators.uniqueSourceAmpModuleValidator])(undefined, moduleRegistryWithNoModules), 'Artifact Id cannot be empty');
      assert.equal(validators.sequentialValidatorFactory([validators.uniqueSourceAmpModuleValidator])('', moduleRegistryWithNoModules), 'Artifact Id cannot be empty');
      assert.equal(validators.sequentialValidatorFactory([isNotEmpty])('one'), true);
    });
    it('handles multiple values in array', function () {
      assert.equal(validators.sequentialValidatorFactory([isNotEmpty, validators.uniqueSourceAmpModuleValidator])('', moduleRegistryWithNoModules), false);
      assert.equal(validators.sequentialValidatorFactory([validators.uniqueSourceAmpModuleValidator, isNotEmpty])('', moduleRegistryWithNoModules), 'Artifact Id cannot be empty');
    });
    it('handles validators that require a this reference', function () {
      var obj = {
        name: 'fred',
      };
      assert.equal(validators.sequentialValidatorFactory([thisNameCheck]).bind(obj)('fred'), true);
      assert.equal(validators.sequentialValidatorFactory([thisNameCheck]).bind(obj)('george'), 'that did not work');
    });
  });
  describe('.uniqueSourceAmpModuleValidator()', function () {
    it('handles invalid input', function () {
      assert.equal(validators.uniqueSourceAmpModuleValidator(undefined, moduleRegistryWithNoModules), 'Artifact Id cannot be empty');
      assert.equal(validators.uniqueSourceAmpModuleValidator(null, moduleRegistryWithNoModules), 'Artifact Id cannot be empty');
    });
    it('handles unique artifact Id', function () {
      assert.equal(validators.uniqueSourceAmpModuleValidator('one', moduleRegistryWithNoModules), true);
    });
    it('handles duplicate artifact Id', function () {
      assert.equal(validators.uniqueSourceAmpModuleValidator('boo', moduleRegistryWithOneModule), 'Duplicate artifact Id specified');
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
