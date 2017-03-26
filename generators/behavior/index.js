'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var debug = require('debug')('generator-alfresco:behavior');
var path = require('path');
var constants = require('generator-alfresco-common').constants;
var filters = require('generator-alfresco-common').prompt_filters;
var SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

module.exports = SourceSelectingSubGenerator.extend({
  constructor: function () {
    debug('constructor');
    arguments[1][constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    SourceSelectingSubGenerator.apply(this, arguments);

    this.out.docs(
      'Behaviors/Policies can be used to run custom code when an event, such a adding a content item or deleting a content item, happens.',
      'http://docs.alfresco.com/community/references/dev-extension-points-behaviors.html');

    var defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

    this.prompts = [
      {
        type: 'input',
        name: 'class',
        option: { name: 'class', config: { alias: 'c', desc: 'Class name for behavior', type: String } },
        message: 'What behavior ' + chalk.yellow('class name') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'package',
        option: { name: 'package', config: { alias: 'p', desc: 'Java package for action class', type: String } },
        when: function (readonlyProps) {
          this.out.docs('The java package that your behavior class must be placed into.');
          return true;
        },
        default: defPackage,
        message: 'What ' + chalk.yellow('java package') + ' should we use?',
        commonFilter: packageFilter,
        invalidMessage: 'Package is required and must be a valid java package',
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
    debug('constructor finished');
  },

  prompting: function () {
    debug('prompting');
    return this.subgeneratorPrompt(this.prompts, function (props) {
      debug('prompting done function');
      this.props = props;

      // figure stuff out about our environment
      var targetModule = this.targetModule.module;
      var artifactId = targetModule.artifactId;
      var moduleRoot = this.destinationPath(targetModule.path);
      var genRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated';

      // get information from prompts
      var behaviorId = _.kebabCase(props.class);
      var className = _.upperFirst(_.camelCase(props.class));
      var packageName = props.package;
      if (!_.endsWith(packageName, '.behaviors')) {
        packageName += '.behaviors';
      }
      var templateContext = {
        artifactId: artifactId,
        behaviorId: behaviorId,
        className: className,
        packageName: packageName,
      };

      var classSrc = this.templatePath('Behavior.java');
      var contextSrc = this.templatePath('behavior-context.xml');

      var packagePath = _.replace(packageName, /\./g, '/');
      var classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      var contextDst = path.join(moduleRoot, genRoot, 'behavior-' + behaviorId + '-context.xml');

      this.fs.copyTpl(classSrc, classDst, templateContext);
      this.fs.copyTpl(contextSrc, contextDst, templateContext);

      debug('prompting done function finished');
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
  output = _.replace(output, /[/\s]/g, '.');
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
