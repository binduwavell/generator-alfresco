'use strict';

module.exports = {
  "2.1.1": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.1',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.2.5',
    defaultModuleRegistry: function() {
      return [
        {
          "groupId": this.projectGroupId,
          "artifactId": "repo-amp",
          "version": this.projectVersion,
          "packaging": "amp",
          "war": "repo",
          "location": "source",
          "path": "repo-amp",
        },
        {
          "groupId": this.projectGroupId,
          "artifactId": "share-amp",
          "version": this.projectVersion,
          "packaging": "amp",
          "war": "share",
          "location": "source",
          "path": "share-amp",
        }
      ];
    },
    removeRepoSamplesScript: function(pathPrefix) {
      var projectPackagePath = this.projectPackage.replace(/\./g, '/');
      [
        pathPrefix + '/src/main/amp/web/css/demoamp.css',
        pathPrefix + '/src/main/amp/web/jsp/demoamp.jsp',
        pathPrefix + '/src/main/amp/web/scripts/demoamp.js',
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/webscripts/helloworld.get.js',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/context/bootstrap-context.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/context/service-context.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/context/webscript-context.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/model/content-model.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/model/workflow-model.xml',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/Demo.java',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/DemoComponent.java',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/HelloWorldWebScript.java',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/test/DemoComponentTest.java',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp',
      ].forEach(function(file) {
        this.out.info("Removing repo-amp sample file created by maven archetype: " + file);
        this.fs.delete(file, {globOptions: {strict: true}});
      }.bind(this));

      [
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/model/EMPTY.txt',
        pathPrefix + '/src/main/java/EMPTY.txt',
        pathPrefix + '/src/test/java/EMPTY.txt',
      ].forEach(function(empty) {
        this.out.info("Creating empty file to protect important repo-amp folder: " + empty);
        this.fs.write(empty, '<EMPTY/>\n');
      }.bind(this));

      var moduleContextPath = 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/module-context.xml';
      var contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
      var context = require('./spring-context.js')(contextDocOrig);
      [
        'classpath:alfresco/module/${project.artifactId}/context/service-context.xml',
        'classpath:alfresco/module/${project.artifactId}/context/bootstrap-context.xml',
        'classpath:alfresco/module/${project.artifactId}/context/webscript-context.xml',
      ].forEach(function(resource) {
        this.out.info("Removing import from repo-amp module-context.xml: " + resource);
        context.removeImport(resource);
      }.bind(this));
      var contextDocNew = context.getContextString();
      this.fs.write(moduleContextPath, contextDocNew);
    },
    removeShareSamplesScript: function(pathPrefix) {
      var projectPackagePath = this.projectPackage.replace(/\./g, '/');
      [
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/messages/share-amp.properties',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-data/extensions/share-amp-example-widgets.xml',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.desc.xml',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.html.ftl',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.js',
        pathPrefix + '/src/main/amp/web/js/example/widgets/TemplateWidget.js',
        pathPrefix + '/src/main/amp/web/js/example/widgets/css/TemplateWidget.css',
        pathPrefix + '/src/main/amp/web/js/example/widgets/i18n/TemplateWidget.properties',
        pathPrefix + '/src/main/amp/web/js/example/widgets/templates/TemplateWidget.html',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/DemoPageTestIT.java',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/po/DemoPage.java',
        pathPrefix + '/src/test/resources/testng.xml',
      ].forEach(function(file) {
        this.out.info("Removing share-amp sample file created by maven archetype: " + file);
        this.fs.delete(file, {globOptions: {strict: true}});
      }.bind(this));

      [
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/messages/EMPTY.txt',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-data/extensions/EMPTY.txt',
        pathPrefix + '/src/main/amp/web/js/EMPTY.txt',
        pathPrefix + '/src/test/java/EMPTY.txt',
      ].forEach(function(empty) {
        this.out.info("Creating empty file to protect important share-amp folder: " + empty);
        this.fs.write(empty, '<EMPTY/>\n');
      }.bind(this));

      [
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/share-amp-slingshot-application-context.xml',
      ].forEach(function(file) {
        this.out.info("Renaming share-amp file to *.sample: " + file);
        this.fs.move(file, file + '.sample');
      }.bind(this));
    },
  },
  "2.1.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.0',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    defaultModuleRegistry: function() {
      return [
        {
          "groupId": this.projectGroupId,
          "artifactId": "repo-amp",
          "version": this.projectVersion,
          "packaging": "amp",
          "war": "repo",
          "location": "source",
          "path": "repo-amp",
        },
        {
          "groupId": this.projectGroupId,
          "artifactId": "share-amp",
          "version": this.projectVersion,
          "packaging": "amp",
          "war": "share",
          "location": "source",
          "path": "share-amp",
        }
      ];
    },
    removeRepoSamplesScript: function(pathPrefix) {
      var projectPackagePath = this.projectPackage.replace(/\./g, '/');
      [
        pathPrefix + '/src/main/amp/web/css/demoamp.css',
        pathPrefix + '/src/main/amp/web/jsp/demoamp.jsp',
        pathPrefix + '/src/main/amp/web/scripts/demoamp.js',
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/webscripts/helloworld.get.js',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/context/bootstrap-context.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/context/service-context.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/context/webscript-context.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/model/content-model.xml',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/model/workflow-model.xml',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/Demo.java',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/DemoComponent.java',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/HelloWorldWebScript.java',
        pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/test/DemoComponentTest.java',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp',
      ].forEach(function(file) {
        this.out.info("Removing repo-amp sample file created by maven archetype: " + file);
        this.fs.delete(file, {globOptions: {strict: true}});
      }.bind(this));

      [
        pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
        pathPrefix + '/src/main/amp/config/alfresco/module/repo-amp/model/EMPTY.txt',
        pathPrefix + '/src/main/java/EMPTY.txt',
        pathPrefix + '/src/test/java/EMPTY.txt',
      ].forEach(function(empty) {
        this.out.info("Creating empty file to protect important repo-amp folder: " + empty);
        this.fs.write(empty, '<EMPTY/>\n');
      }.bind(this));

      var moduleContextPath = 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/module-context.xml';
      var contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
      var context = require('./spring-context.js')(contextDocOrig);
      [
        'classpath:alfresco/module/${project.artifactId}/context/service-context.xml',
        'classpath:alfresco/module/${project.artifactId}/context/bootstrap-context.xml',
        'classpath:alfresco/module/${project.artifactId}/context/webscript-context.xml',
      ].forEach(function(resource) {
        this.out.info("Removing import from module-context.xml: " + resource);
        context.removeImport(resource);
      }.bind(this));
      var contextDocNew = context.getContextString();
      this.fs.write(moduleContextPath, contextDocNew);
    },
    removeShareSamplesScript: function(pathPrefix) {
      var projectPackagePath = this.projectPackage.replace(/\./g, '/');
      [
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/messages/share-amp.properties',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-data/extensions/share-amp-example-widgets.xml',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.desc.xml',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.html.ftl',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.js',
        pathPrefix + '/src/main/amp/web/js/example/widgets/TemplateWidget.js',
        pathPrefix + '/src/main/amp/web/js/example/widgets/css/TemplateWidget.css',
        pathPrefix + '/src/main/amp/web/js/example/widgets/i18n/TemplateWidget.properties',
        pathPrefix + '/src/main/amp/web/js/example/widgets/templates/TemplateWidget.html',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/DemoPageTestIT.java',
        pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/po/DemoPage.java',
        pathPrefix + '/src/test/resources/testng.xml',
      ].forEach(function(file) {
        this.out.info("Removing share-amp sample file created by maven archetype: " + file);
        this.fs.delete(file, {globOptions: {strict: true}});
      }.bind(this));

      [
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/messages/EMPTY.txt',
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-data/extensions/EMPTY.txt',
        pathPrefix + '/src/main/amp/web/js/EMPTY.txt',
        pathPrefix + '/src/test/java/EMPTY.txt',
      ].forEach(function(empty) {
        this.out.info("Creating empty file to protect important share-amp folder: " + empty);
        this.fs.write(empty, '<EMPTY/>\n');
      }.bind(this));

      [
        pathPrefix + '/src/main/amp/config/alfresco/web-extension/custom-slingshot-application-context.xml',
      ].forEach(function(file) {
        this.out.info("Renaming files to *.sample: " + file);
        this.fs.move(file, file + '.sample');
      }.bind(this));
    },
  },
  "2.0.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.0.0',
    promptForProjectPackage: false,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.0.5',
  },
  "local": {
    archetypeGroupId: "org.alfresco.maven.archetype",
    archetypeArtifactId: "alfresco-allinone-archetype",
    archetypeVersion: "2.1.0-SNAPSHOT",
    archetypeCatalog: 'local',
    promptForArchetypeVersion: true,
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
  }
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
