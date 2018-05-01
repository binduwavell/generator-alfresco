'use strict';
/* eslint-env node, mocha */
const assert = require('assert');
const surfExtensionFilters = require('../generators/surf-extension/surf-extension-prompt-filters.js');

describe('generator-alfresco:surf-extension-prompt-filters', function () {
  describe('.requiredRegexFilter()', function () {
    it('check regex filter handling of numeric input', function () {
      const one = surfExtensionFilters.requiredRegexFilter(1, '1');
      assert.equal('1', one);
    });
  });

  describe('.versionNumberFilter()', function () {
    it('check version number filter handling of numeric decimal input', function () {
      const verNum = surfExtensionFilters.versionNumberFilter(1.1);
      assert.equal('1.1', verNum);
    });
    it('check version number filter handling of numeric integer input', function () {
      const verNum = surfExtensionFilters.versionNumberFilter(1);
      assert.equal('1.0', verNum);
    });
  });

  describe('.autoDeployFilter()', function () {
    it('check auto deploy filter handling of true/false', function () {
      const autoDeploy = surfExtensionFilters.autoDeployFilter('true');
      assert.equal('true', autoDeploy);
    });
    it('check auto deploy filter handling of true/false', function () {
      const autoDeploy = surfExtensionFilters.autoDeployFilter('test');
      assert.equal(null, autoDeploy);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
