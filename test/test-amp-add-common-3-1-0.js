'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

describe('generator-alfresco:amp-add-common-3-1-0', function () {
  this.timeout(30000);

  const osTempDir = path.join(os.tmpdir(), 'temp-common-test');

  // We need a test project setup before we begin
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '3.1.0',
        projectArtifactId: 'temp-common-test',
        removeDefaultSourceAmps: false,
      })
      .toPromise();
  });

  it('starts with a basic project', function () {
    assert.file([
      path.join(osTempDir, 'pom.xml'),
      path.join(osTempDir, 'run.sh'),
    ]);
  });

  describe('installing more than one common amp', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/amp-add-common'))
        // generator will create a temp directory and make sure it's empty
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'project-names': ['JavaScript Console', 'AOS - Alfresco Office Services'],
        })
        /*
        .withGenerators([
          path.join(__dirname, '../generators/amp-add-remote'),
        ])
        */
        .toPromise();
    });

    it('references amps in repo & share pom.xml files', function () {
      assert.fileContent([
        [path.join(osTempDir, 'pom.xml'), /<groupId>de.fmaul</],
        [path.join(osTempDir, 'pom.xml'), /<artifactId>javascript-console-repo</],
        [path.join(osTempDir, 'pom.xml'), /<artifactId>javascript-console-share</],
        [path.join(osTempDir, 'pom.xml'), /<version>0\.6</],
        [path.join(osTempDir, 'pom.xml'), /<groupId>org.alfresco.aos-module</],
        [path.join(osTempDir, 'pom.xml'), /<artifactId>alfresco-aos-module</],
        [path.join(osTempDir, 'pom.xml'), /<version>1.1.7</],
      ]);
    });

    it('references amps in .yo-rc.json', function () {
      assert.fileContent([
        [path.join(osTempDir, '.yo-rc.json'), /"groupId": "de.fmaul",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "javascript-console-repo",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "javascript-console-share",/],
        [path.join(osTempDir, '.yo-rc.json'), /"version": "0\.6",/],
        [path.join(osTempDir, '.yo-rc.json'), /"groupId": "org.alfresco.aos-module",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "alfresco-aos-module",/],
        [path.join(osTempDir, '.yo-rc.json'), /"version": "1.1.7",/],
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
