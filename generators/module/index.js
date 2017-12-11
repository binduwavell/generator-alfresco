'use strict';
const debug = require('debug')('generator-alfresco:module');
const filters = require('generator-alfresco-common').prompt_filters;
const SubGenerator = require('../subgenerator.js');

const MODULE_TYPE_SOURCE = 'Source module';
const MODULE_TYPE_LOCAL = 'Local module';
const MODULE_TYPES = [MODULE_TYPE_SOURCE, MODULE_TYPE_LOCAL];
const MODULE_TYPE_CHOICES = {
  'source': MODULE_TYPE_SOURCE,
  'local': MODULE_TYPE_LOCAL,
};
const NAMESPACE_SOURCE = 'alfresco:module-add-source';
const NAMESPACE_LOCAL = 'alfresco:module-add-local';
const NAMESPACE_CHOICES = [
  {label: MODULE_TYPE_SOURCE, namespace: NAMESPACE_SOURCE},
  {label: MODULE_TYPE_LOCAL, namespace: NAMESPACE_LOCAL},
];

class JarSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [
      {
        type: 'list',
        name: 'moduleType',
        option: { name: 'module-type', config: { alias: 'M', desc: 'Type of module: Source module or Local module', type: String, choices: MODULE_TYPES } },
        when: () => {
          this.out.docs('This generator will create/install modules into your project files:');
          this.out.definition(MODULE_TYPE_SOURCE, 'We\'ll create a new source code projects that you can add code/config to');
          this.out.definition(MODULE_TYPE_LOCAL, 'Installs a JAR file from ./customizations/modules/platform or ./customizations/modules/share into this project');
          return true;
        },
        choices: MODULE_TYPES,
        message: 'Do you want to add source modules or a pre-existing JARs to your project?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory(MODULE_TYPE_CHOICES),
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  }

  help () {
    const Generator = require('yeoman-generator');
    const helpArray = [Generator.prototype.help.apply(this)];
    NAMESPACE_CHOICES.forEach(subgenDesc => {
      helpArray.push('\n' + subgenDesc.label + ' Options:');
      const subgen = this.env.create(subgenDesc.namespace);
      ['help', 'skip-cache', 'skip-install'].forEach(op => {
        subgen._options[op].hide = true;
      });
      helpArray.push(Generator.prototype.optionsHelp.apply(subgen));
    });
    return helpArray.join('\n');
  }

  prompting () {
    return this.subgeneratorPrompt(this.prompts, props => {
      NAMESPACE_CHOICES.forEach(subgenDesc => {
        if (props.moduleType === subgenDesc.label) {
          debug('delegating to %s', subgenDesc.namespace);
          this.composeWith(subgenDesc.namespace, this.options);
        }
      });
    }).then(() => {
      debug('prompting finished');
    });
  }
};

module.exports = JarSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
