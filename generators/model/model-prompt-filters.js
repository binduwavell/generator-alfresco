'use strict';
var _ = require('lodash');

module.exports = {

  alphaLowerCaseFilter:function(name) {
    if (!_.isString(name) || _.isEmpty(name)) return undefined;
    var retv = undefined;
    retv = name.replace(/[^A-Za-z]/g, '');
    if ('' === retv) return undefined;
    return _.toLower(retv);
  },

  modelNameFilter:function(name) {
    var retv = module.exports.alphaLowerCaseFilter(name);
    if (undefined === retv) return undefined;
    // If the name ends with model, remove it
    if (retv.match(/.model$/)) {
      retv = retv.replace(/model$/, '');
    }
    return retv;
  },

  requiredRegexFilter:function(input, regex) {
    if (_.isNumber(input)) {
      input = '' + input;
    }
    if (!_.isString(input) || _.isEmpty(input)) return undefined;
    var re = new RegExp(regex);
    var valid = re.test(input) ;
    return (valid ? input : undefined);
  },

  requiredRegexFilterFactory:function(regex) {
    return function(input) {
      return module.exports.requiredRegexFilter(input, regex);
    }
  },

  versionNumberFilter:function(input) {
    if (_.isNumber(input)) {
      input = ''+input;
      if (input.indexOf('.') === -1) {
        input += '.0';
      }
    }
    return module.exports.requiredRegexFilter(input, '^\\d+\\.\\d+$');
  },

};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
