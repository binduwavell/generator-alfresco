'use strict';
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var xpath = require('xpath');
var domutils = require('./xml-dom-utils.js');

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

  module.getOrCreateTopLevelElement = function(ns, tag) {
    var element = undefined;
    var xp = '/pom:project/' + ns + ':' + tag;
    var elements = xpath.selectWithResolver(xp, doc, domutils.resolver);
    if (elements && elements.length > 0) {
      element = elements[0];
    }
    if (!element) {
      element = doc.createElementNS(domutils.resolver.lookupNamespaceURI(ns), tag);
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
      var groupIdNode = domutils.getOrCreateChild(doc, parent, 'pom', 'groupId');
      var artifactIdNode = domutils.getOrCreateChild(doc, parent, 'pom', 'artifactId');
      var versionNode = domutils.getOrCreateChild(doc, parent, 'pom', 'version');
      if (groupIdNode && artifactIdNode && versionNode) {
        groupIdNode.textContent = groupId;
        artifactIdNode.textContent = artifactId;
        versionNode.textContent = version;
      }
    }
  }

  module.findDependency = function(groupId, artifactId, version, scope) {
    var dependencies = xpath.selectWithResolver('/pom:project/pom:dependencies/pom:dependency', doc, domutils.resolver);
    // Only process if group and artifact Ids are specified and we have dependencies to process
    if (groupId && artifactId && dependencies) {
      var len = dependencies.length;
      for(var i = 0; i < len; i++) {
        var dependency = dependencies[i];

        var groupIdNode = domutils.getChild(dependency, 'pom', 'groupId');
        var artifactIdNode = domutils.getChild(dependency, 'pom', 'artifactId');
        var versionNode = domutils.getChild(dependency, 'pom', 'version');
        var scopeNode = domutils.getChild(dependency, 'pom', 'scope');

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
      dependency = domutils.createChild(doc, module.getOrCreateTopLevelElement('pom', 'dependencies'), 'pom', 'dependency')
    }
    var groupIdNode = domutils.getOrCreateChild(doc, dependency, 'pom', 'groupId');
    var artifactIdNode = domutils.getOrCreateChild(doc, dependency, 'pom', 'artifactId');
    groupIdNode.textContent = groupId;
    artifactIdNode.textContent = artifactId;
    if (version) {
      var versionNode = domutils.getOrCreateChild(doc, dependency, 'pom', 'version');
      versionNode.textContent = version;
    } else {
      versionNode = domutils.getChild(dependency, 'pom', 'version');
      if (versionNode) {
        domutils.removeParentsChild(dependency, versionNode);
      }
    }
    if (scope) {
      var scopeNode = domutils.getOrCreateChild(doc, dependency, 'pom', 'scope');
      scopeNode.textContent = scope;
    } else {
      scopeNode = domutils.getChild(dependency, 'pom', 'scope');
      if (scopeNode) {
        domutils.removeParentsChild(dependency, scopeNode);
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
  }

  module.findModule = function(moduleName) {
    var moduleNodes = xpath.selectWithResolver('/pom:project/pom:modules/pom:module', doc, domutils.resolver);
    // Only process if module name is specified and we have modules to process
    if (moduleName && moduleNodes) {
      var len = moduleNodes.length;
      for(var i = 0; i < len; i++) {
        var moduleNode = moduleNodes[i];

        var moduleContent = (moduleNode ? moduleNode.textContent : undefined);

        if (moduleName == moduleContent) {
            return moduleNode;
        }
      }
    }
  }

  module.addModule = function(mod) {
    var moduleNode = module.findModule(mod);
    if (!moduleNode) {
      moduleNode = domutils.createChild(doc, module.getOrCreateTopLevelElement('pom', 'modules'), 'pom', 'module')
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
  }

  module.findPlugin = function(first, second) {
    // Either provide groupId, artifactId for first, second
    // Or just provide artifactId and we'll ignore groupId.
    var groupId = (second ? first : undefined);
    var artifactId = (second ? second : first);

    var plugins = xpath.selectWithResolver('/pom:project/pom:build/pom:plugins/pom:plugin', doc, domutils.resolver);
    // Only process if group and artifact Ids are specified and we have plugins to process
    if (artifactId && plugins) {
      var len = plugins.length;
      for(var i = 0; i < len; i++) {
        var plugin = plugins[i];

        var groupIdNode = domutils.getChild(plugin, 'pom', 'groupId');
        var artifactIdNode = domutils.getChild(plugin, 'pom', 'artifactId');

        var groupIdContent = (groupIdNode ? groupIdNode.textContent : undefined);
        var artifactIdContent = (artifactIdNode ? artifactIdNode.textContent : undefined);

        // Don't bother matching things that don't at least match artifact Ids
        if (artifactId == artifactIdContent) {
          if (groupId && groupId == groupIdContent) {
            return plugin;
          } else {
            return plugin;
          }
        }
      }
    }
  }

  module.findOverlay = function(groupId, artifactId, type) {
    var overlays = xpath.selectWithResolver('/pom:project/pom:build/pom:plugins/pom:plugin/pom:configuration/pom:overlays/pom:overlay', doc, domutils.resolver);
    // Only process if group and artifact Ids are specified and we have overlays to process
    if (groupId && artifactId && overlays) {
      var len = overlays.length;
      for(var i = 0; i < len; i++) {
        var overlay = overlays[i];

        var groupIdNode = domutils.getChild(overlay, 'pom', 'groupId');
        var artifactIdNode = domutils.getChild(overlay, 'pom', 'artifactId');
        var typeNode = domutils.getChild(overlay, 'pom', 'type');

        var groupIdContent = (groupIdNode ? groupIdNode.textContent : undefined);
        var artifactIdContent = (artifactIdNode ? artifactIdNode.textContent : undefined);
        var typeContent = (typeNode ? typeNode.textContent : undefined);

        // Don't bother matching things that don't at least match group and artifact Ids
        if (groupId == groupIdContent && artifactId == artifactIdContent) {
          if (type && type == typeContent) {
            return overlay;
          } else {
            return overlay;
          }
        }
      }
    }
  }

  module.addOverlay = function(groupId, artifactId, type) {
    var overlay = module.findOverlay(groupId, artifactId, type);
    if (!overlay) {
      var overlays = xpath.selectWithResolver('/pom:project/pom:build/pom:plugins/pom:plugin/pom:configuration/pom:overlays', doc, domutils.resolver);
      if (overlays) {
        overlay = domutils.createChild(doc, overlays[0], 'pom', 'overlay');
      }
    }
    if (overlay) {
      var groupIdNode = domutils.getOrCreateChild(doc, overlay, 'pom', 'groupId');
      var artifactIdNode = domutils.getOrCreateChild(doc, overlay, 'pom', 'artifactId');
      var typeNode = domutils.getOrCreateChild(doc, overlay, 'pom', 'type');
      groupIdNode.textContent = groupId;
      artifactIdNode.textContent = artifactId;
      typeNode.textContent = type;
    }
    return overlay;
  }

  module.removeOverlay = function(groupId, artifactId, scope) {
    var overlay = module.findOverlay(groupId, artifactId, scope);
    if (overlay) {
      var parent = overlay.parentNode;
      if (parent) {
        parent.removeChild(overlay);
      }
    }
  }

  module.setProperty = function(tag, value) {
    var propElement = domutils.getOrCreateChild(doc, domutils.getOrCreateChild(doc, project, 'pom', 'properties'), 'pom', tag);
    propElement.textContent = value;
    return propElement;
  }

  module.getPOMString = function() {
    return pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
  }

  return module;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
