'use strict';

let debug = require('debug')('generator-alfresco:sdk-versions');
let fs = require('fs');
let path = require('path');
let semver = require('semver');
let constants = require('generator-alfresco-common').constants;
let domutils = require('generator-alfresco-common').xml_dom_utils;
let memFsUtils = require('generator-alfresco-common').mem_fs_utils;

module.exports = {
  '2.2.0': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.2.0',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    providedCommunityVersion: '5.1.e',
    providedEnterpriseVersion: '5.1',
    supportedRepositoryVersions: '5.1.d+ and 5.1+',
    useArchetypeTemplate: true,
    sdkVersionPrefix: sdkVersionPrefix,
    defaultModuleRegistry: ampModuleRegistry,
    registerDefaultModules: registerDefaultModules,
    setupNewRepoModule: setupNewRepoAmp,
    setupNewShareModule: setupNewShareAmp,
    removeDefaultModules: removeAmps,
    removeRepoSamples: removeRepoSamples,
    removeShareSamples: removeShareSamples,
    targetFolderName: targetFolderName,
    beforeExit: beforeExit,
  },
  '2.1.1': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.1',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.2.5',
    providedCommunityVersion: '5.0.d',
    providedEnterpriseVersion: '5.0.1',
    supportedRepositoryVersions: '5.0.d+ and 5.0.1+',
    useArchetypeTemplate: true,
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
  '2.1.0': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.0',
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    providedCommunityVersion: '5.0.d',
    providedEnterpriseVersion: '5.0.1',
    supportedRepositoryVersions: '5.0.d+ and 5.0.1+',
    useArchetypeTemplate: true,
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
  '2.0.0': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.0.0',
    promptForProjectPackage: false,
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.0.5',
    providedCommunityVersion: '5.0.c',
    providedEnterpriseVersion: '5.0',
    supportedRepositoryVersions: '5.0.c and 5.0',
    useArchetypeTemplate: true,
    sdkVersionPrefix: sdkVersionPrefix,
    defaultModuleRegistry: ampModuleRegistry,
    registerDefaultModules: registerDefaultModules,
    setupNewRepoModule: setupNewRepoAmp,
    setupNewShareModule: setupNewShareAmp,
    removeDefaultModules: removeAmps,
    targetFolderName: targetFolderName,
  },
  'local': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.2.0-SNAPSHOT',
    archetypeCatalog: 'local',
    promptForArchetypeVersion: true,
    promptForProjectPackage: true,
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    providedCommunityVersion: '?',
    providedEnterpriseVersion: '?',
    supportedRepositoryVersions: 'Use local Alfresco SDK clone',
    useArchetypeTemplate: false,
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
function sdkVersionPrefix () {
  debug('checking prefix for archetype version: %s', this.config.get('archetypeVersion'));
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '>=2.2.0-SNAPSHOT')) {
      debug('setting prefix for artifactId');
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
function targetFolderName (basename) {
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '>=2.2.0-SNAPSHOT')) {
      return 'amp';
    }
  }
  debug('target folder name for archetype version: %s is: %s', this.config.get('archetypeVersion'), basename);
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
function ampModuleRegistry () {
  let prefix = sdkVersionPrefix.call(this);
  return [
    {
      'groupId': '${project.groupId}',
      'artifactId': prefix + 'repo-amp',
      'version': '${project.version}',
      'packaging': 'amp',
      'war': constants.WAR_TYPE_REPO,
      'location': 'source',
      'path': prefix + 'repo-amp',
    },
    {
      'groupId': '${project.groupId}',
      'artifactId': prefix + 'share-amp',
      'version': '${project.version}',
      'packaging': 'amp',
      'war': constants.WAR_TYPE_SHARE,
      'location': 'source',
      'path': prefix + 'share-amp',
    },
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
function registerDefaultModules () {
  debug('registering default modules');
  if (this.sdk.defaultModuleRegistry) {
    let defaultModules = this.sdk.defaultModuleRegistry.call(this);
    if (defaultModules && defaultModules.length > 0) {
      defaultModules.forEach(mod => {
        this.moduleManager.addModule(mod);
      });
      this.moduleManager.save();
    }
  }
  debug('registerDefaultModules() finished');
}

/**
 * Apply generator specific repository amp customizations.
 * For example we add the generated context folder and an
 * include for the same.
 *
 * @param pathPrefix
 */
function setupNewRepoAmp (pathPrefix) {
  this.out.info('Setting up new repository amp: ' + pathPrefix);
  let basename = path.basename(pathPrefix);

  let moduleContextPath = pathPrefix + '/src/main/amp/config/alfresco/module/' + basename + '/module-context.xml';
  let importPath = 'classpath:alfresco/module/${project.artifactId}/context/generated/*-context.xml';
  debug('Editing: %s', this.destinationPath(moduleContextPath));
  // debug(memFsUtils.dumpFileNames(this.fs));
  let contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
  // debug(contextDocOrig);
  let context = require('generator-alfresco-common').spring_context(contextDocOrig);
  if (!context.hasImport(importPath)) {
    context.addImport(importPath);
    let contextDocNew = context.getContextString();
    debug('Writing: %s', this.destinationPath(moduleContextPath));
    // debug(contextDocNew);
    this.fs.write(this.destinationPath(moduleContextPath), contextDocNew);
  }

  // TODO(bwavell): Consider updating spring-context.js module to handle this
  let serviceContextPath = pathPrefix + '/src/main/amp/config/alfresco/module/' + basename + '/context/service-context.xml';
  let serviceContextDocOrig = this.fs.read(this.destinationPath(serviceContextPath));
  let doc = domutils.parseFromString(serviceContextDocOrig);
  let moduleIdProp = domutils.getFirstNodeMatchingXPath('//property[@name="moduleId"]', doc);
  if (moduleIdProp) {
    let valueAttr = moduleIdProp.getAttribute('value');
    if (valueAttr) {
      debug('Updating moduleId in: %s', serviceContextPath);
      moduleIdProp.setAttribute('value', constants.VAR_PROJECT_ARTIFACTID);
      let serviceContextDocNew = domutils.prettyPrint(doc);
      // console.log(serviceContextDocNew);
      this.fs.write(serviceContextPath, serviceContextDocNew);
    }
  }

  let templatePath = path.resolve(this.sourceRoot(), '../../app/templates/generated-README.md');
  let generatedReadmePath = pathPrefix + '/src/main/amp/config/alfresco/module/' + basename + '/context/generated/README.md';
  debug('Adding: %s', generatedReadmePath);
  this.fs.copyTpl(
    templatePath,
    this.destinationPath(generatedReadmePath)
  );
  debug('setupNewRepoAmp() finished');
}

/**
 * Apply generator specific share amp customizations.
 * Currently nothing to do here.
 *
 * @param pathPrefix
 */
function setupNewShareAmp (pathPrefix) {
  this.out.info('Setting up new share amp: ' + pathPrefix);
  debug('setupNewShareAmp() finished');
}

function removeAmps () {
  this.out.info('Removing default amps');
  if (this.sdk.defaultModuleRegistry) {
    let defaultModules = this.sdk.defaultModuleRegistry.call(this);
    if (defaultModules && defaultModules.length > 0) {
      defaultModules.forEach(mod => {
        this.moduleManager.removeModule(mod);
      });
      this.moduleManager.save();
    }
  }
  debug('removeAmps() finished');
}

function removeRepoSamples (pathPrefix, projectPackage, artifactIdPrefix) {
  this.out.info('Removing repository sample code/config');
  let prefix = (artifactIdPrefix ? artifactIdPrefix + '-' : sdkVersionPrefix.call(this));
  let projectPackagePath = projectPackage.replace(/\./g, '/');
  [
    pathPrefix + '/src/main/amp/web/css/demoamp.css',
    pathPrefix + '/src/main/amp/web/jsp/demoamp.jsp',
    pathPrefix + '/src/main/amp/web/scripts/demoamp.js',
    pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.desc.xml',
    pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.html.ftl',
    pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/helloworld.get.js',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/webscripts/helloworld.get.js',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/context/bootstrap-context.xml',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/context/service-context.xml',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/context/webscript-context.xml',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/model/content-model.xml',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/model/workflow-model.xml',
    pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/Demo.java',
    pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/DemoComponent.java',
    pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp/HelloWorldWebScript.java',
    pathPrefix + '/src/main/java/' + projectPackagePath + '/demoamp',
    pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp/test/DemoComponentTest.java',
    pathPrefix + '/src/test/java/' + projectPackagePath + '/demoamp',
  ].forEach(file => {
    this.out.info('Removing repo-amp sample file created by maven archetype: ' + file);
    this.fs.delete(file, {globOptions: {strict: true}});
  });

  [
    pathPrefix + '/src/main/amp/config/alfresco/extension/templates/webscripts/EMPTY.txt',
    pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/model/EMPTY.txt',
    pathPrefix + '/src/main/java/EMPTY.txt',
    pathPrefix + '/src/test/java/EMPTY.txt',
  ].forEach(empty => {
    this.out.info('Creating empty file to protect important repo-amp folder: ' + empty);
    this.fs.write(empty, '<EMPTY/>\n');
  });

  let moduleContextPath = pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/module-context.xml';
  let contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
  let context = require('generator-alfresco-common').spring_context(contextDocOrig);
  [
    'classpath:alfresco/module/${project.artifactId}/context/service-context.xml',
    'classpath:alfresco/module/${project.artifactId}/context/bootstrap-context.xml',
    'classpath:alfresco/module/${project.artifactId}/context/webscript-context.xml',
  ].forEach(resource => {
    this.out.info('Removing import from repo-amp module-context.xml: ' + resource);
    context.removeImport(resource);
  });
  let contextDocNew = context.getContextString();
  this.fs.write(moduleContextPath, contextDocNew);
  debug('removeRepoSamples() finished');
}

function removeShareSamples (pathPrefix, projectPackage, artifactIdPrefix) {
  this.out.info('Removing share sample code/config');
  let prefix = (artifactIdPrefix ? artifactIdPrefix + '-' : sdkVersionPrefix.call(this));
  let projectPackagePath = projectPackage.replace(/\./g, '/');
  [
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/messages/' + prefix + 'share-amp.properties',
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-data/extensions/' + prefix + 'share-amp-example-widgets.xml',
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
  ].forEach(file => {
    this.out.info('Removing share-amp sample file created by maven archetype: ' + file);
    this.fs.delete(file, {globOptions: {strict: true}});
  });

  [
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/messages/EMPTY.txt',
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/site-data/extensions/EMPTY.txt',
    pathPrefix + '/src/main/amp/web/js/EMPTY.txt',
    pathPrefix + '/src/test/java/EMPTY.txt',
  ].forEach(empty => {
    this.out.info('Creating empty file to protect important share-amp folder: ' + empty);
    this.fs.write(empty, '<EMPTY/>\n');
  });

  let slingshotContextFile = 'custom-slingshot-application-context.xml';
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '>=2.1.1')) {
      let versionPrefix = sdkVersionPrefix.call(this);
      slingshotContextFile = versionPrefix + 'share-amp-slingshot-application-context.xml';
    }
  }
  [
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/' + slingshotContextFile,
  ].forEach(file => {
    let destinationFile = this.destinationPath(file);
    if (memFsUtils.existsInMemory(this.fs, destinationFile) || fs.existsSync(file)) {
      this.out.info('Renaming share-amp file to *.sample: ' + file);
      this.fs.move(destinationFile, destinationFile + '.sample');
    } else {
      debug('Unable to locate ' + file + ' in order to rename with .sample');
    }
  });
  debug('removeShareSamples() finished');
}

function beforeExit () {
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '>=2.2.0-SNAPSHOT')) {
      fs.writeFileSync(this.destinationPath(constants.FILE_RUN_SH), [
        '#!/bin/bash',
        'echo WARNING: This version of the SDK does not support spring-loaded.',
        'echo WARNING: Please use: run-without-springloaded.sh instead of run.sh.',
      ].join('\n'));
      fs.unlinkSync(this.destinationPath(path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_SH)));
    }
  }
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
