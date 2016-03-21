'use strict';
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var constants = require('../app/constants.js');

module.exports = yeoman.Base.extend({
  prompting: function () {
    this.bail = false;
    this.out = require('../app/app-output.js')(this);

    // ==== GUARD AGAINST SUB-GENERATOR BEING RUN STAND-ALONE ====
    try { var configJSON = this.fs.readJSON('.yo-rc.json'); } catch (err) { /* ignore */ }
    if(!configJSON || !configJSON['generator-alfresco']) {
      this.out.error('The ' + chalk.blue('alfresco:amp') + ' sub-generator must be run in a project created using ' + chalk.green('yo alfresco'));
      this.bail = true;
    } else {

      this.log(yosay(
        'Adding source amp(s) to ' + chalk.green(this.config.get(constants.PROP_PROJECT_ARTIFACT_ID)) + ' project!'
      ));

      this.out.info([
        'This sub-generator will update existing POM\'s and context files.',
        'Yeoman will display "conflict <filename>" and ask you if you want to update each file.',
        'Type "h" when prompted to get details about your resolution choices.'].join(' '));

      var defGroupId = this.config.get(constants.PROP_PROJECT_GROUP_ID);
      var defArtifactIdPrefix = this.config.get(constants.PROP_PROJECT_ARTIFACT_ID);
      var defVersion = this.config.get(constants.PROP_PROJECT_VERSION);
      var prompts = [
        {
          type: 'list',
          name: constants.PROP_WAR,
          message: 'Which war would you like to customize?',
          choices: ['repo & share', constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE],
        },
        {
          type: 'input',
          name: constants.PROP_PROJECT_GROUP_ID,
          message: 'Project groupId?',
          default: defGroupId,
        },
        {
          type: 'input',
          name: constants.PROP_PROJECT_ARTIFACT_ID_PREFIX,
          message: 'Project artifactId prefix?',
          default: defArtifactIdPrefix,
        },
        {
          type: 'input',
          name: constants.PROP_PROJECT_VERSION,
          message: 'Project version?',
          default: defVersion,
        },
        {
          type: 'confirm',
          name: 'createParent',
          message: 'Would you like to create a parent folder to contain both of your amps?',
          default: false,
          when: function(props) {
            var warType = props[constants.PROP_WAR];
            return ('repo & share' === warType);
          }
        },
        {
          type: 'input',
          name: 'parentName',
          message: 'Name for parent pom?',
          when: function(props) {
            return props.createParent;
          }
        },
        {
          type: 'input',
          name: 'parentDescription',
          message: 'Description for parent pom?',
          when: function(props) {
            return props.createParent;
          }
        },
        {
          type: 'input',
          name: 'repoName',
          message: 'Name for repo amp?',
          when: function(props) {
            var warType = props[constants.PROP_WAR];
            return ('repo & share' === warType || constants.WAR_TYPE_REPO === warType);
          }
        },
        {
          type: 'input',
          name: 'repoDescription',
          message: 'Description for repo amp?',
          when: function(props) {
            var warType = props[constants.PROP_WAR];
            return ('repo & share' === warType || constants.WAR_TYPE_REPO === warType);
          }
        },
        {
          type: 'input',
          name: 'shareName',
          message: 'Name for share amp?',
          when: function(props) {
            var warType = props[constants.PROP_WAR];
            return ('repo & share' === warType || constants.WAR_TYPE_SHARE === warType);
          }
        },
        {
          type: 'input',
          name: 'shareDescription',
          message: 'Description for share amp?',
          when: function(props) {
            var warType = props[constants.PROP_WAR];
            return ('repo & share' === warType || constants.WAR_TYPE_SHARE === warType);
          }
        },
      ];

      var donePrompting = this.async();
      this.prompt(prompts, function (props) {
        this.props = props;
        if (defGroupId === props[constants.PROP_PROJECT_GROUP_ID]) {
          props[constants.PROP_PROJECT_GROUP_ID] = constants.VAR_PROJECT_GROUPID;
        }
        if (defVersion === props[constants.PROP_PROJECT_VERSION]) {
          props[constants.PROP_PROJECT_VERSION] = constants.VAR_PROJECT_VERSION;
        }
        if ('repo & share' === props[constants.PROP_WAR]) {
          this.props[constants.PROP_WAR] = [constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE];
        } else {
          this.props[constants.PROP_WAR] = [this.props[constants.PROP_WAR]];
        }
        this.sdkVersions = require('../app/sdk-versions.js');
        this.sdk = this.sdkVersions[this.config.get('sdkVersion')];
        this.moduleManager = require('../app/alfresco-module-manager.js')(this);
        donePrompting();
      }.bind(this));

    }
  },

  writing: function () {
    if (this.bail) return;

    // Do regular module instantiation stuff
    this.props[constants.PROP_WAR].forEach(function(war) {
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
        var parentPomStr = undefined;
        if (this.fs.exists(parentPomPath)) {
          parentPomStr = this.fs.read(parentPomPath);
        }
        var parentPom = require('../app/maven-pom.js')(parentPomStr);
        parentPom.setProjectGAV(parentGroupId, parentArtifactId, parentVersion, 'pom');
        if (this.props.parentName) parentPom.setTopLevelElementTextContent('pom', 'name', this.props.parentName);
        if (this.props.parentDescription) parentPom.setTopLevelElementTextContent('pom', 'description', this.props.parentDescription);
        parentPom.setParentGAV('org.alfresco.maven', 'customizations', '1.0.0-SNAPSHOT');
        this.fs.write(parentPomPath, parentPom.getPOMString());

        var customizationsPomPath = this.destinationPath(path.join(constants.FOLDER_CUSTOMIZATIONS, 'pom.xml'));
        this.out.info('Adding ' + parentArtifactId + ' to customizations module ' + customizationsPomPath);
        var customizationsPomStr = this.fs.read(customizationsPomPath);
        var customizationsPom = require('../app/maven-pom.js')(customizationsPomStr);
        if (!customizationsPom.findModule(parentArtifactId)) {
          customizationsPom.addModule(parentArtifactId, true);
          this.fs.write(customizationsPomPath, customizationsPom.getPOMString());
        }
      }
      var modulePath = path.join(parentPath, artifactId);
      // register and do initial setup for our module(s)
      this.moduleManager.addModule(groupId, artifactId, version, 'amp', war, 'source', modulePath);
      // schedule setup activities for our module(s)
      if (constants.WAR_TYPE_REPO === war) {
        // We are creating a new module so we need to set it up
        this.moduleManager.pushOp(function() {this.sdk.setupNewRepoModule.call(this, modulePath)}.bind(this));
        // If we have a custom name or description then get that info into the pom
        if (this.props.repoName || this.props.repoDescription) {
          this.moduleManager.pushOp(function() {
            console.log('Setting name: ' + this.props.repoName + ' and description: ' + this.props.repoDescription + ' for: ' + artifactId);
            var pomPath = this.destinationPath(path.join(modulePath, 'pom.xml'));
            var pomStr = this.fs.read(pomPath);
            var pom = require('../app/maven-pom.js')(pomStr);
            if (this.props.repoName) pom.setTopLevelElementTextContent('pom', 'name', this.props.repoName);
            if (this.props.repoDescription) pom.setTopLevelElementTextContent('pom', 'description', this.props.repoDescription);
            this.fs.write(pomPath, pom.getPOMString());
          }.bind(this));
        }
      }
      if (constants.WAR_TYPE_SHARE === war) {
        // We are creating a new module so we need to set it up
        this.moduleManager.pushOp(function() {this.sdk.setupNewShareModule.call(this, modulePath)}.bind(this));
        // If we have a custom name or description then get that info into the pom
        if (this.props.shareName || this.props.shareDescription) {
          this.moduleManager.pushOp(function() {
            console.log('Setting name: ' + this.props.shareName + ' and description: ' + this.props.shareDescription + ' for: ' + artifactId);
            var pomPath = this.destinationPath(path.join(modulePath, 'pom.xml'));
            var pomStr = this.fs.read(pomPath);
            var pom = require('../app/maven-pom.js')(pomStr);
            if (this.props.shareName) pom.setTopLevelElementTextContent('pom', 'name', this.props.shareName);
            if (this.props.shareDescription) pom.setTopLevelElementTextContent('pom', 'description', this.props.shareDescription);
            this.fs.write(pomPath, pom.getPOMString());
          }.bind(this));
        }
      }
    }.bind(this));
    // complete all scheduled activities
    this.moduleManager.save();
  },

  install: function () {
    if (this.bail) return;
  }
});
