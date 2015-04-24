'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
var rmdir = require('rmdir');
var semver = require('semver');
var versions = require('./versions.js');
var xml2js = require('xml2js');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.out = require('./app-output.js')(this);
    this.pkg = require('../package.json');
    this.config.set('generatorVersion', this.pkg.version);
    this.sdkVersions = {
      "2.0.0": {
        archetypeGroupId: 'org.alfresco.maven.archetype',
        archetypeArtifactId: 'alfresco-allinone-archetype',
        archetypeVersion: '2.0.0',
        promptForProjectPackage: false,
        supportedJavaVersions: '^1.7.0',
        supportedMavenVersions: '^3.0.5',
      },
      local: {
        archetypeGroupId: "org.alfresco.maven.archetype",
        archetypeArtifactId: "alfresco-allinone-archetype",
        archetypeVersion: "2.0.1-SNAPSHOT",
        archetypeCatalog: 'local',
        promptForArchetypeVersion: true,
        promptForProjectPackage: true,
        supportedJavaVersions: '^1.7.0',
        supportedMavenVersions: '^3.2.2',
      }
    };
    this.config.defaults({
      sdkVersion: '2.0.0',
      projectGroupId: 'org.alfresco',
      projectArtifactId: 'demoamp',
      projectVersion: '1.0.0-SNAPSHOT',
      projectPackage: 'org.alfresco',
      communityOrEnterprise: 'Community',
      includeGitIgnore: true,
    });
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
      throw e;
    }
  },

  prompting: function () {
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
        choices: this._.keys(this.sdkVersions),
      },
      {
        type: 'input',
        name: 'archetypeVersion',
        message: 'Archetype version?',
        default: function(props) {
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
      ], props);
      donePrompting();
    }.bind(this));
  },

  _saveProp: function(propName, propObject) {
    var value = propObject[propName];
    this[propName] = value;
    this.config.set(propName, value);
  },

  _saveProps: function(propNames, propObject) {
    this._.forEach(propNames, function(propName) {
      this._saveProp(propName, propObject);
    }.bind(this));
  },

  configuring: {
    saveConfig: function () {
      this.config.save();
    },
  },

  default: {
    checkVersions: function () {
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
        throw e;
      }
    },
  },

  writing: {
    generateArchetype: function () {
      var done = this.async();

      this.out.info('Attempting to use maven and the ' + this.archetypeVersion + ' all-in-one archetype to setup your project.');

      var cwd = process.cwd();

      var cmd = 'mvn';
      var args = [
        'archetype:generate',
        '-DinteractiveMode=false',
        '-DarchetypeGroupId=' + this.sdk.archetypeGroupId,
        '-DarchetypeArtifactId=' + this.sdk.archetypeArtifactId,
        '-DarchetypeVersion=' + this.sdk.archetypeVersion,
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
        var sdkContents = fs.readdirSync(cwd + '/' + this.projectArtifactId);
        this._(sdkContents).forEach(function(fileOrFolder) {
          this.fs.copy(
            cwd + '/' + this.projectArtifactId + '/' + fileOrFolder,
            this.destinationPath(fileOrFolder)
          );
        }.bind(this));
        rmdir(cwd + '/' + this.projectArtifactId, function (err, dir, files) {

        }.bind(this));
        done();
      }.bind(this));
    },
    editMavenResources: function() {
      var done = this.async();
      // Arrange for all generated beans to be icnluded
      var moduleContextPath = 'repo-amp/src/main/amp/config/alfresco/module/repo-amp/module-context.xml';
      xml2js.parseString(
        this.fs.read(this.destinationPath(moduleContextPath)),
        function(err, result) {
          // add generic import for all generated beans
          result.beans.import.push({$: {"resource": "classpath:alfresco/module/${project.artifactId}/context/generated/*-context.xml"}});
          // output XML, unfortunately xml2js messes with the xml a little bit
          // so we have to set standalone: false and we have to re-inject the
          // doctype.
          var opts = {
            xmldec: {version: '1.0', encoding: 'UTF-8', standalone: false},
            doctype: {
              pubID: '-//SPRING//DTD BEAN//EN',
              sysID: 'http://www.springframework.org/dtd/spring-beans.dtd'
            }
          };
          var builder = new xml2js.Builder(opts);
          var xml = builder.buildObject(result);
          this.fs.write(moduleContextPath, xml);
          done();
        }.bind(this)
      )
    },
    generatorOverlay: function () {
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
      // copy scripts
      this._.forEach(['run.sh', 'debug.sh'], function(scriptName) {
        this.fs.copy(
          this.templatePath(this.communityOrEnterprise.toLowerCase() + '/' + scriptName),
          this.destinationPath(scriptName)
        );
      }.bind(this));
      // copy folders
      this._.forEach(['amps', 'amps_share', 'amps_source', 'repo-amp'],
        function(folderName) {
          this.directory(folderName, folderName,
            function(body, source, dest) {
              return body;
            }.bind(this));
        }.bind(this)
      );
    },
  },

  install: {
    makeRunExecutable: function () {
      var cwd = process.cwd();
      this._.forEach(['run.sh', 'debug.sh'], function(scriptName) {
        fs.chmod(cwd + '/' + scriptName, '0755', function(err) {
          this.out.info('Marking ' + scriptName + ' as executable');
        }.bind(this));
      }.bind(this));
    }
  },

});
