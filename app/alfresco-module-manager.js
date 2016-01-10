'use strict';

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

  module.removeModule = function(modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    var mod = yo.moduleRegistry.findModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    if (mod) {
      yo.moduleRegistry.removeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
      if ('source' === mod.location) {
          // remove the actual files
          yo.out.warn('Deleting source amp: ' + mod.path);
          var absPath = yo.destinationPath(mod.path);
          // if we have files on disk already this will get them
          yo.fs.delete(absPath);
          // if we have files in mem-fs, this should get those
          yo.fs.store.each(function(file, idx) {
            if (file.path.indexOf(absPath) == 0) {
              yo.fs.delete(file.path);
            }
          });
          // TODO: remove module from top pom.xml
          ops.push(function() { removeModuleFromTopPom(mod) } );
          // TODO: remove from repo / share war wrapper modules
          ops.push(function() { removeModuleFromWarWrapper(mod) } );
      }
      // TODO: what else do we need to do when we remove a module?
    }
  }

  function removeModuleFromTopPom(mod) {
    yo.out.warn('Removing ' + mod.artifactId + ' module from top pom.xml');
  }

  function removeModuleFromWarWrapper(mod) {
    yo.out.warn('Removing ' + mod.artifactId + ' module from ' + mod.war + ' war wrapper');
  }

  module.save = function() {
    yo.moduleRegistry.save();
    ops.forEach(function(op) {
      op.call(this);
    });
  }

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
