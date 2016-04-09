'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var constants = require('./common/constants.js');
var SubGenerator = require('./subgenerator.js');

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
module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    // Only source modules
    this.modules = this.modules.filter(function (mod) {
      return (mod.module.location === 'source');
    });
    // If a war target is passed in further restrict our list
    var targetWar = arguments[1][constants.PROP_WAR];
    if (targetWar) {
      this.modules = this.modules.filter(function (mod) {
        return (targetWar === mod.module.war);
      });
    }

    this.sourcePrompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: { name: 'module-path', config: { alias: 'm', desc: 'Project relative path to module root', type: 'String' } },
        when: function (props) {
          var module;
          // Handle converting a module path provided from the command line into
          // a war type and a named module
          if (this.options['module-path']) {
            this.modules.forEach(function (mod) {
              if (this.options['module-path'] === mod.module.path) module = module || mod;
            }.bind(this));
          }
          if (module) {
            this.out.info('Using source module from command line: ' + chalk.reset.dim.cyan(module.name));
            props[constants.PROP_WAR] = module.module.war;
            props.targetModule = module;
            return false;
          }
          // Error out if there are no matching modules
          if (this.modules.length === 0) {
            this.out.error('No source modules available matching your criteria. Try creating a source module with ' + chalk.bold.green('"yo alfresco:amp"') + ' before using this sub-generator.');
            props.targetModule = true;
            this.bail = true;
            return false;
          }
          // If there is only one module we can select it without prompting
          if (this.modules.length === 1) {
            module = this.modules[0];
            this.out.info('Using only available source module: ' + chalk.reset.dim.cyan(module.name));
            props[constants.PROP_WAR] = module.module.war;
            props.targetModule = module;
            return false;
          }
          // If a target war is provided don't bother prompting for the war type
          if (targetWar) {
            props[constants.PROP_WAR] = targetWar;
            return false;
          }
          return true;
        }.bind(this),
        choices: [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE],
        message: 'Which type of source module would you like to add to?',
      },
      {
        type: 'list',
        name: 'targetModule',
        when: function (props) {
          if (props.targetModule) return false;
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
            var module = this.modules[0];
            this.out.info('Using only available source module: ' + chalk.reset.dim.cyan(module.name));
            props.targetModule = module;
            return false;
          }
          return (!props.targetModule);
        }.bind(this),
        choices: function (props) {
          return this.modules
            .map(function (module) {
              return module.name;
            });
        }.bind(this),
        message: 'Which source module would you like to add to?',
        filter: function (input) {
          return this.modules.filter(function (module) {
            return (module.name === input);
          })[0];
        }.bind(this),
      },
    ];
  },

  setupArgumentsAndOptions: function (prompts) {
    var p = _.concat(this.sourcePrompts, prompts);
    SubGenerator.prototype.setupArgumentsAndOptions.call(this, p);
  },

  subgeneratorPrompt: function (prompts, desc, donePromptingFunc) {
    var p = _.concat(this.sourcePrompts, prompts);
    SubGenerator.prototype.subgeneratorPrompt.call(this, p, desc, donePromptingFunc);
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
