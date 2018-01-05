'use strict';

const debug = require('debug')('generator-alfresco:sdk-versions');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const constants = require('generator-alfresco-common').constants;
const domutils = require('generator-alfresco-common').xml_dom_utils;
const memFsUtils = require('generator-alfresco-common').mem_fs_utils;

module.exports = {
  '3.0.1': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '3.0.1',
    promptForProjectPackage: true,
    providedCommunityVersion: '5.2.f',
    providedEnterpriseVersion: '5.2.2',
    providedEnterpriseShareVersion: '5.2.2',
    providedEnterpriseSurfVersion: '6.11',
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.3.0',
    supportedRepositoryVersions: '5.2.e+ and 5.2.0+',
    useArchetypeTemplate: true,
    defaultModuleRegistry: defaultJarModuleRegistry,
    defaultSourceModule: defaultSourceModule,
    registerDefaultModules: registerDefaultModules,
    removeDefaultModules: removeDefaultModules,
    removeRepoSamples: removeRepoSamples3x,
    removeShareSamples: removeShareSamples3x,
    sdkMajorVersion: sdkMajorVersion,
    sdkVersionPrefix: sdkVersionPrefix,
    setupNewRepoModule: setupNewRepoModule,
    setupNewShareModule: setupNewShareModule,
    targetFolderName: targetFolderName,
    usesEnhancedAlfrescoMavenPlugin: usesEnhancedAlfrescoMavenPlugin,
    beforeExit: undefined,
    repoConfigBase: 'src/main/resources',
    shareConfigBase: 'src/main/resources',
  },
  '2.2.0': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.2.0',
    promptForProjectPackage: true,
    providedCommunityVersion: '5.1.e',
    providedEnterpriseVersion: '5.1',
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    supportedRepositoryVersions: '5.1.d+ and 5.1+',
    useArchetypeTemplate: true,
    defaultModuleRegistry: defaultAmpModuleRegistry,
    defaultSourceModule: defaultSourceModule,
    registerDefaultModules: registerDefaultModules,
    removeDefaultModules: removeDefaultModules,
    removeRepoSamples: removeRepoSamples2x,
    removeShareSamples: removeShareSamples2x,
    sdkMajorVersion: sdkMajorVersion,
    sdkVersionPrefix: sdkVersionPrefix,
    setupNewRepoModule: setupNewRepoModule,
    setupNewShareModule: setupNewShareModule,
    targetFolderName: targetFolderName,
    usesEnhancedAlfrescoMavenPlugin: usesEnhancedAlfrescoMavenPlugin,
    beforeExit: beforeExit,
    repoConfigBase: 'src/main/amp/config',
    shareConfigBase: 'src/main/amp/config',
  },
  '2.1.1': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.1',
    promptForProjectPackage: true,
    providedCommunityVersion: '5.0.d',
    providedEnterpriseVersion: '5.0.1',
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.2.5',
    supportedRepositoryVersions: '5.0.d+ and 5.0.1+',
    useArchetypeTemplate: true,
    defaultModuleRegistry: defaultAmpModuleRegistry,
    defaultSourceModule: defaultSourceModule,
    registerDefaultModules: registerDefaultModules,
    removeDefaultModules: removeDefaultModules,
    removeRepoSamples: removeRepoSamples2x,
    removeShareSamples: removeShareSamples2x,
    sdkMajorVersion: sdkMajorVersion,
    sdkVersionPrefix: sdkVersionPrefix,
    setupNewRepoModule: setupNewRepoModule,
    setupNewShareModule: setupNewShareModule,
    targetFolderName: targetFolderName,
    usesEnhancedAlfrescoMavenPlugin: usesEnhancedAlfrescoMavenPlugin,
    beforeExit: undefined,
    repoConfigBase: 'src/main/amp/config',
    shareConfigBase: 'src/main/amp/config',
  },
  '2.1.0': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.1.0',
    promptForProjectPackage: true,
    providedCommunityVersion: '5.0.d',
    providedEnterpriseVersion: '5.0.1',
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    supportedRepositoryVersions: '5.0.d+ and 5.0.1+',
    useArchetypeTemplate: true,
    defaultModuleRegistry: defaultAmpModuleRegistry,
    defaultSourceModule: defaultSourceModule,
    registerDefaultModules: registerDefaultModules,
    removeDefaultModules: removeDefaultModules,
    removeRepoSamples: removeRepoSamples2x,
    removeShareSamples: removeShareSamples2x,
    sdkMajorVersion: sdkMajorVersion,
    sdkVersionPrefix: sdkVersionPrefix,
    setupNewRepoModule: setupNewRepoModule,
    setupNewShareModule: setupNewShareModule,
    targetFolderName: targetFolderName,
    usesEnhancedAlfrescoMavenPlugin: usesEnhancedAlfrescoMavenPlugin,
    beforeExit: undefined,
    repoConfigBase: 'src/main/amp/config',
    shareConfigBase: 'src/main/amp/config',
  },
  '2.0.0': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.0.0',
    promptForProjectPackage: false,
    providedCommunityVersion: '5.0.c',
    providedEnterpriseVersion: '5.0',
    supportedJavaVersions: '^1.7.0',
    supportedMavenVersions: '^3.0.5',
    supportedRepositoryVersions: '5.0.c and 5.0',
    useArchetypeTemplate: true,
    defaultModuleRegistry: defaultAmpModuleRegistry,
    defaultSourceModule: defaultSourceModule,
    registerDefaultModules: registerDefaultModules,
    removeDefaultModules: removeDefaultModules,
    sdkMajorVersion: sdkMajorVersion,
    sdkVersionPrefix: sdkVersionPrefix,
    setupNewRepoModule: setupNewRepoModule,
    setupNewShareModule: setupNewShareModule,
    targetFolderName: targetFolderName,
    usesEnhancedAlfrescoMavenPlugin: usesEnhancedAlfrescoMavenPlugin,
    beforeExit: undefined,
    repoConfigBase: 'src/main/amp/config',
    shareConfigBase: 'src/main/amp/config',
  },
  'local': {
    archetypeGroupId: 'org.alfresco.maven.archetype',
    archetypeArtifactId: 'alfresco-allinone-archetype',
    archetypeVersion: '2.2.0-SNAPSHOT',
    archetypeCatalog: 'local',
    promptForArchetypeVersion: true,
    promptForProjectPackage: true,
    providedCommunityVersion: '?',
    providedEnterpriseVersion: '?',
    supportedJavaVersions: '^1.8.0',
    supportedMavenVersions: '^3.2.5',
    supportedRepositoryVersions: 'Use local Alfresco SDK clone',
    useArchetypeTemplate: false,
    defaultModuleRegistry: defaultAmpModuleRegistry,
    defaultSourceModule: defaultSourceModule,
    registerDefaultModules: registerDefaultModules,
    removeDefaultModules: removeDefaultModules,
    sdkMajorVersion: sdkMajorVersion,
    sdkVersionPrefix: sdkVersionPrefix,
    setupNewRepoModule: setupNewRepoModule,
    setupNewShareModule: setupNewShareModule,
    targetFolderName: targetFolderName,
    usesEnhancedAlfrescoMavenPlugin: usesEnhancedAlfrescoMavenPlugin,
    beforeExit: undefined,
    repoConfigBase: 'src/main/amp/config',
    shareConfigBase: 'src/main/amp/config',
  },
};

// ===== Shared scripts =====

/**
 * Looks at the SDK archetype version used to create the project or if
 * that is not found, looks in the current SDK context and extracts the
 * version number.
 *
 * @returns {number} the archetype version being used or undefined
 */
function _findArchetypeVersion () {
  let archetypeVersion = this.config.get(constants.PROP_ARCHETYPE_VERSION);
  if (archetypeVersion) {
    debug('archetypeVersion from config: %s', archetypeVersion);
  } else {
    archetypeVersion = this.sdk.archetypeVersion;
    debug('archetypeVersion from execution context: %s', archetypeVersion);
  }
  return archetypeVersion;
}

/**
 * Extract the major version number from the provided version string. If
 * no version parameter is provided then attempts to look in the project
 * config or the current SDK context.
 *
 * @param {string} [version] optional version number to process
 * @returns {number} major version number from SDK
 * @throws {TypeError}
 */
function sdkMajorVersion (version) {
  const archetypeVersion = version || _findArchetypeVersion.call(this);
  if (archetypeVersion) {
    const majorVersion = semver.major(archetypeVersion);
    return majorVersion;
  }
  throw TypeError('Unable to locate SDK version to evaluate.');
}

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

/*
 * When a project is created from an archetype there
 * may be source amps/jars provided by the archetype.
 * These functions produce module registry entries that
 * represent these OOTB source modules.
 */

/**
 * All SDK versions prior to 3.0 work with amps and not
 * jar modules.
 *
 * @returns {*[]} The module registry that represents
 *   what is provided when the archetype has stamped
 *   a project out.
 */
function defaultAmpModuleRegistry () {
  const prefix = sdkVersionPrefix.call(this);
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
 * SDK 3.0 and above work with jar packaging. Although
 * it is possible to also configure that an amp be created
 * via the assembly plugin and an included config file.
 *
 * @returns {*[]} The module registry that represents
 *   what is provided when the archetype has stamped
 *   a project out.
 */
function defaultJarModuleRegistry () {
  const prefix = sdkVersionPrefix.call(this);
  return [
    {
      'groupId': '${project.groupId}',
      'artifactId': prefix + 'platform-jar',
      'version': '${project.version}',
      'packaging': 'jar',
      'war': constants.WAR_TYPE_REPO,
      'location': 'source',
      'path': prefix + 'platform-jar',
    },
    {
      'groupId': '${project.groupId}',
      'artifactId': prefix + 'share-jar',
      'version': '${project.version}',
      'packaging': 'jar',
      'war': constants.WAR_TYPE_SHARE,
      'location': 'source',
      'path': prefix + 'share-jar',
    },
  ];
}

/**
 * Returns the default source module for a given SDK
 * version and warType. If not found then returns
 * undefined.
 *
 * @param warType
 */
function defaultSourceModule (warType) {
  debug(`Searching for default ${warType} module definition`);
  if (this.sdk.defaultModuleRegistry) {
    const defaultModules = this.sdk.defaultModuleRegistry.call(this).filter(mod => {
      return (mod.location === 'source' && mod.war === warType);
    });
    if (defaultModules && defaultModules.length === 1) {
      return defaultModules[0];
    }
  }
  debug('defaultSourceModule() finished');
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
    const defaultModules = this.sdk.defaultModuleRegistry.call(this);
    if (defaultModules && defaultModules.length > 0) {
      defaultModules.forEach(mod => {
        this.moduleManager.addModule(mod);
      });
      this.moduleManager.save();
    }
  }
  debug('registerDefaultModules() finished');
}

/*
 * When a repo/platform source module is created, we apply some
 * customizations to what is provided by the original archetype.
 */

/**
 * For example we add the generated context folder and an
 * include for the same.
 *
 * @param pathPrefix
 */
function setupNewRepoModule (pathPrefix) {
  this.out.info('Setting up new repository module: ' + pathPrefix);
  const basename = path.basename(pathPrefix);

  const moduleContextPath = pathPrefix + '/' + this.sdk.repoConfigBase + '/alfresco/module/' + basename + '/module-context.xml';
  const importPath = 'classpath:alfresco/module/${project.artifactId}/context/generated/*-context.xml';
  debug('Editing: %s', this.destinationPath(moduleContextPath));
  // debug(memFsUtils.dumpFileNames(this.fs));
  const contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
  // debug(contextDocOrig);
  const context = require('generator-alfresco-common').spring_context(contextDocOrig);
  if (!context.hasImport(importPath)) {
    context.addImport(importPath);
    const contextDocNew = context.getContextString();
    debug('Writing: %s', this.destinationPath(moduleContextPath));
    // debug(contextDocNew);
    this.fs.write(this.destinationPath(moduleContextPath), contextDocNew);
  }

  // TODO(bwavell): Consider updating spring-context.js module to handle this
  const serviceContextPath = pathPrefix + '/' + this.sdk.repoConfigBase + '/alfresco/module/' + basename + '/context/service-context.xml';
  debug('Looking for moduleId property in %s', serviceContextPath);
  const serviceContextDocOrig = this.fs.read(this.destinationPath(serviceContextPath));
  const doc = domutils.parseFromString(serviceContextDocOrig);
  let moduleIdProp = domutils.getFirstNodeMatchingXPath('//property[@name="moduleId"]', doc);
  // SDK3 includes schema info that SDK2 did not include
  if (!moduleIdProp) {
    moduleIdProp = domutils.getFirstNodeMatchingXPath('//beans:property[@name="moduleId"]', doc);
  }
  if (moduleIdProp) {
    const valueAttr = moduleIdProp.getAttribute('value');
    if (valueAttr) {
      debug('Setting value of moduleId property in: %s to %s', serviceContextPath, constants.VAR_PROJECT_ARTIFACTID);
      moduleIdProp.setAttribute('value', constants.VAR_PROJECT_ARTIFACTID);
      const serviceContextDocNew = domutils.prettyPrint(doc);
      this.fs.write(serviceContextPath, serviceContextDocNew);
    } else {
      debug('Could not find @value to update for moduleId');
    }
  } else {
    debug('Failed to find a moduleId property to update');
  }

  const templatePath = path.resolve(this.sourceRoot(), '../../app/templates/generated-README.md');
  const generatedReadmePath = pathPrefix + '/' + this.sdk.repoConfigBase + '/alfresco/module/' + basename + '/context/generated/README.md';
  debug('Adding: %s', generatedReadmePath);
  this.fs.copyTpl(
    templatePath,
    this.destinationPath(generatedReadmePath)
  );
  debug('setupNewRepoModule() finished');
}

/*
 * When a share source module is created, we apply some customizations
 * to what is provided by the original archetype.
 */

/**
 * @param pathPrefix
 */
function setupNewShareModule (pathPrefix) {
  this.out.info('Setting up new share amp: ' + pathPrefix);
  const basename = path.basename(pathPrefix);

  const defaultModule = this.sdk.defaultSourceModule.call(this, constants.WAR_TYPE_SHARE);
  if (defaultModule) {
    const webExtensionPath = this.destinationPath(`${pathPrefix}/${this.sdk.shareConfigBase}/alfresco/web-extension`);
    const appContextName = `${defaultModule.artifactId}-slingshot-application-context.xml`;
    const appContextPath = path.join(webExtensionPath, appContextName);
    debug('Looking for resources bean in %s', appContextPath);
    if (memFsUtils.existsInMemory(this.fs, appContextPath) || fs.existsSync(appContextPath)) {
      const appContextDocOrig = this.fs.read(appContextPath);
      const doc = domutils.parseFromString(appContextDocOrig);
      let bean = domutils.getFirstNodeMatchingXPath(`//bean[@id="org.alfresco.${defaultModule.artifactId}.resources"]`, doc);
      // SDK3 includes schema info that SDK2 did not include
      if (!bean) {
        bean = domutils.getFirstNodeMatchingXPath(`//beans:bean[@id="org.alfresco.${defaultModule.artifactId}.resources"]`, doc);
      }
      if (bean) {
        let value = domutils.getFirstNodeMatchingXPath(`property[@name="resourceBundles"]/list/value`, bean);
        // SDK3 includes schema info that SDK2 did not include
        if (!value) {
          value = domutils.getFirstNodeMatchingXPath(`beans:property[@name="resourceBundles"]/beans:list/beans:value`, bean);
        }
        if (value) {
          bean.setAttribute('id', 'org.alfresco.${project.artifactId}.resources');
          value.textContent = 'alfresco.web-extension.messages.${project.artifactId}';
          const appContextDocNew = domutils.prettyPrint(doc);
          this.fs.write(appContextPath, appContextDocNew);
        } else {
          debug('Failed to find value element');
        }
      } else {
        debug('Failed to find resources bean element');
      }

      // Rename files with artifactId in their name
      [
        path.join(webExtensionPath, appContextName),
        path.join(webExtensionPath, 'messages', `${defaultModule.artifactId}.properties`),
        path.join(webExtensionPath, 'site-data', 'extensions', `${defaultModule.artifactId}-example-widgets.xml`),
      ].forEach((file) => {
        if (memFsUtils.existsInMemory(this.fs, file) || fs.existsSync(file)) {
          const dir = path.dirname(file);
          const base = path.basename(file);
          const baseNew = base.replace(new RegExp(`^${defaultModule.artifactId}`), basename);
          if (baseNew !== base) {
            const fileNew = path.join(dir, baseNew);
            debug('RENAME FROM %s TO %s', file, fileNew);
            this.fs.move(file, fileNew);
          }
        } else {
          debug('Could not find %s, so not attempting to rename it', file);
        }
      });
    } else {
      debug('Did not find %s', appContextPath);
    }
  }
  debug('setupNewShareAmp() finished');
}

function removeDefaultModules () {
  this.out.info('Removing default source modules');
  if (this.sdk.defaultModuleRegistry) {
    const defaultModules = this.sdk.defaultModuleRegistry.call(this);
    if (defaultModules && defaultModules.length > 0) {
      defaultModules.forEach(mod => {
        this.moduleManager.removeModule(mod);
      });
      this.moduleManager.save();
    }
  }
  debug('removeDefaultModules() finished');
}

function removeRepoSamples3x (pathPrefix, projectPackage, artifactIdPrefix) {
  this.out.info('Removing repository sample code/config: ' + pathPrefix + ':' + projectPackage + ':' + artifactIdPrefix);
  const basename = (artifactIdPrefix ? path.basename(pathPrefix) : pathPrefix);
  const projectPackagePath = projectPackage.replace(/\./g, '/');
  [
    `${pathPrefix}/src/main/java/${projectPackagePath}/platformsample/Demo.java`,
    `${pathPrefix}/src/main/java/${projectPackagePath}/platformsample/DemoComponent.java`,
    `${pathPrefix}/src/main/java/${projectPackagePath}/platformsample/HelloWorldWebScript.java`,
    `${pathPrefix}/src/main/java/${projectPackagePath}/platformsample`,
    `${pathPrefix}/src/main/resources/alfresco/extension/templates/webscripts/alfresco/tutorials/helloworld.get.desc.xml`,
    `${pathPrefix}/src/main/resources/alfresco/extension/templates/webscripts/alfresco/tutorials/helloworld.get.html.ftl`,
    `${pathPrefix}/src/main/resources/alfresco/extension/templates/webscripts/alfresco/tutorials/helloworld.get.js`,
    `${pathPrefix}/src/main/resources/alfresco/extension/templates/webscripts/alfresco/tutorials`,
    `${pathPrefix}/src/main/resources/alfresco/extension/templates/webscripts/alfresco`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/context/bootstrap-context.xml`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/context/service-context.xml`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/context/webscript-context.xml`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/messages/content-model.properties`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/model/content-model.xml`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/model/workflow-model.xml`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/workflow/sample-process.bpmn20.xml`,
    `${pathPrefix}/src/main/resources/META-INF/resources/test.html`,
    `${pathPrefix}/src/test/java/${projectPackagePath}/platformsample/test/HelloWorldWebScriptControllerTest.java`,
    `${pathPrefix}/src/test/java/${projectPackagePath}/platformsample`,
  ].forEach(file => {
    this.out.info('Removing sample file: ' + file);
    this.fs.delete(file, {globOptions: {strict: true}});
  });

  [
    `${pathPrefix}/src/main/java/${projectPackagePath}/EMPTY.txt`,
    `${pathPrefix}/src/main/resources/alfresco/extension/templates/webscripts/EMPTY.txt`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/messages/EMPTY.txt`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/model/EMPTY.txt`,
    `${pathPrefix}/src/main/resources/alfresco/module/${basename}/workflow/EMPTY.txt`,
    `${pathPrefix}/src/test/java/${projectPackagePath}/EMPTY.txt`,
  ].forEach(empty => {
    this.out.info('Creating empty file to protect important module folder: ' + empty);
    this.fs.write(empty, '<EMPTY/>\n');
  });

  const moduleContextPath = `${pathPrefix}/src/main/resources/alfresco/module/${basename}/module-context.xml`;
  const contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
  const context = require('generator-alfresco-common').spring_context(contextDocOrig);
  [
    'classpath:alfresco/module/${project.artifactId}/context/bootstrap-context.xml',
    'classpath:alfresco/module/${project.artifactId}/context/service-context.xml',
    'classpath:alfresco/module/${project.artifactId}/context/webscript-context.xml',
  ].forEach(resource => {
    this.out.info('Removing import from module-context.xml: ' + resource);
    context.removeImport(resource);
  });
  const contextDocNew = context.getContextString();
  this.fs.write(moduleContextPath, contextDocNew);
  debug('removeRepoSamples3x() finished');
}

function removeShareSamples3x (pathPrefix, projectPackage, artifactIdPrefix) {
  this.out.info(`Removing share sample code/config>${pathPrefix}:${projectPackage}:${artifactIdPrefix}`);
  const basename = (artifactIdPrefix ? path.basename(pathPrefix) : pathPrefix);
  [
    `${pathPrefix}/src/main/resources/alfresco/web-extension/messages/${basename}.properties`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-data/extensions/${basename}-example-widgets.xml`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.desc.xml`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.html.ftl`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-webscripts/com/example/pages/simple-page.get.js`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-webscripts/com/example/pages`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-webscripts/com/example`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-webscripts/com`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js/tutorials/widgets/css/TemplateWidget.css`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js/tutorials/widgets/i18n/TemplateWidget.properties`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js/tutorials/widgets/templates/TemplateWidget.html`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js/tutorials/widgets/TemplateWidget.js`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js/tutorials/widgets`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js/tutorials`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/js`,
  ].forEach(file => {
    this.out.info('Removing share module sample file created by maven archetype: ' + file);
    this.fs.delete(file, {globOptions: {strict: true}});
  });

  [
    `${pathPrefix}/src/main/resources/alfresco/web-extension/messages/EMPTY.txt`,
    `${pathPrefix}/src/main/resources/alfresco/web-extension/site-data/extensions/EMPTY.txt`,
    `${pathPrefix}/src/main/resources/META-INF/resources/${basename}/EMPTY.txt`,
  ].forEach(empty => {
    this.out.info('Creating empty file to protect important share module folder: ' + empty);
    this.fs.write(empty, '<EMPTY/>\n');
  });

  let slingshotContextFile = 'custom-slingshot-application-context.xml';
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '>=2.1.1')) {
      slingshotContextFile = `${basename}-slingshot-application-context.xml`;
    }
  }
  [
    pathPrefix + '/src/main/resources/alfresco/web-extension/' + slingshotContextFile,
  ].forEach(file => {
    const destinationFile = this.destinationPath(file);
    if (memFsUtils.existsInMemory(this.fs, destinationFile) || fs.existsSync(file)) {
      this.out.info('Renaming share module context file to *.sample: ' + file);
      this.fs.move(destinationFile, destinationFile + '.sample');
    } else {
      debug('Unable to locate ' + file + ' in order to rename with .sample');
    }
  });
  debug('removeShareSamples3x() finished');
}

function removeRepoSamples2x (pathPrefix, projectPackage, artifactIdPrefix) {
  this.out.info('Removing repository sample code/config');
  const prefix = (artifactIdPrefix ? artifactIdPrefix + '-' : sdkVersionPrefix.call(this));
  const projectPackagePath = projectPackage.replace(/\./g, '/');
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

  const moduleContextPath = pathPrefix + '/src/main/amp/config/alfresco/module/' + prefix + 'repo-amp/module-context.xml';
  const contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
  const context = require('generator-alfresco-common').spring_context(contextDocOrig);
  [
    'classpath:alfresco/module/${project.artifactId}/context/service-context.xml',
    'classpath:alfresco/module/${project.artifactId}/context/bootstrap-context.xml',
    'classpath:alfresco/module/${project.artifactId}/context/webscript-context.xml',
  ].forEach(resource => {
    this.out.info('Removing import from repo-amp module-context.xml: ' + resource);
    context.removeImport(resource);
  });
  const contextDocNew = context.getContextString();
  this.fs.write(moduleContextPath, contextDocNew);
  debug('removeRepoSamples2x() finished');
}

function removeShareSamples2x (pathPrefix, projectPackage, artifactIdPrefix) {
  this.out.info(`Removing share sample code/config>${pathPrefix}:${projectPackage}:${artifactIdPrefix}`);
  const prefix = (artifactIdPrefix ? artifactIdPrefix + '-' : sdkVersionPrefix.call(this));
  const projectPackagePath = projectPackage.replace(/\./g, '/');
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
      const versionPrefix = sdkVersionPrefix.call(this);
      slingshotContextFile = versionPrefix + 'share-amp-slingshot-application-context.xml';
    }
  }
  [
    pathPrefix + '/src/main/amp/config/alfresco/web-extension/' + slingshotContextFile,
  ].forEach(file => {
    const destinationFile = this.destinationPath(file);
    if (memFsUtils.existsInMemory(this.fs, destinationFile) || fs.existsSync(file)) {
      this.out.info('Renaming share-amp file to *.sample: ' + file);
      this.fs.move(destinationFile, destinationFile + '.sample');
    } else {
      debug('Unable to locate ' + file + ' in order to rename with .sample');
    }
  });
  debug('removeShareSamples2x() finished');
}

/*
 * Alfresco SDK 3.0 added a much improved Alfresco Maven Plugin.
 * This is able to replace the runner module and the war wrapper
 * modules.
 */

/**
 * Determines if the provided version uses the enhanced
 * alfresco-maven-plugin that was introduced with SDK 3.0. If no
 * version parameter is provided then attempts to look in the project
 * config or the current SDK context for the version before considering
 * if the enhanced plugin is applicable.
 *
 * @param {string} [version] optional version number to process
 * @returns {boolean} true if new plugin is used, otherwise false
 * @throws {TypeError}
 */
function usesEnhancedAlfrescoMavenPlugin (version) {
  const archetypeVersion = version || _findArchetypeVersion.call(this);
  if (archetypeVersion) {
    if (semver.satisfies(semver.clean(archetypeVersion), '>=3.0.0-SNAPSHOT')) {
      return true;
    }
    return false;
  }
  throw TypeError('Unable to locate SDK version to evaluate.');
}

/*
 * Once archetype generation has been completed and everything is
 * written out to the filesystem, we may want to perform some additional
 * tasks.
 */

/**
 * For SDK >= 2.2.0 and < 3.0.0 we make run.sh print a warning that
 * spring-loaded is no longer supported and run-without-springloaded.sh
 * should be used instead.
 */
function beforeExit () {
  if (this.config.get(constants.PROP_ARCHETYPE_VERSION)) {
    if (semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '>=2.2.0-SNAPSHOT')
      && semver.satisfies(semver.clean(this.config.get(constants.PROP_ARCHETYPE_VERSION)), '<3.0.0-SNAPSHOT')) {
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
