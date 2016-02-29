'use strict';

var path = require('path');
var semver = require('semver');
var constants = require('./constants.js');

module.exports = {
  "2.1.1": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.1',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.2.5',
    sdkVersionPrefix: sdkVersionPrefix,
    defaultModuleRegistry: ampModuleRegistry,
    registerDefaultModules: registerDefaultModules,
    setupNewRepoModule: setupNewRepoAmp,
    setupNewShareModule: setupNewShareAmp,
    removeDefaultModules: removeAmps,
    removeRepoSamples: removeRepoSamples,
    removeShareSamples: removeShareSamples,
    targetFolderName: targetFolderName,
  },
  "2.1.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.0',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    sdkVersionPrefix: sdkVersionPrefix,
    defaultModuleRegistry: ampModuleRegistry,
    registerDefaultModules: registerDefaultModules,
    setupNewRepoModule: setupNewRepoAmp,
    setupNewShareModule: setupNewShareAmp,
    removeDefaultModules: removeAmps,
    removeRepoSamples: removeRepoSamples,
    removeShareSamples: removeShareSamples,
    targetFolderName: targetFolderName,
  },
  "2.0.0": {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.0.0',
    promptForProjectPackage: false,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.0.5',
    sdkVersionPrefix: sdkVersionPrefix,
    defaultModuleRegistry: ampModuleRegistry,
    registerDefaultModules: registerDefaultModules,
    setupNewRepoModule: setupNewRepoAmp,
    setupNewShareModule: setupNewShareAmp,
    removeDefaultModules: removeAmps,
    targetFolderName: targetFolderName,
  },
  "local": {
    archetypeGroupId: "org.alfresco.maven.archetype",
    archetypeArtifactId: "alfresco-allinone-archetype",
    archetypeVersion: "2.2.0-SNAPSHOT",
    archetypeCatalog: 'local',
    promptForArchetypeVersion: true,
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    sdkVersionPrefix: sdkVersionPrefix,
    defaultModuleRegistry: ampModuleRegistry,
    registerDefaultModules: registerDefaultModules,
    setupNewRepoModule: setupNewRepoAmp,
    setupNewShareModule: setupNewShareAmp,
    removeDefaultModules: removeAmps,
    targetFolderName: targetFolderName,
  },
};

// ===== Shared scripts =====

/**
 * Starting in the dev branch for the 2.2.0 SDK we started creating
 * dynamic names for the repo-amp and share-amp by prepending these
 * names with the project artifactId followed by a dash. This
 * function uses semver to provide a prefix or an empty string that
 * can be placed in front of repo-amp and share-amp to get the
 * appropriate names.
 *
 * @returns {string} empty string if sdk >= 2.2.0-SNAPSHOT
 */
function sdkVersionPrefix() {
  // console.log("CHECKING PREFIX FOR ARCHETYPE VERSION: " + this.config.get('archetypeVersion'));
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), ">=2.2.0-SNAPSHOT")) {
      // console.log("SETTING PREFIX FOR ARTIFACT ID");
      return this.config.get(constants.PROP_PROJECT_ARTIFACT_ID) + '-';
    }
  }
  return '';
}

/**
 * Starting in the dev branch for the 2.2.0 SDK we changed where
 * the filtered assets from src/main/amp end up in the target
 * folder.
 *
 * @param basename
 * @returns {string} 'amp' if sdk >= 2.2.0-SNAPSHOT otherwise basename
 */
function targetFolderName(basename) {
  // console.log("CHECKING TARGET FOLDER NAME FOR ARCHETYPE VERSION: " + this.config.get('archetypeVersion'));
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), ">=2.2.0-SNAPSHOT")) {
      return 'amp';
    }
  }
  return basename;
}

/**
 * All supported SDK versions work with amps and not
 * jar modules. However, we know jar modules are
 * going to happen soon, so factored this out so we
 * can create something similar for jar modules for
 * newer SDK version.
 *
 * @returns {*[]} The module registry that represents
 *   what is provided when the archetype has stamped
 *   a project out.
 */
function ampModuleRegistry() {
  var prefix = sdkVersionPrefix.call(this);
  return [
    {
      "groupId": '${project.groupId}',
      "artifactId": prefix + 'repo-amp',
      "version": '${project.version}',
      "packaging": 'amp',
      "war": constants.WAR_TYPE_REPO,
      "location": 'source',
      "path": prefix + 'repo-amp',
    },
    {
      "groupId": '${project.groupId}',
      "artifactId": prefix + 'share-amp',
      "version": '${project.version}',
      "packaging": 'amp',
      "war": constants.WAR_TYPE_SHARE,
      "location": 'source',
      "path": prefix + 'share-amp',
    }
  ];
}

/**
 * During initial project setup we need code that will
 * register the default modules provided by the SDK with
 * the module manager / registry. Currently this is
 * generic, in which case we could move it back to
 * generators/app/index.js. We are leaving it factored
 * out in case it helps once we get multiple module types
 * in the 3.0 SDK.
 */
function registerDefaultModules() {
  if (this.sdk.defaultModuleRegistry) {
    var defaultModules = this.sdk.defaultModuleRegistry.call(this);
    if (defaultModules && defaultModules.length > 0) {
      defaultModules.forEach(function (mod) {
        this.moduleManager.addModule(mod);
      }.bind(this));
      this.moduleManager.save();
    }
  }
}

/**
 * Apply generator specific repository amp customizations.
 * For example we add the generated context folder and an
 * include for the same.
 *
 * @param pathPrefix
 */
function setupNewRepoAmp(pathPrefix) {
  var basename = path.basename(pathPrefix);
  var moduleContextPath = pathPrefix + '/src/main/amp/config/alfresco/module/' + basename + '/module-context.xml';
  var importPath = 'classpath:alfresco/module/${project.artifactId}/context/generated/*-context.xml';

  var contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
  var context = require('./spring-context.js')(contextDocOrig);
  if (!context.hasImport(importPath)) {
    context.addImport(importPath);
    var contextDocNew = context.getContextString();
    // console.log(contextDocNew);
    this.fs.write(moduleContextPath, contextDocNew);
  }

  var generatedReadmePath = pathPrefix + '/src/main/amp/config/alfresco/module/' + basename + '/context/generated/README.md';
  this.fs.copyTpl(
    this.templatePath('generated-README.md'),
    this.destinationPath(generatedReadmePath)
  );
}

/**
 * Apply generator specific share amp customizations.
 * Currently nothing to do here.
 *
 * @param pathPrefix
 */
function setupNewShareAmp(pathPrefix) {

}

function removeAmps() {
  if (this.sdk.defaultModuleRegistry) {
    var defaultModules = this.sdk.defaultModuleRegistry.call(this);
    if (defaultModules && defaultModules.length > 0) {
      defaultModules.forEach(function (mod) {
        this.moduleManager.removeModule(mod);
      }.bind(this));
      this.moduleManager.save();
    }
  }
}

function removeRepoSamples(pathPrefix) {
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
}

function removeShareSamples(pathPrefix) {
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

  var slingshotContextFile = 'custom-slingshot-application-context.xml';
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), ">=2.1.1")) {
      slingshotContextFile = 'share-amp-slingshot-application-context.xml';

    }
  }
  [
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/' + slingshotContextFile,
  ].forEach(function(file) {
    this.out.info("Renaming share-amp file to *.sample: " + file);
    this.fs.move(file, file + '.sample');
  }.bind(this));
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
