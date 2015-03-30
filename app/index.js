'use strict';
var regulate = require('./regulate');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
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

  writing: {
    app: function () {
      // Save config
      this.config.save();
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

    getarchetype: function () {
      var done = this.async();

      // Download the appropriate SDK branch from github and copy the
      // all-in-one archetype into our project. Performing velocity
      // substitution for files we plan to adjust.
      var archetypePathPrefix = this.sdk.archetyperoot;
      this.remote(this.sdk.username, this.sdk.repo, this.sdk.branch, function(err, remote, files) {
        // remote.directory() doesn't pass the process function argument to the
        // main directory() function so we have to do the work ourselves.
        var savedSourceRoot = this.sourceRoot();
        this.sourceRoot(remote.cachePath);
        this.directory(
          archetypePathPrefix,
          this.destinationPath(),
          function(body, source, dest) {
            // The SDK does some value replacement as the archetypes are built,
            // before they are posted to maven central, this performs similar
            // replacements.
            var shouldPrefilter = this._.any(this.sdk.archetypefilters, function(item) {
              var pathedItem = remote.cachePath + '/' + archetypePathPrefix + item;
              return (source == pathedItem)
            }.bind(this));
            if (shouldPrefilter) {
              // TODO: These values should come from the sdk configuration
              body = regulate.render(body, {
                'alfresco.sdk.parent.version' : '2.0.0',
                'springloaded.version' : '1.2.0.RELEASE',
              });
            }
            // Simulate maven archetype velocity filtering
            // TODO: These values should be provided by the user
            // TODO: Submodules are handle in a special way by
            //       the archetype system. As such we need to
            //       inject an modules list into the top level
            //       pom. Additionally we need for the artifactId
            //       for sub-modules to not be the same as the
            //       rootArtifactId.
            body = regulate.render(body, {
              rootArtifactId: 'aio',
              groupId: 'com.ziaconsulting',
              artifactId: 'aio',
              version: '1.0.0-SNAPSHOT',
              alfresco_target_groupId: 'org.alfresco',
              alfresco_target_version: '5.0.c',
            }, {
              prefix: '\\${',
              suffix: '}'
            });
            return body;
          }.bind(this));
        this.sourceRoot(savedSourceRoot);

        done();
      }.bind(this), false);
    },

  },

});
