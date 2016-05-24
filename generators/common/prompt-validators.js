'use strict';
var _ = require('lodash');
var constants = require('./constants.js');
var debug = require('debug')('generator-alfresco:prompt-validators');

/**
 * These validators are used to check the validity of the user input.
 * We return a error message string when the input is invalid.
 * If the input is valid, we return true
 */

module.exports = {

  /**
   * Given some input text and a array of validators,
   * we sequentially pass the input to all validators unless it fails.
   * Example: validators.sequentialValidatorFactory([validators.testValidator
   *                            , validators.uniqueSourceAmpModuleValidator]),
   *
   * @param validatorArray
   * @returns function
   */
  sequentialValidatorFactory: function (validatorArray) {
    return function (input) {
      return _.isEmpty(validatorArray) ? undefined : validatorArray.reduce(function (previousValue, validator) {
        return (previousValue === true) ? validator.call(this, input) : previousValue;
      }.bind(this), true);
    };
  },

  uniqueSourceAmpModuleValidator: function (input, moduleRegistry) {
    debug('uniqueSourceAmpModuleValidator(%s)', input);
    if (_.isEmpty(input)) return 'Artifact Id cannot be empty';
    var modules = moduleRegistry.getNamedModules();
    var updatedmodules = modules.filter(function (mod) {
      return [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE].some(function (war) {
        return (input + '-' + war + '-amp') === mod.module.artifactId;
      });
    });
    if (!_.isEmpty(updatedmodules) && _.size(updatedmodules) > 0) {
      return 'Duplicate artifact Id specified';
    }
    return true;
  },

  uniqueSourceAmpModuleValidatorFactory: function (moduleRegistry) {
    return function (input) {
      return module.exports.uniqueSourceAmpModuleValidator(input, moduleRegistry);
    };
  },
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
