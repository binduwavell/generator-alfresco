'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var constants = require('./app/constants.js');
var SubGenerator = require('./subgenerator.js');

/**
 * An extension of our regular subgenerator base class that
 * adds common code for propting for a source module to perform
 * the subgenerator actions upon.
 */
module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    this.modules = this.moduleRegistry.getNamedModules();
    
    this.sourcePrompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: {
          name: 'module-path',
          config: {
            desc: 'Project relative path to module root',
            alias:'m',
            type: 'String',
          }
        },
        when: function(props) {
          var module = undefined;
          if (this.options['module-path']) {
            this.modules.forEach(function(mod) {
              if (this.options['module-path'] === mod.module.path) module = module || mod; // first match
            }.bind(this));
          }
          if (module) {
            this.out.info('Using source module from command line: ' + chalk.reset.dim.cyan(module.name));
            props[constants.PROP_WAR] = module.module.war;
            props.targetModule = module;
            return false;
          }
          return true;
        }.bind(this),
        choices: [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE],
        message: 'Which type of module would you like to add a webscript to?',
      },
      {
        type: 'list',
        name: 'targetModule',
        when: function(props) {
          return (!props.targetModule);
        }.bind(this),
        choices: function(props) {
          return this.modules
            .filter(function(module) {
              return ('source' === module.module.location && props[constants.PROP_WAR] === module.module.war);
            })
            .map(function(module) {
              return module.name;
            })
        }.bind(this),
        message: 'Which source module would you like to add to?',
        filter: function(input) {
          return this.modules.filter(function(module) {
            return (module.name === input);
          })[0];
        }.bind(this),
      },
    ];
  },

  setupArgumentsAndOptions: function(prompts) {
    var p = _.concat(this.sourcePrompts, prompts);
    SubGenerator.prototype.setupArgumentsAndOptions.call(this, p);
  },

  subgeneratorPrompt: function(prompts, desc, donePromptingFunc) {
    var p = _.concat(this.sourcePrompts, prompts);
    SubGenerator.prototype.subgeneratorPrompt.call(this, p, desc, donePromptingFunc);
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
