'use strict';
let _ = require('lodash');
let chalk = require('chalk');
let debug = require('debug')('generator-alfresco:source-selecting-subgenerator');
let constants = require('generator-alfresco-common').constants;

let SubGenerator = require('./subgenerator.js');

/**
 * An extension of our regular subgenerator base class that
 * adds common code for propting for a source module to perform
 * the subgenerator actions upon.
 * A sub-class may force targeting of a specific war by adding
 * code like the following before calling "super" in the
 * constructor:
 *
 * arguments[1][constants.PROP_WAR] = constants.WAR_TYPE_SHARE;
 *
 */
module.exports = class extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    // Only source modules
    this.modules = this.modules.filter(function (mod) {
      return (mod.module.location === 'source');
    });
    // If a war target is passed in further restrict our list
    let targetWar = arguments[1][constants.PROP_WAR];
    if (targetWar) {
      this.modules = this.modules.filter(function (mod) {
        return (targetWar === mod.module.war);
      });
    }

    this.sourcePrompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: { name: 'module-path', config: { alias: 'm', desc: 'Project relative path to module root', type: String } },
        when: props => {
          let module;
          // Handle converting a module path provided from the command line into
          // a war type and a named module
          if (this.options['module-path']) {
            this.modules.forEach(mod => {
              if (this.options['module-path'] === mod.module.path) module = module || mod;
            });
          }
          if (module) {
            this.out.info('Using source module from command line: ' + chalk.reset.dim.cyan(module.name));
            props[constants.PROP_WAR] = module.module.war;
            this.targetModule = module;
            return false;
          }
          // Error out if there are no matching modules
          if (this.modules.length === 0) {
            this.out.error('No source modules available matching your criteria. Try creating a source module with ' + chalk.bold.green('"yo alfresco:amp"') + ' before using this sub-generator.');
            this.targetModule = true;
            this.bail = true;
            return false;
          }
          // If there is only one module we can select it without prompting
          if (this.modules.length === 1) {
            module = this.modules[0];
            this.out.info('Using only available source module: ' + chalk.reset.dim.cyan(module.name));
            props[constants.PROP_WAR] = module.module.war;
            this.targetModule = module;
            return false;
          }
          // If a target war is provided don't bother prompting for the war type
          if (targetWar) {
            props[constants.PROP_WAR] = targetWar;
            return false;
          }
          return true;
        },
        choices: [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE],
        message: 'Which type of source module would you like to add to?',
      },
      {
        type: 'list',
        name: 'targetModule',
        when: props => {
          if (this.targetModule) return false;
          // Reduce module options based on which war type was selected
          this.modules = this.modules
            .filter(function (mod) {
              return (props[constants.PROP_WAR] === mod.module.war);
            });
          // Error out if there are no matching modules
          if (this.modules.length === 0) {
            this.out.error('No source modules available matching your criteria. Try creating a source module with ' + chalk.bold.green('"yo alfresco:amp"') + ' before using this sub-generator.');
            this.bail = true;
            return false;
          }
          // If there is only one module we can select it without prompting
          if (this.modules.length === 1) {
            let module = this.modules[0];
            this.out.info('Using only available source module: ' + chalk.reset.dim.cyan(module.name));
            this.targetModule = module;
            return false;
          }
          return (!this.targetModule);
        },
        choices: props => {
          return this.modules
            .map(function (module) {
              return module.name;
            });
        },
        message: 'Which source module would you like to add to?',
        filter: input => {
          return this.modules.filter(function (module) {
            return (module.name === input);
          })[0];
        },
      },
    ];
  }

  setupArgumentsAndOptions (prompts) {
    let p = this.sourcePrompts.concat(prompts);
    SubGenerator.prototype.setupArgumentsAndOptions.call(this, p);
  }

  subgeneratorPrompt (prompts, desc, donePromptingFunc) {
    let p = this.sourcePrompts.concat(prompts);
    if (donePromptingFunc === undefined && _.isFunction(desc)) {
      debug('promoting second arg to donePromptingFunc');
      donePromptingFunc = desc;
      desc = undefined;
    }
    return SubGenerator.prototype.subgeneratorPrompt.call(this, p, desc, function (props) {
      if (this.targetModule === undefined && props.targetModule !== undefined) {
        debug('capturing targetModule from prompt response');
        this.targetModule = props.targetModule;
      }
      if (this.targetModule === undefined) {
        this.out.error('A source module must be specified');
        this.bail = true;
      }
      if (!this.bail && donePromptingFunc) {
        debug('calling done prompting function for module %s', this.targetModule.name);
        donePromptingFunc.call(this, props);
        debug('completed done prompting function');
      } else {
        debug('not calling user provided done prompting function');
      }
    });
  }
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
