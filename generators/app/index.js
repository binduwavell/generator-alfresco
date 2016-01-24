'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
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
      includeGitIgnore: true,
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
        name: 'sdkVersion',
        message: 'Which SDK version would you like to use?',
        default: this.config.get('sdkVersion'),
        choices: _.keys(this.sdkVersions),
      },
      {
        type: 'input',
        name: 'archetypeVersion',
        message: 'Archetype version?',
        default: function(props) {
          var savedArchetypeVersion = this.config.get('archetypeVersion');
          if (savedArchetypeVersion) return savedArchetypeVersion;
          return this.sdk.archetypeVersion;
        }.bind(this),
        when: function(props) {
          this.sdk = this.sdkVersions[props.sdkVersion];
          if (this.sdk.promptForArchetypeVersion) {
            return true;
          } else {
            // if we don't prompt then save the version anyway
            props['archetypeVersion'] = this.sdk.archetypeVersion;
            return false;
          }
        }.bind(this),
      },
      {
        type: 'input',
        name: 'projectGroupId',
        message: 'Project groupId?',
        default: this.config.get('projectGroupId'),
      },
      {
        type: 'input',
        name: 'projectArtifactId',
        message: 'Project artifactId?',
        default: this.config.get('projectArtifactId'),
      },
      {
        type: 'input',
        name: 'projectVersion',
        message: 'Project version?',
        default: this.config.get('projectVersion'),
      },
      {
        type: 'input',
        name: 'projectPackage',
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
        name: 'communityOrEnterprise',
        message: 'Would you like to use Community or Enterprise?',
        default: this.config.get('communityOrEnterprise'),
        choices: ['Community', 'Enterprise'],
      },
      {
        type: 'confirm',
        name: 'includeGitIgnore',
        message: 'Should we generate a default .gitignore file?',
        default: this.config.get('includeGitIgnore'),
      },
      {
        type: 'confirm',
        name: 'removeDefaultSourceAmps',
        message: 'Should we remove the default source amps?',
        default: this.config.get('removeDefaultSourceAmps'),
        when: function(props) {
          this.sdk = this.sdkVersions[props.sdkVersion];
          props['removeDefaultSourceAmps'] = (true && this.sdk.removeDefaultModules);
          return props['removeDefaultSourceAmps'];
        }.bind(this),
      },
      {
        type: 'confirm',
        name: 'removeDefaultSourceSamples',
        message: 'Should we remove samples from the default source amps?',
        default: this.config.get('removeDefaultSourceSamples'),
        when: function(props) {
          if (props['removeDefaultSourceAmps']) {
            props['removeDefaultSourceSamples'] = false;
          } else {
              this.sdk = this.sdkVersions[props.sdkVersion];
              props['removeDefaultSourceSamples'] =
                (true && (this.sdk.removeRepoSamples || this.sdk.removeShareSamples));
          }
          return props['removeDefaultSourceSamples'];
        }.bind(this),
      },
    ];

    var donePrompting = this.async();
    this.prompt(prompts, function (props) {
      this.sdk = this.sdkVersions[props.sdkVersion];
      this._saveProps([
        'sdkVersion',
        'archetypeVersion',
        'projectGroupId',
        'projectArtifactId',
        'projectVersion',
        'projectPackage',
        'communityOrEnterprise',
        'includeGitIgnore',
        'removeDefaultSourceAmps',
        'removeDefaultSourceSamples',
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
              var to = path.join(this.destinationPath('amps_source_templates'), folderName );
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
        projectGroupId: this.config.get('projectGroupId'),
        projectArtifactId: this.config.get('projectArtifactId'),
        projectVersion: this.config.get('projectVersion'),
      };
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      if (this.includeGitIgnore) {
        this.fs.copy(
          this.templatePath('gitignore'),
          this.destinationPath('.gitignore')
        );
      }
      this.fs.copyTpl(
        this.templatePath('TODO.md'),
        this.destinationPath('TODO.md'),
        tplContext
      );
      // copy folders
      ['amps', 'amps_share', 'amps_source', 'amps_source_templates', 'scripts'].forEach(
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
        this.destinationPath('scripts/run.sh'),
        this.destinationPath('run.sh')
      );
      // enterprise specific stuff
      if (isEnterprise) {
        this.fs.copy(
          this.templatePath('repo'),
          this.destinationPath('repo'),
          tplContext);
      }
    },
    registerDefaultSampleAmps: function() {
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
              return (mod.war === 'repo');
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
      topPom.addModule('amps_source', true);
      this.fs.write(topPomPath, topPom.getPOMString());
      /* Eventually we'll need to make sure the modules
         list is updated if the app generator is run
         after some custom source amps are added. Following
         code gets us access to the pom file.
      var ampsSourcePomPath = this.destinationPath('amps_source/pom.xml');
      var ampsSourcePom = this.fs.read(ampsSourcePomPath);
      var pom = require('./maven-pom.js')(ampsSourcePom);
      pom.setParentGAV(
          this.config.get('projectGroupId'),
          this.config.get('projectArtifactId'),
          this.config.get('projectVersion'));
      this.fs.write(ampsSourcePomPath, pom.getPOMString());
      */
    },
    removeDefaultSampleAmps: function() {
      if (this.bail) return;
      if (this.removeDefaultSourceAmps && this.sdk.removeDefaultModules) {
        this.sdk.removeDefaultModules.call(this);
      }
    },
    removeSamplesScript: function() {
      if (this.bail) return;
      if (!this.removeDefaultSourceAmps && this.removeDefaultSourceSamples) {
        if (this.sdk.removeRepoSamples) {
          this.sdk.removeRepoSamples.call(this, 'repo-amp');
        }
        if (this.sdk.removeShareSamples) {
          this.sdk.removeShareSamples.call(this, 'share-amp');
        }
      }
    }
  },

  install: {
    makeRunExecutable: function () {
      if (this.bail) return;
      var cwd = process.cwd();
      var scripts = [
        'run.sh',
        'scripts/debug.sh',
        'scripts/explode-alf-sources.sh',
        'scripts/find-exploded.sh',
        'scripts/grep-exploded.sh',
        'scripts/package-to-exploded.sh',
        'scripts/run.sh'
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
