'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var debug = require('debug')('generator-alfresco:action');
var path = require('path');
var constants = require('../common/constants.js');
var filters = require('../common/prompt-filters.js');
var SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

module.exports = SourceSelectingSubGenerator.extend({
  constructor: function () {
    debug('constructor');
    arguments[1][constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    SourceSelectingSubGenerator.apply(this, arguments);

    this.out.docs(
      'An Action is a discrete unit of work that can be invoked repeatedly. It can be invoked from a number of Alfresco features, such as Folder Rules, Workflows, Web Scripts, and Scheduled Jobs.',
      'http://docs.alfresco.com/5.1/references/dev-extension-points-actions.html');

    var defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

    this.prompts = [
      {
        type: 'input',
        name: 'name',
        option: { name: 'name', config: { alias: 'n', desc: 'Action name', type: 'String' } },
        when: function (readonlyProps) {
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
        option: { name: 'package', config: { alias: 'p', desc: 'Java package for action class', type: 'String' } },
        when: function (readonlyProps) {
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
        option: { name: 'description', config: { alias: 'd', desc: 'Description for action', type: 'String' } },
        message: 'What ' + chalk.yellow('description') + ' should we use?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
    debug('constructor finished');
  },

  prompting: function () {
    debug('prompting');
    return this.subgeneratorPrompt(this.prompts, function (props) {
      debug('starting done prompting function');
      this.props = props;

      // figure stuff out about our environment
      var targetModule = this.targetModule.module;
      var artifactId = targetModule.artifactId;
      var moduleRoot = this.destinationPath(targetModule.path);
      var msgRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/messages';
      var genRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated';

      // get information from prompts
      var actionTitle = props.name;
      var actionId = _.kebabCase(actionTitle);
      var className = _.upperFirst(_.camelCase(actionTitle)) + 'ActionExecuter';
      var packageName = props.package;
      if (!_.endsWith(packageName, '.actions')) {
        packageName += '.actions';
      }
      var actionDescription = props.description;
      var templateContext = {
        actionDescription: actionDescription,
        actionId: actionId,
        actionTitle: actionTitle,
        artifactId: artifactId,
        className: className,
        packageName: packageName,
      };

      var classSrc = this.templatePath('ActionExecuter.java');
      var contextSrc = this.templatePath('action-context.xml');
      var messagesSrc = this.templatePath('action.properties');

      var packagePath = _.replace(packageName, /\./g, '/');
      var classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      var contextDst = path.join(moduleRoot, genRoot, 'action-' + actionId + '-context.xml');
      var messagesDst = path.join(moduleRoot, msgRoot, artifactId + '-' + actionId + '-action.properties');

      this.fs.copyTpl(classSrc, classDst, templateContext);
      this.fs.copyTpl(contextSrc, contextDst, templateContext);
      this.fs.copyTpl(messagesSrc, messagesDst, templateContext);

      debug('done prompting function finished');
    }).then(function () {
      debug('prompting finished');
    });
  },

  /*
  writing: function () {
    if (this.bail) return;
  },

  install: function () {
    if (this.bail) return;
  },
  */
});

function packageFilter (pkg) {
  if (!_.isString(pkg) || _.isEmpty(pkg)) return undefined;
  var output = pkg;
  // To begin with, if package is provided in path notation replace
  // slashes with dots also, treat spaces like path separators
  output = _.replace(output, /[\/\s]/g, '.');
  // package should not start with any dots
  output = _.replace(output, /^\.*/, '');
  // package should not end with any dots
  output = _.replace(output, /\.*$/, '');
  // package should be all lower case
  output = output.toLocaleLowerCase();
  if (_.isEmpty(output)) return undefined;
  return output;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
