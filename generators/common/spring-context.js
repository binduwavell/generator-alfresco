'use strict';
var pd = require('pretty-data').pd;
var xmldom = require('xmldom');
var domutil = require('./xml-dom-utils.js');

/*
 * Given a context file that at least has a root <beans> element, this module
 * will help us to make assertions and even edits to the file.
 *
 * Usage:
 * ... inside generator code
 * this.out = require('./spring-context.js')(text-of-context-file);
 */

module.exports = function (contextString) {
  var module = {};

  var defaultContextString = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!--',
    '        Licensed to the Apache Software Foundation (ASF) under one or more',
    '        The ASF licenses this file to You under the Apache License, Version 2.0',
    '        (the "License"); you may not use this file except in compliance with',
    '        the License.  You may obtain a copy of the License at',
    '',
    '        http://www.apache.org/licenses/LICENSE-2.0',
    '',
    '        Unless required by applicable law or agreed to in writing, software',
    '        distributed under the License is distributed on an "AS IS" BASIS,',
    '        WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.',
    '        See the License for the specific language governing permissions and',
    '        limitations under the License.',
    '',
    '-->',
    '<!DOCTYPE beans PUBLIC "-//SPRING//DTD BEAN//EN" "http://www.springframework.org/dtd/spring-beans.dtd">',
    '<beans>',
    '</beans>',
  ].join('\n');

  var doc = domutil.parseFromString(contextString || defaultContextString);
  var beans = doc.documentElement;

  var _getImports = function () {
    return beans.getElementsByTagName('import');
  };

  module.hasImport = function (resource) {
    var imports = _getImports();
    var len = imports.length;
    for (var i = 0; i < len; i++) {
      if (imports[i].getAttribute('resource') === resource) {
        return true;
      }
    }
    return false;
  };

  module.addImport = function (resource) {
    var imp = doc.createElement('import');
    imp.setAttribute('resource', resource);

    // beans.appendChild(imp);
    var imports = _getImports();
    if (imports && imports.length > 0) {
      var lastImport = imports[imports.length - 1];
      var nextElementSibling = domutil.getNextElementSibling(lastImport);
      if (nextElementSibling) {
        beans.insertBefore(imp, nextElementSibling);
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
  };

  module.removeImport = function (resource) {
    var imports = _getImports();
    if (imports && imports.length > 0) {
      var len = imports.length;
      for (var i = 0; i < len; i++) {
        var imp = imports[i];
        var res = imp.getAttribute('resource');
        if (res === resource) {
          imp.parentNode.removeChild(imp);
          return imp;
        }
      }
    }
  };

  module.getContextString = function () {
    return pd.xml(new xmldom.XMLSerializer().serializeToString(doc));
  };

  return module;
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
