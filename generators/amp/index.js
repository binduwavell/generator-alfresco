'use strict';
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:amp');
const filters = require('generator-alfresco-common').prompt_filters;
const SubGenerator = require('../subgenerator.js');

const AMP_TYPE_SOURCE = 'Source AMP';
const AMP_TYPE_LOCAL = 'Local AMP';
const AMP_TYPE_REMOTE = 'Remote AMP';
const AMP_TYPE_COMMON = 'Common AMP';
const AMP_TYPES = [AMP_TYPE_SOURCE, AMP_TYPE_LOCAL, AMP_TYPE_REMOTE, AMP_TYPE_COMMON];
const AMP_TYPE_CHOICES = {
  'source': AMP_TYPE_SOURCE,
  'local': AMP_TYPE_LOCAL,
  'remote': AMP_TYPE_REMOTE,
  'common': AMP_TYPE_COMMON,
};
const NAMESPACE_SOURCE = 'alfresco:amp-add-source';
const NAMESPACE_LOCAL = 'alfresco:amp-add-local';
const NAMESPACE_REMOTE = 'alfresco:amp-add-remote';
const NAMESPACE_COMMON = 'alfresco:amp-add-common';
const NAMESPACE_CHOICES = [
  {label: AMP_TYPE_SOURCE, namespace: NAMESPACE_SOURCE},
  {label: AMP_TYPE_LOCAL, namespace: NAMESPACE_LOCAL},
  {label: AMP_TYPE_REMOTE, namespace: NAMESPACE_REMOTE},
  {label: AMP_TYPE_COMMON, namespace: NAMESPACE_COMMON},
];

class AmpSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [
      {
        type: 'list',
        name: 'ampType',
        option: { name: 'amp-type', config: { alias: 'A', desc: 'Type of AMP: Source AMP, Local AMP, Remote AMP or Common AMP', type: String, choices: AMP_TYPES } },
        when: () => {
          this.out.docs('This generator will create/install amps into your project files:');
          this.out.definition(AMP_TYPE_SOURCE, 'We\'ll create a new source code projects that you can add code/config to');
          this.out.definition(AMP_TYPE_LOCAL, 'Installs an amp file from ./customizations/amps or ./customizations/amps_share into this project');
          this.out.definition(AMP_TYPE_REMOTE, 'Installs an amp file from a reachable Maven repository into this project');
          this.out.definition(AMP_TYPE_COMMON, 'Offers to install common amps such as JavaScript Console and Support Tools');
          return true;
        },
        choices: AMP_TYPES,
        message: 'Do you want to add source AMPs, a pre packaged AMP from your amps/amp_share folder, an AMP from a maven repository or a common community provided AMP?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory(AMP_TYPE_CHOICES),
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
    if (this.usingEnhancedAlfrescoMavenPlugin) {
      this.out.warn([
        'This sub-generator is deprecated, please use ',
        chalk.yellow('yo alfresco:module'),
        'instead.',
      ].join(' '));
      this.bail = true;
      return;
    }

    return this.subgeneratorPrompt(this.prompts, props => {
      NAMESPACE_CHOICES.forEach(subgenDesc => {
        if (props.ampType === subgenDesc.label) {
          debug('delegating to %s', subgenDesc.namespace);
          this.composeWith(subgenDesc.namespace, this.options);
        }
      });
    }).then(() => {
      debug('prompting finished');
    });
  }
};

module.exports = AmpSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
