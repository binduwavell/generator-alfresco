'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var constants = require('generator-alfresco-common').constants;
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

describe('generator-alfresco:app-local', function () {
  describe('default prompts with local SDK', function () {
    this.timeout(60000);

    var tmpdir = path.join(os.tmpdir(), './temp-test');

    before(function () {
      return helpers.run(path.join(__dirname, '../generators/app'))
        .inDir(tmpdir)
        .withOptions({'skip-install': false})
        .withPrompts({
          sdkVersion: 'local',
          archetypeVersion: '2.1.1',
          removeDefaultSourceAmps: false,
          removeDefaultSourceSamples: false,
        })
        .toPromise();
    });

    it('creates a project', function () {
      assert.file(path.join(tmpdir, '.yo-rc.json'));
    });

    describe('default prompts with local SDK inside previous instantiation', function () {
      before(function () {
        return helpers.run(path.join(__dirname, '../generators/app'))
          .inTmpDir(function () {
            // HACK: we want our test to run inside the previously generated
            // directory and we don't want it to be empty, so this is a hack
            // for that.
            process.chdir(tmpdir);
          })
          .withLocalConfig({ 'archetypeVersion': '2.1.0' })
          .withOptions({ 'skip-install': false })
          .withPrompts({
            sdkVersion: 'local',
            archetypeVersion: '2.1.1',
            removeDefaultSourceAmps: false,
            removeDefaultSourceSamples: false,
          })
          .toPromise();
      });

      it('creates files', function () {
        assert.file([
          '.editorconfig',
          '.gitignore',
          '.yo-rc.json',
          'pom.xml',
          'debug.sh',
          'run.sh',
          'run.bat',
          'run-without-springloaded.sh',
          'scripts/debug.sh',
          'scripts/env.sh',
          'scripts/explode-alf-sources.sh',
          'scripts/find-exploded.sh',
          'scripts/grep-exploded.sh',
          'scripts/package-to-exploded.sh',
          'scripts/run.sh',
          'scripts/run.bat',
          'scripts/run-without-springloaded.sh',
          constants.FOLDER_SOURCE_TEMPLATES + '/README.md',
          constants.FOLDER_SOURCE_TEMPLATES + '/repo-amp/pom.xml',
          constants.FOLDER_SOURCE_TEMPLATES + '/share-amp/pom.xml',
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
          ['debug.sh', /-Penterprise/],
          ['run.sh', /-Penterprise/],
          ['run.bat', /-Penterprise/],
          ['run-without-springloaded.sh', /-Penterprise/],
          ['scripts/debug.sh', /-Penterprise/],
          ['scripts/run.sh', /-Penterprise/],
          ['scripts/run.bat', /-Penterprise/],
          ['scripts/run-without-springloaded.sh', /-Penterprise/],
        ]);
      });
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
