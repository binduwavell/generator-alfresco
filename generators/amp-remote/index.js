'use strict';
var debug = require('debug')('generator-alfresco:amp-remote');
var constants = require('../common/constants.js');
var filters = require('../common/prompt-filters.js');
var SubGenerator = require('../subgenerator.js');

var WAR_TYPES = [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE];

module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    this.prompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: { name: 'war', config: { alias: 'w', desc: 'War to target: repo or share', type: String } },
        choices: WAR_TYPES,
        message: 'Which war would you like add an AMP to?',
        commonFilter: filters.chooseOneStartsWithFilterFactory(WAR_TYPES),
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'groupId',
        option: { name: 'group-id', config: { alias: 'g', desc: 'amp groupId', type: String } },
        message: 'Amp groupId?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'artifactId',
        option: { name: 'artifact-id', config: { alias: 'a', desc: 'amp artifactId', type: String } },
        message: 'Amp artifactId?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
      {
        type: 'input',
        name: 'version',
        option: { name: 'version', config: { alias: 'v', desc: 'amp version', type: String } },
        message: 'Amp version?',
        commonFilter: filters.requiredTextFilter,
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  },

  prompting: function () {
    this.out.info([
      'This sub-generator will update existing POM\'s and context files.',
      'Yeoman will display "conflict <filename>" and ask you if you want to update each file.',
      'Type "h" when prompted to get details about your choices.'].join(' '));

    this.out.docs(
      'Some functionality of the Alfresco content management system is delivered as extra modules, such as Records Management (RM), Google Docs Integration, and Alfresco Office Services, whic provides SharePoint Protocol support. You can link such modules to your project.',
      'http://docs.alfresco.com/5.1/tasks/alfresco-sdk-advanced-link-alf-amps-aio.html');

    this.subgeneratorPrompt(this.prompts, '', function (props) {
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    if (this.bail) return;

    debug('installing %s into %s', this.props.path, this.props.warType);

    var mod = {
      'groupId': this.props.groupId,
      'artifactId': this.props.artifactId,
      'version': this.props.version,
      'packaging': 'amp',
      'war': this.props.war,
      'location': 'remote',
      'path': 'remote',
    };
    debug('adding: %j', mod);
    this.moduleManager.addModule(mod);
    // complete all scheduled activities
    this.moduleManager.save();
  },

  /*
  install: function () {
    if (this.bail) return;
  },
  */
});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
