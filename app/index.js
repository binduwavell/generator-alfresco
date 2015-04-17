'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var child_process = require('child_process');
var fs = require('fs');
var rmdir = require('rmdir');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.sdkVersions = {
      "2.0.0": {
        archetypeGroupId: 'org.alfresco.maven.archetype',
        archetypeArtifactId: 'alfresco-allinone-archetype',
        archetypeVersion: '2.0.0',
        promptForProjectPackage: false,
      },
      local: {
        archetypeGroupId: "org.alfresco.maven.archetype",
        archetypeArtifactId: "alfresco-allinone-archetype",
        archetypeVersion: "2.0.1-SNAPSHOT", // TODO(bwavell): need to figure this out dynamically
        archetypeCatalog: 'local',
        promptForProjectPackage: true,
      }
    };
    this.config.defaults({
      sdkVersion: '2.0.0',
      projectGroupId: 'org.alfresco',
      projectArtifactId: 'demoamp',
      projectVersion: '1.0.0-SNAPSHOT',
    });
    // TODO(bwavell): do we have a valid version of java?
    // TODO(bwavell): do we have a valid version of maven?
    // TODO(bwavell): are maven opts specified?
  },

  prompting: function () {
    var done = this.async();

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
    ];

    this.prompt(prompts, function (props) {
      this.sdk = this.sdkVersions[props.sdkVersion];
      this._saveProps(
        [
          'sdkVersion',
          'projectGroupId',
          'projectArtifactId',
          'projectVersion',
        ],
        props);
      /*
      this.projectGroupId = props.projectGroupId;
      this.projectArtifactId = props.projectArtifactId;
      this.projectVersion = props.projectVersion;
      */
      if (this.sdk.promptForProjectPackage) {
        prompts = [
          {
            type: 'input',
            name: 'projectPackage',
            message: 'Project package?',
            default: this.projectGroupId,
          },
        ];
        this.prompt(prompts, function (props) {
          this._saveProp('projectPackage', props);
          /*
          this.projectPackage = props.projectPackage;
          this.config.set('projectPackage', this.projectPackage);
          */
          done();
        }.bind(this));
      } else {
        this.projectPackage = 'org.alfresco';
        this.config.set('projectPackage', this.projectPackage);
        done();
      }


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
      // Save config
      this.config.save();
    },
  },

  writing: {
    archetype: function () {
      var done = this.async();

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
      var proc = this.spawnCommand(cmd, args, this._.defaults({ stdio: 'inherit' }));

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
    app: function () {
      this.fs.copy(
        this.templatePath('editorconfig'),
        this.destinationPath('.editorconfig')
      );
      // copy folders
      this._.forEach(['amps', 'amps_share', 'amps_source'], function(folderName) {
        this.directory(folderName, folderName,
          function(body, source, dest) {
            this.log("FROM: " + source + " TO: " + dest);
            return body;
          }.bind(this));
      }.bind(this));
    },
  },

  install: {
    makeRunExecutable: function () {
      var cwd = process.cwd();
      fs.chmod(cwd + '/run.sh', 755, function(err) {
        this.log("Marking run.sh as executable.")
      }.bind(this));
    }
  },

});
