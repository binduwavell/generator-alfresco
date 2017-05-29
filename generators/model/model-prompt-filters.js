'use strict';
const _ = require('lodash');

module.exports = {

  alphaLowerCaseFilter: function (name) {
    if (!_.isString(name) || _.isEmpty(name)) return undefined;
    let retv;
    retv = name.replace(/[^A-Za-z]/g, '');
    if (retv === '') return undefined;
    return _.toLower(retv);
  },

  alphaCamelCaseFilter: function (name) {
    if (!_.isString(name) || _.isEmpty(name)) return undefined;
    name = _.camelCase(name);
    let retv;
    retv = name.replace(/[^A-Za-z]/g, '');
    if (retv === '') return undefined;
    return retv;
  },

  modelNameFilter: function (name) {
    let retv = module.exports.alphaCamelCaseFilter(name);
    if (undefined === retv) return undefined;
    // If the name ends with model, remove it
    if (retv.match(/.model$/i)) {
      retv = retv.replace(/model$/i, '');
    }
    return retv;
  },

  requiredRegexFilter: function (input, regex) {
    if (_.isNumber(input)) {
      input = '' + input;
    }
    if (!_.isString(input) || _.isEmpty(input)) return undefined;
    const re = new RegExp(regex);
    const valid = re.test(input);
    return (valid ? input : undefined);
  },

  requiredRegexFilterFactory: function (regex) {
    return input => {
      return module.exports.requiredRegexFilter(input, regex);
    };
  },

  versionNumberFilter: function (input) {
    if (_.isNumber(input)) {
      input = '' + input;
      if (input.indexOf('.') === -1) {
        input += '.0';
      }
    }
    return module.exports.requiredRegexFilter(input, '^\\d+\\.\\d+$');
  },

};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
