'use strict';
let debug = require('debug')('generator-alfresco:amp-remote');
let chalk = require('chalk');
let constants = require('generator-alfresco-common').constants;
let filters = require('generator-alfresco-common').prompt_filters;
let SubGenerator = require('../subgenerator.js');

let WAR_TYPES = [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE];

module.exports = class extends SubGenerator {
  constructor (args, opts) {
    super(args, opts);

    this.prompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: { name: 'war', config: { alias: 'w', desc: 'War to target: repo or share', type: String, choices: WAR_TYPES } },
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
        name: 'ampVersion',
        option: { name: 'amp-version', config: { alias: 'v', desc: 'amp version', type: String } },
        message: 'Amp version?',
        commonFilter: filters.requiredVersionFilter,
        valueRequired: true,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  }

  prompting () {
    if (this.bail) return;

    this.out.docs([
      'Some functionality of the Alfresco content management system is delivered as extra modules,',
      'such as Records Management (RM), Google Docs Integration, and Alfresco Office Services, which',
      'provides SharePoint Protocol support. If you know the maven groupId, artifactId and version,',
      'we can link such modules to your project.'].join(' '),
      'http://docs.alfresco.com/5.1/tasks/alfresco-sdk-advanced-link-alf-amps-aio.html');

    this.out.info([
      'This sub-generator will update existing POM\'s and context files.',
      'Yeoman will display ' + chalk.yellow('conflict <filename>'),
      'and ask you if you want to update each file.',
      '\nType "h" when prompted to get details about your choices.'].join(' '));

    return this.subgeneratorPrompt(this.prompts, '', function (props) {
      this.props = props;
    }).then(function () {
      debug('prompting finished');
    });
  }

  writing () {
    if (this.bail) return;

    debug('installing %s into %s', this.props.path, this.props.warType);

    let mod = {
      'groupId': this.props.groupId,
      'artifactId': this.props.artifactId,
      'version': this.props.ampVersion,
      'packaging': 'amp',
      'war': this.props.war,
      'location': 'remote',
      'path': 'remote',
    };
    debug('adding: %j', mod);
    this.moduleManager.addModule(mod);
    // complete all scheduled activities
    this.moduleManager.save();
  }
};

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
