'use strict';
var debug = require('debug')('generator-alfresco:alfresco-module-manager');
var path = require('path');
var constants = require('generator-alfresco-common').constants;
var domutils = require('generator-alfresco-common').xml_dom_utils;
var memFsUtils = require('generator-alfresco-common').mem_fs_utils;

/**
 * This module is in essence a wrapper around the alfresco-module-registry
 * it provides similar methods for adding and removing modules, it uses
 * the registry to figure out if a change is valid and to keep track of a
 * change having occurred. It also interacts with the current project to
 * add/remove files and even update references in poms/context-files, etc.
 */

module.exports = function (yo) {
  var module = {};

  var ops = [];

  module.pushOp = function (fn) {
    ops.push(fn);
  };

  module.moduleRegistry = yo.moduleRegistry || require('generator-alfresco-common').alfresco_module_registry(yo);

  module.addModule = function (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    debug('attempting to addModule: %s %s %s %s %s %s %s', modOrGroupId, artifactId, ver, packaging, war, loc, path);
    var mod = this.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    debug('Existing module: ' + JSON.stringify(mod));
    if (!mod) {
      mod = this.moduleRegistry.normalizeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
      debug('normalized result: %j', mod);
    }
    yo.out.info('Adding ' + mod.artifactId + ' module to module registry');
    this.moduleRegistry.addModule(mod);

    // Stuff we only need to do for source amps
    if (mod.location === 'source') {
      debug('Scheduling ops for ' + mod.artifactId);
      ops.push(function () { copyTemplateForModule(mod) });
      ops.push(function () { renamePathElementsForModule(mod) });
      ops.push(function () { addModuleToParentPom(mod) });
      if (mod.war === constants.WAR_TYPE_SHARE) {
        ops.push(function () { addFailsafeConfigToRunner(mod) });
      }
      ops.push(function () { addModuleToTomcatContext(mod) });
      ops.push(function () { updateProjectPom(mod) });
    }

    ops.push(function () { addModuleToWarWrapper(mod) });
    // TODO: what else do we need to do when we remove a module?
    debug('addModule() finished');
  };

  function copyTemplateForModule (mod) {
    debug('copyTemplateForModule()');
    var toPath = yo.destinationPath(mod.path);
    debug('Copy destination: ' + toPath);
    if (!yo.fs.exists(toPath)) {
      var prefix = yo.sdk.sdkVersionPrefix.call(yo);
      yo.config.get('artifactId');
      var fromPath = yo.destinationPath(constants.FOLDER_SOURCE_TEMPLATES + '/' + prefix + mod.war + '-' + mod.packaging);
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
      var defaultMods = yo.sdk.defaultModuleRegistry.call(yo).filter(function (mod) {
        return (mod.location === 'source' && mod.war === constants.WAR_TYPE_REPO);
      });
      if (defaultMods && defaultMods.length > 0) {
        if (mod.artifactId !== defaultMods[0].artifactId) {
          // <path>/src/main/amp/config/alfresco/module/<artifactId>
          var fromPath = path.join(
            yo.destinationPath(),
            mod.path,
            '/src/main/amp/config/alfresco/module',
            defaultMods[0].artifactId
          );
          var toPath = path.join(
            yo.destinationPath(),
            mod.path,
            '/src/main/amp/config/alfresco/module',
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

    debug('renamePathElementsForModule() finished');
  }

  function addFailsafeConfigToRunner (mod) {
    var runnerPomPath = yo.destinationPath('runner/pom.xml');
    yo.out.info('Configuring failsafe entries for ' + mod.artifactId + ' in ' + runnerPomPath);
    var runnerPom = yo.fs.read(runnerPomPath);
    var pomDoc = domutils.parseFromString(runnerPom);
    var plugin = domutils.getFirstNodeMatchingXPath('/pom:project/pom:profiles/pom:profile[pom:id="functional-testing"]/pom:build/pom:plugins/pom:plugin[1]', pomDoc);
    if (plugin) {
      var pluginExs = domutils.getFirstNodeMatchingXPath('pom:executions', plugin);
      if (pluginExs) {
        // if we have generic config we should remove it
        var pluginConfig = domutils.getFirstNodeMatchingXPath('pom:configuration', plugin);
        if (pluginConfig) {
          domutils.removeChild(pluginConfig, 'pom', 'suiteXmlFiles');
          domutils.removeChild(pluginConfig, 'pom', 'testClassesDirectory');
        }
        // if we have the generic executions we should remove them
        var ft = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="functional-tests"]', pluginExs);
        if (ft) {
          domutils.removeParentsChild(pluginExs, ft);
        }
        var vt = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="verify-tests"]', pluginExs);
        if (vt) {
          domutils.removeParentsChild(pluginExs, vt);
        }
        // now add module specific instances
        var ftx = [
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
        var ftdoc = domutils.parseFromString(ftx);
        var ftn = pomDoc.importNode(ftdoc.documentElement, true);
        pluginExs.appendChild(ftn);
        var vtx = [
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
        var vtdoc = domutils.parseFromString(vtx);
        var vtn = pomDoc.importNode(vtdoc.documentElement, true);
        pluginExs.appendChild(vtn);
        yo.fs.write(runnerPomPath, domutils.prettyPrint(pomDoc));
      }
    }
    debug('addFailsafeConfigToRunner() finished');
  }

  function addModuleToParentPom (mod) {
    // TODO: if intermediate source modules are not included, include them too (customizations for example.)
    var parentPomPath = yo.destinationPath(path.join(path.dirname(mod.path), 'pom.xml'));
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + parentPomPath);
    var parentPom = yo.fs.read(parentPomPath);
    var pom = require('generator-alfresco-common').maven_pom(parentPom);
    if (!pom.findModule(mod.artifactId)) {
      pom.addModule(mod.artifactId, true);
      yo.fs.write(parentPomPath, pom.getPOMString());
    }
    debug('addModuleToParentPom() finished');
  }

  // TODO(bwavell): Add tests for this
  function addModuleToTomcatContext (mod) {
    yo.out.info('Adding path elements for ' + mod.artifactId + ' tomcat context file');
    var warType = mod.war;
    var modPath = mod.path;
    var basename = path.basename(modPath);
    if ([constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE].indexOf(warType) > -1) {
      var fileName = constants.FILE_CONTEXT_REPO_XML;
      if (constants.WAR_TYPE_SHARE === warType) {
        fileName = constants.FILE_CONTEXT_SHARE_XML;
      }
      var ctxPath = yo.destinationPath(path.join(constants.FOLDER_RUNNER, constants.FOLDER_TOMCAT, fileName));
      if (yo.fs.exists(ctxPath)) {
        var ctxFile = yo.fs.read(ctxPath);
        var ctx = require('generator-alfresco-common').tomcat_context(ctxFile);
        var targetFolder = yo.sdk.targetFolderName.call(yo, basename);

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
    var projectPomPath = path.join(yo.destinationPath(), mod.path, 'pom.xml');
    yo.out.info('Setting project/parent GAVs for ' + mod.artifactId + ' in ' + projectPomPath);

    // Obtain GAV from parent
    var parentPomPath = yo.destinationPath(path.join(path.dirname(mod.path), 'pom.xml'));
    yo.out.info('Finding parent GAV info for ' + mod.artifactId + ' module from ' + parentPomPath);
    var parentPomStr = yo.fs.read(parentPomPath);
    var parentPom = require('generator-alfresco-common').maven_pom(parentPomStr);
    var parentGroupIdEl = parentPom.getTopLevelElement('pom', 'groupId');
    var parentArtifactIdEl = parentPom.getTopLevelElement('pom', 'artifactId');
    var parentVersionEl = parentPom.getTopLevelElement('pom', 'version');
    var parentGroupId = (parentGroupIdEl ? parentGroupIdEl.textContent : yo.projectGroupId || yo.config.get(constants.PROJECT_GROUP_ID));
    var parentArtifactId = (parentArtifactIdEl ? parentArtifactIdEl.textContent : yo.projectArtifactId || yo.config.get(constants.PROP_PROJECT_ARTIFACT_ID));
    var parentVersion = (parentVersionEl ? parentVersionEl.textContent : yo.projectVersion || yo.config.get(constants.PROJECT_VERSION));

    debug('POM EXISTS: ' + projectPomPath + ' [' + yo.fs.exists(projectPomPath) + ']');
    var projectPom = yo.fs.read(projectPomPath);
    debug('POM CONTENTS: ' + projectPom);
    var pom = require('generator-alfresco-common').maven_pom(projectPom);
    // Unless we are in the customizations folder we can use provided values with
    // inheritance magic for project.blah references. In the customizations folder
    // we have to be more explicit as that folder has fixed GAV.
    if (constants.FOLDER_CUSTOMIZATIONS !== path.basename(path.dirname(mod.path))) {
      pom.setProjectGAV(mod.groupId, mod.artifactId, mod.version, mod.packaging);
    } else {
      var groupId = mod.groupId;
      var version = mod.version;
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

  function addModuleToWarWrapper (mod) {
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + mod.war + ' war wrapper');
    var wrapperPomPath = yo.destinationPath(mod.war + '/pom.xml');
    var wrapperPom = yo.fs.read(wrapperPomPath);
    var pom = require('generator-alfresco-common').maven_pom(wrapperPom);
    if (!pom.findDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging)) {
      var scope;
      var systemPath;
      if (mod.location === 'local') {
        scope = 'system';
        systemPath = '${project.basedir}/../' + mod.path;
      }
      pom.addDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging, scope, systemPath);
    }

    // search existing plugins for maven-war-plugin, create if necessary
    // once found/created, make sure we have configuation/overlays
    var build = pom.getOrCreateTopLevelElement('pom', 'build');
    var plugins = domutils.getOrCreateChild(build, 'pom', 'plugins');
    var plugin = domutils.getOrCreateChild(plugins, 'pom', 'plugin');
    var artifactIdText = '';
    do {
      var artifactId = domutils.getOrCreateChild(plugin, 'pom', 'artifactId');
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
    var configuration = domutils.getOrCreateChild(plugin, 'pom', 'configuration');
    domutils.getOrCreateChild(configuration, 'pom', 'overlays');
    pom.addOverlay(mod.groupId, mod.artifactId, mod.packaging);
    debug(pom.getPOMString());
    yo.fs.write(wrapperPomPath, pom.getPOMString());
    debug('addModuleToWarWrapper() finished');
  }

  module.removeModule = function (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    debug('removeModule() - start by searching for module: %s', modOrGroupId.artifactId);
    var mod = this.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    if (mod) {
      debug('removing module: %s', mod.artifactId);
      this.moduleRegistry.removeModule(mod);
      if (mod.location === 'source') {
        ops.push(function () { removeModuleFiles(mod) });
        ops.push(function () { removeModuleFromParentPom(mod) });
        ops.push(function () { removeModuleFromWarWrapper(mod) });
        if (mod.war === constants.WAR_TYPE_SHARE) {
          ops.push(function () { removeFailsafeConfigFromRunner(mod) });
        }
        ops.push(function () { removeModuleFromTomcatContext(mod) });
        // TODO: what else do we need to do when we remove a module?
      }
    }
    debug('removeModule() finished');
  };

  function removeModuleFiles (mod) {
    // remove the actual files
    yo.out.warn('Deleting source module: ' + mod.path);
    var absPath = yo.destinationPath(mod.path);
    // if we have files on disk already this will get them
    debug('DELETING EXISTING FILES FROM: ' + absPath);
    yo.fs.delete(absPath);
    // if we have files in mem-fs, this should get those
    yo.fs.store.each(function (file, idx) {
      if (file.path.indexOf(absPath) === 0) {
        debug('DELETING: ' + file.path);
        yo.fs.delete(file.path);
      }
    });
    debug('removeModuleFiles() finished');
  }

  function removeModuleFromParentPom (mod) {
    var parentPomPath = yo.destinationPath('pom.xml');
    yo.out.warn('Removing ' + mod.artifactId + ' module from ' + parentPomPath);
    var parentPom = yo.fs.read(parentPomPath);
    var pom = require('generator-alfresco-common').maven_pom(parentPom);
    if (pom.findModule(mod.artifactId)) {
      pom.removeModule(mod.artifactId);
      yo.fs.write(parentPomPath, pom.getPOMString());
    }
    debug('removeModuleFromParentPom() finished');
  }

  function removeModuleFromWarWrapper (mod) {
    yo.out.info('Removing ' + mod.artifactId + ' module from ' + mod.war + ' war wrapper');
    var wrapperPomPath = yo.destinationPath(mod.war + '/pom.xml');
    var wrapperPom = yo.fs.read(wrapperPomPath);
    var pom = require('generator-alfresco-common').maven_pom(wrapperPom);
    if (pom.findDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging)) {
      pom.removeDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging);
      pom.removeOverlay(mod.groupId, mod.artifactId, mod.packaging);
      yo.fs.write(wrapperPomPath, pom.getPOMString());
    }
    debug('removeModuleFromWarWrapper() finished');
  }

  function removeFailsafeConfigFromRunner (mod) {
    var runnerPomPath = yo.destinationPath('runner/pom.xml');
    yo.out.info('Removing failsafe entries for ' + mod.artifactId + ' from ' + runnerPomPath);
    var runnerPom = yo.fs.read(runnerPomPath);
    var pomDoc = domutils.parseFromString(runnerPom);
    var pluginExs = domutils.getFirstNodeMatchingXPath('/pom:project/pom:profiles/pom:profile[pom:id="functional-testing"]/pom:build/pom:plugins/pom:plugin[1]/pom:executions', pomDoc);
    if (pluginExs) {
      // now if we find executions for this module remove them too
      var mft = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="functional-tests-' + mod.artifactId + '"]', pluginExs);
      if (mft) {
        debug('Removing functional-tests-' + mod.artifactId);
        domutils.removeParentsChild(pluginExs, mft);
      }
      var mvt = domutils.getFirstNodeMatchingXPath('pom:execution[pom:id="verify-tests-' + mod.artifactId + '"]', pluginExs);
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
    var warType = mod.war;
    var modPath = mod.path;
    var basename = path.basename(modPath);
    if ([constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE].indexOf(warType) > -1) {
      var fileName = constants.FILE_CONTEXT_REPO_XML;
      if (constants.WAR_TYPE_SHARE === warType) {
        fileName = constants.FILE_CONTEXT_SHARE_XML;
      }
      var ctxPath = yo.destinationPath(path.join(constants.FOLDER_RUNNER, constants.FOLDER_TOMCAT, fileName));
      if (yo.fs.exists(ctxPath)) {
        var ctxFile = yo.fs.read(ctxPath);
        var ctx = require('generator-alfresco-common').tomcat_context(ctxFile);

        ctx.removeExtraResourcePathMap('/=${project.parent.basedir}/' + modPath + '/target/' + basename + '/web');
        ctx.removeVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/classes');
        ctx.removeVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/' + basename + '/config');
        ctx.removeVirtualClasspath('${project.parent.basedir}/' + modPath + '/target/test-classes');

        yo.fs.write(ctxPath, ctx.getContextString());
      }
    }
    debug('removeModuleFromTomcatContext() finished');
  }

  module.save = function () {
    debug('saving module registry and performing scheduled tasks');
    this.moduleRegistry.save();
    ops.forEach(function (op) {
      op.call(this);
    });
    ops = [];
    debug('save() finished');
  };

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
