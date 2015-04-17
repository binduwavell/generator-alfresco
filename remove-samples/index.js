'use strict';
var yeoman = require('yeoman-generator');

var cruft = [
    'share-amp/src/main/amp/config/alfresco/web-extension/site-data/extensions/example-widgets.xml',
    'share-amp/src/main/amp/config/alfresco/web-extension/site-webscripts/com',
    'repo-amp/src/main/amp/config/alfresco/extension/templates/webscripts/webscript.*',
];

module.exports = yeoman.generators.Base.extend({
    initializing: function () {
	this.log('You called the Alfresco:remove-samples subgenerator');
    },

    writing: function () {
	for (var i in cruft) {
	    var deleteme = cruft[i];
	    this.log("deleting " + deleteme);
	    this.fs.delete(this.destinationPath(deleteme));
	}
    }
});
