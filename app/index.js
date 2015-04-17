'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var child_process = require('child_process');
var fs = require('fs');
var rmdir = require('rmdir');
var yosay = require('yosay');

/*

Here is how we can setup a project using an unnatended maven archetype
mvn archetype:generate -DinteractiveMode=false \
    -DarchetypeGroupId=org.alfresco.maven.archetype -DarchetypeArtifactId=alfresco-allinone-archetype -DarchetypeVersion=2.0.0 \
    -DgroupId=com.ziaconsulting -DartifactId=aio -Dversion=1.0.0-SNAPSHOT

*/

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.sdkVersions = {
      "2.0.0": {
        url: "https://github.com/Alfresco/alfresco-sdk.git",
        username: "Alfresco",
        repo: "alfresco-sdk",
        branch: "alfresco-sdk-aggregator-2.0.0",
        archetyperoot: 'archetypes/alfresco-allinone-archetype/src/main/resources/archetype-resources/',
        archetypefilters: ['pom.xml', 'run.sh', 'runner/src/main/webapp/index.html'],
      },
      "master": {
        url: "https://github.com/Alfresco/alfresco-sdk.git",
        username: "Alfresco",
        repo: "alfresco-sdk",
        branch: "master",
        archetyperoot: 'archetypes/alfresco-allinone-archetype/src/main/resources/archetype-resources/',
        archetypefilters: ['pom.xml', 'run.sh', 'runner/src/main/webapp/index.html'],
      }
    };
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.green('Alfresco') + ' generator!'
    ));

    var prompts = [{
      type: 'list',
      name: 'sdkVersion',
      message: 'Which SDK version would you like to use?',
      default: '2.0.0',
      store: true,
      choices: [
        '2.0.0',
        'master'
      ]
    }];

    this.prompt(prompts, function (props) {
      this.sdk = this.sdkVersions[props.sdkVersion];
      this.props = props;
      done();
    }.bind(this));
  },

  configuring: {
    saveConfig: function () {
      // Save config
      this.config.save();
    },
    archetype: function () {
      var done = this.async();

      var generated_path = 'yoaio';
      var cwd = process.cwd();
      this.log('Current working directory: ', cwd);

      var cmd = 'mvn';
      var args = [
        'archetype:generate',
        '-DinteractiveMode=false',
        '-DarchetypeGroupId=org.alfresco.maven.archetype',
        '-DarchetypeArtifactId=alfresco-allinone-archetype',
        '-DarchetypeVersion=2.0.0',
        '-DgroupId=com.ziaconsulting',
        '-DartifactId=yoaio',
        '-Dversion=1.0.0-SNAPSHOT',
        '-Dpackage=com.ziaconsulting.yoaio'
      ];
      var proc = this.spawnCommand(cmd, args, this._.defaults({ stdio: 'inherit' }));

      // Once mvn completes move stuff up a level
      proc.on('exit', function(code, signal) {
        var sdkContents = fs.readdirSync(cwd + '/' + generated_path);
        this._(sdkContents).forEach(function(fileOrFolder) {
          this.fs.copy(
            cwd + '/' + generated_path + '/' + fileOrFolder,
            this.destinationPath(fileOrFolder)
          );
        }.bind(this));
        rmdir(cwd + '/' + generated_path, function (err, dir, files) {

        }.bind(this));
        done();
      }.bind(this));
    }
  },

  writing: {
    app: function () {

      // Copy project files
      /*
      this.fs.copy(
        this.templatePath('_package.json'),
        this.destinationPath('package.json')
      );
      this.fs.copy(
        this.templatePath('_bower.json'),
        this.destinationPath('bower.json')
      );
      */
    },

  },

  install: {
  },

});
