'use strict';
const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:jsrootobject');
const path = require('path');
const trace = require('debug')('generator-alfresco-trace:jsrootobject');
const constants = require('generator-alfresco-common').constants;
const filters = require('generator-alfresco-common').prompt_filters;
const SourceSelectingSubGenerator = require('../source-selecting-subgenerator');

class JSRootObjectSubGenerator extends SourceSelectingSubGenerator {
  constructor (args, opts) {
    trace('constructor');
    opts[constants.PROP_WAR] = constants.WAR_TYPE_REPO;
    super(args, opts);

    this.out.docs(
      'Custom Java code can be called from JavaScript controllers. This is possible by adding custom JavaScript root objects',
      'http://docs.alfresco.com/5.2/references/dev-extension-points-javascript-root-objects.html');

    const defPackage = packageFilter(this.config.get(constants.PROP_PROJECT_PACKAGE));

    this.prompts = [
      {
        type: 'input',
        name: 'root',
        option: { name: 'root', config: { alias: 'r', desc: 'Javascript Root Object name', type: String } },
        when: () => {
          this.out.docs('The javascript root object name will be used to construct the bean id and root object.');
          return true;
        },
        message: 'What ' + chalk.yellow('root object') + ' should we use?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'package',
        option: { name: 'package', config: { alias: 'p', desc: 'Java package for root object class', type: String } },
        when: () => {
          this.out.docs('The java package that your root object class must be placed into.');
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
      const rootObjectId = _.toLower(_.camelCase(props.root));
      const className = _.upperFirst(_.camelCase(props.root));
      let packageName = props.package;
      if (!packageName.endsWith('.jsroot')) {
        packageName += '.jsroot';
      }
      const templateContext = {
        artifactId: artifactId,
        rootObjectId: rootObjectId,
        className: className,
        packageName: packageName,
      };

      const classSrc = this.templatePath('JSRootObject.java');
      const contextSrc = this.templatePath('jsroot-object-context.xml');

      const packagePath = packageName.replace(/\./g, '/');
      const classDst = path.join(moduleRoot, 'src/main/java', packagePath, className + '.java');
      const contextDst = path.join(moduleRoot, genRoot, 'jsroot-object-' + rootObjectId + '-context.xml');

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

module.exports = JSRootObjectSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
