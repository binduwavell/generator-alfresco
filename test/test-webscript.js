'use strict';
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fs = require('fs');
var os = require('os');
var path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:webscript', function () {

  this.timeout(10000);

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
        .inTmpDir(function() {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        }.bind(this))
        .withOptions({
          "force": true, // tests can't handle conflicts
          "module-path": 'repo-amp',
          "id": 'java',
          "package": 'org.alfresco',
          "language": 'java',
          "java-base-class": 'abstract',
          "methods": 'get,put,post,delete',
          "templateFormats": [],
          "kind": '',
          "shortname": 'java shortname',
          "description": 'java description',
          "url-templates": 'java1|java2',
          "format-selector": 'any',
          "format-default": '',
          "authentication": 'user',
          "authentication-runas": 'bevis',
          "transaction": 'required',
          "transaction-allow": 'readwrite',
          "transaction-buffersize": 1024,
          "families": '',
          "cache-never": 'false',
          "cache-public": 'true',
          "cache-must-revalidate": 'true',
          "negotiations": 'html=text/html',
          "lifecycle": 'sample',
          "multipart": 'false',
          "args": 'one=two|three=four',
          "requests": '',
          "responses": '',
        })
        .on('end', done);
    });

    it('amp files exist in project', function() {
      assert.file([
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaGetWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-get-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.get.fr.properties'),
        
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaPostWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-post-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.post.fr.properties'),
        
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaPutWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-put-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.put.fr.properties'),
        
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts/JavaDeleteWebscript.java'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated/webscript-java-delete-context.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/java.delete.fr.properties'),
      ]);
    });

  });
  
  describe('after creating javascript webscripts', function () {

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/webscript'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function() {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        }.bind(this))
        .withOptions({
          "force": true, // tests can't handle conflicts
          "module-path": 'repo-amp',
          "id": 'javascript',
          "package": 'org.alfresco',
          "language": 'javascript',
          "java-base-class": '',
          "methods": 'get,put,post,delete',
          "templateFormats": ['html','json', 'xml', 'csv', 'atom', 'rss'],
          "kind": '',
          "shortname": 'javascript shortname',
          "description": 'javascript description',
          "url-templates": 'javascript1|javascript2',
          "format-selector": 'any',
          "format-default": 'html',
          "authentication": 'user',
          "authentication-runas": 'bevis',
          "transaction": 'required',
          "transaction-allow": 'readwrite',
          "transaction-buffersize": 1024,
          "families": '',
          "cache-never": 'false',
          "cache-public": 'true',
          "cache-must-revalidate": 'true',
          "negotiations": 'html=text/html',
          "lifecycle": 'sample',
          "multipart": 'false',
          "args": 'one=two|three=four',
          "requests": '',
          "responses": '',
        })
        .on('end', done);
    });

    it('amp files exist in project', function() {
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
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.get.fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.post.fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.put.fr.properties'),

        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.desc.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.js'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.config.xml'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.html.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.json.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.xml.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.csv.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.atom.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.rss.ftl'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/javascript.delete.fr.properties'),
      ]);
    });

  });
  
  describe('after creating combined java and javascript webscripts', function () {

    before(function (done) {
      helpers.run(path.join(__dirname, '../generators/webscript'))
        // generator will create a temp directory and make sure it's empty
        .inTmpDir(function() {
          // HACK: we want our test to run inside the previously generated
          // directory and we don't want it to be empty, so this is a hack
          // for that.
          process.chdir(osTempDir);
        }.bind(this))
        .withOptions({
          "force": true, // tests can't handle conflicts
          "module-path": 'repo-amp',
          "id": 'both',
          "package": 'org.alfresco',
          "language": 'both',
          "java-base-class": 'declarative',
          "methods": 'get,put,post,delete',
          "templateFormats": ['html','json', 'xml', 'csv', 'atom', 'rss'],
          "kind": '',
          "shortname": 'both shortname',
          "description": 'both description',
          "url-templates": 'both1|both2',
          "format-selector": 'any',
          "format-default": 'html',
          "authentication": 'user',
          "authentication-runas": 'bevis',
          "transaction": 'required',
          "transaction-allow": 'readwrite',
          "transaction-buffersize": 1024,
          "families": '',
          "cache-never": 'false',
          "cache-public": 'true',
          "cache-must-revalidate": 'true',
          "negotiations": 'html=text/html',
          "lifecycle": 'sample',
          "multipart": 'false',
          "args": 'one=two|three=four',
          "requests": '',
          "responses": '',
        })
        .on('end', done);
    });

    it('amp files exist in project', function() {
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
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.get.fr.properties'),

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
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.post.fr.properties'),
        
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
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.put.fr.properties'),
        
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
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.de.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.es.properties'),
        path.join(osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco/both.delete.fr.properties'),
      ]);
    });

  });

});

