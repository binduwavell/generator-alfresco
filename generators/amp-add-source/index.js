'use strict';
const chalk = require('chalk');
const debug = require('debug')('generator-alfresco:amp-add-source');
const Generator = require('yeoman-generator');

const DELEGATED_NAMESPACE = 'alfresco:module-add-source';

class AmpAddSourceSubGenerator extends Generator {
  constructor (args, opts) {
    super(args, opts);
    this.out = require('generator-alfresco-common').generator_output(this);
  }

  help () {
    const subgen = this.env.create(DELEGATED_NAMESPACE);
    return Generator.prototype.help.apply(subgen);
  }

  prompting () {
    this.out.warn(`This sub-generator is deprecated, delegating to ${chalk.yellow('yo alfresco:module-add-source')} instead`);

    return this.prompt([]).then(() => {
      debug(`Delegating to the ${DELEGATED_NAMESPACE} generator`);
      this.composeWith(DELEGATED_NAMESPACE, this.options);
    }).then(() => {
      debug('Prompting finished');
    });
  }
}

module.exports = AmpAddSourceSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
