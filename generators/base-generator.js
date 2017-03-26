'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var debug = require('debug')('generator-alfresco:base-generator');

var Generator = require('yeoman-generator');

/**
 * Base class for a yeoman generator in the generator-alfresco project. This
 * class provides some common things like the our output handling module,
 * the SDK version for the main project and the module registry and manager.
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
module.exports = Generator.extend({
  constructor: function () {
    Generator.apply(this, arguments);

    this.bail = false;
    this.out = require('generator-alfresco-common').generator_output(this);
    this.sdkVersions = require('./common/sdk-versions.js');
    this.sdk = this.sdkVersions[this.config.get('sdkVersion')];
    this.moduleRegistry = this.options._moduleRegistry || require('generator-alfresco-common').alfresco_module_registry(this);
    this.modules = this.options._modules || this.moduleRegistry.getNamedModules();
    this.moduleManager = this.options._moduleManager || require('./common/alfresco-module-manager.js')(this);
    this.answerOverrides = {};
  },

  setupArgumentsAndOptions: function (prompts) {
    prompts.forEach(function (prompt) {
      if (prompt.hasOwnProperty('argument')) {
        debug('Adding argument %s with config %j', prompt.argument.name, prompt.argument.config);
        this.argument(prompt.argument.name, prompt.argument.config);
      }
      if (prompt.hasOwnProperty('option')) {
        debug('Adding option %s with config %j', prompt.option.name, prompt.option.config);
        this.option(prompt.option.name, prompt.option.config);
      }
    }.bind(this));
  },

  subgeneratorPrompt: function (prompts, desc, donePromptingFunc) {
    // ==== PROMPT EXTENSIONS ====
    this.processedPrompts = prompts.map(function (prompt) {
      var newPrompt = _.assign({}, prompt);
      var oldWhen = prompt.when;
      newPrompt.when = function (props) {
        debug('Synthetic when() logic');
        if (this.bail) return false;
        if (prompt.hasOwnProperty('commonFilter') && _.isFunction(prompt.commonFilter)
          && prompt.hasOwnProperty('name') && (
            (prompt.hasOwnProperty('option') && prompt.option.hasOwnProperty('name'))
            || (prompt.hasOwnProperty('argument') && prompt.argument.hasOwnProperty('name'))
          )
        ) {
          var cliName;
          var cliValue;
          if (prompt.hasOwnProperty('option') && prompt.option.hasOwnProperty('name')) {
            cliName = prompt.option.name;
            cliValue = this.options[prompt.option.name];
            debug('Calling commonFilter(%s) for option: %s', cliValue, cliName);
          } else {
            cliName = prompt.argument.name;
            cliValue = this.options[prompt.argument.name];
            debug('Calling commonFilter(%s) for argument: %s', cliValue, cliName);
          }
          var v = prompt.commonFilter.call(this, cliValue);
          if (undefined !== v) {
            this.answerOverrides[prompt.name] = v;
            this.out.info('Value for ' + cliName + ' set from command line: ' + chalk.reset.dim.cyan(v));
            return false;
          }
        }
        if (_.isBoolean(oldWhen)) {
          debug('Returning when=%s via value provided in prompt %s', oldWhen, prompt.name);
          return oldWhen;
        }
        if (_.isFunction(oldWhen)) {
          var retv = oldWhen.call(this, props);
          debug('Returning when(%s)=%s via function provided in prompt: %s', JSON.stringify(props), retv, prompt.name);
          return retv;
        }
        return true;
      }.bind(this);
      if (prompt.hasOwnProperty('commonFilter') && _.isFunction(prompt.commonFilter)) {
        if (!prompt.hasOwnProperty('filter')) {
          newPrompt.filter = function (input) {
            debug('Using commonFilter(%s) for filter', input);
            return prompt.commonFilter.call(this, input);
          }.bind(this);
        }
        if (!prompt.hasOwnProperty('validate') && prompt.hasOwnProperty('name')) {
          newPrompt.validate = function (input) {
            debug('Using commonFilter(%s) for validate', input);
            var required = prompt.valueRequired;
            var msg = 'The ' + (required ? 'required ' : '') + chalk.yellow(prompt.name) + ' value '
              + (required ? 'is missing or invalid' : 'is invalid');
            if (prompt.hasOwnProperty('invalidMessage')) {
              if (_.isFunction(prompt.invalidMessage)) {
                msg = prompt.invalidMessage.call(this, input);
              }
              if (_.isString(prompt.invalidMessage)) {
                msg = prompt.invalidMessage;
              }
            }
            return (prompt.commonFilter.call(this, input) !== undefined ? true : msg);
          }.bind(this);
        }
      }
      return newPrompt;
    }.bind(this));

    // ==== NOW DO THE ACTUAL PROMPTING ====
    return this.prompt(this.processedPrompts).then(function (props) {
      if (!this.bail) {
        var combinedProps = {};
        _.assign(combinedProps, this.answerOverrides);
        _.assign(combinedProps, props);
        this.processedPrompts.forEach(function (promptItem) {
          var name = promptItem.name;
          var required = promptItem.valueRequired;
          if (name && required) {
            debug('Required check for %s which is %s and has value %s', name, (required ? 'required' : 'not required'), combinedProps[name]);
            if (undefined === combinedProps[name]) {
              this.out.error('At least one required properties not set: ' + name);
              this.bail = true;
            }
          }
        }.bind(this));
      }
      if (!this.bail && donePromptingFunc) {
        debug('calling user supplied done prompting function');
        donePromptingFunc.call(this, combinedProps);
        debug('completed user supplied done prompting function');
      }
    }.bind(this));
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
