'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var fs = require('fs');
var xml2js = require('xml2js');
var yosay = require('yosay');
var walk = require("fs-walk");
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
        
        walk.walk(this.destinationPath('amps_source/'+ampProps['moduleId']), function(basedir, filename, stat, next) {
            if(filename.indexOf('{moduleId}') >= 0) {
                fs.renameSync(path.join(basedir, filename), path.join(basedir, filename.replace('{moduleId}',ampProps['moduleId'])));
            }
        }.bind(this), function(err) {
            if (err) this.log(err);
        }.bind(this));
        
        done();
    }
});
