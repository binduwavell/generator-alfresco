'use strict';
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var xpath = require('xpath');

/*
 * Given a context file that at least has a root <beans> element, this module
 * will help us to make assertions and even edits to the file.
 *
 * Usage:
 * ... inside generator code
 * this.out = require('./spring-context.js')(text-of-context-file);
 */

module.exports = function(pomString) {
  var module = {};

  var defaultPOMString = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">',
    '  <modelVersion>4.0.0</modelVersion>',
    '  <groupId>com.example</groupId>',
    '  <artifactId>placeholder</artifactId>',
    '  <version>0.0.1-SNAPSHOT</version>',
    '  <packaging>pom</packaging>    ',
    '',
    '  <parent></parent>',
    '',
    '  <properties></properties>',
    '',
    '  <dependencies></dependencies>',
    '',
    '  <dependencyManagement></dependencyManagement>',
    '',
    '  <build></build>',
    '',
    '  <reporting></reporting>',
    '',
    '  <modules></modules>',
    '',
    '  <repositories></repositories>',
    '  <pluginRepositories></pluginRepositories>',
    '',
    '  <profiles></profiles>',
    '',
    '  <name>Example Module</name>',
    '  <description>Example module description should be changed</description>',
    '  <url></url>',
    '  <inceptionYear></inceptionYear>',
    '  <licenses></licenses>',
    '  <organizations></organizations>',
    '  <developers></developers>',
    '  <contributors></contributors>',
    '',
    '  <issueManagement></issueManagement>',
    '  <ciManagement></ciManagement>',
    '  <mailingLists></mailingLists>',
    '  <scm></scm>',
    '  <prerequisites></prerequisites>',
    '  <distributionManagement></distributionManagement>',
    '',
    '</project>'
  ].join('\n');

  var doc = new xmldom.DOMParser().parseFromString(pomString || defaultPOMString, 'text/xml');
  var project = doc.documentElement;
  var resolver = {
    mappings: {
      "pom": "http://maven.apache.org/POM/4.0.0",
      "xsi": "http://www.w3.org/2001/XMLSchema-instance"
    },
    lookupNamespaceURI: function(prefix) {
      return this.mappings[prefix];
    }
  };

  module.getOrCreateTopLevelElement = function(ns, tag) {
    var element = undefined;
    var xp = '/pom:project/' + ns + ':' + tag;
    var elements = xpath.selectWithResolver(xp, doc, resolver);
    if (elements && elements.length > 0) {
      element = elements[0];
    }
    if (!element) {
      element = doc.createElementNS(resolver.lookupNamespaceURI(ns), tag);
      project.appendChild(element);

    }
    return element;
  }

  module.setTopLevelElementTextContent = function(ns, tag, value) {
    var element = module.getOrCreateTopLevelElement(ns, tag);
    if (element) {
      element.textContent = value;
    }
  }

  module.setParentGAV = function(groupId, artifactId, version) {
    var parent = module.getOrCreateTopLevelElement('pom', 'parent');
    if (parent) {
      var groupIdNode = _getOrCreateChild(parent, 'pom', 'groupId');
      var artifactIdNode = _getOrCreateChild(parent, 'pom', 'artifactId');
      var versionNode = _getOrCreateChild(parent, 'pom', 'version');
      if (groupIdNode && artifactIdNode && versionNode) {
        groupIdNode.textContent = groupId;
        artifactIdNode.textContent = artifactId;
        versionNode.textContent = version;
      }
    }
  }

  module.findDependency = function(groupId, artifactId, version, scope) {
    var dependencies = xpath.selectWithResolver('/pom:project/pom:dependencies/pom:dependency', doc, resolver);
    // Only process if group and artifact Ids are specified and we have dependencies to process
    if (groupId && artifactId && dependencies) {
      var len = dependencies.length;
      for(var i = 0; i < len; i++) {
        var dependency = dependencies[i];

        var groupIdNode = _getChild(dependency, 'pom', 'groupId');
        var artifactIdNode = _getChild(dependency, 'pom', 'artifactId');
        var versionNode = _getChild(dependency, 'pom', 'version');
        var scopeNode = _getChild(dependency, 'pom', 'scope');

        var groupIdContent = (groupIdNode ? groupIdNode.textContent : undefined);
        var artifactIdContent = (artifactIdNode ? artifactIdNode.textContent : undefined);
        var versionContent = (versionNode ? versionNode.textContent : undefined);
        var scopeContent = (scopeNode ? scopeNode.textContent : undefined);


        // Don't bother matching things that don't at least match group and artifact Ids
        if (groupId == groupIdContent && artifactId == artifactIdContent) {
          if (version && scope) {
            if (version == versionContent && scope == scopeContent) {
              return dependency;
            }
          } else if (version && version == versionContent) {
              return dependency;
          } else if (scope && scope == scopeContent) {
              return dependency;
          } else {
            return dependency;
          }
        }
      }
    }
  }

  module.addDependency = function(groupId, artifactId, version, scope) {
    var dependency = module.findDependency(groupId, artifactId, version, scope);
    if (!dependency) {
      dependency = _createChild(module.getOrCreateTopLevelElement('pom', 'dependencies'), 'pom', 'dependency')
    }
    var groupIdNode = _getOrCreateChild(dependency, 'pom', 'groupId');
    var artifactIdNode = _getOrCreateChild(dependency, 'pom', 'artifactId');
    groupIdNode.textContent = groupId;
    artifactIdNode.textContent = artifactId;
    if (version) {
      var versionNode = _getOrCreateChild(dependency, 'pom', 'version');
      versionNode.textContent = version;
    } else {
      versionNode = _getChild(dependency, 'pom', 'version');
      if (versionNode) {
        _removeParentsChild(dependency, versionNode);
      }
    }
    if (scope) {
      var scopeNode = _getOrCreateChild(dependency, 'pom', 'scope');
      scopeNode.textContent = scope;
    } else {
      scopeNode = _getChild(dependency, 'pom', 'scope');
      if (scopeNode) {
        _removeParentsChild(dependency, scopeNode);
      }
    }
    return dependency;
  }

  module.removeDependency = function(groupId, artifactId, version, scope) {
    var dependency = module.findDependency(groupId, artifactId, version, scope);
    if (dependency) {
      var parent = dependency.parentNode;
      if (parent) {
        parent.removeChild(dependency);
      }
    }
    return dependency;
  }

  module.findPlugin = function(groupId, artifactId) {
    var plugins = xpath.selectWithResolver('/pom:project/pom:build/pom:pugins/pom:plugin', doc, resolver);
    // Only process if group and artifact Ids are specified and we have dependencies to process
    if (groupId && artifactId && plugins) {
      var len = plugins.length;
      for(var i = 0; i < len; i++) {
        var plugin = plugins[i];

        var groupIdNode = _getChild(overlay, 'pom', 'groupId');
        var artifactIdNode = _getChild(overlay, 'pom', 'artifactId');
        var scopeNode = _getChild(overlay, 'pom', 'scope');

        var groupIdContent = (groupIdNode ? groupIdNode.textContent : undefined);
        var artifactIdContent = (artifactIdNode ? artifactIdNode.textContent : undefined);
        var scopeContent = (scopeNode ? scopeNode.textContent : undefined);


        // Don't bother matching things that don't at least match group and artifact Ids
        if (groupId == groupIdContent && artifactId == artifactIdContent) {
          if (version && scope) {
            if (version == versionContent && scope == scopeContent) {
              return overlay;
            }
          } else if (version && version == versionContent) {
              return overlay;
          } else if (scope && scope == scopeContent) {
              return overlay;
          } else {
            return overlay;
          }
        }
      }
    }
  }
  module.findOverlay = function(groupId, artifactId, scope) {
    var plugins = xpath.selectWithResolver('/pom:project/pom:build/pom:pugins/pom:plugin', doc, resolver);
    // Only process if group and artifact Ids are specified and we have dependencies to process
    if (groupId && artifactId && plugins) {
      var len = plugins.length;
      for(var i = 0; i < len; i++) {
        var plugin = plugins[i];

        var groupIdNode = _getChild(overlay, 'pom', 'groupId');
        var artifactIdNode = _getChild(overlay, 'pom', 'artifactId');
        var scopeNode = _getChild(overlay, 'pom', 'scope');

        var groupIdContent = (groupIdNode ? groupIdNode.textContent : undefined);
        var artifactIdContent = (artifactIdNode ? artifactIdNode.textContent : undefined);
        var scopeContent = (scopeNode ? scopeNode.textContent : undefined);


        // Don't bother matching things that don't at least match group and artifact Ids
        if (groupId == groupIdContent && artifactId == artifactIdContent) {
          if (version && scope) {
            if (version == versionContent && scope == scopeContent) {
              return overlay;
            }
          } else if (version && version == versionContent) {
              return overlay;
          } else if (scope && scope == scopeContent) {
              return overlay;
          } else {
            return overlay;
          }
        }
      }
    }
  }

  module.addOverlay = function(groupId, artifactId, scope) {
    var overlay = module.findOverlay(groupId, artifactId, scope);
    if (!overlay) {
      dependency = _createChild(module.getOrCreateTopLevelElement('pom', 'build'), 'pom', 'plugins')
    }
    var groupIdNode = _getOrCreateChild(dependency, 'pom', 'groupId');
    var artifactIdNode = _getOrCreateChild(dependency, 'pom', 'artifactId');
    groupIdNode.textContent = groupId;
    artifactIdNode.textContent = artifactId;
    if (version) {
      var versionNode = _getOrCreateChild(dependency, 'pom', 'version');
      versionNode.textContent = version;
    } else {
      versionNode = _getChild(dependency, 'pom', 'version');
      if (versionNode) {
        _removeParentsChild(dependency, versionNode);
      }
    }
    if (scope) {
      var scopeNode = _getOrCreateChild(dependency, 'pom', 'scope');
      scopeNode.textContent = scope;
    } else {
      scopeNode = _getChild(dependency, 'pom', 'scope');
      if (scopeNode) {
        _removeParentsChild(dependency, scopeNode);
      }
    }
    return dependency;
  }

  module.removeOverlay = function(groupId, artifactId, scope) {
    var dependency = module.findDependency(groupId, artifactId, version, scope);
    if (dependency) {
      var parent = dependency.parentNode;
      if (parent) {
        parent.removeChild(dependency);
      }
    }
    return dependency;
  }

  module.findModule = function(mod) {
    var moduleNodes = xpath.selectWithResolver('/pom:project/pom:modules/pom:module', doc, resolver);
    // Only process if group and artifact Ids are specified and we have dependencies to process
    if (mod && moduleNodes) {
      var len = moduleNodes.length;
      for(var i = 0; i < len; i++) {
        var moduleNode = moduleNodes[i];

        var moduleContent = (moduleNode ? moduleNode.textContent : undefined);

        if (mod == moduleContent) {
            return moduleNode;
        }
      }
    }
  }

  module.addModule = function(mod) {
    var moduleNode = module.findModule(mod);
    if (!moduleNode) {
      moduleNode = _createChild(module.getOrCreateTopLevelElement('pom', 'modules'), 'pom', 'module')
    }
    moduleNode.textContent = mod;
    return moduleNode;
  }

  module.removeModule = function(mod) {
    var moduleNode = module.findModule(mod);
    if (moduleNode) {
      var parent = moduleNode.parentNode;
      if (parent) {
        parent.removeChild(moduleNode);
      }
    }
    return moduleNode;
  }

  module.setProperty = function(tag, value) {
    var propElement = _getOrCreateChild(_getOrCreateChild(project, 'pom', 'properties'), 'pom', tag);
    propElement.textContent = value;
    return propElement;
  }

  module.getPOMString = function() {
    return pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
  }

  function _createChild(node, ns, tag) {
    var child = doc.createElementNS(resolver.lookupNamespaceURI(ns), tag);
    node.appendChild(child);
    return child;
  }

  function _getChild(node, ns, tag) {
    var child = xpath.selectWithResolver(ns + ':' + tag, node, resolver, true);
    return child;
  }

  module._removeChild = function(node, ns, tag) {
    var child = _getChild(node, ns, tag)
    if (child) {
      var parent = child.parentNode;
      if (parent) {
        parent.removeChild(child);
      }
    }
  }

  module._removeParentsChild = function(parent, child) {
    if (parent && child) {
      parent.removeChild(child);
    }
  }

  function _getOrCreateChild(node, ns, tag) {
    var child = xpath.selectWithResolver(ns + ':' + tag, node, resolver, true);
    if (!child) {
      child = doc.createElementNS(resolver.lookupNamespaceURI(ns), tag);
      node.appendChild(child);
    }
    return child;
  }

  return module;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
