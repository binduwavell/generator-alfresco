'use strict';
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:model');
const path = require('path');
const trace = require('debug')('generator-alfresco-trace:model');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const modelFilters = require('./model-prompt-filters.js');
const SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

module.exports = class extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    super(args, opts);

    this.prompts = [
      {
        type: 'input',
        name: 'modelName',
        option: { name: 'model-name', config: { alias: 'n', desc: 'Model Name', type: String } },
        when: () => {
          this.out.docs(
            'The model name identifies the model.',
            'https://docs.alfresco.com/5.0/tasks/dev-extensions-content-models-tutorials-deploy-model.html');
          return true;
        },
        message: 'What ' + chalk.yellow('model name') + ' should we use?',
        commonFilter: modelFilters.modelNameFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'modelDescription',
        option: { name: 'model-description', config: { alias: 'd', desc: 'Model Description', type: String } },
        when: () => {
          this.out.docs(
            'The model description describes the model.',
            'https://docs.alfresco.com/5.0/tasks/dev-extensions-content-models-tutorials-deploy-model.html');
          return true;
        },
        message: 'What ' + chalk.yellow('model description') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'modelAuthor',
        option: { name: 'model-author', config: { alias: 'a', desc: 'Model Author', type: String } },
        when: () => {
          this.out.docs(
            'The model author is the creator of the model.',
            'https://docs.alfresco.com/5.0/tasks/dev-extensions-content-models-tutorials-deploy-model.html');
          return true;
        },
        message: 'What ' + chalk.yellow('model author') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'modelVersion',
        option: { name: 'model-version', config: { alias: 'v', desc: 'Model Version', type: String } },
        when: () => {
          this.out.docs(
            'The model version is the version of the model. It should be of format 1.0',
            'https://docs.alfresco.com/5.0/tasks/dev-extensions-content-models-tutorials-deploy-model.html');
          return true;
        },
        message: 'What ' + chalk.yellow('model version') + ' should we use?',
        invalidMessage: 'The ' + chalk.yellow('model version') + ' is required and should be in the format 1.0',
        commonFilter: modelFilters.versionNumberFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'namespaceUri',
        option: { name: 'namespace-uri', config: { alias: 'u', desc: 'Namespace URI', type: String } },
        when: () => {
          this.out.docs(
            'The model uri is needed for the model. It should be a url path',
            'https://docs.alfresco.com/5.0/tasks/dev-extensions-content-models-tutorials-deploy-model.html');
          return true;
        },
        default: readonlyProps => {
          const name = (readonlyProps.modelName || this.answerOverrides.modelName || '');
          const version = (readonlyProps.modelVersion || this.answerOverrides.modelVersion);
          this.defaultUri = 'http://www.' + name.toLowerCase() + '.com/model/content/' + version;
          return this.defaultUri;
        },
        message: 'What ' + chalk.yellow('model uri') + ' should we use?',
        invalidMessage: 'The ' + chalk.yellow('model uri') + ' is required and should have a valid URI format like: http://host/optional-path',
        commonFilter: modelFilters.requiredRegexFilterFactory("^(?:([a-z0-9+.-]+:\\/\\/)((?:(?:[a-z0-9-._~!$&'()*+,;=:]|%[0-9A-F]{2})*)@)?((?:[a-z0-9-._~!$&'()*+,;=]|%[0-9A-F]{2})*)(:(?:\\d*))?(\\/(?:[a-z0-9-._~!$&'()*+,;=:@\\/]|%[0-9A-F]{2})*)?|([a-z0-9+.-]+:)(\\/?(?:[a-z0-9-._~!$&'()*+,;=:@]|%[0-9A-F]{2})+(?:[a-z0-9-._~!$&'()*+,;=:@\\/]|%[0-9A-F]{2})*)?)(\\?(?:[a-z0-9-._~!$&'()*+,;=:\\/?@]|%[0-9A-F]{2})*)?(#(?:[a-z0-9-._~!$&'()*+,;=:\\/?@]|%[0-9A-F]{2})*)?$"),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'namespacePrefix',
        option: { name: 'namespace-prefix', config: { alias: 'p', desc: 'Namespace Prefix', type: String } },
        when: () => {
          this.out.docs(
            'The model prefix is needed for the model.',
            'https://docs.alfresco.com/5.0/tasks/dev-extensions-content-models-tutorials-deploy-model.html');
          return true;
        },
        message: 'What ' + chalk.yellow('model prefix') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },

    ];

    this.setupArgumentsAndOptions(this.prompts);
    debug('constructor finished');
  }

  prompting () {
    debug('model prompting');
    return this.subgeneratorPrompt(this.prompts, props => {
      debug('starting model prompting done function');
      this.props = props;
      const modelFileName = props.modelName + 'Model.xml';
      const messageFileName = props.modelName + 'Model.properties';
      const contextFileName = props.modelName + '-model-context.xml';

      const targetModule = this.targetModule.module;
      const modulePath = this.destinationPath(targetModule.path);
      const contextGenRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated';
      const modelGenRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/model/generated';
      const messageGenRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/messages/generated';
      const templateModelPath = this.templatePath('customModel.xml');
      const templateMessagePath = this.templatePath('customModel.properties');
      const templateContextPath = this.templatePath('custom-model-context.xml');
      const contextGenPath = path.join(modulePath, contextGenRoot, contextFileName);
      this.out.info('Generating context file in: ' + contextGenPath);
      debug('from %s to %s with context %j', templateContextPath, contextGenPath, props);
      this.fs.copyTpl(templateContextPath, contextGenPath, props);
      const modelGenPath = path.join(modulePath, modelGenRoot, modelFileName);
      this.out.info('Generating model file in: ' + modelGenPath);
      debug('from %s to %s with context %j', templateModelPath, modelGenPath, props);
      this.fs.copyTpl(templateModelPath, modelGenPath, props);
      const messageGenPath = path.join(modulePath, messageGenRoot, messageFileName);
      this.out.info('Generating message file in: ' + messageGenPath);
      debug('from %s to %s with context %j', templateMessagePath, messageGenPath, props);
      this.fs.copyTpl(templateMessagePath, messageGenPath, props);
      debug('completed model prompting done function');
    }).then(function () {
      debug('model prompting finished');
    });
  }
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
