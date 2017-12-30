'use strict';
const debug = require('debug')('generator-alfresco:amp');
const filters = require('generator-alfresco-common').prompt_filters;
const SubGenerator = require('../subgenerator.js');

const ACTION_ADD_SOURCE_MODULE = 'Source module';
const ACTION_ADD_LOCAL_AMP = 'Local AMP';
const ACTION_ADD_LOCAL_JAR = 'Local JAR';
const ACTION_ADD_REMOTE_AMP = 'Remote AMP';
const ACTION_ADD_COMMON_AMP = 'Common AMP';

const ACTION_TYPES = [
  ACTION_ADD_SOURCE_MODULE,
  ACTION_ADD_LOCAL_AMP,
  ACTION_ADD_LOCAL_JAR,
  ACTION_ADD_REMOTE_AMP,
  ACTION_ADD_COMMON_AMP,
];

const ACTION_TYPE_CHOICES = {
  'module-add-source': ACTION_ADD_SOURCE_MODULE,
  'amp-add-local': ACTION_ADD_LOCAL_AMP,
  'jar-add-local': ACTION_ADD_LOCAL_JAR,
  'amp-add-remote': ACTION_ADD_REMOTE_AMP,
  'amp-add-common': ACTION_ADD_COMMON_AMP,
};

const NAMESPACE_SOURCE = 'alfresco:module-add-source';
const NAMESPACE_LOCAL_AMP = 'alfresco:amp-add-local';
const NAMESPACE_LOCAL_JAR = 'alfresco:jar-add-local';
const NAMESPACE_REMOTE = 'alfresco:amp-add-remote';
const NAMESPACE_COMMON = 'alfresco:amp-add-common';

const NAMESPACE_CHOICES = [
  {label: ACTION_ADD_SOURCE_MODULE, namespace: NAMESPACE_SOURCE},
  {label: ACTION_ADD_LOCAL_AMP, namespace: NAMESPACE_LOCAL_AMP},
  {label: ACTION_ADD_LOCAL_JAR, namespace: NAMESPACE_LOCAL_JAR},
  {label: ACTION_ADD_REMOTE_AMP, namespace: NAMESPACE_REMOTE},
  {label: ACTION_ADD_COMMON_AMP, namespace: NAMESPACE_COMMON},
];

class ModuleSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [
      {
        type: 'list',
        name: 'action',
        option: {
          name: 'action',
          config: {
            alias: 'A',
            desc: [
              'Module action to take:',
              'amp-add-source',
              'amp-add-local',
              'jar-add-local',
              'amp-add-remote',
              'amp-add-common',
            ].join(' '),
            type: String,
            choices: ACTION_TYPES,
          },
        },
        when: () => {
          this.out.docs('This generator will create/install amps into your project files:');
          this.out.definition(ACTION_ADD_SOURCE_MODULE, 'We\'ll create a new source code projects that you can add code/config to');
          this.out.definition(ACTION_ADD_LOCAL_AMP, 'Installs a jar file from ./customizations/modules/platform or ./customizations/modules/share into this project');
          this.out.definition(ACTION_ADD_LOCAL_JAR, 'Installs an amp file from ./customizations/amps or ./customizations/amps_share into this project');
          this.out.definition(ACTION_ADD_REMOTE_AMP, 'Installs an amp file from a reachable Maven repository into this project');
          this.out.definition(ACTION_ADD_COMMON_AMP, 'Offers to install common AMPs such as JavaScript Console and Support Tools');
          return true;
        },
        choices: ACTION_TYPES,
        message: 'Do you want to add source modules, a pre packaged AMP from your amps/amp_share folder, a pre packaged JAR from your modules folder, an AMP from a maven repository or a common community provided AMP?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory(ACTION_TYPE_CHOICES),
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
        if (props.action === subgenDesc.label) {
          debug('delegating to %s', subgenDesc.namespace);
          this.composeWith(subgenDesc.namespace, this.options);
        }
      });
    }).then(() => {
      debug('prompting finished');
    });
  }
};

module.exports = ModuleSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
