'use strict';
/* eslint-env node, mocha */
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var os = require('os');
var path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:webscript', function () {
  this.timeout(30000);

  var osTempDir = path.join(os.tmpdir(), 'temp-test');

  // We need a test project setup before we begin
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: false, // we need source modules to gen into
      })
      .on('end', done);
  });

  describe('after creating java webscripts', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/webscript'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true, // tests can't handle conflicts
          'module-path': 'repo-amp',
          'id': 'java',
          'package': 'org.alfresco',
          'language': 'java',
          'java-base-class': 'abstract',
          'methods': 'get,put,post,delete',
          'template-formats': '',
          'kind': '',
          'shortname': 'java shortname',
          'description': 'java description',
          'url-templates': 'java1|java2',
          'format-selector': 'any',
          'format-default': '',
          'authentication': 'user',
          'authentication-runas': 'bevis',
          'transaction': 'required',
          'transaction-allow': 'readwrite',
          'transaction-buffersize': 1024,
          'families': '',
          'cache-never': 'false',
          'cache-public': 'true',
          'cache-must-revalidate': 'true',
          'negotiations': 'html=text/html',
          'lifecycle': 'sample',
          'multipart': 'false',
          'args': 'one=two|three=four',
          'requests': '',
          'responses': '',
        })
        .on('end', done);
    });

    it('amp files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaGetWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-get-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaPostWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-post-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaPutWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-put-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaDeleteWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-delete-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete_fr.properties'),
      ]);
    });
  });

  describe('after creating javascript webscripts', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/webscript'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true, // tests can't handle conflicts
          'module-path': 'repo-amp',
          'id': 'javascript',
          'package': 'org.alfresco',
          'language': 'javascript',
          'java-base-class': '',
          'methods': 'get,put,post,delete',
          'template-formats': 'html,json,xml,csv,atom,rss',
          'kind': '',
          'shortname': 'javascript shortname',
          'description': 'javascript description',
          'url-templates': 'javascript1|javascript2',
          'format-selector': 'any',
          'format-default': 'html',
          'authentication': 'user',
          'authentication-runas': 'bevis',
          'transaction': 'required',
          'transaction-allow': 'readwrite',
          'transaction-buffersize': 1024,
          'families': '',
          'cache-never': 'false',
          'cache-public': 'true',
          'cache-must-revalidate': 'true',
          'negotiations': 'html=text/html',
          'lifecycle': 'sample',
          'multipart': 'false',
          'args': 'one=two|three=four',
          'requests': '',
          'responses': '',
        })
        .on('end', done);
    });

    it('amp files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete_fr.properties'),
      ]);
    });
  });

  describe('after creating combined java and javascript webscripts', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/webscript'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true, // tests can't handle conflicts
          'module-path': 'repo-amp',
          'id': 'both',
          'package': 'org.alfresco',
          'language': 'both',
          'java-base-class': 'declarative',
          'methods': 'get,put,post,delete',
          'template-formats': 'html,json,xml,csv,atom,rss',
          'kind': '',
          'shortname': 'both shortname',
          'description': 'both description',
          'url-templates': 'both1|both2',
          'format-selector': 'any',
          'format-default': 'html',
          'authentication': 'user',
          'authentication-runas': 'bevis',
          'transaction': 'required',
          'transaction-allow': 'readwrite',
          'transaction-buffersize': 1024,
          'families': '',
          'cache-never': 'false',
          'cache-public': 'true',
          'cache-must-revalidate': 'true',
          'negotiations': 'html=text/html',
          'lifecycle': 'sample',
          'multipart': 'false',
          'args': 'one=two|three=four',
          'requests': '',
          'responses': '',
        })
        .on('end', done);
    });

    it('amp files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/BothGetWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-both-get-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/BothPostWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-both-post-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/BothPutWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-both-put-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/BothDeleteWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-both-delete-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete_fr.properties'),
      ]);
    });
  });

  describe('after creating combined java and javascript webscripts via prompts', function () {
    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/webscript'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function () {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        })
        .withOptions({
          'force': true,
          'module-path': 'repo-amp',
        })
        .withPrompts({
          'id': 'prompt',
          'package': '/org/alfresco',
          'language': 'Both Java & JavaScript',
          'javaBaseClass': 'DeclarativeWebScript',
          'methods': ['get', 'put', 'post', 'delete'],
          'templateFormats': ['html', 'json', 'xml', 'csv', 'atom', 'rss'],
          'kind': '',
          'shortname': 'prompt shortname',
          'description': 'prompt description',
          'urlTemplates': ['prompt1', 'prompt2'],
          'formatSelector': 'any',
          'formatDefault': 'html',
          'authentication': 'user',
          'authenticationRunas': 'bevis',
          'transaction': 'required',
          'transactionAllow': 'readwrite',
          'transactionBuffersize': 1024,
          'families': [],
          'cacheNever': 'false',
          'cachePublic': 'true',
          'cacheMustrevalidate': 'true',
          'negotiations': '{"html":"text/html"}',
          'lifecycle': 'sample',
          'formdataMultipartProcessing': 'false',
          'args': '{"one":"two","three":"four"}',
          'requests': [],
          'responses': [],
        })
        .on('end', done);
    });

    it('amp files exist in project', function () {
      assert.file([
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/PromptGetWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-prompt-get-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.get_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/PromptPostWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-prompt-post-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.post_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/PromptPutWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-prompt-put-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.put_fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/PromptDeleteWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-prompt-delete-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete_de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete_es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/prompt.delete_fr.properties'),
      ]);
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
