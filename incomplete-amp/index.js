'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var inspect = require('eyes').inspector({maxLength: false});
var xml2js = require('xml2js');
var yosay = require('yosay');
var walk = require("walk");
var path = require("path");
var ampProps;

module.exports = yeoman.generators.Base.extend({
    initializing : function() {
        this.log(yosay(
                'Welcome to the ' + chalk.green('Alfresco') + ' AMP generator!'
              ));
    },

    prompting: function () {

        var prompts = [
          {
            type: 'input',
            name: 'moduleGroupId',
            message: 'Module groupId?',
            default: this.config.get('projectGroupId'),
          },
          {
            type: 'input',
            name: 'moduleId',
            message: 'Module Id?',
            default: this.config.get('projectArtifactId'),
          },
          {
            type: 'input',
            name: 'moduleVersion',
            message: 'Module version?',
            default: this.config.get('projectVersion'),
          },
        ];

        var donePrompting = this.async();
        this.prompt(prompts, function (props) {
          ampProps = props;
          donePrompting();
        }.bind(this));
    },

    writing : function() {
        var done = this.async();

        this.template(this.templatePath('/'+this.config.get('sdkVersion')+'/amps_source.xml'), this.destinationPath('amps_source/pom.xml'), {
            groupId : this.config.get('projectGroupId'),
            version : this.config.get('projectVersion'),
            projectName : this.config.get('projectArtifactId')
        });

        this.directory(this.templatePath('/'+this.config.get('sdkVersion')+'/new_module'),
            this.destinationPath('amps_source/'+ampProps['moduleId']),
            function(body, source, dest) {
            this.log("======> "+source + " --- " + ampProps['moduleVersion']);
            return this.engine(body, {
                groupId : ampProps['moduleGroupId'],
                version : ampProps['moduleVersion'],
                moduleId : ampProps['moduleId'],
                projectGroupId : this.config.get('projectGroupId'),
                projectVersion : this.config.get('projectVersion'),
                projectName : this.config.get('projectArtifactId')
            });
        }.bind(this));

        done();
    },

    install: function() {
        var done = this.async();

        // We need to process the folders bottom up which can be acheived by
        // capturing the folders top down and reversing the array. The reason
        // for this is we can rename something lower before something closer
        // to the root and then have a change of renaming something closer to
        // the root. The other way around does not work well.
        var moduleId = ampProps['moduleId'];
        var pathToProcess = this.destinationPath('amps_source/'+moduleId);
        var dirs = [];
        var walker = walk.walk(pathToProcess);
        walker.on('directory', function(root, dirStats, next) {
          dirs.push({"path": root, "filename": dirStats.name});
          next();
        }.bind(this));
        walker.on('errors', function(root, nodeStatsArray, next) {
          this._.forEach(nodeStatsArray,
            function(stat) {
              this.log("ERROR: " + stat.error);
            });
          next();
        }.bind(this));
        walker.on('end', function() {
          dirs.reverse();
          this._.forEach(dirs,
            function(dir) {
              if(dir.filename.indexOf('{moduleId}') >= 0) {
                try {
                  fs.renameSync(path.join(dir.path, dir.filename), path.join(dir.path, dir.filename.replace('{moduleId}',moduleId)));
                } catch (err) {
                  this.log(err.message);
                }
              }
            }.bind(this));
          done();
        }.bind(this));
    }
});
