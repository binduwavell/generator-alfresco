'use strict';
const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:behavior');
const path = require('path');
const trace = require('debug')('generator-alfresco-trace:behavior');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

class BehaviorSubGenerator extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    super(args, opts);

    this.out.docs(
      'Behaviors/Policies can be used to run custom code when an event, such a adding a content item or deleting a content item, happens.',
      'http://docs.alfresco.com/community/references/dev-extension-points-behaviors.html');

    const defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

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
        when: () => {
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
    return this.subgeneratorPrompt(this.prompts, props => {
      debug('prompting done function');
      this.props = props;

      // figure stuff out about our environment
      const configBase = this.sdk.repoConfigBase;
      const targetModule = this.targetModule.module;
      const artifactId = targetModule.artifactId;
      const moduleRoot = this.destinationPath(targetModule.path);
      const targetModuleBase = path.basename(targetModule.path);
      const genRoot = `${configBase}/alfresco/module/${targetModuleBase}/context/generated`;

      // get information from prompts
      const behaviorId = _.kebabCase(props.class);
      const className = _.upperFirst(_.camelCase(props.class));
      let packageName = props.package;
      if (!packageName.endsWith('.behaviors')) {
        packageName += '.behaviors';
      }
      const templateContext = {
        artifactId: artifactId,
        behaviorId: behaviorId,
        className: className,
        packageName: packageName,
      };

      const classSrc = this.templatePath('Behavior.java');
      const contextSrc = this.templatePath('behavior-context.xml');

      const packagePath = packageName.replace(/\./g, '/');
      const classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      const contextDst = path.join(moduleRoot, genRoot, 'behavior-' + behaviorId + '-context.xml');

      this.fs.copyTpl(classSrc, classDst, templateContext);
      this.fs.copyTpl(contextSrc, contextDst, templateContext);

      debug('prompting done function finished');
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

module.exports = BehaviorSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
