'use strict';
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var domutil = require('./xml-dom-utils.js');

/*
 * Given a context file that at least has a root <Context> element, this module
 * will help us to set appropriate Resources.@extraResourcePaths and
 * Loader.@virtualClasspath attribute values.
 *
 * Usage:
 * ... inside generator code
 * this.ctx = require('./tomcat-context.js')(text-of-context-file);
 * ... make calls to update tomcat context file
 * this.ctx.getContextString();
 */

// TODO(bwavell): Add tests for this module
module.exports = function (contextString) {
  var module = {};

  var defaultContextString = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- ===================================================================================================================',
    '     This context file is used only in a development IDE for rapid development,',
    '     it is never released with the Alresco.war or Share.war',
    '',
    '     IMPORTANT: If a source AMP or JAR extension is added to one of the WAR files,',
    '     then you need to add the paths below.',
    '     =================================================================================================================-->',
    '<Context docBase="${project.parent.basedir}/alfresco-war/target/${project.build.finalName}">',
    '    <!-- Pick up static resource files from any Share extensions, being it a JAR or an AMP (this should not include docBase) -->',
    '    <Resources className="org.apache.naming.resources.VirtualDirContext"',
    '               extraResourcePaths="" />',
    '',
    '    <!-- Configure where the Share (share.war) web application can load classes, test classes, and config files -->',
    '    <Loader className="org.apache.catalina.loader.VirtualWebappLoader"',
    '            searchVirtualFirst="true"',
    '            virtualClasspath="" />',
    '',
    '    <!-- Load from all directories, not just when the META-INF directory is found in exploded JAR -->',
    '    <JarScanner scanAllDirectories="true" />',
    '</Context>',
  ].join('\n');

  var doc = domutil.parseFromString(contextString || defaultContextString);
  var extraResourcePaths = domutil.getFirstNodeMatchingXPath('/Context/Resources/@extraResourcePaths', doc);
  var virtualClasspath = domutil.getFirstNodeMatchingXPath('/Context/Loader/@virtualClasspath', doc);

  module.wipeExtraResourcePaths = function () {
    extraResourcePaths.value = '';
  };

  module.wipeVirtualClasspath = function () {
    virtualClasspath.value = '';
  };

  module.addExtraResourcePathMap = function (pathMap) {
    this.removeExtraResourcePathMap(pathMap);
    domutil.appendToAttributeValueList(extraResourcePaths, pathMap, ',');
  };

  module.addVirtualClasspath = function (path) {
    this.removeVirtualClasspath(path);
    domutil.appendToAttributeValueList(virtualClasspath, path, ';');
  };

  module.removeExtraResourcePathMap = function (pathMap) {
    domutil.removeFromAttributeValueList(extraResourcePaths, pathMap, ',');
  };

  module.removeVirtualClasspath = function (path) {
    domutil.removeFromAttributeValueList(virtualClasspath, path, ';');
  };

  module.getContextString = function () {
    return pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
  };

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
