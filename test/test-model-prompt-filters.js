'use strict';

var assert = require('assert');
var _ = require('lodash');
var modelFilters = require('../generators/model/model-prompt-filters.js')

describe('generator-alfresco:model-prompt-filters', function () {

  describe('.requiredRegexFilter()', function() {
    it('check regex filter handling of numeric input', function() {
        var one = modelFilters.requiredRegexFilter(1,"1");
        assert.equal('1',one);
    });
  });

  describe('.versionNumberFilter()', function() {
    it('check version number filter handling of numeric decimal input', function() {
        var verNum = modelFilters.versionNumberFilter(1.1);
        assert.equal('1.1',verNum);
    });
    it('check version number filter handling of numeric integer input', function() {
        var verNum = modelFilters.versionNumberFilter(1);
        assert.equal('1.0',verNum);
    });
  });

  describe('.modelNameFilter()', function() {
    it('check model name filter handling of model name ending with "model"', function() {
        var modelName = modelFilters.modelNameFilter('testModel');
        assert.equal('test',modelName);
    });
    it('check model name filter handling of model name "model"', function() {
        var modelName = modelFilters.modelNameFilter('model');
        assert.equal('model',modelName);
    });
  });

  describe('.alphaLowerCaseFilter()', function() {
    it('check alphaLowerCaseFilter filter handling with mixed case', function() {
        var lowerCaseStr = modelFilters.alphaLowerCaseFilter('testStringWithCamelCase');
        assert.equal('teststringwithcamelcase',lowerCaseStr);
    });
    it('check alphaLowerCaseFilter filter handling with empty string', function() {
        var lowerCaseStr = modelFilters.alphaLowerCaseFilter('');
        assert.equal(undefined,lowerCaseStr);
    });
    it('check alphaLowerCaseFilter filter handling with null', function() {
        var lowerCaseStr = modelFilters.alphaLowerCaseFilter(null);
        assert.equal(undefined,lowerCaseStr);
    });
    it('check alphaLowerCaseFilter filter handling with no parameters', function() {
        var lowerCaseStr = modelFilters.alphaLowerCaseFilter();
        assert.equal(undefined,lowerCaseStr);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
