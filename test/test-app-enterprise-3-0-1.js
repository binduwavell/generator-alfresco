'use strict';
/* eslint-env node, mocha */
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');

describe('generator-alfresco:app-enterprise-3-0-1', function () {
  this.timeout(60000);

  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '3.0.1',
        projectStructure: 'basic',
        communityOrEnterprise: 'Enterprise',
        removeDefaultSourceAmps: false,
        removeDefaultSourceSamples: false,
      })
      .toPromise();
  });

  it('edition is enterprise', function () {
    assert.fileContent(
      'pom.xml',
      /<maven.alfresco.edition>enterprise<\/maven.alfresco.edition>/
    );
  });

  it('does not set edition to community', function () {
    assert.noFileContent(
      'pom.xml',
      /<maven.alfresco.edition>community<\/maven.alfresco.edition>/
    );
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
