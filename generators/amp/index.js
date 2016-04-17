'use strict';
var debug = require('debug')('generator-alfresco:amp');
var filters = require('../common/prompt-filters.js');
var SubGenerator = require('../subgenerator.js');

var AMP_TYPE_SOURCE = 'Source AMP';
var AMP_TYPE_LOCAL = 'Local AMP';
var AMP_TYPE_REMOTE = 'Remote AMP';
var AMP_TYPES = [AMP_TYPE_SOURCE, AMP_TYPE_LOCAL, AMP_TYPE_REMOTE];
var AMP_TYPE_CHOICES = {
  'source': AMP_TYPE_SOURCE,
  'local': AMP_TYPE_LOCAL,
  'remote': AMP_TYPE_REMOTE,
};

module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    this.prompts = [
      {
        type: 'list',
        name: 'ampType',
        option: { name: 'amp-type', config: { alias: 'A', desc: 'Type of AMP: Source AMP, Local AMP or Remote AMP', type: String } },
        when: function (props) {
          this.out.docs('This generator will create/install amps into your project files:');
          this.out.definition('Source AMP', 'We\'ll create a new source code projects that you can add code/config to');
          this.out.definition('Local AMP', 'Installs an amp file from ./amps or ./amps_share into this project');
          this.out.definition('Remote AMP', 'Installs an amp file from a reachable Maven repository into this project');
          return true;
        },
        choices: AMP_TYPES,
        message: 'Do you want to add source AMPs, a pre packaged AMP from your amps/amp_share folder or an AMP from a maven repository?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory(AMP_TYPE_CHOICES),
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  },

  prompting: function () {
    this.subgeneratorPrompt(this.prompts, function (props) {
      if (props.ampType === AMP_TYPE_SOURCE) {
        debug('delegating to amp-source');
        this.composeWith('alfresco:amp-source', { options: this.options });
      }
      if (props.ampType === AMP_TYPE_LOCAL) {
        debug('delegating to amp-local');
        this.composeWith('alfresco:amp-local', { options: this.options });
      }
      if (props.ampType === AMP_TYPE_REMOTE) {
        debug('delegating to amp-remote');
        this.composeWith('alfresco:amp-remote', { options: this.options });
      }
    }.bind(this));
  },
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
