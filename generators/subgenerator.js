'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var debug = require('debug')('generator-alfresco:subgenerator');
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var constants = require('./app/constants.js');

/**
 * Base class for a yeoman sub-generator in the generator-alfresco project. This
 * class provides some common things like the bail flag, our output handling
 * module, the SDK version for the main project and the module registry and
 * manager.
 *
 * We will create / wrap a when function in order to perform bail checking.
 *
 * In contrast to a regular sub/generator we expect the prompts to be defined in
 * the constructor. For the setupArgumentsAndOptions method to be called in the
 * constructor (if you want option or argument handling) and for the prompting to
 * use this.subgeneratorPrompt() instead of this.prompt() in the prompting
 * lifecycle function.
 *
 * You may add argument and/or option properties to each prompt definitions. The
 * setupArgumentsAndOptions function pulls these out and registers them
 * appropriately. The value for each of these properties is { name: 'name',
 * config: { } }. The name is passed as * the first argument to this.argument()/
 * this.option() respectively and the config object is passed as the second
 * argument.
 *
 * If a prompt defines a property named commonFilter with a function for the value
 * and no filter property is defined explicitly, we'll use the commonFilter value
 * to create the filter property.
 *
 * If the option property is specified, we'll create a when function that uses the
 * commonFilter function to skip the prompt if the option is provided and valid.
 *
 * If there is no validate property specified, we'll produce one using the
 * commonFilter. An optinal invalidMessage property may be specified to control
 * how the generated validate function reports invalid input. The invalidMessage
 * property may be a string or a function that takes the user input as the only
 * argument. If invalidMessage is not provided then a basic message will be
 * generated.
 *
 * A new valueRequired boolean property may be specified in a prompt. This will
 * be used to inject a check in our generated prompt completion function prior
 * to calling the user supplied donePromptingFunc in subGeneratorPrompt. The
 * reason we do this has to do with how yeoman tests work with options and
 * prompts. Specifically we can't expect the same set of prompt functions
 * around validation and filtering to be called for the tests. As such if we
 * have any required inputs a test may attempt to run without required data
 * unless we have this check.
 *
 * IN THE FUTURE, we may be able to use valueRequired to create a batch mode
 * where optional items don't need to be specified when using arguments /
 * options to streamline completely command line driven usage. FUTURE
 *
 * In order to reduce boilerplate, each function we create will be bound to this
 * yeoman generator instance automatically.
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

      // ==== PROMPT EXTENSIONS ====
      var processedPrompts = prompts.map(function(prompt) {
        var newPrompt = _.assign({}, prompt);
        var oldWhen = prompt.when;
        newPrompt.when = function(props) {
          if (this.bail) return false;
          if (
            prompt.hasOwnProperty('commonFilter') &&
            _.isFunction(prompt.commonFilter) &&
            prompt.hasOwnProperty('option') &&
            prompt.option.hasOwnProperty('name') &&
            prompt.hasOwnProperty('name'))
          {
            var v = prompt.commonFilter.call(this, this.options[prompt.option.name]);
            if (undefined !== v) {
              props[prompt.name] = v;
              this.out.info('Value for ' + prompt.option.name + ' set from command line: ' + chalk.reset.dim.cyan(v));
              return false;
            }
          }
          if (_.isBoolean(oldWhen)) {
            return oldWhen;
          }
          if (_.isFunction(oldWhen)) {
            return oldWhen.call(this, props);
          }
          return true;
        }.bind(this);
        if (prompt.hasOwnProperty('commonFilter') && _.isFunction(prompt.commonFilter)) {
          if (!prompt.hasOwnProperty('filter')) {
            newPrompt.filter = prompt.commonFilter;
          }
          if(!prompt.hasOwnProperty('validate') && prompt.hasOwnProperty('name')) {
            newPrompt.validate = function(input) {
              var required = prompt.valueRequired;
              var msg = 'The ' + (required ? 'required ' : '') + chalk.yellow(prompt.name) + ' value ' +
                (required ? 'is missing or invalid' : 'is invalid');
              if (prompt.hasOwnProperty('invalidMessage')) {
                if (_.isFunction(prompt.invalidMessage)) {
                  msg = prompt.invalidMessage.call(this, input);
                }
                if (_.isString(prompt.invalidMessage)) {
                  msg = prompt.invalidMessage;
                }
              }
              return (undefined !== prompt.commonFilter.call(this, input) ? true : msg);
            }.bind(this);
          }
        }
        return newPrompt;
      }.bind(this));

      // ==== NOW DO THE ACTUAL PROMPTING ====
      var donePrompting = this.async();
      this.prompt(processedPrompts, function (props) {
        processedPrompts.forEach(function(promptItem) {
          var name = promptItem.name;
          var required = promptItem.valueRequired;
          if (name && required) {
            debug('Required check for %s which is %s and has value %s', name, (required ? 'required' : 'not required'), props[name]);
            if (undefined === props[name]) {
              this.out.error('At least one required properties not set: ' + name);
              this.bail = true;
            }
          }
        }.bind(this));
        if (!this.bail && donePromptingFunc) {
          debug('calling user supplied done prompting function');
          donePromptingFunc.call(this, props);
        }
        donePrompting();
      }.bind(this));
    }
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
