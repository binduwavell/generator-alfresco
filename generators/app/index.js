'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var constants = require('./constants.js');
var fs = require('fs');
var path = require('path');
var rmdir = require('rmdir');
var semver = require('semver');
var versions = require('./dependency-versions.js');
var yosay = require('yosay');
var _ = require('lodash');

module.exports = yeoman.Base.extend({
  initializing: function () {
    this.out = require('./app-output.js')(this);

    this.pkg = require('../../package.json');
    if (!this.config.get('originalGeneratorVersion')) {
      this.config.set('originalGeneratorVersion', this.pkg.version);
    }
    this.config.set('generatorVersion', this.pkg.version);
    this.sdkVersions = require('./sdk-versions.js');
    this.config.defaults({
      sdkVersion: '2.1.1',
      projectGroupId: 'org.alfresco',
      projectArtifactId: 'demo',
      projectVersion: '1.0.0-SNAPSHOT',
      projectPackage: 'org.alfresco',
      communityOrEnterprise: 'Community',
      removeDefaultSourceAmps: false,
      removeDefaultSourceSamples: false,
    });
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
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.green('Alfresco') + ' generator!'
    ));

    var prompts = [
      {
        type: 'list',
        name: constants.PROP_SDK_VERSION,
        message: 'Which SDK version would you like to use?',
        default: this.config.get(constants.PROP_SDK_VERSION),
        choices: _.keys(this.sdkVersions),
      },
      {
        type: 'input',
        name: constants.PROP_ARCHETYPE_VERSION,
        message: 'Archetype version?',
        default: function(props) {
          var savedArchetypeVersion = this.config.get(constants.PROP_ARCHETYPE_VERSION);
          if (savedArchetypeVersion) return savedArchetypeVersion;
          return this.sdk.archetypeVersion;
        }.bind(this),
        when: function(props) {
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
        default: this.config.get(constants.PROP_PROJECT_GROUP_ID),
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_ARTIFACT_ID,
        message: 'Project artifactId?',
        default: this.config.get(constants.PROP_PROJECT_ARTIFACT_ID),
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_VERSION,
        message: 'Project version?',
        default: this.config.get(constants.PROP_PROJECT_VERSION),
      },
      {
        type: 'input',
        name: constants.PROP_PROJECT_PACKAGE,
        message: 'Project package?',
        default: function(props) {
          return props.projectGroupId
        }.bind(this),
        when: function(props) {
          this.sdk = this.sdkVersions[props.sdkVersion];
          return this.sdk.promptForProjectPackage;
        }.bind(this),
      },
      {
        type: 'list',
        name: constants.PROP_COMMUNITY_OR_ENTERPRISE,
        message: 'Would you like to use Community or Enterprise?',
        default: this.config.get(constants.PROP_COMMUNITY_OR_ENTERPRISE),
        choices: ['Community', 'Enterprise'],
      },
      {
        type: 'confirm',
        name: constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS,
        message: 'Should we remove the default source amps?',
        default: this.config.get(constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS),
        when: function(props) {
          this.sdk = this.sdkVersions[props.sdkVersion];
          props[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS] = (true && this.sdk.removeDefaultModules);
          return props[constants.PROP_REMOVE_DEFAULT_SOURCE_AMPS];
        }.bind(this),
      },
      {
        type: 'confirm',
        name: constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES,
        message: 'Should we remove samples from the default source amps?',
        default: this.config.get(constants.PROP_REMOVE_DEFAULT_SOURCE_SAMPLES),
        when: function(props) {
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
      this.sdk = this.sdkVersions[props.sdkVersion];
      this._saveProps([
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
      this.moduleManager = require('./alfresco-module-manager.js')(this);
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
      // copy run.sh to top level folder
      this.fs.copy(
        this.destinationPath(path.join(constants.FOLDER_SCRIPTS, constants.FILE_RUN_SH)),
        this.destinationPath(constants.FILE_RUN_SH)
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
      if (!this.removeDefaultSourceAmps) {
        // Arrange for all generated beans to be included
        var paths = [];
        if (this.sdk.defaultModuleRegistry) {
          paths = this.sdk.defaultModuleRegistry.call(this)
            .filter(function (mod) {
              return (mod.war === constants.WAR_TYPE_REPO);
            })
            .map(function (mod) {
              return mod.path;
            });
        }
        if (paths && paths.length > 0) {
          paths.forEach(function(p) {
            var moduleContextPath = p + '/src/main/amp/config/alfresco/module/' + p + '/module-context.xml';
            var importPath = 'classpath:alfresco/module/${project.artifactId}/context/generated/*-context.xml';

            var contextDocOrig = this.fs.read(this.destinationPath(moduleContextPath));
            var context = require('./spring-context.js')(contextDocOrig);
            if (!context.hasImport(importPath)) {
              context.addImport(importPath);
              var contextDocNew = context.getContextString();
              // console.log(contextDocNew);
              this.fs.write(moduleContextPath, contextDocNew);
            }

            var generatedReadmePath = p + '/src/main/amp/config/alfresco/module/' + p + '/context/generated/README.md';
            this.fs.copyTpl(
              this.templatePath('generated-README.md'),
              this.destinationPath(generatedReadmePath)
            );
          }.bind(this));
        }
      }
      // Make sure source_amps is included in the top pom
      var topPomPath = this.destinationPath('pom.xml');
      var topPomContent = this.fs.read(topPomPath);
      var topPom = require('./maven-pom.js')(topPomContent);
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
          this.sdk.removeRepoSamples.call(this, 'repo-amp');
        }
        if (this.sdk.removeShareSamples) {
          // TODO(bwavell): 'share-amp' should be generalized
          this.sdk.removeShareSamples.call(this, 'share-amp');
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
        fs.chmod(cwd + '/' + scriptName, '0755', function(err) {
          if (err) {
            this.out.error(err);
          } else {
            this.out.info('Marking ' + scriptName + ' as executable');
          }
        }.bind(this));
      }.bind(this));
    }
  },

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
