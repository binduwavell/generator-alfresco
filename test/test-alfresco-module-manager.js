'use strict';

var assert = require('assert');
var chalk = require('chalk');
var inspect = require('eyes').inspector({maxLength: false});

describe('generator-alfresco:alfresco-module-registry', function () {

  var yomock = {
    config: {
      "get": function(key) { return undefined; },
      "set": function(key, value) { }
    },
    moduleRegistry: {

    },
    projectGroupId: 'org.alfresco',
    projectVersion: '1.0.0-SNAPSHOT'
  };

  // TODO: write test for the module manager

});

// vim: autoindent expandtab tabstop=2 shiftwidth=2 softtabstop=2
