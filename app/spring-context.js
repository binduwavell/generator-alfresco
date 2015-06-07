'use strict';
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');

/*
 * Given a context file that at least has a root <beans> element, this module
 * will help us to make assertions and even edits to the file.
 *
 * Usage:
 * ... inside generator code
 * this.out = require('./spring-context.js')(text-of-context-file);
 */

module.exports = function(contextString) {
  var module = {};

  var doc = new xmldom.DOMParser().parseFromString(contextString, 'text/xml');
  var beans = doc.documentElement;

  var _getImports = function() {
    return beans.getElementsByTagName('import');
  }

  module.hasImport = function(resource) {
    var imports = _getImports();
    var len = imports.length;
    for (var i = 0; i < len; i++) {
      if (imports[i].getAttribute('resource') === resource) {
        return true;
      }
    }
    return false;
  }

  module.addImport = function(resource) {
    var imp = doc.createElement('import');
    imp.setAttribute('resource', resource);

    // beans.appendChild(imp);
    var imports = _getImports();
    if (imports && imports.length > 0) {
      var lastImport = imports[imports.length - 1];
      if (lastImport.nextSibiling) {
        beans.insertBefore(imp, lastImport.nextSibiling);
      } else {
        beans.appendChild(imp);
      }
    } else {
      if (beans.hasChildNodes()) {
        beans.insertBefore(imp, beans.firstChild);
      } else {
        beans.appendChild(imp);
      }
    }
  }

  module.getContextString = function() {
    return pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
  }

  return module;
}
