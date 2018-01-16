'use strict';
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:surf-extension');
const path = require('path');
const trace = require('debug')('generator-alfresco-trace:surf-extension');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const surfExtensionFilters = require('./surf-extension-prompt-filters.js');
const SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

class SurfExtensionSubGenerator extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_SHARE;
    super(args, opts);

    this.prompts = [
      {
        type: 'input',
        name: 'surfExtensionName',
        option: { name: 'surf-extension-name', config: { alias: 'surfExtensionName', desc: 'Surf Extension Name', type: String } },
        when: () => {
          this.out.docs(
            'The surf extension name identifies the extension file containing surf modules.',
            'https://docs.alfresco.com/5.2/concepts/dev-extensions-share-surf-extension-modules-introduction.html');
          return true;
        },
        message: 'What ' + chalk.yellow('surf extension name') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'moduleId',
        option: { name: 'module-id', config: { alias: 'i', desc: 'Module ID', type: String } },
        when: () => {
          this.out.docs(
            'The module id identifies the module.',
            'https://docs.alfresco.com/5.2/concepts/dev-extensions-share-surf-extension-modules-introduction.html');
          return true;
        },
        message: 'What ' + chalk.yellow('module id') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'moduleDescription',
        option: { name: 'module-description', config: { alias: 'd', desc: 'Module Description', type: String } },
        when: () => {
          this.out.docs(
            'The module description describes the purpose of the module.');
          return true;
        },
        message: 'What ' + chalk.yellow('module description') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'moduleVersion',
        default: '1.0',
        option: { name: 'module-version', config: { alias: 'v', desc: 'Module Version', type: String } },
        when: () => {
          this.out.docs(
            'The module version is the version of the module. It should be of format 1.0.');
          return true;
        },
        message: 'What ' + chalk.yellow('module version') + ' should we use?',
        commonFilter: surfExtensionFilters.versionNumberFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'autoDeploy',
        option: { name: 'auto-deploy', config: { alias: 'a', desc: 'Auto Deploy', type: String } },
        when: () => {
          this.out.docs(
            'Auto deploy determines if the module is auto deployed upon startup. It should be true/false',
            'http://docs.alfresco.com/5.1/concepts/dev-extensions-share-module-autodeploy.html');
          return true;
        },
        message: 'What should ' + chalk.yellow('auto deploy') + ' be set to?',
        commonFilter: surfExtensionFilters.autoDeployFilter,
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
    debug('constructor finished');
  }

  prompting () {
    debug('surf extension prompting');
    return this.subgeneratorPrompt(this.prompts, props => {
      debug('starting surf extension prompting done function');
      this.props = props;
      const surfExtensionFileName = props.surfExtensionName + '-extension.xml';

      const targetModule = this.targetModule.module;
      const modulePath = this.destinationPath(targetModule.path);
      const surfExtensionGenRoot = this.sdk.repoConfigBase + '/alfresco/web-extension/site-data/extensions';
      const templateExtensionFilePath = this.templatePath('custom-extension.xml');
      const surfExtensionGenPath = path.join(modulePath, surfExtensionGenRoot, surfExtensionFileName);
      this.out.info('Generating surf extension file in: ' + surfExtensionGenPath);
      debug('from %s to %s with context %j', templateExtensionFilePath, surfExtensionGenPath, props);
      this.fs.copyTpl(templateExtensionFilePath, surfExtensionGenPath, props);
      debug('completed surf extension prompting done function');
    }).then(() => {
      debug('surf extension prompting finished');
    });
  }
};

module.exports = SurfExtensionSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
