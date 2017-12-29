'use strict';
/* eslint-env node, mocha */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const os = require('os');
const path = require('path');

// TODO(bwavell): add a bunch more tests

describe('generator-alfresco:webscript-2-1-1', function () {
  this.timeout(30000);

  const osTempDir = path.join(os.tmpdir(), 'temp-test');

  // We need a test project setup before we begin
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .inDir(osTempDir)
      .withOptions({ 'skip-install': true })
      .withPrompts({
        sdkVersion: '2.1.1',
        projectArtifactId: 'temp-test',
        removeDefaultSourceAmps: false, // we need source modules to gen into
      })
      .toPromise();
  });

  it('creates a project', function () {
    assert.file(path.join(osTempDir, '.yo-rc.json'));
  });

  describe('after creating java webscripts', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/webscript'))
        .cd(osTempDir)
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
        .toPromise();
    });

    it('amp files exist in project', function () {
      assert.file([
        'java.get.desc.xml',
        'java.get_de.properties',
        'java.get.properties',
        'java.get_es.properties',
        'java.get_fr.properties',

        'java.post.desc.xml',
        'java.post_de.properties',
        'java.post.properties',
        'java.post_es.properties',
        'java.post_fr.properties',

        'java.put.desc.xml',
        'java.put_de.properties',
        'java.put.properties',
        'java.put_es.properties',
        'java.put_fr.properties',

        'java.delete.desc.xml',
        'java.delete_de.properties',
        'java.delete.properties',
        'java.delete_es.properties',
        'java.delete_fr.properties',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco', relativePath)));

      assert.file([
        'webscript-java-get-context.xml',
        'webscript-java-post-context.xml',
        'webscript-java-put-context.xml',
        'webscript-java-delete-context.xml',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated', relativePath)));

      assert.file([
        'JavaGetWebscript.java',
        'JavaPostWebscript.java',
        'JavaPutWebscript.java',
        'JavaDeleteWebscript.java',
      ].map(relativePath => path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts', relativePath)));
    });
  });

  describe('after creating javascript webscripts', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/webscript'))
        .cd(osTempDir)
        .withOptions({
          'force': true, // tests can't handle conflicts
          'module-path': 'repo-amp',
          'id': 'javascript',
          'package': 'org.alfresco',
          'language': 'javascript',
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
        .toPromise();
    });

    it('amp files exist in project', function () {
      assert.file([
        'javascript.get.desc.xml',
        'javascript.get.js',
        'javascript.get.config.xml',
        'javascript.get.html.ftl',
        'javascript.get.json.ftl',
        'javascript.get.xml.ftl',
        'javascript.get.csv.ftl',
        'javascript.get.atom.ftl',
        'javascript.get.rss.ftl',
        'javascript.get_de.properties',
        'javascript.get.properties',
        'javascript.get_es.properties',
        'javascript.get_fr.properties',

        'javascript.post.desc.xml',
        'javascript.post.js',
        'javascript.post.config.xml',
        'javascript.post.html.ftl',
        'javascript.post.json.ftl',
        'javascript.post.xml.ftl',
        'javascript.post.csv.ftl',
        'javascript.post.atom.ftl',
        'javascript.post.rss.ftl',
        'javascript.post_de.properties',
        'javascript.post.properties',
        'javascript.post_es.properties',
        'javascript.post_fr.properties',

        'javascript.put.desc.xml',
        'javascript.put.js',
        'javascript.put.config.xml',
        'javascript.put.html.ftl',
        'javascript.put.json.ftl',
        'javascript.put.xml.ftl',
        'javascript.put.csv.ftl',
        'javascript.put.atom.ftl',
        'javascript.put.rss.ftl',
        'javascript.put_de.properties',
        'javascript.put.properties',
        'javascript.put_es.properties',
        'javascript.put_fr.properties',

        'javascript.delete.desc.xml',
        'javascript.delete.js',
        'javascript.delete.config.xml',
        'javascript.delete.html.ftl',
        'javascript.delete.json.ftl',
        'javascript.delete.xml.ftl',
        'javascript.delete.csv.ftl',
        'javascript.delete.atom.ftl',
        'javascript.delete.rss.ftl',
        'javascript.delete_de.properties',
        'javascript.delete.properties',
        'javascript.delete_es.properties',
        'javascript.delete_fr.properties',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco', relativePath)));
    });
  });

  describe('after creating combined java and javascript webscripts', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/webscript'))
        .cd(osTempDir)
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
        .toPromise();
    });

    it('amp files exist in project', function () {
      assert.file([
        'both.get.desc.xml',
        'both.get.js',
        'both.get.config.xml',
        'both.get.html.ftl',
        'both.get.json.ftl',
        'both.get.xml.ftl',
        'both.get.csv.ftl',
        'both.get.atom.ftl',
        'both.get.rss.ftl',
        'both.get_de.properties',
        'both.get.properties',
        'both.get_es.properties',
        'both.get_fr.properties',

        'both.post.desc.xml',
        'both.post.js',
        'both.post.config.xml',
        'both.post.html.ftl',
        'both.post.json.ftl',
        'both.post.xml.ftl',
        'both.post.csv.ftl',
        'both.post.atom.ftl',
        'both.post.rss.ftl',
        'both.post_de.properties',
        'both.post.properties',
        'both.post_es.properties',
        'both.post_fr.properties',

        'both.put.desc.xml',
        'both.put.js',
        'both.put.config.xml',
        'both.put.html.ftl',
        'both.put.json.ftl',
        'both.put.xml.ftl',
        'both.put.csv.ftl',
        'both.put.atom.ftl',
        'both.put.rss.ftl',
        'both.put_de.properties',
        'both.put.properties',
        'both.put_es.properties',
        'both.put_fr.properties',

        'both.delete.desc.xml',
        'both.delete.js',
        'both.delete.config.xml',
        'both.delete.html.ftl',
        'both.delete.json.ftl',
        'both.delete.xml.ftl',
        'both.delete.csv.ftl',
        'both.delete.atom.ftl',
        'both.delete.rss.ftl',
        'both.delete_de.properties',
        'both.delete.properties',
        'both.delete_es.properties',
        'both.delete_fr.properties',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco', relativePath)));

      assert.file([
        'webscript-both-get-context.xml',
        'webscript-both-post-context.xml',
        'webscript-both-put-context.xml',
        'webscript-both-delete-context.xml',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated', relativePath)));

      assert.file([
        'BothGetWebscript.java',
        'BothPostWebscript.java',
        'BothPutWebscript.java',
        'BothDeleteWebscript.java',
      ].map(relativePath => path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts', relativePath)));
    });
  });

  describe('after creating combined java and javascript webscripts via prompts', function () {
    before(function () {
      return helpers.run(path.join(__dirname, '../generators/webscript'))
        .cd(osTempDir)
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
        .toPromise();
    });

    it('amp files exist in project', function () {
      assert.file([
        'prompt.get.desc.xml',
        'prompt.get.js',
        'prompt.get.config.xml',
        'prompt.get.html.ftl',
        'prompt.get.json.ftl',
        'prompt.get.xml.ftl',
        'prompt.get.csv.ftl',
        'prompt.get.atom.ftl',
        'prompt.get.rss.ftl',
        'prompt.get_de.properties',
        'prompt.get.properties',
        'prompt.get_es.properties',
        'prompt.get_fr.properties',

        'prompt.post.desc.xml',
        'prompt.post.js',
        'prompt.post.config.xml',
        'prompt.post.html.ftl',
        'prompt.post.json.ftl',
        'prompt.post.xml.ftl',
        'prompt.post.csv.ftl',
        'prompt.post.atom.ftl',
        'prompt.post.rss.ftl',
        'prompt.post_de.properties',
        'prompt.post.properties',
        'prompt.post_es.properties',
        'prompt.post_fr.properties',

        'prompt.put.desc.xml',
        'prompt.put.js',
        'prompt.put.config.xml',
        'prompt.put.html.ftl',
        'prompt.put.json.ftl',
        'prompt.put.xml.ftl',
        'prompt.put.csv.ftl',
        'prompt.put.atom.ftl',
        'prompt.put.rss.ftl',
        'prompt.put_de.properties',
        'prompt.put.properties',
        'prompt.put_es.properties',
        'prompt.put_fr.properties',

        'prompt.delete.desc.xml',
        'prompt.delete.js',
        'prompt.delete.config.xml',
        'prompt.delete.html.ftl',
        'prompt.delete.json.ftl',
        'prompt.delete.xml.ftl',
        'prompt.delete.csv.ftl',
        'prompt.delete.atom.ftl',
        'prompt.delete.rss.ftl',
        'prompt.delete_de.properties',
        'prompt.delete.properties',
        'prompt.delete_es.properties',
        'prompt.delete_fr.properties',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/org/alfresco', relativePath)));

      assert.file([
        'webscript-prompt-get-context.xml',
        'webscript-prompt-post-context.xml',
        'webscript-prompt-put-context.xml',
        'webscript-prompt-delete-context.xml',
      ].map(relativePath => path.join(
        osTempDir, 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/generated', relativePath)));

      assert.file([
        'PromptGetWebscript.java',
        'PromptPostWebscript.java',
        'PromptPutWebscript.java',
        'PromptDeleteWebscript.java',
      ].map(relativePath => path.join(osTempDir, 'repo-amp/src/main/java/org/alfresco/webscripts', relativePath)));
    });
  });
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
