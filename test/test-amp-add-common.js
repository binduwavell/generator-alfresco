'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

describe('generator-alfresco:amp-add-common', function () {
  this.timeout(30000);

  var osTempDir = path.join(os.tmpdir(), 'temp-common-test');

  // We need a test project setup before we begin
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
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
          'project-names': ['JavaScript Console', 'RM - Records Management (5.0.1)'],
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
        [path.join(osTempDir, 'repo/pom.xml'), /<groupId>de.fmaul</],
        [path.join(osTempDir, 'repo/pom.xml'), /<artifactId>javascript-console-repo</],
        [path.join(osTempDir, 'repo/pom.xml'), /<version>0\.6</],
        [path.join(osTempDir, 'share/pom.xml'), /<groupId>de.fmaul</],
        [path.join(osTempDir, 'share/pom.xml'), /<artifactId>javascript-console-share</],
        [path.join(osTempDir, 'share/pom.xml'), /<version>0\.6</],
        [path.join(osTempDir, 'repo/pom.xml'), /<groupId>\${alfresco\.groupId}</],
        [path.join(osTempDir, 'repo/pom.xml'), /<artifactId>alfresco-rm</],
        [path.join(osTempDir, 'repo/pom.xml'), /<version>2.3</],
        [path.join(osTempDir, 'share/pom.xml'), /<groupId>\${alfresco\.groupId}</],
        [path.join(osTempDir, 'share/pom.xml'), /<artifactId>alfresco-rm-share</],
        [path.join(osTempDir, 'share/pom.xml'), /<version>2.3</],
      ]);
    });

    it('references amps in .yo-rc.json', function () {
      assert.fileContent([
        [path.join(osTempDir, '.yo-rc.json'), /"groupId": "de.fmaul",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "javascript-console-repo",/],
        [path.join(osTempDir, '.yo-rc.json'), /"version": "0\.6",/],
        [path.join(osTempDir, '.yo-rc.json'), /"groupId": "de.fmaul",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "javascript-console-share",/],
        [path.join(osTempDir, '.yo-rc.json'), /"version": "0\.6",/],
        [path.join(osTempDir, '.yo-rc.json'), /"groupId": "\${alfresco\.groupId}",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "alfresco-rm",/],
        [path.join(osTempDir, '.yo-rc.json'), /"version": "2.3",/],
        [path.join(osTempDir, '.yo-rc.json'), /"groupId": "\${alfresco\.groupId}",/],
        [path.join(osTempDir, '.yo-rc.json'), /"artifactId": "alfresco-rm-share",/],
        [path.join(osTempDir, '.yo-rc.json'), /"version": "2.3",/],
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
