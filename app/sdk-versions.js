'use strict';

module.exports = {
  "2.1.1": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.1',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.2.5',
    removeSamplesScript: function() {
      var projectPackagePath = this.projectPackage.replace(/\./g, '/');
      [
        'repo-amp/src/main/amp/web/css/demoamp.css',
        'repo-amp/src/main/amp/web/jsp/demoamp.jsp',
        'repo-amp/src/main/amp/web/scripts/demoamp.js',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/webscripts/helloworld.get.js',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/bootstrap-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/service-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/webscript-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/content-model.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/workflow-model.xml',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp/Demo.java',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp/DemoComponent.java',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp/HelloWorldWebScript.java',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp',
        'repo-amp/src/test/java/' + projectPackagePath + '/demoamp/test/DemoComponentTest.java',
        'repo-amp/src/test/java/' + projectPackagePath + '/demoamp',

        'share-amp/src/main/amp/config/alfresco/web-extension/messages/share-amp.properties',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-data/extensions/share-amp-example-widgets.xml',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.desc.xml',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.html.ftl',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.js',
        'share-amp/src/main/amp/web/js/example/widgets/TemplateWidget.js',
        'share-amp/src/main/amp/web/js/example/widgets/css/TemplateWidget.css',
        'share-amp/src/main/amp/web/js/example/widgets/i18n/TemplateWidget.properties',
        'share-amp/src/main/amp/web/js/example/widgets/templates/TemplateWidget.html',
        'share-amp/src/test/java/' + projectPackagePath + '/demoamp/DemoPageTestIT.java',
        'share-amp/src/test/java/' + projectPackagePath + '/demoamp/po/DemoPage.java',
        'share-amp/src/test/resources/testng.xml',
      ].forEach(function(file) {
        this.out.info("Removing sample file created by maven archetype: " + file);
        this.fs.delete(file, {globOptions: {strict: true}});
      }.bind(this));

      [
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/EMPTY.txt',
        'repo-amp/src/main/java/EMPTY.txt',
        'repo-amp/src/test/java/EMPTY.txt',
        'share-amp/src/main/amp/config/alfresco/web-extension/messages/EMPTY.txt',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-data/extensions/EMPTY.txt',
        'share-amp/src/main/amp/web/js/EMPTY.txt',
        'share-amp/src/test/java/EMPTY.txt',
      ].forEach(function(empty) {
        this.out.info("Creating empty files to protect important folders: " + empty);
        this.fs.write(empty, '<EMPTY/>\n');
      }.bind(this));

      [
        'share-amp/src/main/amp/config/alfresco/web-extension/share-amp-slingshot-application-context.xml',
      ].forEach(function(file) {
        this.out.info("Renaming files to *.sample: " + file);
        this.fs.move(file, file + '.sample');
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
  },
  "2.1.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.0',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    removeSamplesScript: function() {
      var projectPackagePath = this.projectPackage.replace(/\./g, '/');
      [
        'repo-amp/src/main/amp/web/css/demoamp.css',
        'repo-amp/src/main/amp/web/jsp/demoamp.jsp',
        'repo-amp/src/main/amp/web/scripts/demoamp.js',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/webscripts/helloworld.get.js',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/bootstrap-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/service-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/context/webscript-context.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/content-model.xml',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/workflow-model.xml',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp/Demo.java',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp/DemoComponent.java',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp/HelloWorldWebScript.java',
        'repo-amp/src/main/java/' + projectPackagePath + '/demoamp',
        'repo-amp/src/test/java/' + projectPackagePath + '/demoamp/test/DemoComponentTest.java',
        'repo-amp/src/test/java/' + projectPackagePath + '/demoamp',

        'share-amp/src/main/amp/config/alfresco/web-extension/messages/share-amp.properties',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-data/extensions/share-amp-example-widgets.xml',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.desc.xml',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.html.ftl',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.js',
        'share-amp/src/main/amp/web/js/example/widgets/TemplateWidget.js',
        'share-amp/src/main/amp/web/js/example/widgets/css/TemplateWidget.css',
        'share-amp/src/main/amp/web/js/example/widgets/i18n/TemplateWidget.properties',
        'share-amp/src/main/amp/web/js/example/widgets/templates/TemplateWidget.html',
        'share-amp/src/test/java/' + projectPackagePath + '/demoamp/DemoPageTestIT.java',
        'share-amp/src/test/java/' + projectPackagePath + '/demoamp/po/DemoPage.java',
        'share-amp/src/test/resources/testng.xml',
      ].forEach(function(file) {
        this.out.info("Removing sample file created by maven archetype: " + file);
        this.fs.delete(file, {globOptions: {strict: true}});
      }.bind(this));

      [
        'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
        'repo-amp/src/main/amp/config/alfresco/module/repo-amp/model/EMPTY.txt',
        'repo-amp/src/main/java/EMPTY.txt',
        'repo-amp/src/test/java/EMPTY.txt',
        'share-amp/src/main/amp/config/alfresco/web-extension/messages/EMPTY.txt',
        'share-amp/src/main/amp/config/alfresco/web-extension/site-data/extensions/EMPTY.txt',
        'share-amp/src/main/amp/web/js/EMPTY.txt',
        'share-amp/src/test/java/EMPTY.txt',
      ].forEach(function(empty) {
        this.out.info("Creating empty files to protect important folders: " + empty);
        this.fs.write(empty, '<EMPTY/>\n');
      }.bind(this));

      [
        'share-amp/src/main/amp/config/alfresco/web-extension/custom-slingshot-application-context.xml',
      ].forEach(function(file) {
        this.out.info("Renaming files to *.sample: " + file);
        this.fs.move(file, file + '.sample');
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
