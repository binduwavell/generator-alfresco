'use strict';
var chalk = require('chalk');
var debug = require('debug')('generator-alfresco:amp');
var path = require('path');
var constants = require('../common/constants.js');
var filters = require('../common/prompt-filters.js');
var SubGenerator = require('../subgenerator.js');

var WAR_TYPE_BOTH = 'Both repo & share';
var WAR_TYPES = [WAR_TYPE_BOTH, constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE];

module.exports = SubGenerator.extend({

  constructor: function () {
    SubGenerator.apply(this, arguments);

    var defGroupId = this.config.get(constants.PROP_PROJECT_GROUP_ID);
    var defArtifactIdPrefix = this.config.get(constants.PROP_PROJECT_ARTIFACT_ID);
    var defVersion = this.config.get(constants.PROP_PROJECT_VERSION);

    this.prompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: { name: 'war', config: { alias: 'w', desc: 'War to target: repo, share or both', type: String } },
        choices: WAR_TYPES,
        message: 'Which war would you like to customize?',
        commonFilter: filters.chooseOneMapStartsWithFilterFactory({ 'repo': constants.WAR_TYPE_REPO, 'share': constants.WAR_TYPE_SHARE, 'both': WAR_TYPE_BOTH }),
        valueRequired: true,
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_GROUP_ID,
        option: { name: 'project-group-id', config: { alias: 'g', desc: 'groupId for project', type: String } },
        default: defGroupId,
        message: 'Project groupId?',
        commonFilter: filters.requiredTextFilter,
        invalidMessage: 'The ' + chalk.yellow('project groupId') + ' is required',
        valueRequired: true,
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_ARTIFACT_ID_PREFIX,
        option: { name: 'project-artifact-id', config: { alias: 'a', desc: 'prefix for project artifactId', type: String } },
        default: defArtifactIdPrefix,
        message: 'Project artifactId prefix?',
        commonFilter: filters.requiredTextFilter,
        invalidMessage: 'The ' + chalk.yellow('project artifactId prefix') + ' is required',
        valueRequired: true,
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_VERSION,
        option: { name: 'project-version', config: { alias: 'v', desc: 'version for project', type: String } },
        default: defVersion,
        message: 'Project version?',
        commonFilter: filters.requiredTextFilter,
        invalidMessage: 'The ' + chalk.yellow('project version') + ' is required',
        valueRequired: true,
      },
      {
        type: 'confirm',
        name: 'removeDefaultSourceSamples',
        option: { name: 'remove-default-source-samples', config: { alias: 'R', desc: 'Remove sample code from new amp(s)', type: Boolean } },
        default: true,
        message: 'Should we remove the default samples?',
        commonFilter: filters.booleanFilter,
        valueRequired: true,
      },
      {
        type: 'confirm',
        name: 'createParent',
        option: { name: 'create-parent', config: { alias: 'p', desc: 'Create parent folder for amps', type: Boolean } },
        when: function (props) {
          var warType = props[constants.PROP_WAR];
          var show = (WAR_TYPE_BOTH === warType);
          if (!show) this.createParent = false;
          return show;
        },
        default: false,
        message: 'Would you like to create a parent folder to contain both of your amps?',
        commonFilter: filters.booleanFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'parentName',
        option: { name: 'parent-name', config: { alias: 'm', desc: 'Name for parent pom', type: String } },
        when: function (props) {
          return props.createParent;
        },
        message: 'Name for parent pom?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'parentDescription',
        option: { name: 'parent-description', config: { alias: 's', desc: 'Description for parent pom', type: String } },
        when: function (props) {
          return props.createParent;
        },
        message: 'Description for parent pom?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'repoName',
        option: { name: 'repo-name', config: { alias: 'n', desc: 'Name for repo pom', type: String } },
        when: whenRepoWar,
        message: 'Name for repo amp?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'repoDescription',
        option: { name: 'repo-description', config: { alias: 'd', desc: 'Description for repo pom', type: String } },
        when: whenRepoWar,
        message: 'Description for repo amp?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'shareName',
        option: { name: 'share-name', config: { alias: 'N', desc: 'Name for share pom', type: String } },
        when: whenShareWar,
        message: 'Name for share amp?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
      {
        type: 'input',
        name: 'shareDescription',
        option: { name: 'share-description', config: { alias: 'D', desc: 'Description for share pom', type: String } },
        when: whenShareWar,
        message: 'Description for share amp?',
        commonFilter: filters.optionalTextFilter,
        valueRequired: false,
      },
    ];

    this.setupArgumentsAndOptions(this.prompts);
  },

  prompting: function () {
    this.out.info([
      'This sub-generator will update existing POM\'s and context files.',
      'Yeoman will display "conflict <filename>" and ask you if you want to update each file.',
      'Type "h" when prompted to get details about your resolution choices.'].join(' '));

    var defGroupId = this.config.get(constants.PROP_PROJECT_GROUP_ID);
    var defVersion = this.config.get(constants.PROP_PROJECT_VERSION);

    this.subgeneratorPrompt(this.prompts, function (props) {
      this.props = props;
      if (defGroupId === props[constants.PROP_PROJECT_GROUP_ID]) {
        props[constants.PROP_PROJECT_GROUP_ID] = constants.VAR_PROJECT_GROUPID;
      }
      if (defVersion === props[constants.PROP_PROJECT_VERSION]) {
        props[constants.PROP_PROJECT_VERSION] = constants.VAR_PROJECT_VERSION;
      }
      if (WAR_TYPE_BOTH === props[constants.PROP_WAR]) {
        this.props[constants.PROP_WAR] = [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE];
      } else {
        this.props[constants.PROP_WAR] = [this.props[constants.PROP_WAR]];
      }
    }.bind(this));
  },

  writing: function () {
    if (this.bail) return;

    // Do regular module instantiation stuff
    debug('writing %s', this.props[constants.PROP_WAR]);
    this.props[constants.PROP_WAR].forEach(function (war) {
      var prefix = this.props[constants.PROP_PROJECT_ARTIFACT_ID_PREFIX];
      var artifactId = prefix + '-' + war + '-amp';
      var groupId = this.props[constants.PROP_PROJECT_GROUP_ID];
      var version = this.props[constants.PROP_PROJECT_VERSION];
      var parentPath = constants.FOLDER_CUSTOMIZATIONS;
      // If are parent folder is created we need to put a pom in it
      // and link said pom into the customizations pom
      if (this.props.createParent) {
        var parentGroupId = groupId;
        if (parentGroupId === constants.VAR_PROJECT_GROUPID) {
          parentGroupId = this.config.get(constants.PROP_PROJECT_GROUP_ID);
        }
        var parentArtifactId = prefix + '-parent';
        var parentVersion = version;
        if (parentVersion === constants.VAR_PROJECT_VERSION) {
          parentVersion = this.config.get(constants.PROP_PROJECT_VERSION);
        }
        parentPath = path.join(parentPath, parentArtifactId);
        var parentPomPath = path.join(parentPath, 'pom.xml');
        var parentPomStr;
        if (this.fs.exists(parentPomPath)) {
          parentPomStr = this.fs.read(parentPomPath);
        }
        var parentPom = require('../common/maven-pom.js')(parentPomStr);
        parentPom.setProjectGAV(parentGroupId, parentArtifactId, parentVersion, 'pom');
        if (this.props.parentName) parentPom.setTopLevelElementTextContent('pom', 'name', this.props.parentName);
        if (this.props.parentDescription) parentPom.setTopLevelElementTextContent('pom', 'description', this.props.parentDescription);
        parentPom.setParentGAV('org.alfresco.maven', 'customizations', '1.0.0-SNAPSHOT');
        this.fs.write(parentPomPath, parentPom.getPOMString());

        var customizationsPomPath = this.destinationPath(path.join(constants.FOLDER_CUSTOMIZATIONS, 'pom.xml'));
        this.out.info('Adding ' + parentArtifactId + ' to customizations module ' + customizationsPomPath);
        var customizationsPomStr = this.fs.read(customizationsPomPath);
        var customizationsPom = require('../common/maven-pom.js')(customizationsPomStr);
        if (!customizationsPom.findModule(parentArtifactId)) {
          customizationsPom.addModule(parentArtifactId, true);
          this.fs.write(customizationsPomPath, customizationsPom.getPOMString());
        }
      }
      var modulePath = path.join(parentPath, artifactId);
      debug('register and do initial setup for our module(s)');
      this.moduleManager.addModule(groupId, artifactId, version, 'amp', war, 'source', modulePath);
      debug('schedule setup activities for our module(s)');
      if (constants.WAR_TYPE_REPO === war) {
        debug('We are creating a new module so we need to schedule it to be setup');
        this.moduleManager.pushOp(function () { this.sdk.setupNewRepoModule.call(this, modulePath) }.bind(this));
        debug('If we have a custom name or description then arrange to get that info into the pom');
        if (this.props.repoName || this.props.repoDescription) {
          this.moduleManager.pushOp(function () {
            this.out.info('Setting name: ' + this.props.repoName + ' and description: ' + this.props.repoDescription + ' for: ' + artifactId);
            var pomPath = this.destinationPath(path.join(modulePath, 'pom.xml'));
            var pomStr = this.fs.read(pomPath);
            var pom = require('../common/maven-pom.js')(pomStr);
            if (this.props.repoName) pom.setTopLevelElementTextContent('pom', 'name', this.props.repoName);
            if (this.props.repoDescription) pom.setTopLevelElementTextContent('pom', 'description', this.props.repoDescription);
            this.fs.write(pomPath, pom.getPOMString());
          }.bind(this));
        }
        if (this.props.removeDefaultSourceSamples) {
          debug('scheduling sample source code/config removal');
          this.moduleManager.pushOp(
            function () {
              this.sdk.removeRepoSamples.call(this,
                modulePath,
                this.config.get(constants.PROP_PROJECT_PACKAGE),
                prefix
              );
            }.bind(this)
          );
        } else {
          debug('NOT scheduling sample source code/config removal');
        }
      }
      if (constants.WAR_TYPE_SHARE === war) {
        // We are creating a new module so we need to set it up
        this.moduleManager.pushOp(function () { this.sdk.setupNewShareModule.call(this, modulePath) }.bind(this));
        // If we have a custom name or description then get that info into the pom
        if (this.props.shareName || this.props.shareDescription) {
          this.moduleManager.pushOp(function () {
            console.log('Setting name: ' + this.props.shareName + ' and description: ' + this.props.shareDescription + ' for: ' + artifactId);
            var pomPath = this.destinationPath(path.join(modulePath, 'pom.xml'));
            var pomStr = this.fs.read(pomPath);
            var pom = require('../common/maven-pom.js')(pomStr);
            if (this.props.shareName) pom.setTopLevelElementTextContent('pom', 'name', this.props.shareName);
            if (this.props.shareDescription) pom.setTopLevelElementTextContent('pom', 'description', this.props.shareDescription);
            this.fs.write(pomPath, pom.getPOMString());
          }.bind(this));
        }
        if (this.props.removeDefaultSourceSamples) {
          this.moduleManager.pushOp(
            function () {
              this.sdk.removeShareSamples.call(this,
                modulePath,
                this.config.get(constants.PROP_PROJECT_PACKAGE),
                prefix
              );
            }.bind(this)
          );
        }
      }
    }.bind(this));
    // complete all scheduled activities
    this.moduleManager.save();
  },

  /*
  install: function () {
    if (this.bail) return;
  },
  */
});

function whenRepoWar (props) {
  var warType = props[constants.PROP_WAR];
  var show = (WAR_TYPE_BOTH === warType || constants.WAR_TYPE_REPO === warType);
  return show;
}

function whenShareWar (props) {
  var warType = props[constants.PROP_WAR];
  var show = (WAR_TYPE_BOTH === warType || constants.WAR_TYPE_SHARE === warType);
  return show;
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
