'use strict';
var debug = require('debug')('generator-alfresco:alfresco-module-registry');
var constants = require('./constants.js');

/**
 * Node module that manages a config object that describes all Alfresco modules
 * in this project. The structure is as follows:
 *
 * [
 *   {
 *     "groupId": "org.alfresco",
 *     "artifactId": "repo-amp",
 *     "version": "1.0.0-SNAPSHOT",
 *     "packaging": "amp",
 *     "war": "repo",
 *     "location": "source",
 *     "path": "repo-amp",
 *   },
 *   {
 *     "groupId": "org.alfresco",
 *     "artifactId": "share-amp",
 *     "version": "1.0.0-SNAPSHOT",
 *     "packaging": "amp",
 *     "war": "share",
 *     "location": "source",
 *     "path": "share-amp",
 *   }
 * ]
 *
 * gropuId: groupId for the module, may be ${project.groupId}
 * artifactId: artifactId for the module
 * version: version for the module, may be ${project.version}
 * packaging: amp or jar
 * war: Client war the module is applied to: repo or share
 * location: Inicates where we can find the artifact: remote, local, source
 *     remote: the artifact is resolved from an accessible maven repository
 *     local: the artifact is resolved from a local directory
 *     source: the artifact is built by a module in this project
 * path: path relative to project root to module root
 *
 * The user facing name for a module will be constructed as follows:
 *     groupId:[blue]artifactId:version:[green]packaging:[blue]war:[green]location
 *
 * ${project.groupId} and ${project.version} will be resolved in the names
 *
 * Ideally the artifactId, packaging, war and location elements will be color
 * coded as indicated to make them stand out.
 */

module.exports = function (yo) {
  var module = {};
  var modules = yo.config.get('moduleRegistry') || [];

  module.getModules = function () {
    return modules;
  };

  module.getNamedModules = function () {
    return modules.map(function (mod) {
      return {
        'name': module._getModuleName(mod),
        'module': mod,
      };
    });
  };

  module._getModuleName = function (mod) {
    var groupId = mod.groupId;
    if (groupId === '${project.groupId}') {
      groupId = yo.config.get(constants.PROP_PROJECT_GROUP_ID) || yo[constants.PROP_PROJECT_GROUP_ID];
    }
    var ver = mod['version'];
    if (ver === '${project.version}') {
      ver = yo.config.get(constants.PROP_PROJECT_VERSION) || yo[constants.PROP_PROJECT_VERSION];
    }
    return groupId + ':' + mod.artifactId + ':' + ver + ':'
      + mod.packaging + ':' + mod.war + ':' + mod['location'];
  };

  module.normalizeModule = function (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    debug('attempting to normalize: %s %s %s %s %s %s %s', modOrGroupId, artifactId, ver, packaging, war, loc, path);
    // first argument is always required
    if (undefined !== modOrGroupId) {
      // if the first argument is the only argument, make sure it provides all
      // properties for a module, if so add the module
      if (!artifactId && !ver && !packaging && !war && !loc && !path) {
        if (modOrGroupId.groupId && modOrGroupId.artifactId
          && modOrGroupId['version'] && modOrGroupId.packaging
          && modOrGroupId.war && modOrGroupId['location'] && modOrGroupId.path) {
          return modOrGroupId;
        } else {
          // one or more module properties is missing
          return undefined;
        }
      } else if (!artifactId || !ver || !packaging || !war || !loc || !path) {
        // as we are not dealing with a single argument, make sure all arguments
        // are provided.
        return undefined;
      } else {
        // we appear to have all arguments so construct a module and add it
        return {
          'groupId': modOrGroupId,
          'artifactId': artifactId,
          'version': ver,
          'packaging': packaging,
          'war': war,
          'location': loc,
          'path': path,
        };
      }
    }
  };

  module.findModule = function (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    var found;
    var moduleToFind = module.normalizeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    if (undefined !== moduleToFind) {
      modules.forEach(function (mod) {
        if (moduleToFind.groupId === mod.groupId && moduleToFind.artifactId === mod.artifactId
          && moduleToFind['version'] === mod['version'] && moduleToFind.packaging === mod.packaging
          && moduleToFind.war === mod.war && moduleToFind['location'] === mod['location'] && moduleToFind.path === mod.path) {
          found = mod;
        }
      });
    }
    return found;
  };

  module.addModule = function (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    var mod = module.normalizeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    if (undefined !== mod) {
      var foundMod = module.findModule(mod);
      if (!foundMod) {
        modules.push(mod);
      }
    } else {
      throw new Error('All components of the module are required: '
        + 'groupId, artifactId, version, packaging, war, location and path.');
    }
  };

  module.removeModule = function (modOrGroupId, artifactId, ver, packaging, war, loc, path) {
    var mod = module.normalizeModule(modOrGroupId, artifactId, ver, packaging, war, loc, path);
    if (undefined !== mod) {
      var foundMod = module.findModule(mod);
      if (foundMod) {
        var idx = modules.indexOf(foundMod);
        modules.splice(idx, 1); // weird javascript array mutation, for removing element
      } else {
        throw new Error('You may only remove a module that has already been registered');
      }
    } else {
      throw new Error('All components of the module are required: '
        + 'groupId, artifactId, version, packaging, war, location and path.');
    }
  };

  module.save = function () {
    // update poms for war wrappers
    // update tomcat context files
    yo.config.set('moduleRegistry', modules);
  };

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
