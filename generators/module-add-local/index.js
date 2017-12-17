'use strict';
const SubGenerator = require('../subgenerator.js');

class ModuleAddLocalSubGenerator extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [];

    if (!this.bail) this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    // This sub-generator should handle SDK2/SDK3 differences and
    // compose out to amp-add-local or jar-add-local as appropriate.
    this.out.error('NOT IMPLEMENTED YET');
    this.bail = true;
  }
};

module.exports = ModuleAddLocalSubGenerator;

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
