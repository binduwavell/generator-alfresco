'use strict';
var yeoman = require('yeoman-generator');

// TODO: escape content before it's written to XML, etc!

module.exports = yeoman.generators.Base.extend({
    initializing: function () {
	this.log("Let's make a web script!");
    },

    prompting: function () {
	var done = this.async();

	// get the default package from the information that was supplied when creating the project
	var defPkg = this.config.get('projectPackage') || 'com.ziaconsulting';

	this.prompt([
	    {
		type    : 'input',
		name    : 'name',
		message : 'Enter an ID for your web script, like "myScript". (NO SPACES)',
	    },
	    {
		type    : 'input',
		name    : 'shortName',
		message : 'Enter a short name, like "My Web Script".  (spaces are okay)',
	    },
	    {
		type    : 'input',
		name    : 'wsDesc',
		message : 'Enter a longer desciption',
	    },
	    {
		type    : 'input',
		name    : 'url',
		message : 'What should the URL be for your web script (relative to alfresco/service)',
	    },
	    {
		type    : 'list',
		name    : 'method',
		message : 'Enter the HTTP method to be used to access your web script',
		choices : ['get', 'post'],
	    },
	    {
		type    : 'list',
		name    : 'format',
		message : "Enter the web script's default output format",
		choices : ['json', 'xml', 'html', 'text'],
	    },
	    {
		type    : 'list',
		name    : 'auth',
		message : "Enter the authentication mechanism",
		choices : ['user', 'none'],
	    },
	    {
		type    : 'input',
		name    : 'pkg',
		message : 'Enter the package for your web script',
            default : defPkg,
	    },
	], function (answers) {
	    this.name      = answers.name;
	    this.shortName = answers.shortName;
	    this.wsDesc    = answers.wsDesc;
	    this.url       = answers.url;
	    this.method    = answers.method;
	    this.format    = answers.format;
	    this.auth      = answers.auth;
	    this.pkg       = answers.pkg;

	    // if a url was specified and it does not begin with a slash, prepend a slash
	    if (this.url && this.url.length > 0 && this.url.charAt(0) !== '/') {
		this.url = '/' + this.url;
	    }

	    done();
	}.bind(this));
    },

    writing: function () {

	// convert the "com.ziaconsulting.myproject" format package name to "com/ziaconsulting/myproject" format
	var pkgSlash = this.pkg.replace(/\./g, '/');

	// this is the path into the configuration area for our web script
	var webscriptPath = 'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/' + pkgSlash;

	// build a string like "mywebscript.get"
	var nameDotMethod = this.name + '.' + this.method;

	// copy the web script's descriptor file to the target area
	this.fs.copyTpl(
	    this.templatePath('webscript.get.desc.xml'),
	    this.destinationPath(webscriptPath + '/' + nameDotMethod + '.desc.xml'),
	    {
		format: this.format,
		shortName: this.shortName,
		desc: this.wsDesc,
		url: this.url,
		auth: this.auth,
	    }
	);

	// copy the controller
	this.fs.copy(
	    this.templatePath('webscript.get.js'),
	    this.destinationPath(webscriptPath + '/' + nameDotMethod + '.js')
	);

	// copy the template
	this.fs.copy(
	    this.templatePath('webscript.get.' + this.format + '.ftl'),
	    this.destinationPath(webscriptPath + '/' + nameDotMethod + '.' + this.format + '.ftl')
	);

    }
});
