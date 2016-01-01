'use strict';

var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');


describe('generator-alfresco:app', function () {

  describe('default prompts with local SDK, twice', function () {

    this.timeout(120000);

    before(function (done) {
      var tmpdir = path.join(os.tmpdir(), './temp-test');
      helpers.run(path.join(__dirname, '../app'))
        .inDir(tmpdir)
        .withOptions({ 'skip-install': false })
        .withPrompts({
          sdkVersion: 'local',
          archetypeVersion: '2.1.1',
        })
        .on('end', function() {
          helpers.run(path.join(__dirname, '../app'))
            .inDir(tmpdir, function(dir) {
              fs.mkdirSync( path.join(dir, 'amps_source_templates') );
              fs.mkdirSync( path.join(dir, 'amps_source_templates/repo-amp') );
              fs.writeFileSync( path.join( path.join(dir, 'amps_source_templates/repo-amp/pom.xml') ), 'dummy' );
            })
            .withLocalConfig({ 'archetypeVersion': '2.1.0' })
            .withOptions({ 'skip-install': false })
            .withPrompts({
              sdkVersion: 'local',
              archetypeVersion: '2.1.1',
            })
            .on('end', done);
        });
    });

    it('creates files', function () {
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
  describe('default prompts with SDK 2.1.0', function () {

    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.0',
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
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
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
    it('removes demo files', function () {
      assert.noFile([
        // This list is representative, it is not a complete list of items that are removed
        'repo-amp/src/main/java/org/alfresco/demoamp/Demo.java',
        'repo-amp/src/test/java/org/alfresco/demoamp/test/DemoComponentTest.java',
      ]);
    });
    it('rename slingshot context to *.sample', function () {
      assert.noFile([
        'share-amp/src/main/amp/config/alfresco/web-extension/custom-slingshot-application-context.xml',
      ]);
      assert.file([
        'share-amp/src/main/amp/config/alfresco/web-extension/custom-slingshot-application-context.xml.sample',
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

  describe('default prompts with SDK 2.1.1', function () {

    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
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
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
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
    it('removes demo files', function () {
      assert.noFile([
        // This list is representative, it is not a complete list of items that are removed
        'repo-amp/src/main/java/org/alfresco/demoamp/Demo.java',
        'repo-amp/src/test/java/org/alfresco/demoamp/test/DemoComponentTest.java',
      ]);
    });
    it('rename slingshot context to *.sample', function () {
      assert.noFile([
        'share-amp/src/main/amp/config/alfresco/web-extension/share-amp-slingshot-application-context.xml',
      ]);
      assert.file([
        'share-amp/src/main/amp/config/alfresco/web-extension/share-amp-slingshot-application-context.xml.sample',
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

  describe('projectPackage foo.bar.baz', function () {

    this.timeout(60000);

    before(function (done) {
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': true })
        .withPrompts({
          sdkVersion: '2.1.1',
          projectGroupId: 'org.alfresco',
          projectArtifactId: 'demoamp',
          projectVersion: '1.0.0-SNAPSHOT',
          projectPackage: 'foo.bar.baz',
          communityOrEnterprise: 'Community',
          includeGitIgnore: true,
          removeSamples: true,
        })
        .on('end', done);
    });

    it('removes package based demo files', function () {
      assert.noFile([
        'repo-amp/src/main/java/foo/bar/baz/demoamp/Demo.java',
        'repo-amp/src/test/java/foo/bar/baz/demoamp/test/DemoComponentTest.java',
        'repo-amp/src/main/java/foo/bar/baz/demoamp/HelloWorldWebScript.java',
        'repo-amp/src/main/java/foo/bar/baz/demoamp',
        'repo-amp/src/test/java/foo/bar/baz/demoamp/test/DemoComponentTest.java',
        'repo-amp/src/test/java/foo/bar/baz/demoamp'
      ]);
    });
  });

  describe('detects invalid JAVA_HOME quickly', function () {

    this.timeout(1000);

    before(function (done) {
      if (process.env.JAVA_HOME) {
        var javaHome = process.env.JAVA_HOME;
        process.env.JAVA_HOME = 'asdfASDF';
        helpers.run(path.join(__dirname, '../app'))
          .inDir(path.join(os.tmpdir(), './temp-test'))
          .withOptions({ 'skip-install': false })
          .on('end', function() {
              process.env.JAVA_HOME = javaHome;
              done();
            });
      } else {
        console.log("WARNING: Skipping test because JAVA_HOME is not set");
        done();
      }
    });

    it('does not generate a project', function () {
      assert.noFile([
        '.editorconfig',
        '.gitignore',
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
  });

  describe('detects invalid M2_HOME quickly', function () {

    this.timeout(1000);

    before(function (done) {
      var m2Home = process.env.M2_HOME;
      process.env.M2_HOME = 'asdfASDF';
      helpers.run(path.join(__dirname, '../app'))
        .inDir(path.join(os.tmpdir(), './temp-test'))
        .withOptions({ 'skip-install': false })
        .on('end', function() {
            if (m2Home) {
              process.env.M2_HOME = m2Home;
            } else {
              delete process.env.M2_HOME;
            }
            done();
          });
    });

    it('does not generate a project', function () {
      assert.noFile([
        '.editorconfig',
        '.gitignore',
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
  });

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
