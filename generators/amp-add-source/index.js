'use strict';
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:amp-add-source');
const SubGenerator = require('../subgenerator.js');

const DELEGATED_NAMESPACE = 'alfresco:module-add-source';

class AmpAddSourceSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [];

    this.setupArgumentsAndOptions(this.prompts);
  }

  help () {
    const Generator = require('yeoman-generator');
    const subgen = this.env.create(DELEGATED_NAMESPACE);
    return Generator.prototype.help.apply(subgen);
  }

  prompting () {
    if (this.bail) return;

    if (this.usingEnhancedAlfrescoMavenPlugin) {
      this.out.warn([
        'This sub-generator is deprecated starting from SDK 3,',
        'please use ' + chalk.yellow('yo alfresco:module-add-source'),
        'instead'].join(' '));
    }

    return this.subgeneratorPrompt(this.prompts, props => {
      debug(`delegating to ${DELEGATED_NAMESPACE}`);
      this.composeWith(DELEGATED_NAMESPACE, this.options);
    }).then(() => {
      debug('prompting finished');
    });
  }
}

module.exports = AmpAddSourceSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
