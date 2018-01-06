'use strict';
const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:action');
const path = require('path');
const trace = require('debug')('generator-alfresco-trace:action');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

class ActionSubGenerator extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    super(args, opts);

    this.out.docs(
      'An Action is a discrete unit of work that can be invoked repeatedly. It can be invoked from a number of Alfresco features, such as Folder Rules, Workflows, Web Scripts, and Scheduled Jobs.',
      'http://docs.alfresco.com/5.1/references/dev-extension-points-actions.html');

    const defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

    this.prompts = [
      {
        type: 'input',
        name: 'name',
        option: { name: 'name', config: { alias: 'n', desc: 'Action name', type: String } },
        when: () => {
          this.out.docs('The action name will be used to construct the bean id and class name for the action.');
          return true;
        },
        message: 'What is the ' + chalk.yellow('name') + ' of your action?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'package',
        option: { name: 'package', config: { alias: 'p', desc: 'Java package for action class', type: String } },
        when: () => {
          this.out.docs('The java package that your action class must be placed into.');
          return true;
        },
        default: defPackage,
        message: 'What ' + chalk.yellow('java package') + ' should we use?',
        commonFilter: packageFilter,
        invalidMessage: 'Package is required and must be a valid java package',
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'description',
        option: { name: 'description', config: { alias: 'd', desc: 'Description for action', type: String } },
        message: 'What ' + chalk.yellow('description') + ' should we use?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
    debug('constructor finished');
  }

  prompting () {
    debug('prompting');
    return this.subgeneratorPrompt(this.prompts, props => {
      debug('starting done prompting function');
      this.props = props;

      // figure stuff out about our environment
      const targetModule = this.targetModule.module;
      const artifactId = targetModule.artifactId;
      const moduleRoot = this.destinationPath(targetModule.path);
      const msgRoot = this.sdk.repoConfigBase + '/alfresco/module/' + path.basename(targetModule.path) + '/messages';
      const genRoot = this.sdk.repoConfigBase + '/alfresco/module/' + path.basename(targetModule.path) + '/context/generated';

      // get information from prompts
      const actionTitle = props.name;
      const actionId = _.kebabCase(actionTitle);
      const className = _.upperFirst(_.camelCase(actionTitle)) + 'ActionExecuter';
      let packageName = props.package;
      if (!packageName.endsWith('.actions')) {
        packageName += '.actions';
      }
      const actionDescription = props.description;
      const templateContext = {
        actionDescription: actionDescription,
        actionId: actionId,
        actionTitle: actionTitle,
        artifactId: artifactId,
        className: className,
        packageName: packageName,
      };

      const classSrc = this.templatePath('ActionExecuter.java');
      const contextSrc = this.templatePath('action-context.xml');
      const messagesSrc = this.templatePath('action.properties');

      const packagePath = packageName.replace(/\./g, '/');
      const classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      const contextDst = path.join(moduleRoot, genRoot, 'action-' + actionId + '-context.xml');
      const messagesDst = path.join(moduleRoot, msgRoot, artifactId + '-' + actionId + '-action.properties');

      this.fs.copyTpl(classSrc, classDst, templateContext);
      this.fs.copyTpl(contextSrc, contextDst, templateContext);
      this.fs.copyTpl(messagesSrc, messagesDst, templateContext);

      debug('done prompting function finished');
    }).then(() => {
      debug('prompting finished');
    });
  }
};

function packageFilter (pkg) {
  if (!_.isString(pkg) || _.isEmpty(pkg)) return undefined;
  let output = pkg;
  // To begin with, if package is provided in path notation replace
  // slashes with dots also, treat spaces like path separators
  output = output.replace(/[/\s]/g, '.');
  // package should not start with any dots
  output = output.replace(/^\.*/, '');
  // package should not end with any dots
  output = output.replace(/\.*$/, '');
  // package should be all lower case
  output = output.toLocaleLowerCase();
  if (_.isEmpty(output)) return undefined;
  return output;
}

module.exports = ActionSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
