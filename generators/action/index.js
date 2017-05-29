'use strict';
let _ = require('lodash');
let chalk = require('chalk');
let debug = require('debug')('generator-alfresco:action');
let path = require('path');
let trace = require('debug')('generator-alfresco-trace:action');
let constants = require('generator-alfresco-common').constants;
let filters = require('generator-alfresco-common').prompt_filters;
let SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

module.exports = class extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    super(args, opts);

    this.out.docs(
      'An Action is a discrete unit of work that can be invoked repeatedly. It can be invoked from a number of Alfresco features, such as Folder Rules, Workflows, Web Scripts, and Scheduled Jobs.',
      'http://docs.alfresco.com/5.1/references/dev-extension-points-actions.html');

    let defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

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
    return this.subgeneratorPrompt(this.prompts, function (props) {
      debug('starting done prompting function');
      this.props = props;

      // figure stuff out about our environment
      let targetModule = this.targetModule.module;
      let artifactId = targetModule.artifactId;
      let moduleRoot = this.destinationPath(targetModule.path);
      let msgRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/messages';
      let genRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated';

      // get information from prompts
      let actionTitle = props.name;
      let actionId = _.kebabCase(actionTitle);
      let className = _.upperFirst(_.camelCase(actionTitle)) + 'ActionExecuter';
      let packageName = props.package;
      if (!packageName.endsWith('.actions')) {
        packageName += '.actions';
      }
      let actionDescription = props.description;
      let templateContext = {
        actionDescription: actionDescription,
        actionId: actionId,
        actionTitle: actionTitle,
        artifactId: artifactId,
        className: className,
        packageName: packageName,
      };

      let classSrc = this.templatePath('ActionExecuter.java');
      let contextSrc = this.templatePath('action-context.xml');
      let messagesSrc = this.templatePath('action.properties');

      let packagePath = packageName.replace(/\./g, '/');
      let classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      let contextDst = path.join(moduleRoot, genRoot, 'action-' + actionId + '-context.xml');
      let messagesDst = path.join(moduleRoot, msgRoot, artifactId + '-' + actionId + '-action.properties');

      this.fs.copyTpl(classSrc, classDst, templateContext);
      this.fs.copyTpl(contextSrc, contextDst, templateContext);
      this.fs.copyTpl(messagesSrc, messagesDst, templateContext);

      debug('done prompting function finished');
    }).then(function () {
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

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
