'use strict';
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var constants = require('../app/constants.js');
var filters = require('../app/prompt-filters.js');
var SubGenerator = require('../subgenerator.js');

const WAR_TYPE_BOTH = 'Both repo & share';
const WAR_TYPES = [WAR_TYPE_BOTH, constants.WAR_TYPE_REPO, constants.WAR_TYPE_SHARE];

module.exports = SubGenerator.extend({

  constructor: function() {
    SubGenerator.apply(this, arguments);

    var defGroupId = this.config.get(constants.PROP_PROJECT_GROUP_ID);
    var defArtifactIdPrefix = this.config.get(constants.PROP_PROJECT_ARTIFACT_ID);
    var defVersion = this.config.get(constants.PROP_PROJECT_VERSION);

    this.prompts = [
      {
        type: 'list',
        name: constants.PROP_WAR,
        option: {
          name: 'war',
          config: {
            desc: 'War to target: repo, share or both',
            alias:'w',
            type: String,
          }
        },
        when: function(props) {
          var w = warFilter(this.options.war);
          if (undefined !== w) {
            props[constants.PROP_WAR] = w;
            this.out.info("Using war from command line: " + chalk.reset.dim.cyan(w));
            return false;
          }
          return true;
        }.bind(this),
        choices: WAR_TYPES,
        message: 'Which war would you like to customize?',
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_GROUP_ID,
        option: {
          name: 'project-group-id',
          config: {
            desc: 'groupId for project',
            alias:'g',
            type: String,
          }
        },
        when: function(props) {
          var g = projectGroupIdFilter(this.options['project-group-id']);
          if (undefined !== g) {
            props[constants.PROP_PROJECT_GROUP_ID] = g;
            this.out.info("Using project groupId from command line: " + chalk.reset.dim.cyan(g));
            return false;
          }
          return true;
        }.bind(this),
        default: defGroupId,
        message: 'Project groupId?',
        validate: function(input) {
          return (undefined !== input && '' !== input ? true : 'The ' + chalk.yellow('project groupId') + ' is required');
        },
        filter: projectGroupIdFilter,
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_ARTIFACT_ID_PREFIX,
        option: {
          name: 'project-artifact-id',
          config: {
            desc: 'artifactId prefix for project',
            alias:'a',
            type: String,
          }
        },
        when: function(props) {
          var a = projectArtifactIdPrefixFilter(this.options['project-artifact-id']);
          if (undefined !== a) {
            props[constants.PROP_PROJECT_ARTIFACT_ID_PREFIX] = a;
            this.out.info("Using project artifactId prefix from command line: " + chalk.reset.dim.cyan(a));
            return false;
          }
          return true;
        }.bind(this),
        default: defArtifactIdPrefix,
        message: 'Project artifactId prefix?',
        validate: function(input) {
          return (undefined !== input && '' !== input ? true : 'The ' + chalk.yellow('project artifactId prefix') + ' is required');
        },
        filter: projectArtifactIdPrefixFilter,
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_VERSION,
        option: {
          name: 'project-version',
          config: {
            desc: 'version for project',
            alias:'v',
            type: String,
          }
        },
        when: function(props) {
          var v = projectVersionFilter(this.options['project-version']);
          if (undefined !== v) {
            props[constants.PROP_PROJECT_VERSION] = v;
            this.out.info("Using project version from command line: " + chalk.reset.dim.cyan(v));
            return false;
          }
          return true;
        }.bind(this),
        default: defVersion,
        message: 'Project version?',
        validate: function(input) {
          return (undefined !== input && '' !== input ? true : 'The ' + chalk.yellow('project version') + ' is required');
        },
        filter: projectVersionFilter,
      },
      {
        type: 'confirm',
        name: 'removeDefaultSourceSamples',
        option: {
          name: 'remove-default-source-samples',
          config: {
            desc: 'remove sample code from new amp(s)',
            alias: 'r',
            type: Boolean,
          }
        },
        when: function(props) {
          var r = removeDefaultSourceSamplesFilter(this.options['remove-default-source-samples'])
          if (undefined !== r) {
            props.removeDefaultSourceSamples = r;
            this.out.info("Using remove sample code value from command line: " + chalk.reset.dim.cyan(r));
            return false;
          }
          return true;
        }.bind(this),
        message: 'Should we remove the default samples?',
      },
      {
        type: 'confirm',
        name: 'createParent',
        option: {
          name: 'create-parent',
          config: {
            desc: 'create parent folder for amps',
            alias:'p',
            type: Boolean,
          }
        },
        when: function(props) {
          var warType = props[constants.PROP_WAR];
          var show = (WAR_TYPE_BOTH === warType);
          var p = createParentFilter(this.options['create-parent']);
          if (undefined !== p) {
            props.createParent = p;
            if (show) {
              this.out.info("Using create parent from command line: " + chalk.reset.dim.cyan(p));
            }
            return false;
          } else {
            if (!show) {
              this.createParent = false;
            }
          }
          return show;
        }.bind(this),
        default: false,
        message: 'Would you like to create a parent folder to contain both of your amps?',
      },
      {
        type: 'input',
        name: 'parentName',
        option: {
          name: 'parent-name',
          config: {
            desc: 'name for parent pom',
            alias:'N',
            type: String,
          }
        },
        when: function(props) {
          var n = nameFilter(this.options['parent-name']);
          if (undefined !== n) {
            props.parentName = n;
            this.out.info("Using parent name from command line: " + chalk.reset.dim.cyan(n));
            return false;
          }
          return props.createParent;
        }.bind(this),
        message: 'Name for parent pom?',
        filter: nameFilter,
      },
      {
        type: 'input',
        name: 'parentDescription',
        option: {
          name: 'parent-description',
          config: {
            desc: 'description for parent pom',
            alias:'D',
            type: String,
          }
        },
        when: function(props) {
          var d = descriptionFilter(this.options['parent-description']);
          if (undefined !== d) {
            props.parentDescription = d;
            this.out.info("Using parent description from command line: " + chalk.reset.dim.cyan(d));
            return false;
          }
          return props.createParent;
        }.bind(this),
        message: 'Description for parent pom?',
        filter: descriptionFilter,
      },
      {
        type: 'input',
        name: 'repoName',
        option: {
          name: 'repo-name',
          config: {
            desc: 'name for repo pom',
            alias:'n',
            type: String,
          }
        },
        when: function(props) {
          var warType = props[constants.PROP_WAR];
          var show = (WAR_TYPE_BOTH === warType || constants.WAR_TYPE_REPO === warType);
          var n = nameFilter(this.options['repo-name']);
          if (undefined !== n) {
            props.repoName = n;
            if (show) {
              this.out.info("Using repo name from command line: " + chalk.reset.dim.cyan(n));
            }
            return false;
          }
          return show;
        }.bind(this),
        message: 'Name for repo amp?',
        filter: nameFilter,
      },
      {
        type: 'input',
        name: 'repoDescription',
        option: {
          name: 'repo-description',
          config: {
            desc: 'description for repo pom',
            alias:'d',
            type: String,
          }
        },
        when: function(props) {
          var warType = props[constants.PROP_WAR];
          var show = (WAR_TYPE_BOTH === warType || constants.WAR_TYPE_REPO === warType);
          var d = descriptionFilter(this.options['repo-description']);
          if (undefined !== d) {
            props.repoDescription = d;
            this.out.info("Using repo description from command line: " + chalk.reset.dim.cyan(d));
            return false;
          }
          return show;
        }.bind(this),
        message: 'Description for repo amp?',
        filter: descriptionFilter,
      },
      {
        type: 'input',
        name: 'shareName',
        option: {
          name: 'share-name',
          config: {
            desc: 'name for share pom',
            alias:'m',
            type: String,
          }
        },
        when: function(props) {
          var warType = props[constants.PROP_WAR];
          var show = (WAR_TYPE_BOTH === warType || constants.WAR_TYPE_SHARE === warType);
          var n = nameFilter(this.options['share-name']);
          if (undefined !== n) {
            props.shareName = n;
            if (show) {
              this.out.info("Using share name from command line: " + chalk.reset.dim.cyan(n));
            }
            return false;
          }
          return show;
        }.bind(this),
        message: 'Name for share amp?',
        filter: nameFilter,
      },
      {
        type: 'input',
        name: 'shareDescription',
        option: {
          name: 'share-description',
          config: {
            desc: 'description for share pom',
            alias:'s',
            type: String,
          }
        },
        when: function(props) {
          var warType = props[constants.PROP_WAR];
          var show = (WAR_TYPE_BOTH === warType || constants.WAR_TYPE_SHARE === warType);
          var d = descriptionFilter(this.options['share-description']);
          if (undefined !== d) {
            props.shareDescription = d;
            this.out.info("Using share description from command line: " + chalk.reset.dim.cyan(d));
            return false;
          }
          return show;
        }.bind(this),
        message: 'Description for share amp?',
        filter: descriptionFilter,
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
        if (this.props.removeDefaultSourceSamples) {
          this.moduleManager.pushOp(
            function() {
              this.sdk.removeRepoSamples.call(this, 
                modulePath,
                this.config.get(constants.PROP_PROJECT_PACKAGE),
                prefix
              );
            }.bind(this)
          );
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
        if (this.props.removeDefaultSourceSamples) {
          this.moduleManager.pushOp(
            function() {
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

  install: function () {
    if (this.bail) return;
  }
});

function warFilter(war) {
  if (!_.isString(war) || _.isEmpty(war)) return undefined;
  var w = war.toLocaleLowerCase();
  if ('repo'  === w) return constants.WAR_TYPE_REPO;
  if ('share' === w) return constants.WAR_TYPE_SHARE;
  if ('both'  === w) return WAR_TYPE_BOTH;
  return undefined;
}

function projectGroupIdFilter(projectGroupId) {
  return filters.requiredTextFilter(projectGroupId);
}

function projectArtifactIdPrefixFilter(projectArtifactIdPrefix) {
  return filters.requiredTextFilter(projectArtifactIdPrefix);
}

function projectVersionFilter(projectVersion) {
  return filters.requiredTextFilter(projectVersion);
}

function removeDefaultSourceSamplesFilter(removeDefaultSourceSamples) {
  return filters.booleanFilter(removeDefaultSourceSamples);
}

function createParentFilter(createParent) {
  return filters.booleanFilter(createParent);
}

function nameFilter(name) {
  return filters.optionalTextFilter(name);
}

function descriptionFilter(description) {
  return filters.optionalTextFilter(description);
}

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
