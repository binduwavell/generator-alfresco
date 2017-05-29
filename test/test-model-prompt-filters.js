'use strict';
/* eslint-env node, mocha */
const assert = require('assert');
const modelFilters = require('../generators/model/model-prompt-filters.js');

describe('generator-alfresco:model-prompt-filters', function () {
  describe('.requiredRegexFilter()', function () {
    it('check regex filter handling of numeric input', function () {
      const one = modelFilters.requiredRegexFilter(1, '1');
      assert.equal('1', one);
    });
  });

  describe('.versionNumberFilter()', function () {
    it('check version number filter handling of numeric decimal input', function () {
      const verNum = modelFilters.versionNumberFilter(1.1);
      assert.equal('1.1', verNum);
    });
    it('check version number filter handling of numeric integer input', function () {
      const verNum = modelFilters.versionNumberFilter(1);
      assert.equal('1.0', verNum);
    });
  });

  describe('.modelNameFilter()', function () {
    it('check model name filter handling of model name ending with "model"', function () {
      const modelName = modelFilters.modelNameFilter('testModel');
      assert.equal('test', modelName);
    });
    it('check model name filter handling of model name "model"', function () {
      const modelName = modelFilters.modelNameFilter('model');
      assert.equal('model', modelName);
    });
  });

  describe('.alphaLowerCaseFilter()', function () {
    it('check alphaLowerCaseFilter filter handling with mixed case', function () {
      const lowerCaseStr = modelFilters.alphaLowerCaseFilter('testStringWithCamelCase');
      assert.equal('teststringwithcamelcase', lowerCaseStr);
    });
    it('check alphaLowerCaseFilter filter handling with empty string', function () {
      const lowerCaseStr = modelFilters.alphaLowerCaseFilter('');
      assert.equal(undefined, lowerCaseStr);
    });
    it('check alphaLowerCaseFilter filter handling with null', function () {
      const lowerCaseStr = modelFilters.alphaLowerCaseFilter(null);
      assert.equal(undefined, lowerCaseStr);
    });
    it('check alphaLowerCaseFilter filter handling with no parameters', function () {
      const lowerCaseStr = modelFilters.alphaLowerCaseFilter();
      assert.equal(undefined, lowerCaseStr);
    });
  });

  describe('.alphaCamelCaseFilter()', function () {
    it('check alphaCamelCaseFilter filter handling with mixed case', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter('testStringWithCamelCase');
      assert.equal('testStringWithCamelCase', camelCaseStr);
    });
    it('check alphaCamelCaseFilter filter handling with mixed case but starting in upper case', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter('TestStringWithCamelCase');
      assert.equal('testStringWithCamelCase', camelCaseStr);
    });
    it('check alphaCamelCaseFilter filter handling with spaces', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter('test string with space');
      assert.equal('testStringWithSpace', camelCaseStr);
    });
    it('check alphaCamelCaseFilter filter handling with hyphen', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter('test-string-with-hyphen');
      assert.equal('testStringWithHyphen', camelCaseStr);
    });
    it('check alphaCamelCaseFilter filter handling with underscore', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter('test_string_with_underscore');
      assert.equal('testStringWithUnderscore', camelCaseStr);
    });
    it('check alphaCamelCaseFilter filter handling with empty string', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter('');
      assert.equal(undefined, camelCaseStr);
    });
    it('check alphaCamelCaseFilter filter handling with null', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter(null);
      assert.equal(undefined, camelCaseStr);
    });
    it('check alphaCamelLowerCaseFilter filter handling with no parameters', function () {
      const camelCaseStr = modelFilters.alphaCamelCaseFilter();
      assert.equal(undefined, camelCaseStr);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
