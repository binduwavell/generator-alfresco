'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var os = require('os');

describe('generator-alfresco:app', function () {

  this.timeout(60000);

  before(function (done) {
    helpers.run(path.join(__dirname, '../app'))
      .inDir(path.join(os.tmpdir(), './temp-test'))
      .withOptions({ 'skip-install': true })
      .withPrompt({
      })
      .on('end', done);
  });

  it('creates files', function () {
    // TODO(bwavell): add more tests
    assert.file([
      '.editorconfig',
      '.gitignore',
      '.yo-rc.json',
      'pom.xml',
      'run.sh',
      'scripts/debug.sh',
      'scripts/env.sh',
      'scripts/explode-alf-sources.sh',
      'scripts/find-exploded.sh',
      'scripts/grep-exploded.sh',
      'scripts/package-to-exploded.sh',
      'scripts/run.sh',
      'amps/README.md',
      'amps_share/README.md',
      'amps_source/README.md',
      'amps_source_templates/README.md',
      'amps_source_templates/repo-amp/pom.xml',
      'amps_source_templates/share-amp/pom.xml',
      'repo/pom.xml',
      'repo-amp/pom.xml',
      'runner/pom.xml',
      'share/pom.xml',
      'share-amp/pom.xml',
      'solr-config/pom.xml',
      'TODO.md',
      'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/README.md',
    ]);
  });
  it('adds generic include for generated beans', function () {
    assert.fileContent(
      'repo-amp/src/main/amp/config/alfresco/module/repo-amp/module-context.xml',
      /<import resource="classpath:alfresco\/module\/\${project\.artifactId}\/context\/generated\/\*-context\.xml"\/>/
    );
  });
  it('does not create enterprise specific files', function () {
    assert.noFile([
      'repo/src/main/resources/alfresco/extension/license/README.md',
    ]);
  });
  it('run.sh and debug.sh should not include -Penterprise flag', function () {
    assert.noFileContent([
      ['run.sh', /-Penterprise/],
      ['scripts/debug.sh', /-Penterprise/],
      ['scripts/run.sh', /-Penterprise/]
    ]);
  });
});
