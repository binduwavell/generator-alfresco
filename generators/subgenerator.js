'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var process = require('process');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var constants = require('./app/constants.js');

/**
 * Base class for a yeoman sub-generator in the generator-alfresco project.
 * This class provides some common things like the bail flag, our output
 * handling module, the SDK version for the main project and the module
 * registry.
 *
 * In contrast to a regular sub/generator we expect the prompts to be
 * defined in the constructor. For the setupArgumentsAndOptions method to
 * be called in the constructor (if you want option or argument handling)
 * and for the prompting to use this.subgeneratorPrompt() instead of
 * this.prompt() in the prompting lifecycle function.
 *
 * You may add an argument and/or option property to each prompt
 * definitions. The setupArgumentsAndOptions function pulls these out
 * and registers them appropriately. The value for each of these
 * properties is { name: 'name', config: { } }. The name is passed as
 * the first argument to this.argument()/this.option() respectively
 * and the config object is passed as the second argument.
 */
module.exports = yeoman.Base.extend({
  constructor: function () {

    yeoman.Base.apply(this, arguments);

    this.bail = false;
    this.out = require('./app/app-output.js')(this);
    this.sdkVersions = require('./app/sdk-versions.js');
    this.sdk = this.sdkVersions[this.config.get('sdkVersion')];
    this.moduleRegistry = require('./app/alfresco-module-registry.js')(this);
    this.modules = this.moduleRegistry.getNamedModules();
    this.moduleManager = require('./app/alfresco-module-manager.js')(this);
  },

  setupArgumentsAndOptions: function(prompts) {
    prompts.forEach(function(prompt) {
      if (prompt.hasOwnProperty('argument')) {
        this.argument(prompt.argument.name, prompt.argument.config);
      }
      if (prompt.hasOwnProperty('option')) {
        this.option(prompt.option.name, prompt.option.config);
      }
    }.bind(this));
  },

  subgeneratorPrompt: function(prompts, desc, donePromptingFunc) {
    var subgeneratorName = path.basename(this.templatePath('..'));
    if (undefined == donePromptingFunc && _.isFunction(desc)) {
      donePromptingFunc = desc;
      desc = 'Adding ' + subgeneratorName + ' to ' + chalk.green(this.config.get(constants.PROP_PROJECT_ARTIFACT_ID)) + ' project!';
    }
    // ==== GUARD AGAINST SUB-GENERATOR BEING RUN STAND-ALONE ====
    try { var configJSON = this.fs.readJSON('.yo-rc.json'); } catch (err) { /* ignore */ }
    if(!configJSON || !configJSON['generator-alfresco']) {
      this.out.error('The ' + chalk.blue(subgeneratorName) + ' sub-generator must be run in a project created using ' + chalk.green('yo alfresco'));
      this.bail = true;
    } else {
      if (desc) {
        this.log(yosay(desc));
      }

      var donePrompting = this.async();
      /**
       * If a prompt defines a property named commonFilter with a function for the value,
       * we'll use that for the filter parameter. If an option is defined, we'll also use
       * the commonFilter in the when function to skip the prompt if the option is provided
       * and valid. Finally, if there is no validate function, we'll produce one. A
       * invalidMessage property may be specified. If commonFilter for our input returns
       * undefined we'll use invalidMessage to control the error reported to the user if
       * it is provided. invalidMessage may be a string or a function that takes the user
       * input as the only argument. If invalidMessage is not provided then a basic
       * message will be generated.
       */
      var self = this;
      var processedPrompts = prompts.map(function(prompt) {
        if (prompt.hasOwnProperty('commonFilter') && _.isFunction(prompt.commonFilter)) {
          var newPrompt = _.assign({}, prompt);
          if (!prompt.hasOwnProperty('filter')) {
            newPrompt.filter = prompt.commonFilter;
          }
          if (prompt.hasOwnProperty('option') && prompt.option.hasOwnProperty('name') && prompt.hasOwnProperty('name')) {
            var oldWhen = prompt.when;
            newPrompt.when = function(props) {
              var v = prompt.commonFilter.call(self, self.options[prompt.option.name]);
              if (undefined !== v) {
                props[prompt.name] = v;
                self.out.info('Value for ' + prompt.option.name + ' set from command line: ' + chalk.reset.dim.cyan(v));
                return false;
              }
              if (_.isBoolean(oldWhen)) {
                return oldWhen;
              }
              if (_.isFunction(oldWhen)) {
                return oldWhen.call(self, props);
              }
              return true;
            }.bind(self);
          }
          if(!prompt.hasOwnProperty('validate') && prompt.hasOwnProperty('name')) {
            newPrompt.validate = function(input) {
              var msg = 'The ' + chalk.yellow(prompt.name) + ' value is invalid';
              if (prompt.hasOwnProperty('invalidMessage')) {
                if (_.isFunction(prompt.invalidMessage)) {
                  msg = prompt.invalidMessage.call(self, input);
                }
                if (_.isString(prompt.invalidMessage)) {
                  msg = prompt.invalidMessage;
                }
              }
              return (undefined !== prompt.commonFilter.call(self, input) ? true : msg);
            }.bind(self);
          }
          return newPrompt;
        } else {
          return prompt;
        }
      });
      this.prompt(processedPrompts, function (props) {
        if (donePromptingFunc) {
          donePromptingFunc.call(this, props);
        }
        donePrompting();
      }.bind(this));
    }
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
