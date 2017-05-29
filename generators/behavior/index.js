'use strict';
let _ = require('lodash');
let chalk = require('chalk');
let debug = require('debug')('generator-alfresco:behavior');
let path = require('path');
let trace = require('debug')('generator-alfresco-trace:behavior');
let constants = require('generator-alfresco-common').constants;
let filters = require('generator-alfresco-common').prompt_filters;
let SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

module.exports = class extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    super(args, opts);

    this.out.docs(
      'Behaviors/Policies can be used to run custom code when an event, such a adding a content item or deleting a content item, happens.',
      'http://docs.alfresco.com/community/references/dev-extension-points-behaviors.html');

    let defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

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
  }

  prompting () {
    debug('prompting');
    return this.subgeneratorPrompt(this.prompts, function (props) {
      debug('prompting done function');
      this.props = props;

      // figure stuff out about our environment
      let targetModule = this.targetModule.module;
      let artifactId = targetModule.artifactId;
      let moduleRoot = this.destinationPath(targetModule.path);
      let genRoot = 'src/main/amp/config/alfresco/module/' + path.basename(targetModule.path) + '/context/generated';

      // get information from prompts
      let behaviorId = _.kebabCase(props.class);
      let className = _.upperFirst(_.camelCase(props.class));
      let packageName = props.package;
      if (!packageName.endsWith('.behaviors')) {
        packageName += '.behaviors';
      }
      let templateContext = {
        artifactId: artifactId,
        behaviorId: behaviorId,
        className: className,
        packageName: packageName,
      };

      let classSrc = this.templatePath('Behavior.java');
      let contextSrc = this.templatePath('behavior-context.xml');

      let packagePath = packageName.replace(/\./g, '/');
      let classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      let contextDst = path.join(moduleRoot, genRoot, 'behavior-' + behaviorId + '-context.xml');

      this.fs.copyTpl(classSrc, classDst, templateContext);
      this.fs.copyTpl(contextSrc, contextDst, templateContext);

      debug('prompting done function finished');
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
