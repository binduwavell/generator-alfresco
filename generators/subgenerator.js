'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var debug = require('debug')('generator-alfresco:subgenerator');
var path = require('path');
var yosay = require('yosay');
var constants = require('./common/constants.js');
var BaseGenerator = require('./base-generator.js');
var Promise = require('pinkie-promise');

/**
 * Makes sure the code is run in a project rather than being
 * run somewhere without a project context.
 *
 * Displays a default message
 */
module.exports = BaseGenerator.extend({
  constructor: function () {
    BaseGenerator.apply(this, arguments);
  },

  subgeneratorPrompt: function (prompts, desc, donePromptingFunc) {
    var subgeneratorName = path.basename(this.templatePath('..'));
    if (donePromptingFunc === undefined && _.isFunction(desc)) {
      debug('promoting second arg to donePromptingFunc and creating default description');
      donePromptingFunc = desc;
      desc = 'Adding ' + subgeneratorName + ' to ' + chalk.green(this.config.get(constants.PROP_PROJECT_ARTIFACT_ID)) + ' project!';
    }
    // ==== GUARD AGAINST SUB-GENERATOR BEING RUN STAND-ALONE ====
    var configJSON;
    try { configJSON = this.fs.readJSON('.yo-rc.json') } catch (err) { /* ignore */ }
    if (!configJSON || !configJSON['generator-alfresco']) {
      this.out.error('The ' + chalk.blue(subgeneratorName) + ' sub-generator must be run in a project created using ' + chalk.green('yo alfresco'));
      this.bail = true;
      return Promise.resolve();
    } else {
      if (desc) {
        this.log(yosay(desc));
      }

      debug('calling BaseGenerator.subgeneratorPrompt');
      return BaseGenerator.prototype.subgeneratorPrompt.call(this, prompts, desc, donePromptingFunc)
        .then(function () {
          debug('completed BaseGenerator.subgeneratorPrompt');
        });
    }
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
