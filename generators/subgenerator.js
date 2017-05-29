'use strict';
let _ = require('lodash');
let chalk = require('chalk');
let debug = require('debug')('generator-alfresco:subgenerator');
let path = require('path');
let yosay = require('yosay');
let constants = require('generator-alfresco-common').constants;

let BaseGenerator = require('./base-generator.js');

/**
 * Makes sure the code is run in a project rather than being
 * run somewhere without a project context.
 *
 * Displays a default message
 */
module.exports = class extends BaseGenerator {
  subgeneratorPrompt (prompts, desc, donePromptingFunc) {
    let subgeneratorName = path.basename(this.templatePath('..'));
    if (donePromptingFunc === undefined && _.isFunction(desc)) {
      debug('promoting second arg to donePromptingFunc and creating default description');
      donePromptingFunc = desc;
      desc = 'Adding ' + subgeneratorName + ' to ' + chalk.green(this.config.get(constants.PROP_PROJECT_ARTIFACT_ID)) + ' project!';
    }
    // ==== GUARD AGAINST SUB-GENERATOR BEING RUN STAND-ALONE ====
    let configJSON;
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
  }
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
