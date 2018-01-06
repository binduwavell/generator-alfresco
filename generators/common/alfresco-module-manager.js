'use strict';
const debug = require('debug')('generator-alfresco:alfresco-module-manager');
const path = require('path');
const constants = require('generator-alfresco-common').constants;
const domutils = require('generator-alfresco-common').xml_dom_utils;
const memFsUtils = require('generator-alfresco-common').mem_fs_utils;
const slash = require('slash');

/**
 * This module is in essence a wrapper around the alfresco-module-registry
 * it provides similar methods for adding and removing modules, it uses
 * the registry to figure out if a change is valid and to keep track of a
 * change having occurred. It also interacts with the current project to
 * add/remove files and even update references in poms/context-files, etc.
 */

function MakeAlfrescoModuleManager (yo) {
  class AlfrescoModuleManager {
    constructor () {
      this.moduleRegistry = yo.moduleRegistry || require('generator-alfresco-common').alfresco_module_registry(yo);
      this.ops = [];
    }

    addModule (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
      debug('attempting to addModule: %s %s %s %s %s %s %s', modOrGroupId, artifactId, ver, packaging, war, loc, path);
      let mod = this.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
      debug('Existing module: ' + JSON.stringify(mod));
      if (!mod) {
        mod = this.moduleRegistry.normalizeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
        debug('normalized result: %j', mod);
      }
      yo.out.info('Adding ' + mod.artifactId + ' module to module registry');
      this.moduleRegistry.addModule(mod);

      // Stuff we only need to do for source amps
      if (mod.location === constants.LOCATION_SOURCE) {
        debug('Scheduling ops for ' + mod.artifactId + ' source module.');
        this.ops.push(() => { copyTemplateForModule(mod) });
        this.ops.push(() => { renamePathElementsForModule(mod) });
        this.ops.push(() => { addModuleToParentPom(mod) });
        // SDK2 must configure tomcat context manually and configure failsafe for share source modules
        if (yo.sdkMajorVersion === 2) {
          this.ops.push(() => { addModuleToTomcatContext(mod) });
          if (mod.war === constants.WAR_TYPE_SHARE) {
            this.ops.push(() => { addFailsafeConfigToRunner(mod) });
          }
        }
        // SDK3 has a "packaged" hierarchy for share under META-INF/resources
        if (yo.sdkMajorVersion === 3) {
          this.ops.push(() => { renamePathElementsForResources(mod) });
          if (mod.war === constants.WAR_TYPE_REPO) {
            this.ops.push(() => { addToIntegrationTestModule(mod) });
          }
        }
        this.ops.push(() => { updateProjectPom(mod) });
      }

      if (yo.usingEnhancedAlfrescoMavenPlugin) {
        this.ops.push(() => { addModuleToAlfrescoMavenPlugin(mod) });
      } else {
        this.ops.push(() => { addModuleToWarWrapper(mod) });
      }
      debug('addModule() finished');
    }

    removeModule (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
      debug('removeModule() - start by searching for module: %s', modOrGroupId.artifactId);
      const mod = this.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
      debug('removeModule() - using module: %s', mod.artifactId);
      if (mod) {
        debug('removing module: %s', mod.artifactId);
        this.moduleRegistry.removeModule(mod);
        if (mod.location === 'source') {
          this.ops.push(() => { removeModuleFiles(mod) });
          this.ops.push(() => { removeModuleFromParentPom(mod) });
          if (yo.usingEnhancedAlfrescoMavenPlugin) {
            this.ops.push(() => { removeModuleFromAlfrescoMavenPlugin(mod) });
          } else {
            this.ops.push(() => { removeModuleFromWarWrapper(mod) });
            if (mod.war === constants.WAR_TYPE_SHARE) {
              this.ops.push(() => { removeFailsafeConfigFromRunner(mod) });
            }
            this.ops.push(() => { removeModuleFromTomcatContext(mod) });
          }
          if (yo.sdkMajorVersion === 3 && mod.war === constants.WAR_TYPE_REPO) {
            this.ops.push(() => { removeFromIntegrationTestModule(mod) });
          }
        }
      }
      debug('removeModule() finished');
    }

    pushOp (fn) {
      this.ops.push(fn);
    }

    save () {
      debug('saving module registry and performing scheduled tasks');
      this.moduleRegistry.save();
      this.ops.forEach(op => {
        op.call(this);
      });
      this.ops = [];
      debug('save() finished');
    }
  };

  function copyTemplateForModule (mod) {
    debug('copyTemplateForModule()');
    const toPath = yo.destinationPath(mod.path);
    debug('Copy destination: ' + toPath);
    if (!yo.fs.exists(toPath)) {
      const prefix = yo.sdk.sdkVersionPrefix.call(yo);
      yo.config.get('artifactId');
      let modType = mod.war;
      // Alfresco SDK 3.0 and up use the word platform instead of repo in source module names
      if (yo.usingEnhancedAlfrescoMavenPlugin && modType === constants.WAR_TYPE_REPO) {
        modType = 'platform';
      }
      const fromPath = yo.destinationPath(constants.FOLDER_SOURCE_TEMPLATES + '/' + prefix + modType + '-' + mod.packaging);
      yo.out.info('Copying template for ' + mod.artifactId + ' module ' + fromPath + ' to ' + toPath);
      if (memFsUtils.existsInMemory(yo.fs, fromPath)) {
        debug('IN-MEMORY COPY: ' + fromPath + ' to: ' + toPath);
        memFsUtils.inMemoryCopy(yo.fs, fromPath, toPath);
      } else {
        debug('PHYSICAL COPY: ' + fromPath + '/** to: ' + toPath);
        yo.fs.copy(path.join(fromPath, '/**'), toPath);
      }
    } else {
      yo.out.warn('Not copying module as target path already exists: ' + toPath);
    }
    debug('copyTemplateForModule() finished');
  }

  function renamePathElementsForModule (mod) {
    debug('renamePathElementsForModule() - start by getting default repo module artifactId');

    if (mod.war === constants.WAR_TYPE_REPO) {
      const defaultMod = yo.sdk.defaultSourceModule.call(yo, constants.WAR_TYPE_REPO);
      if (defaultMod) {
        if (mod.artifactId !== defaultMod.artifactId) {
          const fromPath = path.join(
            yo.destinationPath(),
            mod.path,
            yo.sdk.repoConfigBase + '/alfresco/module',
            defaultMod.artifactId
          );
          const toPath = path.join(
            yo.destinationPath(),
            mod.path,
            yo.sdk.repoConfigBase + '/alfresco/module',
            mod.artifactId
          );
          yo.out.info('Renaming path elements from ' + fromPath + ' to ' + toPath);
          debug('MOVING FROM: ' + fromPath + ' to: ' + toPath);
          if (memFsUtils.existsInMemory(yo.fs, fromPath)) {
            debug('IN-MEMORY MOVE: ' + fromPath + ' to: ' + toPath);
            memFsUtils.inMemoryMove(yo.fs, fromPath, toPath);
          } else {
            debug('PHYSICAL MOVE: ' + fromPath + '/** to: ' + toPath);
            yo.fs.move(fromPath + '/**', toPath);
          }
        }
      }
    }
    if (mod.war === constants.WAR_TYPE_SHARE) {
      const defaultMod = yo.sdk.defaultSourceModule.call(yo, constants.WAR_TYPE_SHARE);
      if (defaultMod) {
        if (mod.artifactId !== defaultMod.artifactId) {
          const fromPath = path.join(
            yo.destinationPath(),
            mod.path,
            yo.sdk.shareConfigBase + '/alfresco/module',
            defaultMod.artifactId
          );
          if (memFsUtils.existsInMemory(yo.fs, fromPath) || yo.fs.exists(fromPath)) {
            const toPath = path.join(
              yo.destinationPath(),
              mod.path,
              yo.sdk.shareConfigBase + '/alfresco/module',
              mod.artifactId
            );
            yo.out.info('Renaming path elements from ' + fromPath + ' to ' + toPath);
            debug('MOVING FROM: ' + fromPath + ' to: ' + toPath);
            if (memFsUtils.existsInMemory(yo.fs, fromPath)) {
              debug('IN-MEMORY MOVE: ' + fromPath + ' to: ' + toPath);
              memFsUtils.inMemoryMove(yo.fs, fromPath, toPath);
            } else {
              debug('PHYSICAL MOVE: ' + fromPath + '/** to: ' + toPath);
              yo.fs.move(fromPath + '/**', toPath);
            }
          }
        }
      }
    }

    debug('renamePathElementsForModule() finished');
  }

  function renamePathElementsForResources (mod) {
    debug('renamePathElementsForResources() - start by getting default repo module artifactId');

    if (mod.war === constants.WAR_TYPE_SHARE) {
      const defaultMod = yo.sdk.defaultSourceModule.call(yo, constants.WAR_TYPE_SHARE);
      if (defaultMod) {
        if (mod.artifactId !== defaultMod.artifactId) {
          const fromPath = path.join(
            yo.destinationPath(),
            mod.path,
            yo.sdk.shareConfigBase + '/META-INF/resources',
            defaultMod.artifactId
          );
          if (memFsUtils.existsInMemory(yo.fs, fromPath) || yo.fs.exists(fromPath)) {
            const toPath = path.join(
              yo.destinationPath(),
              mod.path,
              yo.sdk.shareConfigBase + '/META-INF/resources',
              mod.artifactId
            );
            yo.out.info('Renaming path elements from ' + fromPath + ' to ' + toPath);
            debug('MOVING FROM: ' + fromPath + ' to: ' + toPath);
            if (memFsUtils.existsInMemory(yo.fs, fromPath)) {
              debug('IN-MEMORY MOVE: ' + fromPath + ' to: ' + toPath);
              memFsUtils.inMemoryMove(yo.fs, fromPath, toPath);
            } else {
              debug('PHYSICAL MOVE: ' + fromPath + '/** to: ' + toPath);
              yo.fs.move(fromPath + '/**', toPath);
            }
          }
        }
      }
    }

    debug('renamePathElementsForResources() finished');
  }

  // TODO(bwavell): Add tests for this
  function addToIntegrationTestModule (mod) {
    debug('addToIntegrationTestModule() - Adding %s to integration-tests/pom.xml', mod.artifactId);
    const itPomPath = yo.destinationPath('integration-tests/pom.xml');
    const itPom = yo.fs.read(itPomPath);
    const pom = require('generator-alfresco-common').maven_pom(itPom);
    const g = mod.groupId;
    const a = mod.artifactId;
    const v = mod.version;
    debug('Looking for existing dependency %s:%s:%s', g, a, v);
    if (!pom.findDependency(g, a, v, undefined, 'test')) {
      debug('It was not found, so we will add it');
      pom.addDependency(g, a, v, undefined, 'test');
      yo.fs.write(itPomPath, pom.getPOMString());
    }
    debug('addToIntegrationTestModule() finished');
  }

  function addFailsafeConfigToRunner (mod) {
    const runnerPomPath = yo.destinationPath('runner/pom.xml');
    yo.out.info('Configuring failsafe entries for ' + mod.artifactId + ' in ' + runnerPomPath);
    const runnerPom = yo.fs.read(runnerPomPath);
    const pomDoc = domutils.parseFromString(runnerPom);
    const plugin = domutils.getFirstNodeMatchingXPath('/pom:project/pom:profiles/pom:profile[pom:id="functional-testing"]/pom:build/pom:plugins/pom:plugin[1]', pomDoc);
    if (plugin) {
      const pluginExs = domutils.getFirstNodeMatchingXPath('pom:executions', plugin);
      if (pluginExs) {
        // if we have generic config we should remove it
        const pluginConfig = domutils.getFirstNodeMatchingXPath('pom:configuration', plugin);
        if (pluginConfig) {
          domutils.removeChild(pluginConfig, 'pom', 'suiteXmlFiles');
          domutils.removeChild(pluginConfig, 'pom', 'testClassesDirectory');
        }
        // if we have the generic executions we should remove them
        const ft = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="functional-tests"]', pluginExs);
        if (ft) {
          domutils.removeParentsChild(pluginExs, ft);
        }
        const vt = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="verify-tests"]', pluginExs);
        if (vt) {
          domutils.removeParentsChild(pluginExs, vt);
        }
        // now add module specific instances
        const ftx = [
          '<execution>',
          '    <id>functional-tests-' + mod.artifactId + '</id>',
          '    <phase>integration-test</phase>',
          '    <goals>',
          '      <goal>integration-test</goal>',
          '    </goals>',
          '    <configuration>',
          '        <suiteXmlFiles>',
          '            <suiteXmlFile>${project.parent.basedir}/' + mod.path + '/target/test-classes/testng.xml</suiteXmlFile>',
          '        </suiteXmlFiles>',
          '        <testClassesDirectory>${project.parent.basedir}/' + mod.path + '/target/test-classes</testClassesDirectory>',
          '    </configuration>',
          '</execution>',
        ].join('\n');
        const ftdoc = domutils.parseFromString(ftx);
        const ftn = pomDoc.importNode(ftdoc.documentElement, true);
        pluginExs.appendChild(ftn);
        const vtx = [
          '<execution>',
          '    <id>verify-tests-' + mod.artifactId + '</id>',
          '    <phase>verify</phase>',
          '    <goals>',
          '        <goal>verify</goal>',
          '    </goals>',
          '    <configuration>',
          '        <suiteXmlFiles>',
          '            <suiteXmlFile>${project.parent.basedir}/' + mod.path + '/target/test-classes/testng.xml</suiteXmlFile>',
          '        </suiteXmlFiles>',
          '        <testClassesDirectory>${project.parent.basedir}/' + mod.path + '/target/test-classes</testClassesDirectory>',
          '    </configuration>',
          '</execution>',
        ].join('\n');
        const vtdoc = domutils.parseFromString(vtx);
        const vtn = pomDoc.importNode(vtdoc.documentElement, true);
        pluginExs.appendChild(vtn);
        yo.fs.write(runnerPomPath, domutils.prettyPrint(pomDoc));
      }
    }
    debug('addFailsafeConfigToRunner() finished');
  }

  function addModuleToParentPom (mod) {
    // TODO: if intermediate source modules are not included, include them too (customizations for example.)
    const parentPomPath = yo.destinationPath(path.join(path.dirname(mod.path), 'pom.xml'));
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + parentPomPath);
    const parentPom = yo.fs.read(parentPomPath);
    const pom = require('generator-alfresco-common').maven_pom(parentPom);
    if (!pom.findModule(mod.artifactId)) {
      pom.addModule(mod.artifactId, true);
      yo.fs.write(parentPomPath, pom.getPOMString());
    }
    debug('addModuleToParentPom() finished');
  }

  // TODO(bwavell): Add tests for this
  function addModuleToTomcatContext (mod) {
    yo.out.info('Adding path elements for ' + mod.artifactId + ' tomcat context file');
    const warType = mod.war;
    const modPath = slash(mod.path);
    const basename = path.basename(modPath);
    if ([constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE].indexOf(warType) > -1) {
      let fileName = constants.FILE_CONTEXT_REPO_XML;
      if (constants.WAR_TYPE_SHARE === warType) {
        fileName = constants.FILE_CONTEXT_SHARE_XML;
      }
      const ctxPath = yo.destinationPath(path.join(constants.FOLDER_RUNNER, constants.FOLDER_TOMCAT, fileName));
      if (yo.fs.exists(ctxPath)) {
        const ctxFile = yo.fs.read(ctxPath);
        const ctx = require('generator-alfresco-common').tomcat_context(ctxFile);
        const targetFolder = yo.sdk.targetFolderName.call(yo, basename);

        ctx.addExtraResourcePathMap('/=${project.parent.basedir}/' + modPath + '/target/' + targetFolder + '/web');
        ctx.addVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/classes');
        ctx.addVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/' + targetFolder + '/config');
        ctx.addVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/test-classes');
        // Special weirdness for share, we want this at the end of the list
        if (constants.WAR_TYPE_SHARE === warType) {
          ctx.removeVirtualClasspath('${project.parent.basedir}/share/target/test-classes');
          ctx.addVirtualClasspath('${project.parent.basedir}/share/target/test-classes');
        }

        yo.fs.write(ctxPath, ctx.getContextString());
      }
    }
    debug('addModuleToTomcatContext() finished');
  }

  function updateProjectPom (mod) {
    const projectPomPath = path.join(yo.destinationPath(), mod.path, 'pom.xml');
    yo.out.info('Setting project/parent GAVs for ' + mod.artifactId + ' in ' + projectPomPath);

    // Obtain GAV from parent
    const parentPomPath = yo.destinationPath(path.join(path.dirname(mod.path), 'pom.xml'));
    yo.out.info('Finding parent GAV info for ' + mod.artifactId + ' module from ' + parentPomPath);
    const parentPomStr = yo.fs.read(parentPomPath);
    const parentPom = require('generator-alfresco-common').maven_pom(parentPomStr);
    const parentGroupIdEl = parentPom.getTopLevelElement('pom', 'groupId');
    const parentArtifactIdEl = parentPom.getTopLevelElement('pom', 'artifactId');
    const parentVersionEl = parentPom.getTopLevelElement('pom', 'version');
    const parentGroupId = (parentGroupIdEl ? parentGroupIdEl.textContent : yo.projectGroupId || yo.config.get(constants.PROP_PROJECT_GROUP_ID));
    const parentArtifactId = (parentArtifactIdEl ? parentArtifactIdEl.textContent : yo.projectArtifactId || yo.config.get(constants.PROP_PROJECT_ARTIFACT_ID));
    const parentVersion = (parentVersionEl ? parentVersionEl.textContent : yo.projectVersion || yo.config.get(constants.PROP_PROJECT_VERSION));

    debug('POM EXISTS: ' + projectPomPath + ' [' + yo.fs.exists(projectPomPath) + ']');
    const projectPom = yo.fs.read(projectPomPath);
    debug('POM CONTENTS: ' + projectPom);
    const pom = require('generator-alfresco-common').maven_pom(projectPom);
    // Unless we are in the customizations folder we can use provided values with
    // inheritance magic for project.blah references. In the customizations folder
    // we have to be more explicit as that folder has fixed GAV.
    if (constants.FOLDER_CUSTOMIZATIONS !== path.basename(path.dirname(mod.path))) {
      pom.setProjectGAV(mod.groupId, mod.artifactId, mod.version, mod.packaging);
    } else {
      let groupId = mod.groupId;
      let version = mod.version;
      if (constants.VAR_PROJECT_GROUPID === groupId) {
        groupId = yo.config.get(constants.PROP_PROJECT_GROUP_ID);
      }
      if (constants.VAR_PROJECT_VERSION === version) {
        version = yo.config.get(constants.PROP_PROJECT_VERSION);
      }
      pom.setProjectGAV(groupId, mod.artifactId, version, mod.packaging);
    }
    pom.setParentGAV(parentGroupId, parentArtifactId, parentVersion);
    yo.fs.write(projectPomPath, pom.getPOMString());
    debug('updateProjectPom() finished');
  }

  function addModuleToAlfrescoMavenPlugin (mod) {
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + mod.war + ' alfresco-maven-plugin');

    const topPomPath = yo.destinationPath('pom.xml');
    const topPomStr = yo.fs.read(topPomPath);
    const topPom = require('generator-alfresco-common').maven_pom(topPomStr);

    if (mod.location === constants.LOCATION_LOCAL) {
      debug('Adding local ' + mod.artifactId + ' to maven-install-plugin');
      let installPlugin = topPom.findPlugin('org.apache.maven.plugins', 'maven-install-plugin');
      if (!installPlugin) {
        installPlugin = topPom.addPlugin('org.apache.maven.plugins', 'maven-install-plugin', '2.5.2');
        domutils.setOrClearChildText(installPlugin, 'pom', 'inherited', 'false');
      }
      const executions = domutils.getOrCreateChild(installPlugin, 'pom', 'executions');
      const id = 'install-' + mod.artifactId;
      const xp = `pom:execution[pom:id = '${id}']`;
      debug('Searching for execution with xpath: ' + xp);
      let execution = domutils.getFirstNodeMatchingXPath(xp, executions);
      if (!execution) {
        debug('execution not found, so creating it');
        execution = domutils.createChild(executions, 'pom', 'execution');
        domutils.setOrClearChildText(execution, 'pom', 'id', id);
      }
      domutils.setOrClearChildText(execution, 'pom', 'phase', 'clean');
      let configuration = domutils.getOrCreateChild(execution, 'pom', 'configuration');
      domutils.setOrClearChildText(configuration, 'pom', 'file', '${basedir}/' + mod.path);
      domutils.setOrClearChildText(configuration, 'pom', 'repositoryLayout', 'default');
      domutils.setOrClearChildText(configuration, 'pom', 'groupId', mod.groupId);
      domutils.setOrClearChildText(configuration, 'pom', 'artifactId', mod.artifactId);
      domutils.setOrClearChildText(configuration, 'pom', 'version', mod.version);
      domutils.setOrClearChildText(configuration, 'pom', 'packaging', mod.packaging);
      domutils.setOrClearChildText(configuration, 'pom', 'generatePom', 'true');
      let goals = domutils.getOrCreateChild(execution, 'pom', 'goals');
      domutils.setOrClearChildText(goals, 'pom', 'goal', 'install-file');
    }

    debug('Adding ' + mod.artifactId + ' to alfresco-maven-plugin');
    let alfrescoPlugin = topPom.findPlugin('org.alfresco.maven.plugin', 'alfresco-maven-plugin');
    const configuration = domutils.getOrCreateChild(alfrescoPlugin, 'pom', 'configuration');
    const modulesElement = (mod.war === constants.WAR_TYPE_REPO ? 'platformModules' : 'shareModules');
    debug(`Using ${modulesElement} for ${mod.war} module`);
    const modules = domutils.getOrCreateChild(configuration, 'pom', modulesElement);
    const xp = `pom:moduleDependency[pom:groupId = '${mod.groupId}' and pom:artifactId = '${mod.artifactId}']`;
    debug('Searching for moduleDependency with xpath: ' + xp);
    let moduleDependency = domutils.getFirstNodeMatchingXPath(xp, modules);
    if (moduleDependency) {
      debug(`Found moduleDependency for ${mod.groupId}:${mod.artifactId} in alfresco-maven-plugin`);
    } else {
      debug('moduleDependency not found, so creating it');
      moduleDependency = domutils.createChild(modules, 'pom', 'moduleDependency');
    }
    domutils.setOrClearChildText(moduleDependency, 'pom', 'groupId', mod.groupId);
    domutils.setOrClearChildText(moduleDependency, 'pom', 'artifactId', mod.artifactId);
    domutils.setOrClearChildText(moduleDependency, 'pom', 'version', mod.version);
    domutils.setOrClearChildText(moduleDependency, 'pom', 'type', mod.packaging);

    debug('Done adding ' + mod.artifactId + ' to pom.xml, saving changes');
    yo.fs.write(topPomPath, topPom.getPOMString());

    debug('addModuleToAlfrescoMavenPlugin() finished');
  }

  function addModuleToWarWrapper (mod) {
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + mod.war + ' war wrapper');
    const wrapperPomPath = yo.destinationPath(mod.war + '/pom.xml');
    const wrapperPom = yo.fs.read(wrapperPomPath);
    const pom = require('generator-alfresco-common').maven_pom(wrapperPom);
    if (!pom.findDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging)) {
      let scope;
      let systemPath;
      if (mod.location === 'local') {
        scope = 'system';
        systemPath = '${project.basedir}/../' + mod.path;
      }
      pom.addDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging, scope, systemPath);
    }

    // search existing plugins for maven-war-plugin, create if necessary
    // once found/created, make sure we have configuation/overlays
    const build = pom.getOrCreateTopLevelElement('pom', 'build');
    const plugins = domutils.getOrCreateChild(build, 'pom', 'plugins');
    let plugin = domutils.getOrCreateChild(plugins, 'pom', 'plugin');
    let artifactIdText = '';
    do {
      const artifactId = domutils.getOrCreateChild(plugin, 'pom', 'artifactId');
      artifactIdText = artifactId.textContent;
      if (artifactIdText) {
        if (artifactIdText !== 'maven-war-plugin') {
          plugin = domutils.getNextElementSibling(plugin);
          // exhausted existing plugins, so we need to add one
          if (undefined === plugin) {
            plugin = domutils.createChild(plugins, 'pom', 'plugin');
          }
        }
      } else {
        artifactIdText = 'maven-war-plugin';
        artifactId.textContent = artifactIdText;
      }
    } while (artifactIdText !== 'maven-war-plugin');
    const configuration = domutils.getOrCreateChild(plugin, 'pom', 'configuration');
    domutils.getOrCreateChild(configuration, 'pom', 'overlays');
    pom.addOverlay(mod.groupId, mod.artifactId, mod.packaging);
    debug(pom.getPOMString());
    yo.fs.write(wrapperPomPath, pom.getPOMString());
    debug('addModuleToWarWrapper() finished');
  }

  function removeModuleFiles (mod) {
    // remove the actual files
    yo.out.warn('Deleting source module: ' + mod.path);
    const absPath = yo.destinationPath(mod.path);
    // if we have files on disk already this will get them
    debug('DELETING EXISTING FILES FROM: ' + absPath);
    yo.fs.delete(absPath);
    // if we have files in mem-fs, this should get those
    yo.fs.store.each(file => {
      if (file.path.indexOf(absPath) === 0) {
        debug('DELETING: ' + file.path);
        yo.fs.delete(file.path);
      }
    });
    debug('removeModuleFiles() finished');
  }

  function removeModuleFromParentPom (mod) {
    // TODO(bwavell): support removing modules from sub-modules (like customizations)
    const parentPomPath = yo.destinationPath('pom.xml');
    yo.out.warn('Removing ' + mod.artifactId + ' module from ' + parentPomPath);
    const parentPom = yo.fs.read(parentPomPath);
    const pom = require('generator-alfresco-common').maven_pom(parentPom);
    if (pom.findModule(mod.artifactId)) {
      pom.removeModule(mod.artifactId);
      yo.fs.write(parentPomPath, pom.getPOMString());
    }
    debug('removeModuleFromParentPom() finished');
  }

  function removeModuleFromAlfrescoMavenPlugin (mod) {
    const topPomPath = yo.destinationPath('pom.xml');
    const topPomStr = yo.fs.read(topPomPath);
    const topPom = require('generator-alfresco-common').maven_pom(topPomStr);

    if (mod.location === constants.LOCATION_LOCAL) {
      debug('Removing local ' + mod.artifactId + ' from maven-install-plugin');
      const installPlugin = topPom.findPlugin('org.apache.maven.plugins', 'maven-install-plugin');
      if (installPlugin) {
        const executions = domutils.getChild(installPlugin, 'pom', 'executions');
        if (executions) {
          const id = 'install-' + mod.artifactId;
          const xp = `pom:execution[pom:id = '${id}']`;
          debug('Searching for execution with xpath: ' + xp);
          const execution = domutils.getFirstNodeMatchingXPath(xp, executions);
          if (execution) {
            debug('Found ' + mod.artifactId + ' in maven-install-plugin, removing it');
            domutils.removeParentsChild(executions, execution);
          }
        }
      }
    }

    debug('Removing ' + mod.artifactId + ' moduleDependency from alfresco-maven-plugin');
    const alfrescoPlugin = topPom.findPlugin('org.alfresco.maven.plugin', 'alfresco-maven-plugin');
    if (alfrescoPlugin) {
      const configuration = domutils.getChild(alfrescoPlugin, 'pom', 'configuration');
      if (configuration) {
        const modulesElement = (mod.war === constants.WAR_TYPE_REPO ? 'platformModules' : 'shareModules');
        debug(`Using ${modulesElement} for ${mod.war} module`);
        const modules = domutils.getChild(configuration, 'pom', modulesElement);
        if (modules) {
          const xp = `pom:moduleDependency[pom:groupId = '${mod.groupId}' and pom:artifactId = '${mod.artifactId}']`;
          debug('Searching for moduleDependency with xpath: ' + xp);
          let moduleDependency = domutils.getFirstNodeMatchingXPath(xp, modules);
          if (moduleDependency) {
            debug('Found ' + mod.artifactId + ' in alfresco-maven-plugin, removing it');
            domutils.removeParentsChild(modules, moduleDependency);
          }
        }
      }
    }

    debug('Done removing ' + mod.artifactId + ' from pom.xml, saving changes');
    yo.fs.write(topPomPath, topPom.getPOMString());

    debug('removeModuleFromAlfrescoMavenPlugin() finished');
  }

  function removeModuleFromWarWrapper (mod) {
    yo.out.info('Removing ' + mod.artifactId + ' module from ' + mod.war + ' war wrapper');
    const wrapperPomPath = yo.destinationPath(mod.war + '/pom.xml');
    const wrapperPom = yo.fs.read(wrapperPomPath);
    const pom = require('generator-alfresco-common').maven_pom(wrapperPom);
    if (pom.findDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging)) {
      pom.removeDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging);
      pom.removeOverlay(mod.groupId, mod.artifactId, mod.packaging);
      yo.fs.write(wrapperPomPath, pom.getPOMString());
    }
    debug('removeModuleFromWarWrapper() finished');
  }

  function removeFailsafeConfigFromRunner (mod) {
    const runnerPomPath = yo.destinationPath('runner/pom.xml');
    yo.out.info('Removing failsafe entries for ' + mod.artifactId + ' from ' + runnerPomPath);
    const runnerPom = yo.fs.read(runnerPomPath);
    const pomDoc = domutils.parseFromString(runnerPom);
    const pluginExs = domutils.getFirstNodeMatchingXPath('/pom:project/pom:profiles/pom:profile[pom:id="functional-testing"]/pom:build/pom:plugins/pom:plugin[1]/pom:executions', pomDoc);
    if (pluginExs) {
      // now if we find executions for this module remove them too
      const mft = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="functional-tests-' + mod.artifactId + '"]', pluginExs);
      if (mft) {
        debug('Removing functional-tests-' + mod.artifactId);
        domutils.removeParentsChild(pluginExs, mft);
      }
      const mvt = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="verify-tests-' + mod.artifactId + '"]', pluginExs);
      if (mvt) {
        debug('Removing verify-tests-' + mod.artifactId);
        domutils.removeParentsChild(pluginExs, mvt);
      }
      yo.fs.write(runnerPomPath, domutils.prettyPrint(pomDoc));
    }
    debug('removeFailsafeConfigFromRunner() finished');
  }

  // TODO(bwavell): Add tests for this
  function removeModuleFromTomcatContext (mod) {
    yo.out.info('Removing path elements for ' + mod.artifactId + ' from tomcat context file');
    const warType = mod.war;
    const modPath = mod.path;
    const basename = path.basename(modPath);
    if ([constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE].indexOf(warType) > -1) {
      let fileName = constants.FILE_CONTEXT_REPO_XML;
      if (constants.WAR_TYPE_SHARE === warType) {
        fileName = constants.FILE_CONTEXT_SHARE_XML;
      }
      const ctxPath = yo.destinationPath(path.join(constants.FOLDER_RUNNER, constants.FOLDER_TOMCAT, fileName));
      if (yo.fs.exists(ctxPath)) {
        const ctxFile = yo.fs.read(ctxPath);
        const ctx = require('generator-alfresco-common').tomcat_context(ctxFile);

        ctx.removeExtraResourcePathMap('/=${project.parent.basedir}/' + modPath + '/target/' + basename + '/web');
        ctx.removeVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/classes');
        ctx.removeVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/' + basename + '/config');
        ctx.removeVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/test-classes');

        yo.fs.write(ctxPath, ctx.getContextString());
      }
    }
    debug('removeModuleFromTomcatContext() finished');
  }

  // TODO(bwavell): Add tests for this
  function removeFromIntegrationTestModule (mod) {
    debug('removeFromIntegrationTestModule() - Removing %s from integration-tests/pom.xml', mod.artifactId);
    const itPomPath = yo.destinationPath('integration-tests/pom.xml');
    const itPom = yo.fs.read(itPomPath);
    const pom = require('generator-alfresco-common').maven_pom(itPom);
    const foundModule = pom.findDependency(mod.groupId, mod.artifactId, mod.version, undefined, 'test');
    if (foundModule) {
      debug('Found existing dependency for %s:%s:%s, so we will remove it', mod.groupId, mod.artifactId, mod.version);
      pom.removeDependency(mod.groupId, mod.artifactId, mod.version);
      yo.fs.write(itPomPath, pom.getPOMString());
    }
    if (mod.groupId === '${project.groupId}' || mod.version === '${project.version}') {
      const g = yo.projectGroupId || yo.config.get(constants.PROP_PROJECT_GROUP_ID);
      const v = yo.version || yo.config.get(constants.PROP_PROJECT_VERSION);
      const foundAltModule = pom.findDependency(g, mod.artifactId, v, undefined, 'test');
      if (foundAltModule) {
        debug('Found existing concrete dependency %s:%s:%s, so we will remove it', g, mod.artifactId, v);
        pom.removeDependency(g, mod.artifactId, v);
        yo.fs.write(itPomPath, pom.getPOMString());
      }
    }
    debug('removeFromIntegrationTestModule() finished');
  }

  return new AlfrescoModuleManager();
};

module.exports = MakeAlfrescoModuleManager;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
