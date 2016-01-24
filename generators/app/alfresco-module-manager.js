'use strict';
var path = require('path');
var domutils = require('./xml-dom-utils.js');
var memFsUtils = require('./mem-fs-utils.js');

/**
 * This module is in essence a wrapper around the alfresco-module-registry
 * it provides similar methods for adding and removing modules, it uses
 * the registry to figure out if a change is valid and to keep track of a
 * change having occurred. It also interacts with the current project to
 * add/remove files and even update references in poms/context-files, etc.
 */

module.exports = function(yo) {
  var module = {};

  var ops = [];

  module.moduleRegistry = require('./alfresco-module-registry.js')(yo);

  module.addModule = function(modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    var mod = this.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    // console.log("Existing module: " + JSON.stringify(mod));
    if (!mod) {
      mod = this.moduleRegistry.normalizeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
      // console.log("Adding module: " + JSON.stringify(mod));
    }
    yo.out.info('Adding ' + mod.artifactId + ' module to module registry');
    this.moduleRegistry.addModule(mod);

    // Stuff we only need to do for source amps
    if ('source' === mod.location) {
      // console.log('Scheduling ops for ' + mod.artifactId);
      ops.push(function() { copyTemplateForModule(mod) } );
      ops.push(function() { renamePathElementsForModule(mod) } );
      if ('repo' === mod.war) {
        ops.push(function () { addModuleToParentPom(mod) } );
      }
    }

    ops.push(function() { updateProjectPom(mod) } );
    ops.push(function() { addModuleToWarWrapper(mod) } );
    // TODO: what else do we need to do when we remove a module?
  }

  function copyTemplateForModule(mod) {
    var toPath = yo.destinationPath(mod.path);
    // console.log('Copy destination: ' + toPath);
    if (!yo.fs.exists(toPath)) {
      var fromPath = yo.destinationPath('amps_source_templates/' + mod.war + '-' + mod.packaging);
      yo.out.info('Copying template for ' + mod.artifactId + ' module ' + fromPath + ' to ' + toPath);
      if (memFsUtils.existsInMemory(yo.fs, fromPath)) {
        memFsUtils.inMemoryCopy(yo.fs, fromPath, toPath)
      } else {
        yo.fs.copy(path.join(fromPath, '/**'), toPath);
      }
    } else {
      yo.out.warn('Not copying module as target path already exists: ' + toPath);
    }
  }

  function renamePathElementsForModule(mod) {
    // get default repo module artifactId
    var defaultMods = yo.sdk.defaultModuleRegistry.call(yo).filter(function(mod) {
      return ('source' === mod.location && 'repo' === mod.war);
    });
    if (defaultMods && defaultMods.length > 0) {
      if (defaultMods[0].artifactId != mod.artifactId) {
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
        // console.log("MOVING FROM: " + fromPath + " to: " + toPath);
        if (memFsUtils.existsInMemory(yo.fs, fromPath)) {
          memFsUtils.inMemoryMove(yo.fs, fromPath, toPath)
        } else {
          yo.fs.move(fromPath + "/**", toPath);
        }
      }
    }
  }

  function addModuleToParentPom(mod) {
    // TODO: if intermediate source modules are not included, include them too (amps_source for example.)
    var parentPomPath = yo.destinationPath(path.join(path.dirname(mod.path), 'pom.xml'));
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + parentPomPath);
    var parentPom = yo.fs.read(parentPomPath);
    var pom = require('./maven-pom.js')(parentPom);
    if (!pom.findModule(mod.artifactId)) {
      pom.addModule(mod.artifactId, true);
      yo.fs.write(parentPomPath, pom.getPOMString());
    }
  }

  function updateProjectPom(mod) {
    var projectPomPath = path.join(yo.destinationPath(), mod.path, 'pom.xml');
    yo.out.info('Setting project/parent GAVs for ' + mod.artifactId + ' in ' + projectPomPath);
    // console.log("POM EXISTS: " + projectPomPath + " [" + yo.fs.exists(projectPomPath) + "]");
    var projectPom = yo.fs.read(projectPomPath);
    var pom = require('./maven-pom.js')(projectPom);
    pom.setProjectGAV(mod.groupId, mod.artifactId, mod.version, mod.packaging);
    pom.setParentGAV(
        yo.projectGroupId || yo.config.get('projectGroupId'),
        yo.projectArtifactId || yo.config.get('projectArtifactId'),
        yo.projectVersion || yo.config.get('projectVersion'));
    yo.fs.write(projectPomPath, pom.getPOMString());
  }

  function addModuleToWarWrapper(mod) {
    yo.out.info('Adding ' + mod.artifactId + ' module to ' + mod.war + ' war wrapper');
    var wrapperPomPath = yo.destinationPath(mod.war + '/pom.xml');
    var wrapperPom = yo.fs.read(wrapperPomPath);
    var pom = require('./maven-pom.js')(wrapperPom);
    if (!pom.findDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging)) {
      pom.addDependency(mod.groupId, mod.artifactId, mod.version, mod.packaging);
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
        if ('maven-war-plugin' !== artifactIdText) {
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
    } while ('maven-war-plugin' !== artifactIdText)
    var configuration = domutils.getOrCreateChild(plugin, 'pom', 'configuration');
    var overlays = domutils.getOrCreateChild(configuration, 'pom', 'overlays');
    var overlay = pom.addOverlay(mod.groupId, mod.artifactId, mod.packaging);
    // console.log(pom.getPOMString());
    yo.fs.write(wrapperPomPath, pom.getPOMString());
  }

  module.removeModule = function(modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    // console.log("SEARCHING FOR MODULE: " + modOrGroupId.artifactId);
    var mod = this.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    if (mod) {
      // console.log("REMOVING MODULE: " + mod.artifactId);
      this.moduleRegistry.removeModule(mod);
      if ('source' === mod.location) {
        ops.push(function() { removeModuleFiles(mod) } );
        ops.push(function() { removeModuleFromParentPom(mod) } );
        ops.push(function() { removeModuleFromWarWrapper(mod) } );
        // TODO: what else do we need to do when we remove a module?
      }
    }
  }

  function removeModuleFiles(mod) {
    // remove the actual files
    yo.out.warn('Deleting source module: ' + mod.path);
    var absPath = yo.destinationPath(mod.path);
    // if we have files on disk already this will get them
    // console.log("DELETING EXISTING FILES FROM: " + absPath);
    yo.fs.delete(absPath);
    // if we have files in mem-fs, this should get those
    yo.fs.store.each(function(file, idx) {
      if (file.path.indexOf(absPath) == 0) {
        // console.log("DELETING: " + file.path);
        yo.fs.delete(file.path);
      }
    });
  }

  function removeModuleFromParentPom(mod) {
    var parentPomPath = yo.destinationPath('pom.xml');
    yo.out.warn('Removing ' + mod.artifactId + ' module from ' + parentPomPath);
    var parentPom = yo.fs.read(parentPomPath);
    var pom = require('./maven-pom.js')(parentPom);
    if (pom.findModule(mod.artifactId)) {
      pom.removeModule(mod.artifactId);
      yo.fs.write(parentPomPath, pom.getPOMString());
    }
  }

  function removeModuleFromWarWrapper(mod) {
    // TODO: remove dependency and overlay from repo / share war wrapper modules
    yo.out.warn('Removing ' + mod.artifactId + ' module from ' + mod.war + ' war wrapper');
  }

  module.save = function() {
    // console.log('Saving module registry and performing scheduled tasks');
    this.moduleRegistry.save();
    ops.forEach(function(op) {
      op.call(this);
    });
    ops = [];
  }

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
