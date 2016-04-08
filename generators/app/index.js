'use strict';
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var rmdir = require('rmdir');
var semver = require('semver');
var constants = require('./../common/constants.js');
var versions = require('./../common/dependency-versions.js');

module.exports = yeoman.Base.extend({
  _getConfigValue: function(key) {
    if(!_.isNil(key)) {
      if(!_.isNil(this.config.get(key))) {
        return this.config.get(key);
      } else if (this.defaultConfig) {
        return this.defaultConfig[key];
      }
    }
    return undefined;
  },
  initializing: function () {
    this.out = require('./../common/app-output.js')(this);

    this.pkg = require('../../package.json');
    this.sdkVersions = require('./../common/sdk-versions.js');
    this.defaultConfig = {
      sdkVersion: '2.1.1',
      projectGroupId: 'org.alfresco',
      projectArtifactId: path.basename(process.cwd()),
      projectVersion: '1.0.0-SNAPSHOT',
      projectPackage: 'org.alfresco',
      communityOrEnterprise: 'Community',
      removeDefaultSourceAmps: true,
      removeDefaultSourceSamples: true,
    };
    this.bail = false;
    try {
      this.javaVersion = versions.getJavaVersion();
      if (!this.javaVersion) {
        throw new Error('We are unable to find a java executable. A compatible version of java is required.');
      }
      this.mavenVersion = versions.getMavenVersion();
      if (!this.mavenVersion) {
        throw new Error('We are unable to find a maven executable. A compatible version of maven is required.');
      }
    } catch (e) {
      this.out.error(e.message);
      this.bail = true;
    }
  },

  prompting: function () {
    if (this.bail) return;

    // Display banner/logo
    this.out.banner();

    var prompts = [
      {
        type: 'confirm',
        name: constants.PROP_ABORT_EXISTING_PROJECT,
        when: function(props) {
          if(this.bail) return false;
          // If we find the .yo-rc.json file, show the warning
          if(fs.existsSync(this.config.path)) {
            this.out.warn(
              'You are running the command within an existing project '
              + chalk.green('"'+this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID) + '"')
              + ' located at ' + chalk.green('"'+path.dirname(this.config.path)+'"')+'.'
              + ' Aborting will exit the generator. If you choose not to abort,'
              + ' the generator will continue with its interview questions.'
            );
            return true;
          } else {
            return false;
          }
        }.bind(this),
        default: true,
        message: 'Do you want to abort?',
      },
      {
        type: 'list',
        name: constants.PROP_SDK_VERSION,
        when: function(props) {
          if(props[constants.PROP_ABORT_EXISTING_PROJECT]) {
            this.bail = true;
          }
          if(this.bail) return false;
          this.out.docs(
            'For Alfresco 5.0 development we suggest using the 2.1.1 SDK, For Alfresco 5.1 development, use the 2.2.0 SDK.',
            'http://docs.alfresco.com/community/concepts/alfresco-sdk-compatibility.html');
          return true;
        }.bind(this),
        default: this._getConfigValue(constants.PROP_SDK_VERSION),
        message: 'Which SDK version would you like to use?',
        choices: _.keys(this.sdkVersions),
      },
      {
        type: 'input',
        name: constants.PROP_ARCHETYPE_VERSION,
        message: 'Archetype version?',
        default: function(props) {
          var savedArchetypeVersion = this._getConfigValue(constants.PROP_ARCHETYPE_VERSION);
          if (savedArchetypeVersion) return savedArchetypeVersion;
          return this.sdk.archetypeVersion;
        }.bind(this),
        when: function(props) {
          if(this.bail) return false;
          this.sdk = this.sdkVersions[props.sdkVersion];
          if (this.sdk.promptForArchetypeVersion) {
            return true;
          } else {
            // if we don't prompt then save the version anyway
            props[constants.PROP_ARCHETYPE_VERSION] = this.sdk.archetypeVersion;
            return false;
          }
        }.bind(this),
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_GROUP_ID,
        message: 'Project groupId?',
        default: this._getConfigValue(constants.PROP_PROJECT_GROUP_ID),
        when: function(props) {
          if(this.bail) return false;
          return true;
        }.bind(this),
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_ARTIFACT_ID,
        when: function(props) {
          if(this.bail) return false;
          return true;
        }.bind(this),
        default: this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID),
        message: 'Project artifactId?',
      },
      {
        // When run inside a existing project
        type: 'confirm',
        name: constants.PROP_ABORT_PROJECT_ARTIFACT_ID_UPDATE,
        when: function(props) {
          if(this.bail) return false;
          if(fs.existsSync(this.config.path) && !_.isEqual(props[constants.PROP_PROJECT_ARTIFACT_ID], this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID))) {
            return true;
          }
          return false;
        }.bind(this),
        default: true,
        message: 'Updating the artifactId can lead to unexpected issues. Do you want to abort?',
      },
      {
        // When run inside a non-existing project
        type: 'confirm',
        name: constants.PROP_CREATE_SUB_FOLDER,
        when: function(props) {
          if(props[constants.PROP_ABORT_PROJECT_ARTIFACT_ID_UPDATE]) {
            this.bail = true;
          }
          if(this.bail) return false;
          if(!fs.existsSync(this.config.path) && !_.isEqual(props[constants.PROP_PROJECT_ARTIFACT_ID], this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID))) {
            this.out.warn('The artifactId must match the name of the artifact folder. As such, we are going to create a sub-folder in the existing folder named: "'
              +props[constants.PROP_PROJECT_ARTIFACT_ID]+'".')
            return true;
          }
          return false;
        }.bind(this),
        default: true,
        message: 'Do you want to proceed?',
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_VERSION,
        when: function(props) {
          if(!_.isNil(props[constants.PROP_CREATE_SUB_FOLDER]) && !props[constants.PROP_CREATE_SUB_FOLDER]) {
            this.bail = true;
          }
          if(this.bail) return false;
          return true;
        }.bind(this),
        default: this._getConfigValue(constants.PROP_PROJECT_VERSION),
        message: 'Project version?',
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_PACKAGE,
        message: 'Project package?',
        default: function(props) {
          return props.projectGroupId
        }.bind(this),
        when: function(props) {
          if(this.bail) return false;
          this.sdk = this.sdkVersions[props.sdkVersion];
          return this.sdk.promptForProjectPackage;
        }.bind(this),
      },
      {
        type: 'list',
        name: constants.PROP_COMMUNITY_OR_ENTERPRISE,
        message: 'Would you like to use Community or Enterprise?',
        default: this._getConfigValue(constants.PROP_COMMUNITY_OR_ENTERPRISE),
        choices: ['Community', 'Enterprise'],
        when: function(props) {
          if(this.bail) return false;
          return true;
        }.bind(this),
      },
      {
        type: 'confirm',
        name: constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS,
        message: 'Should we remove the default source amps?',
        default: this._getConfigValue(constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS),
        when: function(props) {
          if(this.bail) return false;
          this.sdk = this.sdkVersions[props.sdkVersion];
          props[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS] = (true && this.sdk.removeDefaultModules);
          return props[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS];
        }.bind(this),
      },
      {
        type: 'confirm',
        name: constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES,
        message: 'Should we remove samples from the default source amps?',
        default: this._getConfigValue(constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES),
        when: function(props) {
          if(this.bail) return false;
          if (props[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS]) {
            props[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES] = false;
          } else {
              this.sdk = this.sdkVersions[props.sdkVersion];
              props[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES] =
                (true && (this.sdk.removeRepoSamples || this.sdk.removeShareSamples));
          }
          return props[constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES];
        }.bind(this),
      },
    ];

    var donePrompting = this.async();
    this.prompt(prompts, function (props) {
      // The below 2 if conditions are here because the prompts used in testing
      // are not injected into the prompts
      if(!_.isNil(props[constants.PROP_ABORT_EXISTING_PROJECT]) && props[constants.PROP_ABORT_EXISTING_PROJECT]) {
        this.bail = true;
      }
      if(!_.isNil(props[constants.PROP_CREATE_SUB_FOLDER]) && !props[constants.PROP_CREATE_SUB_FOLDER]) {
        this.bail = true;
      }
      if(!this.bail) {
        props.generatorVersion = this.pkg.version;
        if (!this.config.get(constants.PROP_ORIGINAL_GENERATOR_VERSION)) {
          props[constants.PROP_ORIGINAL_GENERATOR_VERSION] = this.pkg.version;
        }
        if(!fs.existsSync(this.config.path) && !_.isEqual(props[constants.PROP_PROJECT_ARTIFACT_ID], this._getConfigValue(constants.PROP_PROJECT_ARTIFACT_ID))) {
          var projectPath = path.join(process.cwd(),props[constants.PROP_PROJECT_ARTIFACT_ID]);
          if(!_.isNil(projectPath) && !_.isEqual(process.cwd(), projectPath)) {
            if (!fs.existsSync(projectPath)) {
              fs.mkdirSync(projectPath);
            }
            process.chdir(projectPath);
            this.destinationRoot(projectPath);
          }
        }
        this.sdk = this.sdkVersions[props.sdkVersion];
        this._saveProps([
          constants.PROP_ORIGINAL_GENERATOR_VERSION,
          constants.PROP_GENERATOR_VERSION,
          constants.PROP_SDK_VERSION,
          constants.PROP_ARCHETYPE_VERSION,
          constants.PROP_PROJECT_GROUP_ID,
          constants.PROP_PROJECT_ARTIFACT_ID,
          constants.PROP_PROJECT_VERSION,
          constants.PROP_PROJECT_PACKAGE,
          constants.PROP_COMMUNITY_OR_ENTERPRISE,
          constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS,
          constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES,
        ], props);
        // can only setup module registry/manager once we have other variables setup
        this.moduleManager = require('./../common/alfresco-module-manager.js')(this);
      }
      donePrompting();
    }.bind(this));
  },

  _saveProp: function(propName, propObject) {
    var value = propObject[propName];
    this[propName] = value;
    this.config.set(propName, value);
  },

  _saveProps: function(propNames, propObject) {
    propNames.forEach(function(propName) {
      // console.log("SETTING " + propName + " to " + propObject[propName]);
      this._saveProp(propName, propObject);
    }.bind(this));
  },

  configuring: {
    saveConfig: function () {
      if (this.bail) return;
      this.config.save();
    },
  },

  default: {
    checkVersions: function () {
      if (this.bail) return;
      try {
        if (!semver.satisfies(this.javaVersion.replace(/_[0-9]+$/, ''), this.sdk.supportedJavaVersions)) {
          throw new Error('Unfortunately the current version of java (' + this.javaVersion + ') ' +
              'does not match one of the supported versions: ' + this.sdk.supportedJavaVersions + ' ' +
              'for the SDK you have selected (' + this.archetypeVersion + '). ' +
              'Either set JAVA_HOME to point to a valid version of java or install one.');
        }
        if (!semver.satisfies(this.mavenVersion, this.sdk.supportedMavenVersions)) {
          throw new Error('Unfortunately the current version of maven (' + this.mavenVersion + ') ' +
              'does not match one of the supported versions: ' + this.sdk.supportedMavenVersions + ' ' +
              'for the SDK you have selected (' + this.archetypeVersion + '). ' +
              'Please install a supported version.');
        }
      } catch (e) {
        this.out.error(e.message);
        this.bail = true;
      }
    },
  },

  writing: {
    generateArchetype: function () {
      if (this.bail) return;
      var done = this.async();

      this.out.info('Attempting to use maven and the ' + this.archetypeVersion + ' all-in-one archetype to setup your project.');

      var cwd = process.cwd();

      var tmpDir = path.join(cwd, 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
      }
      process.chdir(tmpDir);

      var cmd = 'mvn';
      var args = [
        'archetype:generate',
        '-DinteractiveMode=false',
        '-DarchetypeGroupId=' + this.sdk.archetypeGroupId,
        '-DarchetypeArtifactId=' + this.sdk.archetypeArtifactId,
        '-DarchetypeVersion=' + this.archetypeVersion,
        '-DgroupId=' + this.projectGroupId,
        '-DartifactId=' + this.projectArtifactId,
        '-Dversion=' + this.projectVersion,
      ];
      if (undefined !== this.sdk.archetypeCatalog) {
        args.push('-DarchetypeCatalog=' + this.sdk.archetypeCatalog);
      }
      if (undefined !== this.projectPackage) {
        args.push('-Dpackage=' + this.projectPackage);
      }
      var proc = this.spawnCommand(cmd, args);

      // Once mvn completes move stuff up a level
      proc.on('exit', function(code, signal) {
        this.out.info('Maven completed, processing files generated by archetype');
        process.chdir(cwd); // restore current working directory
        var genDir = path.join(tmpDir, this.projectArtifactId);
        var sdkContents = fs.readdirSync(genDir);
        sdkContents.forEach(function(fileOrFolder) {
          var absSourcePath = path.join(genDir, fileOrFolder);
          this.fs.copy(
            absSourcePath,
            this.destinationPath(fileOrFolder)
          );
        }.bind(this));

        if (this.sdk.defaultModuleRegistry) {
          this.out.info('Attempting to backup generated amp templates');
          var folders = this.sdk.defaultModuleRegistry.call(this).map(function(mod) {
            return mod.artifactId;
          })
          folders.forEach(
            function(folderName) {
              var to = path.join(this.destinationPath(constants.FOLDER_SOURCE_TEMPLATES), folderName );
              if (!fs.existsSync(to)) {
                var from = path.join(genDir, folderName);
                this.out.info('Copying from: ' + from + ' to: ' + to);
                this.fs.copy(from, to);
              } else {
                this.out.warn('Not copying ' + folderName + ' as it has already been backed up')
              }
            }.bind(this));
        } else {
          this.out.warn("Not backing up generated amp templates as we don't have default modules defined for this "
              + "version of the SDK.");
        }

        rmdir(tmpDir, function (err, dir, files) {
          // nothing to do here
        }.bind(this));

        done();
      }.bind(this));
    },
    generatorOverlay: function () {
      if (this.bail) return;
      var isEnterprise = ('Enterprise' === this.communityOrEnterprise);
      var tplContext = {
        isEnterprise: isEnterprise,
        enterpriseFlag: (isEnterprise ? '-Penterprise' : ''),
        projectGroupId: this.config.get(constants.PROP_PROJECT_GROUP_ID),
        projectArtifactId: this.config.get(constants.PROP_PROJECT_ARTIFACT_ID),
        projectVersion: this.config.get(constants.PROP_PROJECT_VERSION),
        sdkVersionPrefix: this.sdk.sdkVersionPrefix.call(this),
      };
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );
      this.fs.copyTpl(
        this.templatePath('TODO.md'),
        this.destinationPath('TODO.md'),
        tplContext
      );
      // copy template folders
      [constants.FOLDER_AMPS, constants.FOLDER_AMPS_SHARE, constants.FOLDER_CUSTOMIZATIONS,
       constants.FOLDER_MODULES, constants.FOLDER_SOURCE_TEMPLATES, constants.FOLDER_SCRIPTS].forEach(
        function(folderName) {
          this.out.info('Copying ' + folderName);
          this.fs.copyTpl(
            this.templatePath(folderName),
            this.destinationPath(folderName),
            tplContext
          );
        }.bind(this)
      );
      // copy run.sh, run-without-springloaded.sh and debug.sh to top level folder
      [constants.FILE_RUN_SH, constants.FILE_RUN_WITHOUT_SPRINGLOADED_SH, constants.FILE_DEBUG_SH].forEach(
        function(fileName) {
          this.fs.copy(
            this.destinationPath(path.join(constants.FOLDER_SCRIPTS, fileName)),
            this.destinationPath(fileName)
          );
        }.bind(this)
      );
      // enterprise specific stuff
      if (isEnterprise) {
        this.fs.copy(
          this.templatePath(constants.FOLDER_REPO),
          this.destinationPath(constants.FOLDER_REPO),
          tplContext);
      }
    },
    registerDefaultSampleModules: function() {
      if (this.bail) return;
      if (this.sdk.registerDefaultModules) {
        this.sdk.registerDefaultModules.call(this);
      }
    },
    editGeneratedResources: function() {
      if (this.bail) return;
      if (!this.removeDefaultSourceAmps && this.sdk.defaultModuleRegistry) {
        if (this.sdk.setupNewRepoModule) {
          // Arrange for all generated beans to be included
          var paths = this.sdk.defaultModuleRegistry.call(this)
            .filter(function (mod) {
              return (mod.war === constants.WAR_TYPE_REPO);
            })
            .map(function (mod) {
              return mod.path;
            });
          if (paths && paths.length > 0) {
            paths.forEach(function(p) {
              this.sdk.setupNewRepoModule.call(this, p);
            }.bind(this));
          }
        }
        if (this.sdk.setupNewShareModule) {
          // Arrange for all generated beans to be included
          var paths = this.sdk.defaultModuleRegistry.call(this)
            .filter(function (mod) {
              return (mod.war === constants.WAR_TYPE_REPO);
            })
            .map(function (mod) {
              return mod.path;
            });
          if (paths && paths.length > 0) {
            paths.forEach(function(p) {
              this.sdk.setupNewShareModule.call(this, p);
            }.bind(this));
          }
        }
      }
      // Make sure customizations/pom.xml is included in the top pom
      var topPomPath = this.destinationPath('pom.xml');
      var topPomContent = this.fs.read(topPomPath);
      var topPom = require('./../common/maven-pom.js')(topPomContent);
      topPom.addModule(constants.FOLDER_CUSTOMIZATIONS, true);
      this.fs.write(topPomPath, topPom.getPOMString());
    },
    removeDefaultSourceModules: function() {
      if (this.bail) return;
      if (this.removeDefaultSourceAmps && this.sdk.removeDefaultModules) {
        this.sdk.removeDefaultModules.call(this);
      }
    },
    removeDefaultSourceModuleSamples: function() {
      if (this.bail) return;
      if (!this.removeDefaultSourceAmps && this.removeDefaultSourceSamples) {
        if (this.sdk.removeRepoSamples) {
          // TODO(bwavell): 'repo-amp' should be generalized
          this.sdk.removeRepoSamples.call(this, 
            this.sdk.sdkVersionPrefix.call(this) + 'repo-amp',
            this.projectPackage
          );
        }
        if (this.sdk.removeShareSamples) {
          // TODO(bwavell): 'share-amp' should be generalized
          this.sdk.removeShareSamples.call(this, 
            this.sdk.sdkVersionPrefix.call(this) + 'share-amp',
            this.projectPackage
          );
        }
      }
    }
  },

  install: {
    makeScriptsExecutable: function () {
      if (this.bail) return;
      var cwd = process.cwd();
      var scripts = [
        constants.FILE_RUN_SH,
        path.join(constants.FOLDER_SCRIPTS, 'debug.sh'),
        path.join(constants.FOLDER_SCRIPTS, 'explode-alf-sources.sh'),
        path.join(constants.FOLDER_SCRIPTS, 'find-exploded.sh'),
        path.join(constants.FOLDER_SCRIPTS, 'grep-exploded.sh'),
        path.join(constants.FOLDER_SCRIPTS, 'package-to-exploded.sh'),
        path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_SH),
        path.join(constants.FOLDER_SCRIPTS, 'run-without-springloaded.sh'),
      ];
      scripts.forEach(function(scriptName) {
        this.out.info('Marking ' + scriptName + ' as executable');
        fs.chmodSync(cwd + '/' + scriptName, '0755');
      }.bind(this));
      if (this.removeDefaultSourceAmps) {
        this.out.warn('Sine you chose to remove default source amps, you should probably run "' + chalk.yellow('yo alfresco:amp') + '" to add customized source amps.');
      }
    }
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
